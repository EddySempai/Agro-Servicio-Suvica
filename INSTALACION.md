# Guía de Instalación del Sistema (WampServer)

Esta guía detalla el proceso paso a paso para instalar y ejecutar el proyecto **AGRO-SERVICIOS** en cualquier otro equipo con sistema operativo Windows utilizando WampServer.

## 🛠️ 1. Requisitos Previos

Antes de comenzar, asegúrate de tener instalados los siguientes programas en la nueva computadora:
1. **WampServer:** (Versión reciente que incluya MySQL o MariaDB). [Descargar aquí](https://www.wampserver.com/)
2. **Node.js:** (Versión LTS, se recomienda v18 o superior). [Descargar aquí](https://nodejs.org/)
3. **Git:** (Opcional, si prefieres clonar el repositorio en lugar de descargar el ZIP).

---

## 🗄️ 2. Preparar la Base de Datos (WampServer)

El proyecto incluye un archivo llamado `database.sql` en la carpeta principal que contiene toda la estructura de la base de datos y la información inicial.

1. Abre **WampServer** y asegúrate de que el icono en la barra de tareas esté en color **Verde** (todos los servicios corriendo).
2. Haz clic izquierdo en el icono de WampServer y selecciona **phpMyAdmin** (generalmente abre en `http://localhost/phpmyadmin`).
3. Inicia sesión en phpMyAdmin. Por defecto en WampServer, el usuario es `root` y la contraseña se deja en blanco (vacía).
4. Ve a la pestaña **"Bases de datos"**.
5. En el campo "Nombre de la base de datos", escribe `agro_servicios` y elige el cotejamiento `utf8mb4_general_ci` o `utf8mb4_spanish_ci`. Haz clic en **Crear**.
6. En el menú izquierdo, selecciona la base de datos `agro_servicios` que acabas de crear.
7. Ve a la pestaña **"Importar"** en la parte superior.
8. En "Seleccionar archivo", busca y selecciona el archivo `database.sql` que se encuentra en la carpeta raíz de este proyecto.
9. Ve al final de la página y haz clic en **"Importar"** (o "Go"). Al finalizar, deberías ver un mensaje de éxito en verde.

---

## ⚙️ 3. Configurar y Arrancar el Backend (Servidor)

El Backend es el motor de la base de datos construido en Node.js.

1. Abre una terminal (Símbolo del Sistema o PowerShell).
2. Navega hasta la carpeta del proyecto y entra a la subcarpeta `backend`:
   ```bash
   cd ruta\del\proyecto\AGRO-SERVICIOS-migracion\backend
   ```
3. Instala las dependencias necesarias ejecutando:
   ```bash
   npm install
   ```
4. *Paso opcional:* Si en WampServer le pusiste una contraseña distinta al usuario `root`, abre el archivo `.env` que está en la carpeta `backend` y modifica la variable `DB_PASSWORD=tu_contraseña_aqui`. Si no le pusiste contraseña (que es lo normal en Wamp), déjalo como está.
5. Inicia el servidor del backend ejecutando:
   ```bash
   node server.js
   ```
   *Deberías ver un mensaje que dice: "✅ Conexión a Base de Datos establecida con éxito." y "🚀 Servidor corriendo en puerto 3001". Mantén esta ventana de consola **abierta**.*

---

## 🖥️ 4. Configurar y Arrancar el Frontend (Interfaz Visual)

El Frontend es la interfaz gráfica donde el usuario interactúa, construida con React.

1. Abre **otra ventana de terminal** distinta (para no cerrar el backend).
2. Navega hasta la subcarpeta `frontend`:
   ```bash
   cd ruta\del\proyecto\AGRO-SERVICIOS-migracion\frontend
   ```
3. Instala las dependencias visuales ejecutando:
   ```bash
   npm install
   ```
4. Inicia la interfaz de usuario ejecutando:
   ```bash
   npm run dev
   ```
5. Al finalizar, la consola te dará un enlace local (generalmente `http://localhost:5173/`). Abre ese enlace en tu navegador web.

---

## 🎉 5. ¡Listo para Usar!

Si seguiste los pasos correctamente, verás la pantalla de inicio de sesión de AgroCultura. 

- **Usuario:** `admin`
- **Contraseña:** `admin`

*(Estas son las credenciales por defecto incrustadas en el código para iniciar pruebas rápidamente).*

¡Felicidades! Tienes el sistema corriendo completamente en otra computadora.
