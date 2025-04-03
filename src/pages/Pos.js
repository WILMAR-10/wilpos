// Página del punto de venta

import React from 'react';
import { ShoppingCart, Search, Package, DollarSign, User, Trash2 } from 'lucide-react';

const POS = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <ShoppingCart size={24} /> Punto de Venta
      </h1>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Panel de carrito */}
        <div className="lg:w-1/3 card">
          <div className="p-4 border-b">
            <h2 className="font-medium text-gray-800">Carrito</h2>
          </div>
          
          <div className="p-4">
            {/* Selector de cliente */}
            <div className="flex mb-4 gap-2">
              <select className="form-input flex-1">
                <option value="0">Cliente ocasional</option>
                <option value="1">Juan Pérez</option>
                <option value="2">María López</option>
              </select>
              <button className="btn btn-outline p-2">
                <User size={20} />
              </button>
            </div>
            
            {/* Carrito vacío */}
            <div className="border rounded-md flex flex-col items-center justify-center py-12 px-4 mb-4">
              <ShoppingCart size={48} className="text-gray-300 mb-4" />
              <p className="text-gray-500 text-center">El carrito está vacío</p>
              <p className="text-gray-400 text-sm text-center mt-2">Añada productos escaneando o seleccionando desde la lista</p>
            </div>
            
            {/* Totales */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">$0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Impuesto (18%):</span>
                <span className="font-medium">$0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Descuento:</span>
                <div className="flex items-center gap-2">
                  <input type="number" className="w-20 form-input py-1 px-2 text-right" placeholder="0.00" />
                </div>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span>$0.00</span>
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="flex gap-2 mt-4">
              <button className="btn flex-1 flex items-center justify-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700">
                <Trash2 size={18} />
                <span>Limpiar</span>
              </button>
              <button className="btn btn-primary flex-1 flex items-center justify-center gap-1">
                <DollarSign size={18} />
                <span>Cobrar</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Panel de productos */}
        <div className="lg:w-2/3 flex flex-col gap-4">
          {/* Búsqueda y filtros */}
          <div className="card p-4">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  className="form-input w-full pl-10" 
                  placeholder="Buscar producto o escanear código" 
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
              <select className="form-input w-full md:w-48">
                <option value="all">Todas las categorías</option>
                <option value="1">Bebidas</option>
                <option value="2">Alimentos</option>
                <option value="3">Limpieza</option>
                <option value="4">Electrónica</option>
              </select>
            </div>
          </div>
          
          {/* Lista de productos */}
          <div className="card p-4 flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Mensaje de productos (placeholder) */}
              <div className="col-span-full text-center py-12">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">
                  En la Etapa 2 se implementará la gestión de productos
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Los productos escaneados o seleccionados aparecerán en el carrito
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pos;