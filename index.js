const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const btoa = require('btoa');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const fs = require('fs');
const request = require('request');

const storage = new FileSync(app.getPath('userData') + '/db.json');
const db = low(storage);

let appWindow = null;
let presentationWindow = null;

app.on('window-all-closed', function() {
  if(process.platform !== 'darwin') {
    app.quit();
  } else {
    showStart();
  }
});

app.on('ready', function() {
  showStart();
});

const titleRegex = /(<\s*title[^>]*>(.+?)<\s*\/\s*title)>/gi;

function getFileTitle(file, cb) {
  const match = titleRegex.exec(fs.readFileSync(file).toString());
  if(match && match[2]) {
    cb(match[2]);
  } else {
    cb();
  }
}

function getWebTitle(url, cb) {
  request(url, (err, res, body) => {
    if (err) {
      console.log(err);
      cb()
    } else {
      const match = titleRegex.exec(body);
      if(match && match[2]) {
        cb(match[2]);
      } else {
        cb();
      }
    }
  });
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

  const files = db.get('files').chain().sortBy('date').reverse().uniqBy('url').take(5);
  const recent = btoa(JSON.stringify(files.toJSON()));
  appWindow.loadURL('file://' + __dirname + '/start.html?recent=' + recent);

  appWindow.webContents.on('will-navigate', function(event, file){
    event.preventDefault();

    if(file.startsWith('http://') || file.startsWith('https://')) {
      getWebTitle(file.replace('file://', ''), function(title){
        if(title) {
          db.get('files').push({
            title: title,
            url: file,
            date: Date.now(),
            type: 'web'
          }).write();

          appWindow.loadURL('file://' + __dirname + '/app.html?file=' + btoa(file));
        }
      });
    } else if(file.startsWith('file://')) {
      getFileTitle(file, function(title){
        if(title) {
          db.get('files').push({
            title: title,
            url: file,
            date: Date.now(),
            type: 'file'
          }).write();

          appWindow.loadURL('file://' + __dirname + '/app.html?file=' + btoa(file));
        }
      });
    }
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
  let display = electron.screen.getAllDisplays();
  let second = display[1];

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
      width: 600,
      height: 400,
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
