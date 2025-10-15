/**
 * PresentationManager - Manages presentations, slides, and navigation
 *
 * Responsibilities:
 * - Create/load/save presentations
 * - Add/delete/reorder slides
 * - Navigate between slides (next/previous/jump)
 * - Integration with StateEngine and AnimationEngine
 * - File system operations for .presentation files
 *
 * Presentation Data Structure:
 * {
 *   id: 'presentation-uuid',
 *   name: 'Presentation Name',
 *   created: Date,
 *   modified: Date,
 *   slides: [
 *     {
 *       id: 'slide-uuid',
 *       actionType: 'node-expand' | 'info-open' | ...,
 *       actionData: { ... },
 *       timestamp: Date,
 *       state: { camera, expandedNodes, ... }
 *     }
 *   ],
 *   currentSlideIndex: 0
 * }
 */

class PresentationManager {
  constructor(stateEngine, animationEngine) {
    this.stateEngine = stateEngine;
    this.animationEngine = animationEngine;

    // Current presentation data
    this.presentation = null;

    // Current slide index
    this.currentSlideIndex = 0;
  }

  /**
   * Creates a new empty presentation
   * @param {string} name - Presentation name
   * @returns {Object} Created presentation object
   */
  createPresentation(name) {
    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Presentation name is required');
    }

    // Generate unique ID
    const presentationId = `presentation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create presentation object
    const presentation = {
      id: presentationId,
      name: name.trim(),
      created: new Date(),
      modified: new Date(),
      slides: [],
      currentSlideIndex: 0
    };

    // Set as current presentation
    this.presentation = presentation;
    this.currentSlideIndex = 0;

    return presentation;
  }

  /**
   * Adds a slide to the current presentation
   * @param {Object} slideData - Slide data object
   * @returns {Object} Added slide
   */
  addSlide(slideData) {
    // Check if presentation is loaded
    if (!this.presentation) {
      throw new Error('No presentation loaded');
    }

    // Validate slide data
    if (!slideData || typeof slideData !== 'object') {
      throw new Error('Invalid slide data');
    }

    // Validate required fields
    if (!slideData.id || !slideData.actionType || !slideData.state) {
      throw new Error('Invalid slide data');
    }

    // Add slide to presentation
    this.presentation.slides.push(slideData);

    // Update modified timestamp
    this.presentation.modified = new Date();

    return slideData;
  }

  /**
   * Deletes a slide from the current presentation
   * @param {string} slideId - ID of slide to delete
   * @returns {boolean} Success status
   */
  deleteSlide(slideId) {
    // Check if presentation is loaded
    if (!this.presentation) {
      throw new Error('No presentation loaded');
    }

    // Validate slide ID
    if (!slideId) {
      throw new Error('Invalid slide ID');
    }

    // Find slide index
    const slideIndex = this.presentation.slides.findIndex(s => s.id === slideId);

    // Check if slide exists
    if (slideIndex === -1) {
      throw new Error('Slide not found');
    }

    // Remove slide from array
    this.presentation.slides.splice(slideIndex, 1);

    // Adjust current slide index if necessary
    if (slideIndex <= this.currentSlideIndex && this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
    }

    // Update modified timestamp
    this.presentation.modified = new Date();

    return true;
  }

  /**
   * Reorders slides in the current presentation
   * @param {number} fromIndex - Source index
   * @param {number} toIndex - Destination index
   */
  reorderSlides(fromIndex, toIndex) {
    // Check if presentation is loaded
    if (!this.presentation) {
      throw new Error('No presentation loaded');
    }

    // Validate indices
    if (fromIndex < 0 || fromIndex >= this.presentation.slides.length ||
        toIndex < 0 || toIndex >= this.presentation.slides.length) {
      throw new Error('Invalid slide index');
    }

    // If same position, no action needed
    if (fromIndex === toIndex) {
      return;
    }

    // Remove slide from source position
    const [movedSlide] = this.presentation.slides.splice(fromIndex, 1);

    // Insert at destination position
    this.presentation.slides.splice(toIndex, 0, movedSlide);

    // Adjust current slide index
    if (fromIndex === this.currentSlideIndex) {
      // Moving the current slide
      this.currentSlideIndex = toIndex;
    } else if (fromIndex < this.currentSlideIndex && toIndex >= this.currentSlideIndex) {
      // Moving a slide before current to after current (shift current left)
      this.currentSlideIndex--;
    } else if (fromIndex > this.currentSlideIndex && toIndex <= this.currentSlideIndex) {
      // Moving a slide after current to before current (shift current right)
      this.currentSlideIndex++;
    }

    // Update modified timestamp
    this.presentation.modified = new Date();
  }

  /**
   * Navigates to the next slide
   * @param {MindmapEngine} mindmapEngine - Reference to mindmap for applying state
   * @returns {Promise<boolean>} Success status
   */
  async nextSlide(mindmapEngine) {
    // Check if presentation is loaded
    if (!this.presentation) {
      throw new Error('No presentation loaded');
    }

    // Validate mindmap engine
    if (!mindmapEngine) {
      throw new Error('MindmapEngine is required');
    }

    // Check if there is a next slide
    if (!this.hasNextSlide()) {
      return false;
    }

    // Move to next slide
    this.currentSlideIndex++;

    // Apply slide state
    await this._applySlideState(this.currentSlideIndex, mindmapEngine);

    return true;
  }

  /**
   * Navigates to the previous slide
   * @param {MindmapEngine} mindmapEngine - Reference to mindmap for applying state
   * @returns {Promise<boolean>} Success status
   */
  async previousSlide(mindmapEngine) {
    // Check if presentation is loaded
    if (!this.presentation) {
      throw new Error('No presentation loaded');
    }

    // Validate mindmap engine
    if (!mindmapEngine) {
      throw new Error('MindmapEngine is required');
    }

    // Check if there is a previous slide
    if (!this.hasPreviousSlide()) {
      return false;
    }

    // Move to previous slide
    this.currentSlideIndex--;

    // Apply slide state
    await this._applySlideState(this.currentSlideIndex, mindmapEngine);

    return true;
  }

  /**
   * Applies a slide's state to the mindmap with animations
   * @private
   * @param {number} slideIndex - Index of slide to apply
   * @param {MindmapEngine} mindmapEngine - Reference to mindmap
   */
  async _applySlideState(slideIndex, mindmapEngine) {
    const slide = this.presentation.slides[slideIndex];

    if (!slide || !slide.state) {
      return;
    }

    // TODO: Task 7.0 - Full state application with animations
    // For now, this is a placeholder that will be enhanced during integration
    // This method will:
    // 1. Compare current state with target state using StateEngine
    // 2. Calculate animation sequence using TransitionCalculator
    // 3. Execute animations using AnimationEngine
    // 4. Apply final state to MindmapEngine
  }

  /**
   * Jumps directly to a specific slide
   * @param {number} slideIndex - Target slide index
   * @param {MindmapEngine} mindmapEngine - Reference to mindmap for applying state
   * @returns {Promise<boolean>} Success status
   */
  async jumpToSlide(slideIndex, mindmapEngine) {
    // Check if presentation is loaded
    if (!this.presentation) {
      throw new Error('No presentation loaded');
    }

    // Validate mindmap engine
    if (!mindmapEngine) {
      throw new Error('MindmapEngine is required');
    }

    // Validate slide index
    if (slideIndex < 0 || slideIndex >= this.presentation.slides.length) {
      throw new Error('Invalid slide index');
    }

    // Update current slide index
    this.currentSlideIndex = slideIndex;

    // Apply slide state
    await this._applySlideState(slideIndex, mindmapEngine);

    return true;
  }

  /**
   * Saves the current presentation to a .presentation file
   * @param {string} filepath - Path to save file
   * @returns {Promise<boolean>} Success status
   */
  async savePresentation(filepath) {
    // TODO: Implementation in Task 5.15
    throw new Error('Not implemented: savePresentation');
  }

  /**
   * Loads a presentation from a .presentation file
   * @param {string} filepath - Path to load from
   * @returns {Promise<Object>} Loaded presentation
   */
  async loadPresentation(filepath) {
    // TODO: Implementation in Task 5.17
    throw new Error('Not implemented: loadPresentation');
  }

  /**
   * Lists all presentations in the /presentations/ folder
   * @returns {Promise<Array>} Array of presentation metadata
   */
  async listPresentations() {
    // TODO: Implementation in Task 5.19
    throw new Error('Not implemented: listPresentations');
  }

  /**
   * Gets the current presentation
   * @returns {Object|null} Current presentation or null
   */
  getCurrentPresentation() {
    return this.presentation;
  }

  /**
   * Gets the current slide index
   * @returns {number} Current slide index
   */
  getCurrentSlideIndex() {
    return this.currentSlideIndex;
  }

  /**
   * Gets the total number of slides in the current presentation
   * @returns {number} Slide count
   */
  getSlideCount() {
    return this.presentation ? this.presentation.slides.length : 0;
  }

  /**
   * Checks if there is a next slide available
   * @returns {boolean} True if next slide exists
   */
  hasNextSlide() {
    if (!this.presentation) {
      return false;
    }
    return this.currentSlideIndex < this.presentation.slides.length - 1;
  }

  /**
   * Checks if there is a previous slide available
   * @returns {boolean} True if previous slide exists
   */
  hasPreviousSlide() {
    if (!this.presentation) {
      return false;
    }
    return this.currentSlideIndex > 0;
  }
}

// Export for use in other modules and tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PresentationManager;
}
