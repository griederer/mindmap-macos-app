/**
 * PresentationUI - User interface for presentation mode and capture mode
 *
 * Responsibilities:
 * - Capture mode controls (start/stop buttons, status indicator)
 * - Action log viewer (scrollable list, create slide buttons)
 * - Timeline component (horizontal scrollable, slide icons)
 * - Presentation selector (dropdown, new/rename/delete)
 * - Keyboard navigation (arrow keys for prev/next)
 *
 * UI Structure:
 * - Capture Panel: Start/Stop recording user actions
 * - Action Log: Chronological list of captured actions
 * - Timeline: Visual slide sequence with icons
 * - Presentation Selector: Manage multiple presentations
 * - Navigation Controls: Prev/Next/Jump controls
 */

class PresentationUI {
  constructor(captureManager, presentationManager) {
    this.captureManager = captureManager;
    this.presentationManager = presentationManager;

    // MindmapEngine reference (for navigation)
    this.mindmapEngine = null;

    // UI element references (will be set when attached to DOM)
    this.elements = {
      // Capture mode
      capturePanel: null,
      captureStartBtn: null,
      captureStopBtn: null,
      captureStatus: null,

      // Action log
      actionLogPanel: null,
      actionLogList: null,

      // Timeline
      timelinePanel: null,
      timelineContainer: null,

      // Presentation selector
      presentationSelector: null,
      presentationDropdown: null,
      newPresentationBtn: null,
      renamePresentationBtn: null,
      deletePresentationBtn: null,

      // Navigation controls
      prevSlideBtn: null,
      nextSlideBtn: null,
      slideCounter: null
    };

    // Event listeners (for cleanup)
    this.boundHandlers = {};
  }

  /**
   * Initializes the UI and attaches to DOM
   * @param {Object} elementIds - Object mapping element purposes to DOM IDs
   */
  initialize(elementIds) {
    // Get DOM element references
    this._getElementReferences(elementIds);

    // Attach event listeners
    this._attachEventListeners();

    // Initialize UI state
    this._updateUIState();
  }

  /**
   * Gets references to DOM elements
   * @private
   * @param {Object} elementIds - Element ID mappings
   */
  _getElementReferences(elementIds) {
    // Capture mode elements
    this.elements.capturePanel = document.getElementById(elementIds.capturePanel || 'capture-panel');
    this.elements.captureStartBtn = document.getElementById(elementIds.captureStartBtn || 'capture-start-btn');
    this.elements.captureStopBtn = document.getElementById(elementIds.captureStopBtn || 'capture-stop-btn');
    this.elements.captureStatus = document.getElementById(elementIds.captureStatus || 'capture-status');

    // Action log elements
    this.elements.actionLogPanel = document.getElementById(elementIds.actionLogPanel || 'action-log-panel');
    this.elements.actionLogList = document.getElementById(elementIds.actionLogList || 'action-log-list');

    // Timeline elements
    this.elements.timelinePanel = document.getElementById(elementIds.timelinePanel || 'timeline-panel');
    this.elements.timelineContainer = document.getElementById(elementIds.timelineContainer || 'timeline-container');

    // Presentation selector elements
    this.elements.presentationSelector = document.getElementById(elementIds.presentationSelector || 'presentation-selector');
    this.elements.presentationDropdown = document.getElementById(elementIds.presentationDropdown || 'presentation-dropdown');
    this.elements.newPresentationBtn = document.getElementById(elementIds.newPresentationBtn || 'new-presentation-btn');
    this.elements.renamePresentationBtn = document.getElementById(elementIds.renamePresentationBtn || 'rename-presentation-btn');
    this.elements.deletePresentationBtn = document.getElementById(elementIds.deletePresentationBtn || 'delete-presentation-btn');

    // Navigation elements
    this.elements.prevSlideBtn = document.getElementById(elementIds.prevSlideBtn || 'prev-slide-btn');
    this.elements.nextSlideBtn = document.getElementById(elementIds.nextSlideBtn || 'next-slide-btn');
    this.elements.slideCounter = document.getElementById(elementIds.slideCounter || 'slide-counter');

    // Slides panel elements
    this.elements.slidesPanel = document.getElementById(elementIds.slidesPanel || 'slidesPanel');
    this.elements.slidesList = document.getElementById(elementIds.slidesList || 'slidesList');
  }

  /**
   * Attaches event listeners to UI elements
   * @private
   */
  _attachEventListeners() {
    // Capture mode handlers
    if (this.elements.captureStartBtn) {
      this.boundHandlers.startCapture = this._handleStartCapture.bind(this);
      this.elements.captureStartBtn.addEventListener('click', this.boundHandlers.startCapture);
    }

    if (this.elements.captureStopBtn) {
      this.boundHandlers.stopCapture = this._handleStopCapture.bind(this);
      this.elements.captureStopBtn.addEventListener('click', this.boundHandlers.stopCapture);
    }

    // Navigation handlers
    if (this.elements.prevSlideBtn) {
      this.boundHandlers.prevSlide = this._handlePrevSlide.bind(this);
      this.elements.prevSlideBtn.addEventListener('click', this.boundHandlers.prevSlide);
    }

    if (this.elements.nextSlideBtn) {
      this.boundHandlers.nextSlide = this._handleNextSlide.bind(this);
      this.elements.nextSlideBtn.addEventListener('click', this.boundHandlers.nextSlide);
    }

    // Keyboard navigation
    this.boundHandlers.keydown = this._handleKeyboardNavigation.bind(this);
    document.addEventListener('keydown', this.boundHandlers.keydown);

    // Presentation selector handlers
    if (this.elements.newPresentationBtn) {
      this.boundHandlers.newPresentation = this._handleNewPresentation.bind(this);
      this.elements.newPresentationBtn.addEventListener('click', this.boundHandlers.newPresentation);
    }

    // Timeline drag-and-drop handler
    if (this.elements.timelineContainer) {
      this.boundHandlers.timelineDragOver = (e) => {
        e.preventDefault(); // Allow drop
      };
      this.elements.timelineContainer.addEventListener('dragover', this.boundHandlers.timelineDragOver);
    }
  }

  /**
   * Handles start capture button click
   * @private
   */
  _handleStartCapture() {
    // Start capturing user actions
    this.captureManager.startCapture();

    // Update UI to reflect capture mode is active
    this._updateCaptureUI();

    // Update action log (will show empty state initially)
    this._updateActionLog();
  }

  /**
   * Handles stop capture button click
   * @private
   */
  _handleStopCapture() {
    // Stop capturing user actions
    this.captureManager.stopCapture();

    // Update UI to reflect capture mode is inactive
    this._updateCaptureUI();

    // Update action log (will show all captured actions)
    this._updateActionLog();
  }

  /**
   * Handles previous slide navigation
   * @private
   */
  async _handlePrevSlide() {
    const presentation = this.presentationManager.getCurrentPresentation();
    if (!presentation) {
      console.warn('Cannot navigate: No presentation loaded');
      return;
    }

    try {
      const success = await this.presentationManager.previousSlide(this.mindmapEngine);
      if (success) {
        // Update UI after navigation
        this._updateTimeline();
        this._updateNavigationUI();
        console.log('Navigated to previous slide');
      }
    } catch (error) {
      console.error('Failed to navigate to previous slide:', error);
    }
  }

  /**
   * Handles next slide navigation
   * @private
   */
  async _handleNextSlide() {
    const presentation = this.presentationManager.getCurrentPresentation();
    if (!presentation) {
      console.warn('Cannot navigate: No presentation loaded');
      return;
    }

    try {
      const success = await this.presentationManager.nextSlide(this.mindmapEngine);
      if (success) {
        // Update UI after navigation
        this._updateTimeline();
        this._updateNavigationUI();
        console.log('Navigated to next slide');
      }
    } catch (error) {
      console.error('Failed to navigate to next slide:', error);
    }
  }

  /**
   * Handles keyboard navigation (arrow keys)
   * @private
   * @param {KeyboardEvent} event - Keyboard event
   */
  async _handleKeyboardNavigation(event) {
    // Check if presentation is loaded
    const presentation = this.presentationManager.getCurrentPresentation();
    if (!presentation) {
      return;
    }

    // Handle arrow keys for navigation
    if (event.key === 'ArrowLeft') {
      // Previous slide
      try {
        const success = await this.presentationManager.previousSlide(this.mindmapEngine);
        if (success) {
          // Update UI after navigation
          this._updateTimeline();
          this._updateNavigationUI();
        }
      } catch (error) {
        console.error('Failed to navigate to previous slide:', error);
      }
    } else if (event.key === 'ArrowRight') {
      // Next slide
      try {
        const success = await this.presentationManager.nextSlide(this.mindmapEngine);
        if (success) {
          // Update UI after navigation
          this._updateTimeline();
          this._updateNavigationUI();
        }
      } catch (error) {
        console.error('Failed to navigate to next slide:', error);
      }
    }
  }

  /**
   * Handles new presentation creation
   * @private
   */
  _handleNewPresentation() {
    // Will be implemented in Task 6.21
    console.log('New presentation clicked');
  }

  /**
   * Updates the UI state based on current presentation and capture status
   * @private
   */
  _updateUIState() {
    // Update capture mode UI
    this._updateCaptureUI();

    // Update action log
    this._updateActionLog();

    // Update navigation UI
    this._updateNavigationUI();

    // Update timeline
    this._updateTimeline();

    // Update slides list
    this._renderSlidesList();
  }

  /**
   * Updates capture mode UI elements
   * @private
   */
  _updateCaptureUI() {
    const isCapturing = this.captureManager.isCaptureActive();

    if (this.elements.captureStartBtn) {
      this.elements.captureStartBtn.disabled = isCapturing;
    }

    if (this.elements.captureStopBtn) {
      this.elements.captureStopBtn.disabled = !isCapturing;
    }

    if (this.elements.captureStatus) {
      this.elements.captureStatus.textContent = isCapturing ? 'Recording...' : 'Idle';
      this.elements.captureStatus.className = isCapturing ? 'status-active' : 'status-idle';
    }
  }

  /**
   * Updates the action log display
   * @private
   */
  _updateActionLog() {
    if (!this.elements.actionLogList) {
      return;
    }

    // Clear existing action log
    this.elements.actionLogList.innerHTML = '';

    // Get captured actions from CaptureManager
    const actions = this.captureManager.getCapturedActions();

    if (actions.length === 0) {
      // Show empty state
      const emptyState = document.createElement('div');
      emptyState.className = 'action-log-empty';
      emptyState.textContent = 'No actions captured yet. Start recording to log user interactions.';
      this.elements.actionLogList.appendChild(emptyState);
      return;
    }

    // Render each action
    actions.forEach((action, index) => {
      const actionItem = this._createActionLogItem(action, index);
      this.elements.actionLogList.appendChild(actionItem);
    });

    // Update action count
    this._updateActionCount(actions.length);
  }

  /**
   * Creates an action log item element
   * @private
   * @param {Object} action - Action data
   * @param {number} index - Action index
   * @returns {HTMLElement} Action log item element
   */
  _createActionLogItem(action, index) {
    const item = document.createElement('div');
    item.className = 'action-log-item';
    item.dataset.actionIndex = index;

    // Action icon
    const icon = document.createElement('span');
    icon.className = 'action-icon';
    icon.textContent = this._getIconForActionType(action.actionType);

    // Action description
    const description = document.createElement('span');
    description.className = 'action-description';
    description.textContent = this._getActionDescription(action);

    // Timestamp
    const timestamp = document.createElement('span');
    timestamp.className = 'action-timestamp';
    timestamp.textContent = this._formatTimestamp(action.timestamp);

    // Create slide button
    const createSlideBtn = document.createElement('button');
    createSlideBtn.className = 'btn create-slide-btn';
    createSlideBtn.textContent = '+ Slide';
    createSlideBtn.title = 'Create slide from this action';
    createSlideBtn.addEventListener('click', () => {
      this._handleCreateSlideFromAction(index);
    });

    // Assemble item
    item.appendChild(icon);
    item.appendChild(description);
    item.appendChild(timestamp);
    item.appendChild(createSlideBtn);

    return item;
  }

  /**
   * Gets human-readable description for an action
   * @private
   * @param {Object} action - Action data
   * @returns {string} Action description
   */
  _getActionDescription(action) {
    const actionDescriptions = {
      'node-expand': `Expand node: ${action.nodeId}`,
      'node-collapse': `Collapse node: ${action.nodeId}`,
      'info-open': `Open info panel: ${action.nodeId}`,
      'info-close': `Close info panel`,
      'image-open': `Open image: ${action.nodeId} (${action.imageIndex})`,
      'image-close': `Close image modal`,
      'relationship-show': `Show relationship: ${action.relationshipId}`,
      'relationship-hide': `Hide relationship: ${action.relationshipId}`,
      'camera-move': `Move camera to (${action.x}, ${action.y})`,
      'focus-activate': `Focus on node: ${action.nodeId}`,
      'focus-deactivate': `Exit focus mode`
    };

    return actionDescriptions[action.actionType] || `Unknown action: ${action.actionType}`;
  }

  /**
   * Formats timestamp for display
   * @private
   * @param {Date} timestamp - Timestamp to format
   * @returns {string} Formatted timestamp
   */
  _formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  /**
   * Updates the action count display
   * @private
   * @param {number} count - Number of actions
   */
  _updateActionCount(count) {
    const actionCountElement = document.getElementById('action-count');
    if (actionCountElement) {
      actionCountElement.textContent = `Actions: ${count}`;
    }
  }

  /**
   * Handles creating a slide from a logged action
   * @private
   * @param {number} actionIndex - Index of action to create slide from
   */
  _handleCreateSlideFromAction(actionIndex) {
    // Check if presentation is loaded
    if (!this.presentationManager.getCurrentPresentation()) {
      console.error('Cannot create slide: No presentation loaded');
      // TODO: Show user-friendly error message in UI
      return;
    }

    try {
      // Create slide from action using CaptureManager
      const slideData = this.captureManager.createSlideFromAction(actionIndex);

      // Add slide to presentation using PresentationManager
      this.presentationManager.addSlide(slideData);

      // Update timeline to show new slide
      this._updateTimeline();

      // Update navigation UI
      this._updateNavigationUI();

      console.log(`Slide created from action ${actionIndex}`);
    } catch (error) {
      console.error(`Failed to create slide from action ${actionIndex}:`, error);
      // TODO: Show user-friendly error message in UI
    }
  }

  /**
   * Updates navigation UI elements
   * @private
   */
  _updateNavigationUI() {
    const presentation = this.presentationManager.getCurrentPresentation();

    if (!presentation) {
      // No presentation loaded - disable navigation
      if (this.elements.prevSlideBtn) this.elements.prevSlideBtn.disabled = true;
      if (this.elements.nextSlideBtn) this.elements.nextSlideBtn.disabled = true;
      if (this.elements.slideCounter) this.elements.slideCounter.textContent = '0 / 0';
      return;
    }

    // Update navigation buttons
    if (this.elements.prevSlideBtn) {
      this.elements.prevSlideBtn.disabled = !this.presentationManager.hasPreviousSlide();
    }

    if (this.elements.nextSlideBtn) {
      this.elements.nextSlideBtn.disabled = !this.presentationManager.hasNextSlide();
    }

    // Update slide counter
    if (this.elements.slideCounter) {
      const current = this.presentationManager.getCurrentSlideIndex() + 1;
      const total = this.presentationManager.getSlideCount();
      this.elements.slideCounter.textContent = `${current} / ${total}`;
    }
  }

  /**
   * Updates the timeline visualization
   * @private
   */
  _updateTimeline() {
    if (!this.elements.timelineContainer) {
      return;
    }

    // Clear existing timeline
    this.elements.timelineContainer.innerHTML = '';

    const presentation = this.presentationManager.getCurrentPresentation();
    if (!presentation || presentation.slides.length === 0) {
      return;
    }

    // Create slide icons for timeline
    presentation.slides.forEach((slide, index) => {
      const slideIcon = this._createSlideIcon(slide, index);
      this.elements.timelineContainer.appendChild(slideIcon);
    });
  }

  /**
   * Renders the slides list panel
   * @private
   */
  _renderSlidesList() {
    if (!this.elements.slidesList) {
      return;
    }

    // Clear existing list
    this.elements.slidesList.innerHTML = '';

    const presentation = this.presentationManager.getCurrentPresentation();

    if (!presentation || presentation.slides.length === 0) {
      // Show empty state
      const emptyState = document.createElement('div');
      emptyState.className = 'slides-list-empty';
      emptyState.textContent = 'No slides yet. Create slides from captured actions.';
      emptyState.style.padding = '20px';
      emptyState.style.textAlign = 'center';
      emptyState.style.color = '#999';
      this.elements.slidesList.appendChild(emptyState);
      return;
    }

    // Add "Add Current State" button at top
    const addSlideBtn = document.createElement('button');
    addSlideBtn.className = 'btn add-slide-btn';
    addSlideBtn.textContent = '+ Agregar Estado Actual';
    addSlideBtn.title = 'Capturar el estado actual del mindmap como un nuevo slide';
    addSlideBtn.style.width = '100%';
    addSlideBtn.style.marginBottom = '10px';
    addSlideBtn.addEventListener('click', () => {
      this._handleAddCurrentStateSlide();
    });
    this.elements.slidesList.appendChild(addSlideBtn);

    // Create slide items
    presentation.slides.forEach((slide, index) => {
      const slideItem = this._createSlideListItem(slide, index);
      this.elements.slidesList.appendChild(slideItem);
    });
  }

  /**
   * Creates a slide list item element
   * @private
   * @param {Object} slide - Slide data
   * @param {number} index - Slide index
   * @returns {HTMLElement} Slide list item element
   */
  _createSlideListItem(slide, index) {
    const item = document.createElement('div');
    item.className = 'slide-list-item';
    item.dataset.slideIndex = index;
    item.style.display = 'flex';
    item.style.alignItems = 'center';
    item.style.padding = '8px';
    item.style.borderBottom = '1px solid #eee';
    item.style.cursor = 'pointer';

    // Highlight current slide
    if (index === this.presentationManager.getCurrentSlideIndex()) {
      item.style.backgroundColor = '#e3f2fd';
    }

    // Slide number
    const slideNumber = document.createElement('span');
    slideNumber.className = 'slide-number';
    slideNumber.textContent = `${index + 1}.`;
    slideNumber.style.marginRight = '10px';
    slideNumber.style.fontWeight = 'bold';
    slideNumber.style.minWidth = '30px';

    // Action icon
    const icon = document.createElement('span');
    icon.className = 'slide-icon';
    icon.textContent = this._getIconForActionType(slide.actionType);
    icon.style.marginRight = '10px';
    icon.style.fontSize = '18px';

    // Slide info (action type + timestamp)
    const info = document.createElement('div');
    info.className = 'slide-info';
    info.style.flex = '1';

    const actionType = document.createElement('div');
    actionType.textContent = this._formatActionType(slide.actionType);
    actionType.style.fontSize = '13px';
    actionType.style.fontWeight = '500';

    const timestamp = document.createElement('div');
    timestamp.textContent = this._formatTimestamp(slide.timestamp);
    timestamp.style.fontSize = '11px';
    timestamp.style.color = '#666';

    info.appendChild(actionType);
    info.appendChild(timestamp);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn delete-slide-btn';
    deleteBtn.textContent = '🗑️';
    deleteBtn.title = 'Eliminar slide';
    deleteBtn.style.padding = '4px 8px';
    deleteBtn.style.marginLeft = '10px';
    deleteBtn.style.backgroundColor = '#ffebee';
    deleteBtn.style.border = '1px solid #ef5350';
    deleteBtn.style.borderRadius = '4px';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent triggering the item click
      this._handleDeleteSlide(slide.id);
    });

    // Click to jump to slide
    item.addEventListener('click', async () => {
      try {
        await this.presentationManager.jumpToSlide(index, this.mindmapEngine);
        this._renderSlidesList(); // Refresh to update highlighting
        this._updateTimeline();
        this._updateNavigationUI();
      } catch (error) {
        console.error(`Failed to jump to slide ${index}:`, error);
      }
    });

    // Assemble item
    item.appendChild(slideNumber);
    item.appendChild(icon);
    item.appendChild(info);
    item.appendChild(deleteBtn);

    return item;
  }

  /**
   * Handles adding current mindmap state as a new slide
   * @private
   */
  _handleAddCurrentStateSlide() {
    // Check if presentation is loaded
    if (!this.presentationManager.getCurrentPresentation()) {
      console.error('Cannot add slide: No presentation loaded');
      alert('Por favor, crea una presentación primero.');
      return;
    }

    try {
      // Generate unique slide ID
      const slideId = `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Capture current state using StateEngine
      const stateEngine = new StateEngine();
      const currentState = stateEngine.captureState({
        mindmapEngine: this.mindmapEngine,
        camera: window.camera
      });

      // Create slide object
      const slideData = {
        id: slideId,
        actionType: 'manual-capture',
        actionData: { note: 'Manual state capture' },
        timestamp: new Date(),
        state: currentState
      };

      // Add slide to presentation
      this.presentationManager.addSlide(slideData);

      // Refresh UI
      this._renderSlidesList();
      this._updateTimeline();
      this._updateNavigationUI();

      console.log('✅ Current state added as new slide');
    } catch (error) {
      console.error('Failed to add current state as slide:', error);
      alert('Error al agregar el slide. Ver consola para detalles.');
    }
  }

  /**
   * Handles deleting a slide
   * @private
   * @param {string} slideId - ID of slide to delete
   */
  _handleDeleteSlide(slideId) {
    // Confirm deletion
    if (!confirm('¿Estás seguro de que quieres eliminar este slide?')) {
      return;
    }

    try {
      // Delete slide using PresentationManager
      this.presentationManager.deleteSlide(slideId);

      // If no slides remain, reset mindmap state to clean slate
      const presentation = this.presentationManager.getCurrentPresentation();
      if (presentation && presentation.slides.length === 0) {
        console.log('🧹 All slides deleted - resetting mindmap state');
        this._resetMindmapState();
      }

      // Refresh UI
      this._renderSlidesList();
      this._updateTimeline();
      this._updateNavigationUI();

      console.log(`✅ Slide ${slideId} deleted successfully`);
    } catch (error) {
      console.error(`Failed to delete slide ${slideId}:`, error);
      alert('Error al eliminar el slide. Ver consola para detalles.');
    }
  }

  /**
   * Resets mindmap state to clean slate (closes all info panels, modals, etc.)
   * @private
   */
  _resetMindmapState() {
    if (!this.mindmapEngine) {
      return;
    }

    // Close all info panels
    for (const nodeId in this.mindmapEngine.nodeData) {
      if (this.mindmapEngine.nodeData[nodeId].showInfo) {
        console.log(`Closing info panel for node: ${nodeId}`);
        this.mindmapEngine.toggleInfo(nodeId);
      }
    }

    // Close image modal if open
    const overlay = document.getElementById('lightboxOverlay');
    if (overlay && overlay.classList.contains('active')) {
      console.log('Closing image modal');
      overlay.classList.remove('show');
      setTimeout(() => {
        overlay.classList.remove('active');
      }, 300);
    }

    // Clear image modal state
    if (this.mindmapEngine.imageModalState) {
      this.mindmapEngine.imageModalState = {
        open: false,
        nodeId: null,
        imageIndex: null,
        imageSrc: null
      };
    }

    // Exit focus mode if active
    if (this.mindmapEngine.focusedNodeId) {
      console.log('Exiting focus mode');
      this.mindmapEngine.toggleFocusMode(this.mindmapEngine.focusedNodeId);
    }

    // Force re-render
    if (window.renderMindmap) {
      window.renderMindmap();
    } else if (this.mindmapEngine.draw) {
      this.mindmapEngine.draw();
    }
  }

  /**
   * Formats action type for display
   * @private
   * @param {string} actionType - Action type
   * @returns {string} Formatted action type
   */
  _formatActionType(actionType) {
    const typeMap = {
      'node_expand': 'Expandir Nodo',
      'node_collapse': 'Colapsar Nodo',
      'info_panel_open': 'Abrir Info',
      'info_panel_close': 'Cerrar Info',
      'focus_mode_focus': 'Activar Foco',
      'focus_mode_unfocus': 'Desactivar Foco',
      'camera_zoom': 'Zoom',
      'camera_pan': 'Mover Cámara',
      'manual-capture': 'Captura Manual'
    };

    return typeMap[actionType] || actionType.replace(/_/g, ' ');
  }

  /**
   * Creates a slide icon element for the timeline
   * @private
   * @param {Object} slide - Slide data
   * @param {number} index - Slide index
   * @returns {HTMLElement} Slide icon element
   */
  _createSlideIcon(slide, index) {
    const icon = document.createElement('div');
    icon.className = 'timeline-slide-icon';
    icon.dataset.slideIndex = index;

    // Add icon based on action type
    const iconSymbol = this._getIconForActionType(slide.actionType);
    icon.textContent = iconSymbol;

    // Highlight current slide
    if (index === this.presentationManager.getCurrentSlideIndex()) {
      icon.classList.add('active');
    }

    // Make draggable
    icon.draggable = true;

    // Drag start - set data transfer
    icon.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', index.toString());
      e.dataTransfer.effectAllowed = 'move';
    });

    // Drag over - allow drop
    icon.addEventListener('dragover', (e) => {
      e.preventDefault();
      icon.classList.add('drag-over');
    });

    // Drag leave - remove visual feedback
    icon.addEventListener('dragleave', (e) => {
      icon.classList.remove('drag-over');
    });

    // Drop - reorder slides
    icon.addEventListener('drop', (e) => {
      e.preventDefault();
      icon.classList.remove('drag-over');

      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
      const toIndex = index;

      // Reorder slides using PresentationManager
      this.presentationManager.reorderSlides(fromIndex, toIndex);

      // Refresh timeline to show new order
      this._updateTimeline();
    });

    // Click to jump to slide
    icon.addEventListener('click', async () => {
      console.log(`Jump to slide ${index}`);

      try {
        // Jump to the clicked slide using PresentationManager
        await this.presentationManager.jumpToSlide(index, this.mindmapEngine);

        // Update timeline to reflect new current slide highlighting
        this._updateTimeline();

        // Update navigation UI
        this._updateNavigationUI();
      } catch (error) {
        console.error(`Failed to jump to slide ${index}:`, error);
        // TODO: Show user-friendly error message in UI
      }
    });

    return icon;
  }

  /**
   * Gets icon symbol for action type
   * @private
   * @param {string} actionType - Action type
   * @returns {string} Icon symbol
   */
  _getIconForActionType(actionType) {
    const iconMap = {
      'node-expand': '📂',
      'node-collapse': '📁',
      'info-open': 'ℹ️',
      'info-close': 'ℹ️',
      'image-open': '🖼️',
      'image-close': '🖼️',
      'relationship-show': '🔗',
      'relationship-hide': '🔗',
      'camera-move': '📷',
      'focus-activate': '🎯',
      'focus-deactivate': '🎯'
    };

    return iconMap[actionType] || '•';
  }

  /**
   * Refreshes the action log display
   * Call this method after logging new actions during capture mode
   */
  refreshActionLog() {
    this._updateActionLog();
  }

  /**
   * Refreshes the timeline display
   * Call this method after slide changes (add/delete/reorder) or navigation
   */
  refreshTimeline() {
    this._updateTimeline();
  }

  /**
   * Refreshes the full UI state (timeline + navigation + slides list)
   * Call this method after any presentation state change
   */
  refreshUI() {
    this._updateTimeline();
    this._updateNavigationUI();
    this._renderSlidesList();
  }

  /**
   * Updates presentation selector UI elements
   * @private
   */
  _updatePresentationSelector() {
    if (!this.elements.presentationDropdown) {
      return;
    }

    // Clear existing options
    this.elements.presentationDropdown.innerHTML = '';

    // Get current presentation
    const presentation = this.presentationManager.getCurrentPresentation();

    if (!presentation) {
      // Show placeholder option when no presentation is loaded
      const placeholderOption = document.createElement('option');
      placeholderOption.value = '';
      placeholderOption.textContent = '-- Select Presentation --';
      this.elements.presentationDropdown.appendChild(placeholderOption);

      // Disable rename and delete buttons
      if (this.elements.renamePresentationBtn) {
        this.elements.renamePresentationBtn.disabled = true;
      }
      if (this.elements.deletePresentationBtn) {
        this.elements.deletePresentationBtn.disabled = true;
      }

      return;
    }

    // Add current presentation as option
    const option = document.createElement('option');
    option.value = presentation.id;
    option.textContent = presentation.name;
    option.selected = true;
    this.elements.presentationDropdown.appendChild(option);

    // Enable rename and delete buttons
    if (this.elements.renamePresentationBtn) {
      this.elements.renamePresentationBtn.disabled = false;
    }
    if (this.elements.deletePresentationBtn) {
      this.elements.deletePresentationBtn.disabled = false;
    }
  }

  /**
   * Cleans up event listeners
   */
  destroy() {
    // Remove all event listeners
    if (this.elements.captureStartBtn && this.boundHandlers.startCapture) {
      this.elements.captureStartBtn.removeEventListener('click', this.boundHandlers.startCapture);
    }

    if (this.elements.captureStopBtn && this.boundHandlers.stopCapture) {
      this.elements.captureStopBtn.removeEventListener('click', this.boundHandlers.stopCapture);
    }

    if (this.elements.prevSlideBtn && this.boundHandlers.prevSlide) {
      this.elements.prevSlideBtn.removeEventListener('click', this.boundHandlers.prevSlide);
    }

    if (this.elements.nextSlideBtn && this.boundHandlers.nextSlide) {
      this.elements.nextSlideBtn.removeEventListener('click', this.boundHandlers.nextSlide);
    }

    if (this.boundHandlers.keydown) {
      document.removeEventListener('keydown', this.boundHandlers.keydown);
    }

    if (this.elements.newPresentationBtn && this.boundHandlers.newPresentation) {
      this.elements.newPresentationBtn.removeEventListener('click', this.boundHandlers.newPresentation);
    }

    if (this.elements.timelineContainer && this.boundHandlers.timelineDragOver) {
      this.elements.timelineContainer.removeEventListener('dragover', this.boundHandlers.timelineDragOver);
    }

    // Clear element references
    this.elements = {};
    this.boundHandlers = {};
  }
}

// Export for use in other modules and tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PresentationUI;
}
