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
    tipo: '',
    fecha: '',
    hora: '',
    ubicacion: '',
    indicativo_unidad: '',
    cedula_funcionario: '',
    precio: '',
    cliente_id: ''
  });

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
      setFormData({
        codigo: op.codigo_novedad_d || '',
        tipo: op.tipo_novedad_d || '',
        fecha: op.fecha_novedad_d ? op.fecha_novedad_d.slice(0, 10) : '',
        hora: op.hora_novedad_d || '',
        ubicacion: op.ubicacion_novedad_d || '',
        indicativo_unidad: op.indicativo_unidad || '',
        cedula_funcionario: op.cedula_funcionario || '',
        precio: op.precio || '',
        cliente_id: op.cliente_id || ''
      });
    } else {
      setEditId(null);
      setFormData({ 
        codigo: '', tipo: '', fecha: '', hora: '', ubicacion: '', 
        indicativo_unidad: '', cedula_funcionario: '', precio: '', cliente_id: '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:3001/api/operaciones/${editId}`, formData);
      } else {
        await axios.post('http://localhost:3001/api/operaciones', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      setErrorMessage("Ha ocurrido un error al guardar los datos de la operación.");
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
    const headers = ['Fecha', 'Hora', 'Codigo', 'Tipo', 'Ubicacion', 'Atendido', 'Cliente', 'Unidad', 'Funcionario', 'Estatus', 'Precio'];
    const csvContent = [
      headers.join(','),
      ...filteredOperaciones.map(op => [
        op.fecha_novedad_d?.slice(0,10),
        op.hora_novedad_d,
        `"${op.codigo_novedad_d}"`,
        `"${op.tipo_novedad_d}"`,
        `"${op.ubicacion_novedad_d}"`,
        `"${op.nombre_atendido} ${op.apellido_atendido}"`,
        `"${op.cliente_nombre || ''}"`,
        `"${op.indicativo_unidad}"`,
        `"${op.cedula_funcionario}"`,
        `"${op.estatus}"`,
        op.precio
      ].join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Código de Operación</label>
              <input className="input-base" required placeholder="Ej: OP-001" value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Tipo de Operación</label>
              <input className="input-base" required placeholder="Ej: Traslado, Flete..." value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} />
            </div>
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
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Destino</label>
            <input className="input-base" required placeholder="Ej: Caracas - Valencia" value={formData.ubicacion} onChange={e => setFormData({...formData, ubicacion: e.target.value})} />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
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
      <div className="print-only" style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <img src={logoImg} alt="Logo" style={{ height: '80px' }} />
          <h1 style={{ margin: 0, fontSize: '24px' }}>INFORME OFICIAL DE NOVEDAD</h1>
        </div>
        
        <p style={{ textAlign: 'justify', lineHeight: '1.6', fontSize: '16px' }}>
          Cumpliendo con nuestros deberes de llevar un registro detallado de los incidentes ocurridos, notificamos el siguiente informe:
        </p>

        <p style={{ textAlign: 'justify', lineHeight: '1.6', fontSize: '16px', marginTop: '20px' }}>
          El día <strong>{formatDate(reportData.fecha_novedad_d)}</strong> siendo las <strong>{reportData.hora_novedad_d}</strong>, 
          se presentó en la ubicación <strong>{reportData.ubicacion_novedad_d}</strong> una novedad de tipo <strong>{reportData.tipo_novedad_d}</strong> (Código: {reportData.codigo_novedad_d}).
        </p>

        <p style={{ textAlign: 'justify', lineHeight: '1.6', fontSize: '16px', marginTop: '20px' }}>
          Estatus de la Operación: <strong>{reportData.estatus}</strong> <br/>
          Cliente Relacionado: <strong>{reportData.cliente_nombre || 'N/A'}</strong> <br/>
          Costo Facturado: <strong>${Number(reportData.precio).toFixed(2)}</strong>
        </p>

        <p style={{ textAlign: 'justify', lineHeight: '1.6', fontSize: '16px', marginTop: '20px' }}>
          Durante la operación, se atendió a <strong>{reportData.nombre_atendido} {reportData.apellido_atendido}</strong> 
          (Cédula: <strong>{reportData.cedula_atendido || 'No especificada'}</strong>).
        </p>

        <p style={{ textAlign: 'justify', lineHeight: '1.6', fontSize: '16px', marginTop: '20px' }}>
          El funcionario a cargo fue titular de la cédula <strong>{reportData.cedula_funcionario}</strong>, movilizándose en la unidad con indicativo <strong>{reportData.indicativo_unidad || 'No especificada'}</strong>.
        </p>

        <div style={{ marginTop: '80px', textAlign: 'center' }}>
          <p>________________________________________</p>
          <p style={{ margin: '5px 0 0 0', fontWeight: 'bold' }}>Firma del Funcionario</p>
          <p style={{ margin: '0' }}>C.I: {reportData.cedula_funcionario}</p>
        </div>
      </div>
    )}
    </>
  );
}
