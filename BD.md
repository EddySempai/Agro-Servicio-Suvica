# Estructura de la Base de Datos (AGRO_SERVICIOS)

Este documento detalla las tablas y columnas actuales de la base de datos para facilitar la creación del diagrama Entidad-Relación (ER).

## Tabla: `clientes`

| Columna | Tipo de Dato | Nulo | Clave | Extra |
|---|---|---|---|---|
| **id_cliente** | `int(11)` | No | Primaria (PK) | auto_increment |
| **razon_social** | `varchar(255)` | No |  |  |
| **rif** | `varchar(50)` | No | UNI |  |
| **domicilio_fiscal** | `text` | Sí |  |  |
| **telefono_cliente** | `varchar(50)` | Sí |  |  |
| **estado_cliente** | `tinyint(1)` | Sí |  |  |

---

## Tabla: `costos_mantenimiento`

| Columna | Tipo de Dato | Nulo | Clave | Extra |
|---|---|---|---|---|
| **id_costo** | `int(11)` | No | Primaria (PK) | auto_increment |
| **unidad_placa** | `varchar(50)` | Sí |  |  |
| **chofer_cedula** | `varchar(20)` | Sí |  |  |
| **fecha** | `date` | No |  |  |
| **descripcion** | `varchar(255)` | No |  |  |
| **costo** | `decimal(10,2)` | No |  |  |

---

## Tabla: `equipos`

| Columna | Tipo de Dato | Nulo | Clave | Extra |
|---|---|---|---|---|
| **id_equipo** | `int(11)` | No | Primaria (PK) | auto_increment |
| **codigo_equipo** | `varchar(50)` | Sí |  |  |
| **tipo_equipo** | `char(100)` | Sí |  |  |
| **nombre_equipo** | `char(100)` | Sí |  |  |
| **marca_equipo** | `char(100)` | Sí |  |  |
| **modelo_equipo** | `char(100)` | Sí |  |  |
| **tamano_equipo** | `char(100)` | Sí |  |  |
| **estado_equipo** | `tinyint(1)` | Sí |  |  |

---

## Tabla: `funcionarios`

| Columna | Tipo de Dato | Nulo | Clave | Extra |
|---|---|---|---|---|
| **id_funcionario** | `int(11)` | No | Primaria (PK) | auto_increment |
| **cedula_funcionario** | `varchar(20)` | Sí |  |  |
| **nombre_funcionario** | `char(100)` | Sí |  |  |
| **apellido_funcionario** | `char(100)` | Sí |  |  |
| **telefono_funcionario** | `char(12)` | Sí |  |  |
| **direccion_funcionario** | `char(200)` | Sí |  |  |
| **cargo_funcionario** | `char(100)` | Sí |  |  |
| **estado_funcionario** | `tinyint(1)` | Sí |  |  |

---

## Tabla: `novedades_diarias`

| Columna | Tipo de Dato | Nulo | Clave | Extra |
|---|---|---|---|---|
| **id_novedad_d** | `int(11)` | No | Primaria (PK) | auto_increment |
| **codigo_novedad_d** | `char(20)` | Sí |  |  |
| **tipo_novedad_d** | `char(100)` | Sí |  |  |
| **fecha_novedad_d** | `date` | Sí |  |  |
| **hora_novedad_d** | `time` | Sí |  |  |
| **ubicacion_novedad_d** | `char(200)` | Sí |  |  |
| **nombre_atendido** | `char(100)` | Sí |  |  |
| **apellido_atendido** | `char(100)` | Sí |  |  |
| **cedula_atendido** | `varchar(20)` | Sí |  |  |
| **indicativo_unidad** | `varchar(50)` | Sí |  |  |
| **cedula_funcionario** | `varchar(20)` | Sí |  |  |
| **estatus** | `enum('Pendiente','En proceso','Realizado')` | Sí |  |  |
| **precio** | `decimal(10,2)` | Sí |  |  |
| **cliente_id** | `int(11)` | Sí |  |  |

---

## Tabla: `seguridad`

| Columna | Tipo de Dato | Nulo | Clave | Extra |
|---|---|---|---|---|
| **id** | `int(11)` | No | Primaria (PK) | auto_increment |
| **usuario** | `char(40)` | Sí |  |  |
| **clave** | `char(40)` | Sí |  |  |
| **email** | `char(40)` | Sí |  |  |
| **pregunta** | `char(40)` | Sí |  |  |
| **respuesta** | `char(40)` | Sí |  |  |
| **privilegio** | `char(1)` | Sí |  |  |
| **perm_clientes** | `tinyint(1)` | Sí |  |  |
| **perm_operaciones** | `tinyint(1)` | Sí |  |  |
| **perm_unidades** | `tinyint(1)` | Sí |  |  |
| **perm_operadores** | `tinyint(1)` | Sí |  |  |
| **perm_costos** | `tinyint(1)` | Sí |  |  |

---

