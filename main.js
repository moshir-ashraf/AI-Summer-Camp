const { app, BrowserWindow, screen } = require('electron')
const path = require('path')

// Set production environment for packaged app
if (app.isPackaged) {
  process.env.NODE_ENV = 'production';
}

// Configure dotenv for development
if (!app.isPackaged) {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
}

const expressApp = require('./server/app') 
const port = process.env.PORT || 3000

let server;
let mainWindow;

function startServer() {
  server = expressApp.listen(port, () => {
    console.log(`Express app running at http://localhost:${port}`)
  })
  
  server.on('error', (err) => {
    console.error('Server error:', err);
  });
}

function createWindow () {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width,
    height,
    fullscreen: false, // important!
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadURL(`http://localhost:${port}`)
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startServer();
  createWindow();
});

app.on('window-all-closed', () => {
  if (server) {
    server.close();
  }
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Cleanup on app quit
app.on('before-quit', () => {
  if (server) {
    server.close();
  }
});
