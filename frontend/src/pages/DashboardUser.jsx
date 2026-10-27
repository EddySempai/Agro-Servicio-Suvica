import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertTriangle, Clock } from 'lucide-react';

export default function DashboardUser() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/operaciones/pendientes');
        setPendientes(res.data);
      } catch (error) {
        console.error("Error fetching pending trips", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '30px' }}>
        <h2>Bienvenido, {user.username}</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
          Desde aquí puedes monitorear tus operaciones pendientes y gestionar los viajes activos.
        </p>
      </div>

      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <AlertTriangle size={20} color="#f59e0b" />
              Operaciones Pendientes ({pendientes.length})
            </h3>
            <button onClick={() => navigate('/operaciones')} className="btn-primary" style={{ width: 'auto', padding: '8px 16px', fontSize: '14px' }}>
              Ir a Operaciones
            </button>
          </div>
          
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
      )}
    </div>
  );
}
