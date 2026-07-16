const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar todos los clientes
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM clientes ORDER BY razon_social ASC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// Crear cliente
router.post('/', async (req, res) => {
  const { razon_social, rif, domicilio_fiscal, telefono_cliente } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO clientes (razon_social, rif, domicilio_fiscal, telefono_cliente) VALUES (?, ?, ?, ?)',
      [razon_social, rif, domicilio_fiscal, telefono_cliente]
    );
    res.status(201).json({ id: result.insertId, message: 'Cliente creado exitosamente' });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Ya existe un cliente con ese RIF' });
    }
    res.status(500).json({ error: 'Error al crear cliente' });
  }
});

// Actualizar cliente
router.put('/:id', async (req, res) => {
  const { razon_social, rif, domicilio_fiscal, telefono_cliente } = req.body;
  try {
    await db.query(
      'UPDATE clientes SET razon_social = ?, rif = ?, domicilio_fiscal = ?, telefono_cliente = ? WHERE id_cliente = ?',
      [razon_social, rif, domicilio_fiscal, telefono_cliente, req.params.id]
    );
    res.json({ message: 'Cliente actualizado exitosamente' });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'El RIF ingresado ya pertenece a otro cliente' });
    }
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
});

// Eliminar cliente
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM clientes WHERE id_cliente = ?', [req.params.id]);
    res.json({ message: 'Cliente eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    // Controlar si hay operaciones ligadas a este cliente
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ error: 'No se puede eliminar porque tiene operaciones asociadas' });
    }
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
});

// Cambiar estado
router.patch('/:id/estado', async (req, res) => {
  const { estado } = req.body;
  try {
    await db.query('UPDATE clientes SET estado_cliente = ? WHERE id_cliente = ?', [estado ? 1 : 0, req.params.id]);
    res.json({ message: 'Estado actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

module.exports = router;
