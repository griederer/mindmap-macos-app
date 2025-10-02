/**
 * RendererProjectManager - Client-side project management with auto-save
 *
 * Integrates ProjectManager backend with UI and provides auto-save functionality
 */

class RendererProjectManager {
    constructor() {
        this.currentProjectPath = null;
        this.currentProjectName = null;
        this.autoSaveTimer = null;
        this.autoSaveInterval = 30000; // 30 seconds
        this.isDirty = false;
        this.isAutoSaveEnabled = true;
        this.saveCallbacks = [];
        this.lastSaveTime = null;
        this.saveStatusElement = null;

        // Initialize save status UI
        this.initializeSaveStatus();

        // Start auto-save
        this.startAutoSave();

        // Listen for auto-save status events
        window.addEventListener('auto-save-status', (e) => {
            this.updateSaveStatus(e.detail.status, e.detail.message);
        });
    }

    /**
     * Initialize save status indicator in UI
     */
    initializeSaveStatus() {
        // Create save status indicator if it doesn't exist
        let statusEl = document.getElementById('save-status');
        if (!statusEl) {
            statusEl = document.createElement('div');
            statusEl.id = 'save-status';
            statusEl.className = 'save-status hidden';
            statusEl.innerHTML = `
                <span class="save-icon">●</span>
                <span class="save-text">Saved</span>
            `;

            // Add to header or create a container
            const header = document.querySelector('header') || document.body;
            header.appendChild(statusEl);

            // Add styles
            const style = document.createElement('style');
            style.textContent = `
                .save-status {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 12px;
                    background: rgba(255, 255, 255, 0.9);
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 500;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    transition: opacity 0.3s ease;
                    z-index: 1000;
                }
                .save-status.hidden {
                    opacity: 0;
                    pointer-events: none;
                }
                .save-status.success .save-icon {
                    color: #10b981;
                }
                .save-status.saving .save-icon {
                    color: #f59e0b;
                    animation: pulse 1s ease-in-out infinite;
                }
                .save-status.error .save-icon {
                    color: #ef4444;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `;
            document.head.appendChild(style);
        }

        this.saveStatusElement = statusEl;
    }

    /**
     * Update save status indicator
     */
    updateSaveStatus(status, message) {
        if (!this.saveStatusElement) return;

        this.saveStatusElement.className = `save-status ${status}`;
        const textEl = this.saveStatusElement.querySelector('.save-text');
        if (textEl) {
            textEl.textContent = message || 'Saved';
        }

        // Auto-hide success messages after 3 seconds
        if (status === 'success') {
            setTimeout(() => {
                this.saveStatusElement.classList.add('hidden');
            }, 3000);
        } else {
            this.saveStatusElement.classList.remove('hidden');
        }
    }

    /**
     * Create a new project
     */
    async createProject(projectName, template = null) {
        try {
            const result = await window.electronAPI.projectManager.createProject(projectName, template);

            if (result.success) {
                this.currentProjectPath = result.projectPath;
                this.currentProjectName = projectName;
                this.isDirty = false;
                console.log(`Project created: ${projectName}`);
                return result.projectData;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error creating project:', error);
            alert(`Error creating project: ${error.message}`);
            throw error;
        }
    }

    /**
     * Load an existing project
     */
    async loadProject(projectPath) {
        try {
            const result = await window.electronAPI.projectManager.loadProject(projectPath);

            if (result.success) {
                this.currentProjectPath = projectPath;
                this.currentProjectName = result.projectData.name;
                this.isDirty = false;
                console.log(`Project loaded: ${projectPath}`);
                return result.projectData;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error loading project:', error);
            alert(`Error loading project: ${error.message}`);
            throw error;
        }
    }

    /**
     * Save current project
     */
    async saveProject(projectData = null) {
        if (!this.currentProjectPath) {
            console.warn('No active project to save');
            return false;
        }

        try {
            this.updateSaveStatus('saving', 'Saving...');

            // If no project data provided, collect from callbacks
            if (!projectData) {
                for (const callback of this.saveCallbacks) {
                    const result = await callback();
                    if (result) {
                        projectData = result;
                        break;
                    }
                }
            }

            if (!projectData) {
                throw new Error('No project data available to save');
            }

            const result = await window.electronAPI.projectManager.saveProject(
                this.currentProjectPath,
                projectData
            );

            if (result.success) {
                this.isDirty = false;
                this.lastSaveTime = new Date();
                this.updateSaveStatus('success', 'Saved');
                console.log(`Project saved: ${this.currentProjectPath}`);
                return true;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error saving project:', error);
            this.updateSaveStatus('error', 'Save failed');
            throw error;
        }
    }

    /**
     * List all projects
     */
    async listProjects() {
        try {
            const result = await window.electronAPI.projectManager.listProjects();
            return result.success ? result.projects : [];
        } catch (error) {
            console.error('Error listing projects:', error);
            return [];
        }
    }

    /**
     * Get recent projects
     */
    async getRecentProjects(limit = 10) {
        try {
            const result = await window.electronAPI.projectManager.getRecentProjects(limit);
            return result.success ? result.projects : [];
        } catch (error) {
            console.error('Error getting recent projects:', error);
            return [];
        }
    }

    /**
     * Delete a project
     */
    async deleteProject(projectPath, moveToArchive = true) {
        try {
            const result = await window.electronAPI.projectManager.deleteProject(
                projectPath,
                moveToArchive
            );

            if (result.success) {
                if (this.currentProjectPath === projectPath) {
                    this.currentProjectPath = null;
                    this.currentProjectName = null;
                }
                return true;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            throw error;
        }
    }

    /**
     * Export project
     */
    async exportProject(projectPath, exportPath, format = 'json') {
        try {
            const result = await window.electronAPI.projectManager.exportProject(
                projectPath,
                exportPath,
                format
            );
            return result.success;
        } catch (error) {
            console.error('Error exporting project:', error);
            throw error;
        }
    }

    /**
     * Import project
     */
    async importProject(sourcePath, projectName = null) {
        try {
            const result = await window.electronAPI.projectManager.importProject(
                sourcePath,
                projectName
            );

            if (result.success) {
                return result.projectData;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error importing project:', error);
            throw error;
        }
    }

    /**
     * Get projects directory
     */
    async getProjectsDirectory() {
        try {
            const result = await window.electronAPI.projectManager.getProjectsDirectory();
            return result.success ? result.directory : null;
        } catch (error) {
            console.error('Error getting projects directory:', error);
            return null;
        }
    }

    /**
     * Get last opened project
     */
    async getLastOpenedProject() {
        try {
            const result = await window.electronAPI.projectManager.getLastOpened();
            return result.success ? result.projectPath : null;
        } catch (error) {
            console.error('Error getting last opened project:', error);
            return null;
        }
    }

    /**
     * Register a callback to provide project data for saving
     */
    onSave(callback) {
        this.saveCallbacks.push(callback);
    }

    /**
     * Mark project as dirty (has unsaved changes)
     */
    markDirty() {
        this.isDirty = true;
    }

    /**
     * Check if project has unsaved changes
     */
    isDirtyProject() {
        return this.isDirty;
    }

    /**
     * Start auto-save timer
     */
    startAutoSave() {
        if (this.autoSaveTimer) {
            this.stopAutoSave();
        }

        this.autoSaveTimer = setInterval(async () => {
            await this.performAutoSave();
        }, this.autoSaveInterval);

        console.log(`Auto-save started (interval: ${this.autoSaveInterval}ms)`);
    }

    /**
     * Stop auto-save timer
     */
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
            console.log('Auto-save stopped');
        }
    }

    /**
     * Perform auto-save if needed
     */
    async performAutoSave() {
        if (!this.isAutoSaveEnabled) {
            return;
        }

        if (!this.isDirty) {
            return;
        }

        if (!this.currentProjectPath) {
            return;
        }

        try {
            await this.saveProject();
            console.log(`Auto-saved at ${new Date().toLocaleTimeString()}`);
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    }

    /**
     * Force immediate save
     */
    async forceSave() {
        if (!this.currentProjectPath) {
            throw new Error('No active project to save');
        }

        this.isDirty = true; // Force save
        await this.saveProject();
    }

    /**
     * Enable auto-save
     */
    enableAutoSave() {
        this.isAutoSaveEnabled = true;
        if (!this.autoSaveTimer) {
            this.startAutoSave();
        }
    }

    /**
     * Disable auto-save
     */
    disableAutoSave() {
        this.isAutoSaveEnabled = false;
    }

    /**
     * Set auto-save interval
     */
    setAutoSaveInterval(intervalMs) {
        this.autoSaveInterval = intervalMs;
        if (this.autoSaveTimer) {
            this.stopAutoSave();
            this.startAutoSave();
        }
    }

    /**
     * Get current project info
     */
    getCurrentProject() {
        return {
            path: this.currentProjectPath,
            name: this.currentProjectName,
            isDirty: this.isDirty,
            lastSaved: this.lastSaveTime
        };
    }
}

// Export for use in renderer process
if (typeof window !== 'undefined') {
    window.RendererProjectManager = RendererProjectManager;
}
