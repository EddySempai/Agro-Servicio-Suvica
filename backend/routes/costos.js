const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar costos (con JOIN para obtener info de unidad y chofer si se quiere, o simplemente los datos directos)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM costos_mantenimiento
      ORDER BY fecha DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener costos de mantenimiento' });
  }
});

// Crear costo
router.post('/', async (req, res) => {
  const { unidad_placa, chofer_cedula, fecha, descripcion, costo } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO costos_mantenimiento (unidad_placa, chofer_cedula, fecha, descripcion, costo) VALUES (?, ?, ?, ?, ?)',
      [unidad_placa, chofer_cedula, fecha, descripcion, costo || 0]
    );
    res.status(201).json({ id: result.insertId, message: 'Costo registrado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar costo' });
  }
});

// Actualizar costo
router.put('/:id', async (req, res) => {
  const { unidad_placa, chofer_cedula, fecha, descripcion, costo } = req.body;
  try {
    await db.query(
      'UPDATE costos_mantenimiento SET unidad_placa = ?, chofer_cedula = ?, fecha = ?, descripcion = ?, costo = ? WHERE id_costo = ?',
      [unidad_placa, chofer_cedula, fecha, descripcion, costo || 0, req.params.id]
    );
    res.json({ message: 'Costo actualizado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar costo' });
  }
});

// Eliminar costo
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM costos_mantenimiento WHERE id_costo = ?', [req.params.id]);
    res.json({ message: 'Costo eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar costo' });
  }
});

module.exports = router;
