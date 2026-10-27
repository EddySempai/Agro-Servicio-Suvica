# Casos de Uso del Sistema (AGRO-SERVICIOS)

Este documento describe las interacciones principales que los distintos actores (Administrador y Usuario) pueden tener con cada módulo del sistema.

## 👥 Actores del Sistema
1. **Administrador (Admin):** Tiene control total sobre el sistema, acceso a estadísticas financieras, y capacidad de crear, modificar o eliminar registros en todos los módulos.
2. **Usuario:** Tiene un rol operativo y de consulta. Puede visualizar la información, aplicar filtros, generar reportes y descargar archivos CSV, pero tiene el acceso restringido para modificar o eliminar datos críticos (a menos que se le asignen permisos específicos).

---

## 1. Módulo: Autenticación (Login)
### Administrador / Usuario
- **Caso de Uso:** Iniciar Sesión.
  - **Descripción:** El actor ingresa su usuario y contraseña en la pantalla principal. El sistema valida las credenciales en la base de datos y lo redirige a su Dashboard correspondiente según su rol.

---

## 2. Módulo: Inicio (Dashboard)
### Administrador
- **Caso de Uso:** Visualizar KPIs y Rentabilidad.
  - **Descripción:** Puede visualizar las tarjetas de estadísticas globales (Cantidad de operaciones, unidades activas y operadores activos).
  - **Descripción:** Puede ver el balance financiero exacto (Total de ingresos generados vs Total de gastos de mantenimiento), filtrando por períodos de tiempo (ej: últimos 7 días, último mes).
- **Caso de Uso:** Respaldar Base de Datos.
  - **Descripción:** Puede descargar un `.sql` completo de la base de datos presionando el botón de respaldo.

### Usuario
- **Caso de Uso:** Visualizar Panel Operativo.
  - **Descripción:** Tiene acceso a un panel de control simplificado con acceso rápido a los módulos, sin visibilidad de los balances financieros ni de la rentabilidad (por motivos de confidencialidad).

---

## 3. Módulo: Novedades Diarias (Operaciones)
### Administrador
- **Caso de Uso:** Gestión Completa de Operaciones.
  - **Descripción:** Puede registrar nuevas operaciones, asignar clientes, camiones, choferes y definir precios.
  - **Descripción:** Puede editar operaciones existentes por si ocurrió un error en la carga (ej: cambiar el destino).
  - **Descripción:** Puede cambiar el estatus de la operación (Pendiente, En Proceso, Realizado).
  - **Descripción:** Puede eliminar una operación errónea de manera definitiva.

### Usuario
- **Caso de Uso:** Consulta y Exportación.
  - **Descripción:** Puede buscar operaciones por código o destino.
  - **Descripción:** Puede filtrar operaciones mediante un rango de fechas ("Desde" y "Hasta") o por su estatus.
  - **Descripción:** Puede **Imprimir** informes detallados de la operación para archivo físico.
  - **Descripción:** Puede **Exportar a CSV** la información visualizada para entregar reportes en Excel.

---

## 4. Módulo: Gestión de Unidades (Equipos)
### Administrador
- **Caso de Uso:** Gestión Completa de Unidades.
  - **Descripción:** Puede dar de alta a nuevos camiones/unidades agregando su Placa, Tipo, Descripción, etc.
  - **Descripción:** Puede editar los datos de cualquier unidad registrada.
  - **Descripción:** Puede Eliminar una unidad del sistema (siempre y cuando no tenga operaciones amarradas a ella).
  - **Descripción:** Puede **Activar o Desactivar** (switch) una unidad. Si la desactiva, esta dejará de ser contada en los totales del Dashboard.

### Usuario
- **Caso de Uso:** Consulta de Unidades.
  - **Descripción:** Puede listar todas las unidades y buscarlas por Placa, Tipo o Estado (Activo/Inactivo).
  - **Descripción:** Puede exportar a CSV el listado completo de los camiones de la flota.

---

## 5. Módulo: Gestión de Operadores (Funcionarios)
### Administrador
- **Caso de Uso:** Gestión Completa de Operadores.
  - **Descripción:** Puede registrar nuevos operadores (choferes) previniendo que se agreguen Cédulas duplicadas (el sistema arroja un error si la cédula ya existe).
  - **Descripción:** Puede actualizar los datos personales y el cargo de los operadores.
  - **Descripción:** Puede **Activar o Desactivar** a un operador (por ejemplo, si el empleado está de reposo o fue despedido), evitando que siga saliendo en el conteo total del Dashboard.
  - **Descripción:** Puede Eliminar al operador definitivamente.

### Usuario
- **Caso de Uso:** Consulta de Personal.
  - **Descripción:** Puede ver el directorio de operadores y filtrar por número de Cédula o buscar a los activos/inactivos.
  - **Descripción:** Puede exportar el directorio a CSV.

---

## 6. Módulo: Directorio de Clientes
### Administrador
- **Caso de Uso:** Gestión Completa de Clientes.
  - **Descripción:** Puede crear clientes, asignando su RIF, Razón Social, Teléfono y Domicilio. (Evitando RIFs duplicados).
  - **Descripción:** Puede modificar la información en caso de mudanza o cambio de número.
  - **Descripción:** Puede **Activar o Desactivar** a los clientes que ya no formen parte de la cartera habitual.

### Usuario
- **Caso de Uso:** Consulta de Cartera de Clientes.
  - **Descripción:** Puede buscar clientes por nombre o RIF para ver si están registrados o necesitan facturación.
  - **Descripción:** Puede exportar la agenda de clientes en formato CSV.
