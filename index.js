const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const btoa = require('btoa');
const low = require('lowdb');
const storage = require('lowdb/file-sync');
const fs = require('fs');

const db = low(app.getPath('userData') + '/db.json', { storage });

var appWindow = null;
var presentationWindow = null;

app.on('window-all-closed', function() {
  if(process.platform != 'darwin') {
    app.quit();
  } else {
    showStart();
  }
});

app.on('ready', function() {
  showStart();
});

function getTitle(file) {
  const re = /(<\s*title[^>]*>(.+?)<\s*\/\s*title)>/gi;
  const data = fs.readFileSync(file);

  const match = re.exec(data);
  if(match && match[2]) {
    return match[2];
  }
}

function showStart() {
  appWindow = new BrowserWindow({
    title: 'Bespoke',
    width: 800,
    height: 600,
    fullscreenable: false,
    webPreferences: {
      webSecurity: false
    }
  });

  const files = db('files').chain().sortBy('date').reverse().uniqBy('url').take(5);
  const recent = btoa(JSON.stringify(files.toJSON()));
  appWindow.loadURL('file://' + __dirname + '/start.html?recent=' + recent);

  appWindow.webContents.on('will-navigate', function(event, file){
    event.preventDefault();

    const title = getTitle(file.replace('file://', ''));
    if(title) {
      db('files').push({
        title: title,
        url: file,
        date: Date.now()
      });
    }

    appWindow.loadURL('file://' + __dirname + '/app.html?file=' + btoa(file));
  });
}

electron.ipcMain.on('present', function(_, file){
  if(!presentationWindow) {
    startPresentation(file);
  } else {
    presentationWindow.close();
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
  } else {
    presentationWindow = new BrowserWindow({
      width: 400,
      height: 300,
      webPreferences: {
        webSecurity: false
      }
    });
  }

  presentationWindow.loadURL('file://' + __dirname + '/present.html?file=' + btoa(file));

  presentationWindow.on('closed', function() {
    presentationWindow = null;
  });
}
