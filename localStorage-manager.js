/**
 * LocalStorageManager - Handle versioning and cleanup
 * Implementation for PRD #0002 FR-007
 */

class LocalStorageManager {
    constructor() {
        this.version = '5.0';
        this.storagePrefix = 'mindmap';
    }

    /**
     * Initialize localStorage with version check
     * Clears old data if version mismatch detected
     */
    initialize() {
        const currentVersion = localStorage.getItem(`${this.storagePrefix}-version`);

        if (!currentVersion) {
            // First time setup
            console.log('[LocalStorage] First time setup, setting version:', this.version);
            localStorage.setItem(`${this.storagePrefix}-version`, this.version);
        } else if (currentVersion !== this.version) {
            // Version mismatch - clear old data
            console.log('[LocalStorage] Version mismatch, clearing old data');
            console.log('[LocalStorage] Old version:', currentVersion, 'New version:', this.version);
            this.clearAllProjectData();
            localStorage.setItem(`${this.storagePrefix}-version`, this.version);
        } else {
            console.log('[LocalStorage] Version match:', this.version);
        }
    }

    /**
     * Clear all project-specific data from localStorage
     * Preserves app settings and metadata
     */
    clearAllProjectData() {
        const keys = Object.keys(localStorage);
        let clearedCount = 0;

        keys.forEach(key => {
            // Only clear project-specific data, preserve app settings
            if (key.startsWith(`${this.storagePrefix}-content-`) ||
                key.startsWith(`${this.storagePrefix}-nodedata-`) ||
                key.startsWith(`${this.storagePrefix}-orders-`)) {
                localStorage.removeItem(key);
                clearedCount++;
            }
        });

        console.log(`[LocalStorage] Cleared ${clearedCount} stale project entries`);
    }

    /**
     * Clear data for specific project
     * @param {string} projectId - Project identifier
     */
    clearProjectData(projectId) {
        if (!projectId) {
            console.warn('[LocalStorage] Cannot clear data: projectId is null');
            return;
        }

        const keysToRemove = [
            `${this.storagePrefix}-content-${projectId}`,
            `${this.storagePrefix}-nodedata-${projectId}`,
            `${this.storagePrefix}-orders-${projectId}`
        ];

        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });

        console.log(`[LocalStorage] Cleared data for project: ${projectId}`);
    }

    /**
     * Get project data from localStorage
     * @param {string} projectId - Project identifier
     * @returns {object|null} - Cached project data or null
     */
    getProjectData(projectId) {
        if (!projectId) return null;

        try {
            const content = localStorage.getItem(`${this.storagePrefix}-content-${projectId}`);
            const nodeData = localStorage.getItem(`${this.storagePrefix}-nodedata-${projectId}`);
            const orders = localStorage.getItem(`${this.storagePrefix}-orders-${projectId}`);

            return {
                content: content,
                nodeData: nodeData ? JSON.parse(nodeData) : null,
                orders: orders ? JSON.parse(orders) : null
            };
        } catch (error) {
            console.error('[LocalStorage] Error reading project data:', error);
            return null;
        }
    }

    /**
     * Save project data to localStorage
     * @param {string} projectId - Project identifier
     * @param {object} data - Project data to cache
     */
    saveProjectData(projectId, data) {
        if (!projectId) {
            console.warn('[LocalStorage] Cannot save data: projectId is null');
            return;
        }

        try {
            if (data.content !== undefined) {
                localStorage.setItem(`${this.storagePrefix}-content-${projectId}`, data.content);
            }
            if (data.nodeData !== undefined) {
                localStorage.setItem(`${this.storagePrefix}-nodedata-${projectId}`, JSON.stringify(data.nodeData));
            }
            if (data.orders !== undefined) {
                localStorage.setItem(`${this.storagePrefix}-orders-${projectId}`, JSON.stringify(data.orders));
            }
        } catch (error) {
            console.error('[LocalStorage] Error saving project data:', error);
            // Handle quota exceeded
            if (error.name === 'QuotaExceededError') {
                console.warn('[LocalStorage] Storage quota exceeded, clearing old data');
                this.clearAllProjectData();
            }
        }
    }

    /**
     * Get statistics about localStorage usage
     * @returns {object} - Storage statistics
     */
    getStats() {
        const keys = Object.keys(localStorage);
        const projectKeys = keys.filter(key => key.startsWith(`${this.storagePrefix}-`));

        let totalSize = 0;
        projectKeys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                totalSize += value.length * 2; // Approximate bytes (2 bytes per character in UTF-16)
            }
        });

        return {
            totalKeys: projectKeys.length,
            totalSize: totalSize,
            totalSizeKB: (totalSize / 1024).toFixed(2),
            totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
            version: localStorage.getItem(`${this.storagePrefix}-version`),
            percentUsed: this.getStoragePercentUsed()
        };
    }

    /**
     * Estimate percentage of localStorage quota used
     * @returns {number} - Percentage (0-100)
     */
    getStoragePercentUsed() {
        try {
            // Typical localStorage quota is 5-10MB
            const quotaEstimate = 5 * 1024 * 1024; // 5MB in bytes

            let totalSize = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    const value = localStorage.getItem(key);
                    if (value) {
                        totalSize += (key.length + value.length) * 2;
                    }
                }
            }

            return ((totalSize / quotaEstimate) * 100).toFixed(2);
        } catch (error) {
            return 0;
        }
    }

    /**
     * Check if localStorage is available and working
     * @returns {boolean} - True if localStorage is functional
     */
    isAvailable() {
        try {
            const testKey = `${this.storagePrefix}-test`;
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            console.error('[LocalStorage] localStorage is not available:', error);
            return false;
        }
    }

    /**
     * Get all project IDs from localStorage
     * @returns {string[]} - Array of project IDs
     */
    getProjectIds() {
        const keys = Object.keys(localStorage);
        const projectIds = new Set();

        keys.forEach(key => {
            if (key.startsWith(`${this.storagePrefix}-content-`)) {
                const projectId = key.replace(`${this.storagePrefix}-content-`, '');
                projectIds.add(projectId);
            }
        });

        return Array.from(projectIds);
    }

    /**
     * Clear all mindmap data (including version)
     * WARNING: This is a destructive operation
     */
    clearAll() {
        const keys = Object.keys(localStorage);
        const mindmapKeys = keys.filter(key => key.startsWith(`${this.storagePrefix}-`));

        mindmapKeys.forEach(key => {
            localStorage.removeItem(key);
        });

        console.log(`[LocalStorage] Cleared all mindmap data (${mindmapKeys.length} keys)`);
    }

    /**
     * Export localStorage data for debugging
     * @returns {object} - All mindmap-related localStorage data
     */
    exportData() {
        const data = {};
        const keys = Object.keys(localStorage);

        keys.forEach(key => {
            if (key.startsWith(`${this.storagePrefix}-`)) {
                data[key] = localStorage.getItem(key);
            }
        });

        return data;
    }

    /**
     * Import localStorage data (for debugging/recovery)
     * @param {object} data - Data to import
     */
    importData(data) {
        Object.keys(data).forEach(key => {
            if (key.startsWith(`${this.storagePrefix}-`)) {
                localStorage.setItem(key, data[key]);
            }
        });

        console.log(`[LocalStorage] Imported ${Object.keys(data).length} keys`);
    }

    /**
     * Validate localStorage health
     * @returns {object} - Validation report
     */
    validate() {
        const report = {
            isAvailable: this.isAvailable(),
            version: localStorage.getItem(`${this.storagePrefix}-version`),
            versionMatch: localStorage.getItem(`${this.storagePrefix}-version`) === this.version,
            stats: this.getStats(),
            issues: []
        };

        // Check for orphaned data
        const projectIds = this.getProjectIds();
        projectIds.forEach(projectId => {
            const data = this.getProjectData(projectId);
            if (!data.content && !data.nodeData) {
                report.issues.push(`Orphaned data for project: ${projectId}`);
            }
        });

        // Check storage usage
        if (report.stats.percentUsed > 80) {
            report.issues.push(`High storage usage: ${report.stats.percentUsed}%`);
        }

        return report;
    }
}

// Create global instance
window.localStorageManager = new LocalStorageManager();
