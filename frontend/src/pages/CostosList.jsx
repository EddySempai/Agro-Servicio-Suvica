import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Plus, AlertTriangle, Edit, Search, Calendar, DollarSign } from 'lucide-react';
import Modal from '../components/Modal';

export default function CostosList() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const canEdit = user?.role === 'A' || user?.perm_costos === 1;

  const [costos, setCostos] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [operadores, setOperadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    unidad_placa: '',
    chofer_cedula: '',
    fecha: '',
    descripcion: '',
    costo: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [costosRes, unRes, funRes] = await Promise.all([
        axios.get('http://localhost:3001/api/costos'),
        axios.get('http://localhost:3001/api/unidades'),
        axios.get('http://localhost:3001/api/operadores')
      ]);
      setCostos(costosRes.data);
      setUnidades(unRes.data);
      setOperadores(funRes.data);
    } catch (error) {
      console.error("Error fetching costos data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (costoItem = null) => {
    if (costoItem) {
      setEditId(costoItem.id_costo);
      setFormData({
        unidad_placa: costoItem.unidad_placa,
        chofer_cedula: costoItem.chofer_cedula,
        fecha: costoItem.fecha ? costoItem.fecha.slice(0, 10) : '',
        descripcion: costoItem.descripcion,
        costo: costoItem.costo
      });
    } else {
      setEditId(null);
      setFormData({ unidad_placa: '', chofer_cedula: '', fecha: '', descripcion: '', costo: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:3001/api/costos/${editId}`, formData);
      } else {
        await axios.post('http://localhost:3001/api/costos', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      setErrorMessage("Error al guardar el registro de mantenimiento.");
    }
  };

  const confirmDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const handleDelete = async () => {
    if (deleteConfirmId) {
      try {
        await axios.delete(`http://localhost:3001/api/costos/${deleteConfirmId}`);
        fetchData();
        setDeleteConfirmId(null);
      } catch (error) {
        setDeleteConfirmId(null);
        setErrorMessage("Error al eliminar.");
      }
    }
  };

  // Filter Logic
  const filteredCostos = costos.filter(c => {
    const searchString = `${c.unidad_placa} ${c.descripcion} ${c.chofer_nombre} ${c.chofer_apellido}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesDate = filterDate === '' || (c.fecha && c.fecha.startsWith(filterDate));
    return matchesSearch && matchesDate;
  });

  const totalCostos = filteredCostos.reduce((sum, item) => sum + Number(item.costo), 0);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  return (
    <div className="animate-fade-in glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Mantenimiento de Flota (Costos Operativos)</h2>
        {canEdit && (
          <button onClick={() => handleOpenModal()} className="btn-primary" style={{ width: 'auto' }}>
            <Plus size={18} /> Registrar Mantenimiento
          </button>
        )}
      </div>

      {/* Tarjeta de Resumen (No es el PDF de contabilidad, solo un subtotal en base al filtro para info rápida) */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <DollarSign size={24} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>${totalCostos.toFixed(2)}</h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Total Gastos en Mantenimiento (Según filtros)</p>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', background: 'var(--bg-primary)', padding: '16px', borderRadius: '8px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Buscar por placa, chofer o descripción..." 
            className="input-base" 
            style={{ paddingLeft: '40px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ position: 'relative', width: '200px' }}>
          <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
          <input 
            type="date" 
            className="input-base" 
            style={{ paddingLeft: '40px' }}
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      {loading ? <p>Cargando datos...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Fecha</th>
              <th style={{ padding: '12px' }}>Unidad</th>
              <th style={{ padding: '12px' }}>Chofer</th>
              <th style={{ padding: '12px' }}>Descripción (Mantenimiento)</th>
              <th style={{ padding: '12px' }}>Costo ($)</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredCostos.map(c => (
              <tr key={c.id_costo} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px' }}>{formatDate(c.fecha)}</td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{c.unidad_placa}</td>
                <td style={{ padding: '12px' }}>{c.chofer_nombre ? `${c.chofer_nombre} ${c.chofer_apellido}` : c.chofer_cedula}</td>
                <td style={{ padding: '12px' }}>{c.descripcion}</td>
                <td style={{ padding: '12px', color: '#ef4444', fontWeight: 'bold' }}>${Number(c.costo).toFixed(2)}</td>
                <td style={{ padding: '12px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  {canEdit && (
                    <>
                      <button onClick={() => handleOpenModal(c)} className="btn-icon" style={{ color: 'var(--accent-primary)' }}><Edit size={16} /></button>
                      <button onClick={() => confirmDelete(c.id_costo)} className="btn-icon" style={{ color: 'red' }}><Trash2 size={16} /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {filteredCostos.length === 0 && (
              <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>No se encontraron registros de mantenimiento.</td></tr>
            )}
          </tbody>
        </table>
      )}

      {/* Form Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editId ? "Editar Mantenimiento" : "Registrar Mantenimiento"}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Unidad (Placa)</label>
              <select 
                className="input-base" 
                required
                value={formData.unidad_placa} 
                onChange={e => setFormData({...formData, unidad_placa: e.target.value})}
              >
                <option value="">Seleccione Unidad...</option>
                {unidades.map(u => (
                  <option key={u.id_equipo} value={u.codigo_equipo}>{u.codigo_equipo} - {u.nombre_equipo}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Persona Responsable</label>
              <input 
                type="text"
                className="input-base" 
                required
                placeholder="Ej: Chofer Juan, Asistente Pedro..."
                value={formData.chofer_cedula} 
                onChange={e => setFormData({...formData, chofer_cedula: e.target.value})}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Fecha de la Reparación/Mantenimiento</label>
              <input type="date" className="input-base" required value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Costo Total ($)</label>
              <input type="number" step="0.01" className="input-base" required value={formData.costo} onChange={e => setFormData({...formData, costo: e.target.value})} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Descripción del Mantenimiento</label>
            <textarea 
              className="input-base" 
              required 
              rows="3"
              placeholder="Ej: Cambio de aceite, Reparación de frenos..."
              value={formData.descripcion} 
              onChange={e => setFormData({...formData, descripcion: e.target.value})} 
            />
          </div>

          <div className="form-actions" style={{ marginTop: '10px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary" style={{ width: 'auto' }}>{editId ? 'Guardar Cambios' : 'Registrar Mantenimiento'}</button>
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
          <p>¿Estás seguro que deseas eliminar este registro de mantenimiento?</p>
          <div className="form-actions" style={{ width: '100%', justifyContent: 'center' }}>
            <button type="button" onClick={() => setDeleteConfirmId(null)} className="btn-secondary">Cancelar</button>
            <button type="button" onClick={handleDelete} className="btn-primary" style={{ background: 'red', width: 'auto' }}>Sí, Eliminar</button>
          </div>
        </div>
      </Modal>

      {/* Error Modal */}
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
