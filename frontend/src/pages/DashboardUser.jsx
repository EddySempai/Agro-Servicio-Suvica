import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

export default function DashboardUser() {
  const { user } = useOutletContext();
  const [operaciones, setOperaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/operaciones');
        setOperaciones(res.data);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '30px' }}>
        <h2>Bienvenido, Usuario {user.username}</h2>
        <p style={{ color: 'var(--text-muted-dark)', marginTop: '10px' }}>
          Desde aquí puedes consultar y gestionar operaciones diarias.
        </p>
      </div>

      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Novedades / Operaciones Recientes</h3>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 16px', fontSize: '14px' }}>
              + Registrar Operación
            </button>
          </div>
          
          <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-dark)', textAlign: 'left' }}>
                <th style={{ padding: '12px 8px' }}>Fecha</th>
                <th style={{ padding: '12px 8px' }}>Operador</th>
                <th style={{ padding: '12px 8px' }}>Unidad</th>
                <th style={{ padding: '12px 8px' }}>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {operaciones.map(op => (
                <tr key={op.id} style={{ borderBottom: '1px solid var(--border-dark)' }}>
                  <td style={{ padding: '12px 8px' }}>{op.fecha}</td>
                  <td style={{ padding: '12px 8px' }}>{op.operador}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{ background: 'var(--secondary-color)', color: 'black', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                      {op.unidad}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px' }}>{op.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
