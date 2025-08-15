import { join } from 'path'

import { app, shell, BrowserWindow, ipcMain , Menu, screen, dialog } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

import { createGlobalShortcuts } from './shortcuts'
import EventRouters from './EventRouter/EventRouters'
import routers from './EventRouter/router.list'
import { createFolder, ensureConfigFile, ensureHistoryFile } from './utils'

export const basePath = app.isPackaged ? app.getAppPath() : __dirname;
export const configPath = join(app.getPath('appData'), '.medai')

export const existedWindows = new Map()

// 导出 existedWindows 供其他模块使用
global.existedWindows = existedWindows;


function initRunning () {
  createFolder(configPath);
  createFolder(join(configPath, 'test_configs'));
  ensureConfigFile();
  ensureHistoryFile("blank");
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    
    // set the size of the window
    width: screen.getPrimaryDisplay().workAreaSize.width,
    height: screen.getPrimaryDisplay().workAreaSize.height,
    minWidth: 1280,
    minHeight: 720,
    maxWidth: 3860,
    maxHeight: 2160,
    title: "Miaa",

    show: false,
    autoHideMenuBar: true,
    // ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true, // Ensure security
      sandbox: false
    }
  })

  mainWindow.setResizable(false);

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  existedWindows.set("main", mainWindow);

  // add event routers
  const eventRouters = new EventRouters();
  eventRouters.addApi('app', app)
  eventRouters.addApi('dialog', dialog)
  eventRouters.addRouters(routers)
  ipcMain.handle('renderer-to-main', (e, data)=>{
    return eventRouters.route(data)
  })
  ipcMain.handle('renderer-to-main-async', async (e, data)=>{
    return eventRouters.async_route(data)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Initialize the running environment
  initRunning()
  // create global shortcuts
  createGlobalShortcuts();

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
