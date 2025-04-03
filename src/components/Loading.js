import React from 'react';
import { Loader } from 'lucide-react';

const Loading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <Loader className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="mt-4 text-lg font-medium text-gray-700">Cargando...</p>
      </div>
    </div>
  );
};

export default Loading;