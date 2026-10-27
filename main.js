const { app, BrowserWindow } = require('electron');
const path = require('path');

// Iniciar el servidor backend
require('./backend/server.js');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    },
    title: "Agro Servicios",
    autoHideMenuBar: true
  });

  // El backend Node Express está corriendo en el puerto 3001 y sirve el frontend pre-compilado
  // O en desarrollo podemos apuntar a localhost:5173 si Vite está corriendo.
  // Pero aquí apuntaremos siempre al backend 3001 porque Express está configurado para servir el frontend.
  mainWindow.loadURL('http://localhost:3001');

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
