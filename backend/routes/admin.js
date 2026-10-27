const express = require('express');
const router = express.Router();
const db = require('../db');
const path = require('path');
const fs = require('fs');

const getPeriodCondition = (period, dateColumn) => {
  if (!period || period === 'all') return '1=1';
  switch (period) {
    case '24h': return `${dateColumn} >= datetime('now', '-1 day')`;
    case '7d': return `${dateColumn} >= datetime('now', '-7 days')`;
    case '1m': return `${dateColumn} >= datetime('now', '-1 month')`;
    case '3m': return `${dateColumn} >= datetime('now', '-3 months')`;
    case '6m': return `${dateColumn} >= datetime('now', '-6 months')`;
    case '1y': return `${dateColumn} >= datetime('now', '-1 year')`;
    default: return '1=1';
  }
};

// 1. Estadísticas de Operaciones
router.get('/estadisticas', async (req, res) => {
  const period = req.query.period || 'all';
  const operador = req.query.operador || 'all';
  const unidad = req.query.unidad || 'all';
  
  let condition = getPeriodCondition(period, 'fecha_novedad_d');
  
  if (operador !== 'all') {
    condition += ` AND cedula_funcionario = ${db.escape(operador)}`;
  }
  if (unidad !== 'all') {
    condition += ` AND indicativo_unidad = ${db.escape(unidad)}`;
  }

  try {
    const [rows] = await db.query(`
      SELECT tipo_novedad_d as tipo, COUNT(*) as cantidad 
      FROM novedades_diarias 
      WHERE ${condition}
      GROUP BY tipo_novedad_d
    `);
    
    // Convert count to number
    const formattedData = rows.map(r => ({
      name: r.tipo || 'Sin Tipo',
      cantidad: Number(r.cantidad)
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 1.5 KPIs Generales
router.get('/estadisticas/kpis', async (req, res) => {
  const period = req.query.period || 'all';
  const condition = getPeriodCondition(period, 'fecha_novedad_d');
  try {
    const [[opRows]] = await db.query(`SELECT COUNT(*) as total FROM novedades_diarias WHERE ${condition}`);
    const [[unRows]] = await db.query('SELECT COUNT(*) as total FROM equipos WHERE estado_equipo = 1');
    const [[perRows]] = await db.query('SELECT COUNT(*) as total FROM funcionarios WHERE estado_funcionario = 1');
    
    res.json({
      operaciones: opRows.total,
      unidades: unRows.total,
      operadores: perRows.total
    });
  } catch (error) {
    console.error('Error obteniendo KPIs:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

// 1.8 Reporte de Rentabilidad (Ingresos vs Gastos)
router.get('/rentabilidad', async (req, res) => {
  const period = req.query.period || 'all';
  const opCondition = getPeriodCondition(period, 'fecha_novedad_d');
  const costoCondition = getPeriodCondition(period, 'fecha');
  try {
    // Ingresos: Suma de los precios de operaciones 'Realizado'
    const [[ingresosRow]] = await db.query(`SELECT SUM(precio) as total_ingresos FROM novedades_diarias WHERE estatus = 'Realizado' AND ${opCondition}`);
    
    // Gastos: Suma de los costos de mantenimiento
    const [[gastosRow]] = await db.query(`SELECT SUM(costo) as total_gastos FROM costos_mantenimiento WHERE ${costoCondition}`);
    
    const ingresos = Number(ingresosRow.total_ingresos) || 0;
    const gastos = Number(gastosRow.total_gastos) || 0;
    const balance = ingresos - gastos;

    res.json({
      ingresos,
      gastos,
      balance,
      fecha_calculo: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error calculando rentabilidad:', error);
    res.status(500).json({ error: 'Error calculando rentabilidad' });
  }
});

// 2. Respaldo (Backup) de Base de Datos
router.get('/backup', async (req, res) => {
  const backupPath = path.join(__dirname, '..', 'database.sqlite');
  const date = new Date().toISOString().slice(0, 10);
  const backupFileName = `agro_servicios-backup-${date}.sqlite`;
  
  if (fs.existsSync(backupPath)) {
    res.download(backupPath, backupFileName);
  } else {
    res.status(404).json({ error: 'Archivo de base de datos no encontrado' });
  }
});

module.exports = router;
