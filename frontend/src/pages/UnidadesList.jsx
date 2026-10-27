import { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit2, Trash2, Plus, AlertTriangle, ToggleLeft, ToggleRight, Download } from 'lucide-react';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

export default function UnidadesList() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const canEdit = user?.role === 'A' || user?.perm_unidades === 1;

  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [filterEstado, setFilterEstado] = useState('1');
  const [filterPlaca, setFilterPlaca] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    setCurrentPage(1);
  }, [filterEstado, filterPlaca, filterTipo]);
  
  // Custom Alert / Confirm states
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    codigo: '',
    tipo: '',
    nombre: '',
    marca: '',
    modelo: '',
    tamano: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3001/api/unidades');
      setUnidades(res.data);
    } catch (error) {
      console.error("Error fetching unidades", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (unidad = null) => {
    if (unidad) {
      setEditingId(unidad.id_equipo);
      setFormData({
        codigo: unidad.codigo_equipo || '',
        tipo: unidad.tipo_equipo || '',
        nombre: unidad.nombre_equipo || '',
        marca: unidad.marca_equipo || '',
        modelo: unidad.modelo_equipo || '',
        tamano: unidad.tamano_equipo || ''
      });
    } else {
      setEditingId(null);
      setFormData({ codigo: '', tipo: '', nombre: '', marca: '', modelo: '', tamano: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:3001/api/unidades/${editingId}`, formData);
      } else {
        await axios.post('http://localhost:3001/api/unidades', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage("Ha ocurrido un error al guardar los datos de la unidad.");
      }
    }
  };

  const handleToggleEstado = async (un) => {
    try {
      await axios.patch(`http://localhost:3001/api/unidades/${un.id_equipo}/estado`, { estado: !un.estado_equipo });
      fetchData();
    } catch (error) {
      setErrorMessage("Error al cambiar el estado de la unidad.");
    }
  };

  const confirmDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const handleDelete = async () => {
    if (deleteConfirmId) {
      try {
        await axios.delete(`http://localhost:3001/api/unidades/${deleteConfirmId}`);
        fetchData();
        setDeleteConfirmId(null);
      } catch (error) {
        setDeleteConfirmId(null);
        setErrorMessage("Error al eliminar la unidad. Verifica la conexión.");
      }
    }
  };

  const exportToCSV = () => {
    if (filteredUnidades.length === 0) return;
    const headers = ['Placa', 'Tipo', 'Descripción', 'Marca', 'Modelo', 'Tipo de Carga', 'Estado'];
    const csvContent = [
      headers.join(';'),
      ...filteredUnidades.map(un => [
        `"${String(un.codigo_equipo || '').replace(/"/g, '""')}"`,
        `"${String(un.tipo_equipo || '').replace(/"/g, '""')}"`,
        `"${String(un.nombre_equipo || '').replace(/"/g, '""')}"`,
        `"${String(un.marca_equipo || '').replace(/"/g, '""')}"`,
        `"${String(un.modelo_equipo || '').replace(/"/g, '""')}"`,
        `"${String(un.tamano_equipo || '').replace(/"/g, '""')}"`,
        `"${un.estado_equipo ? 'Activa' : 'Inactiva'}"`
      ].join(';'))
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `unidades_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  const filteredUnidades = unidades.filter(un => {
    const matchEstado = filterEstado === 'all' || String(un.estado_equipo) === filterEstado;
    const matchPlaca = filterPlaca === '' || String(un.codigo_equipo).toLowerCase().includes(filterPlaca.toLowerCase());
    const matchTipo = filterTipo === '' || String(un.tipo_equipo).toLowerCase().includes(filterTipo.toLowerCase());
    return matchEstado && matchPlaca && matchTipo;
  });

  const totalPages = Math.ceil(filteredUnidades.length / ITEMS_PER_PAGE);
  const paginatedUnidades = filteredUnidades.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="animate-fade-in glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Gestión de Unidades (Equipos)</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={exportToCSV} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} /> Exportar
          </button>
          {canEdit && (
            <button onClick={() => handleOpenModal()} className="btn-primary" style={{ width: 'auto' }}>
              <Plus size={18} /> Nueva Unidad
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="input-base"
          placeholder="Buscar por placa..."
          value={filterPlaca}
          onChange={e => setFilterPlaca(e.target.value)}
          style={{ width: '250px' }}
        />
        <input
          type="text"
          className="input-base"
          placeholder="Buscar por tipo (ej: Camión)..."
          value={filterTipo}
          onChange={e => setFilterTipo(e.target.value)}
          style={{ width: '250px' }}
        />
        <select 
          className="input-base"
          style={{ width: '250px' }}
          value={filterEstado}
          onChange={e => setFilterEstado(e.target.value)}
        >
          <option value="all">Todas (Activas e Inactivas)</option>
          <option value="1">Solo Activas</option>
          <option value="0">Solo Inactivas</option>
        </select>
      </div>

      {loading ? <p>Cargando...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Placa</th>
              <th style={{ padding: '12px' }}>Tipo</th>
              <th style={{ padding: '12px' }}>Descripción</th>
              <th style={{ padding: '12px' }}>Marca / Modelo</th>
              <th style={{ padding: '12px' }}>Tipo de Carga</th>
              <th style={{ padding: '12px' }}>Estado</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUnidades.map(un => (
              <tr key={un.id_equipo} style={{ borderBottom: '1px solid var(--border-color)', opacity: un.estado_equipo ? 1 : 0.6 }}>
                <td style={{ padding: '12px' }}>{un.codigo_equipo}</td>
                <td style={{ padding: '12px' }}>{un.tipo_equipo}</td>
                <td style={{ padding: '12px' }}>{un.nombre_equipo}</td>
                <td style={{ padding: '12px' }}>{un.marca_equipo} / {un.modelo_equipo}</td>
                <td style={{ padding: '12px' }}>{un.tamano_equipo}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '12px', 
                    fontSize: '12px',
                    background: un.estado_equipo ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: un.estado_equipo ? '#22c55e' : '#ef4444'
                  }}>
                    {un.estado_equipo ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td style={{ padding: '12px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  {canEdit && (
                    <>
                      <button onClick={() => handleToggleEstado(un)} className="btn-icon" style={{ color: un.estado_equipo ? 'var(--text-secondary)' : '#22c55e' }} title={un.estado_equipo ? "Desactivar" : "Activar"}>
                        {un.estado_equipo ? <ToggleLeft size={18} /> : <ToggleRight size={18} />}
                      </button>
                      <button onClick={() => handleOpenModal(un)} className="btn-icon" style={{ color: 'var(--accent-primary)' }} title="Editar"><Edit2 size={16} /></button>
                      <button onClick={() => confirmDelete(un.id_equipo)} className="btn-icon" style={{ color: 'red' }} title="Eliminar"><Trash2 size={16} /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {paginatedUnidades.length === 0 && (
              <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center' }}>No hay unidades registradas.</td></tr>
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
        title={editingId ? "Editar Unidad" : "Registrar Nueva Unidad"}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Placa (Código)</label>
              <input className="input-base" required placeholder="Ej: UN-01" value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Descripción del Equipo</label>
            <input className="input-base" required placeholder="Ej: Mack, Chevrolet..." value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Tipo de Equipo</label>
            <input className="input-base" required placeholder="Ej: Camión, Gandola..." value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Marca</label>
              <input className="input-base" placeholder="Ej: Mack" value={formData.marca} onChange={e => setFormData({...formData, marca: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Modelo</label>
              <input className="input-base" placeholder="Ej: Granite" value={formData.modelo} onChange={e => setFormData({...formData, modelo: e.target.value})} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Tipo de Carga</label>
            <select className="input-base" required value={formData.tamano} onChange={e => setFormData({...formData, tamano: e.target.value})}>
              <option value="">Seleccione...</option>
              <option value="Ligera">Ligera</option>
              <option value="Pesada">Pesada</option>
            </select>
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
          <p>¿Estás seguro que deseas eliminar esta unidad? Esta acción no se puede deshacer.</p>
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
