import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Key } from 'lucide-react';
import logoImg from '../assets/logo.jpg';
import './Login.css';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [usuario, setUsuario] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nuevaClave, setNuevaClave] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGetQuestion = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3001/api/auth/forgot-password', { usuario });
      setSuccess(res.data.message); // Temporarily show success
      setTimeout(() => setSuccess(''), 3000);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Usuario no encontrado');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (nuevaClave.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3001/api/auth/reset-password', {
        usuario, codigo, nuevaClave
      });
      setSuccess(res.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-image-side"></div>
      <div className="login-form-side">
        <div className="login-form-container">
          <div className="login-header-brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <img src={logoImg} alt="Agro-Servicios Logo" style={{ width: '150px', borderRadius: '12px' }} />
            <h2 style={{ fontSize: '24px', marginTop: '10px' }}>AGRO-SERVICIOS</h2>
          </div>
          <p className="login-subtitle">Recuperar Contraseña</p>

          <div className="login-form-box">
            {error && <div style={{ color: 'red', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}
            {success && <div style={{ background: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>{success}</div>}

            {step === 1 && !success && (
              <form onSubmit={handleGetQuestion}>
                <div className="form-group">
                  <div className="form-group-header">
                    <label>Usuario</label>
                  </div>
                  <input 
                    type="text" 
                    className="input-base" 
                    placeholder="Ingrese su nombre de usuario"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Buscando...' : 'Buscar Usuario'} <ArrowLeft style={{ transform: 'rotate(180deg)' }} size={18} />
                </button>
              </form>
            )}

            {step === 2 && !success && (
              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <div className="form-group-header">
                    <label>Código de Recuperación</label>
                  </div>
                  <input 
                    type="text" 
                    className="input-base" 
                    placeholder="Ej. AGRO123"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <div className="form-group-header">
                    <label>Nueva Contraseña</label>
                  </div>
                  <input 
                    type="password" 
                    className="input-base" 
                    placeholder="Mínimo 8 caracteres"
                    value={nuevaClave}
                    onChange={(e) => setNuevaClave(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Restableciendo...' : 'Restablecer Contraseña'} <Key size={18} />
                </button>
              </form>
            )}

            <div className="login-footer" style={{ marginTop: '24px', textAlign: 'center' }}>
              <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--primary-color)', textDecoration: 'none' }}>
                <ArrowLeft size={16} /> Volver al Inicio de Sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
