const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Secret for JWT
const JWT_SECRET = 'agro_servicios_secret_key_123';

const md5 = (text) => crypto.createHash('md5').update(text.toString()).digest('hex');

// Auth Route
router.post('/login', async (req, res) => {
  const { usuario, clave } = req.body;
  
  if (!usuario || !clave) {
    return res.status(400).json({ error: 'Usuario y clave requeridos' });
  }

  try {
    const hashedClave = md5(clave);
    const [rows] = await db.query('SELECT * FROM seguridad WHERE usuario = ? AND clave = ?', [usuario, hashedClave]);
    
    if (rows.length > 0) {
      const user = rows[0];
      const token = jwt.sign(
        { id: user.id, role: user.privilegio }, 
        JWT_SECRET, 
        { expiresIn: '8h' }
      );
      
      res.json({
        message: 'Login exitoso',
        token,
        user: {
          id: user.id,
          username: user.usuario,
          role: user.privilegio,
          perm_clientes: user.perm_clientes,
          perm_operaciones: user.perm_operaciones,
          perm_unidades: user.perm_unidades,
          perm_operadores: user.perm_operadores,
          perm_costos: user.perm_costos
        }
      });
    } else {
      res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Registrar nuevo usuario desde el Login
router.post('/register', async (req, res) => {
  const { usuario, clave, email, pregunta, respuesta } = req.body;
  
  if (!usuario || !clave || !email) {
    return res.status(400).json({ error: 'Usuario, clave y correo son requeridos' });
  }

  // Validar longitud de la clave
  if (clave.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }

  // Validar formato del correo
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'El formato del correo no es válido' });
  }

  try {
    const [existing] = await db.query('SELECT * FROM seguridad WHERE usuario = ?', [usuario]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }
    
    // Privilegio por defecto 'U' (Usuario)
    const hashedClave = md5(clave);
    await db.query(
      'INSERT INTO seguridad (usuario, clave, email, pregunta, respuesta, privilegio) VALUES (?, ?, ?, ?, ?, ?)',
      [usuario, hashedClave, email, pregunta || '', respuesta || '', 'U']
    );
    res.status(201).json({ message: 'Usuario registrado exitosamente. Ahora puede iniciar sesión.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

const { verifyToken } = require('../middleware/auth');

// Obtener pregunta secreta (Ya no se usa la pregunta, solo verificamos que el usuario exista)
router.post('/forgot-password', async (req, res) => {
  const { usuario } = req.body;
  try {
    const [rows] = await db.query('SELECT id FROM seguridad WHERE usuario = ?', [usuario]);
    if (rows.length > 0) {
      res.json({ message: 'Usuario encontrado. Proceda a ingresar su código de recuperación.' });
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Restablecer clave con codigo_recuperacion
router.post('/reset-password', async (req, res) => {
  const { usuario, codigo, nuevaClave } = req.body;
  if (!nuevaClave || nuevaClave.length < 8) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' });
  }
  if (!codigo) {
    return res.status(400).json({ error: 'El código de recuperación es requerido' });
  }
  try {
    const [rows] = await db.query('SELECT * FROM seguridad WHERE usuario = ? AND codigo_recuperacion = ?', [usuario, codigo]);
    if (rows.length > 0) {
      const hashedNuevaClave = md5(nuevaClave);
      await db.query('UPDATE seguridad SET clave = ? WHERE usuario = ?', [hashedNuevaClave, usuario]);
      res.json({ message: 'Contraseña restablecida exitosamente' });
    } else {
      res.status(401).json({ error: 'El código de recuperación es incorrecto' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Cambiar clave desde el perfil (requiere estar logueado)
router.post('/change-password', verifyToken, async (req, res) => {
  const { actualClave, nuevaClave } = req.body;
  const userId = req.user.id;
  if (!nuevaClave || nuevaClave.length < 8) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' });
  }
  try {
    const hashedActual = md5(actualClave);
    const [rows] = await db.query('SELECT * FROM seguridad WHERE id = ? AND clave = ?', [userId, hashedActual]);
    if (rows.length > 0) {
      const hashedNueva = md5(nuevaClave);
      await db.query('UPDATE seguridad SET clave = ? WHERE id = ?', [hashedNueva, userId]);
      res.json({ message: 'Contraseña actualizada exitosamente' });
    } else {
      res.status(401).json({ error: 'La contraseña actual es incorrecta' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
