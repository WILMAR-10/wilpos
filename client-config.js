// Configuración del modo cliente/cajero

const axios = require('axios');
const Store = require('electron-store');
const store = new Store();

// Clase para gestionar el cliente de WilPOS
class ClientManager {
  constructor() {
    this.serverIP = store.get('serverIP', 'localhost');
    this.serverPort = store.get('serverPort', 3000);
    this.apiUrl = `http://${this.serverIP}:${this.serverPort}/api`;
    this.isConnected = false;
    this.authToken = store.get('authToken', null);
    this.user = null;
  }
  
  // Conectar al servidor
  async connectToServer(serverDetails) {
    try {
      const { ip, port } = serverDetails;
      this.serverIP = ip || this.serverIP;
      this.serverPort = port || this.serverPort;
      this.apiUrl = `http://${this.serverIP}:${this.serverPort}/api`;
      
      // Probar conexión
      const response = await axios.get(`${this.apiUrl}/status`, { timeout: 5000 });
      
      if (response.data && response.data.status === 'online') {
        this.isConnected = true;
        
        // Guardar configuración
        store.set('serverIP', this.serverIP);
        store.set('serverPort', this.serverPort);
        
        return { 
          success: true, 
          serverVersion: response.data.version 
        };
      } else {
        return { 
          success: false, 
          error: 'No se pudo conectar al servidor' 
        };
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      return { 
        success: false, 
        error: error.message || 'Error de conexión'
      };
    }
  }
  
  // Verificar estado de conexión
  async checkConnection() {
    try {
      const response = await axios.get(`${this.apiUrl}/status`, { timeout: 3000 });
      this.isConnected = response.data && response.data.status === 'online';
      return this.isConnected;
    } catch (error) {
      this.isConnected = false;
      return false;
    }
  }
  
  // Iniciar sesión
  async login(username, password) {
    try {
      if (!this.isConnected && !(await this.checkConnection())) {
        return { 
          success: false, 
          error: 'No hay conexión con el servidor'
        };
      }
      
      const response = await axios.post(`${this.apiUrl}/auth/login`, {
        username,
        password
      });
      
      if (response.data && response.data.success) {
        this.user = response.data.user;
        // En una implementación real, aquí manejaríamos un token JWT
        this.authToken = `user_${this.user.id}_${Date.now()}`;
        store.set('authToken', this.authToken);
        
        return { 
          success: true, 
          user: this.user 
        };
      } else {
        return { 
          success: false, 
          error: response.data.error || 'Error al iniciar sesión' 
        };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error de conexión'
      };
    }
  }
  
  // Cerrar sesión
  logout() {
    this.user = null;
    this.authToken = null;
    store.delete('authToken');
    return { success: true };
  }
  
  // Verificar estado de autenticación
  isAuthenticated() {
    return !!this.authToken && !!this.user;
  }
  
  // Configurar headers de autenticación
  getAuthHeaders() {
    return {
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      }
    };
  }
  
  // Obtener productos
  async getProducts() {
    try {
      if (!this.isConnected && !(await this.checkConnection())) {
        return { 
          success: false, 
          error: 'No hay conexión con el servidor'
        };
      }
      
      const response = await axios.get(
        `${this.apiUrl}/products`, 
        this.getAuthHeaders()
      );
      
      return response.data;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error de conexión'
      };
    }
  }
  
  // Obtener categorías
  async getCategories() {
    try {
      if (!this.isConnected && !(await this.checkConnection())) {
        return { 
          success: false, 
          error: 'No hay conexión con el servidor'
        };
      }
      
      const response = await axios.get(
        `${this.apiUrl}/categories`, 
        this.getAuthHeaders()
      );
      
      return response.data;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error de conexión'
      };
    }
  }
  
  // Obtener clientes
  async getCustomers() {
    try {
      if (!this.isConnected && !(await this.checkConnection())) {
        return { 
          success: false, 
          error: 'No hay conexión con el servidor'
        };
      }
      
      const response = await axios.get(
        `${this.apiUrl}/customers`, 
        this.getAuthHeaders()
      );
      
      return response.data;
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error de conexión'
      };
    }
  }
  
  // Crear venta
  async createSale(saleData) {
    try {
      if (!this.isConnected && !(await this.checkConnection())) {
        return { 
          success: false, 
          error: 'No hay conexión con el servidor'
        };
      }
      
      const response = await axios.post(
        `${this.apiUrl}/sales`, 
        saleData,
        this.getAuthHeaders()
      );
      
      return response.data;
    } catch (error) {
      console.error('Error al crear venta:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error de conexión'
      };
    }
  }
  
  // Obtener configuraciones
  async getSettings() {
    try {
      if (!this.isConnected && !(await this.checkConnection())) {
        return { 
          success: false, 
          error: 'No hay conexión con el servidor'
        };
      }
      
      const response = await axios.get(
        `${this.apiUrl}/settings`, 
        this.getAuthHeaders()
      );
      
      return response.data;
    } catch (error) {
      console.error('Error al obtener configuraciones:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error de conexión'
      };
    }
  }
  
  // Verificar permisos de usuario
  hasPermission(permission) {
    if (!this.user) return false;
    
    // Si es admin, tiene todos los permisos
    if (this.user.role === 'admin') return true;
    
    // Verificar permisos específicos
    if (this.user.permissions === 'all') return true;
    
    // Si los permisos están almacenados como string JSON
    try {
      const permissions = typeof this.user.permissions === 'string' 
        ? JSON.parse(this.user.permissions) 
        : this.user.permissions;
        
      return Array.isArray(permissions) && permissions.includes(permission);
    } catch (error) {
      console.error('Error al verificar permisos:', error);
      return false;
    }
  }
}

module.exports = ClientManager;