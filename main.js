const { app, BrowserWindow, Menu, ipcMain, dialog, shell, nativeTheme } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');

// Initialize electron store for preferences
const store = new Store();

let mainWindow;
let isDev = process.argv.includes('--dev');

// Enable hardware acceleration for better performance
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('disable-frame-rate-limit');

function createWindow() {
  // Create the browser window with macOS styling
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 20, y: 20 },
    backgroundColor: '#f8f6f4',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webgl: true,
      experimentalFeatures: true
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false
  });

  // Load the index.html file
  mainWindow.loadFile('index.html');

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // Animate window appearance
    if (process.platform === 'darwin') {
      mainWindow.setVibrancy('under-window');
    }
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create app menu
function createMenu() {
  const template = [
    {
      label: 'PWC Mindmap',
      submenu: [
        { label: 'About PWC Mindmap', role: 'about' },
        { type: 'separator' },
        { label: 'Preferences...', accelerator: 'Cmd+,', click: () => { showPreferences(); }},
        { type: 'separator' },
        { label: 'Services', role: 'services', submenu: [] },
        { type: 'separator' },
        { label: 'Hide PWC Mindmap', accelerator: 'Cmd+H', role: 'hide' },
        { label: 'Hide Others', accelerator: 'Cmd+Shift+H', role: 'hideothers' },
        { label: 'Show All', role: 'unhide' },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'Cmd+Q', click: () => { app.quit(); }}
      ]
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'New Mindmap',
          accelerator: 'Cmd+N',
          click: () => { mainWindow.webContents.send('menu-new'); }
        },
        {
          label: 'Open...',
          accelerator: 'Cmd+O',
          click: () => { openFile(); }
        },
        {
          label: 'Open Recent',
          submenu: getRecentFiles()
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'Cmd+S',
          click: () => { mainWindow.webContents.send('menu-save'); }
        },
        {
          label: 'Save As...',
          accelerator: 'Cmd+Shift+S',
          click: () => { saveFileAs(); }
        },
        { type: 'separator' },
        {
          label: 'Export as Image...',
          accelerator: 'Cmd+E',
          click: () => { mainWindow.webContents.send('menu-export-image'); }
        },
        {
          label: 'Export as JSON...',
          click: () => { mainWindow.webContents.send('menu-export-json'); }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'Cmd+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'Cmd+Shift+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'Cmd+X', role: 'cut' },
        { label: 'Copy', accelerator: 'Cmd+C', role: 'copy' },
        { label: 'Paste', accelerator: 'Cmd+V', role: 'paste' },
        { label: 'Select All', accelerator: 'Cmd+A', role: 'selectall' },
        { type: 'separator' },
        {
          label: 'Find...',
          accelerator: 'Cmd+F',
          click: () => { mainWindow.webContents.send('menu-find'); }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Zoom In',
          accelerator: 'Cmd+Plus',
          click: () => { mainWindow.webContents.send('menu-zoom-in'); }
        },
        {
          label: 'Zoom Out',
          accelerator: 'Cmd+-',
          click: () => { mainWindow.webContents.send('menu-zoom-out'); }
        },
        {
          label: 'Reset Zoom',
          accelerator: 'Cmd+0',
          click: () => { mainWindow.webContents.send('menu-zoom-reset'); }
        },
        { type: 'separator' },
        {
          label: 'Expand All',
          accelerator: 'Cmd+Shift+E',
          click: () => { mainWindow.webContents.send('menu-expand-all'); }
        },
        {
          label: 'Collapse All',
          accelerator: 'Cmd+Shift+C',
          click: () => { mainWindow.webContents.send('menu-collapse-all'); }
        },
        { type: 'separator' },
        {
          label: 'Toggle Sidebar',
          accelerator: 'Cmd+\\',
          click: () => { mainWindow.webContents.send('menu-toggle-sidebar'); }
        },
        { type: 'separator' },
        { label: 'Enter Full Screen', accelerator: 'Ctrl+Cmd+F', role: 'togglefullscreen' },
        { type: 'separator' },
        { label: 'Developer Tools', accelerator: 'Alt+Cmd+I', role: 'toggledevtools' }
      ]
    },
    {
      label: 'Node',
      submenu: [
        {
          label: 'Add Child Node',
          accelerator: 'Tab',
          click: () => { mainWindow.webContents.send('menu-add-child'); }
        },
        {
          label: 'Add Sibling Node',
          accelerator: 'Enter',
          click: () => { mainWindow.webContents.send('menu-add-sibling'); }
        },
        { type: 'separator' },
        {
          label: 'Edit Selected Node',
          accelerator: 'Cmd+Return',
          click: () => { mainWindow.webContents.send('menu-edit-node'); }
        },
        {
          label: 'Delete Selected Node',
          accelerator: 'Delete',
          click: () => { mainWindow.webContents.send('menu-delete-node'); }
        },
        { type: 'separator' },
        {
          label: 'Toggle Node Info',
          accelerator: 'Cmd+I',
          click: () => { mainWindow.webContents.send('menu-toggle-info'); }
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { label: 'Minimize', accelerator: 'Cmd+M', role: 'minimize' },
        { label: 'Close', accelerator: 'Cmd+W', role: 'close' },
        { type: 'separator' },
        { label: 'Bring All to Front', role: 'front' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'PWC Mindmap Help',
          click: () => { shell.openExternal('https://help.pwcmindmap.com'); }
        },
        {
          label: 'Keyboard Shortcuts',
          click: () => { showKeyboardShortcuts(); }
        },
        { type: 'separator' },
        {
          label: 'Report Issue',
          click: () => { shell.openExternal('https://github.com/pwcmindmap/issues'); }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Get recent files for menu
function getRecentFiles() {
  const recentFiles = store.get('recentFiles', []);
  if (recentFiles.length === 0) {
    return [{ label: 'No Recent Files', enabled: false }];
  }

  return recentFiles.map((file, index) => ({
    label: `${index + 1}. ${path.basename(file)}`,
    click: () => { openRecentFile(file); }
  }));
}

// Open file dialog
async function openFile() {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Mindmap Files', extensions: ['pmap', 'json', 'md', 'txt'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    const content = fs.readFileSync(filePath, 'utf-8');
    mainWindow.webContents.send('file-opened', { path: filePath, content });
    addToRecentFiles(filePath);
  }
}

// Save file dialog
async function saveFileAs() {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'PWC Mindmap', extensions: ['pmap'] },
      { name: 'JSON', extensions: ['json'] },
      { name: 'Markdown', extensions: ['md'] }
    ]
  });

  if (!result.canceled) {
    mainWindow.webContents.send('save-file-as', result.filePath);
    addToRecentFiles(result.filePath);
  }
}

// Add file to recent files
function addToRecentFiles(filePath) {
  let recentFiles = store.get('recentFiles', []);
  recentFiles = recentFiles.filter(f => f !== filePath);
  recentFiles.unshift(filePath);
  recentFiles = recentFiles.slice(0, 10); // Keep only 10 recent files
  store.set('recentFiles', recentFiles);
  createMenu(); // Refresh menu
}

// Open recent file
function openRecentFile(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    mainWindow.webContents.send('file-opened', { path: filePath, content });
  } else {
    dialog.showErrorBox('File Not Found', `The file ${path.basename(filePath)} could not be found.`);
    // Remove from recent files
    let recentFiles = store.get('recentFiles', []);
    recentFiles = recentFiles.filter(f => f !== filePath);
    store.set('recentFiles', recentFiles);
    createMenu();
  }
}

// Show preferences window
function showPreferences() {
  mainWindow.webContents.send('show-preferences');
}

// Show keyboard shortcuts
function showKeyboardShortcuts() {
  mainWindow.webContents.send('show-shortcuts');
}

// IPC handlers
ipcMain.handle('save-file', async (event, data) => {
  try {
    fs.writeFileSync(data.path, data.content);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-platform', () => {
  return process.platform;
});

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle file open on macOS
app.on('open-file', (event, filePath) => {
  event.preventDefault();
  if (mainWindow) {
    const content = fs.readFileSync(filePath, 'utf-8');
    mainWindow.webContents.send('file-opened', { path: filePath, content });
    addToRecentFiles(filePath);
  }
});