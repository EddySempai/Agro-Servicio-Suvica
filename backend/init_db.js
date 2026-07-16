const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
  try {
    // Connect to MySQL server without selecting a database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('✅ Conectado al servidor MySQL.');

    // Create Database
    const dbName = process.env.DB_NAME || 'agro_servicios';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8 COLLATE utf8_spanish2_ci;`);
    console.log(`✅ Base de datos '${dbName}' creada o ya existe.`);

    // Select Database
    await connection.changeUser({ database: dbName });

    // Create Table: equipos (Unidades)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`equipos\` (
        \`id_equipo\` int(11) NOT NULL AUTO_INCREMENT,
        \`codigo_equipo\` char(20) COLLATE utf8_spanish2_ci DEFAULT NULL,
        \`tipo_equipo\` char(100) COLLATE utf8_spanish2_ci DEFAULT NULL,
        \`nombre_equipo\` char(100) COLLATE utf8_spanish2_ci DEFAULT NULL,
        \`marca_equipo\` char(100) COLLATE utf8_spanish2_ci DEFAULT NULL,
        \`modelo_equipo\` char(100) COLLATE utf8_spanish2_ci DEFAULT NULL,
        \`tamano_equipo\` char(100) COLLATE utf8_spanish2_ci DEFAULT NULL,
        \`cantidad_equipo\` char(5) COLLATE utf8_spanish2_ci DEFAULT NULL,
        PRIMARY KEY (\`id_equipo\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;
    `);
    console.log('✅ Tabla `equipos` lista.');

    // Create Table: funcionarios (Operadores)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`funcionarios\` (
        \`id_funcionario\` int(11) NOT NULL AUTO_INCREMENT,
        \`cedula_funcionario\` char(12) COLLATE utf8_spanish2_ci DEFAULT NULL,
        \`nombre_funcionario\` char(100) COLLATE utf8_spanish2_ci DEFAULT NULL,
        \`apellido_funcionario\` char(100) COLLATE utf8_spanish2_ci DEFAULT NULL,
        \`telefono_funcionario\` char(12) COLLATE utf8_spanish2_ci DEFAULT NULL,
        \`direccion_funcionario\` char(200) COLLATE utf8_spanish2_ci DEFAULT NULL,
        \`cargo_funcionario\` char(100) COLLATE utf8_spanish2_ci DEFAULT NULL,
        PRIMARY KEY (\`id_funcionario\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;
    `);
    console.log('✅ Tabla `funcionarios` lista.');

    // Create Table: novedades_diarias (Operaciones)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`novedades_diarias\` (
        \`id_novedad_d\` int(11) NOT NULL AUTO_INCREMENT,
        \`codigo_novedad_d\` char(20) COLLATE utf8_spanish2_ci DEFAULT NULL,
        \`tipo_novedad_d\` char(100) COLLATE utf8_spanish2_ci DEFAULT NULL,
        \`fecha_novedad_d\` date DEFAULT NULL,
        \`hora_novedad_d\` time DEFAULT NULL,
        \`ubicacion_novedad_d\` char(200) COLLATE utf8_spanish2_ci DEFAULT NULL,
        \`nombre_atendido\` char(100) COLLATE utf8_spanish2_ci DEFAULT NULL,
        \`apellido_atendido\` char(100) COLLATE utf8_spanish2_ci DEFAULT NULL,
        \`cedula_atendido\` char(12) COLLATE utf8_spanish2_ci DEFAULT NULL,
        \`indicativo_unidad\` char(30) COLLATE utf8_spanish2_ci DEFAULT NULL,
        \`cedula_funcionario\` char(12) COLLATE utf8_spanish2_ci DEFAULT NULL,
        PRIMARY KEY (\`id_novedad_d\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;
    `);
    console.log('✅ Tabla `novedades_diarias` lista.');

    // Create Table: seguridad (Usuarios)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`seguridad\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`usuario\` char(40) COLLATE utf8_spanish2_ci DEFAULT NULL,
        \`clave\` char(40) COLLATE utf8_spanish2_ci DEFAULT NULL,
        \`email\` char(40) COLLATE utf8_spanish2_ci DEFAULT NULL,
        \`pregunta\` char(40) COLLATE utf8_spanish2_ci DEFAULT NULL,
        \`respuesta\` char(40) COLLATE utf8_spanish2_ci DEFAULT NULL,
        \`privilegio\` char(1) COLLATE utf8_spanish2_ci DEFAULT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;
    `);
    console.log('✅ Tabla `seguridad` lista.');

    // Insert Default Admin if table is empty
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM seguridad');
    if (rows[0].count === 0) {
      // Password 'admin' in MD5 is '21232f297a57a5a743894a0e4a801fc3'
      await connection.query(`
        INSERT INTO \`seguridad\` (\`usuario\`, \`clave\`, \`email\`, \`privilegio\`)
        VALUES ('admin', MD5('admin'), 'admin@agro.com', 'A');
      `);
      console.log('✅ Usuario administrador por defecto creado (usuario: admin, clave: admin).');
    }

    await connection.end();
    console.log('🎉 Inicialización completada exitosamente.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error);
    process.exit(1);
  }
}

initializeDatabase();
