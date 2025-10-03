/**
 * @typedef {Object} Category
 * @property {string} id - Unique category identifier
 * @property {string} name - Category name
 * @property {string} color - Hex color code (e.g., "#ff6b6b")
 * @property {string[]} nodeIds - Array of node IDs assigned to this category
 */

/**
 * CategoryManager - Handles category creation and assignment
 *
 * Categories are used to organize and filter nodes visually in the mindmap.
 * Each category has a unique ID, name, color, and tracks which nodes it's assigned to.
 */
class CategoryManager {
  constructor() {
    /** @type {Category[]} */
    this.categories = [];
    /** @type {number} */
    this.idCounter = 0;
  }

  /**
   * Create a new category
   * @param {string} name - Category name
   * @param {string} color - Hex color code (e.g., "#ff6b6b")
   * @returns {Category}
   */
  createCategory(name, color) {
    const category = {
      id: `cat-${Date.now()}-${this.idCounter++}`,
      name,
      color,
      nodeIds: []
    };
    this.categories.push(category);
    return category;
  }

  /**
   * Assign a category to a node
   * @param {string} categoryId - Category ID
   * @param {string} nodeId - Node ID
   */
  assignToNode(categoryId, nodeId) {
    const category = this.categories.find(c => c.id === categoryId);
    if (category && !category.nodeIds.includes(nodeId)) {
      category.nodeIds.push(nodeId);
    }
  }

  /**
   * Remove a category from a node
   * @param {string} categoryId - Category ID
   * @param {string} nodeId - Node ID
   */
  removeFromNode(categoryId, nodeId) {
    const category = this.categories.find(c => c.id === categoryId);
    if (category) {
      category.nodeIds = category.nodeIds.filter(id => id !== nodeId);
    }
  }

  /**
   * Get all categories assigned to a node
   * @param {string} nodeId - Node ID
   * @returns {Category[]} Array of categories
   */
  getNodeCategories(nodeId) {
    return this.categories.filter(c => c.nodeIds.includes(nodeId));
  }

  /**
   * Get all categories
   * @returns {Category[]} All categories
   */
  getAllCategories() {
    return this.categories;
  }

  /**
   * Delete a category
   * @param {string} categoryId - Category ID
   */
  deleteCategory(categoryId) {
    this.categories = this.categories.filter(c => c.id !== categoryId);
  }

  /**
   * Load categories from project data
   * @param {Category[]|null|undefined} categories - Categories array from project file
   */
  loadCategories(categories) {
    this.categories = categories || [];
  }

  /**
   * Export categories for saving
   * @returns {Category[]} Categories array
   */
  exportCategories() {
    return this.categories;
  }
}

// Export for use in renderer
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CategoryManager;
}
