import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Sun, Moon } from 'lucide-react';
import './Login.css';
import logoImg from '../assets/logo.jpg';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();

  // Handle theme toggle
  useEffect(() => {
    // Check local storage or system preference on mount
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        usuario,
        clave
      });

      const { user, token } = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);

      if (user.role === 'A') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* Left Side: Image */}
      <div className="login-image-side"></div>

      {/* Right Side: Form */}
      <div className="login-form-side">
        <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle theme">
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="login-form-container">
          <div className="login-header-brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <img src={logoImg} alt="Agro-Servicios Logo" style={{ width: '150px', borderRadius: '12px' }} />
            <h2 style={{ fontSize: '24px', marginTop: '10px' }}>AGRO-SERVICIOS</h2>
          </div>
          <p className="login-subtitle">Sistema de Control Integral</p>

          <div className="login-form-box">
            <form onSubmit={handleSubmit}>
              {error && <div style={{ color: 'red', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}
              
              <div className="form-group">
                <div className="form-group-header">
                  <label htmlFor="usuario">Usuario</label>
                </div>
                <input
                  type="text"
                  id="usuario"
                  className="input-base"
                  placeholder="Ingrese su usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <div className="form-group-header">
                  <label htmlFor="clave">Contraseña</label>
                  <a href="#" className="forgot-link">¿Olvidó su contraseña?</a>
                </div>
                <input
                  type="password"
                  id="clave"
                  className="input-base"
                  placeholder="••••••••"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Iniciando...' : 'Iniciar Sesión'} <ArrowRight size={18} />
              </button>
            </form>

            <div className="login-footer" style={{ marginTop: '16px', textAlign: 'center' }}>
              <Link to="/forgot-password" style={{ display: 'block', marginBottom: '12px', fontSize: '14px' }}>¿Olvidó su contraseña?</Link>
              <div className="create-account-text">
                ¿No tienes cuenta? <Link to="/register" className="create-account-link">Crear cuenta</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
