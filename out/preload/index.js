"use strict";
const electron = require("electron");
const preload = require("@electron-toolkit/preload");
const api = {
  invoke: (channel, ...args) => electron.ipcRenderer.invoke(channel, ...args),
  onMainMessage: (callback) => electron.ipcRenderer.on("main-to-renderer", (_, data) => callback(data)),
  // 添加事件监听器支持
  on: (channel, callback) => {
    const wrappedCallback = (_, ...args) => callback(...args);
    electron.ipcRenderer.on(channel, wrappedCallback);
    return wrappedCallback;
  },
  off: (channel, callback) => {
    electron.ipcRenderer.removeListener(channel, callback);
  },
  once: (channel, callback) => {
    electron.ipcRenderer.once(channel, (_, ...args) => callback(...args));
  }
};
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("electron", preload.electronAPI);
    electron.contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = preload.electronAPI;
  window.api = api;
}
