/**
 * CaptureManager - Manages capture mode and logs user actions
 *
 * Responsibilities:
 * - Activate/deactivate capture mode
 * - Log all user actions during capture (node expand, info panel, image modal, relationships, camera)
 * - Provide chronological action log
 * - Convert logged actions to presentation slides
 *
 * Action Log Entry Structure:
 * {
 *   type: 'node-expand' | 'node-collapse' | 'info-open' | 'info-close' | 'image-open' | 'image-close' | 'relationship-show' | 'relationship-hide' | 'camera-move' | 'focus-activate' | 'focus-deactivate',
 *   timestamp: Date,
 *   data: { ... action-specific data ... }
 * }
 */

class CaptureManager {
  constructor(stateEngine) {
    this.stateEngine = stateEngine;
    this.isCapturing = false;
    this.actionLog = [];
    this.eventListeners = new Map();
  }

  /**
   * Starts capture mode - begins logging all user actions
   * @param {MindmapEngine} mindmapEngine - Reference to mindmap for initial state
   */
  startCapture(mindmapEngine) {
    if (this.isCapturing) {
      console.warn('Capture mode already active');
      return;
    }

    // Clear previous log
    this.actionLog = [];

    // Capture initial state
    this.initialState = this.stateEngine.captureState(mindmapEngine);

    // Activate capture mode
    this.isCapturing = true;
  }

  /**
   * Stops capture mode - ends action logging
   * @returns {Array} Final action log
   */
  stopCapture() {
    if (!this.isCapturing) {
      console.warn('Capture mode not active');
      return [];
    }

    // Deactivate capture mode
    this.isCapturing = false;

    // Return copy of action log
    return [...this.actionLog];
  }

  /**
   * Logs a user action during capture mode
   * @param {string} type - Action type
   * @param {Object} data - Action-specific data
   */
  logAction(type, data) {
    // Only log if capture mode is active
    if (!this.isCapturing) {
      return;
    }

    // Create action log entry with timestamp
    const action = {
      type: type,
      timestamp: new Date(),
      data: { ...data }
    };

    // Add to action log
    this.actionLog.push(action);
  }

  /**
   * Attaches event listeners to capture user actions
   * @param {Object} eventEmitter - Event emitter from mindmap/renderer
   */
  attachEventListeners(eventEmitter) {
    // TODO: Implementation in Task 3.5
    throw new Error('Not implemented: attachEventListeners');
  }

  /**
   * Removes all event listeners
   */
  detachEventListeners() {
    // TODO: Implementation in Task 3.5
    throw new Error('Not implemented: detachEventListeners');
  }

  /**
   * Gets the current action log in chronological order
   * @returns {Array} Chronological action log
   */
  getCapturedActions() {
    // Return copy of action log (already chronological)
    return [...this.actionLog];
  }

  /**
   * Clears the action log
   */
  clearLog() {
    this.actionLog = [];
  }

  /**
   * Creates a presentation slide from a logged action
   * @param {number} actionIndex - Index of action in log
   * @param {MindmapEngine} mindmapEngine - Current mindmap state
   * @returns {Object} Slide object with state snapshot
   */
  createSlideFromAction(actionIndex, mindmapEngine) {
    // Validate action index
    if (actionIndex < 0 || actionIndex >= this.actionLog.length) {
      throw new Error('Action index out of bounds');
    }

    // Get the action at specified index
    const action = this.actionLog[actionIndex];

    // Capture current mindmap state
    const currentState = this.stateEngine.captureState(mindmapEngine);

    // Generate unique slide ID
    const slideId = `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create slide object
    const slide = {
      id: slideId,
      actionType: action.type,
      actionData: { ...action.data },
      timestamp: action.timestamp,
      state: currentState
    };

    return slide;
  }

  /**
   * Checks if currently in capture mode
   * @returns {boolean} True if capturing
   */
  isCaptureActive() {
    return this.isCapturing;
  }

  /**
   * Gets the number of captured actions
   * @returns {number} Action count
   */
  getActionCount() {
    return this.actionLog.length;
  }
}

// Export for use in other modules and tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CaptureManager;
}
