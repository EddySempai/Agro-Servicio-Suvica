const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar todos
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM funcionarios ORDER BY nombre_funcionario');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener operadores' });
  }
});

// Obtener uno
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM funcionarios WHERE id_funcionario = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener operador' });
  }
});

// Crear
router.post('/', async (req, res) => {
  const { cedula, nombre, apellido, telefono, direccion, cargo } = req.body;
  try {
    const [existing] = await db.query('SELECT id_funcionario FROM funcionarios WHERE cedula_funcionario = ?', [cedula]);
    if (existing.length > 0) return res.status(400).json({ error: 'Ya existe un funcionario con esa cédula' });

    const [result] = await db.query(
      'INSERT INTO funcionarios (cedula_funcionario, nombre_funcionario, apellido_funcionario, telefono_funcionario, direccion_funcionario, cargo_funcionario) VALUES (?, ?, ?, ?, ?, ?)',
      [cedula, nombre, apellido, telefono, direccion, cargo]
    );
    res.status(201).json({ id: result.insertId, message: 'Creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear operador' });
  }
});

// Actualizar
router.put('/:id', async (req, res) => {
  const { cedula, nombre, apellido, telefono, direccion, cargo } = req.body;
  try {
    const [existing] = await db.query('SELECT id_funcionario FROM funcionarios WHERE cedula_funcionario = ? AND id_funcionario != ?', [cedula, req.params.id]);
    if (existing.length > 0) return res.status(400).json({ error: 'Ya existe otro funcionario con esa cédula' });

    await db.query(
      'UPDATE funcionarios SET cedula_funcionario=?, nombre_funcionario=?, apellido_funcionario=?, telefono_funcionario=?, direccion_funcionario=?, cargo_funcionario=? WHERE id_funcionario=?',
      [cedula, nombre, apellido, telefono, direccion, cargo, req.params.id]
    );
    res.json({ message: 'Actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar operador' });
  }
});

// Eliminar
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM funcionarios WHERE id_funcionario = ?', [req.params.id]);
    res.json({ message: 'Eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar operador' });
  }
});

// Cambiar estado
router.patch('/:id/estado', async (req, res) => {
  const { estado } = req.body;
  try {
    await db.query('UPDATE funcionarios SET estado_funcionario = ? WHERE id_funcionario = ?', [estado ? 1 : 0, req.params.id]);
    res.json({ message: 'Estado actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

module.exports = router;
