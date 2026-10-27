import { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit, Trash2, Plus, AlertTriangle, Search, ToggleLeft, ToggleRight, Download } from 'lucide-react';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

export default function ClientesList() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const canEdit = user?.role === 'A' || user?.perm_clientes === 1;

  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('1');
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    setCurrentPage(1);
  }, [filterEstado, searchTerm]);
  
  // States for confirming deletion and showing errors
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    razon_social: '',
    rif: '',
    domicilio_fiscal: '',
    telefono: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3001/api/clientes');
      setClientes(res.data);
    } catch (error) {
      console.error("Error fetching clientes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (cliente = null) => {
    if (cliente) {
      setEditId(cliente.id_cliente);
      setFormData({
        razon_social: cliente.razon_social,
        rif: cliente.rif,
        domicilio_fiscal: cliente.domicilio_fiscal || '',
        telefono: cliente.telefono_cliente || ''
      });
    } else {
      setEditId(null);
      setFormData({ razon_social: '', rif: '', domicilio_fiscal: '', telefono: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:3001/api/clientes/${editId}`, formData);
      } else {
        await axios.post('http://localhost:3001/api/clientes', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "Error al guardar el cliente");
    }
  };

  const handleToggleEstado = async (c) => {
    try {
      await axios.patch(`http://localhost:3001/api/clientes/${c.id_cliente}/estado`, { estado: !c.estado_cliente });
      fetchData();
    } catch (error) {
      setErrorMessage("Error al cambiar el estado del cliente.");
    }
  };

  const confirmDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const handleDelete = async () => {
    if (deleteConfirmId) {
      try {
        await axios.delete(`http://localhost:3001/api/clientes/${deleteConfirmId}`);
        fetchData();
        setDeleteConfirmId(null);
      } catch (error) {
        setDeleteConfirmId(null);
        setErrorMessage(error.response?.data?.error || "Error al eliminar el cliente.");
      }
    }
  };

  const exportToCSV = () => {
    if (filteredClientes.length === 0) return;
    const headers = ['RIF', 'Razón Social', 'Teléfono', 'Domicilio Fiscal', 'Estado'];
    const csvContent = [
      headers.join(';'),
      ...filteredClientes.map(c => [
        `"${String(c.rif || '').replace(/"/g, '""')}"`,
        `"${String(c.razon_social || '').replace(/"/g, '""')}"`,
        `"${String(c.telefono_cliente || '').replace(/"/g, '""')}"`,
        `"${String(c.domicilio_fiscal || '').replace(/"/g, '""')}"`,
        `"${c.estado_cliente ? 'Activo' : 'Inactivo'}"`
      ].join(';'))
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `clientes_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  const filteredClientes = clientes.filter(c => {
    const matchSearch = `${c.razon_social} ${c.rif}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = filterEstado === 'all' || String(c.estado_cliente) === filterEstado;
    return matchSearch && matchEstado;
  });

  const totalPages = Math.ceil(filteredClientes.length / ITEMS_PER_PAGE);
  const paginatedClientes = filteredClientes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="animate-fade-in glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Directorio de Clientes</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={exportToCSV} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} /> Exportar
          </button>
          {canEdit && (
            <button onClick={() => handleOpenModal()} className="btn-primary" style={{ width: 'auto' }}>
              <Plus size={18} /> Añadir Cliente
            </button>
          )}
        </div>
      </div>

      {/* Buscador */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Buscar por Razón Social o RIF..." 
            className="input-base" 
            style={{ paddingLeft: '40px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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

      {loading ? <p>Cargando clientes...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>RIF</th>
              <th style={{ padding: '12px' }}>Razón Social</th>
              <th style={{ padding: '12px' }}>Teléfono</th>
              <th style={{ padding: '12px' }}>Domicilio Fiscal</th>
              <th style={{ padding: '12px' }}>Estado</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedClientes.map(c => (
              <tr key={c.id_cliente} style={{ borderBottom: '1px solid var(--border-color)', opacity: c.estado_cliente ? 1 : 0.6 }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{c.rif}</td>
                <td style={{ padding: '12px' }}>{c.razon_social}</td>
                <td style={{ padding: '12px' }}>{c.telefono_cliente || '-'}</td>
                <td style={{ padding: '12px' }}>{c.domicilio_fiscal}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '12px', 
                    fontSize: '12px',
                    background: c.estado_cliente ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: c.estado_cliente ? '#22c55e' : '#ef4444'
                  }}>
                    {c.estado_cliente ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={{ padding: '12px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  {canEdit && (
                    <>
                      <button onClick={() => handleToggleEstado(c)} className="btn-icon" style={{ color: c.estado_cliente ? 'var(--text-secondary)' : '#22c55e' }} title={c.estado_cliente ? "Desactivar" : "Activar"}>
                        {c.estado_cliente ? <ToggleLeft size={18} /> : <ToggleRight size={18} />}
                      </button>
                      <button onClick={() => handleOpenModal(c)} className="btn-icon" style={{ color: 'var(--text-secondary)' }}><Edit size={16} /></button>
                      <button onClick={() => confirmDelete(c.id_cliente)} className="btn-icon" style={{ color: 'red' }}><Trash2 size={16} /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {paginatedClientes.length === 0 && (
              <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>No se encontraron clientes.</td></tr>
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
        title={editId ? "Editar Cliente" : "Añadir Cliente"}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>RIF</label>
            <input 
              className="input-base" 
              required 
              placeholder="Ej: J-12345678-9"
              value={formData.rif} 
              onChange={e => setFormData({...formData, rif: e.target.value})} 
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Razón Social</label>
            <input 
              className="input-base" 
              required 
              placeholder="Ej: Transporte Los Andes C.A."
              value={formData.razon_social} 
              onChange={e => setFormData({...formData, razon_social: e.target.value})} 
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Teléfono</label>
            <input 
              type="text"
              className="input-base" 
              placeholder="Ej: 04141234567"
              value={formData.telefono} 
              onChange={e => setFormData({...formData, telefono: e.target.value.replace(/\D/g, '')})} 
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Domicilio Fiscal</label>
            <textarea 
              className="input-base" 
              rows="3"
              placeholder="Ej: Zona Industrial, Galpón 4..."
              value={formData.domicilio_fiscal} 
              onChange={e => setFormData({...formData, domicilio_fiscal: e.target.value})} 
            />
          </div>
          <div className="form-actions" style={{ marginTop: '10px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary" style={{ width: 'auto' }}>Guardar</button>
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
          <p>¿Estás seguro que deseas eliminar este cliente? No podrás hacerlo si ya tiene operaciones asignadas.</p>
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
