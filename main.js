const { app, BrowserWindow, session } = require('electron');
const { execFile, exec } = require('child_process');
exec(
  '/home/pi/.nvm/versions/node/v8.9.0/bin/node',
  ['/home/pi/bt-test/new.js'],
  (error, stdout, stderr) => {
    if (error) {
      throw error;
    }
    console.log(stdout);
  }
);

execFile(
  '/home/pi/.nvm/versions/node/v10.19.0/bin/tileserver-gl-light',
  ['/home/pi/mapbox-electron/osm-netherlands.mbtiles'],
  [''],
  (error, stdout, stderr) => {
    if (error) {
      throw error;
    }
    console.log(stdout);
  }
);

function createWindow() {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 300,
    height: 480,
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
