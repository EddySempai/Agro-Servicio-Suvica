const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

async function initializeDatabase() {
  try {
    const dbPath = path.join(__dirname, 'database.sqlite');
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log('✅ Conectado a SQLite.');

    // Crear tablas
    await db.exec(`
      CREATE TABLE IF NOT EXISTS clientes (
        id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
        razon_social TEXT NOT NULL,
        rif TEXT NOT NULL UNIQUE,
        domicilio_fiscal TEXT,
        telefono_cliente TEXT,
        estado_cliente INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS costos_mantenimiento (
        id_costo INTEGER PRIMARY KEY AUTOINCREMENT,
        unidad_placa TEXT,
        chofer_cedula TEXT,
        fecha DATE NOT NULL,
        descripcion TEXT NOT NULL,
        costo REAL NOT NULL DEFAULT 0.00
      );

      CREATE TABLE IF NOT EXISTS equipos (
        id_equipo INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo_equipo TEXT,
        tipo_equipo TEXT,
        nombre_equipo TEXT,
        marca_equipo TEXT,
        modelo_equipo TEXT,
        tamano_equipo TEXT,
        estado_equipo INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS funcionarios (
        id_funcionario INTEGER PRIMARY KEY AUTOINCREMENT,
        cedula_funcionario TEXT,
        nombre_funcionario TEXT,
        apellido_funcionario TEXT,
        telefono_funcionario TEXT,
        direccion_funcionario TEXT,
        cargo_funcionario TEXT,
        estado_funcionario INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS novedades_diarias (
        id_novedad_d INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo_novedad_d TEXT,
        tipo_novedad_d TEXT,
        fecha_novedad_d DATE,
        hora_novedad_d TIME,
        ubicacion_novedad_d TEXT,
        nombre_atendido TEXT,
        apellido_atendido TEXT,
        cedula_atendido TEXT,
        indicativo_unidad TEXT,
        cedula_funcionario TEXT,
        estatus TEXT DEFAULT 'Pendiente',
        precio REAL DEFAULT 0.00,
        cliente_id INTEGER
      );

      CREATE TABLE IF NOT EXISTS seguridad (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario TEXT,
        clave TEXT,
        email TEXT,
        pregunta TEXT,
        respuesta TEXT,
        privilegio TEXT,
        perm_clientes INTEGER DEFAULT 0,
        perm_operaciones INTEGER DEFAULT 0,
        perm_unidades INTEGER DEFAULT 0,
        perm_operadores INTEGER DEFAULT 0,
        perm_costos INTEGER DEFAULT 0
      );
    `);

    console.log('✅ Tablas creadas exitosamente.');

    // Insert Default Admin
    const row = await db.get('SELECT COUNT(*) as count FROM seguridad');
    if (row.count === 0) {
      const defaultPass = crypto.createHash('md5').update('admin').digest('hex');
      await db.run(`
        INSERT INTO seguridad (usuario, clave, email, privilegio, perm_clientes, perm_operaciones, perm_unidades, perm_operadores, perm_costos)
        VALUES ('admin', ?, 'admin@agro.com', 'A', 1, 1, 1, 1, 1);
      `, [defaultPass]);
      console.log('✅ Usuario administrador por defecto creado (usuario: admin, clave: admin).');
    }

    await db.close();
    console.log('🎉 Inicialización completada exitosamente.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error);
    process.exit(1);
  }
}

initializeDatabase();
