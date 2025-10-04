const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  saveFile: (data) => ipcRenderer.invoke('save-file', data),
  getPlatform: () => ipcRenderer.invoke('get-platform'),

  // ProjectManager operations
  projectManager: {
    createProject: (projectName, template) =>
      ipcRenderer.invoke('pm-create-project', { projectName, template }),
    loadProject: (projectPath) =>
      ipcRenderer.invoke('pm-load-project', { projectPath }),
    saveProject: (projectPath, projectData) =>
      ipcRenderer.invoke('pm-save-project', { projectPath, projectData }),
    listProjects: () =>
      ipcRenderer.invoke('pm-list-projects'),
    getRecentProjects: (limit = 10) =>
      ipcRenderer.invoke('pm-get-recent-projects', { limit }),
    deleteProject: (projectPath, moveToArchive = true) =>
      ipcRenderer.invoke('pm-delete-project', { projectPath, moveToArchive }),
    exportProject: (projectPath, exportPath, format) =>
      ipcRenderer.invoke('pm-export-project', { projectPath, exportPath, format }),
    importProject: (sourcePath, projectName) =>
      ipcRenderer.invoke('pm-import-project', { sourcePath, projectName }),
    getProjectsDirectory: () =>
      ipcRenderer.invoke('pm-get-projects-directory'),
    getLastOpened: () =>
      ipcRenderer.invoke('pm-get-last-opened')
  },

  // Menu events
  onMenuAction: (callback) => {
    const events = [
      'menu-new', 'menu-save', 'menu-export-image', 'menu-export-json',
      'menu-find', 'menu-zoom-in', 'menu-zoom-out', 'menu-zoom-reset',
      'menu-expand-all', 'menu-collapse-all', 'menu-toggle-sidebar',
      'menu-add-child', 'menu-add-sibling', 'menu-edit-node',
      'menu-delete-node', 'menu-toggle-info', 'show-preferences',
      'show-shortcuts', 'file-opened', 'save-file-as', 'auto-save-status'
    ];

    events.forEach(event => {
      ipcRenderer.on(event, (e, data) => callback(event, data));
    });
  },

  // Event emitter for auto-save status
  emit: (event, data) => {
    // This will be handled by the renderer process
    const customEvent = new CustomEvent(event, { detail: data });
    window.dispatchEvent(customEvent);
  },

  // Remove listeners
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners();
  },

  // Listen for projects directory changes
  onProjectsChanged: (callback) => {
    ipcRenderer.on('projects-changed', (event, data) => callback(event, data));
  }
});