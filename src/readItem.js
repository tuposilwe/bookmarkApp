const { BrowserWindow, Notification, nativeImage } = require("electron");
const path = require("path");
const iconBook = nativeImage.createFromPath(path.join(__dirname, "book.png"));

let offscreenWindow;

module.exports = (url, callback) => {
  // Create offscreen window
  offscreenWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      offscreen: true,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the URL
  offscreenWindow.loadURL(url).catch((err) => {
    console.error("Failed to load URL:", err);
    offscreenWindow?.close();
    offscreenWindow = null;
  });

  // Wait for the content to finish loading
  offscreenWindow.webContents.on("did-finish-load", async () => {
    try {
      const title = await offscreenWindow.getTitle();
      const image = await offscreenWindow.webContents.capturePage();
      const screenshot = image.toDataURL();

      // Send the data back using callback
      callback({
        title,
        screenshot,
        url,
      });

      new Notification({
        title: "BookMark",
        body: "URL Added successfully",
        icon: iconBook,
      }).show();
    } catch (err) {
      console.error("Error capturing page:", err);
    } finally {
      if (offscreenWindow) {
        offscreenWindow.close();
        offscreenWindow = null;
      }
    }
  });
};
