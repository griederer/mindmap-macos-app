/**
 * CaptureLog - Tracks user actions for easy slide capture
 *
 * Features:
 * - Logs all user interactions (expand, info panel, fullscreen image)
 * - Allows capturing slides from specific actions
 * - Real-time action log display
 */

class CaptureLog {
    constructor(presentationManager) {
        this.presentationManager = presentationManager;
        this.actions = [];
        this.isCaptureModeActive = false;
        this.logPanel = null;
        this.nextActionId = 1;
    }

    /**
     * Start capture mode and show log panel
     */
    startCaptureMode() {
        this.isCaptureModeActive = true;
        this.actions = [];
        this.nextActionId = 1;

        // Show log panel
        const panel = document.getElementById('captureLogPanel');
        if (panel) {
            panel.classList.add('active');
        }

        this.renderLog();
        console.log('[CaptureLog] Capture mode started');
    }

    /**
     * Stop capture mode and hide log panel
     */
    stopCaptureMode() {
        this.isCaptureModeActive = false;

        // Hide log panel
        const panel = document.getElementById('captureLogPanel');
        if (panel) {
            panel.classList.remove('active');
        }

        console.log('[CaptureLog] Capture mode stopped');
    }

    /**
     * Toggle capture mode on/off
     */
    toggleCaptureMode() {
        if (this.isCaptureModeActive) {
            this.stopCaptureMode();
        } else {
            this.startCaptureMode();
        }
    }

    /**
     * Log an action (expand, info panel, fullscreen image)
     * @param {string} type - Action type: 'expand', 'info', 'image'
     * @param {object} data - Action data (nodeId, nodeText, etc.)
     */
    logAction(type, data) {
        if (!this.isCaptureModeActive) {
            return; // Only log when capture mode is active
        }

        const action = {
            id: this.nextActionId++,
            type,
            data,
            timestamp: new Date().toISOString(),
            captured: false
        };

        this.actions.push(action);
        this.renderLog();

        console.log('[CaptureLog] Action logged:', action);
    }

    /**
     * Capture a slide from a specific action
     * @param {number} actionId - ID of the action to capture
     */
    captureFromAction(actionId) {
        const action = this.actions.find(a => a.id === actionId);
        if (!action) {
            console.error('[CaptureLog] Action not found:', actionId);
            return;
        }

        // Generate description from action
        const description = this.generateDescription(action);

        // Capture current state with custom description
        const slide = this.presentationManager.addSlide(description);

        // Mark action as captured
        action.captured = true;
        action.slideId = slide.id;

        this.renderLog();

        console.log('[CaptureLog] Slide captured from action:', action, slide);

        // Refresh presentation UI
        if (window.presentationUI) {
            window.presentationUI.renderSlidePanel();
        }
    }

    /**
     * Generate description from action
     * @param {object} action - Action object
     * @returns {string} - Human-readable description
     */
    generateDescription(action) {
        switch (action.type) {
            case 'expand':
                return `Expanded: ${action.data.nodeText}`;
            case 'collapse':
                return `Collapsed: ${action.data.nodeText}`;
            case 'info':
                return `Info: ${action.data.nodeText}`;
            case 'image':
                return `Image: ${action.data.nodeText}`;
            case 'category':
                return `Category: ${action.data.categoryIcon ? action.data.categoryIcon + ' ' : ''}${action.data.categoryName}`;
            case 'relationship':
                return `Relationship: ${action.data.relationshipName}`;
            default:
                return `Action: ${action.type}`;
        }
    }

    /**
     * Generate icon for action type
     * @param {string} type - Action type
     * @returns {string} - Icon name (lucide)
     */
    getActionIcon(type) {
        switch (type) {
            case 'expand':
                return 'unfold-vertical';
            case 'collapse':
                return 'fold-vertical';
            case 'info':
                return 'info';
            case 'image':
                return 'image';
            case 'category':
                return 'tag';
            case 'relationship':
                return 'link';
            default:
                return 'activity';
        }
    }

    /**
     * Render the action log
     */
    renderLog() {
        const logList = document.getElementById('captureLogList');
        if (!logList) {
            return;
        }

        // Clear existing log
        logList.innerHTML = '';

        // Render actions in reverse order (newest first)
        const reversedActions = [...this.actions].reverse();

        reversedActions.forEach(action => {
            const actionItem = document.createElement('div');
            actionItem.className = 'capture-log-item';
            if (action.captured) {
                actionItem.classList.add('captured');
            }

            const description = this.generateDescription(action);
            const icon = this.getActionIcon(action.type);

            actionItem.innerHTML = `
                <div class="log-item-icon">
                    <i data-lucide="${icon}"></i>
                </div>
                <div class="log-item-content">
                    <div class="log-item-description">${description}</div>
                    <div class="log-item-timestamp">${this.formatTimestamp(action.timestamp)}</div>
                </div>
                <button class="log-item-capture" data-action-id="${action.id}" ${action.captured ? 'disabled' : ''}>
                    ${action.captured ? 'Captured' : 'Capture Slide'}
                </button>
            `;

            // Add click listener for capture button
            const captureBtn = actionItem.querySelector('.log-item-capture');
            captureBtn.addEventListener('click', () => {
                this.captureFromAction(action.id);
            });

            logList.appendChild(actionItem);
        });

        // Re-initialize lucide icons
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    }

    /**
     * Format timestamp for display
     * @param {string} isoString - ISO timestamp
     * @returns {string} - Formatted time (HH:MM:SS)
     */
    formatTimestamp(isoString) {
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', { hour12: false });
    }

    /**
     * Clear all logged actions
     */
    clearLog() {
        this.actions = [];
        this.nextActionId = 1;
        this.renderLog();
    }
}

// Export for Node.js (testing) and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CaptureLog;
}
