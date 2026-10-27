import { useState, useEffect } from 'react';
import { Outlet, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { LogOut, User, Menu, Sun, Moon } from 'lucide-react';
import './Layout.css';
import logoImg from '../assets/logo.jpg';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    const handleCloseSidebar = () => {
      setIsSidebarOpen(false);
    };
    window.addEventListener('close-sidebar', handleCloseSidebar);

    return () => {
      window.removeEventListener('close-sidebar', handleCloseSidebar);
    };
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }
  
  const user = JSON.parse(userStr);

  // Protección de rutas basadas en roles (Frontend)
  if (location.pathname.startsWith('/admin') && user.role !== 'A') {
    return <Navigate to="/user" replace />;
  }

  if (location.pathname.startsWith('/user') && user.role === 'A') {
    // Optional: redirect admin to /admin if they try to go to /user
    // return <Navigate to="/admin" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className={`sidebar glass-panel no-print ${!isSidebarOpen ? 'closed' : ''}`}>
        <div className="sidebar-header" style={{ padding: '24px 16px' }}>
          <img src={logoImg} alt="Agro-Servicios Logo" style={{ width: '45px', borderRadius: '8px' }} />
          <h2 style={{ fontSize: '18px' }}>AGRO-SERVICIOS</h2>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-group">
            <p className="nav-label">Módulos</p>
            <ul>
              <li><Link to={user.role === 'A' ? "/admin" : "/user"} className={isActive(user.role === 'A' ? "/admin" : "/user")}>Inicio</Link></li>
              {user.role === 'A' && <li><Link to="/admin/operadores" className={isActive('/admin/operadores')}>Operadores</Link></li>}
              {user.role === 'A' && <li><Link to="/admin/unidades" className={isActive('/admin/unidades')}>Unidades</Link></li>}
              {user.role === 'A' && <li><Link to="/admin/clientes" className={isActive('/admin/clientes')}>Clientes</Link></li>}
              <li><Link to={user.role === 'A' ? "/admin/operaciones" : "/user/operaciones"} className={isActive(user.role === 'A' ? "/admin/operaciones" : "/user/operaciones")}>Operaciones</Link></li>
              {user.role === 'A' && <li><Link to="/admin/costos" className={isActive('/admin/costos')}>Mantenimiento (Costos)</Link></li>}
            </ul>
          </div>
          
          {user.role === 'A' && (
            <div className="nav-group">
              <p className="nav-label">Administración</p>
              <ul>
                <li><Link to="/admin/usuarios" className={isActive('/admin/usuarios')}>Cuentas de Usuario</Link></li>
              </ul>
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar glass-panel no-print">
          <div className="topbar-left">
            <button className="btn-icon" onClick={toggleSidebar}><Menu size={20} /></button>
            <h2 className="page-title">
              {user.role === 'A' ? 'Panel de Administrador' : 'Panel de Usuario'}
            </h2>
          </div>
          <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="btn-icon" onClick={toggleTheme} aria-label="Toggle theme">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link to="/perfil" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <User size={20} />
              <span>{user.username}</span>
            </Link>
          </div>
        </header>

        <div className="content-area">
          <Outlet context={{ user, isSidebarOpen, closeSidebar: () => setIsSidebarOpen(false), toggleSidebar }} />
        </div>
      </main>
    </div>
  );
}
