const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes Import
const authRoutes = require('./routes/auth');
const operadoresRoutes = require('./routes/operadores');
const unidadesRoutes = require('./routes/unidades');
const operacionesRoutes = require('./routes/operaciones');
const usuariosRoutes = require('./routes/usuarios');
const adminRoutes = require('./routes/admin');
const clientesRoutes = require('./routes/clientes');
const costosRoutes = require('./routes/costos');
const { verifyToken, verifyAdmin } = require('./middleware/auth');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/operadores', verifyToken, operadoresRoutes);
app.use('/api/unidades', verifyToken, unidadesRoutes);
app.use('/api/operaciones', verifyToken, operacionesRoutes);
app.use('/api/clientes', verifyToken, clientesRoutes);
app.use('/api/costos', verifyToken, verifyAdmin, costosRoutes);
app.use('/api/usuarios', verifyToken, verifyAdmin, usuariosRoutes);
app.use('/api/admin', verifyToken, verifyAdmin, adminRoutes);


// Basic check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start Server
app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
