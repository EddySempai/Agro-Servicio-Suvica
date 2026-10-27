import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DownloadCloud, Activity, Users, Truck, AlertTriangle, FileText, DollarSign, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

export default function DashboardAdmin() {
  const { user } = useOutletContext();
  const [stats, setStats] = useState([]);
  const [kpis, setKpis] = useState({ operaciones: 0, unidades: 0, operadores: 0 });
  const [loading, setLoading] = useState(true);
  const [backupLoading, setBackupLoading] = useState(false);
  const [period, setPeriod] = useState('all');
  const [filterOperador, setFilterOperador] = useState('all');
  const [filterUnidad, setFilterUnidad] = useState('all');
  const [operadoresList, setOperadoresList] = useState([]);
  const [unidadesList, setUnidadesList] = useState([]);
  const [rentabilidad, setRentabilidad] = useState({ ingresos: 0, gastos: 0, balance: 0 });
  const [pendientes, setPendientes] = useState([]);

  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        const [opRes, unRes, penRes] = await Promise.all([
          axios.get('http://localhost:3001/api/operadores'),
          axios.get('http://localhost:3001/api/unidades'),
          axios.get('http://localhost:3001/api/operaciones/pendientes')
        ]);
        setOperadoresList(opRes.data);
        setUnidadesList(unRes.data);
        setPendientes(penRes.data);
      } catch (error) {
        console.error("Error fetching filter options", error);
      }
    };
    fetchSelectData();
  }, []);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const [kpisRes, rentRes] = await Promise.all([
          axios.get(`http://localhost:3001/api/admin/estadisticas/kpis?period=${period}`),
          axios.get(`http://localhost:3001/api/admin/rentabilidad?period=${period}`)
        ]);
        setKpis(kpisRes.data);
        setRentabilidad(rentRes.data);
      } catch (error) {
        console.error("Error fetching KPIs", error);
      }
    };
    fetchKpis();
  }, [period]);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const statsRes = await axios.get(`http://localhost:3001/api/admin/estadisticas?period=${period}&operador=${filterOperador}&unidad=${filterUnidad}`);
        setStats(statsRes.data);
      } catch (error) {
        console.error("Error fetching chart data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
  }, [period, filterOperador, filterUnidad]);

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/admin/backup', {
        responseType: 'blob'
      });
      // Handle file download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup_agro_servicios_${new Date().toISOString().slice(0,10)}.sql`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error al descargar el backup", error);
      alert("Error al generar copia de seguridad");
    } finally {
      setBackupLoading(false);
    }
  };

  const handlePrintRentabilidad = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/admin/rentabilidad');
      setRentabilidad(res.data);
      setTimeout(() => {
        window.print();
      }, 500);
    } catch (error) {
      console.error("Error obteniendo rentabilidad", error);
      alert("Error al generar el reporte de contabilidad");
    }
  };

  return (
    <>
    <div className="animate-fade-in no-print" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className="glass-panel" style={{ padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Bienvenido, Administrador {user.username}</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
            Panel principal de estadísticas y mantenimiento.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select 
            className="input-base" 
            style={{ width: 'auto', padding: '8px 16px', background: 'var(--bg-primary)' }} 
            value={period} 
            onChange={e => setPeriod(e.target.value)}
          >
            <option value="all">Todo el tiempo</option>
            <option value="24h">Últimas 24 horas</option>
            <option value="7d">Últimos 7 días</option>
            <option value="1m">Último mes</option>
            <option value="3m">Últimos 3 meses</option>
            <option value="6m">Últimos 6 meses</option>
            <option value="1y">Último año</option>
          </select>
          
          <button onClick={handlePrintRentabilidad} className="btn-secondary">
            <FileText size={18} />
            Reporte de Contabilidad
          </button>
          <button onClick={handleBackup} className="btn-primary" disabled={backupLoading}>
            <DownloadCloud size={18} />
            {backupLoading ? 'Generando...' : 'Respaldo DB'}
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(34, 197, 94, 0.05)', borderColor: 'rgba(34, 197, 94, 0.2)' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowUpRight size={30} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#22c55e' }}>${Number(rentabilidad.ingresos).toFixed(2)}</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Ingresos</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowDownRight size={30} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>${Number(rentabilidad.gastos).toFixed(2)}</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Gastos de Mantenimiento</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', background: rentabilidad.balance >= 0 ? 'rgba(59, 130, 246, 0.05)' : 'rgba(239, 68, 68, 0.05)', borderColor: rentabilidad.balance >= 0 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: rentabilidad.balance >= 0 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: rentabilidad.balance >= 0 ? '#3b82f6' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={30} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: rentabilidad.balance >= 0 ? '#3b82f6' : '#ef4444' }}>${Number(rentabilidad.balance).toFixed(2)}</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Ganancia Neta (Profit)</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={30} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>{kpis.operaciones}</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Total Operaciones</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={30} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>{kpis.unidades}</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Unidades Activas</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={30} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>{kpis.operadores}</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Funcionarios</p>
          </div>
        </div>
      </div>

      {/* Operaciones Pendientes */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, marginBottom: '20px' }}>
          <AlertTriangle size={20} color="#f59e0b" />
          Operaciones Pendientes ({pendientes.length})
        </h3>
        {pendientes.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No hay viajes pendientes por los momentos.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>Fecha</th>
                  <th style={{ padding: '12px' }}>Operación</th>
                  <th style={{ padding: '12px' }}>Cliente</th>
                  <th style={{ padding: '12px' }}>Unidad</th>
                  <th style={{ padding: '12px' }}>Chofer (C.I.)</th>
                </tr>
              </thead>
              <tbody>
                {pendientes.slice(0, 10).map(op => (
                  <tr key={op.id_novedad_d} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px' }}>{new Date(op.fecha_novedad_d).toLocaleDateString('es-ES')} {op.hora_novedad_d}</td>
                    <td style={{ padding: '12px' }}><strong>{op.codigo_novedad_d}</strong><br/><span style={{ fontSize: '12px' }}>{op.tipo_novedad_d}</span></td>
                    <td style={{ padding: '12px' }}>{op.cliente_nombre || 'N/A'}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{op.indicativo_unidad}</td>
                    <td style={{ padding: '12px' }}>{op.cedula_funcionario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pendientes.length > 10 && <p style={{ textAlign: 'center', fontSize: '14px', marginTop: '10px' }}>Y {pendientes.length - 10} más. Ve al módulo de Operaciones para gestionarlas.</p>}
          </div>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Activity size={20} color="var(--accent-primary)" />
            Estadísticas de Novedades (Operaciones) por Tipo
          </h3>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <select 
              className="input-base" 
              style={{ padding: '4px 8px', width: '150px' }} 
              value={filterOperador} 
              onChange={e => setFilterOperador(e.target.value)}
            >
              <option value="all">Todo Funcionario</option>
              {operadoresList.map(o => (
                <option key={o.id_funcionario} value={o.cedula_funcionario}>{o.nombre_funcionario} {o.apellido_funcionario}</option>
              ))}
            </select>
            <select 
              className="input-base" 
              style={{ padding: '4px 8px', width: '150px' }} 
              value={filterUnidad} 
              onChange={e => setFilterUnidad(e.target.value)}
            >
              <option value="all">Toda Unidad</option>
              {unidadesList.map(u => (
                <option key={u.id_equipo} value={u.codigo_equipo}>{u.codigo_equipo} - {u.nombre_equipo}</option>
              ))}
            </select>
          </div>
        </div>
        
        {loading ? (
          <p>Cargando estadísticas...</p>
        ) : stats.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No hay datos suficientes para graficar.</p>
        ) : (
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <BarChart
                data={stats}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}
                />
                <Bar dataKey="cantidad" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

    </div>
    
    {/* Printable Section for Rentabilidad */}
    {rentabilidad && (
      <div className="print-only" style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#111827', lineHeight: '1.5' }}>
        {/* Encabezado Corporativo Oficial */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #2d5a27', paddingBottom: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img src={logoImg} alt="Logo" style={{ height: '75px', borderRadius: '6px' }} />
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#2d5a27', letterSpacing: '0.5px' }}>AGRO-SERVICIOS C.A.</h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#4b5563' }}>Departamento de Administración y Finanzas</p>
              <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#6b7280' }}>R.I.F. J-31245678-9 | Balance Operativo Consolidado</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ background: '#f3f4f6', border: '1px solid #d1d5db', padding: '6px 14px', borderRadius: '6px', display: 'inline-block' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6b7280', display: 'block' }}>Documento</span>
              <strong style={{ fontSize: '15px', color: '#2d5a27' }}>FIN-{new Date().toISOString().slice(0,10).replace(/-/g, '')}</strong>
            </div>
            <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#4b5563' }}>Fecha: <strong>{new Date().toLocaleDateString('es-ES')}</strong></p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '20px', textTransform: 'uppercase', letterSpacing: '1px', color: '#111827' }}>
            Reporte Confidencial de Rentabilidad y Balance Operativo
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
            Auditoría de Ingresos por Operaciones y Costos de Mantenimiento de Flota
          </p>
        </div>
        
        <p style={{ textAlign: 'justify', lineHeight: '1.6', fontSize: '13px', marginBottom: '24px', background: '#f9fafb', padding: '12px 16px', borderLeft: '4px solid #2d5a27' }}>
          El presente informe consolida el desempeño financiero del período seleccionado, contrastando exclusivamente los ingresos brutos generados por viajes y traslados completados (estatus "Realizado") frente a los desembolsos por concepto de repuestos, lubricantes y reparaciones mecánicas de las unidades.
        </p>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ border: '1px solid #d1d5db', padding: '12px', textAlign: 'left', fontSize: '13px' }}>Concepto Financiero</th>
              <th style={{ border: '1px solid #d1d5db', padding: '12px', textAlign: 'right', fontSize: '13px', width: '220px' }}>Monto Liquidado (USD)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #e5e7eb', padding: '12px', fontSize: '14px' }}>
                <strong>Total Ingresos por Fletes y Operaciones</strong>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Servicios de transporte efectivamente culminados</div>
              </td>
              <td style={{ border: '1px solid #e5e7eb', padding: '12px', textAlign: 'right', fontSize: '15px', color: '#166534', fontWeight: 'bold' }}>
                + ${Number(rentabilidad.ingresos).toFixed(2)}
              </td>
            </tr>
            <tr style={{ background: '#fafafa' }}>
              <td style={{ border: '1px solid #e5e7eb', padding: '12px', fontSize: '14px' }}>
                <strong>Total Egresos por Mantenimiento de Flota</strong>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Gastos de servicio técnico, partes e insumos</div>
              </td>
              <td style={{ border: '1px solid #e5e7eb', padding: '12px', textAlign: 'right', fontSize: '15px', color: '#dc2626', fontWeight: 'bold' }}>
                - ${Number(rentabilidad.gastos).toFixed(2)}
              </td>
            </tr>
            <tr style={{ background: '#f3f4f6' }}>
              <td style={{ border: '2px solid #9ca3af', padding: '14px 12px', fontSize: '15px', fontWeight: 'bold', color: '#111827' }}>
                BALANCE NETO OPERATIVO
              </td>
              <td style={{ border: '2px solid #9ca3af', padding: '14px 12px', textAlign: 'right', fontSize: '18px', fontWeight: 'bold', color: rentabilidad.balance >= 0 ? '#166534' : '#dc2626' }}>
                ${Number(rentabilidad.balance).toFixed(2)} USD
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', marginTop: '60px', textAlign: 'center' }}>
          <div>
            <div style={{ borderTop: '1px solid #000000', paddingTop: '8px', width: '80%', margin: '0 auto' }}>
              <p style={{ margin: '0', fontWeight: 'bold', fontSize: '13px' }}>Elaborado por Administración</p>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#4b5563' }}>Auditoría Interna</p>
            </div>
          </div>
          <div>
            <div style={{ borderTop: '1px solid #000000', paddingTop: '8px', width: '80%', margin: '0 auto' }}>
              <p style={{ margin: '0', fontWeight: 'bold', fontSize: '13px' }}>Gerencia General</p>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#4b5563' }}>Aprobación y Visto Bueno</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '50px', borderTop: '1px solid #e5e7eb', paddingTop: '10px', textAlign: 'center', fontSize: '11px', color: '#9ca3af' }}>
          Documento Confidencial de Uso Exclusivo de AGRO-SERVICIOS C.A.
        </div>
      </div>
    )}
    </>
  );
}
