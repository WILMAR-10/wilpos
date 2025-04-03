import React, { useState } from 'react';
import { X, Minimize } from 'lucide-react';

const Activation = () => {
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Manejadores para controles de ventana
  const handleMinimize = () => {
    // Simulated window.electron.window.minimize()
    console.log('Window minimized');
  };
  
  const handleClose = () => {
    // Simulated window.electron.window.close()
    console.log('Window closed');
  };
  
  // Formatear la clave de licencia mientras se escribe
  const handleKeyChange = (e) => {
    let value = e.target.value.replace(/[^A-Z0-9]/g, '').toUpperCase();
    let formatted = '';
    
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0 && formatted.length < 19) {
        formatted += '-';
      }
      if (formatted.length < 19) {
        formatted += value[i];
      }
    }
    
    setLicenseKey(formatted);
    setError('');
  };
  
  // Activar licencia
  const handleActivate = async (e) => {
    e.preventDefault();
    
    if (!licenseKey || licenseKey.length < 19) {
      setError('Por favor ingrese una clave de producto válida');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Simulación de activación
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (licenseKey === 'DEMO-1234-5678-9ABC') {
        setIsSuccess(true);
        setTimeout(() => {
          console.log('Redirecting to dashboard...');
        }, 1000);
      } else {
        setError('La clave de producto no es válida');
      }
    } catch (error) {
      setError('Error al activar: ' + (error.message || 'Intente nuevamente'));
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Frame para controles de ventana */}
      <div className="flex justify-end bg-blue-600 p-2 text-white">
        <button onClick={handleMinimize} className="mx-2 hover:bg-blue-700 p-1 rounded">
          <Minimize size={16} />
        </button>
        <button onClick={handleClose} className="hover:bg-red-500 p-1 rounded">
          <X size={16} />
        </button>
      </div>
      
      {/* Contenido principal */}
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <div className="text-center mb-6">
            <img 
              src="/api/placeholder/120/80" 
              alt="POS System Logo" 
              className="mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-800">Activación de Producto</h1>
            <p className="text-gray-600 mt-2">
              Ingrese su clave de licencia para activar el sistema
            </p>
          </div>
          
          {isSuccess ? (
            <div className="text-center">
              <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4">
                <p className="font-medium">¡Activación Exitosa!</p>
                <p className="text-sm mt-1">Su producto ha sido activado correctamente</p>
              </div>
              <p className="text-gray-600 text-sm mt-4">Redirigiendo al sistema...</p>
            </div>
          ) : (
            <form onSubmit={handleActivate}>
              <div className="mb-4">
                <label htmlFor="license-key" className="block text-gray-700 text-sm font-medium mb-2">
                  Clave de licencia
                </label>
                <input
                  type="text"
                  id="license-key"
                  value={licenseKey}
                  onChange={handleKeyChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  maxLength={19}
                />
                {error && (
                  <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 text-sm italic">
                  La clave de licencia se encuentra en el correo de confirmación de compra o en la caja del producto.
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="text-gray-600 hover:text-gray-800"
                  onClick={() => {
                    // Para modo demo, use DEMO-1234-5678-9ABC
                    setLicenseKey('DEMO-1234-5678-9ABC');
                    setError('');
                  }}
                >
                  Modo Demo
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Activando...
                    </span>
                  ) : (
                    'Activar Producto'
                  )}
                </button>
              </div>
            </form>
          )}
          
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm">
              ¿Necesita ayuda? <a href="#" className="text-blue-600 hover:text-blue-800">Contacte a soporte</a>
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-gray-800 text-gray-300 text-center py-2 text-xs">
        © 2025 POS System Technologies. Todos los derechos reservados.
      </div>
    </div>
  );
};

export default Activation;