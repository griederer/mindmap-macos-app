const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  saveFile: (data) => ipcRenderer.invoke('save-file', data),
  getPlatform: () => ipcRenderer.invoke('get-platform'),

  // Menu events
  onMenuAction: (callback) => {
    const events = [
      'menu-new', 'menu-save', 'menu-export-image', 'menu-export-json',
      'menu-find', 'menu-zoom-in', 'menu-zoom-out', 'menu-zoom-reset',
      'menu-expand-all', 'menu-collapse-all', 'menu-toggle-sidebar',
      'menu-add-child', 'menu-add-sibling', 'menu-edit-node',
      'menu-delete-node', 'menu-toggle-info', 'show-preferences',
      'show-shortcuts', 'file-opened', 'save-file-as'
    ];

    events.forEach(event => {
      ipcRenderer.on(event, (e, data) => callback(event, data));
    });
  },

  // Remove listeners
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners();
  }
});