/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: clientes
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `clientes` (
  `id_cliente` int(11) NOT NULL AUTO_INCREMENT,
  `razon_social` varchar(255) COLLATE utf8_spanish2_ci NOT NULL,
  `rif` varchar(50) COLLATE utf8_spanish2_ci NOT NULL,
  `domicilio_fiscal` text COLLATE utf8_spanish2_ci,
  `telefono_cliente` varchar(50) COLLATE utf8_spanish2_ci DEFAULT NULL,
  `estado_cliente` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `rif` (`rif`)
) ENGINE = MyISAM AUTO_INCREMENT = 3 DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: costos_mantenimiento
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `costos_mantenimiento` (
  `id_costo` int(11) NOT NULL AUTO_INCREMENT,
  `unidad_placa` varchar(50) COLLATE utf8_spanish2_ci DEFAULT NULL,
  `chofer_cedula` varchar(20) COLLATE utf8_spanish2_ci DEFAULT NULL,
  `fecha` date NOT NULL,
  `descripcion` varchar(255) COLLATE utf8_spanish2_ci NOT NULL,
  `costo` decimal(10, 2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id_costo`)
) ENGINE = MyISAM AUTO_INCREMENT = 4 DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: equipos
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `equipos` (
  `id_equipo` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_equipo` varchar(50) COLLATE utf8_spanish2_ci DEFAULT NULL,
  `tipo_equipo` char(100) COLLATE utf8_spanish2_ci DEFAULT NULL,
  `nombre_equipo` char(100) COLLATE utf8_spanish2_ci DEFAULT NULL,
  `marca_equipo` char(100) COLLATE utf8_spanish2_ci DEFAULT NULL,
  `modelo_equipo` char(100) COLLATE utf8_spanish2_ci DEFAULT NULL,
  `tamano_equipo` char(100) COLLATE utf8_spanish2_ci DEFAULT NULL,
  `estado_equipo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_equipo`)
) ENGINE = InnoDB AUTO_INCREMENT = 4 DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: funcionarios
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `funcionarios` (
  `id_funcionario` int(11) NOT NULL AUTO_INCREMENT,
  `cedula_funcionario` varchar(20) COLLATE utf8_spanish2_ci DEFAULT NULL,
  `nombre_funcionario` char(100) COLLATE utf8_spanish2_ci DEFAULT NULL,
  `apellido_funcionario` char(100) COLLATE utf8_spanish2_ci DEFAULT NULL,
  `telefono_funcionario` char(12) COLLATE utf8_spanish2_ci DEFAULT NULL,
  `direccion_funcionario` char(200) COLLATE utf8_spanish2_ci DEFAULT NULL,
  `cargo_funcionario` char(100) COLLATE utf8_spanish2_ci DEFAULT NULL,
  `estado_funcionario` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_funcionario`)
) ENGINE = InnoDB AUTO_INCREMENT = 6 DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: novedades_diarias
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `novedades_diarias` (
  `id_novedad_d` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_novedad_d` char(20) COLLATE utf8_spanish2_ci DEFAULT NULL,
  `tipo_novedad_d` char(100) COLLATE utf8_spanish2_ci DEFAULT NULL,
  `fecha_novedad_d` date DEFAULT NULL,
  `hora_novedad_d` time DEFAULT NULL,
  `ubicacion_novedad_d` char(200) COLLATE utf8_spanish2_ci DEFAULT NULL,
  `nombre_atendido` char(100) COLLATE utf8_spanish2_ci DEFAULT NULL,
  `apellido_atendido` char(100) COLLATE utf8_spanish2_ci DEFAULT NULL,
  `cedula_atendido` varchar(20) COLLATE utf8_spanish2_ci DEFAULT NULL,
  `indicativo_unidad` varchar(50) COLLATE utf8_spanish2_ci DEFAULT NULL,
  `cedula_funcionario` varchar(20) COLLATE utf8_spanish2_ci DEFAULT NULL,
  `estatus` enum('Pendiente', 'En proceso', 'Realizado') COLLATE utf8_spanish2_ci DEFAULT 'Pendiente',
  `precio` decimal(10, 2) DEFAULT '0.00',
  `cliente_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_novedad_d`)
) ENGINE = InnoDB AUTO_INCREMENT = 4 DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: seguridad
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `seguridad` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario` char(40) COLLATE utf8_spanish2_ci DEFAULT NULL,
  `clave` char(40) COLLATE utf8_spanish2_ci DEFAULT NULL,
  `email` char(40) COLLATE utf8_spanish2_ci DEFAULT NULL,
  `pregunta` char(40) COLLATE utf8_spanish2_ci DEFAULT NULL,
  `respuesta` char(40) COLLATE utf8_spanish2_ci DEFAULT NULL,
  `privilegio` char(1) COLLATE utf8_spanish2_ci DEFAULT NULL,
  `perm_clientes` tinyint(1) DEFAULT '0',
  `perm_operaciones` tinyint(1) DEFAULT '0',
  `perm_unidades` tinyint(1) DEFAULT '0',
  `perm_operadores` tinyint(1) DEFAULT '0',
  `perm_costos` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 5 DEFAULT CHARSET = utf8 COLLATE = utf8_spanish2_ci;

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: clientes
# ------------------------------------------------------------

INSERT INTO
  `clientes` (
    `id_cliente`,
    `razon_social`,
    `rif`,
    `domicilio_fiscal`,
    `telefono_cliente`,
    `estado_cliente`
  )
VALUES
  (1, 'Guyana', 'J50246896', 'Puerto Ordaz', NULL, 1);
INSERT INTO
  `clientes` (
    `id_cliente`,
    `razon_social`,
    `rif`,
    `domicilio_fiscal`,
    `telefono_cliente`,
    `estado_cliente`
  )
VALUES
  (2, 'X', 'J11542447', 'el vigia', NULL, 1);

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: costos_mantenimiento
# ------------------------------------------------------------

INSERT INTO
  `costos_mantenimiento` (
    `id_costo`,
    `unidad_placa`,
    `chofer_cedula`,
    `fecha`,
    `descripcion`,
    `costo`
  )
VALUES
  (
    1,
    '1598',
    'Juan',
    '2026-07-13',
    'Cambio de aceite de caja',
    20.00
  );
INSERT INTO
  `costos_mantenimiento` (
    `id_costo`,
    `unidad_placa`,
    `chofer_cedula`,
    `fecha`,
    `descripcion`,
    `costo`
  )
VALUES
  (
    2,
    '1I8HS1H',
    'Juanito',
    '2026-07-15',
    'AlineaciÃ³n',
    50.00
  );
INSERT INTO
  `costos_mantenimiento` (
    `id_costo`,
    `unidad_placa`,
    `chofer_cedula`,
    `fecha`,
    `descripcion`,
    `costo`
  )
VALUES
  (
    3,
    '1598',
    'Edd',
    '2026-07-14',
    'Aceite de motor',
    20.00
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: equipos
# ------------------------------------------------------------

INSERT INTO
  `equipos` (
    `id_equipo`,
    `codigo_equipo`,
    `tipo_equipo`,
    `nombre_equipo`,
    `marca_equipo`,
    `modelo_equipo`,
    `tamano_equipo`,
    `estado_equipo`
  )
VALUES
  (1, '15482', 'xd', 'xd', 'asdx', 'axsa', 'asxasx', 1);
INSERT INTO
  `equipos` (
    `id_equipo`,
    `codigo_equipo`,
    `tipo_equipo`,
    `nombre_equipo`,
    `marca_equipo`,
    `modelo_equipo`,
    `tamano_equipo`,
    `estado_equipo`
  )
VALUES
  (
    2,
    '1598',
    'Camion',
    'Chevrolet',
    'Mack',
    'Granite',
    'Pesado',
    1
  );
INSERT INTO
  `equipos` (
    `id_equipo`,
    `codigo_equipo`,
    `tipo_equipo`,
    `nombre_equipo`,
    `marca_equipo`,
    `modelo_equipo`,
    `tamano_equipo`,
    `estado_equipo`
  )
VALUES
  (
    3,
    '1I8HS1H',
    'Camion',
    'Camion rojo',
    'Ford',
    '150',
    '2015',
    1
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: funcionarios
# ------------------------------------------------------------

INSERT INTO
  `funcionarios` (
    `id_funcionario`,
    `cedula_funcionario`,
    `nombre_funcionario`,
    `apellido_funcionario`,
    `telefono_funcionario`,
    `direccion_funcionario`,
    `cargo_funcionario`,
    `estado_funcionario`
  )
VALUES
  (2, '11111111', 'ed', 'ed', '5155', 'adada', 'adad', 1);
INSERT INTO
  `funcionarios` (
    `id_funcionario`,
    `cedula_funcionario`,
    `nombre_funcionario`,
    `apellido_funcionario`,
    `telefono_funcionario`,
    `direccion_funcionario`,
    `cargo_funcionario`,
    `estado_funcionario`
  )
VALUES
  (
    4,
    '28741787',
    'Eduin',
    'Contreras',
    '04241830710',
    'Av San isidro',
    'Chofer',
    0
  );
INSERT INTO
  `funcionarios` (
    `id_funcionario`,
    `cedula_funcionario`,
    `nombre_funcionario`,
    `apellido_funcionario`,
    `telefono_funcionario`,
    `direccion_funcionario`,
    `cargo_funcionario`,
    `estado_funcionario`
  )
VALUES
  (
    5,
    '28741787',
    'Eduin',
    'Contreras',
    '04247588100',
    'San isidro, calle 10 con Avenida 19. casa numero 18-68',
    'Supervisor',
    1
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: novedades_diarias
# ------------------------------------------------------------

INSERT INTO
  `novedades_diarias` (
    `id_novedad_d`,
    `codigo_novedad_d`,
    `tipo_novedad_d`,
    `fecha_novedad_d`,
    `hora_novedad_d`,
    `ubicacion_novedad_d`,
    `nombre_atendido`,
    `apellido_atendido`,
    `cedula_atendido`,
    `indicativo_unidad`,
    `cedula_funcionario`,
    `estatus`,
    `precio`,
    `cliente_id`
  )
VALUES
  (
    1,
    '1245',
    'asd',
    '2012-04-12',
    '19:54:00',
    'asad',
    'asda',
    'asdas',
    '11121',
    '1542',
    '1112241',
    'En proceso',
    0.00,
    NULL
  );
INSERT INTO
  `novedades_diarias` (
    `id_novedad_d`,
    `codigo_novedad_d`,
    `tipo_novedad_d`,
    `fecha_novedad_d`,
    `hora_novedad_d`,
    `ubicacion_novedad_d`,
    `nombre_atendido`,
    `apellido_atendido`,
    `cedula_atendido`,
    `indicativo_unidad`,
    `cedula_funcionario`,
    `estatus`,
    `precio`,
    `cliente_id`
  )
VALUES
  (
    2,
    'POZ150126',
    'Traslado',
    '2026-07-14',
    '14:06:00',
    'El Vigia - Puerto Ordaz',
    NULL,
    NULL,
    NULL,
    '1598',
    '28741787',
    'Realizado',
    199.99,
    1
  );
INSERT INTO
  `novedades_diarias` (
    `id_novedad_d`,
    `codigo_novedad_d`,
    `tipo_novedad_d`,
    `fecha_novedad_d`,
    `hora_novedad_d`,
    `ubicacion_novedad_d`,
    `nombre_atendido`,
    `apellido_atendido`,
    `cedula_atendido`,
    `indicativo_unidad`,
    `cedula_funcionario`,
    `estatus`,
    `precio`,
    `cliente_id`
  )
VALUES
  (
    3,
    'CCS150726',
    'FumigaciÃ³n',
    '2026-07-24',
    '21:29:00',
    'Caracas - El Vigia',
    NULL,
    NULL,
    NULL,
    '1I8HS1H',
    '28741787',
    'Pendiente',
    500.00,
    2
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: seguridad
# ------------------------------------------------------------

INSERT INTO
  `seguridad` (
    `id`,
    `usuario`,
    `clave`,
    `email`,
    `pregunta`,
    `respuesta`,
    `privilegio`,
    `perm_clientes`,
    `perm_operaciones`,
    `perm_unidades`,
    `perm_operadores`,
    `perm_costos`
  )
VALUES
  (
    1,
    'admin',
    '21232f297a57a5a743894a0e4a801fc3',
    'admin@agro.com',
    NULL,
    NULL,
    'A',
    0,
    0,
    0,
    0,
    0
  );
INSERT INTO
  `seguridad` (
    `id`,
    `usuario`,
    `clave`,
    `email`,
    `pregunta`,
    `respuesta`,
    `privilegio`,
    `perm_clientes`,
    `perm_operaciones`,
    `perm_unidades`,
    `perm_operadores`,
    `perm_costos`
  )
VALUES
  (
    3,
    'edd',
    '98462ca10559975e86e39169bbda2265',
    'prueba@gmail.com',
    '',
    '',
    'U',
    0,
    0,
    0,
    0,
    0
  );
INSERT INTO
  `seguridad` (
    `id`,
    `usuario`,
    `clave`,
    `email`,
    `pregunta`,
    `respuesta`,
    `privilegio`,
    `perm_clientes`,
    `perm_operaciones`,
    `perm_unidades`,
    `perm_operadores`,
    `perm_costos`
  )
VALUES
  (
    4,
    'Victor',
    '25d55ad283aa400af464c76d713c07ad',
    'prueba2@gmail.com',
    '',
    '',
    'U',
    1,
    0,
    0,
    1,
    0
  );

/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
