// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer ,shell} = require("electron");

ipcRenderer.on("new-item-success", (e, newItem) => {
  if (newItem) {
    // Send to renderer script
    window.dispatchEvent(new CustomEvent("new-item", { detail: newItem }));
  }
});
 
const renderer =  {
  // openModal: () => ipcRenderer.send('open-modal'),
  openModal: () => ipcRenderer.send("modal-event", { type: "show" }),
  closeModal: () => ipcRenderer.send("modal-event", { type: "hide" }),
  submitUrl: (url) => ipcRenderer.send("modal-event", { type: "submit", url }),
  openReadWindow: (url,index) => ipcRenderer.send('open-read-window', url,index),
  sendToMain: (channel, data) => ipcRenderer.send(channel, data),
  onEvent: (channel, callback) => ipcRenderer.on(channel, (event, ...args) => callback(event,...args)),
  openAddModal: (callback) => ipcRenderer.on('open-add-modal', callback),
  openItem: (callback) => ipcRenderer.on('openItem', callback),
  deleteItem: (callback) => ipcRenderer.on('deleteItem', callback),
  openItemNative: (callback) => ipcRenderer.on("openItemNative", callback),
  openExternal: (url) => shell.openExternal(url),
  openSearch: (callback)=> ipcRenderer.on("openSearch",callback)
}

contextBridge.exposeInMainWorld("electronAPI",renderer);
