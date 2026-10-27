import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Plus, AlertTriangle, Edit2 } from 'lucide-react';
import Modal from '../components/Modal';

export default function UsuariosList() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Custom Alert / Confirm states
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [editId, setEditId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    usuario: '',
    clave: '',
    email: '',
    codigo_recuperacion: '',
    privilegio: 'U',
    perm_clientes: false,
    perm_operaciones: false,
    perm_unidades: false,
    perm_operadores: false,
    perm_costos: false
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3001/api/usuarios');
      setUsuarios(res.data);
    } catch (error) {
      console.error("Error fetching usuarios", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (usuario = null) => {
    if (usuario) {
      setEditId(usuario.id);
      setFormData({
        usuario: usuario.usuario,
        clave: '', 
        email: usuario.email,
        codigo_recuperacion: '',
        privilegio: usuario.privilegio,
        perm_clientes: usuario.perm_clientes === 1,
        perm_operaciones: usuario.perm_operaciones === 1,
        perm_unidades: usuario.perm_unidades === 1,
        perm_operadores: usuario.perm_operadores === 1,
        perm_costos: usuario.perm_costos === 1
      });
    } else {
      setEditId(null);
      setFormData({ usuario: '', clave: '', email: '', codigo_recuperacion: '', privilegio: 'U', perm_clientes: false, perm_operaciones: false, perm_unidades: false, perm_operadores: false, perm_costos: false });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:3001/api/usuarios/${editId}`, formData);
      } else {
        await axios.post('http://localhost:3001/api/usuarios', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      setErrorMessage("Ha ocurrido un error al guardar la cuenta de usuario.");
    }
  };

  const confirmDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const handleDelete = async () => {
    if (deleteConfirmId) {
      try {
        await axios.delete(`http://localhost:3001/api/usuarios/${deleteConfirmId}`);
        fetchData();
        setDeleteConfirmId(null);
      } catch (error) {
        setDeleteConfirmId(null);
        setErrorMessage("Error al eliminar la cuenta. Verifica la conexión.");
      }
    }
  };

  return (
    <div className="animate-fade-in glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Cuentas de Usuario (Seguridad)</h2>
        <button onClick={handleOpenModal} className="btn-primary" style={{ width: 'auto' }}>
          <Plus size={18} /> Nueva Cuenta
        </button>
      </div>

      {loading ? <p>Cargando...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>ID</th>
              <th style={{ padding: '12px' }}>Usuario</th>
              <th style={{ padding: '12px' }}>Correo Electrónico</th>
              <th style={{ padding: '12px' }}>Nivel de Acceso</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px' }}>{u.id}</td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{u.usuario}</td>
                <td style={{ padding: '12px' }}>{u.email}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    background: u.privilegio === 'A' ? 'var(--accent-primary)' : 'var(--bg-secondary)', 
                    color: u.privilegio === 'A' ? 'white' : 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    padding: '2px 8px', borderRadius: '12px', fontSize: '12px' 
                  }}>
                    {u.privilegio === 'A' ? 'Administrador' : 'Usuario'}
                  </span>
                </td>
                <td style={{ padding: '12px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <button onClick={() => handleOpenModal(u)} className="btn-icon" style={{ color: 'var(--accent-primary)' }} disabled={u.usuario === 'admin'}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => confirmDelete(u.id)} className="btn-icon" style={{ color: 'red' }} disabled={u.usuario === 'admin'}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>No hay usuarios.</td></tr>
            )}
          </tbody>
        </table>
      )}

      {/* Form Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Crear Nueva Cuenta"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Nombre de Usuario</label>
              <input className="input-base" required disabled={!!editId} value={formData.usuario} onChange={e => setFormData({...formData, usuario: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Contraseña</label>
              <input type="password" className="input-base" required={!editId} placeholder={editId ? '(No cambiar)' : ''} disabled={!!editId} value={formData.clave} onChange={e => setFormData({...formData, clave: e.target.value})} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Correo Electrónico</label>
            <input type="email" className="input-base" required disabled={!!editId} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          {/* Show password/questions only if new user */}
          {!editId && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Código de Recuperación (Único para restablecer contraseña)</label>
              <input type="text" className="input-base" required placeholder="Ej. AGRO123" value={formData.codigo_recuperacion} onChange={e => setFormData({...formData, codigo_recuperacion: e.target.value})} />
            </div>
          )}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Nivel de Acceso</label>
            <select className="input-base" value={formData.privilegio} onChange={e => setFormData({...formData, privilegio: e.target.value})}>
              <option value="U">Usuario (Limitado)</option>
              <option value="A">Administrador (Total)</option>
            </select>
          </div>

          {/* Permisos Granulares (Sólo para Usuario Limitado) */}
          {formData.privilegio === 'U' && (
            <div className="form-group" style={{ marginTop: '10px' }}>
              <label>Permisos de Módulos (Habilitar para conceder acceso)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', padding: '15px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.perm_clientes} onChange={e => setFormData({...formData, perm_clientes: e.target.checked})} />
                  Permiso: Clientes
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.perm_operaciones} onChange={e => setFormData({...formData, perm_operaciones: e.target.checked})} />
                  Permiso: Operaciones
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.perm_unidades} onChange={e => setFormData({...formData, perm_unidades: e.target.checked})} />
                  Permiso: Unidades
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.perm_operadores} onChange={e => setFormData({...formData, perm_operadores: e.target.checked})} />
                  Permiso: Operadores
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.perm_costos} onChange={e => setFormData({...formData, perm_costos: e.target.checked})} />
                  Permiso: Mantenimiento (Costos)
                </label>
              </div>
            </div>
          )}
          
          <div className="form-actions">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary" style={{ width: 'auto' }}>{editId ? 'Guardar Cambios' : 'Crear Cuenta'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={deleteConfirmId !== null} 
        onClose={() => setDeleteConfirmId(null)} 
        title="Confirmar Eliminación"
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center', padding: '10px 0' }}>
          <AlertTriangle size={48} color="red" />
          <p>¿Estás seguro que deseas eliminar esta cuenta de acceso al sistema?</p>
          <div className="form-actions" style={{ width: '100%', justifyContent: 'center' }}>
            <button type="button" onClick={() => setDeleteConfirmId(null)} className="btn-secondary">Cancelar</button>
            <button type="button" onClick={handleDelete} className="btn-primary" style={{ background: 'red', width: 'auto' }}>Sí, Eliminar</button>
          </div>
        </div>
      </Modal>

      {/* Error Alert Modal */}
      <Modal 
        isOpen={errorMessage !== ''} 
        onClose={() => setErrorMessage('')} 
        title="Atención"
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center', padding: '10px 0' }}>
          <AlertTriangle size={48} color="#f59e0b" />
          <p>{errorMessage}</p>
          <div className="form-actions" style={{ width: '100%', justifyContent: 'center' }}>
            <button type="button" onClick={() => setErrorMessage('')} className="btn-primary" style={{ width: 'auto' }}>Entendido</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
