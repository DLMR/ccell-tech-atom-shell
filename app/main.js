var path = require('path');

var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');
var Menu = require('menu');
var Tray = require('tray');
var dialog   = require('dialog');

var ipc = require('ipc');

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;
var appIcon = null;

app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit();
});

app.on('ready', function() {
  appIcon = new Tray(path.join(__dirname,'app.png'));
  var contextMenu = Menu.buildFromTemplate([
    { label: 'Item1', type: 'radio' },
    { label: 'Item2', type: 'radio' },
    { label: 'Item3', type: 'radio', checked: true },
    { label: 'Item4', type: 'radio' },
  ]);
  //appIcon.setContextMenu(contextMenu);
  appIcon.setToolTip('CCell Tech Demo');

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    'min-width': 1000,
    'min-height': 700,
    resizable: true,
    frame: false,
    show: true,
    icon: path.join(__dirname,'app.png')
  });

  mainWindow.loadUrl('file://' + __dirname + '/index.html');

  mainWindow.openDevTools();

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});

ipc.on('synchronous-message', function(event, arg) {
  console.log(arg);
  event.returnValue = 'pong';
});

ipc.on('asynchronous-message', function(event, arg) {
  var files, file;

  if(arg === 'select-file') {
    if (files = dialog.showOpenDialog({
      title: 'Select Javascript File',
      filters: [{name: "JS Files", extensions:['js']}],
      properties :  ['openFile']
    })) {
      file = files[0];
      if (path.extname(file) === '.js') {
        event.sender.send('asynchronous-reply', file);
      } else {
        dialog.showMessageBox({
          type: 'warning',
          title: 'Waring',
          buttons: ['OK'],
          message: '\'' + file + '\'' + ' is not a js file.'
        });
      }
    }
  }
});
