const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

var appWindow = null;
var presentationWindow = null;

var installScript = `
  function relay(id) {
    const ipcRenderer = require('electron').ipcRenderer;
    ipcRenderer.send('slide', id);
  }

  window.deck.on('next', function(event){
    relay(event.index);
  });

  window.deck.on('prev', function(event){
    relay(event.index);
  });
`;

var controlScript = `
  const ipcRenderer = require('electron').ipcRenderer;

  ipcRenderer.on('slide', function(_, id) {
    window.deck.slide(id);
  });
`;

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
      webSecurity: false
    }
  });

  appWindow.loadURL('file://' + __dirname + '/index.html');

  appWindow.webContents.on('will-navigate', function(_, file){
    appWindow.webContents.once('dom-ready', function(){
      appWindow.webContents.executeJavaScript(installScript);

      startPresentation(file);
    });
  });
});

electron.ipcMain.on('slide', function(_, id){
  if(id != 0) {
    id = id;
  }

  presentationWindow.webContents.send('slide', id);
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
      presentationWindow.webContents.executeJavaScript(controlScript);
    });
  }
}
