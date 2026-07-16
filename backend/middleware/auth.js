const jwt = require('jsonwebtoken');
const JWT_SECRET = 'agro_servicios_secret_key_123';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(403).json({ error: 'No se proporcionó un token de autenticación' });
  }

  const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

  if (!token) {
    return res.status(403).json({ error: 'Formato de token inválido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'A') {
    next();
  } else {
    res.status(403).json({ error: 'No tiene permisos de administrador para realizar esta acción' });
  }
};

module.exports = { verifyToken, verifyAdmin };
