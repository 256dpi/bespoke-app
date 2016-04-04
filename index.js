const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

var appWindow = null;
var presentationWindow = null;

app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', function() {
  appWindow = new BrowserWindow({
    title: 'Bespoke Presenter',
    width: 600,
    height: 400,
    webPreferences: {
      nodeIntegration: false,
      webSecurity: false
    }
  });

  appWindow.loadURL('file://' + __dirname + '/index.html');

  appWindow.webContents.on('will-navigate', function(_, file){
    startPresentation(file);
  });
});

function startPresentation(file) {
  var display = electron.screen.getAllDisplays();
  var second = display[1];

  if(second) {
    presentationWindow = new BrowserWindow({
      width: second.bounds.width,
      height: second.bounds.height,
      x: second.bounds.x,
      y: second.bounds.y,
      frame: false,
      movable: false,
      resizable: false,
      minimizable: false,
      maximizable: false,
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: false,
        webSecurity: false
      }
    });

    presentationWindow.loadURL(file);
  }
}
