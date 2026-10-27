const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar todos los usuarios
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, usuario, email, privilegio, perm_clientes, perm_operaciones, perm_unidades, perm_operadores, perm_costos FROM seguridad');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

const crypto = require('crypto');
const md5 = (text) => crypto.createHash('md5').update(text.toString()).digest('hex');

// Crear usuario
router.post('/', async (req, res) => {
  const { usuario, clave, email, codigo_recuperacion, privilegio, perm_clientes, perm_operaciones, perm_unidades, perm_operadores, perm_costos } = req.body;
  try {
    const hashedClave = md5(clave);
    const [result] = await db.query(
      'INSERT INTO seguridad (usuario, clave, email, codigo_recuperacion, privilegio, perm_clientes, perm_operaciones, perm_unidades, perm_operadores, perm_costos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [usuario, hashedClave, email, codigo_recuperacion || 'AGRO123', privilegio, perm_clientes ? 1 : 0, perm_operaciones ? 1 : 0, perm_unidades ? 1 : 0, perm_operadores ? 1 : 0, perm_costos ? 1 : 0]
    );
    res.status(201).json({ id: result.insertId, message: 'Usuario creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// Actualizar usuario (especialmente permisos y rol)
router.put('/:id', async (req, res) => {
  const { privilegio, perm_clientes, perm_operaciones, perm_unidades, perm_operadores, perm_costos } = req.body;
  try {
    await db.query(
      'UPDATE seguridad SET privilegio=?, perm_clientes=?, perm_operaciones=?, perm_unidades=?, perm_operadores=?, perm_costos=? WHERE id=?',
      [privilegio, perm_clientes ? 1 : 0, perm_operaciones ? 1 : 0, perm_unidades ? 1 : 0, perm_operadores ? 1 : 0, perm_costos ? 1 : 0, req.params.id]
    );
    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM seguridad WHERE id = ?', [req.params.id]);
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

module.exports = router;
