import { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import { Trash2, Plus, AlertTriangle, Printer, Edit, Download, Search, Calendar, Filter } from 'lucide-react';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import logoImg from '../assets/logo.jpg';

export default function OperacionesList() {
  const { user } = useOutletContext();
  const canEdit = user?.role === 'A' || user?.perm_operaciones === 1;
  const [operaciones, setOperaciones] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [operadores, setOperadores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportData, setReportData] = useState(null);
  
  // Fast Client Creation State
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({ razon_social: '', rif: '' });
  const [clientCreating, setClientCreating] = useState(false);
  
  // Advanced features state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDateDesde, setFilterDateDesde] = useState('');
  const [filterDateHasta, setFilterDateHasta] = useState('');
  const [filterEstatus, setFilterEstatus] = useState('');
  const [editId, setEditId] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDateDesde, filterDateHasta, filterEstatus]);
  
  // Custom Alert / Confirm states
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    codigo: '',
    tipo: 'Traslado',
    fecha: '',
    hora: '',
    origen: '',
    destino: '',
    ubicacion: '',
    indicativo_unidad: '',
    cedula_funcionario: '',
    precio: '',
    cliente_id: ''
  });

  const [previewCodigo, setPreviewCodigo] = useState('');

  useEffect(() => {
    if (!editId && formData.origen && formData.fecha) {
      axios.get(`http://localhost:3001/api/operaciones/preview-codigo?origen=${encodeURIComponent(formData.origen)}&fecha=${formData.fecha}`)
        .then(res => setPreviewCodigo(res.data.codigo))
        .catch(() => setPreviewCodigo(''));
    } else {
      setPreviewCodigo('');
    }
  }, [formData.origen, formData.fecha, editId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [opRes, unRes, funRes, cliRes] = await Promise.all([
        axios.get('http://localhost:3001/api/operaciones'),
        axios.get('http://localhost:3001/api/unidades'),
        axios.get('http://localhost:3001/api/operadores'),
        axios.get('http://localhost:3001/api/clientes')
      ]);
      setOperaciones(opRes.data);
      setUnidades(unRes.data);
      setOperadores(funRes.data);
      setClientes(cliRes.data);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (op = null) => {
    if (op) {
      setEditId(op.id_novedad_d);
      const parts = (op.ubicacion_novedad_d || '').split(' - ');
      setFormData({
        codigo: op.codigo_novedad_d || '',
        tipo: op.tipo_novedad_d || 'Traslado',
        fecha: op.fecha_novedad_d ? op.fecha_novedad_d.slice(0, 10) : '',
        hora: op.hora_novedad_d || '',
        origen: parts[0] || '',
        destino: parts.slice(1).join(' - ') || '',
        ubicacion: op.ubicacion_novedad_d || '',
        indicativo_unidad: op.indicativo_unidad || '',
        cedula_funcionario: op.cedula_funcionario || '',
        precio: op.precio || '',
        cliente_id: op.cliente_id || ''
      });
    } else {
      setEditId(null);
      const now = new Date();
      setFormData({ 
        codigo: '', 
        tipo: 'Traslado', 
        fecha: now.toISOString().slice(0, 10), 
        hora: now.toTimeString().slice(0, 5), 
        origen: '', 
        destino: '', 
        ubicacion: '', 
        indicativo_unidad: '', 
        cedula_funcionario: '', 
        precio: '', 
        cliente_id: '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        ubicacion: (formData.origen && formData.destino)
          ? `${formData.origen.trim()} - ${formData.destino.trim()}`
          : (formData.origen || formData.destino || formData.ubicacion)
      };
      if (editId) {
        await axios.put(`http://localhost:3001/api/operaciones/${editId}`, payload);
      } else {
        await axios.post('http://localhost:3001/api/operaciones', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      setErrorMessage("Ha ocurrido un error al guardar los datos de la operación.");
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setClientCreating(true);
    try {
      const res = await axios.post('http://localhost:3001/api/clientes', newClient);
      const createdId = res.data.id;
      // Refresh clients
      const cliRes = await axios.get('http://localhost:3001/api/clientes');
      setClientes(cliRes.data);
      // Auto-select the new client
      setFormData({ ...formData, cliente_id: createdId });
      setIsClientModalOpen(false);
      setNewClient({ razon_social: '', rif: '' });
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "Error al crear el cliente");
    } finally {
      setClientCreating(false);
    }
  };

  const confirmDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const handleDelete = async () => {
    if (deleteConfirmId) {
      try {
        await axios.delete(`http://localhost:3001/api/operaciones/${deleteConfirmId}`);
        fetchData();
        setDeleteConfirmId(null);
      } catch (error) {
        setDeleteConfirmId(null);
        setErrorMessage("Error al eliminar la operación. Verifica la conexión.");
      }
    }
  };

  const handleStatusChange = async (id, newEstatus) => {
    try {
      await axios.patch(`http://localhost:3001/api/operaciones/${id}/estatus`, { estatus: newEstatus });
      setOperaciones(operaciones.map(op => op.id_novedad_d === id ? { ...op, estatus: newEstatus } : op));
    } catch (error) {
      setErrorMessage("Error al cambiar estatus.");
    }
  };

  const handlePrint = (op) => {
    setReportData(op);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const exportToCSV = () => {
    if (filteredOperaciones.length === 0) return;
    const headers = ['Fecha', 'Hora', 'Código', 'Tipo', 'Ubicación', 'Atendido', 'Cliente', 'Unidad', 'Funcionario', 'Estatus', 'Precio'];
    const csvContent = [
      headers.join(';'),
      ...filteredOperaciones.map(op => [
        `"${op.fecha_novedad_d?.slice(0,10) || ''}"`,
        `"${op.hora_novedad_d || ''}"`,
        `"${String(op.codigo_novedad_d || '').replace(/"/g, '""')}"`,
        `"${String(op.tipo_novedad_d || '').replace(/"/g, '""')}"`,
        `"${String(op.ubicacion_novedad_d || '').replace(/"/g, '""')}"`,
        `"${String((op.nombre_atendido || '') + ' ' + (op.apellido_atendido || '')).trim().replace(/"/g, '""')}"`,
        `"${String(op.cliente_nombre || '').replace(/"/g, '""')}"`,
        `"${String(op.indicativo_unidad || '').replace(/"/g, '""')}"`,
        `"${String(op.cedula_funcionario || '').replace(/"/g, '""')}"`,
        `"${String(op.estatus || '').replace(/"/g, '""')}"`,
        `"${op.precio ?? 0}"`
      ].join(';'))
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `operaciones_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  // Utility to format Date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  // Filter Logic
  const filteredOperaciones = operaciones.filter(op => {
    const searchString = `${op.codigo_novedad_d} ${op.tipo_novedad_d} ${op.ubicacion_novedad_d} ${op.nombre_atendido} ${op.apellido_atendido} ${op.cliente_nombre}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    
    let matchesDesde = true;
    let matchesHasta = true;
    
    if (filterDateDesde) {
      matchesDesde = op.fecha_novedad_d && op.fecha_novedad_d.slice(0, 10) >= filterDateDesde;
    }
    if (filterDateHasta) {
      matchesHasta = op.fecha_novedad_d && op.fecha_novedad_d.slice(0, 10) <= filterDateHasta;
    }
    
    const matchesEstatus = filterEstatus === '' || op.estatus === filterEstatus;
    return matchesSearch && matchesDesde && matchesHasta && matchesEstatus;
  });

  const getStatusColor = (estatus) => {
    switch (estatus) {
      case 'Realizado': return { bg: 'rgba(34, 197, 94, 0.2)', text: '#22c55e' };
      case 'En proceso': return { bg: 'rgba(59, 130, 246, 0.2)', text: '#3b82f6' };
      default: return { bg: 'rgba(245, 158, 11, 0.2)', text: '#f59e0b' }; // Pendiente
    }
  };

  const totalPages = Math.ceil(filteredOperaciones.length / ITEMS_PER_PAGE);
  const paginatedOperaciones = filteredOperaciones.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <>
    <div className="animate-fade-in glass-panel no-print" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Novedades Diarias (Operaciones)</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={exportToCSV} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} /> Exportar
          </button>
          {canEdit && (
            <button onClick={() => handleOpenModal()} className="btn-primary" style={{ width: 'auto' }}>
              <Plus size={18} /> Registrar Operación
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', background: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 250px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Buscar código, ubicación, cliente..." 
            className="input-base" 
            style={{ paddingLeft: '40px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ position: 'relative', width: '160px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', position: 'absolute', top: '-18px', left: '0' }}>Desde:</label>
          <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
          <input 
            type="date" 
            className="input-base" 
            style={{ paddingLeft: '40px' }}
            value={filterDateDesde}
            onChange={(e) => setFilterDateDesde(e.target.value)}
          />
        </div>
        <div style={{ position: 'relative', width: '160px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', position: 'absolute', top: '-18px', left: '0' }}>Hasta:</label>
          <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
          <input 
            type="date" 
            className="input-base" 
            style={{ paddingLeft: '40px' }}
            value={filterDateHasta}
            onChange={(e) => setFilterDateHasta(e.target.value)}
          />
        </div>
        <div style={{ position: 'relative', width: '160px' }}>
          <Filter size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
          <select 
            className="input-base" 
            style={{ paddingLeft: '40px' }}
            value={filterEstatus}
            onChange={(e) => setFilterEstatus(e.target.value)}
          >
            <option value="">Todo Estatus</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En proceso">En proceso</option>
            <option value="Realizado">Realizado</option>
          </select>
        </div>
      </div>

      {loading ? <p>Cargando...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Fecha</th>
              <th style={{ padding: '12px' }}>Código/Tipo</th>
              <th style={{ padding: '12px' }}>Cliente</th>
              <th style={{ padding: '12px' }}>Destino</th>
              <th style={{ padding: '12px' }}>Estatus</th>
              <th style={{ padding: '12px' }}>Precio</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOperaciones.map(op => {
              const statusColors = getStatusColor(op.estatus);
              return (
                <tr key={op.id_novedad_d} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px' }}>{formatDate(op.fecha_novedad_d)} {op.hora_novedad_d}</td>
                  <td style={{ padding: '12px' }}>
                    <strong>{op.codigo_novedad_d}</strong><br/>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{op.tipo_novedad_d}</span>
                  </td>
                  <td style={{ padding: '12px' }}>{op.cliente_nombre || 'N/A'}</td>
                  <td style={{ padding: '12px' }}>{op.ubicacion_novedad_d}</td>
                  <td style={{ padding: '12px' }}>
                    {canEdit ? (
                      <select 
                        value={op.estatus} 
                        onChange={(e) => handleStatusChange(op.id_novedad_d, e.target.value)}
                        style={{
                          background: statusColors.bg,
                          color: statusColors.text,
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="Pendiente" style={{ color: 'black' }}>Pendiente</option>
                        <option value="En proceso" style={{ color: 'black' }}>En proceso</option>
                        <option value="Realizado" style={{ color: 'black' }}>Realizado</option>
                      </select>
                    ) : (
                      <span style={{ background: statusColors.bg, color: statusColors.text, padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                        {op.estatus}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>${Number(op.precio).toFixed(2)}</td>
                  <td style={{ padding: '12px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <button onClick={() => handlePrint(op)} className="btn-icon" style={{ color: 'var(--accent-primary)' }} title="Imprimir Informe"><Printer size={16} /></button>
                    {canEdit && (
                      <>
                        <button onClick={() => handleOpenModal(op)} className="btn-icon" style={{ color: 'var(--text-secondary)' }} title="Editar"><Edit size={16} /></button>
                        <button onClick={() => confirmDelete(op.id_novedad_d)} className="btn-icon" style={{ color: 'red' }} title="Eliminar"><Trash2 size={16} /></button>
                      </>
                    )}
                  </td>
                </tr>
              )
            })}
            {paginatedOperaciones.length === 0 && (
              <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center' }}>No hay operaciones que coincidan con la búsqueda.</td></tr>
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
        title={editId ? "Editar Novedad Diaria" : "Registrar Novedad Diaria"}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Tipo de Operación</label>
            <input className="input-base" required placeholder="Ej: Traslado, Flete..." value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Fecha</label>
              <input type="date" className="input-base" required value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Hora</label>
              <input type="time" className="input-base" required value={formData.hora} onChange={e => setFormData({...formData, hora: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Origen (Ciudad de Salida)</label>
              <input 
                className="input-base" 
                required 
                placeholder="Ej: Caracas" 
                value={formData.origen} 
                onChange={e => setFormData({...formData, origen: e.target.value})} 
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Destino (Ciudad de Llegada)</label>
              <input 
                className="input-base" 
                required 
                placeholder="Ej: Valencia" 
                value={formData.destino} 
                onChange={e => setFormData({...formData, destino: e.target.value})} 
              />
            </div>
          </div>
          {!editId && previewCodigo && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '8px 12px', 
              background: 'rgba(45, 90, 39, 0.1)', 
              border: '1px solid var(--accent-primary)', 
              borderRadius: '6px', 
              fontSize: '13px' 
            }}>
              <span>Código asignado automáticamente:</span>
              <strong style={{ color: 'var(--accent-primary)', fontSize: '15px', letterSpacing: '1px' }}>{previewCodigo}</strong>
            </div>
          )}
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label>Cliente Asignado</label>
                  <select 
                    className="input-base" 
                    value={formData.cliente_id} 
                    onChange={e => setFormData({...formData, cliente_id: e.target.value})}
                  >
                    <option value="">Ninguno (General)</option>
                    {clientes.map(c => (
                      <option key={c.id_cliente} value={c.id_cliente}>{c.razon_social} ({c.rif})</option>
                    ))}
                  </select>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsClientModalOpen(true)} 
                  className="btn-secondary" 
                  style={{ padding: '8px 12px', height: '42px', whiteSpace: 'nowrap' }}
                  title="Registrar Nuevo Cliente Rápido"
                >
                  <Plus size={18} /> Nuevo
                </button>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Precio de la Operación ($)</label>
              <input type="number" step="0.01" className="input-base" required placeholder="Ej: 150.00" value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Unidades Select */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Ind. Unidad</label>
              <select 
                className="input-base" 
                value={formData.indicativo_unidad} 
                onChange={e => setFormData({...formData, indicativo_unidad: e.target.value})}
              >
                <option value="">Seleccione Unidad...</option>
                {unidades.map(u => (
                  <option key={u.id_equipo} value={u.codigo_equipo}>{u.codigo_equipo} - {u.nombre_equipo}</option>
                ))}
              </select>
            </div>
            
            {/* Funcionarios Select */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Funcionario a Cargo</label>
              <select 
                className="input-base" 
                required
                value={formData.cedula_funcionario} 
                onChange={e => setFormData({...formData, cedula_funcionario: e.target.value})}
              >
                <option value="">Seleccione Funcionario...</option>
                {operadores.map(o => (
                  <option key={o.id_funcionario} value={o.cedula_funcionario}>{o.nombre_funcionario} {o.apellido_funcionario}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary" style={{ width: 'auto' }}>{editId ? 'Guardar Cambios' : 'Registrar'}</button>
          </div>
        </form>
      </Modal>

      {/* Fast Client Creation Modal */}
      <Modal 
        isOpen={isClientModalOpen} 
        onClose={() => setIsClientModalOpen(false)} 
        title="Registrar Nuevo Cliente"
      >
        <form onSubmit={handleCreateClient} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Razón Social (Nombre)</label>
            <input className="input-base" required placeholder="Ej: Transportes C.A." value={newClient.razon_social} onChange={e => setNewClient({...newClient, razon_social: e.target.value})} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>RIF</label>
            <input className="input-base" required placeholder="Ej: J-12345678-9" value={newClient.rif} onChange={e => setNewClient({...newClient, rif: e.target.value})} />
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => setIsClientModalOpen(false)} className="btn-secondary" disabled={clientCreating}>Cancelar</button>
            <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={clientCreating}>{clientCreating ? 'Guardando...' : 'Guardar y Seleccionar'}</button>
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
          <p>¿Estás seguro que deseas eliminar este registro de operación? Esta acción no se puede deshacer.</p>
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

    {/* Printable Section */}
    {reportData && (
      <div className="print-only" style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#111827', lineHeight: '1.5' }}>
        {/* Encabezado Corporativo Oficial */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #2d5a27', paddingBottom: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img src={logoImg} alt="Logo" style={{ height: '75px', borderRadius: '6px' }} />
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#2d5a27', letterSpacing: '0.5px' }}>AGRO-SERVICIOS C.A.</h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#4b5563' }}>Transporte y Logística Operativa Especializada</p>
              <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#6b7280' }}>R.I.F. J-31245678-9 | Despacho y Control de Flota</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ background: '#f3f4f6', border: '1px solid #d1d5db', padding: '6px 14px', borderRadius: '6px', display: 'inline-block' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6b7280', display: 'block' }}>Código de Control</span>
              <strong style={{ fontSize: '16px', color: '#2d5a27', letterSpacing: '1px' }}>{reportData.codigo_novedad_d}</strong>
            </div>
            <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#4b5563' }}>
              Fecha de Emisión: <strong>{new Date().toLocaleDateString('es-ES')}</strong>
            </p>
          </div>
        </div>

        {/* Título Central */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '20px', textTransform: 'uppercase', letterSpacing: '1px', color: '#111827' }}>
            Informe Oficial de Operación / Novedad
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
            Documento de Constancia y Trazabilidad Operacional
          </p>
        </div>

        {/* Ficha Resumen de la Operación */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '13px' }}>
          <tbody>
            <tr style={{ background: '#f9fafb' }}>
              <td style={{ border: '1px solid #e5e7eb', padding: '10px 14px', fontWeight: 'bold', width: '25%', color: '#374151' }}>Tipo de Operación:</td>
              <td style={{ border: '1px solid #e5e7eb', padding: '10px 14px', width: '25%' }}>{reportData.tipo_novedad_d}</td>
              <td style={{ border: '1px solid #e5e7eb', padding: '10px 14px', fontWeight: 'bold', width: '25%', color: '#374151' }}>Estatus del Viaje:</td>
              <td style={{ border: '1px solid #e5e7eb', padding: '10px 14px', width: '25%', fontWeight: 'bold', color: reportData.estatus === 'Realizado' ? '#166534' : '#b45309' }}>
                {reportData.estatus}
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #e5e7eb', padding: '10px 14px', fontWeight: 'bold', color: '#374151' }}>Fecha de Ejecución:</td>
              <td style={{ border: '1px solid #e5e7eb', padding: '10px 14px' }}>{formatDate(reportData.fecha_novedad_d)}</td>
              <td style={{ border: '1px solid #e5e7eb', padding: '10px 14px', fontWeight: 'bold', color: '#374151' }}>Hora de Salida:</td>
              <td style={{ border: '1px solid #e5e7eb', padding: '10px 14px' }}>{reportData.hora_novedad_d || 'N/A'}</td>
            </tr>
            <tr style={{ background: '#f9fafb' }}>
              <td style={{ border: '1px solid #e5e7eb', padding: '10px 14px', fontWeight: 'bold', color: '#374151' }}>Ruta / Ubicación:</td>
              <td style={{ border: '1px solid #e5e7eb', padding: '10px 14px' }} colSpan={3}>
                <strong>{reportData.ubicacion_novedad_d}</strong>
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #e5e7eb', padding: '10px 14px', fontWeight: 'bold', color: '#374151' }}>Cliente Beneficiario:</td>
              <td style={{ border: '1px solid #e5e7eb', padding: '10px 14px' }}>{reportData.cliente_nombre || 'General / Sin Asignar'}</td>
              <td style={{ border: '1px solid #e5e7eb', padding: '10px 14px', fontWeight: 'bold', color: '#374151' }}>Costo / Flete:</td>
              <td style={{ border: '1px solid #e5e7eb', padding: '10px 14px', fontWeight: 'bold', fontSize: '14px', color: '#111827' }}>
                ${Number(reportData.precio || 0).toFixed(2)} USD
              </td>
            </tr>
            <tr style={{ background: '#f9fafb' }}>
              <td style={{ border: '1px solid #e5e7eb', padding: '10px 14px', fontWeight: 'bold', color: '#374151' }}>Unidad de Transporte:</td>
              <td style={{ border: '1px solid #e5e7eb', padding: '10px 14px' }}>Placa: <strong>{reportData.indicativo_unidad || 'No especificada'}</strong></td>
              <td style={{ border: '1px solid #e5e7eb', padding: '10px 14px', fontWeight: 'bold', color: '#374151' }}>Chofer Responsable:</td>
              <td style={{ border: '1px solid #e5e7eb', padding: '10px 14px' }}>C.I: <strong>{reportData.cedula_funcionario}</strong></td>
            </tr>
          </tbody>
        </table>

        {/* Declaración Formal */}
        <div style={{ background: '#f9fafb', borderLeft: '4px solid #2d5a27', padding: '14px 18px', marginBottom: '28px', fontSize: '13px', lineHeight: '1.6' }}>
          <p style={{ margin: 0, textAlign: 'justify' }}>
            Por medio de la presente, se certifica que la operación de transporte identificada con el código <strong>{reportData.codigo_novedad_d}</strong> fue despachada en la fecha indicada con ruta <strong>{reportData.ubicacion_novedad_d}</strong> bajo la conducción del titular de la cédula <strong>{reportData.cedula_funcionario}</strong> en la unidad <strong>{reportData.indicativo_unidad}</strong>, cumpliendo con los estándares de seguridad y entrega de AGRO-SERVICIOS C.A.
          </p>
        </div>

        {/* Bloque de Firmas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', marginTop: '60px', textAlign: 'center' }}>
          <div>
            <div style={{ borderTop: '1px solid #000000', paddingTop: '8px', width: '80%', margin: '0 auto' }}>
              <p style={{ margin: '0', fontWeight: 'bold', fontSize: '13px' }}>Firma del Chofer / Funcionario</p>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#4b5563' }}>C.I: {reportData.cedula_funcionario}</p>
            </div>
          </div>
          <div>
            <div style={{ borderTop: '1px solid #000000', paddingTop: '8px', width: '80%', margin: '0 auto' }}>
              <p style={{ margin: '0', fontWeight: 'bold', fontSize: '13px' }}>Gerencia de Operaciones</p>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#4b5563' }}>Firma y Sello Autorizado</p>
            </div>
          </div>
        </div>

        {/* Pie de Página Oficial */}
        <div style={{ marginTop: '50px', borderTop: '1px solid #e5e7eb', paddingTop: '10px', textAlign: 'center', fontSize: '11px', color: '#9ca3af' }}>
          Documento generado automáticamente por el Sistema de Gestión Agro-Servicios. Válido para fines administrativos y auditoría.
        </div>
      </div>
    )}
    </>
  );
}
