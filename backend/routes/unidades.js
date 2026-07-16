const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar todos
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM equipos');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener unidades' });
  }
});

// Crear
router.post('/', async (req, res) => {
  const { codigo, tipo, nombre, marca, modelo, tamano } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO equipos (codigo_equipo, tipo_equipo, nombre_equipo, marca_equipo, modelo_equipo, tamano_equipo) VALUES (?, ?, ?, ?, ?, ?)',
      [codigo, tipo, nombre, marca, modelo, tamano]
    );
    res.status(201).json({ id: result.insertId, message: 'Creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear unidad' });
  }
});

// Actualizar
router.put('/:id', async (req, res) => {
  const { codigo, tipo, nombre, marca, modelo, tamano } = req.body;
  try {
    await db.query(
      'UPDATE equipos SET codigo_equipo=?, tipo_equipo=?, nombre_equipo=?, marca_equipo=?, modelo_equipo=?, tamano_equipo=? WHERE id_equipo=?',
      [codigo, tipo, nombre, marca, modelo, tamano, req.params.id]
    );
    res.json({ message: 'Actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar unidad' });
  }
});

// Eliminar
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM equipos WHERE id_equipo = ?', [req.params.id]);
    res.json({ message: 'Eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar unidad' });
  }
});

// Cambiar estado
router.patch('/:id/estado', async (req, res) => {
  const { estado } = req.body;
  try {
    await db.query('UPDATE equipos SET estado_equipo = ? WHERE id_equipo = ?', [estado ? 1 : 0, req.params.id]);
    res.json({ message: 'Estado actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

module.exports = router;
