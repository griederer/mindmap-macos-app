/**
 * AutoSaveManager - Handles automatic project saving
 *
 * Features:
 * - Auto-save every 30 seconds
 * - Debouncing for rapid changes
 * - Change detection to avoid unnecessary saves
 * - Save status notifications
 */

class AutoSaveManager {
    constructor(projectManager, interval = 30000) {
        this.projectManager = projectManager;
        this.interval = interval; // Default 30 seconds
        this.timer = null;
        this.enabled = true;
        this.isDirty = false;
        this.currentProjectPath = null;
        this.lastSaveTime = null;
        this.saveCallbacks = [];
    }

    /**
     * Start auto-save timer
     */
    start() {
        if (this.timer) {
            this.stop();
        }

        this.timer = setInterval(() => {
            this.performAutoSave();
        }, this.interval);

        console.log(`Auto-save started (interval: ${this.interval}ms)`);
    }

    /**
     * Stop auto-save timer
     */
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
            console.log('Auto-save stopped');
        }
    }

    /**
     * Enable auto-save
     */
    enable() {
        this.enabled = true;
        if (!this.timer) {
            this.start();
        }
    }

    /**
     * Disable auto-save
     */
    disable() {
        this.enabled = false;
    }

    /**
     * Set the current project path
     * @param {string} projectPath - Path to current project
     */
    setCurrentProject(projectPath) {
        this.currentProjectPath = projectPath;
        this.isDirty = false;
    }

    /**
     * Mark project as dirty (needs saving)
     */
    markDirty() {
        this.isDirty = true;
    }

    /**
     * Check if project needs saving
     * @returns {boolean} - Whether project has unsaved changes
     */
    isDirtyProject() {
        return this.isDirty;
    }

    /**
     * Perform auto-save if needed
     */
    async performAutoSave() {
        if (!this.enabled) {
            return;
        }

        if (!this.isDirty) {
            console.log('Auto-save: No changes detected');
            return;
        }

        if (!this.currentProjectPath) {
            console.log('Auto-save: No active project');
            return;
        }

        try {
            console.log(`Auto-saving project: ${this.currentProjectPath}`);

            // Call all registered save callbacks to gather project data
            let projectData = null;
            for (const callback of this.saveCallbacks) {
                const result = await callback();
                if (result) {
                    projectData = result;
                    break;
                }
            }

            if (!projectData) {
                console.warn('Auto-save: No project data available');
                return;
            }

            // Save using ProjectManager
            this.projectManager.saveProject(this.currentProjectPath, projectData);

            // Update state
            this.isDirty = false;
            this.lastSaveTime = new Date();

            // Notify success
            this.notifySaveStatus('success', 'Project auto-saved');

            console.log(`Auto-save completed at ${this.lastSaveTime.toLocaleTimeString()}`);
        } catch (error) {
            console.error('Auto-save failed:', error);
            this.notifySaveStatus('error', `Auto-save failed: ${error.message}`);
        }
    }

    /**
     * Force immediate save
     * @returns {Promise<boolean>} - Success status
     */
    async forceSave() {
        if (!this.currentProjectPath) {
            throw new Error('No active project to save');
        }

        this.isDirty = true; // Force save even if not dirty
        await this.performAutoSave();
        return true;
    }

    /**
     * Register a callback to get project data when saving
     * @param {function} callback - Function that returns project data
     */
    onSave(callback) {
        this.saveCallbacks.push(callback);
    }

    /**
     * Notify save status to UI
     * @param {string} status - 'success', 'error', 'saving'
     * @param {string} message - Status message
     */
    notifySaveStatus(status, message) {
        // Emit event for UI to catch
        if (typeof window !== 'undefined' && window.electronAPI) {
            window.electronAPI.emit('auto-save-status', { status, message, time: new Date() });
        }

        // Also log to console
        const prefix = status === 'success' ? '✓' : status === 'error' ? '✗' : '⋯';
        console.log(`${prefix} ${message}`);
    }

    /**
     * Get time since last save
     * @returns {number|null} - Milliseconds since last save, or null if never saved
     */
    getTimeSinceLastSave() {
        if (!this.lastSaveTime) {
            return null;
        }
        return Date.now() - this.lastSaveTime.getTime();
    }

    /**
     * Get last save time
     * @returns {Date|null} - Last save time
     */
    getLastSaveTime() {
        return this.lastSaveTime;
    }

    /**
     * Set auto-save interval
     * @param {number} interval - Interval in milliseconds
     */
    setInterval(interval) {
        this.interval = interval;
        if (this.timer) {
            this.stop();
            this.start();
        }
    }

    /**
     * Get current interval
     * @returns {number} - Current interval in milliseconds
     */
    getInterval() {
        return this.interval;
    }
}

module.exports = AutoSaveManager;
