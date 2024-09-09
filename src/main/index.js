import { app, shell, BrowserWindow, ipcMain, Menu, dialog } from 'electron'
const { exec } = require('child_process')
const sizeOf = require('image-size')
const fs = require('fs')
const { fileURLToPath } = require('url')
import { join } from 'path'
const path = require('path')
const https = require('https')
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import contextMenu from 'electron-context-menu'

// 创建文件夹
const createDir = () => {
  const projectRoot = app.getPath('appData')
  // 定义文件夹路径
  const folderPath = path.join(projectRoot, 'cat-wallpaper', 'wallpaper')

  // 检查文件夹是否存在
  if (!fs.existsSync(folderPath)) {
    // 如果文件夹不存在，创建它
    fs.mkdirSync(folderPath)
    console.log('文件夹已创建:', folderPath)
    return folderPath
  } else {
    console.log('文件夹已存在:', folderPath)
    return folderPath
  }
}

const downloadImage = (url, fileName) => {
  console.log("🚀 ~ downloadImage ~ url:", url)
  return new Promise((resolve, reject) => {
    const folderPath = createDir()
    const fileNameWithExtension = `${fileName}.jpg`
    const imagePath = path.join(folderPath, fileNameWithExtension)
    const file = fs.createWriteStream(imagePath)

    https.get(url, (response) => {
      response.pipe(file)
      file.on('finish', () => {
        file.close((err) => {
          if (err) {
            reject(`Failed to close file: ${err.message}`)
          } else {
            resolve(imagePath)
          }
        })
      })
    })
  })
}

async function downloadAndSetWallpaper(url, fileName) {
  const folderPath = createDir()
  const allFileNames = fs.readdirSync(folderPath)
  const fileNameWithExtension = `${fileName}.jpg`

  if (allFileNames.includes(fileNameWithExtension)) {
    const result = dialog.showMessageBoxSync({
      message: '文件已存在，是否覆盖？',
      buttons: ['确定', '取消']
    })
    if (result == 0) {
      console.log('文件已存在，正在覆盖')
      return downloadImage(url, fileName)
    } else {
      return Promise.resolve('文件已存在')
    }
  } else {
    const result = dialog.showMessageBoxSync({
      message: '是否下载该壁纸？',
      buttons: ['确定', '取消']
    })
    if (Number(result) === 0) {
      return downloadImage(url, fileName)
    } else {
      return Promise.resolve('取消下载')
    }
  }
}

function setWallpaperMac(imagePath) {
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
  append: (defaultActions, parameters) => [
    {
      label: '设置壁纸',
      visible: parameters.mediaType === 'image',
      click: (menuItem) => {
        parameters.srcURL = menuItem.transform
          ? menuItem.transform(parameters.srcURL)
          : parameters.srcURL
        const url = fileURLToPath(parameters.srcURL)
        setWallpaperMac(url)
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
      sandbox: false,
      // nodeIntegration: true, // 必须设置为 true 以允许文件访问
      // contextIsolation: false,
      webSecurity: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  const menuTemplate = Menu.buildFromTemplate([
    {
      label: 'Setting',
      submenu: [
        {
          label: 'Open Drawer',
          click: () => {
            mainWindow.webContents.send('open-drawer')
          }
        },
        {
          label: 'Close Drawer',
          click: () => {
            mainWindow.webContents.send('close-drawer')
          }
        },
        {
          label: 'file download',
          click: () => {
            // const projectRoot = app.getPath('appData')
            // // 定义文件夹路径
            // const folderPath = path.join(projectRoot, 'cat-wallpaper', 'wallpaper')
            // const allFileNames = fs.readdirSync(folderPath)
            // const allFilePaths = allFileNames.map((fileName) => path.join(folderPath, fileName))
            // mainWindow.webContents.send('all-fill-paths', allFilePaths)
            // ipcMain.on('downImg', (event, url) => {
            //   downloadAndSetWallpaper(url, path.basename(url, path.extname(url))).then((path) => {
            //     event.reply('downImg', path)
            //   })
            // })
            // ipcMain.
            // for (const fileName of allFileNames) {
            //   console.log(path.join(folderPath, fileName))
            // }
            // console.log('file download')
          }
        }
      ]
    }
  ])

  // 主进程发送信息到渲染进程
  mainWindow.webContents.send('set-wallpaper')

  // 注册菜单
  Menu.setApplicationMenu(menuTemplate)

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.webContents.openDevTools({
    mode: 'bottom'
  })
}

// 获取壁纸保存路径
const getWallpaperPath = () => {
  const projectRoot = app.getPath('appData')
  // 定义文件夹路径
  const folderPath = path.join(projectRoot, 'cat-wallpaper', 'wallpaper')
  // 获取文件夹下面所有的文件
  return fs.readdirSync(folderPath).map((fileName) => {
    const imgPath = path.join(folderPath, fileName)
    const stat = fs.statSync(imgPath)
    if (stat.size === 0) {
      console.log('The file is empty.')
    } else {
      const dimensions = sizeOf(imgPath)
      return {
        src: `file://${imgPath}`,
        height: dimensions.height,
        width: dimensions.width
      }
    }
  })
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

  //  渲染进程获取文件路径
  ipcMain.handle('all-file-paths', getWallpaperPath)

  ipcMain.handle('downImg', async (event, url) => {
    await downloadAndSetWallpaper(url, path.basename(url, path.extname(url))).then((allPath) => {
      console.log('>>>>', allPath)
    })
    return getWallpaperPath()
  })

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
