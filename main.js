const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const store = new Store();
const ServerManager = require('./server-config');
const ClientManager = require('./client-config');
const LicenseManager = require('./license-manager');

// Instancias de los managers
let serverManager = null;
let clientManager = null;
let licenseManager = null;

// Verifica si la aplicación está en modo desarrollo
const isDev = process.argv.includes('--dev');

let mainWindow;
let serverMode = store.get('serverMode', false);
let licenseActive = store.get('licenseActive', false);

function createWindow() {
  // Crear la ventana principal del navegador
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/images/icon.png'),
    show: false,
    frame: false, // Sin bordes para una UI más moderna
    titleBarStyle: 'hidden'
  });

  // Cargar la página de inicio de la aplicación
  mainWindow.loadFile('index.html');

  // Mostrar la ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Si estamos en modo desarrollo, abrir DevTools
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
    
    // Verificar licencia y modo de servidor al inicio
    checkLicenseAndMode();
  });

  // Manejar el cierre de la ventana
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Iniciar la aplicación cuando esté lista
app.whenReady().then(() => {
  // Inicializar manejadores
  licenseManager = new LicenseManager();
  
  // Registrar todos los manejadores IPC
  registerIpcHandlers();
  
  createWindow();
});

// Salir cuando todas las ventanas estén cerradas
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Detener servidor si está activo
    if (serverManager && serverManager.isRunning) {
      serverManager.stop();
    }
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Verificar licencia y modo de servidor
function checkLicenseAndMode() {
  const licenseInfo = licenseManager.getLicenseInfo();
  licenseActive = licenseInfo.activated;
  
  if (serverMode) {
    // Si está en modo servidor, inicializar el servidor
    if (licenseActive) {
      if (!serverManager) {
        serverManager = new ServerManager();
      }
      // Iniciar el servidor automáticamente
      serverManager.start();
      mainWindow.webContents.send('app-ready', { 
        serverMode, 
        licenseActive, 
        licenseInfo 
      });
    } else {
      // Si no tiene licencia activa, mostrar pantalla de activación
      mainWindow.webContents.send('show-license-activation');
    }
  } else {
    // Iniciar en modo cliente
    if (!clientManager) {
      clientManager = new ClientManager();
    }
    mainWindow.webContents.send('app-ready', { 
      serverMode, 
      licenseActive: false 
    });
  }
}

// Registrar todos los manejadores IPC
function registerIpcHandlers() {
  // Handlers básicos de la aplicación
  ipcMain.handle('app-minimize', () => {
    if (mainWindow) mainWindow.minimize();
    return true;
  });
  
  ipcMain.handle('app-maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
        return false;
      } else {
        mainWindow.maximize();
        return true;
      }
    }
    return false;
  });
  
  ipcMain.handle('app-close', () => {
    if (mainWindow) mainWindow.close();
    return true;
  });
  
  // Cambio entre modos cliente/servidor
  ipcMain.handle('toggle-server-mode', async (event, value) => {
    serverMode = value;
    store.set('serverMode', serverMode);
    
    // Si cambia a modo servidor y tiene licencia activa
    if (serverMode && licenseActive) {
      if (!serverManager) {
        serverManager = new ServerManager();
      }
      await serverManager.start();
    } else if (!serverMode) {
      // Si cambia a modo cliente, detener el servidor
      if (serverManager && serverManager.isRunning) {
        await serverManager.stop();
      }
      
      // Inicializar cliente si es necesario
      if (!clientManager) {
        clientManager = new ClientManager();
      }
    }
    
    return { success: true, serverMode };
  });
  
  // Licencias
  ipcMain.handle('activate-license', async (event, licenseKey) => {
    const result = await licenseManager.activateLicense(licenseKey);
    
    if (result.success) {
      licenseActive = true;
      
      // Si está en modo servidor, iniciar el servidor
      if (serverMode) {
        if (!serverManager) {
          serverManager = new ServerManager();
        }
        await serverManager.start();
      }
    }
    
    return result;
  });
  
  ipcMain.handle('get-license-info', () => {
    return licenseManager.getLicenseInfo();
  });
  
  ipcMain.handle('deactivate-license', () => {
    const result = licenseManager.deactivateLicense();
    if (result.success) {
      licenseActive = false;
      
      // Si está en modo servidor, detener el servidor
      if (serverMode && serverManager && serverManager.isRunning) {
        serverManager.stop();
      }
    }
    return result;
  });
  
  // Base de datos
  ipcMain.handle('initialize-database', async () => {
    if (serverMode && serverManager) {
      return await serverManager.initDatabase();
    }
    return { success: false, error: 'No se puede inicializar la base de datos en modo cliente' };
  });
  
  // Gestión de servidor
  ipcMain.handle('start-server', async () => {
    if (serverMode && serverManager) {
      return await serverManager.start();
    }
    return { success: false, error: 'No se puede iniciar el servidor en modo cliente' };
  });
  
  ipcMain.handle('stop-server', async () => {
    if (serverMode && serverManager) {
      return await serverManager.stop();
    }
    return { success: false, error: 'No se puede detener el servidor en modo cliente' };
  });
  
  ipcMain.handle('get-server-status', () => {
    if (serverManager) {
      return serverManager.getStatus();
    }
    return { running: false };
  });
  
  // Gestión de cliente
  ipcMain.handle('connect-to-server', async (event, serverDetails) => {
    if (!serverMode && clientManager) {
      return await clientManager.connectToServer(serverDetails);
    }
    return { success: false, error: 'No se puede conectar en modo servidor' };
  });
  
  ipcMain.handle('get-connection-status', () => {
    if (clientManager) {
      return { connected: clientManager.isConnected };
    }
    return { connected: false };
  });
  
  // Handlers específicos para modos cliente/servidor
  registerClientHandlers();
  registerServerHandlers();
}

// Registrar handlers específicos para modo cliente
function registerClientHandlers() {
  // Autenticación
  ipcMain.handle('client-login', async (event, credentials) => {
    if (clientManager) {
      return await clientManager.login(credentials.username, credentials.password);
    }
    return { success: false, error: 'Cliente no inicializado' };
  });
  
  ipcMain.handle('client-logout', () => {
    if (clientManager) {
      return clientManager.logout();
    }
    return { success: false };
  });
  
  // Productos
  ipcMain.handle('get-products', async () => {
    if (clientManager) {
      return await clientManager.getProducts();
    }
    return { success: false, data: [] };
  });
  
  // Categorías
  ipcMain.handle('get-categories', async () => {
    if (clientManager) {
      return await clientManager.getCategories();
    }
    return { success: false, data: [] };
  });
  
  // Clientes
  ipcMain.handle('get-customers', async () => {
    if (clientManager) {
      return await clientManager.getCustomers();
    }
    return { success: false, data: [] };
  });
  
  // Ventas
  ipcMain.handle('create-sale', async (event, saleData) => {
    if (clientManager) {
      return await clientManager.createSale(saleData);
    }
    return { success: false };
  });
  
  // Configuraciones
  ipcMain.handle('get-settings', async () => {
    if (clientManager) {
      return await clientManager.getSettings();
    }
    return { success: false, data: {} };
  });
}

// Registrar handlers específicos para modo servidor
function registerServerHandlers() {
  // Estos handlers son para operaciones directas en la base de datos en modo servidor
  
  // Productos
  ipcMain.handle('add-product', async (event, product) => {
    if (serverMode && serverManager && serverManager.db) {
      try {
        const stmt = serverManager.db.prepare(`
          INSERT INTO products (
            barcode, name, description, category_id,
            price, cost, stock, stock_min, tax_rate, image
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(
          product.barcode || null,
          product.name,
          product.description || null,
          product.category_id || null,
          product.price,
          product.cost || null,
          product.stock || 0,
          product.stock_min || 5,
          product.tax_rate || 0,
          product.image || null
        );
        
        return { success: true, id: result.lastInsertRowid };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
    return { success: false, error: 'Base de datos no disponible' };
  });
  
  ipcMain.handle('update-product', async (event, id, product) => {
    if (serverMode && serverManager && serverManager.db) {
      try {
        const stmt = serverManager.db.prepare(`
          UPDATE products SET
            barcode = ?, name = ?, description = ?, category_id = ?,
            price = ?, cost = ?, stock = ?, stock_min = ?, tax_rate = ?,
            image = ?, active = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `);
        
        stmt.run(
          product.barcode || null,
          product.name,
          product.description || null,
          product.category_id || null,
          product.price,
          product.cost || null,
          product.stock || 0,
          product.stock_min || 5,
          product.tax_rate || 0,
          product.image || null,
          product.active === false ? 0 : 1,
          id
        );
        
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
    return { success: false, error: 'Base de datos no disponible' };
  });
  
  ipcMain.handle('delete-product', async (event, id) => {
    if (serverMode && serverManager && serverManager.db) {
      try {
        // Soft delete - solo marcar como inactivo
        const stmt = serverManager.db.prepare(
          'UPDATE products SET active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        );
        stmt.run(id);
        
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
    return { success: false, error: 'Base de datos no disponible' };
  });
  
  // Categorías
  ipcMain.handle('add-category', async (event, category) => {
    if (serverMode && serverManager && serverManager.db) {
      try {
        const stmt = serverManager.db.prepare(
          'INSERT INTO categories (name, description, image) VALUES (?, ?, ?)'
        );
        
        const result = stmt.run(
          category.name,
          category.description || null,
          category.image || null
        );
        
        return { success: true, id: result.lastInsertRowid };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
    return { success: false, error: 'Base de datos no disponible' };
  });
  
  ipcMain.handle('update-category', async (event, id, category) => {
    if (serverMode && serverManager && serverManager.db) {
      try {
        const stmt = serverManager.db.prepare(`
          UPDATE categories SET
            name = ?, description = ?, image = ?,
            active = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `);
        
        stmt.run(
          category.name,
          category.description || null,
          category.image || null,
          category.active === false ? 0 : 1,
          id
        );
        
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
    return { success: false, error: 'Base de datos no disponible' };
  });
  
  ipcMain.handle('delete-category', async (event, id) => {
    if (serverMode && serverManager && serverManager.db) {
      try {
        // Verificar si hay productos asociados
        const products = serverManager.db.prepare(
          'SELECT COUNT(*) as count FROM products WHERE category_id = ? AND active = 1'
        ).get(id);
        
        if (products.count > 0) {
          return { 
            success: false, 
            error: `No se puede eliminar la categoría porque tiene ${products.count} productos asociados` 
          };
        }
        
        // Soft delete
        const stmt = serverManager.db.prepare(
          'UPDATE categories SET active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        );
        stmt.run(id);
        
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
    return { success: false, error: 'Base de datos no disponible' };
  });
  
  // Clientes
  ipcMain.handle('add-customer', async (event, customer) => {
    if (serverMode && serverManager && serverManager.db) {
      try {
        const stmt = serverManager.db.prepare(
          'INSERT INTO customers (name, email, phone, address, tax_id, notes) VALUES (?, ?, ?, ?, ?, ?)'
        );
        
        const result = stmt.run(
          customer.name,
          customer.email || null,
          customer.phone || null,
          customer.address || null,
          customer.tax_id || null,
          customer.notes || null
        );
        
        return { success: true, id: result.lastInsertRowid };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
    return { success: false, error: 'Base de datos no disponible' };
  });
  
  ipcMain.handle('update-customer', async (event, id, customer) => {
    if (serverMode && serverManager && serverManager.db) {
      try {
        const stmt = serverManager.db.prepare(`
          UPDATE customers SET
            name = ?, email = ?, phone = ?, address = ?,
            tax_id = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `);
        
        stmt.run(
          customer.name,
          customer.email || null,
          customer.phone || null,
          customer.address || null,
          customer.tax_id || null,
          customer.notes || null,
          id
        );
        
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
    return { success: false, error: 'Base de datos no disponible' };
  });
  
  ipcMain.handle('delete-customer', async (event, id) => {
    if (serverMode && serverManager && serverManager.db) {
      try {
        // Verificar si hay ventas asociadas
        const sales = serverManager.db.prepare(
          'SELECT COUNT(*) as count FROM sales WHERE customer_id = ?'
        ).get(id);
        
        if (sales.count > 0) {
          return { 
            success: false, 
            error: `No se puede eliminar el cliente porque tiene ${sales.count} ventas asociadas` 
          };
        }
        
        const stmt = serverManager.db.prepare('DELETE FROM customers WHERE id = ?');
        stmt.run(id);
        
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
    return { success: false, error: 'Base de datos no disponible' };
  });
}