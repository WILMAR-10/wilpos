const { contextBridge, ipcRenderer } = require('electron');

// Exponer API segura al renderizador
contextBridge.exposeInMainWorld('api', {
  // Control de ventana
  minimizeWindow: () => ipcRenderer.invoke('app-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('app-maximize'),
  closeWindow: () => ipcRenderer.invoke('app-close'),
  
  // Configuración del modo servidor
  toggleServerMode: (value) => ipcRenderer.invoke('toggle-server-mode', value),
  getServerStatus: () => ipcRenderer.invoke('get-server-status'),
  startServer: () => ipcRenderer.invoke('start-server'),
  stopServer: () => ipcRenderer.invoke('stop-server'),
  
  // Gestión de licencias
  activateLicense: (licenseKey) => ipcRenderer.invoke('activate-license', licenseKey),
  getLicenseInfo: () => ipcRenderer.invoke('get-license-info'),
  deactivateLicense: () => ipcRenderer.invoke('deactivate-license'),
  
  // Conexión cliente
  connectToServer: (serverDetails) => ipcRenderer.invoke('connect-to-server', serverDetails),
  getConnectionStatus: () => ipcRenderer.invoke('get-connection-status'),
  
  // Autenticación (cliente)
  login: (credentials) => ipcRenderer.invoke('client-login', credentials),
  logout: () => ipcRenderer.invoke('client-logout'),
  
  // Base de datos
  initializeDatabase: () => ipcRenderer.invoke('initialize-database'),
  
  // Productos
  getProducts: () => ipcRenderer.invoke('get-products'),
  addProduct: (product) => ipcRenderer.invoke('add-product', product),
  updateProduct: (id, product) => ipcRenderer.invoke('update-product', id, product),
  deleteProduct: (id) => ipcRenderer.invoke('delete-product', id),
  
  // Categorías
  getCategories: () => ipcRenderer.invoke('get-categories'),
  addCategory: (category) => ipcRenderer.invoke('add-category', category),
  updateCategory: (id, category) => ipcRenderer.invoke('update-category', id, category),
  deleteCategory: (id) => ipcRenderer.invoke('delete-category', id),
  
  // Clientes
  getCustomers: () => ipcRenderer.invoke('get-customers'),
  addCustomer: (customer) => ipcRenderer.invoke('add-customer', customer),
  updateCustomer: (id, customer) => ipcRenderer.invoke('update-customer', id, customer),
  deleteCustomer: (id) => ipcRenderer.invoke('delete-customer', id),
  
  // Ventas y transacciones
  createSale: (sale) => ipcRenderer.invoke('create-sale', sale),
  getSales: (filters) => ipcRenderer.invoke('get-sales', filters),
  
  // Configuraciones
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  
  // Abrir ventanas componentes (para UI modular)
  openComponentWindow: (component) => ipcRenderer.invoke('open-component-window', component),
  
  // Eventos desde el proceso principal
  onAppReady: (callback) => ipcRenderer.on('app-ready', (_, data) => callback(data)),
  onShowLicenseActivation: (callback) => ipcRenderer.on('show-license-activation', () => callback()),
  
  // Remover listeners (importante para evitar memory leaks)
  removeAllListeners: (channel) => {
    if (channel) {
      ipcRenderer.removeAllListeners(channel);
    } else {
      ipcRenderer.removeAllListeners('app-ready');
      ipcRenderer.removeAllListeners('show-license-activation');
    }
  }
});