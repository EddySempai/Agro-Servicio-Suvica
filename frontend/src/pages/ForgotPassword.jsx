import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Key } from 'lucide-react';
import logoImg from '../assets/logo.jpg';
import './Login.css';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [usuario, setUsuario] = useState('');
  const [pregunta, setPregunta] = useState('');
  const [respuesta, setRespuesta] = useState('');
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
      setPregunta(res.data.pregunta);
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
        usuario, respuesta, nuevaClave
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
    <div className="login-container">
      <div className="login-card animate-fade-in" style={{ padding: '40px', maxWidth: '400px', width: '100%' }}>
        <div className="login-header">
          <img src={logoImg} alt="Logo" className="login-logo" style={{ height: '80px', marginBottom: '16px' }} />
          <h2>Recuperar Contraseña</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Siga los pasos para restablecer su acceso
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message" style={{ background: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>{success}</div>}

        {step === 1 && !success && (
          <form onSubmit={handleGetQuestion} className="login-form">
            <div className="form-group">
              <label>Usuario</label>
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
              <Key size={18} />
              {loading ? 'Buscando...' : 'Buscar Usuario'}
            </button>
          </form>
        )}

        {step === 2 && !success && (
          <form onSubmit={handleResetPassword} className="login-form">
            <div className="form-group">
              <label>Pregunta de Seguridad</label>
              <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: '4px', fontWeight: '500' }}>
                {pregunta}
              </div>
            </div>
            <div className="form-group">
              <label>Respuesta</label>
              <input 
                type="text" 
                className="input-base" 
                placeholder="Su respuesta secreta"
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Nueva Contraseña</label>
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
              <Key size={18} />
              {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
            </button>
          </form>
        )}

        <div className="login-footer" style={{ marginTop: '24px' }}>
          <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <ArrowLeft size={16} /> Volver al Inicio de Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
