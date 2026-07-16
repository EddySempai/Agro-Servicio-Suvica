import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import './Login.css'; // Reusing Login styles
import logoImg from '../assets/logo.jpg';

export default function Register() {
  const [formData, setFormData] = useState({
    usuario: '',
    clave: '',
    email: '',
    pregunta: '',
    respuesta: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
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
    setSuccess('');

    if (formData.clave.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('El formato del correo no es válido');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/api/auth/register', formData);
      setSuccess(response.data.message);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-image-side"></div>
      <div className="login-form-side">
        <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle theme">
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="login-form-container">
          <div className="login-header-brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <img src={logoImg} alt="Agro-Servicios Logo" style={{ width: '150px', borderRadius: '12px' }} />
            <h2 style={{ fontSize: '24px', marginTop: '10px' }}>Crear Cuenta</h2>
          </div>

          <div className="login-form-box">
            <form onSubmit={handleSubmit}>
              {error && <div style={{ color: 'red', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}
              {success && <div style={{ color: 'green', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>{success}</div>}
              
              <div className="form-group">
                <div className="form-group-header">
                  <label>Nombre de Usuario</label>
                </div>
                <input type="text" className="input-base" required value={formData.usuario} onChange={(e) => setFormData({...formData, usuario: e.target.value})} />
              </div>

              <div className="form-group">
                <div className="form-group-header">
                  <label>Contraseña</label>
                </div>
                <input type="password" className="input-base" required value={formData.clave} onChange={(e) => setFormData({...formData, clave: e.target.value})} />
              </div>

              <div className="form-group">
                <div className="form-group-header">
                  <label>Correo Electrónico</label>
                </div>
                <input type="email" className="input-base" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Registrando...' : 'Registrar Cuenta'}
              </button>
            </form>

            <div className="divider">O</div>

            <div className="create-account-text">
              <Link to="/login" className="create-account-link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <ArrowLeft size={16} /> Volver al Inicio de Sesión
              </Link>
            </div>
          </div>
        </div>

        <div className="footer-text">
          © 2026 Agro-Servicios. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
}
