const { app, BrowserWindow, session } = require('electron');
var events = require('events');
var eventEmitter = new events.EventEmitter();

function createWindow() {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 240,
    height: 320,
    webPreferences: {
      nodeIntegration: true,
    },
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
        'Content-Security-Policy': '*',
      },
    });
  });
}

eventEmitter.on('connectEvent', () => {
  console.log('connect even recent from main.js');
});
