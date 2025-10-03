/**
 * @typedef {Object} MindmapState
 * @property {string|null} currentProject - Current project name
 * @property {string|null} projectPath - Path to project file
 * @property {string} content - Markdown content
 * @property {Object.<string, any>} nodes - Node data by ID
 * @property {import('./category-manager').Category[]} categories - All categories
 * @property {import('./relationship-manager').Relationship[]} relationships - All relationships
 * @property {import('./relationship-manager').Connection[]} connections - All connections
 * @property {string|null} focusedNodeId - Currently focused node ID
 * @property {string|null} selectedNodeId - Currently selected node ID
 * @property {Object.<string, number>} customOrders - Custom node ordering
 * @property {Object.<string, {x: number, y: number}>} customPositions - Custom node positions
 * @property {Object.<string, any>} metadata - Project metadata
 * @property {boolean} isDirty - Has unsaved changes
 */

/**
 * @callback StateSubscriber
 * @param {MindmapState} state - Current state
 */

/**
 * StateManager - Centralized state management for mindmap
 *
 * Manages all application state with:
 * - Immutable updates
 * - Change notifications
 * - Undo/redo support
 */
class StateManager {
  constructor() {
    /** @type {MindmapState} */
    this.state = {
      currentProject: null,
      projectPath: null,
      content: '',
      nodes: {},
      categories: [],
      relationships: [],
      connections: [],
      focusedNodeId: null,
      selectedNodeId: null,
      customOrders: {},
      customPositions: {},
      metadata: {},
      isDirty: false
    };
    /** @type {StateSubscriber[]} */
    this.subscribers = [];
    /** @type {MindmapState[]} */
    this.history = [{ ...this.state }];
    /** @type {number} */
    this.historyIndex = 0;
    /** @type {number} */
    this.maxHistory = 50;
  }

  /**
   * Get current state (immutable copy)
   * @returns {MindmapState} Current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Update state (immutable)
   * @param {Partial<MindmapState>} updates - Partial state updates
   */
  setState(updates) {
    // Remove future history if we're not at the end
    this.history = this.history.slice(0, this.historyIndex + 1);

    // Update state
    this.state = { ...this.state, ...updates, isDirty: true };

    // Add new state to history
    this.history.push({ ...this.state });
    this.historyIndex++;

    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.historyIndex--;
    }

    this.notify();
  }

  /**
   * Subscribe to state changes
   * @param {StateSubscriber} callback - Called when state changes
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all subscribers of state change
   */
  notify() {
    this.subscribers.forEach(cb => cb(this.state));
  }

  /**
   * Undo last change
   * @returns {boolean} True if undo was performed
   */
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.state = { ...this.history[this.historyIndex] };
      this.notify();
      return true;
    }
    return false;
  }

  /**
   * Redo last undone change
   * @returns {boolean} True if redo was performed
   */
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.state = { ...this.history[this.historyIndex] };
      this.notify();
      return true;
    }
    return false;
  }

  /**
   * Can undo?
   * @returns {boolean}
   */
  canUndo() {
    return this.historyIndex > 0;
  }

  /**
   * Can redo?
   * @returns {boolean}
   */
  canRedo() {
    return this.historyIndex < this.history.length - 1;
  }

  /**
   * Load project data into state
   * @param {Partial<MindmapState> & {name: string}} projectData - Project data from file
   * @param {string} projectPath - Path to project file
   */
  loadProject(projectData, projectPath) {
    this.state = {
      ...this.state,
      currentProject: projectData.name,
      projectPath,
      content: projectData.content,
      nodes: projectData.nodes || {},
      categories: projectData.categories || [],
      relationships: projectData.relationships || [],
      connections: projectData.connections || [],
      customOrders: projectData.customOrders || {},
      customPositions: projectData.customPositions || {},
      focusedNodeId: projectData.focusedNodeId || null,
      metadata: projectData.metadata || {},
      isDirty: false
    };

    // Clear history on new project load
    this.history = [{ ...this.state }];
    this.historyIndex = 0;
    this.notify();
  }

  /**
   * Mark state as saved
   */
  markSaved() {
    this.state.isDirty = false;
    this.notify();
  }

  /**
   * Export state for saving
   * @returns {Omit<MindmapState, 'currentProject'|'projectPath'|'selectedNodeId'|'isDirty'> & {name: string}} Project data object
   */
  exportForSave() {
    return {
      name: this.state.currentProject,
      content: this.state.content,
      nodes: this.state.nodes,
      categories: this.state.categories,
      relationships: this.state.relationships,
      connections: this.state.connections,
      customOrders: this.state.customOrders,
      customPositions: this.state.customPositions,
      focusedNodeId: this.state.focusedNodeId,
      metadata: {
        ...this.state.metadata,
        modified: new Date().toISOString()
      }
    };
  }

  /**
   * Set focused node
   * @param {string|null} nodeId - Node ID or null to unfocus
   */
  setFocusedNode(nodeId) {
    this.setState({ focusedNodeId: nodeId });
  }

  /**
   * Set selected node
   * @param {string|null} nodeId - Node ID or null to deselect
   */
  setSelectedNode(nodeId) {
    this.setState({ selectedNodeId: nodeId });
  }

  /**
   * Update content
   * @param {string} content - New content string
   */
  updateContent(content) {
    this.setState({ content });
  }

  /**
   * Add category to state
   * @param {import('./category-manager').Category} category - Category object
   */
  addCategory(category) {
    this.setState({
      categories: [...this.state.categories, category]
    });
  }

  /**
   * Remove category from state
   * @param {string} categoryId - Category ID
   */
  removeCategory(categoryId) {
    this.setState({
      categories: this.state.categories.filter(c => c.id !== categoryId)
    });
  }

  /**
   * Add connection to state
   * @param {import('./relationship-manager').Connection} connection - Connection object
   */
  addConnection(connection) {
    this.setState({
      connections: [...this.state.connections, connection]
    });
  }

  /**
   * Remove connection from state
   * @param {string} connectionId - Connection ID
   */
  removeConnection(connectionId) {
    this.setState({
      connections: this.state.connections.filter(c => c.id !== connectionId)
    });
  }
}

// Export for use in renderer
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StateManager;
}
