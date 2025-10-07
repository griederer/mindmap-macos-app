/**
 * @typedef {string} ImageData - Base64 encoded image or URL
 */

/**
 * @typedef {Object.<string, ImageData[]>} NodeImagesMap - Map of node IDs to image arrays
 */

/**
 * ImageManager - Handles image operations for nodes
 *
 * Manages images attached to nodes, including:
 * - Adding images (base64 or URLs)
 * - Removing images
 * - Image lightbox display
 */
class ImageManager {
  constructor() {
    /** @type {NodeImagesMap} */
    this.nodeImages = {}; // nodeId -> array of image data
  }

  /**
   * Add image to a node
   * @param {string} nodeId - Node ID
   * @param {ImageData} imageData - Base64 encoded image or URL
   * @returns {number} Index of added image
   */
  addImage(nodeId, imageData) {
    if (!this.nodeImages[nodeId]) {
      this.nodeImages[nodeId] = [];
    }
    this.nodeImages[nodeId].push(imageData);
    return this.nodeImages[nodeId].length - 1;
  }

  /**
   * Remove image from a node
   * @param {string} nodeId - Node ID
   * @param {number} imageIndex - Index of image to remove
   */
  removeImage(nodeId, imageIndex) {
    if (this.nodeImages[nodeId]) {
      this.nodeImages[nodeId].splice(imageIndex, 1);
      if (this.nodeImages[nodeId].length === 0) {
        delete this.nodeImages[nodeId];
      }
    }
  }

  /**
   * Get all images for a node
   * @param {string} nodeId - Node ID
   * @returns {ImageData[]} Array of image data
   */
  getNodeImages(nodeId) {
    return this.nodeImages[nodeId] || [];
  }

  /**
   * Check if node has images
   * @param {string} nodeId - Node ID
   * @returns {boolean}
   */
  hasImages(nodeId) {
    return !!(this.nodeImages[nodeId] && this.nodeImages[nodeId].length > 0);
  }

  /**
   * Get image count for a node
   * @param {string} nodeId - Node ID
   * @returns {number}
   */
  getImageCount(nodeId) {
    return this.nodeImages[nodeId] ? this.nodeImages[nodeId].length : 0;
  }

  /**
   * Clear all images for a node
   * @param {string} nodeId - Node ID
   */
  clearNodeImages(nodeId) {
    delete this.nodeImages[nodeId];
  }

  /**
   * Load images from node data
   * @param {Object.<string, {images?: ImageData[]}>} nodeData - Node data object from project file
   */
  loadFromNodeData(nodeData) {
    this.nodeImages = {};
    Object.keys(nodeData).forEach(nodeId => {
      if (nodeData[nodeId].images && nodeData[nodeId].images.length > 0) {
        this.nodeImages[nodeId] = nodeData[nodeId].images;
      }
    });
  }

  /**
   * Export images back to node data format
   * @returns {Object.<string, {images: ImageData[]}>} Node data object with images
   */
  exportToNodeData() {
    const nodeData = {};
    Object.keys(this.nodeImages).forEach(nodeId => {
      nodeData[nodeId] = {
        images: this.nodeImages[nodeId]
      };
    });
    return nodeData;
  }

  /**
   * Convert URL to base64 (for external images)
   * @param {string} url - Image URL
   * @returns {Promise<string>} Base64 encoded image
   */
  async urlToBase64(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.onerror = reject;
      img.src = url;
    });
  }
}

// Export for use in renderer
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageManager;
}
