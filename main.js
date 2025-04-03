const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const Store = require('electron-store');

// Initialize persistent storage
const store = new Store();

// Window references
let mainWindow = null;
let authWindow = null;

// Global app state
const appState = {
  isActivated: store.get('app.isActivated', false),
  user: store.get('app.user', null),
  isDev: process.argv.includes('--dev')
};

function createMainWindow() {
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
    // Corregir ruta al ícono - usar path.join para resolver correctamente la ruta
    icon: path.join(__dirname, 'assets', 'images', 'logo.png'),
    show: false,
    frame: false,
    titleBarStyle: 'hidden'
  });

  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, 'index.html')}`;
  
  mainWindow.loadURL(startUrl);

  if (appState.isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.once('ready-to-show', () => {
    if (appState.isActivated && appState.user) {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

function createAuthWindow() {
  authWindow = new BrowserWindow({
    width: 450,
    height: 650,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'images', 'logo.png'),
    show: false,
    frame: false,
    titleBarStyle: 'hidden'
  });

  const authUrl = isDev
    ? 'http://localhost:3000/auth'
    : `file://${path.join(__dirname, 'index.html')}#/auth`;
  
  authWindow.loadURL(authUrl);

  authWindow.once('ready-to-show', () => {
    authWindow.show();
  });

  authWindow.on('closed', () => {
    authWindow = null;
    if (!mainWindow?.isVisible()) {
      app.quit();
    }
  });

  return authWindow;
}

// App lifecycle handlers
app.whenReady().then(() => {
  createMainWindow();
  
  if (!appState.isActivated || !appState.user) {
    createAuthWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// IPC Handlers
function registerIpcHandlers() {
  // License activation
  ipcMain.handle('license:activate', async (_, licenseKey) => {
    if (validateLicenseKey(licenseKey)) {
      appState.isActivated = true;
      store.set('app.isActivated', true);
      return { success: true };
    }
    return { success: false, error: 'Invalid license key' };
  });

  // Authentication
  ipcMain.handle('auth:login', async (_, credentials) => {
    const user = await validateCredentials(credentials);
    if (user) {
      appState.user = user;
      store.set('app.user', user);
      
      authWindow?.close();
      mainWindow?.show();
      
      return { success: true, user };
    }
    return { success: false, error: 'Invalid credentials' };
  });

  // Logout
  ipcMain.handle('auth:logout', () => {
    appState.user = null;
    store.delete('app.user');
    
    mainWindow?.hide();
    createAuthWindow();
    
    return { success: true };
  });

  // Window controls
  ipcMain.handle('window:minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize();
    return true;
  });

  ipcMain.handle('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win?.isMaximized()) {
      win.unmaximize();
      return false;
    } else {
      win?.maximize();
      return true;
    }
  });

  ipcMain.handle('window:close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close();
    return true;
  });

  // App state
  ipcMain.handle('app:getState', () => ({
    isActivated: appState.isActivated,
    user: appState.user
  }));
}

// Helper functions
function validateLicenseKey(key) {
  // Implement real license validation logic
  return key === 'DEMO-1234-5678-9ABC';
}

async function validateCredentials(credentials) {
  // Implement real authentication logic
  if (credentials.username === 'admin' && credentials.password === 'admin') {
    return {
      id: 1,
      username: 'admin',
      name: 'Administrator',
      role: 'admin'
    };
  }
  return null;
}

// Initialize handlers
registerIpcHandlers();