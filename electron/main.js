// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, WebContentsView } = require('electron')
// const path = require('node:path')

require('v8-compile-cache')

const createWindow = () => {
  // Create the browser window.

  const width = 1080
  const height = 810
  const mainWindow = new BrowserWindow({
    width,
    height,
    frame: false,
    resizable: false,
    center: true,
    show: false,
    webPreferences: { webviewTag: true },
  })

  mainWindow.loadURL('https://tianwen7252.github.io')

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // and load the index.html of the app.
  // mainWindow.loadFile('index.html')

  // Open the DevTools.

  // mainWindow.webContents.openDevTools({ mode: 'detach', activate: true })

  // mainWindow.webContents.openDevTools()

  // setTimeout(() => {
  //   mainWindow.webContents.openDevTools({ mode: 'detach', activate: true })
  // }, 1000)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
