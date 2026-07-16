const db = require('./db');

async function updateDB() {
  try {
    console.log('Iniciando actualización de la base de datos...');

    // 1. Modificar tabla novedades_diarias (Operaciones)
    // Agregamos estatus, precio y cliente_id. Usamos IF NOT EXISTS implícito ignorando el error si ya existen.
    try {
      await db.query(`ALTER TABLE novedades_diarias ADD COLUMN estatus ENUM('Pendiente', 'En proceso', 'Realizado') DEFAULT 'Pendiente'`);
      console.log('Columna estatus añadida a novedades_diarias.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('Columna estatus ya existe.');
      else throw e;
    }

    try {
      await db.query(`ALTER TABLE novedades_diarias ADD COLUMN precio DECIMAL(10,2) DEFAULT 0.00`);
      console.log('Columna precio añadida a novedades_diarias.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('Columna precio ya existe.');
      else throw e;
    }

    try {
      await db.query(`ALTER TABLE novedades_diarias ADD COLUMN cliente_id INT DEFAULT NULL`);
      console.log('Columna cliente_id añadida a novedades_diarias.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('Columna cliente_id ya existe.');
      else throw e;
    }

    // 2. Crear tabla clientes
    await db.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id_cliente INT AUTO_INCREMENT PRIMARY KEY,
        razon_social VARCHAR(255) NOT NULL,
        rif VARCHAR(50) NOT NULL UNIQUE,
        domicilio_fiscal TEXT
      )
    `);
    console.log('Tabla clientes asegurada.');

    // 3. Crear tabla costos_mantenimiento
    await db.query(`
      CREATE TABLE IF NOT EXISTS costos_mantenimiento (
        id_costo INT AUTO_INCREMENT PRIMARY KEY,
        unidad_placa VARCHAR(50) NOT NULL,
        chofer_cedula VARCHAR(50) NOT NULL,
        fecha DATE NOT NULL,
        descripcion VARCHAR(255) NOT NULL,
        costo DECIMAL(10,2) NOT NULL DEFAULT 0.00
      )
    `);
    console.log('Tabla costos_mantenimiento asegurada.');

    console.log('¡Actualización de BD completada con éxito!');
  } catch (error) {
    console.error('Error actualizando BD:', error);
  } finally {
    process.exit();
  }
}

updateDB();
