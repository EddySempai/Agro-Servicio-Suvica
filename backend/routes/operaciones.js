const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar todas (con JOIN de cliente)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT n.*, c.razon_social as cliente_nombre 
      FROM novedades_diarias n
      LEFT JOIN clientes c ON n.cliente_id = c.id_cliente
      ORDER BY n.fecha_novedad_d DESC, n.hora_novedad_d DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener operaciones' });
  }
});

// Crear
router.post('/', async (req, res) => {
  const { codigo, tipo, fecha, hora, ubicacion, nombre_atendido, apellido_atendido, cedula_atendido, indicativo_unidad, cedula_funcionario, precio, cliente_id } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO novedades_diarias 
      (codigo_novedad_d, tipo_novedad_d, fecha_novedad_d, hora_novedad_d, ubicacion_novedad_d, nombre_atendido, apellido_atendido, cedula_atendido, indicativo_unidad, cedula_funcionario, precio, cliente_id, estatus) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendiente')`,
      [codigo, tipo, fecha, hora, ubicacion, nombre_atendido, apellido_atendido, cedula_atendido, indicativo_unidad, cedula_funcionario, precio || 0, cliente_id || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Creado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear operación' });
  }
});

// Editar
router.put('/:id', async (req, res) => {
  const { codigo, tipo, fecha, hora, ubicacion, nombre_atendido, apellido_atendido, cedula_atendido, indicativo_unidad, cedula_funcionario, precio, cliente_id } = req.body;
  try {
    await db.query(
      `UPDATE novedades_diarias 
       SET codigo_novedad_d = ?, tipo_novedad_d = ?, fecha_novedad_d = ?, hora_novedad_d = ?, 
           ubicacion_novedad_d = ?, nombre_atendido = ?, apellido_atendido = ?, 
           cedula_atendido = ?, indicativo_unidad = ?, cedula_funcionario = ?,
           precio = ?, cliente_id = ?
       WHERE id_novedad_d = ?`,
      [codigo, tipo, fecha, hora, ubicacion, nombre_atendido, apellido_atendido, cedula_atendido, indicativo_unidad, cedula_funcionario, precio || 0, cliente_id || null, req.params.id]
    );
    res.json({ message: 'Actualizado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar operación' });
  }
});

// Cambiar Estatus (Solo Admin usa esto pero podemos validar en frontend/auth)
router.patch('/:id/estatus', async (req, res) => {
  const { estatus } = req.body;
  try {
    await db.query('UPDATE novedades_diarias SET estatus = ? WHERE id_novedad_d = ?', [estatus, req.params.id]);
    res.json({ message: 'Estatus actualizado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar estatus' });
  }
});

// Eliminar
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM novedades_diarias WHERE id_novedad_d = ?', [req.params.id]);
    res.json({ message: 'Eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar operación' });
  }
});

module.exports = router;
