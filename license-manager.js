// Gestor de licencias y activación

const crypto = require('crypto');
const axios = require('axios');
const { machineIdSync } = require('node-machine-id');
const Store = require('electron-store');
const os = require('os');

// Almacenamiento seguro para la información de licencia
const licenseStore = new Store({
  name: 'license',
  encryptionKey: 'wilpos-license-secret-key' // En producción, usar una clave más segura
});

// Clase para gestionar licencias de WilPOS
class LicenseManager {
  constructor() {
    this.licenseKey = licenseStore.get('licenseKey', null);
    this.activationDate = licenseStore.get('activationDate', null);
    this.expiryDate = licenseStore.get('expiryDate', null);
    this.hardwareId = this.getHardwareId();
    this.activated = licenseStore.get('activated', false);
    this.verificationEndpoint = 'https://api.wilpos.com/verify-license'; // URL ficticia
    this.offlineMode = false;
  }
  
  // Obtener ID único de hardware
  getHardwareId() {
    try {
      // Generar ID basado en hardware
      const machineId = machineIdSync();
      // Generar hash para ocultar el verdadero ID
      return crypto
        .createHash('sha256')
        .update(machineId)
        .digest('hex');
    } catch (error) {
      console.error('Error al obtener ID de hardware:', error);
      // Fallback a un ID basado en nombre de host y arquitectura
      const fallbackId = `${os.hostname()}-${os.arch()}-${os.platform()}`;
      return crypto
        .createHash('sha256')
        .update(fallbackId)
        .digest('hex');
    }
  }
  
  // Validar formato de clave de licencia
  isValidLicenseFormat(licenseKey) {
    // Formato de ejemplo: XXXX-XXXX-XXXX-XXXX (donde X es alfanumérico)
    const licenseRegex = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    return licenseRegex.test(licenseKey);
  }
  
  // Activar licencia (online)
  async activateLicense(licenseKey) {
    try {
      // Validar formato de licencia
      if (!this.isValidLicenseFormat(licenseKey)) {
        return {
          success: false,
          error: 'Formato de licencia inválido'
        };
      }
      
      // Si ya está activada, verificar si es la misma clave
      if (this.activated && this.licenseKey === licenseKey) {
        return {
          success: true,
          message: 'La licencia ya está activada',
          licenseInfo: this.getLicenseInfo()
        };
      }
      
      // Intentar activación online
      if (!this.offlineMode) {
        try {
          const response = await axios.post(this.verificationEndpoint, {
            licenseKey,
            hardwareId: this.hardwareId,
            timestamp: Date.now()
          }, {
            timeout: 10000 // 10 segundos timeout
          });
          
          if (response.data && response.data.success) {
            // Guardar información de licencia
            this.licenseKey = licenseKey;
            this.activationDate = new Date().toISOString();
            this.expiryDate = response.data.expiryDate;
            this.activated = true;
            
            // Almacenar en el store
            this.saveLicenseData();
            
            return {
              success: true,
              message: 'Licencia activada correctamente',
              licenseInfo: this.getLicenseInfo()
            };
          } else {
            return {
              success: false,
              error: response.data.error || 'Error de activación'
            };
          }
        } catch (error) {
          console.error('Error en activación online:', error);
          // Si falla la conexión, intentar activación offline
          return this.activateLicenseOffline(licenseKey);
        }
      } else {
        // Modo offline directo
        return this.activateLicenseOffline(licenseKey);
      }
    } catch (error) {
      console.error('Error al activar licencia:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido al activar licencia'
      };
    }
  }
  
  // Activación offline (alternativa cuando no hay conexión)
  activateLicenseOffline(licenseKey) {
    try {
      // En una implementación real, aquí verificaríamos la licencia
      // contra algún algoritmo local o clave de activación
      
      // NOTA: Esta es una implementación simplificada para desarrollo
      // En producción, se debe usar un método más seguro
      
      // Verificar licencia con reglas simples (para demostración)
      const isValid = this.validateOfflineLicense(licenseKey);
      
      if (isValid) {
        // Calcular fecha de expiración (1 año desde hoy)
        const today = new Date();
        const expiryDate = new Date(today);
        expiryDate.setFullYear(today.getFullYear() + 1);
        
        // Guardar información de licencia
        this.licenseKey = licenseKey;
        this.activationDate = today.toISOString();
        this.expiryDate = expiryDate.toISOString();
        this.activated = true;
        
        // Almacenar en el store
        this.saveLicenseData();
        
        return {
          success: true,
          message: 'Licencia activada correctamente (modo offline)',
          licenseInfo: this.getLicenseInfo()
        };
      } else {
        return {
          success: false,
          error: 'Clave de licencia inválida'
        };
      }
    } catch (error) {
      console.error('Error en activación offline:', error);
      return {
        success: false,
        error: error.message || 'Error en activación offline'
      };
    }
  }
  
  // Validación offline simple (para demostración)
  validateOfflineLicense(licenseKey) {
    // NOTA: Este es un método simplificado para desarrollo
    // En producción, se debe usar un algoritmo más seguro
    
    // Reglas básicas de validación
    // 1. La clave debe tener el formato correcto
    if (!this.isValidLicenseFormat(licenseKey)) {
      return false;
    }
    
    // 2. La clave debe comenzar con "WIL"
    if (!licenseKey.startsWith('WIL')) {
      // Hacemos una excepción para claves de desarrollo
      if (licenseKey === 'DEMO-1234-5678-9ABC') {
        return true;
      }
      return false;
    }
    
    // 3. Checksum simple: la suma de valores ASCII de los caracteres debe ser divisible por 7
    const checksum = licenseKey
      .replace(/-/g, '')
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
      
    return checksum % 7 === 0;
  }
  
  // Guardar datos de licencia en almacenamiento
  saveLicenseData() {
    licenseStore.set('licenseKey', this.licenseKey);
    licenseStore.set('activationDate', this.activationDate);
    licenseStore.set('expiryDate', this.expiryDate);
    licenseStore.set('activated', this.activated);
    licenseStore.set('hardwareId', this.hardwareId);
  }
  
  // Obtener información de licencia
  getLicenseInfo() {
    if (!this.activated) {
      return {
        activated: false,
        message: 'No hay licencia activa'
      };
    }
    
    // Verificar si ha expirado
    const expired = new Date(this.expiryDate) < new Date();
    
    return {
      activated: this.activated,
      licenseKey: this.maskLicenseKey(this.licenseKey),
      activationDate: this.activationDate,
      expiryDate: this.expiryDate,
      hardwareId: this.hardwareId,
      expired,
      daysRemaining: this.getDaysRemaining()
    };
  }
  
  // Ocultar parte de la clave de licencia para mostrar en la UI
  maskLicenseKey(licenseKey) {
    if (!licenseKey) return null;
    
    const parts = licenseKey.split('-');
    if (parts.length !== 4) return licenseKey;
    
    // Mostrar solo la primera y última parte
    return `${parts[0]}-XXXX-XXXX-${parts[3]}`;
  }
  
  // Calcular días restantes de licencia
  getDaysRemaining() {
    if (!this.expiryDate) return 0;
    
    const expiry = new Date(this.expiryDate);
    const today = new Date();
    
    // Si ya expiró, retornar 0
    if (expiry < today) {
      return 0;
    }
    
    // Calcular diferencia en días
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }
  
  // Verificar si la licencia está activa y válida
  isLicenseValid() {
    if (!this.activated || !this.licenseKey) {
      return false;
    }
    
    // Verificar si ha expirado
    if (new Date(this.expiryDate) < new Date()) {
      return false;
    }
    
    // Verificar si el hardware ha cambiado
    if (this.hardwareId !== this.getHardwareId()) {
      return false;
    }
    
    return true;
  }
  
  // Desactivar licencia
  deactivateLicense() {
    this.licenseKey = null;
    this.activationDate = null;
    this.expiryDate = null;
    this.activated = false;
    
    // Limpiar almacenamiento
    licenseStore.clear();
    
    return {
      success: true,
      message: 'Licencia desactivada correctamente'
    };
  }
}

module.exports = LicenseManager;