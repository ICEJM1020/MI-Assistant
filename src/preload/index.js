import { contextBridge, ipcRenderer} from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  onMainMessage: (callback) => ipcRenderer.on("main-to-renderer", (_, data) => callback(data)),
  // 添加事件监听器支持
  on: (channel, callback) => {
    const wrappedCallback = (_, ...args) => callback(...args);
    ipcRenderer.on(channel, wrappedCallback);
    return wrappedCallback;
  },
  off: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  },
  once: (channel, callback) => {
    ipcRenderer.once(channel, (_, ...args) => callback(...args));
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
    } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
