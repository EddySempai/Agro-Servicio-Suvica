import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Layout from './components/Layout';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardUser from './pages/DashboardUser';
import OperadoresList from './pages/OperadoresList';
import UnidadesList from './pages/UnidadesList';
import OperacionesList from './pages/OperacionesList';
import UsuariosList from './pages/UsuariosList';
import ClientesList from './pages/ClientesList';
import CostosList from './pages/CostosList';
import Profile from './pages/Profile';

// Configurar interceptor de Axios para incluir el Token JWT en cada petición
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        <Route element={<Layout />}>
          {/* Rutas compartidas */}
          <Route path="/perfil" element={<Profile />} />

          {/* Rutas de Administrador */}
          <Route path="/admin" element={<DashboardAdmin />} />
          <Route path="/admin/operadores" element={<OperadoresList />} />
          <Route path="/admin/unidades" element={<UnidadesList />} />
          <Route path="/admin/operaciones" element={<OperacionesList />} />
          <Route path="/admin/clientes" element={<ClientesList />} />
          <Route path="/admin/costos" element={<CostosList />} />
          <Route path="/admin/usuarios" element={<UsuariosList />} />
          
          {/* Rutas de Usuario (Operador) */}
          <Route path="/user" element={<DashboardUser />} />
          <Route path="/user/operaciones" element={<OperacionesList />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
