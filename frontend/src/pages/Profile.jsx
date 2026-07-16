import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { User, Lock, CheckCircle } from 'lucide-react';

export default function Profile() {
  const { user } = useOutletContext();
  const [actualClave, setActualClave] = useState('');
  const [nuevaClave, setNuevaClave] = useState('');
  const [confirmarClave, setConfirmarClave] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (nuevaClave !== confirmarClave) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }
    if (nuevaClave.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3001/api/auth/change-password', {
        actualClave, nuevaClave
      });
      setSuccess(res.data.message);
      setActualClave('');
      setNuevaClave('');
      setConfirmarClave('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
      
      {/* Información del Perfil */}
      <div className="glass-panel" style={{ padding: '32px', flex: '1 1 300px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <User size={30} />
          </div>
          <div>
            <h2 style={{ margin: 0 }}>Mi Perfil</h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Gestione su cuenta</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Nombre de Usuario</label>
            <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: '4px', fontWeight: '500' }}>
              {user?.username}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>Rol en el Sistema</label>
            <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: '4px', fontWeight: '500' }}>
              {user?.role === 'A' ? 'Administrador' : 'Usuario Regular'}
            </div>
          </div>
        </div>
      </div>

      {/* Cambiar Contraseña */}
      <div className="glass-panel" style={{ padding: '32px', flex: '2 1 400px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <Lock size={20} color="var(--accent-primary)" />
          Cambiar Contraseña
        </h3>

        {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>{error}</div>}
        {success && <div style={{ background: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '4px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={18} /> {success}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Contraseña Actual</label>
            <input 
              type="password" 
              className="input-base" 
              value={actualClave}
              onChange={e => setActualClave(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Nueva Contraseña</label>
              <input 
                type="password" 
                className="input-base" 
                placeholder="Mínimo 8 caracteres"
                value={nuevaClave}
                onChange={e => setNuevaClave(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Confirmar Nueva Contraseña</label>
              <input 
                type="password" 
                className="input-base" 
                value={confirmarClave}
                onChange={e => setConfirmarClave(e.target.value)}
                required
              />
            </div>
          </div>
          
          <button type="submit" className="btn-primary" style={{ marginTop: '8px', width: 'auto', alignSelf: 'flex-start' }} disabled={loading}>
            {loading ? 'Guardando...' : 'Actualizar Contraseña'}
          </button>
        </form>
      </div>

    </div>
  );
}
