const express = require('express');
const router = express.Router();
const db = require('../db');

// Diccionario IATA de ciudades de Venezuela
const IATA_MAP = {
  'caracas': 'CCS',
  'maiquetia': 'CCS',
  'la guaira': 'CCS',
  'valencia': 'VLN',
  'maracaibo': 'MAR',
  'barquisimeto': 'BRM',
  'puerto ordaz': 'POZ',
  'ciudad guayana': 'POZ',
  'el vigia': 'VIG',
  'merida': 'MRD',
  'barcelona': 'BLA',
  'puerto la cruz': 'BLA',
  'porlamar': 'PMV',
  'margarita': 'PMV',
  'maturin': 'MUN',
  'san cristobal': 'SCI',
  'san antonio': 'SVZ',
  'cumana': 'CUM',
  'barinas': 'BNS',
  'acarigua': 'AGV',
  'araure': 'AGV',
  'guanare': 'GUE',
  'maracay': 'MYC',
  'coro': 'CZE',
  'punto fijo': 'LSP',
  'las piedras': 'LSP',
  'trujillo': 'TNJ',
  'valera': 'VLV',
  'san fernando': 'SFD',
  'apure': 'SFD',
  'san juan de los morros': 'SJM',
  'calabozo': 'CLZ',
  'valle de la pascua': 'VDP',
  'tucupita': 'TUV',
  'puerto ayacucho': 'PYH',
  'cabimas': 'CBS',
  'ciudad bolivar': 'CBL',
  'anaco': 'AAO',
  'el tigre': 'ELX',
  'carupano': 'CUP',
  'guatire': 'CCS',
  'guarenas': 'CCS',
  'los teques': 'CCS'
};

function getIataCode(cityName) {
  if (!cityName) return 'CCS';
  const normalized = cityName.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  if (IATA_MAP[normalized]) {
    return IATA_MAP[normalized];
  }

  for (const [key, code] of Object.entries(IATA_MAP)) {
    if (normalized.includes(key)) {
      return code;
    }
  }

  const clean = normalized.replace(/[^a-z0-9]/g, '').toUpperCase();
  if (clean.length >= 3) {
    return clean.slice(0, 3);
  }
  return clean.padEnd(3, 'X');
}

function getDayMonthString(dateStr) {
  if (!dateStr) {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${day}${month}`;
  }
  const parts = dateStr.split('-');
  if (parts.length >= 3) {
    const day = parts[2].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    return `${day}${month}`;
  }
  return '0101';
}

// Listar todas (con JOIN de cliente)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT n.*, c.razon_social as cliente_nombre 
      FROM novedades_diarias n
      LEFT JOIN clientes c ON n.cliente_id = c.id_cliente
      ORDER BY n.fecha_novedad_d DESC, n.hora_novedad_d DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener operaciones' });
  }
});

// Listar pendientes
router.get('/pendientes', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT n.*, c.razon_social as cliente_nombre 
      FROM novedades_diarias n
      LEFT JOIN clientes c ON n.cliente_id = c.id_cliente
      WHERE n.estatus = 'Pendiente'
      ORDER BY n.fecha_novedad_d ASC, n.hora_novedad_d ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener operaciones pendientes' });
  }
});

// Previsualizar Código Automático
router.get('/preview-codigo', async (req, res) => {
  const { origen, fecha } = req.query;
  const iata = getIataCode(origen);
  const dayMonth = getDayMonthString(fecha);
  const prefix = `${iata}${dayMonth}`;

  try {
    const [existing] = await db.query(
      'SELECT codigo_novedad_d FROM novedades_diarias WHERE codigo_novedad_d LIKE ?',
      [`${prefix}%`]
    );
    let maxSeq = 0;
    for (const row of existing) {
      const code = row.codigo_novedad_d || '';
      if (code.startsWith(prefix)) {
        const suffix = code.slice(prefix.length);
        const num = parseInt(suffix, 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    }
    const seq = String(maxSeq + 1).padStart(2, '0');
    res.json({ codigo: `${prefix}${seq}` });
  } catch (error) {
    res.json({ codigo: `${prefix}01` });
  }
});

// Crear
router.post('/', async (req, res) => {
  const { tipo, fecha, hora, origen, destino, ubicacion, nombre_atendido, apellido_atendido, cedula_atendido, indicativo_unidad, cedula_funcionario, precio, cliente_id } = req.body;
  try {
    const finalUbicacion = (origen && destino) ? `${origen.trim()} - ${destino.trim()}` : (ubicacion || origen || destino || 'No especificada');
    const origenCity = origen || (finalUbicacion.includes(' - ') ? finalUbicacion.split(' - ')[0] : finalUbicacion);

    const iata = getIataCode(origenCity);
    const dayMonth = getDayMonthString(fecha);
    const prefix = `${iata}${dayMonth}`;

    const [existing] = await db.query(
      'SELECT codigo_novedad_d FROM novedades_diarias WHERE codigo_novedad_d LIKE ?',
      [`${prefix}%`]
    );
    let maxSeq = 0;
    for (const row of existing) {
      const code = row.codigo_novedad_d || '';
      if (code.startsWith(prefix)) {
        const suffix = code.slice(prefix.length);
        const num = parseInt(suffix, 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    }
    const seq = String(maxSeq + 1).padStart(2, '0');
    const generatedCode = `${prefix}${seq}`;

    const [result] = await db.query(
      `INSERT INTO novedades_diarias 
      (codigo_novedad_d, tipo_novedad_d, fecha_novedad_d, hora_novedad_d, ubicacion_novedad_d, nombre_atendido, apellido_atendido, cedula_atendido, indicativo_unidad, cedula_funcionario, precio, cliente_id, estatus) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendiente')`,
      [generatedCode, tipo, fecha, hora, finalUbicacion, nombre_atendido, apellido_atendido, cedula_atendido, indicativo_unidad, cedula_funcionario, precio || 0, cliente_id || null]
    );

    res.status(201).json({ id: result.insertId, codigo: generatedCode, message: 'Creado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear operación' });
  }
});

// Editar
router.put('/:id', async (req, res) => {
  const { tipo, fecha, hora, origen, destino, ubicacion, nombre_atendido, apellido_atendido, cedula_atendido, indicativo_unidad, cedula_funcionario, precio, cliente_id } = req.body;
  try {
    const finalUbicacion = (origen && destino) ? `${origen.trim()} - ${destino.trim()}` : (ubicacion || origen || destino || 'No especificada');

    await db.query(
      `UPDATE novedades_diarias 
       SET tipo_novedad_d = ?, fecha_novedad_d = ?, hora_novedad_d = ?, 
           ubicacion_novedad_d = ?, nombre_atendido = ?, apellido_atendido = ?, 
           cedula_atendido = ?, indicativo_unidad = ?, cedula_funcionario = ?,
           precio = ?, cliente_id = ?
       WHERE id_novedad_d = ?`,
      [tipo, fecha, hora, finalUbicacion, nombre_atendido, apellido_atendido, cedula_atendido, indicativo_unidad, cedula_funcionario, precio || 0, cliente_id || null, req.params.id]
    );
    res.json({ message: 'Actualizado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar operación' });
  }
});

// Cambiar Estatus (Solo Admin usa esto pero podemos validar en frontend/auth)
router.patch('/:id/estatus', async (req, res) => {
  const { estatus } = req.body;
  try {
    await db.query('UPDATE novedades_diarias SET estatus = ? WHERE id_novedad_d = ?', [estatus, req.params.id]);
    res.json({ message: 'Estatus actualizado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar estatus' });
  }
});

// Eliminar
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM novedades_diarias WHERE id_novedad_d = ?', [req.params.id]);
    res.json({ message: 'Eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar operación' });
  }
});

module.exports = router;
