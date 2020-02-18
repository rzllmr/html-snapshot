
const {app, BrowserWindow, BrowserView, ipcMain} = require('electron');
const electronLocalshortcut = require('electron-localshortcut');
const fs = require('fs');
const env = require('./env.js');

let win;

function createWindow() {
  win = new BrowserWindow({
    title: 'HTML Snapshot',
    width: 800,
    height: 600,
    useContentSize: true,
    enableLargerThanScreen: true,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      devTools: true
    }
  });
  win.setMenu(null);
  win.webContents.session.clearCache(() => {});
  win.webContents.loadFile('default.html');

  let view = new BrowserView({
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      devTools: true
    }
  });
  win.setBrowserView(view);
  view.webContents.loadFile('index.html');
  view.setBounds({x: 0, y: 0, width: 220, height: 180});

  ipcMain.on('loadURL', (event, url) => {
    win.webContents.loadURL(url);
  });

  ipcMain.on('loadFile', (event, path) => {
    win.webContents.loadFile(path);
  });

  ipcMain.on('render', (event, path, width, height) => {
    capture(path, width, height);
  });

  electronLocalshortcut.register(win, 'Ctrl+Shift+I', () => {
    if (env.release) {
      win.webContents.toggleDevTools();
    } else {
      view.setBounds({x: 0, y: 0, width: 700, height: 500});
      view.webContents.openDevTools();
    }
  });

  electronLocalshortcut.register(win, 'H', () => {
    if (win.getBrowserView()) win.setBrowserView(null)
    else win.setBrowserView(view);
  });

  win.on('page-title-updated', (event) => {
    event.preventDefault();
  });

  win.on('closed', () => {
    win = null;
  });
}

function capture(path, width, height) {
  const initialSize = win.getSize();
  win.setContentSize(parseInt(width), parseInt(height));
  win.webContents.capturePage().then(data => {
    fs.writeFile(path, data.toPNG(), (error) => {
      if (error) throw error;
      console.log('image saved');
    });
  }).catch(error => {
    console.log(error)
  });;
  win.setSize(initialSize[0], initialSize[1]);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  // support macOS standard to keep application running until quit explicitly
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // support macOS standard to open a new window when none is present
  if (win === null) {
    createWindow();
  }
});
