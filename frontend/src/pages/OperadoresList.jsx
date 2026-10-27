import { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit2, Trash2, Plus, AlertTriangle, ToggleLeft, ToggleRight, Download } from 'lucide-react';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

export default function OperadoresList() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const canEdit = user?.role === 'A' || user?.perm_operadores === 1;

  const [operadores, setOperadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [filterEstado, setFilterEstado] = useState('1');
  const [filterCedula, setFilterCedula] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    setCurrentPage(1);
  }, [filterEstado, filterCedula]);
  
  // Custom Alert / Confirm states
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: '',
    cargo: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3001/api/operadores');
      setOperadores(res.data);
    } catch (error) {
      console.error("Error fetching operadores", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (operador = null) => {
    if (operador) {
      setEditingId(operador.id_funcionario);
      setFormData({
        cedula: operador.cedula_funcionario,
        nombre: operador.nombre_funcionario,
        apellido: operador.apellido_funcionario,
        telefono: operador.telefono_funcionario,
        direccion: operador.direccion_funcionario,
        cargo: operador.cargo_funcionario
      });
    } else {
      setEditingId(null);
      setFormData({ cedula: '', nombre: '', apellido: '', telefono: '', direccion: '', cargo: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:3001/api/operadores/${editingId}`, formData);
      } else {
        await axios.post('http://localhost:3001/api/operadores', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage("Ha ocurrido un error al guardar los datos del operador.");
      }
    }
  };

  const handleToggleEstado = async (op) => {
    try {
      await axios.patch(`http://localhost:3001/api/operadores/${op.id_funcionario}/estado`, { estado: !op.estado_funcionario });
      fetchData();
    } catch (error) {
      setErrorMessage("Error al cambiar el estado del operador.");
    }
  };

  const confirmDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const handleDelete = async () => {
    if (deleteConfirmId) {
      try {
        await axios.delete(`http://localhost:3001/api/operadores/${deleteConfirmId}`);
        fetchData();
        setDeleteConfirmId(null);
      } catch (error) {
        setDeleteConfirmId(null);
        setErrorMessage("Error al eliminar el operador. Verifica la conexión.");
      }
    }
  };

  const exportToCSV = () => {
    if (filteredOperadores.length === 0) return;
    const headers = ['Cédula', 'Nombre', 'Apellido', 'Teléfono', 'Dirección', 'Cargo', 'Estado'];
    const csvContent = [
      headers.join(';'),
      ...filteredOperadores.map(op => [
        `"${String(op.cedula_funcionario || '').replace(/"/g, '""')}"`,
        `"${String(op.nombre_funcionario || '').replace(/"/g, '""')}"`,
        `"${String(op.apellido_funcionario || '').replace(/"/g, '""')}"`,
        `"${String(op.telefono_funcionario || '').replace(/"/g, '""')}"`,
        `"${String(op.direccion_funcionario || '').replace(/"/g, '""')}"`,
        `"${String(op.cargo_funcionario || '').replace(/"/g, '""')}"`,
        `"${op.estado_funcionario ? 'Activo' : 'Inactivo'}"`
      ].join(';'))
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `operadores_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  const filteredOperadores = operadores.filter(op => {
    const matchEstado = filterEstado === 'all' || String(op.estado_funcionario) === filterEstado;
    const matchCedula = filterCedula === '' || String(op.cedula_funcionario).includes(filterCedula);
    return matchEstado && matchCedula;
  });

  const totalPages = Math.ceil(filteredOperadores.length / ITEMS_PER_PAGE);
  const paginatedOperadores = filteredOperadores.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="animate-fade-in glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Gestión de Operadores</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={exportToCSV} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} /> Exportar
          </button>
          {canEdit && (
            <button onClick={() => handleOpenModal()} className="btn-primary" style={{ width: 'auto' }}>
              <Plus size={18} /> Nuevo Operador
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="input-base"
          placeholder="Buscar por cédula..."
          value={filterCedula}
          onChange={e => setFilterCedula(e.target.value)}
          style={{ width: '250px' }}
        />
        <select 
          className="input-base"
          style={{ width: '250px' }}
          value={filterEstado}
          onChange={e => setFilterEstado(e.target.value)}
        >
          <option value="all">Todos (Activos e Inactivos)</option>
          <option value="1">Solo Activos</option>
          <option value="0">Solo Inactivos</option>
        </select>
      </div>

      {loading ? <p>Cargando...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Cédula</th>
              <th style={{ padding: '12px' }}>Nombre Completo</th>
              <th style={{ padding: '12px' }}>Teléfono</th>
              <th style={{ padding: '12px' }}>Dirección</th>
              <th style={{ padding: '12px' }}>Cargo</th>
              <th style={{ padding: '12px' }}>Estado</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOperadores.map(op => (
              <tr key={op.id_funcionario} style={{ borderBottom: '1px solid var(--border-color)', opacity: op.estado_funcionario ? 1 : 0.6 }}>
                <td style={{ padding: '12px' }}>{op.cedula_funcionario}</td>
                <td style={{ padding: '12px' }}>{op.nombre_funcionario} {op.apellido_funcionario}</td>
                <td style={{ padding: '12px' }}>{op.telefono_funcionario}</td>
                <td style={{ padding: '12px', fontSize: '14px', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={op.direccion_funcionario}>{op.direccion_funcionario || 'N/A'}</td>
                <td style={{ padding: '12px' }}>{op.cargo_funcionario}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '12px', 
                    fontSize: '12px',
                    background: op.estado_funcionario ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: op.estado_funcionario ? '#22c55e' : '#ef4444'
                  }}>
                    {op.estado_funcionario ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={{ padding: '12px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  {canEdit && (
                    <>
                      <button onClick={() => handleToggleEstado(op)} className="btn-icon" style={{ color: op.estado_funcionario ? 'var(--text-secondary)' : '#22c55e' }} title={op.estado_funcionario ? "Desactivar" : "Activar"}>
                        {op.estado_funcionario ? <ToggleLeft size={18} /> : <ToggleRight size={18} />}
                      </button>
                      <button onClick={() => handleOpenModal(op)} className="btn-icon" style={{ color: 'var(--accent-primary)' }} title="Editar"><Edit2 size={16} /></button>
                      <button onClick={() => confirmDelete(op.id_funcionario)} className="btn-icon" style={{ color: 'red' }} title="Eliminar"><Trash2 size={16} /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {paginatedOperadores.length === 0 && (
              <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>No hay operadores registrados.</td></tr>
            )}
          </tbody>
        </table>
      )}

      {totalPages > 1 && (
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setCurrentPage} 
        />
      )}

      {/* Form Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId ? "Editar Operador" : "Registrar Nuevo Operador"}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Cédula (Solo números)</label>
            <input 
              type="text" 
              className="input-base" 
              required 
              placeholder="Ej: 12345678"
              value={formData.cedula} 
              onChange={e => setFormData({...formData, cedula: e.target.value.replace(/\D/g, '')})} 
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Nombre</label>
              <input className="input-base" required placeholder="Ej: Juan" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Apellido</label>
              <input className="input-base" required placeholder="Ej: Pérez" value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Teléfono (Solo números)</label>
            <input 
              type="text" 
              className="input-base" 
              placeholder="Ej: 04141234567"
              value={formData.telefono} 
              onChange={e => setFormData({...formData, telefono: e.target.value.replace(/\D/g, '')})} 
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Dirección</label>
            <input className="input-base" placeholder="Ej: Av. Principal, Sector X..." value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Cargo</label>
            <input className="input-base" required placeholder="Ej: Chofer, Ayudante..." value={formData.cargo} onChange={e => setFormData({...formData, cargo: e.target.value})} />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary" style={{ width: 'auto' }}>{editingId ? 'Actualizar' : 'Guardar'}</button>
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
          <p>¿Estás seguro que deseas eliminar este operador? Esta acción no se puede deshacer.</p>
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
