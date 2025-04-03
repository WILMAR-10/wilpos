// Página de inicio de sesión
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, X, Minimize } from 'lucide-react';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Manejadores para controles de ventana
  const handleMinimize = () => {
    window.electron.window.minimize();
  };
  
  const handleClose = () => {
    window.electron.window.close();
  };
  
  // Actualizar credenciales
  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };
  
  // Iniciar sesión
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      setError('Por favor ingrese usuario y contraseña');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await window.electron.auth.login(credentials);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Usuario o contraseña incorrectos');
      }
    } catch (err) {
      console.error('Error durante el inicio de sesión:', err);
      setError('Error al iniciar sesión. Por favor intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-600 to-blue-900">
      {/* Barra de título personalizada */}
      <div className="drag-region flex justify-between items-center bg-gray-800 text-white p-2">
        <div className="flex items-center space-x-2">
          <img src="/logo192.png" alt="WilPOS" className="h-5 w-5" />
          <span className="font-medium text-sm">WilPOS - Iniciar Sesión</span>
        </div>
        <div className="flex no-drag">
          <button 
            className="p-1 hover:bg-gray-700 focus:outline-none"
            onClick={handleMinimize}
          >
            <Minimize size={16} />
          </button>
          <button 
            className="p-1 hover:bg-red-600 focus:outline-none"
            onClick={handleClose}
          >
            <X size={16} />
          </button>
        </div>
      </div>
      
      {/* Contenido principal */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
          <div className="p-8 flex flex-col items-center">
            <img src="/logo512.png" alt="WilPOS Logo" className="h-20 mb-6" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Bienvenido</h1>
            <p className="text-gray-600 mb-6 text-center">Inicie sesión para acceder al sistema</p>
            
            <form onSubmit={handleLogin} className="w-full">
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    id="username" 
                    name="username"
                    className="form-input pl-10"
                    placeholder="Nombre de usuario"
                    value={credentials.username}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input 
                    type="password" 
                    id="password" 
                    name="password"
                    className="form-input pl-10"
                    placeholder="Contraseña"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              {error && (
                <div className="mb-4 p-2 bg-red-100 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              
              <button 
                type="submit" 
                className="btn btn-primary w-full flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </form>
          </div>
          
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              WilPOS Versión 1.0.0<br />
              © 2025 WilSoftware. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;