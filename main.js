// Xiine desktop app: opens xiine.app in its own window, like the installed web app but as a download.
// Everything (sign-in, connecting Gmail/Shopify/…, payments) runs on xiine.app, so the app never needs
// updating when the website changes. Links to other websites open in the normal browser.
const { app, BrowserWindow, Menu, shell, session } = require('electron');

const HOME = 'https://xiine.app/';
const APP_HOST = 'xiine.app';

// Google and some other sign-in pages refuse "embedded" browsers, so present as plain Chrome.
const userAgent = () => session.defaultSession.getUserAgent().replace(/\s(Electron|xiine-desktop|Xiine)\/\S+/g, '');

function isXiine(url) {
  try { return new URL(url).hostname === APP_HOST; } catch { return false; }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 380,
    minHeight: 560,
    title: 'Xiine',
    backgroundColor: '#ffffff',
    show: false,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  win.webContents.setUserAgent(userAgent());
  win.once('ready-to-show', () => win.show());

  // New windows (e.g. "open in new tab", downloads of signed files, payment pages):
  // Xiine pages stay in the app, everything else opens in the normal browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isXiine(url)) { win.loadURL(url); return { action: 'deny' }; }
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  // No internet: show a simple page with a retry button instead of a blank window.
  win.webContents.on('did-fail-load', (_event, code, _desc, url, isMainFrame) => {
    if (!isMainFrame || code === -3) return; // -3 = navigation replaced, not a failure
    const retry = isXiine(url) ? url : HOME;
    win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`<!doctype html><meta charset="utf-8"><title>Xiine</title>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;font:15px/1.6 -apple-system,'Segoe UI',sans-serif;color:#0f172a;text-align:center">
<div><h2 style="margin:0 0 8px">没有连上网络 / You're offline</h2><p style="color:#475569;margin:0">Xiine 需要联网才能工作。Xiine needs the internet to work.</p>
<button onclick="location.href=${JSON.stringify(retry)}" style="margin-top:24px;background:#0f172a;color:#fff;border:0;border-radius:10px;padding:12px 28px;font:inherit;font-weight:600;cursor:pointer">重新加载 / Try again</button></div></body>`));
  });

  win.loadURL(HOME);
  return win;
}

function buildMenu() {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    { role: 'editMenu' },
    {
      label: isMac ? 'View' : '&View',
      submenu: [
        { label: 'Home', accelerator: 'CmdOrCtrl+Shift+H', click: (_item, win) => win && win.loadURL(HOME) },
        { role: 'reload' },
        { type: 'separator' },
        { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    { label: 'Navigate', submenu: [
      { label: 'Back', accelerator: 'CmdOrCtrl+[', click: (_i, win) => win && win.webContents.navigationHistory.canGoBack() && win.webContents.navigationHistory.goBack() },
      { label: 'Forward', accelerator: 'CmdOrCtrl+]', click: (_i, win) => win && win.webContents.navigationHistory.canGoForward() && win.webContents.navigationHistory.goForward() },
    ] },
    { role: 'windowMenu' },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const [win] = BrowserWindow.getAllWindows();
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
  });
  app.whenReady().then(() => {
    app.userAgentFallback = userAgent();
    buildMenu();
    createWindow();
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  });
  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
}
