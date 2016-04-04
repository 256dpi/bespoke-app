const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const btoa = require('btoa');

var appWindow = null;
var presentationWindow = null;

app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', function() {
  appWindow = new BrowserWindow({
    title: 'Bespoke',
    width: 800,
    height: 600,
    fullscreenable: false,
    webPreferences: {
      webSecurity: false
    }
  });

  appWindow.loadURL('file://' + __dirname + '/start.html');

  appWindow.webContents.on('will-navigate', function(event, file){
    event.preventDefault();
    appWindow.loadURL('file://' + __dirname + '/app.html?file=' + btoa(file));
  });
});

electron.ipcMain.on('present', function(_, file){
  if(!presentationWindow) {
    startPresentation(file);
  } else {
    presentationWindow.close();

    presentationWindow.on('closed', function() {
      presentationWindow = null;
    });
  }
});

electron.ipcMain.on('slide', function(_, id){
  appWindow.webContents.send('slide', id);
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
        webSecurity: false
      }
    });

    presentationWindow.loadURL(file);

    presentationWindow.webContents.once('dom-ready', function(){
      presentationWindow.webContents.executeJavaScript(`
        window.deck.on('activate', function(event){
          const ipcRenderer = require('electron').ipcRenderer;
          ipcRenderer.send('slide', event.index);
        });
      `);
    });
  }
}
