import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, ShoppingCart, Package, Tag, Users, BarChart2, 
  Settings, LogOut, Menu, X, Minimize, Maximize, Square,
} from 'lucide-react';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Manejadores para controles de ventana
  const handleMinimize = () => {
    window.electron.window.minimize();
  };
  
  const handleMaximize = async () => {
    const maximized = await window.electron.window.maximize();
    setIsMaximized(maximized);
  };
  
  const handleClose = () => {
    window.electron.window.close();
  };
  
  // Manejador para cerrar sesión
  const handleLogout = async () => {
    await window.electron.auth.logout();
    navigate('/login');
  };
  
  // Elementos de la barra lateral
  const sidebarItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Punto de Venta', path: '/pos', icon: <ShoppingCart size={20} /> },
    { name: 'Productos', path: '/products', icon: <Package size={20} /> },
    { name: 'Categorías', path: '/categories', icon: <Tag size={20} /> },
    { name: 'Clientes', path: '/customers', icon: <Users size={20} /> },
    { name: 'Reportes', path: '/reports', icon: <BarChart2 size={20} /> },
    { name: 'Configuración', path: '/settings', icon: <Settings size={20} /> },
  ];
  
  return (
    <div className="h-screen flex flex-col">
      {/* Barra de título personalizada */}
      <header className="drag-region flex justify-between items-center bg-gray-800 text-white h-12 px-4">
        <div className="flex items-center space-x-2">
          <button 
            className="no-drag p-1 rounded-md hover:bg-gray-700 focus:outline-none"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <img src="/logo192.png" alt="WilPOS" className="h-6 w-6" />
          <span className="font-semibold">WilPOS</span>
          <span className="text-sm text-gray-400 ml-2">
            {sidebarItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
          </span>
        </div>
        
        <div className="flex items-center no-drag">
          <button 
            className="p-1 hover:bg-gray-700 focus:outline-none"
            onClick={handleMinimize}
          >
            <Minimize size={16} />
          </button>
          <button 
            className="p-1 hover:bg-gray-700 focus:outline-none"
            onClick={handleMaximize}
          >
            {isMaximized ? <Square size={16} /> : <Maximize size={16} />}
          </button>
          <button 
            className="p-1 hover:bg-red-600 focus:outline-none"
            onClick={handleClose}
          >
            <X size={16} />
          </button>
        </div>
      </header>
      
      {/* Contenido principal con sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`bg-gray-800 text-white ${isSidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 ease-in-out overflow-y-auto`}>
          <nav className="p-2 flex flex-col h-full">
            {/* Elementos del menú */}
            <div className="flex-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.path}
                  className={`sidebar-item w-full text-left mb-1 ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  {item.icon}
                  {isSidebarOpen && <span>{item.name}</span>}
                </button>
              ))}
            </div>
            
            {/* Botón de cerrar sesión */}
            <button
              className="sidebar-item w-full text-left border-t border-gray-700 mt-2 pt-2 text-red-400 hover:text-white hover:bg-red-600"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              {isSidebarOpen && <span>Cerrar sesión</span>}
            </button>
          </nav>
        </aside>
        
        {/* Área de contenido */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;