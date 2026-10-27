const pool = require('./db');
const fs = require('fs');
const path = require('path');

async function migrateData() {
  try {
    // 1. Agregar columna
    try {
      await pool.query('ALTER TABLE seguridad ADD COLUMN codigo_recuperacion TEXT DEFAULT "AGRO123"');
      console.log('✅ Columna codigo_recuperacion agregada.');
    } catch(e) {
      if (e.message.includes('duplicate column name')) {
         console.log('⚠️ La columna codigo_recuperacion ya existe');
      } else {
         throw e;
      }
    }

    // 2. Extraer INSERTs de database.sql
    const sqlPath = path.join(__dirname, '..', 'database.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split by lines and filter INSERT statements
    const inserts = sqlContent.split(';')
        .map(s => s.trim())
        .filter(s => s.startsWith('INSERT INTO'));

    for(let query of inserts) {
       // We need to clean up MySQL specific things if any, but INSERT INTO ... VALUES ... is standard.
       // However, we don't want to insert if data already exists, or we can just ignore errors.
       // Note: security table has MD5 hashed passwords in MySQL dump, but we use MD5 local. 
       // We can just run the inserts!
       // But MySQL uses \` backticks, SQLite supports them or "double quotes". Backticks are fine in SQLite.
       try {
           if (!query.includes('seguridad')) { // Skip seguridad to avoid messing up admin password
               await pool.query(query);
           }
       } catch (err) {
           if (!err.message.includes('UNIQUE constraint failed')) {
               console.log('Error inserting:', err.message);
           }
       }
    }
    console.log(`✅ ${inserts.length} INSERTs procesados desde database.sql`);
    
    setTimeout(() => process.exit(0), 1000);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

migrateData();
