// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require("electron");

ipcRenderer.on("new-item-success", (e, newItem) => {
  if (newItem) {
    console.log(newItem);
  }
});

const renderer =  {
  // openModal: () => ipcRenderer.send('open-modal'),
  openModal: () => ipcRenderer.send("modal-event", { type: "show" }),
  closeModal: () => ipcRenderer.send("modal-event", { type: "hide" }),
  submitUrl: (url) => ipcRenderer.send("modal-event", { type: "submit", url }),
}

contextBridge.exposeInMainWorld("electronAPI",renderer);
