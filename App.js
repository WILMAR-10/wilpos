import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// Páginas
import Activation from './pages/Activation';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Componentes comunes
import Layout from './components/Layout';
import Loading from './components/Loading';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [appState, setAppState] = useState({
    isActivated: false,
    user: null
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  // Cargar estado inicial de la aplicación
  useEffect(() => {
    const loadAppState = async () => {
      try {
        const state = await window.electron.app.getState();
        setAppState(state);
        
        // Redireccionar según el estado
        if (!state.isActivated) {
          // Si no está activado, ir a activación
          if (location.pathname !== '/activate') {
            navigate('/activate');
          }
        } else if (!state.user) {
          // Si está activado pero no hay usuario, ir a login
          if (location.pathname !== '/login') {
            navigate('/login');
          }
        } else {
          // Si está activado y hay usuario, ir al dashboard si está en página de auth
          if (location.pathname === '/login' || location.pathname === '/activate') {
            navigate('/dashboard');
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error al cargar el estado:', error);
        setIsLoading(false);
      }
    };
    
    loadAppState();
  }, []);

  // Si está cargando, mostrar pantalla de carga
  if (isLoading) {
    return <Loading />;
  }

  return (
    <Routes>
      {/* Rutas de autenticación */}
      <Route path="/activate" element={
        !appState.isActivated ? <Activation /> : <Navigate to="/login" />
      } />
      
      <Route path="/login" element={
        appState.isActivated && !appState.user ? <Login /> : 
        (appState.user ? <Navigate to="/dashboard" /> : <Navigate to="/activate" />)
      } />
      
      {/* Rutas protegidas */}
      <Route path="/" element={
        appState.isActivated && appState.user ? <Layout /> : <Navigate to="/login" />
      }>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pos" element={<POS />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="customers" element={<Customers />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;