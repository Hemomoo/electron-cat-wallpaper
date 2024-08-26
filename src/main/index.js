import { app, shell, BrowserWindow, ipcMain } from 'electron'
const { exec } = require('child_process')
const fs = require('fs')
import { join } from 'path'
const path = require('path')
const https = require('https')
const os = require('os')
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import contextMenu from 'electron-context-menu'

async function downloadAndSetWallpaper(url, fileName) {
  return new Promise((resolve, reject) => {
    const homeDir = os.homedir()
    const fileNameWithExtension = `${fileName}.jpg`
    const imagePath = path.join(homeDir, fileNameWithExtension)

    const file = fs.createWriteStream(imagePath)
    https
      .get(url, (response) => {
        response.pipe(file)

        file.on('finish', () => {
          file.close((err) => {
            if (err) {
              reject(`Failed to close file: ${err.message}`)
              return
            }
            setWallpaper(imagePath).then(resolve).catch(reject)
          })
        })
      })
      .on('error', (err) => {
        fs.unlink(imagePath, () => {}) // Cleanup the file on error
        reject(`Failed to download image: ${err.message}`)
      })
  })
}

function setWallpaper(imagePath) {
  return new Promise((resolve, reject) => {
    const script = `
    tell application "System Events"
      set desktopCount to count of desktops
      repeat with desktopNumber from 1 to desktopCount
        tell desktop desktopNumber
          set picture to POSIX file "${imagePath}"
        end tell
      end repeat
    end tell
    `

    exec(`osascript -e '${script}'`, (error, stdout, stderr) => {
      if (error) {
        reject(`Error setting wallpaper: ${error.message}`)
        return
      }
      if (stderr) {
        reject(`Error: ${stderr}`)
        return
      }
      resolve('Wallpaper set successfully.')
    })
  })
}

contextMenu({
  menu: (actions) => [actions.separator()],
  prepend: (defaultActions, parameters) => [
    {
      label: '设置壁纸',
      // Only show it when right-clicking images
      visible: parameters.mediaType === 'image',
      onClick: (menuItem) => {
        console.log('🚀 ~ parameters:', encodeURIComponent(parameters))
        parameters.srcURL = menuItem.transform
          ? menuItem.transform(parameters.srcURL)
          : parameters.srcURL
        const url = parameters.srcURL
        if (url) {
          downloadAndSetWallpaper(url, 'wallpaper')
            .then((result) => {
              console.log(`Result: ${result}`)
            })
            .catch((error) => {
              console.log(`Error: ${error}`)
            })
        }
      }
    },
    {
      label: 'Search Google for “{selection}”',
      // Only show it when right-clicking text
      visible: parameters.selectionText.trim().length > 0,
      click: () => {
        shell.openExternal(
          `https://google.com/search?q=${encodeURIComponent(parameters.selectionText)}`
        )
      }
    }
  ],
  showSaveImageAs: true,
  showCopyImage: true,
  showInspectElement: true
})

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
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

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

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
