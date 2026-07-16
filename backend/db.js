const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'agro_servicios', // Usamos esta DB por defecto para la migración
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

promisePool.getConnection()
  .then(connection => {
    console.log('✅ Conexión a Base de Datos establecida con éxito.');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Error conectando a la BD. Asegúrate de encender WampServer y de haber ejecutado "node init_db.js":', err.message);
  });

module.exports = promisePool;
