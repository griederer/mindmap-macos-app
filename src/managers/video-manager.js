/**
 * @typedef {Object} VideoData
 * @property {string} url - Video URL (base64 data URI or file path)
 * @property {string} thumbnail - Thumbnail image as base64 data URI
 * @property {string} filename - Original filename
 * @property {number} size - File size in bytes
 * @property {number} duration - Video duration in seconds
 * @property {'embedded'|'external'} storageType - Storage strategy
 * @property {string} addedAt - ISO timestamp of when video was added
 * @property {boolean} loop - Whether video should loop automatically
 */

/**
 * @typedef {Object.<string, VideoData[]>} NodeVideosMap - Map of node IDs to video arrays
 */

/**
 * VideoManager - Handles video operations for nodes
 *
 * Manages videos attached to nodes, including:
 * - Adding videos (base64 or file references)
 * - Removing videos
 * - Thumbnail generation
 * - Hybrid storage (embedded vs external)
 * - Validation (size, duration, format)
 *
 * Storage Strategy:
 * - Videos < 2MB: Embedded as base64 (portable)
 * - Videos >= 2MB: Stored externally in .media/ folder (efficient)
 */
class VideoManager {
  constructor() {
    /** @type {NodeVideosMap} */
    this.nodeVideos = {}; // nodeId -> array of video data

    // Configuration constants
    this.MAX_FILE_SIZE = 10 * 1024 * 1024;  // 10MB
    this.MAX_DURATION = 30;                  // 30 seconds
    this.STORAGE_THRESHOLD = 2 * 1024 * 1024; // 2MB
    this.MAX_VIDEOS_PER_NODE = 3;            // Limit to prevent UI clutter
    this.ACCEPTED_FORMATS = ['video/mp4', 'video/webm'];
    this.THUMBNAIL_WIDTH = 200;
    this.THUMBNAIL_HEIGHT = 150;
    this.THUMBNAIL_QUALITY = 0.8;
  }

  /**
   * Add video to a node
   * @param {string} nodeId - Node ID
   * @param {VideoData} videoData - Video metadata
   * @returns {number} Index of added video
   * @throws {Error} If max videos limit reached
   */
  addVideo(nodeId, videoData) {
    if (!this.nodeVideos[nodeId]) {
      this.nodeVideos[nodeId] = [];
    }

    // Check limit
    if (this.nodeVideos[nodeId].length >= this.MAX_VIDEOS_PER_NODE) {
      throw new Error(`Maximum ${this.MAX_VIDEOS_PER_NODE} videos per node`);
    }

    this.nodeVideos[nodeId].push(videoData);
    return this.nodeVideos[nodeId].length - 1;
  }

  /**
   * Remove video from a node
   * @param {string} nodeId - Node ID
   * @param {number} videoIndex - Index of video to remove
   * @returns {boolean} True if removed, false if not found
   */
  removeVideo(nodeId, videoIndex) {
    if (this.nodeVideos[nodeId]) {
      if (videoIndex >= 0 && videoIndex < this.nodeVideos[nodeId].length) {
        this.nodeVideos[nodeId].splice(videoIndex, 1);
        if (this.nodeVideos[nodeId].length === 0) {
          delete this.nodeVideos[nodeId];
        }
        return true;
      }
    }
    return false;
  }

  /**
   * Get all videos for a node
   * @param {string} nodeId - Node ID
   * @returns {VideoData[]} Array of video data
   */
  getNodeVideos(nodeId) {
    return this.nodeVideos[nodeId] || [];
  }

  /**
   * Check if node has videos
   * @param {string} nodeId - Node ID
   * @returns {boolean}
   */
  hasVideos(nodeId) {
    return !!(this.nodeVideos[nodeId] && this.nodeVideos[nodeId].length > 0);
  }

  /**
   * Get video count for a node
   * @param {string} nodeId - Node ID
   * @returns {number}
   */
  getVideoCount(nodeId) {
    return this.nodeVideos[nodeId] ? this.nodeVideos[nodeId].length : 0;
  }

  /**
   * Clear all videos for a node
   * @param {string} nodeId - Node ID
   */
  clearNodeVideos(nodeId) {
    delete this.nodeVideos[nodeId];
  }

  /**
   * Toggle loop setting for a video
   * @param {string} nodeId - Node ID
   * @param {number} videoIndex - Index of video
   * @param {boolean} loop - Loop enabled/disabled
   * @returns {boolean} True if updated, false if not found
   */
  setVideoLoop(nodeId, videoIndex, loop) {
    if (this.nodeVideos[nodeId] && this.nodeVideos[nodeId][videoIndex]) {
      this.nodeVideos[nodeId][videoIndex].loop = loop;
      return true;
    }
    return false;
  }

  /**
   * Validate video file
   * @param {File} file - Video file to validate
   * @returns {Promise<{valid: boolean, error?: string}>}
   */
  async validateVideo(file) {
    // Check format
    if (!this.ACCEPTED_FORMATS.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid format. Only MP4 and WebM are supported.`
      };
    }

    // Check size
    if (file.size > this.MAX_FILE_SIZE) {
      const maxMB = (this.MAX_FILE_SIZE / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error: `File too large. Maximum size is ${maxMB}MB.`
      };
    }

    // Check duration
    try {
      const duration = await this.getVideoDuration(file);
      if (duration > this.MAX_DURATION) {
        return {
          valid: false,
          error: `Video too long. Maximum duration is ${this.MAX_DURATION} seconds.`
        };
      }
    } catch (error) {
      return {
        valid: false,
        error: 'Could not read video duration. File may be corrupted.'
      };
    }

    return { valid: true };
  }

  /**
   * Get video duration from file
   * @param {File} file - Video file
   * @returns {Promise<number>} Duration in seconds
   */
  getVideoDuration(file) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };

      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        reject(new Error('Failed to load video metadata'));
      };

      video.src = URL.createObjectURL(file);
    });
  }

  /**
   * Determine storage type based on file size
   * @param {number} size - File size in bytes
   * @returns {'embedded'|'external'}
   */
  determineStorageType(size) {
    return size < this.STORAGE_THRESHOLD ? 'embedded' : 'external';
  }

  /**
   * Generate thumbnail from video file
   * @param {File} file - Video file
   * @returns {Promise<string>} Thumbnail as base64 data URI
   */
  async generateThumbnail(file) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        // Set canvas dimensions
        canvas.width = this.THUMBNAIL_WIDTH;
        canvas.height = this.THUMBNAIL_HEIGHT;

        // Seek to 1 second or 10% of duration (whichever is shorter)
        const seekTime = Math.min(1, video.duration * 0.1);
        video.currentTime = seekTime;
      };

      video.onseeked = () => {
        // Calculate dimensions to maintain aspect ratio
        let width = video.videoWidth;
        let height = video.videoHeight;
        const aspectRatio = width / height;

        if (width > height) {
          width = this.THUMBNAIL_WIDTH;
          height = width / aspectRatio;
        } else {
          height = this.THUMBNAIL_HEIGHT;
          width = height * aspectRatio;
        }

        // Center image on canvas
        const x = (this.THUMBNAIL_WIDTH - width) / 2;
        const y = (this.THUMBNAIL_HEIGHT - height) / 2;

        // Fill background with black
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.THUMBNAIL_WIDTH, this.THUMBNAIL_HEIGHT);

        // Draw video frame
        ctx.drawImage(video, x, y, width, height);

        // Convert to base64
        const thumbnail = canvas.toDataURL('image/jpeg', this.THUMBNAIL_QUALITY);

        window.URL.revokeObjectURL(video.src);
        resolve(thumbnail);
      };

      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        reject(new Error('Failed to generate thumbnail'));
      };

      video.src = URL.createObjectURL(file);
    });
  }

  /**
   * Convert file to base64 data URI
   * @param {File} file - File to convert
   * @returns {Promise<string>} Base64 data URI
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Format duration as MM:SS
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration (e.g., "1:25")
   */
  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Format file size with units
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted size (e.g., "2.5 MB")
   */
  formatFileSize(bytes) {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  }

  /**
   * Load videos from node data
   * @param {Object.<string, {videos?: VideoData[]}>} nodeData - Node data object from project file
   */
  loadFromNodeData(nodeData) {
    this.nodeVideos = {};
    Object.keys(nodeData).forEach(nodeId => {
      if (nodeData[nodeId].videos && nodeData[nodeId].videos.length > 0) {
        this.nodeVideos[nodeId] = nodeData[nodeId].videos;
      }
    });
  }

  /**
   * Export videos back to node data format
   * @returns {Object.<string, {videos: VideoData[]}>} Node data object with videos
   */
  exportToNodeData() {
    const nodeData = {};
    Object.keys(this.nodeVideos).forEach(nodeId => {
      nodeData[nodeId] = {
        videos: this.nodeVideos[nodeId]
      };
    });
    return nodeData;
  }

  /**
   * Save external video to .media/ folder
   * This is a placeholder - actual implementation depends on Electron file system access
   * @param {File} file - Video file
   * @param {string} projectPath - Path to project directory
   * @returns {Promise<string>} Path to saved file
   */
  async saveExternalVideo(file, projectPath) {
    // This will be implemented with Electron's fs module in main process
    // For now, return a mock path
    const hash = await this.generateFileHash(file);
    const extension = file.name.split('.').pop();
    const filename = `video-${hash}.${extension}`;
    return `${projectPath}/.media/${filename}`;
  }

  /**
   * Generate SHA-256 hash of file for unique naming
   * @param {File} file - File to hash
   * @returns {Promise<string>} Hash string
   */
  async generateFileHash(file) {
    const buffer = await file.arrayBuffer();
    // Support both browser crypto (global) and Node.js crypto
    const cryptoObj = typeof window !== 'undefined' ? window.crypto : global.crypto;
    const hashBuffer = await cryptoObj.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.substring(0, 16); // First 16 chars for filename
  }
}

// Export for use in renderer
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VideoManager;
}
