const electron = require("electron");
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
// const newWindowBtn = document.getElementById('frameless-window')
/*获取electron窗体的菜单栏*/
const Menu = electron.Menu;
/*隐藏electron创听的菜单栏*/
Menu.setApplicationMenu(null);

const path = require("path");
const url = require("url");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let otherWindow;
let loadingWindow;
const loadURL = "https://www.taojp.love/";

let getZoomFactor = () => {
  // 获取分辨率并设置缩放比
  const screenWidth = electron.screen.getPrimaryDisplay().workArea.width;
  let devInnerWidth = 1920;
  let devScaleFactor = 1;
  let scaleFactor = electron.screen.getPrimaryDisplay().scaleFactor;
  let max = Math.max(scaleFactor, devScaleFactor);
  let min = Math.min(scaleFactor, devScaleFactor);
  let devDevicePixelRatio = 1.0;
  const devicePixelRatio = 1.0;
  let zoomFactor = screenWidth / devInnerWidth;
  // *
  // (devScaleFactor /
  // scaleFactor); /**  (devicePixelRatio / devDevicePixelRatio) */
  // console.log(mainWindow.webContents,screenWidth)
  return zoomFactor;
};
function createWindow() {
  // 创建一个窗口，大小 800 * 600
  mainWindow = new BrowserWindow({
    width: 1340,
    height: 800,
    backgroundColor: "#0f5794",
    show: false,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
      partition: String(+new Date()),
    },
    // useContentSize: true,
    // frame: true,
    // transparent: true(禁止放大最大化)
  });
  mainWindow.maximize();
  mainWindow.show();

  // 在窗口内要展示的内容为 ./dist/index.html，即打包生成的index.html
  // 避免重复打包可以加载Nginx下的地址
  mainWindow.loadURL(
    loadURL
    // url.format({
    //     pathname: path.join(__dirname, "./dist", "index.html"),
    //     protocol: "file:",
    //     slashes: true
    // })
  );
  mainWindow.once("ready-to-show", () => {
    // 设置缩放以适应不同分辨率
    mainWindow.webContents.setZoomFactor(getZoomFactor());
  });

  // // 自动打开调试台
  // mainWindow.webContents.openDevTools({
  //   detach: true,
  // });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // 监听渲染进程关闭，销毁该进程，解决点击关闭时无法关闭窗口问题
  mainWindow.on("close", function () {
    mainWindow.destroy();
    if (otherWindow) otherWindow.destroy();
  });

  // Emitted when the window is closed.
  mainWindow.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    // 回收BrowserWindow对象
    mainWindow = null;
    if (otherWindow) otherWindow.destroy();
    otherWindow = null;
  });
}
electron.ipcMain.on("DomLoaded", (e, data) => {
  if (data == "loaded") {
    console.log(222222222222);
    loadingWindow.hide();
    loadingWindow.destroy();
    loadingWindow = null;
  }
});
function createLoadingWindow() {
  // 创建一个窗口，大小 800 * 600
  loadingWindow = new BrowserWindow({
    width: 500,
    height: 300,
    backgroundColor:'#fff',
    center: true,
    show: false,
    hasShadow: true,
    frame: false,
    resizable: false,
    transparent: true,
    movable: false,
    alwaysOnTop: true,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      partition: String(+new Date()),
    },
  });
  loadingWindow.loadURL(path.join(__dirname, "loading.html"));
  loadingWindow.once("ready-to-show", () => {
    // 设置缩放以适应不同分辨率
    loadingWindow.webContents.setZoomFactor(getZoomFactor());
    loadingWindow.show();
  });
}
function createOtherWindow() {
  let electronScreen = electron.screen;
  let displays = electronScreen.getAllDisplays();
  // console.log(displays)
  let externalDisplay = null;
  for (let i in displays) {
    if (displays[i].bounds.x != 0 || displays[i].bounds.y != 0) {
      externalDisplay = displays[i];
      break;
    }
  }
  if (externalDisplay) {
    otherWindow = new BrowserWindow({
      fullscreen: true,
      x: externalDisplay.bounds.x,
      y: externalDisplay.bounds.y,
      backgroundColor: "#0f5794",
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true,
        partition: String(+new Date()),
      },
    });

    otherWindow.loadURL(loadURL);
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron.protocol.registerSchemesAsPrivileged([
  {
    scheme: "http",
    privileges: {
      standard: true,
      secure: true,
      bypassCSP: true,
      allowServiceWorkers: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
]);
// 禁用缓存
app.commandLine.appendSwitch("--disable-http-cache");
app.on("ready", () => {
  createLoadingWindow();
  createWindow();
  // createOtherWindow();
});

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
