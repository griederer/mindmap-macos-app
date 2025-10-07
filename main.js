const { app, BrowserWindow, Menu, ipcMain, dialog, shell, nativeTheme } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const ProjectManager = require('./project-manager');
const chokidar = require('chokidar');

// Initialize electron store for preferences
const store = new Store();

// Initialize ProjectManager
const projectManager = new ProjectManager();

let mainWindow;
let isDev = process.argv.includes('--dev');
let projectsWatcher = null;

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

  // Disable cache for CSS changes
  mainWindow.webContents.session.clearCache();

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // Animate window appearance
    if (process.platform === 'darwin') {
      mainWindow.setVibrancy('under-window');
    }

    // DevTools disabled in production
    // mainWindow.webContents.openDevTools();
  });

  // Force reload on F5
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F5') {
      mainWindow.webContents.reloadIgnoringCache();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    // Stop file watcher when window closes
    if (projectsWatcher) {
      projectsWatcher.close();
      projectsWatcher = null;
    }
  });

  // Start file watcher for project directory
  setupProjectsWatcher();
}

// Setup file watcher for projects directory
function setupProjectsWatcher() {
  const projectsDir = projectManager.getProjectsDirectory();

  // Initialize watcher
  projectsWatcher = chokidar.watch(path.join(projectsDir, '*.pmap'), {
    ignored: /(^|[\/\\])\../, // Ignore dotfiles
    persistent: true,
    ignoreInitial: true, // Don't fire events for existing files
    awaitWriteFinish: {
      stabilityThreshold: 500,
      pollInterval: 100
    }
  });

  // Watch for new projects
  projectsWatcher
    .on('add', (filePath) => {
      console.log(`New project detected: ${filePath}`);
      if (mainWindow) {
        mainWindow.webContents.send('projects-changed', {
          action: 'add',
          path: filePath
        });
      }
    })
    .on('change', (filePath) => {
      console.log(`Project modified: ${filePath}`);
      if (mainWindow) {
        mainWindow.webContents.send('projects-changed', {
          action: 'change',
          path: filePath
        });
      }
    })
    .on('unlink', (filePath) => {
      console.log(`Project deleted: ${filePath}`);
      if (mainWindow) {
        mainWindow.webContents.send('projects-changed', {
          action: 'delete',
          path: filePath
        });
      }
    })
    .on('error', (error) => {
      console.error('File watcher error:', error);
    });

  console.log(`Watching projects directory: ${projectsDir}`);
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

// ProjectManager IPC handlers
ipcMain.handle('pm-create-project', async (event, { projectName, template }) => {
  try {
    const result = projectManager.createProject(projectName, template);
    return { success: true, ...result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('pm-load-project', async (event, { projectPath }) => {
  try {
    const projectData = projectManager.loadProject(projectPath);
    return { success: true, projectData };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('pm-save-project', async (event, { projectPath, projectData }) => {
  try {
    projectManager.saveProject(projectPath, projectData);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('pm-list-projects', async () => {
  try {
    const projects = projectManager.listProjects();
    return { success: true, projects };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('pm-get-recent-projects', async (event, { limit }) => {
  try {
    const projects = projectManager.getRecentProjects(limit);
    return { success: true, projects };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('pm-delete-project', async (event, { projectPath, moveToArchive }) => {
  try {
    projectManager.deleteProject(projectPath, moveToArchive);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('pm-export-project', async (event, { projectPath, exportPath, format }) => {
  try {
    projectManager.exportProject(projectPath, exportPath, format);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('pm-import-project', async (event, { sourcePath, projectName }) => {
  try {
    const result = projectManager.importProject(sourcePath, projectName);
    return { success: true, ...result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('pm-get-projects-directory', async () => {
  try {
    const directory = projectManager.getProjectsDirectory();
    return { success: true, directory };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('pm-get-last-opened', async () => {
  try {
    const projectPath = projectManager.getLastOpenedProject();
    return { success: true, projectPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
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