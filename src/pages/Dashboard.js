import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, Package, Tag, Users, 
  BarChart2, DollarSign, TrendingUp, Clock
} from 'lucide-react';

const Dashboard = () => {
  // Datos de ejemplo para el dashboard
  const stats = {
    dailySales: '12,500.00',
    monthToDate: '85,230.45',
    productsCount: 124,
    categoriesCount: 15,
    customersCount: 38,
    pendingOrders: 3
  };
  
  // Elementos para acceso rápido
  const quickAccess = [
    { name: 'Punto de Venta', path: '/pos', icon: <ShoppingCart size={24} className="text-white" />, color: 'bg-blue-500' },
    { name: 'Productos', path: '/products', icon: <Package size={24} className="text-white" />, color: 'bg-green-500' },
    { name: 'Categorías', path: '/categories', icon: <Tag size={24} className="text-white" />, color: 'bg-purple-500' },
    { name: 'Clientes', path: '/customers', icon: <Users size={24} className="text-white" />, color: 'bg-orange-500' },
    { name: 'Reportes', path: '/reports', icon: <BarChart2 size={24} className="text-white" />, color: 'bg-red-500' }
  ];
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 flex items-start space-x-4">
          <div className="rounded-full p-3 bg-blue-100 text-blue-600">
            <DollarSign size={24} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Ventas Hoy</h3>
            <p className="text-2xl font-semibold">${stats.dailySales}</p>
          </div>
        </div>
        
        <div className="card p-6 flex items-start space-x-4">
          <div className="rounded-full p-3 bg-green-100 text-green-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Ventas del Mes</h3>
            <p className="text-2xl font-semibold">${stats.monthToDate}</p>
          </div>
        </div>
        
        <div className="card p-6 flex items-start space-x-4">
          <div className="rounded-full p-3 bg-purple-100 text-purple-600">
            <Package size={24} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Productos</h3>
            <p className="text-2xl font-semibold">{stats.productsCount}</p>
          </div>
        </div>
        
        <div className="card p-6 flex items-start space-x-4">
          <div className="rounded-full p-3 bg-orange-100 text-orange-600">
            <Clock size={24} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Órdenes Pendientes</h3>
            <p className="text-2xl font-semibold">{stats.pendingOrders}</p>
          </div>
        </div>
      </div>
      
      {/* Acceso rápido */}
      <div className="card p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Acceso Rápido</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickAccess.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className="flex flex-col items-center p-4 rounded-lg transition-all duration-200 hover:shadow-md"
            >
              <div className={`${item.color} p-3 rounded-full mb-3`}>
                {item.icon}
              </div>
              <span className="text-sm font-medium text-gray-700">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Información útil */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Últimas Transacciones</h2>
          <div className="text-center py-8 text-gray-500">
            <p>Se mostrarán aquí las transacciones recientes</p>
            <p className="text-sm text-gray-400 mt-2">Próximamente en la Etapa 2</p>
          </div>
        </div>
        
        <div className="card p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Productos Populares</h2>
          <div className="text-center py-8 text-gray-500">
            <p>Se mostrarán aquí los productos más vendidos</p>
            <p className="text-sm text-gray-400 mt-2">Próximamente en la Etapa 2</p>
          </div>
        </div>
      </div>
      
      {/* Pie de página */}
      <div className="text-center text-xs text-gray-500 mt-8">
        <p>WilPOS v1.0.0 - Construyendo un mejor sistema, paso a paso</p>
        <p>Esta es la Etapa 1: Estructura básica y autenticación</p>
      </div>
    </div>
  );
};

export default Dashboard;