/**
 * Focus Integrator Module
 * Connects focus mode events to camera system for auto-focus functionality
 *
 * When a user activates focus mode on a node, this module:
 * 1. Listens to 'focus-mode-enabled' events
 * 2. Gets the node position from the DOM
 * 3. Animates the camera to center on that node
 * 4. Restores camera on 'focus-mode-disabled'
 */

class FocusIntegrator {
    constructor(appEventEmitter, camera) {
        this.appEventEmitter = appEventEmitter;
        this.camera = camera;
        this.previousZoom = 1;

        if (this.appEventEmitter) {
            this.setupListeners();
        }
    }

    setupListeners() {
        // Listen for focus mode activation
        this.appEventEmitter.on('focus-mode-enabled', (data) => {
            this.handleFocusActivation(data);
        });

        // Listen for focus mode deactivation
        this.appEventEmitter.on('focus-mode-disabled', (data) => {
            this.handleFocusDeactivation(data);
        });
    }

    handleFocusActivation({ nodeId, zoom }) {
        if (!this.camera) {
            console.warn('FocusIntegrator: Camera not available');
            return;
        }

        // Store the previous zoom level for restoration
        this.previousZoom = zoom || 1;

        // Get the focused node element from DOM
        const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
        if (!nodeElement) {
            console.warn(`FocusIntegrator: Node element not found for ID ${nodeId}`);
            return;
        }

        // Get the node's position in the viewport
        const rect = nodeElement.getBoundingClientRect();

        // Calculate the center position of the node
        const targetX = rect.left + rect.width / 2;
        const targetY = rect.top + rect.height / 2;

        // Zoom level for focus (1.5x magnification)
        const focusZoom = 1.5;

        // Animate camera to focus on the node
        if (typeof this.camera.calculateFocus === 'function') {
            this.camera.calculateFocus(targetX, targetY, focusZoom);
            console.log(`FocusIntegrator: Camera focusing on node ${nodeId} at (${targetX}, ${targetY})`);
        } else {
            console.warn('FocusIntegrator: camera.calculateFocus() not available');
        }
    }

    handleFocusDeactivation({ previousZoom }) {
        if (!this.camera) {
            console.warn('FocusIntegrator: Camera not available');
            return;
        }

        // Calculate center of the viewport
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // Use the stored zoom level or the provided one
        const restoreZoom = previousZoom || this.previousZoom || 1;

        // Restore camera to previous position/zoom
        if (typeof this.camera.calculateFocus === 'function') {
            this.camera.calculateFocus(centerX, centerY, restoreZoom);
            console.log(`FocusIntegrator: Camera restored to zoom level ${restoreZoom}`);
        } else {
            console.warn('FocusIntegrator: camera.calculateFocus() not available');
        }
    }

    // Public method to manually trigger focus
    focusOnNode(nodeId, zoomLevel = 1.5) {
        if (this.appEventEmitter) {
            this.appEventEmitter.emit('focus-mode-enabled', {
                nodeId: nodeId,
                zoom: zoomLevel
            });
        }
    }

    // Public method to manually unfocus
    unfocus() {
        if (this.appEventEmitter) {
            this.appEventEmitter.emit('focus-mode-disabled', {
                previousZoom: this.previousZoom
            });
        }
    }
}

// Export for use in tests or as CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FocusIntegrator;
}
