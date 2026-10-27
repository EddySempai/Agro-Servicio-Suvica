const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const crypto = require('crypto');
const path = require('path');

let dbPromise;

async function setupDB() {
  const dbPath = path.join(__dirname, 'database.sqlite');
  dbPromise = open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  const db = await dbPromise;
  
  // Habilitar claves foráneas
  await db.run('PRAGMA foreign_keys = ON');
  
  return db;
}

const getDb = async () => {
    if (!dbPromise) {
        await setupDB();
    }
    return dbPromise;
}

const pool = {
  query: async (sql, params) => {
    const db = await getDb();
    if (!sql) return;

    if (sql.trim().toUpperCase().startsWith('SELECT') || sql.trim().toUpperCase().startsWith('SHOW') || sql.trim().toUpperCase().startsWith('DESCRIBE')) {
      const rows = await db.all(sql, params);
      return [rows]; // Wrap in array to match mysql2 [rows]
    } else {
      const result = await db.run(sql, params);
      return [{ insertId: result.lastID, affectedRows: result.changes }];
    }
  },
  escape: (value) => {
    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "''")}'`;
    }
    return value;
  }
};

setupDB().then(() => {
    console.log('✅ Conexión a Base de Datos (SQLite) establecida con éxito.');
}).catch(err => {
    console.error('❌ Error conectando a SQLite:', err);
});

module.exports = pool;
