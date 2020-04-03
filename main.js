const { app, BrowserWindow, session } = require('electron');

function createWindow() {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  win.loadFile('index.html');
  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  setSecurityPolicy(), createWindow();
});

function setSecurityPolicy() {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': '*'
      }
    });
  });
}
