/**
 * Manager Integration Module
 *
 * Integrates all managers with the renderer and provides
 * a unified interface for state management.
 */

// Import managers (will be loaded via script tags in HTML)
// const StateManager = require('./state-manager');
// const CategoryManager = require('./category-manager');
// const RelationshipManager = require('./relationship-manager');
// const ImageManager = require('./image-manager');

/**
 * ManagerCoordinator - Coordinates all managers and provides unified API
 *
 * This class acts as a facade for all manager functionality,
 * simplifying the renderer's interaction with the state system.
 */
class ManagerCoordinator {
  constructor() {
    // Initialize all managers
    this.stateManager = new StateManager();
    this.categoryManager = new CategoryManager();
    this.relationshipManager = new RelationshipManager();
    this.imageManager = new ImageManager();

    // Wire up managers to state manager
    this.setupStateListeners();
  }

  /**
   * Setup listeners to sync managers with state
   */
  setupStateListeners() {
    this.stateManager.subscribe((state) => {
      // Sync category manager
      if (state.categories) {
        this.categoryManager.loadCategories(state.categories);
      }

      // Sync relationship manager
      if (state.relationships && state.connections) {
        this.relationshipManager.loadData(state.relationships, state.connections);
      }

      // Sync image manager
      if (state.nodes) {
        this.imageManager.loadFromNodeData(state.nodes);
      }
    });
  }

  /**
   * Load project data into all managers
   * @param {Object} projectData - Project data from file
   * @param {string} projectPath - Path to project file
   */
  loadProject(projectData, projectPath) {
    this.stateManager.loadProject(projectData, projectPath);
  }

  /**
   * Get current state
   * @returns {Object} Current state
   */
  getState() {
    return this.stateManager.getState();
  }

  /**
   * Update state
   * @param {Object} updates - Partial state updates
   */
  updateState(updates) {
    this.stateManager.setState(updates);
  }

  /**
   * Export state for saving
   * @returns {Object} Project data object
   */
  exportForSave() {
    const baseState = this.stateManager.exportForSave();

    // Merge manager data
    return {
      ...baseState,
      categories: this.categoryManager.exportCategories(),
      ...this.relationshipManager.exportData(),
      nodes: {
        ...baseState.nodes,
        ...this.enrichNodesWithImages(baseState.nodes)
      }
    };
  }

  /**
   * Enrich nodes with image data
   * @param {Object} nodes - Node data
   * @returns {Object} Nodes with images
   */
  enrichNodesWithImages(nodes) {
    const enriched = {};
    Object.keys(nodes).forEach(nodeId => {
      enriched[nodeId] = {
        ...nodes[nodeId],
        images: this.imageManager.getNodeImages(nodeId)
      };
    });
    return enriched;
  }

  /**
   * Mark state as saved
   */
  markSaved() {
    this.stateManager.markSaved();
  }

  /**
   * Undo last change
   * @returns {boolean} True if undo was performed
   */
  undo() {
    return this.stateManager.undo();
  }

  /**
   * Redo last undone change
   * @returns {boolean} True if redo was performed
   */
  redo() {
    return this.stateManager.redo();
  }

  /**
   * Can undo?
   * @returns {boolean}
   */
  canUndo() {
    return this.stateManager.canUndo();
  }

  /**
   * Can redo?
   * @returns {boolean}
   */
  canRedo() {
    return this.stateManager.canRedo();
  }

  // === CATEGORY OPERATIONS ===

  /**
   * Create a new category
   * @param {string} name - Category name
   * @param {string} color - Hex color code
   * @returns {Object} Category object
   */
  createCategory(name, color) {
    const category = this.categoryManager.createCategory(name, color);
    this.stateManager.addCategory(category);
    return category;
  }

  /**
   * Assign category to node
   * @param {string} categoryId - Category ID
   * @param {string} nodeId - Node ID
   */
  assignCategoryToNode(categoryId, nodeId) {
    this.categoryManager.assignToNode(categoryId, nodeId);
    const categories = this.categoryManager.exportCategories();
    this.stateManager.setState({ categories });
  }

  /**
   * Remove category from node
   * @param {string} categoryId - Category ID
   * @param {string} nodeId - Node ID
   */
  removeCategoryFromNode(categoryId, nodeId) {
    this.categoryManager.removeFromNode(categoryId, nodeId);
    const categories = this.categoryManager.exportCategories();
    this.stateManager.setState({ categories });
  }

  /**
   * Get all categories for a node
   * @param {string} nodeId - Node ID
   * @returns {Array} Array of categories
   */
  getNodeCategories(nodeId) {
    return this.categoryManager.getNodeCategories(nodeId);
  }

  /**
   * Get all categories
   * @returns {Array} All categories
   */
  getAllCategories() {
    return this.categoryManager.getAllCategories();
  }

  /**
   * Delete a category
   * @param {string} categoryId - Category ID
   */
  deleteCategory(categoryId) {
    this.categoryManager.deleteCategory(categoryId);
    this.stateManager.removeCategory(categoryId);
  }

  // === RELATIONSHIP OPERATIONS ===

  /**
   * Create a new relationship type
   * @param {string} name - Relationship name
   * @param {string} color - Hex color code
   * @param {string} dashPattern - SVG dash pattern
   * @returns {Object} Relationship object
   */
  createRelationship(name, color, dashPattern = '0') {
    const relationship = this.relationshipManager.createRelationship(name, color, dashPattern);
    const { relationships } = this.relationshipManager.exportData();
    this.stateManager.setState({ relationships });
    return relationship;
  }

  /**
   * Connect two nodes
   * @param {string} fromNodeId - Source node ID
   * @param {string} toNodeId - Target node ID
   * @param {string} relationshipId - Relationship type ID
   * @returns {Object} Connection object
   */
  connectNodes(fromNodeId, toNodeId, relationshipId) {
    const connection = this.relationshipManager.connect(fromNodeId, toNodeId, relationshipId);
    this.stateManager.addConnection(connection);
    return connection;
  }

  /**
   * Disconnect nodes
   * @param {string} connectionId - Connection ID
   */
  disconnectNodes(connectionId) {
    this.relationshipManager.disconnect(connectionId);
    this.stateManager.removeConnection(connectionId);
  }

  /**
   * Get all connections for a node
   * @param {string} nodeId - Node ID
   * @returns {Array} Array of connections
   */
  getNodeConnections(nodeId) {
    return this.relationshipManager.getNodeConnections(nodeId);
  }

  /**
   * Get all relationships
   * @returns {Array} All relationships
   */
  getAllRelationships() {
    return this.relationshipManager.getAllRelationships();
  }

  /**
   * Get all connections
   * @returns {Array} All connections
   */
  getAllConnections() {
    return this.relationshipManager.getAllConnections();
  }

  /**
   * Delete a relationship type
   * @param {string} relationshipId - Relationship ID
   */
  deleteRelationship(relationshipId) {
    this.relationshipManager.deleteRelationship(relationshipId);
    const { relationships, connections } = this.relationshipManager.exportData();
    this.stateManager.setState({ relationships, connections });
  }

  // === IMAGE OPERATIONS ===

  /**
   * Add image to node
   * @param {string} nodeId - Node ID
   * @param {string} imageData - Base64 encoded image or URL
   * @returns {number} Index of added image
   */
  addImageToNode(nodeId, imageData) {
    const index = this.imageManager.addImage(nodeId, imageData);
    const nodes = {
      ...this.stateManager.getState().nodes,
      [nodeId]: {
        ...this.stateManager.getState().nodes[nodeId],
        images: this.imageManager.getNodeImages(nodeId)
      }
    };
    this.stateManager.setState({ nodes });
    return index;
  }

  /**
   * Remove image from node
   * @param {string} nodeId - Node ID
   * @param {number} imageIndex - Index of image to remove
   */
  removeImageFromNode(nodeId, imageIndex) {
    this.imageManager.removeImage(nodeId, imageIndex);
    const nodes = {
      ...this.stateManager.getState().nodes,
      [nodeId]: {
        ...this.stateManager.getState().nodes[nodeId],
        images: this.imageManager.getNodeImages(nodeId)
      }
    };
    this.stateManager.setState({ nodes });
  }

  /**
   * Get all images for a node
   * @param {string} nodeId - Node ID
   * @returns {Array} Array of image data
   */
  getNodeImages(nodeId) {
    return this.imageManager.getNodeImages(nodeId);
  }

  /**
   * Check if node has images
   * @param {string} nodeId - Node ID
   * @returns {boolean}
   */
  nodeHasImages(nodeId) {
    return this.imageManager.hasImages(nodeId);
  }

  /**
   * Get image count for a node
   * @param {string} nodeId - Node ID
   * @returns {number}
   */
  getNodeImageCount(nodeId) {
    return this.imageManager.getImageCount(nodeId);
  }

  // === FOCUS & SELECTION ===

  /**
   * Set focused node
   * @param {string|null} nodeId - Node ID or null to unfocus
   */
  setFocusedNode(nodeId) {
    this.stateManager.setFocusedNode(nodeId);
  }

  /**
   * Set selected node
   * @param {string|null} nodeId - Node ID or null to deselect
   */
  setSelectedNode(nodeId) {
    this.stateManager.setSelectedNode(nodeId);
  }

  /**
   * Get focused node ID
   * @returns {string|null}
   */
  getFocusedNodeId() {
    return this.stateManager.getState().focusedNodeId;
  }

  /**
   * Get selected node ID
   * @returns {string|null}
   */
  getSelectedNodeId() {
    return this.stateManager.getState().selectedNodeId;
  }
}

// Export for use in renderer
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ManagerCoordinator;
}
