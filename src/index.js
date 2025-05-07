const { app, BrowserWindow, ipcMain,Menu, shell, nativeImage, Tray } = require("electron");
const windowStateKeeper = require("electron-window-state");
const path = require("node:path");
const readItem = require("./readItem");
const reader = require("./reader");

let mainWindow, mainWindowState,splash,tray;

const iconEye = nativeImage.createFromPath(path.join(__dirname, 'eye.png'));
const iconBook = nativeImage.createFromPath(path.join(__dirname, 'book.png'));
const iconMagazine = nativeImage.createFromPath(path.join(__dirname, 'magazine.png'));
const iconTrash = nativeImage.createFromPath(path.join(__dirname, 'trash.png'));
const iconBrowser = nativeImage.createFromPath(path.join(__dirname, 'globe.png'));
const iconSearch = nativeImage.createFromPath(path.join(__dirname, 'search.png'));
const iconMain = nativeImage.createFromPath(path.join(__dirname, 'termometer.png'));


const createTray = () => {

  // console.log("My icon: ", icon.getSize());

  tray = new Tray(iconMain);

  const contextMenu = Menu.buildFromTemplate([
    { label: "BookMark", type: "checkbox" },
    { role: "quit" },
  ]);
  tray.setToolTip("Welcome to BookMark App");
  tray.setContextMenu(contextMenu);

  tray.on("click", (e) => {
    if (e.shiftKey) {
      app.quit();
    } else {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    }
  });
};

const menu = Menu.buildFromTemplate([
  {
    label: "Items",
    submenu: [
      {
        label: "Add New",
        click: () => {
          const focusedWindow = BrowserWindow.getFocusedWindow();
          focusedWindow.webContents.send("open-add-modal");
        },
        accelerator: "CmdOrCtrl+O",
        icon: iconMagazine
      },
      {
        label: "Read Item",
        accelerator: "CmdOrCtrl+Enter",
        click: () => {
          const focusedWindow = BrowserWindow.getFocusedWindow();
          focusedWindow.webContents.send("openItem");
        },
        icon:iconEye
      },
      {
        label: "Delete item",
        accelerator: "CmdOrCtrl+Backspace",
        click: () => {
          const focusedWindow = BrowserWindow.getFocusedWindow();
          focusedWindow.webContents.send("deleteItem");
        },
        icon: iconTrash
      },
      {
        label: "Open in Browser",
        accelerator: "CmdOrCtrl+Shift+O",
        click: () => {
          const focusedWindow = BrowserWindow.getFocusedWindow();
          focusedWindow.webContents.send("openItemNative");
        },
        icon:iconBrowser
      },{
        label:"Search Items",
        accelerator: "CmdOrCtrl+S",
        click: () => {
          const focusedWindow = BrowserWindow.getFocusedWindow();
          focusedWindow.webContents.send("openSearch");
        },
        icon:iconSearch
      }
    ],
  },
  {
    role: "editMenu",
  },
  {
    role: "windowMenu",
  },
  {
    role: "help",
    submenu: [
      {
        label: "Learn More",
        click: () => shell.openExternal("https://www.udemy.com/"),
      },
    ],
  },
]);


Menu.setApplicationMenu(menu);


// const isMac = process.platform === 'darwin' 

Menu.setApplicationMenu(menu)


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create splash window
  splash = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    resizable: false, // prevent resizing
    webPreferences: {
      devTools: false // optional: hide dev tools
    },
    icon: iconMain
  });
  
  splash.loadFile(
    path.join(__dirname, "splash.html")

  );


  // Load the previous state with fallback to defaults
  mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800,
  });

  // Create the browser window.
  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: true,
    },
    icon: iconMain
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Wait for main window to be ready
  mainWindow.once('ready-to-show', () => {
    // Close splash and show main window
    splash.destroy();
    mainWindow.show();
  });

  let wc = mainWindow.webContents;

  wc.on("context-menu", () => {
    const template = [
      { label: "Read Item" },
       {label:"Delete Item"}
      ];
    const menu = Menu.buildFromTemplate(template);
    menu.popup();
  });

  wc.on("unresponsive", () => {
    wc.reload();
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

const createModalWindow = (parentWindow) => {
  const modalWindow = new BrowserWindow({
    width: 400,
    height: 300,
    parent: parentWindow, // This ties it to the main window
    modal: true, // This blocks the main window
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  modalWindow.loadFile(path.join(__dirname, "modal.html"));

  modalWindow.once("ready-to-show", () => {
    modalWindow.show();
  });
};

function createReadWindow(contentURL, index) {
  const readWin = new BrowserWindow({
    parent: mainWindow,
    modal: false,
    show: true,
    width: 1200,
    height: 800,
    maxWidth: 2000,
    maxHeight: 2000,
    backgroundColor: "#dedede",
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"), // optional if using preload
    },
  });

  readWin.loadURL(contentURL);

  readWin.webContents.on("did-finish-load", () => {
    readWin.webContents.executeJavaScript(reader.replace("{{ index }}", index));
  });
}

// Receive event from child and forward to main window renderer
ipcMain.on("event-from-child", (event, data) => {
  // You can send this to mainWindow's renderer
  mainWindow.webContents.send("event-to-main", data);
});

// Handle IPC from renderer
ipcMain.on("open-read-window", (event, contentURL, index) => {
  createReadWindow(contentURL, index);
});

ipcMain.on("modal-event", (event, data) => {
  switch (data.type) {
    case "show":
      console.log("Modal opened");
      break;
    case "hide":
      console.log("Modal closed");
      break;
    case "submit":
      readItem(data.url, (item) => {
        event.sender.send("new-item-success", item);
      });

      // console.log("URL submitted:", data.url);
      break;
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  createTray();
  //Manage new window state
  mainWindowState.manage(mainWindow);

  ipcMain.on("open-modal", () => {
    createModalWindow(mainWindow);
  });

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });


});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
