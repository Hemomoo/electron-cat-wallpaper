import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('electronAPI', {
      onCloseDrawer: (callback) =>
        ipcRenderer.on('close-drawer', (_event, value) => callback(value)),
      onOpenDrawer: (callback) => ipcRenderer.on('open-drawer', (_event, value) => callback(value)),
      // 渲染进程向主进程发送消息
      downImg: (url) => ipcRenderer.invoke('downImg', url),
      allFilePaths: () => ipcRenderer.invoke('all-file-paths')
    })
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
