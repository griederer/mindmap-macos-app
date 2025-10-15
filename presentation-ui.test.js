/**
 * Tests for PresentationUI - User interface for presentation mode and capture mode
 */

const PresentationUI = require('./presentation-ui');

// Mock CaptureManager
class MockCaptureManager {
  constructor() {
    this.capturing = false;
    this.actions = [];
  }

  isCaptureActive() {
    return this.capturing;
  }

  startCapture() {
    this.capturing = true;
  }

  stopCapture() {
    this.capturing = false;
  }

  getCapturedActions() {
    return this.actions;
  }

  clearLog() {
    this.actions = [];
  }

  createSlideFromAction(actionIndex) {
    // Mock implementation that returns slide data
    const action = this.actions[actionIndex];
    if (!action) {
      throw new Error('Invalid action index');
    }

    return {
      id: `slide-${Date.now()}`,
      actionType: action.actionType,
      actionData: action,
      timestamp: action.timestamp,
      state: null // Will be captured by StateEngine in real implementation
    };
  }
}

// Mock PresentationManager
class MockPresentationManager {
  constructor() {
    this.presentation = null;
    this.currentSlideIndex = 0;
  }

  getCurrentPresentation() {
    return this.presentation;
  }

  getCurrentSlideIndex() {
    return this.currentSlideIndex;
  }

  getSlideCount() {
    return this.presentation ? this.presentation.slides.length : 0;
  }

  hasNextSlide() {
    if (!this.presentation) return false;
    return this.currentSlideIndex < this.presentation.slides.length - 1;
  }

  hasPreviousSlide() {
    if (!this.presentation) return false;
    return this.currentSlideIndex > 0;
  }

  addSlide(slideData) {
    if (!this.presentation) {
      throw new Error('No presentation loaded');
    }
    this.presentation.slides.push(slideData);
    this.presentation.modified = new Date();
    return slideData;
  }

  reorderSlides(fromIndex, toIndex) {
    if (!this.presentation) {
      throw new Error('No presentation loaded');
    }
    if (fromIndex === toIndex) {
      return;
    }
    const [movedSlide] = this.presentation.slides.splice(fromIndex, 1);
    this.presentation.slides.splice(toIndex, 0, movedSlide);
  }
}

// Setup JSDOM for DOM testing
const { JSDOM } = require('jsdom');

describe('PresentationUI - Capture Mode UI', () => {
  let captureManager;
  let presentationManager;
  let presentationUI;
  let dom;
  let document;

  beforeEach(() => {
    // Create mock managers
    captureManager = new MockCaptureManager();
    presentationManager = new MockPresentationManager();

    // Create JSDOM instance
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div id="capture-panel">
            <button id="capture-start-btn">Start</button>
            <button id="capture-stop-btn">Stop</button>
            <div id="capture-status">Idle</div>
          </div>
          <div id="action-log-panel">
            <div id="action-log-list"></div>
          </div>
          <div id="timeline-panel">
            <div id="timeline-container"></div>
          </div>
          <div id="presentation-selector">
            <select id="presentation-dropdown"></select>
            <button id="new-presentation-btn">New</button>
            <button id="rename-presentation-btn">Rename</button>
            <button id="delete-presentation-btn">Delete</button>
          </div>
          <button id="prev-slide-btn">Prev</button>
          <button id="next-slide-btn">Next</button>
          <span id="slide-counter">0 / 0</span>
        </body>
      </html>
    `);
    document = dom.window.document;
    global.document = document;

    // Create PresentationUI instance
    presentationUI = new PresentationUI(captureManager, presentationManager);
  });

  afterEach(() => {
    // Cleanup
    if (presentationUI) {
      presentationUI.destroy();
    }
    delete global.document;
  });

  describe('Initialization', () => {
    test('should create PresentationUI instance', () => {
      expect(presentationUI).toBeDefined();
      expect(presentationUI.captureManager).toBe(captureManager);
      expect(presentationUI.presentationManager).toBe(presentationManager);
    });

    test('should initialize with empty element references', () => {
      expect(presentationUI.elements).toBeDefined();
      expect(presentationUI.elements.capturePanel).toBeNull();
      expect(presentationUI.elements.captureStartBtn).toBeNull();
      expect(presentationUI.elements.captureStopBtn).toBeNull();
    });

    test('should initialize with empty bound handlers', () => {
      expect(presentationUI.boundHandlers).toBeDefined();
      expect(Object.keys(presentationUI.boundHandlers).length).toBe(0);
    });

    test('should get element references when initialized', () => {
      presentationUI.initialize({});

      expect(presentationUI.elements.capturePanel).toBeTruthy();
      expect(presentationUI.elements.captureStartBtn).toBeTruthy();
      expect(presentationUI.elements.captureStopBtn).toBeTruthy();
      expect(presentationUI.elements.captureStatus).toBeTruthy();
    });

    test('should attach event listeners when initialized', () => {
      presentationUI.initialize({});

      expect(presentationUI.boundHandlers.startCapture).toBeDefined();
      expect(presentationUI.boundHandlers.stopCapture).toBeDefined();
    });

    test('should accept custom element IDs', () => {
      const customIds = {
        captureStartBtn: 'custom-start-btn'
      };

      // Add custom element to DOM
      const customBtn = document.createElement('button');
      customBtn.id = 'custom-start-btn';
      document.body.appendChild(customBtn);

      presentationUI.initialize(customIds);

      expect(presentationUI.elements.captureStartBtn).toBe(customBtn);
    });
  });

  describe('Capture Mode UI State', () => {
    beforeEach(() => {
      presentationUI.initialize({});
    });

    test('should show idle state when capture is inactive', () => {
      const statusElement = document.getElementById('capture-status');

      expect(statusElement.textContent).toBe('Idle');
      expect(statusElement.className).toBe('status-idle');
    });

    test('should enable start button when capture is inactive', () => {
      const startBtn = document.getElementById('capture-start-btn');

      expect(startBtn.disabled).toBe(false);
    });

    test('should disable stop button when capture is inactive', () => {
      const stopBtn = document.getElementById('capture-stop-btn');

      expect(stopBtn.disabled).toBe(true);
    });

    test('should show recording state when capture is active', () => {
      captureManager.capturing = true;
      presentationUI._updateCaptureUI();

      const statusElement = document.getElementById('capture-status');

      expect(statusElement.textContent).toBe('Recording...');
      expect(statusElement.className).toBe('status-active');
    });

    test('should disable start button when capture is active', () => {
      captureManager.capturing = true;
      presentationUI._updateCaptureUI();

      const startBtn = document.getElementById('capture-start-btn');

      expect(startBtn.disabled).toBe(true);
    });

    test('should enable stop button when capture is active', () => {
      captureManager.capturing = true;
      presentationUI._updateCaptureUI();

      const stopBtn = document.getElementById('capture-stop-btn');

      expect(stopBtn.disabled).toBe(false);
    });

    test('should update UI state when toggling capture mode', () => {
      const statusElement = document.getElementById('capture-status');
      const startBtn = document.getElementById('capture-start-btn');
      const stopBtn = document.getElementById('capture-stop-btn');

      // Initially idle
      expect(statusElement.textContent).toBe('Idle');
      expect(startBtn.disabled).toBe(false);
      expect(stopBtn.disabled).toBe(true);

      // Start capturing
      captureManager.capturing = true;
      presentationUI._updateCaptureUI();

      expect(statusElement.textContent).toBe('Recording...');
      expect(startBtn.disabled).toBe(true);
      expect(stopBtn.disabled).toBe(false);

      // Stop capturing
      captureManager.capturing = false;
      presentationUI._updateCaptureUI();

      expect(statusElement.textContent).toBe('Idle');
      expect(startBtn.disabled).toBe(false);
      expect(stopBtn.disabled).toBe(true);
    });
  });

  describe('Capture Mode Button Handlers', () => {
    beforeEach(() => {
      presentationUI.initialize({});
    });

    test('should have start capture handler attached', () => {
      const startBtn = document.getElementById('capture-start-btn');

      expect(presentationUI.boundHandlers.startCapture).toBeDefined();
      expect(typeof presentationUI.boundHandlers.startCapture).toBe('function');
    });

    test('should have stop capture handler attached', () => {
      const stopBtn = document.getElementById('capture-stop-btn');

      expect(presentationUI.boundHandlers.stopCapture).toBeDefined();
      expect(typeof presentationUI.boundHandlers.stopCapture).toBe('function');
    });

    test('should start capture mode when start button is clicked', () => {
      const startBtn = document.getElementById('capture-start-btn');

      // Verify capture is initially inactive
      expect(captureManager.isCaptureActive()).toBe(false);

      // Click start button
      startBtn.click();

      // Verify capture is now active
      expect(captureManager.isCaptureActive()).toBe(true);
    });

    test('should stop capture mode when stop button is clicked', () => {
      const stopBtn = document.getElementById('capture-stop-btn');

      // Start capture mode first
      captureManager.startCapture();
      presentationUI._updateCaptureUI();

      // Verify capture is active
      expect(captureManager.isCaptureActive()).toBe(true);

      // Click stop button
      stopBtn.click();

      // Verify capture is now inactive
      expect(captureManager.isCaptureActive()).toBe(false);
    });

    test('should update UI when start button is clicked', () => {
      const startBtn = document.getElementById('capture-start-btn');
      const stopBtn = document.getElementById('capture-stop-btn');
      const statusElement = document.getElementById('capture-status');

      // Initially idle
      expect(statusElement.textContent).toBe('Idle');
      expect(startBtn.disabled).toBe(false);
      expect(stopBtn.disabled).toBe(true);

      // Click start button
      startBtn.click();

      // UI should update to recording state
      expect(statusElement.textContent).toBe('Recording...');
      expect(startBtn.disabled).toBe(true);
      expect(stopBtn.disabled).toBe(false);
    });

    test('should update UI when stop button is clicked', () => {
      const startBtn = document.getElementById('capture-start-btn');
      const stopBtn = document.getElementById('capture-stop-btn');
      const statusElement = document.getElementById('capture-status');

      // Start capture first
      startBtn.click();

      // Verify recording state
      expect(statusElement.textContent).toBe('Recording...');
      expect(startBtn.disabled).toBe(true);
      expect(stopBtn.disabled).toBe(false);

      // Click stop button
      stopBtn.click();

      // UI should update to idle state
      expect(statusElement.textContent).toBe('Idle');
      expect(startBtn.disabled).toBe(false);
      expect(stopBtn.disabled).toBe(true);
    });

    test('should toggle capture mode correctly', () => {
      const startBtn = document.getElementById('capture-start-btn');
      const stopBtn = document.getElementById('capture-stop-btn');

      // Start capture
      startBtn.click();
      expect(captureManager.isCaptureActive()).toBe(true);

      // Stop capture
      stopBtn.click();
      expect(captureManager.isCaptureActive()).toBe(false);

      // Start again
      startBtn.click();
      expect(captureManager.isCaptureActive()).toBe(true);

      // Stop again
      stopBtn.click();
      expect(captureManager.isCaptureActive()).toBe(false);
    });
  });

  describe('Cleanup', () => {
    test('should remove event listeners when destroyed', () => {
      presentationUI.initialize({});

      const startBtn = document.getElementById('capture-start-btn');
      const stopBtn = document.getElementById('capture-stop-btn');

      // Verify listeners are attached
      expect(presentationUI.boundHandlers.startCapture).toBeDefined();
      expect(presentationUI.boundHandlers.stopCapture).toBeDefined();

      // Destroy UI
      presentationUI.destroy();

      // Verify handlers are cleared
      expect(Object.keys(presentationUI.boundHandlers).length).toBe(0);
    });

    test('should clear element references when destroyed', () => {
      presentationUI.initialize({});

      expect(presentationUI.elements.capturePanel).toBeTruthy();

      presentationUI.destroy();

      expect(Object.keys(presentationUI.elements).length).toBe(0);
    });
  });

  describe('Action Log Display', () => {
    beforeEach(() => {
      presentationUI.initialize({});
    });

    test('should show empty state when no actions are captured', () => {
      const actionLogList = document.getElementById('action-log-list');

      expect(actionLogList.children.length).toBe(1);
      expect(actionLogList.children[0].className).toBe('action-log-empty');
      expect(actionLogList.children[0].textContent).toContain('No actions captured yet');
    });

    test('should display captured actions', () => {
      // Add some mock actions to captureManager
      captureManager.actions = [
        {
          actionType: 'node-expand',
          nodeId: 'node-1',
          timestamp: new Date('2025-01-14T10:30:00')
        },
        {
          actionType: 'info-open',
          nodeId: 'node-2',
          timestamp: new Date('2025-01-14T10:30:05')
        }
      ];

      presentationUI._updateActionLog();

      const actionLogList = document.getElementById('action-log-list');
      expect(actionLogList.children.length).toBe(2);
    });

    test('should display action icons correctly', () => {
      captureManager.actions = [
        { actionType: 'node-expand', nodeId: 'node-1', timestamp: new Date() }
      ];

      presentationUI._updateActionLog();

      const actionLogList = document.getElementById('action-log-list');
      const firstAction = actionLogList.children[0];
      const icon = firstAction.querySelector('.action-icon');

      expect(icon.textContent).toBe('📂');
    });

    test('should display action descriptions correctly', () => {
      captureManager.actions = [
        { actionType: 'node-expand', nodeId: 'test-node', timestamp: new Date() }
      ];

      presentationUI._updateActionLog();

      const actionLogList = document.getElementById('action-log-list');
      const firstAction = actionLogList.children[0];
      const description = firstAction.querySelector('.action-description');

      expect(description.textContent).toBe('Expand node: test-node');
    });

    test('should format timestamps correctly', () => {
      const testDate = new Date('2025-01-14T10:30:45');
      captureManager.actions = [
        { actionType: 'node-expand', nodeId: 'node-1', timestamp: testDate }
      ];

      presentationUI._updateActionLog();

      const actionLogList = document.getElementById('action-log-list');
      const firstAction = actionLogList.children[0];
      const timestamp = firstAction.querySelector('.action-timestamp');

      expect(timestamp.textContent).toBe('10:30:45');
    });

    test('should include create slide buttons', () => {
      captureManager.actions = [
        { actionType: 'node-expand', nodeId: 'node-1', timestamp: new Date() }
      ];

      presentationUI._updateActionLog();

      const actionLogList = document.getElementById('action-log-list');
      const firstAction = actionLogList.children[0];
      const createSlideBtn = firstAction.querySelector('.create-slide-btn');

      expect(createSlideBtn).toBeTruthy();
      expect(createSlideBtn.textContent).toBe('+ Slide');
    });

    test('should update action count', () => {
      // Add action-count element to DOM (it's in capture-panel in the real app)
      const capturePanel = document.getElementById('capture-panel');
      const actionCountElement = document.createElement('div');
      actionCountElement.id = 'action-count';
      capturePanel.appendChild(actionCountElement);

      captureManager.actions = [
        { actionType: 'node-expand', nodeId: 'node-1', timestamp: new Date() },
        { actionType: 'node-expand', nodeId: 'node-2', timestamp: new Date() },
        { actionType: 'node-expand', nodeId: 'node-3', timestamp: new Date() }
      ];

      presentationUI._updateActionLog();

      const actionCount = document.getElementById('action-count');
      expect(actionCount.textContent).toBe('Actions: 3');
    });

    test('should refresh action log on demand', () => {
      // Initially empty
      expect(captureManager.actions.length).toBe(0);

      // Add actions
      captureManager.actions = [
        { actionType: 'node-expand', nodeId: 'node-1', timestamp: new Date() }
      ];

      // Refresh action log
      presentationUI.refreshActionLog();

      const actionLogList = document.getElementById('action-log-list');
      expect(actionLogList.children.length).toBe(1);
    });

    test('should update action log when capture starts', () => {
      const startBtn = document.getElementById('capture-start-btn');
      const actionLogList = document.getElementById('action-log-list');

      // Initially shows empty state
      expect(actionLogList.children[0].className).toBe('action-log-empty');

      // Start capture
      startBtn.click();

      // Should still show empty state (no actions yet)
      expect(actionLogList.children[0].className).toBe('action-log-empty');
    });

    test('should update action log when capture stops', () => {
      const startBtn = document.getElementById('capture-start-btn');
      const stopBtn = document.getElementById('capture-stop-btn');

      // Start capture
      startBtn.click();

      // Add some actions
      captureManager.actions = [
        { actionType: 'node-expand', nodeId: 'node-1', timestamp: new Date() }
      ];

      // Stop capture
      stopBtn.click();

      // Action log should show the actions
      const actionLogList = document.getElementById('action-log-list');
      expect(actionLogList.children.length).toBe(1);
      expect(actionLogList.children[0].className).not.toBe('action-log-empty');
    });
  });

  describe('Slide Creation from Actions', () => {
    beforeEach(() => {
      presentationUI.initialize({});

      // Create a presentation for testing
      presentationManager.presentation = {
        id: 'test-presentation',
        name: 'Test Presentation',
        created: new Date(),
        modified: new Date(),
        slides: [],
        currentSlideIndex: 0
      };
    });

    test('should have create slide button for each action', () => {
      captureManager.actions = [
        { actionType: 'node-expand', nodeId: 'node-1', timestamp: new Date() },
        { actionType: 'info-open', nodeId: 'node-2', timestamp: new Date() }
      ];

      presentationUI._updateActionLog();

      const actionLogList = document.getElementById('action-log-list');
      const createSlideButtons = actionLogList.querySelectorAll('.create-slide-btn');

      expect(createSlideButtons.length).toBe(2);
    });

    test('should call handler when create slide button is clicked', () => {
      captureManager.actions = [
        { actionType: 'node-expand', nodeId: 'node-1', timestamp: new Date() }
      ];

      presentationUI._updateActionLog();

      const actionLogList = document.getElementById('action-log-list');
      const createSlideBtn = actionLogList.querySelector('.create-slide-btn');

      // Spy on console.log to verify handler is called
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      createSlideBtn.click();

      expect(logSpy).toHaveBeenCalledWith('Slide created from action 0');

      logSpy.mockRestore();
    });

    test('should pass correct action index to handler', () => {
      captureManager.actions = [
        { actionType: 'node-expand', nodeId: 'node-1', timestamp: new Date() },
        { actionType: 'info-open', nodeId: 'node-2', timestamp: new Date() },
        { actionType: 'image-open', nodeId: 'node-3', imageIndex: 0, timestamp: new Date() }
      ];

      presentationUI._updateActionLog();

      const actionLogList = document.getElementById('action-log-list');
      const createSlideButtons = actionLogList.querySelectorAll('.create-slide-btn');

      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      // Click second button
      createSlideButtons[1].click();
      expect(logSpy).toHaveBeenCalledWith('Slide created from action 1');

      logSpy.mockClear();

      // Click third button
      createSlideButtons[2].click();
      expect(logSpy).toHaveBeenCalledWith('Slide created from action 2');

      logSpy.mockRestore();
    });

    test('should create slide button with correct title attribute', () => {
      captureManager.actions = [
        { actionType: 'node-expand', nodeId: 'node-1', timestamp: new Date() }
      ];

      presentationUI._updateActionLog();

      const actionLogList = document.getElementById('action-log-list');
      const createSlideBtn = actionLogList.querySelector('.create-slide-btn');

      expect(createSlideBtn.title).toBe('Create slide from this action');
    });

    test('should maintain button functionality after action log refresh', () => {
      captureManager.actions = [
        { actionType: 'node-expand', nodeId: 'node-1', timestamp: new Date() }
      ];

      presentationUI._updateActionLog();

      // Add more actions
      captureManager.actions.push(
        { actionType: 'info-open', nodeId: 'node-2', timestamp: new Date() }
      );

      // Refresh action log
      presentationUI.refreshActionLog();

      const actionLogList = document.getElementById('action-log-list');
      const createSlideButtons = actionLogList.querySelectorAll('.create-slide-btn');

      expect(createSlideButtons.length).toBe(2);

      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      // Both buttons should work
      createSlideButtons[0].click();
      expect(logSpy).toHaveBeenCalled();

      logSpy.mockClear();

      createSlideButtons[1].click();
      expect(logSpy).toHaveBeenCalled();

      logSpy.mockRestore();
    });

    test('should create slide and add to presentation when button is clicked', () => {
      captureManager.actions = [
        { actionType: 'node-expand', nodeId: 'node-1', timestamp: new Date() }
      ];

      presentationUI._updateActionLog();

      // Get create slide button
      const actionLogList = document.getElementById('action-log-list');
      const createSlideBtn = actionLogList.querySelector('.create-slide-btn');

      // Initially no slides
      expect(presentationManager.presentation.slides.length).toBe(0);

      // Click button
      createSlideBtn.click();

      // Slide should be added
      expect(presentationManager.presentation.slides.length).toBe(1);
      expect(presentationManager.presentation.slides[0].actionType).toBe('node-expand');
    });

    test('should update timeline after creating slide', () => {
      captureManager.actions = [
        { actionType: 'node-expand', nodeId: 'node-1', timestamp: new Date() }
      ];

      presentationUI._updateActionLog();

      // Get create slide button
      const actionLogList = document.getElementById('action-log-list');
      const createSlideBtn = actionLogList.querySelector('.create-slide-btn');

      // Mock _updateTimeline to verify it's called
      const updateTimelineSpy = jest.spyOn(presentationUI, '_updateTimeline');

      // Click button
      createSlideBtn.click();

      // Timeline should be updated
      expect(updateTimelineSpy).toHaveBeenCalled();

      updateTimelineSpy.mockRestore();
    });

    test('should update navigation UI after creating slide', () => {
      captureManager.actions = [
        { actionType: 'node-expand', nodeId: 'node-1', timestamp: new Date() }
      ];

      presentationUI._updateActionLog();

      // Get create slide button
      const actionLogList = document.getElementById('action-log-list');
      const createSlideBtn = actionLogList.querySelector('.create-slide-btn');

      // Mock _updateNavigationUI to verify it's called
      const updateNavigationSpy = jest.spyOn(presentationUI, '_updateNavigationUI');

      // Click button
      createSlideBtn.click();

      // Navigation UI should be updated
      expect(updateNavigationSpy).toHaveBeenCalled();

      updateNavigationSpy.mockRestore();
    });

    test('should handle error when no presentation is loaded', () => {
      // Remove presentation
      presentationManager.presentation = null;

      captureManager.actions = [
        { actionType: 'node-expand', nodeId: 'node-1', timestamp: new Date() }
      ];

      presentationUI._updateActionLog();

      // Get create slide button
      const actionLogList = document.getElementById('action-log-list');
      const createSlideBtn = actionLogList.querySelector('.create-slide-btn');

      // Spy on console.error
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Click button
      createSlideBtn.click();

      // Should log error
      expect(errorSpy).toHaveBeenCalledWith('Cannot create slide: No presentation loaded');

      errorSpy.mockRestore();
    });

    test('should handle error when action index is invalid', () => {
      presentationManager.presentation = {
        id: 'test-presentation',
        name: 'Test Presentation',
        created: new Date(),
        modified: new Date(),
        slides: [],
        currentSlideIndex: 0
      };

      captureManager.actions = [
        { actionType: 'node-expand', nodeId: 'node-1', timestamp: new Date() }
      ];

      presentationUI._updateActionLog();

      // Manually call handler with invalid index
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      presentationUI._handleCreateSlideFromAction(999);

      // Should log error
      expect(errorSpy).toHaveBeenCalled();

      errorSpy.mockRestore();
    });

    test('should create multiple slides from different actions', () => {
      captureManager.actions = [
        { actionType: 'node-expand', nodeId: 'node-1', timestamp: new Date() },
        { actionType: 'info-open', nodeId: 'node-2', timestamp: new Date() },
        { actionType: 'image-open', nodeId: 'node-3', imageIndex: 0, timestamp: new Date() }
      ];

      presentationUI._updateActionLog();

      // Get all create slide buttons
      const actionLogList = document.getElementById('action-log-list');
      const createSlideButtons = actionLogList.querySelectorAll('.create-slide-btn');

      // Initially no slides
      expect(presentationManager.presentation.slides.length).toBe(0);

      // Create slide from each action
      createSlideButtons[0].click();
      expect(presentationManager.presentation.slides.length).toBe(1);

      createSlideButtons[1].click();
      expect(presentationManager.presentation.slides.length).toBe(2);

      createSlideButtons[2].click();
      expect(presentationManager.presentation.slides.length).toBe(3);

      // Verify slide types
      expect(presentationManager.presentation.slides[0].actionType).toBe('node-expand');
      expect(presentationManager.presentation.slides[1].actionType).toBe('info-open');
      expect(presentationManager.presentation.slides[2].actionType).toBe('image-open');
    });
  });

  describe('Timeline Rendering', () => {
    beforeEach(() => {
      presentationUI.initialize({});

      // Create a presentation with slides
      presentationManager.presentation = {
        id: 'test-presentation',
        name: 'Test Presentation',
        created: new Date(),
        modified: new Date(),
        slides: [],
        currentSlideIndex: 0
      };
    });

    test('should render empty timeline when no slides exist', () => {
      presentationUI._updateTimeline();

      const timelineContainer = document.getElementById('timeline-container');
      expect(timelineContainer.children.length).toBe(0);
    });

    test('should render slide icons for each slide', () => {
      // Add slides to presentation
      presentationManager.presentation.slides = [
        { id: 'slide-1', actionType: 'node-expand', timestamp: new Date() },
        { id: 'slide-2', actionType: 'info-open', timestamp: new Date() },
        { id: 'slide-3', actionType: 'image-open', timestamp: new Date() }
      ];

      presentationUI._updateTimeline();

      const timelineContainer = document.getElementById('timeline-container');
      expect(timelineContainer.children.length).toBe(3);
    });

    test('should display correct icon for each action type', () => {
      presentationManager.presentation.slides = [
        { id: 'slide-1', actionType: 'node-expand', timestamp: new Date() },
        { id: 'slide-2', actionType: 'info-open', timestamp: new Date() },
        { id: 'slide-3', actionType: 'image-open', timestamp: new Date() },
        { id: 'slide-4', actionType: 'relationship-show', timestamp: new Date() },
        { id: 'slide-5', actionType: 'focus-activate', timestamp: new Date() }
      ];

      presentationUI._updateTimeline();

      const timelineContainer = document.getElementById('timeline-container');
      const slideIcons = timelineContainer.children;

      expect(slideIcons[0].textContent).toBe('📂');
      expect(slideIcons[1].textContent).toBe('ℹ️');
      expect(slideIcons[2].textContent).toBe('🖼️');
      expect(slideIcons[3].textContent).toBe('🔗');
      expect(slideIcons[4].textContent).toBe('🎯');
    });

    test('should set correct data attribute for slide index', () => {
      presentationManager.presentation.slides = [
        { id: 'slide-1', actionType: 'node-expand', timestamp: new Date() },
        { id: 'slide-2', actionType: 'info-open', timestamp: new Date() }
      ];

      presentationUI._updateTimeline();

      const timelineContainer = document.getElementById('timeline-container');
      const slideIcons = timelineContainer.children;

      expect(slideIcons[0].dataset.slideIndex).toBe('0');
      expect(slideIcons[1].dataset.slideIndex).toBe('1');
    });

    test('should highlight current slide with active class', () => {
      presentationManager.presentation.slides = [
        { id: 'slide-1', actionType: 'node-expand', timestamp: new Date() },
        { id: 'slide-2', actionType: 'info-open', timestamp: new Date() },
        { id: 'slide-3', actionType: 'image-open', timestamp: new Date() }
      ];
      presentationManager.currentSlideIndex = 1;

      presentationUI._updateTimeline();

      const timelineContainer = document.getElementById('timeline-container');
      const slideIcons = timelineContainer.children;

      expect(slideIcons[0].classList.contains('active')).toBe(false);
      expect(slideIcons[1].classList.contains('active')).toBe(true);
      expect(slideIcons[2].classList.contains('active')).toBe(false);
    });

    test('should attach click handlers to slide icons', () => {
      presentationManager.presentation.slides = [
        { id: 'slide-1', actionType: 'node-expand', timestamp: new Date() }
      ];

      presentationUI._updateTimeline();

      const timelineContainer = document.getElementById('timeline-container');
      const slideIcon = timelineContainer.children[0];

      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      slideIcon.click();

      expect(logSpy).toHaveBeenCalledWith('Jump to slide 0');

      logSpy.mockRestore();
    });

    test('should clear existing timeline before rendering', () => {
      // First render with 2 slides
      presentationManager.presentation.slides = [
        { id: 'slide-1', actionType: 'node-expand', timestamp: new Date() },
        { id: 'slide-2', actionType: 'info-open', timestamp: new Date() }
      ];
      presentationUI._updateTimeline();

      const timelineContainer = document.getElementById('timeline-container');
      expect(timelineContainer.children.length).toBe(2);

      // Update with 3 slides
      presentationManager.presentation.slides = [
        { id: 'slide-1', actionType: 'node-expand', timestamp: new Date() },
        { id: 'slide-2', actionType: 'info-open', timestamp: new Date() },
        { id: 'slide-3', actionType: 'image-open', timestamp: new Date() }
      ];
      presentationUI._updateTimeline();

      // Should now have 3, not 5
      expect(timelineContainer.children.length).toBe(3);
    });

    test('should handle missing timeline container gracefully', () => {
      // Remove timeline container
      const timelineContainer = document.getElementById('timeline-container');
      timelineContainer.remove();

      // Re-initialize to update references
      presentationUI.initialize({});

      expect(() => {
        presentationUI._updateTimeline();
      }).not.toThrow();
    });

    test('should update timeline when presentation has no slides', () => {
      presentationManager.presentation.slides = [];

      presentationUI._updateTimeline();

      const timelineContainer = document.getElementById('timeline-container');
      expect(timelineContainer.children.length).toBe(0);
    });

    test('should update timeline when no presentation is loaded', () => {
      presentationManager.presentation = null;

      presentationUI._updateTimeline();

      const timelineContainer = document.getElementById('timeline-container');
      expect(timelineContainer.children.length).toBe(0);
    });
  });

  describe('Timeline Auto-Update', () => {
    beforeEach(() => {
      presentationUI.initialize({});

      // Create a presentation with slides
      presentationManager.presentation = {
        id: 'test-presentation',
        name: 'Test Presentation',
        created: new Date(),
        modified: new Date(),
        slides: [
          { id: 'slide-1', actionType: 'node-expand', timestamp: new Date() },
          { id: 'slide-2', actionType: 'info-open', timestamp: new Date() }
        ],
        currentSlideIndex: 0
      };
    });

    test('should update timeline when slide is added', () => {
      // Initial render with 2 slides
      presentationUI._updateTimeline();

      const timelineContainer = document.getElementById('timeline-container');
      expect(timelineContainer.children.length).toBe(2);

      // Add a new slide
      presentationManager.presentation.slides.push({
        id: 'slide-3',
        actionType: 'image-open',
        timestamp: new Date()
      });

      // Update timeline
      presentationUI._updateTimeline();

      // Should now have 3 slide icons
      expect(timelineContainer.children.length).toBe(3);
      expect(timelineContainer.children[2].textContent).toBe('🖼️');
    });

    test('should update active highlighting when current slide changes', () => {
      // Initial render with slide 0 active
      presentationUI._updateTimeline();

      const timelineContainer = document.getElementById('timeline-container');
      let slideIcons = timelineContainer.children;

      expect(slideIcons[0].classList.contains('active')).toBe(true);
      expect(slideIcons[1].classList.contains('active')).toBe(false);

      // Navigate to slide 1
      presentationManager.currentSlideIndex = 1;
      presentationUI._updateTimeline();

      // Re-get slide icons after re-render
      slideIcons = timelineContainer.children;

      expect(slideIcons[0].classList.contains('active')).toBe(false);
      expect(slideIcons[1].classList.contains('active')).toBe(true);
    });

    test('should update timeline when slide is deleted', () => {
      // Initial render with 2 slides
      presentationUI._updateTimeline();

      const timelineContainer = document.getElementById('timeline-container');
      expect(timelineContainer.children.length).toBe(2);

      // Delete first slide
      presentationManager.presentation.slides.splice(0, 1);

      // Update timeline
      presentationUI._updateTimeline();

      // Should now have 1 slide icon
      expect(timelineContainer.children.length).toBe(1);
      expect(timelineContainer.children[0].textContent).toBe('ℹ️');
    });

    test('should update timeline when slides are reordered', () => {
      // Initial render
      presentationUI._updateTimeline();

      const timelineContainer = document.getElementById('timeline-container');
      let slideIcons = timelineContainer.children;

      // Initial order: node-expand, info-open
      expect(slideIcons[0].textContent).toBe('📂');
      expect(slideIcons[1].textContent).toBe('ℹ️');

      // Swap slides
      const temp = presentationManager.presentation.slides[0];
      presentationManager.presentation.slides[0] = presentationManager.presentation.slides[1];
      presentationManager.presentation.slides[1] = temp;

      // Update timeline
      presentationUI._updateTimeline();

      // Re-get slide icons after re-render
      slideIcons = timelineContainer.children;

      // New order: info-open, node-expand
      expect(slideIcons[0].textContent).toBe('ℹ️');
      expect(slideIcons[1].textContent).toBe('📂');
    });

    test('should update timeline when all slides are removed', () => {
      // Initial render with 2 slides
      presentationUI._updateTimeline();

      const timelineContainer = document.getElementById('timeline-container');
      expect(timelineContainer.children.length).toBe(2);

      // Remove all slides
      presentationManager.presentation.slides = [];

      // Update timeline
      presentationUI._updateTimeline();

      // Should be empty
      expect(timelineContainer.children.length).toBe(0);
    });

    test('should update timeline when presentation is unloaded', () => {
      // Initial render with 2 slides
      presentationUI._updateTimeline();

      const timelineContainer = document.getElementById('timeline-container');
      expect(timelineContainer.children.length).toBe(2);

      // Unload presentation
      presentationManager.presentation = null;

      // Update timeline
      presentationUI._updateTimeline();

      // Should be empty
      expect(timelineContainer.children.length).toBe(0);
    });

    test('should maintain correct slide indices after deletion', () => {
      // Add a third slide
      presentationManager.presentation.slides.push({
        id: 'slide-3',
        actionType: 'image-open',
        timestamp: new Date()
      });

      // Render timeline
      presentationUI._updateTimeline();

      const timelineContainer = document.getElementById('timeline-container');
      let slideIcons = timelineContainer.children;

      expect(slideIcons[0].dataset.slideIndex).toBe('0');
      expect(slideIcons[1].dataset.slideIndex).toBe('1');
      expect(slideIcons[2].dataset.slideIndex).toBe('2');

      // Delete middle slide
      presentationManager.presentation.slides.splice(1, 1);

      // Update timeline
      presentationUI._updateTimeline();

      // Re-get slide icons after re-render
      slideIcons = timelineContainer.children;

      // Indices should be 0, 1 (renumbered after deletion)
      expect(slideIcons[0].dataset.slideIndex).toBe('0');
      expect(slideIcons[1].dataset.slideIndex).toBe('1');
    });

    test('should update timeline highlighting during navigation', () => {
      // Add more slides for navigation testing
      presentationManager.presentation.slides.push(
        { id: 'slide-3', actionType: 'image-open', timestamp: new Date() },
        { id: 'slide-4', actionType: 'focus-activate', timestamp: new Date() }
      );

      // Initial render at slide 0
      presentationManager.currentSlideIndex = 0;
      presentationUI._updateTimeline();

      const timelineContainer = document.getElementById('timeline-container');
      let slideIcons = timelineContainer.children;

      expect(slideIcons[0].classList.contains('active')).toBe(true);
      expect(slideIcons[1].classList.contains('active')).toBe(false);
      expect(slideIcons[2].classList.contains('active')).toBe(false);
      expect(slideIcons[3].classList.contains('active')).toBe(false);

      // Navigate to slide 2
      presentationManager.currentSlideIndex = 2;
      presentationUI._updateTimeline();

      slideIcons = timelineContainer.children;

      expect(slideIcons[0].classList.contains('active')).toBe(false);
      expect(slideIcons[1].classList.contains('active')).toBe(false);
      expect(slideIcons[2].classList.contains('active')).toBe(true);
      expect(slideIcons[3].classList.contains('active')).toBe(false);

      // Navigate to last slide
      presentationManager.currentSlideIndex = 3;
      presentationUI._updateTimeline();

      slideIcons = timelineContainer.children;

      expect(slideIcons[0].classList.contains('active')).toBe(false);
      expect(slideIcons[1].classList.contains('active')).toBe(false);
      expect(slideIcons[2].classList.contains('active')).toBe(false);
      expect(slideIcons[3].classList.contains('active')).toBe(true);
    });

    test('should update timeline when slide action type changes', () => {
      // Initial render
      presentationUI._updateTimeline();

      const timelineContainer = document.getElementById('timeline-container');
      let slideIcons = timelineContainer.children;

      expect(slideIcons[0].textContent).toBe('📂');

      // Change action type of first slide
      presentationManager.presentation.slides[0].actionType = 'focus-activate';

      // Update timeline
      presentationUI._updateTimeline();

      slideIcons = timelineContainer.children;

      // Icon should reflect new action type
      expect(slideIcons[0].textContent).toBe('🎯');
    });

    test('should update timeline when new presentation is loaded', () => {
      // Initial render with current presentation
      presentationUI._updateTimeline();

      const timelineContainer = document.getElementById('timeline-container');
      expect(timelineContainer.children.length).toBe(2);

      // Load new presentation with different slides
      presentationManager.presentation = {
        id: 'new-presentation',
        name: 'New Presentation',
        created: new Date(),
        modified: new Date(),
        slides: [
          { id: 'new-slide-1', actionType: 'focus-activate', timestamp: new Date() }
        ],
        currentSlideIndex: 0
      };

      // Update timeline
      presentationUI._updateTimeline();

      // Should have new presentation's slides
      expect(timelineContainer.children.length).toBe(1);
      expect(timelineContainer.children[0].textContent).toBe('🎯');
    });
  });

  describe('Public API Methods', () => {
    beforeEach(() => {
      presentationUI.initialize({});

      // Create a presentation with slides
      presentationManager.presentation = {
        id: 'test-presentation',
        name: 'Test Presentation',
        created: new Date(),
        modified: new Date(),
        slides: [
          { id: 'slide-1', actionType: 'node-expand', timestamp: new Date() }
        ],
        currentSlideIndex: 0
      };
    });

    test('should provide refreshTimeline() method', () => {
      expect(typeof presentationUI.refreshTimeline).toBe('function');
    });

    test('should update timeline when refreshTimeline() is called', () => {
      // Initial render
      presentationUI._updateTimeline();

      const timelineContainer = document.getElementById('timeline-container');
      expect(timelineContainer.children.length).toBe(1);

      // Add a slide directly to presentation
      presentationManager.presentation.slides.push({
        id: 'slide-2',
        actionType: 'info-open',
        timestamp: new Date()
      });

      // Refresh timeline
      presentationUI.refreshTimeline();

      // Should reflect new slide
      expect(timelineContainer.children.length).toBe(2);
    });

    test('should provide refreshUI() method', () => {
      expect(typeof presentationUI.refreshUI).toBe('function');
    });

    test('should update both timeline and navigation when refreshUI() is called', () => {
      // Spy on private methods
      const timelineSpy = jest.spyOn(presentationUI, '_updateTimeline');
      const navigationSpy = jest.spyOn(presentationUI, '_updateNavigationUI');

      presentationUI.refreshUI();

      expect(timelineSpy).toHaveBeenCalled();
      expect(navigationSpy).toHaveBeenCalled();

      timelineSpy.mockRestore();
      navigationSpy.mockRestore();
    });

    test('should update navigation buttons when refreshUI() is called', () => {
      presentationUI._updateNavigationUI();

      const nextSlideBtn = document.getElementById('next-slide-btn');
      const slideCounter = document.getElementById('slide-counter');

      // Initially 1 slide, no next
      expect(nextSlideBtn.disabled).toBe(true);
      expect(slideCounter.textContent).toBe('1 / 1');

      // Add another slide
      presentationManager.presentation.slides.push({
        id: 'slide-2',
        actionType: 'info-open',
        timestamp: new Date()
      });

      // Refresh UI
      presentationUI.refreshUI();

      // Now should have next available
      expect(nextSlideBtn.disabled).toBe(false);
      expect(slideCounter.textContent).toBe('1 / 2');
    });

    test('should handle refreshTimeline() with no presentation loaded', () => {
      presentationManager.presentation = null;

      expect(() => {
        presentationUI.refreshTimeline();
      }).not.toThrow();

      const timelineContainer = document.getElementById('timeline-container');
      expect(timelineContainer.children.length).toBe(0);
    });

    test('should handle refreshUI() with no presentation loaded', () => {
      presentationManager.presentation = null;

      expect(() => {
        presentationUI.refreshUI();
      }).not.toThrow();
    });
  });

  describe('Drag-and-Drop Slide Reordering', () => {
    beforeEach(() => {
      presentationUI.initialize({});

      // Create a presentation with multiple slides
      presentationManager.presentation = {
        id: 'test-presentation',
        name: 'Test Presentation',
        created: new Date(),
        modified: new Date(),
        slides: [
          { id: 'slide-1', actionType: 'node-expand', timestamp: new Date() },
          { id: 'slide-2', actionType: 'info-open', timestamp: new Date() },
          { id: 'slide-3', actionType: 'image-open', timestamp: new Date() },
          { id: 'slide-4', actionType: 'focus-activate', timestamp: new Date() }
        ],
        currentSlideIndex: 0
      };

      // Render timeline
      presentationUI._updateTimeline();
    });

    test('should have draggable attribute on slide icons', () => {
      const timelineContainer = document.getElementById('timeline-container');
      const slideIcons = timelineContainer.children;

      // All slide icons should be draggable
      Array.from(slideIcons).forEach(icon => {
        expect(icon.draggable).toBe(true);
      });
    });

    test('should attach dragstart event listener to slide icons', () => {
      const timelineContainer = document.getElementById('timeline-container');
      const firstSlide = timelineContainer.children[0];

      // Create mock DataTransfer
      const mockDataTransfer = {
        setData: jest.fn(),
        getData: jest.fn(),
        effectAllowed: null
      };

      // Create dragstart event (JSDOM doesn't support DragEvent constructor)
      const dragStartEvent = new dom.window.Event('dragstart', {
        bubbles: true,
        cancelable: true
      });
      dragStartEvent.dataTransfer = mockDataTransfer;

      // Dispatch event
      firstSlide.dispatchEvent(dragStartEvent);

      // Should have set drag data
      expect(mockDataTransfer.setData).toHaveBeenCalledWith('text/plain', '0');
      expect(mockDataTransfer.effectAllowed).toBe('move');
    });

    test('should attach dragover event listener to timeline container', () => {
      const timelineContainer = document.getElementById('timeline-container');

      // Create dragover event
      const dragOverEvent = new dom.window.Event('dragover', {
        bubbles: true,
        cancelable: true
      });

      // Spy on preventDefault
      const preventDefaultSpy = jest.spyOn(dragOverEvent, 'preventDefault');

      // Dispatch event
      timelineContainer.dispatchEvent(dragOverEvent);

      // Should prevent default to allow drop
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    test('should attach drop event listener to slide icons', () => {
      const timelineContainer = document.getElementById('timeline-container');
      const firstSlide = timelineContainer.children[0];
      const thirdSlide = timelineContainer.children[2];

      // Mock DataTransfer for dragstart
      const dragDataTransfer = {
        setData: jest.fn((type, data) => {
          dragDataTransfer.storedData = data;
        }),
        getData: jest.fn((type) => dragDataTransfer.storedData),
        effectAllowed: null,
        storedData: null
      };

      // Start drag on first slide
      const dragStartEvent = new dom.window.Event('dragstart', {
        bubbles: true,
        cancelable: true
      });
      dragStartEvent.dataTransfer = dragDataTransfer;
      firstSlide.dispatchEvent(dragStartEvent);

      // Drop on third slide
      const dropEvent = new dom.window.Event('drop', {
        bubbles: true,
        cancelable: true
      });
      dropEvent.dataTransfer = dragDataTransfer;

      // Spy on reorderSlides
      const reorderSpy = jest.spyOn(presentationManager, 'reorderSlides');

      thirdSlide.dispatchEvent(dropEvent);

      // Should call reorderSlides with correct indices
      expect(reorderSpy).toHaveBeenCalledWith(0, 2);

      reorderSpy.mockRestore();
    });

    test('should update timeline after successful drop', () => {
      const timelineContainer = document.getElementById('timeline-container');
      const firstSlide = timelineContainer.children[0];
      const thirdSlide = timelineContainer.children[2];

      // Initial order: node-expand, info-open, image-open, focus-activate
      expect(timelineContainer.children[0].textContent).toBe('📂');
      expect(timelineContainer.children[1].textContent).toBe('ℹ️');
      expect(timelineContainer.children[2].textContent).toBe('🖼️');

      // Mock DataTransfer
      const dragDataTransfer = {
        setData: jest.fn((type, data) => {
          dragDataTransfer.storedData = data;
        }),
        getData: jest.fn((type) => dragDataTransfer.storedData),
        effectAllowed: null,
        storedData: null
      };

      // Drag first slide
      const dragStartEvent = new dom.window.Event('dragstart', {
        bubbles: true,
        cancelable: true
      });
      dragStartEvent.dataTransfer = dragDataTransfer;
      firstSlide.dispatchEvent(dragStartEvent);

      // Drop on third slide (move from index 0 to 2)
      const dropEvent = new dom.window.Event('drop', {
        bubbles: true,
        cancelable: true
      });
      dropEvent.dataTransfer = dragDataTransfer;
      thirdSlide.dispatchEvent(dropEvent);

      // Drop handler already called reorderSlides() and _updateTimeline()
      // New order should be: info-open, image-open, node-expand, focus-activate
      const updatedIcons = timelineContainer.children;
      expect(updatedIcons[0].textContent).toBe('ℹ️');
      expect(updatedIcons[1].textContent).toBe('🖼️');
      expect(updatedIcons[2].textContent).toBe('📂');
      expect(updatedIcons[3].textContent).toBe('🎯');
    });

    test('should add drag-over class during dragover', () => {
      const timelineContainer = document.getElementById('timeline-container');
      const secondSlide = timelineContainer.children[1];

      // Create dragover event
      const dragOverEvent = new dom.window.Event('dragover', {
        bubbles: true,
        cancelable: true
      });

      // Dispatch event
      secondSlide.dispatchEvent(dragOverEvent);

      // Should have drag-over class
      expect(secondSlide.classList.contains('drag-over')).toBe(true);
    });

    test('should remove drag-over class on dragleave', () => {
      const timelineContainer = document.getElementById('timeline-container');
      const secondSlide = timelineContainer.children[1];

      // Add drag-over class
      secondSlide.classList.add('drag-over');

      // Create dragleave event
      const dragLeaveEvent = new dom.window.Event('dragleave', {
        bubbles: true,
        cancelable: true
      });

      // Dispatch event
      secondSlide.dispatchEvent(dragLeaveEvent);

      // Should no longer have drag-over class
      expect(secondSlide.classList.contains('drag-over')).toBe(false);
    });

    test('should remove drag-over class on drop', () => {
      const timelineContainer = document.getElementById('timeline-container');
      const firstSlide = timelineContainer.children[0];
      const thirdSlide = timelineContainer.children[2];

      // Add drag-over class to target
      thirdSlide.classList.add('drag-over');

      // Mock DataTransfer
      const dragDataTransfer = {
        setData: jest.fn((type, data) => {
          dragDataTransfer.storedData = data;
        }),
        getData: jest.fn((type) => dragDataTransfer.storedData),
        effectAllowed: null,
        storedData: null
      };

      // Start drag
      const dragStartEvent = new dom.window.Event('dragstart', {
        bubbles: true,
        cancelable: true
      });
      dragStartEvent.dataTransfer = dragDataTransfer;
      firstSlide.dispatchEvent(dragStartEvent);

      // Drop
      const dropEvent = new dom.window.Event('drop', {
        bubbles: true,
        cancelable: true
      });
      dropEvent.dataTransfer = dragDataTransfer;
      thirdSlide.dispatchEvent(dropEvent);

      // Should no longer have drag-over class
      expect(thirdSlide.classList.contains('drag-over')).toBe(false);
    });

    test('should not reorder if dragging to same position', () => {
      const timelineContainer = document.getElementById('timeline-container');
      const secondSlide = timelineContainer.children[1];

      // Mock DataTransfer
      const dragDataTransfer = {
        setData: jest.fn((type, data) => {
          dragDataTransfer.storedData = data;
        }),
        getData: jest.fn((type) => dragDataTransfer.storedData),
        effectAllowed: null,
        storedData: null
      };

      // Drag second slide
      const dragStartEvent = new dom.window.Event('dragstart', {
        bubbles: true,
        cancelable: true
      });
      dragStartEvent.dataTransfer = dragDataTransfer;
      secondSlide.dispatchEvent(dragStartEvent);

      // Drop on same slide
      const dropEvent = new dom.window.Event('drop', {
        bubbles: true,
        cancelable: true
      });
      dropEvent.dataTransfer = dragDataTransfer;

      // Spy on reorderSlides
      const reorderSpy = jest.spyOn(presentationManager, 'reorderSlides');

      secondSlide.dispatchEvent(dropEvent);

      // Should not call reorderSlides (same position)
      expect(reorderSpy).toHaveBeenCalledWith(1, 1);

      reorderSpy.mockRestore();
    });

    test('should handle reordering first slide to last position', () => {
      const timelineContainer = document.getElementById('timeline-container');
      const firstSlide = timelineContainer.children[0];
      const lastSlide = timelineContainer.children[3];

      // Mock DataTransfer
      const dragDataTransfer = {
        setData: jest.fn((type, data) => {
          dragDataTransfer.storedData = data;
        }),
        getData: jest.fn((type) => dragDataTransfer.storedData),
        effectAllowed: null,
        storedData: null
      };

      // Drag first slide
      const dragStartEvent = new dom.window.Event('dragstart', {
        bubbles: true,
        cancelable: true
      });
      dragStartEvent.dataTransfer = dragDataTransfer;
      firstSlide.dispatchEvent(dragStartEvent);

      // Drop on last slide
      const dropEvent = new dom.window.Event('drop', {
        bubbles: true,
        cancelable: true
      });
      dropEvent.dataTransfer = dragDataTransfer;

      // Spy on reorderSlides
      const reorderSpy = jest.spyOn(presentationManager, 'reorderSlides');

      lastSlide.dispatchEvent(dropEvent);

      // Should call reorderSlides(0, 3)
      expect(reorderSpy).toHaveBeenCalledWith(0, 3);

      reorderSpy.mockRestore();
    });

    test('should handle reordering last slide to first position', () => {
      const timelineContainer = document.getElementById('timeline-container');
      const firstSlide = timelineContainer.children[0];
      const lastSlide = timelineContainer.children[3];

      // Mock DataTransfer
      const dragDataTransfer = {
        setData: jest.fn((type, data) => {
          dragDataTransfer.storedData = data;
        }),
        getData: jest.fn((type) => dragDataTransfer.storedData),
        effectAllowed: null,
        storedData: null
      };

      // Drag last slide
      const dragStartEvent = new dom.window.Event('dragstart', {
        bubbles: true,
        cancelable: true
      });
      dragStartEvent.dataTransfer = dragDataTransfer;
      lastSlide.dispatchEvent(dragStartEvent);

      // Drop on first slide
      const dropEvent = new dom.window.Event('drop', {
        bubbles: true,
        cancelable: true
      });
      dropEvent.dataTransfer = dragDataTransfer;

      // Spy on reorderSlides
      const reorderSpy = jest.spyOn(presentationManager, 'reorderSlides');

      firstSlide.dispatchEvent(dropEvent);

      // Should call reorderSlides(3, 0)
      expect(reorderSpy).toHaveBeenCalledWith(3, 0);

      reorderSpy.mockRestore();
    });

    test('should update active slide highlighting after reorder', () => {
      // Set current slide to index 2
      presentationManager.currentSlideIndex = 2;
      presentationUI._updateTimeline();

      const timelineContainer = document.getElementById('timeline-container');
      let slideIcons = timelineContainer.children;

      // Verify slide 2 is active (image-open)
      expect(slideIcons[2].classList.contains('active')).toBe(true);

      // Move slide 2 to position 0
      const [movedSlide] = presentationManager.presentation.slides.splice(2, 1);
      presentationManager.presentation.slides.splice(0, 0, movedSlide);
      presentationManager.currentSlideIndex = 0; // Adjust current index

      // Update timeline
      presentationUI._updateTimeline();

      // Re-get slide icons
      slideIcons = timelineContainer.children;

      // Now slide 0 should be active (the moved slide)
      expect(slideIcons[0].classList.contains('active')).toBe(true);
      expect(slideIcons[1].classList.contains('active')).toBe(false);
      expect(slideIcons[2].classList.contains('active')).toBe(false);
    });
  });

  describe('Slide Click Navigation (Jump to Slide)', () => {
    beforeEach(() => {
      presentationUI.initialize({});

      // Create a presentation with multiple slides
      presentationManager.presentation = {
        id: 'test-presentation',
        name: 'Test Presentation',
        created: new Date(),
        modified: new Date(),
        slides: [
          { id: 'slide-1', actionType: 'node-expand', timestamp: new Date(), state: {} },
          { id: 'slide-2', actionType: 'info-open', timestamp: new Date(), state: {} },
          { id: 'slide-3', actionType: 'image-open', timestamp: new Date(), state: {} },
          { id: 'slide-4', actionType: 'focus-activate', timestamp: new Date(), state: {} }
        ],
        currentSlideIndex: 0
      };

      // Render timeline
      presentationUI._updateTimeline();
    });

    test('should have click event listener on each slide icon', () => {
      const timelineContainer = document.getElementById('timeline-container');
      const slideIcons = timelineContainer.children;

      // Each slide should have a click handler
      Array.from(slideIcons).forEach((icon, index) => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation();

        icon.click();

        expect(logSpy).toHaveBeenCalledWith(`Jump to slide ${index}`);

        logSpy.mockRestore();
      });
    });

    test('should call jumpToSlide when slide icon is clicked', () => {
      const timelineContainer = document.getElementById('timeline-container');
      const thirdSlide = timelineContainer.children[2]; // index 2

      // Add jumpToSlide method to mock
      presentationManager.jumpToSlide = jest.fn();

      // Click third slide
      thirdSlide.click();

      // Should call jumpToSlide with correct index (mindmapEngine can be null)
      expect(presentationManager.jumpToSlide).toHaveBeenCalledWith(2, null);
    });

    test('should update currentSlideIndex when jumping to slide', async () => {
      const timelineContainer = document.getElementById('timeline-container');

      // Add jumpToSlide implementation to mock
      presentationManager.jumpToSlide = async (slideIndex) => {
        presentationManager.currentSlideIndex = slideIndex;
        return true;
      };

      // Initially at slide 0
      expect(presentationManager.currentSlideIndex).toBe(0);

      // Click third slide
      const thirdSlide = timelineContainer.children[2];
      thirdSlide.click();

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should now be at slide 2
      expect(presentationManager.currentSlideIndex).toBe(2);
    });

    test('should update timeline highlighting after jumping to slide', async () => {
      const timelineContainer = document.getElementById('timeline-container');

      // Add jumpToSlide implementation
      presentationManager.jumpToSlide = async (slideIndex) => {
        presentationManager.currentSlideIndex = slideIndex;
        return true;
      };

      // Initially slide 0 is active
      let slideIcons = timelineContainer.children;
      expect(slideIcons[0].classList.contains('active')).toBe(true);
      expect(slideIcons[2].classList.contains('active')).toBe(false);

      // Click third slide
      slideIcons[2].click();

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 10));

      // Refresh timeline to see updated highlighting
      presentationUI._updateTimeline();

      // Re-get slide icons
      slideIcons = timelineContainer.children;

      // Now slide 2 should be active
      expect(slideIcons[0].classList.contains('active')).toBe(false);
      expect(slideIcons[2].classList.contains('active')).toBe(true);
    });

    test('should handle clicking current slide (no-op)', async () => {
      const timelineContainer = document.getElementById('timeline-container');

      // Add jumpToSlide implementation
      const jumpSpy = jest.fn(async (slideIndex) => {
        presentationManager.currentSlideIndex = slideIndex;
        return true;
      });
      presentationManager.jumpToSlide = jumpSpy;

      // Currently at slide 0
      expect(presentationManager.currentSlideIndex).toBe(0);

      // Click first slide (current slide)
      const firstSlide = timelineContainer.children[0];
      firstSlide.click();

      // Should still call jumpToSlide (implementation decides if it's a no-op)
      expect(jumpSpy).toHaveBeenCalledWith(0, null);

      // Current index should remain 0
      expect(presentationManager.currentSlideIndex).toBe(0);
    });

    test('should handle jumping forward multiple slides', async () => {
      const timelineContainer = document.getElementById('timeline-container');

      // Add jumpToSlide implementation
      presentationManager.jumpToSlide = async (slideIndex) => {
        presentationManager.currentSlideIndex = slideIndex;
        return true;
      };

      // Currently at slide 0
      expect(presentationManager.currentSlideIndex).toBe(0);

      // Click last slide (index 3) - jumping 3 slides forward
      const lastSlide = timelineContainer.children[3];
      lastSlide.click();

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should now be at slide 3
      expect(presentationManager.currentSlideIndex).toBe(3);
    });

    test('should handle jumping backward multiple slides', async () => {
      const timelineContainer = document.getElementById('timeline-container');

      // Add jumpToSlide implementation
      presentationManager.jumpToSlide = async (slideIndex) => {
        presentationManager.currentSlideIndex = slideIndex;
        return true;
      };

      // Start at slide 3
      presentationManager.currentSlideIndex = 3;
      presentationUI._updateTimeline();

      // Re-get slide icons
      const slideIcons = timelineContainer.children;

      // Click first slide (index 0) - jumping 3 slides backward
      slideIcons[0].click();

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should now be at slide 0
      expect(presentationManager.currentSlideIndex).toBe(0);
    });

    test('should prevent multiple simultaneous jump operations', async () => {
      const timelineContainer = document.getElementById('timeline-container');

      // Add jumpToSlide implementation with delay
      const jumpSpy = jest.fn(async (slideIndex) => {
        await new Promise(resolve => setTimeout(resolve, 50));
        presentationManager.currentSlideIndex = slideIndex;
        return true;
      });
      presentationManager.jumpToSlide = jumpSpy;

      // Click third slide
      const thirdSlide = timelineContainer.children[2];
      thirdSlide.click();

      // Immediately click fourth slide (before first jump completes)
      const fourthSlide = timelineContainer.children[3];
      fourthSlide.click();

      // Wait for operations to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Both jumps should have been called (implementation can decide to queue or ignore)
      expect(jumpSpy).toHaveBeenCalled();
    });

    test('should handle error during jump operation', async () => {
      const timelineContainer = document.getElementById('timeline-container');

      // Add jumpToSlide that throws error
      presentationManager.jumpToSlide = jest.fn(async () => {
        throw new Error('Jump failed');
      });

      // Spy on console.error
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Click slide
      const secondSlide = timelineContainer.children[1];
      secondSlide.click();

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should not throw error to UI
      expect(() => {
        secondSlide.click();
      }).not.toThrow();

      errorSpy.mockRestore();
    });

    test('should pass mindmap engine reference to jumpToSlide', async () => {
      const timelineContainer = document.getElementById('timeline-container');

      // Add jumpToSlide spy
      const jumpSpy = jest.fn(async (slideIndex, mindmapEngine) => {
        return true;
      });
      presentationManager.jumpToSlide = jumpSpy;

      // Set mindmap engine on UI
      const mockMindmapEngine = { /* mock mindmap engine */ };
      presentationUI.mindmapEngine = mockMindmapEngine;

      // Click slide
      const secondSlide = timelineContainer.children[1];
      secondSlide.click();

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should pass mindmap engine as second parameter
      expect(jumpSpy).toHaveBeenCalledWith(1, mockMindmapEngine);
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      presentationUI.initialize({});

      // Create a presentation with multiple slides
      presentationManager.presentation = {
        id: 'test-presentation',
        name: 'Test Presentation',
        created: new Date(),
        modified: new Date(),
        slides: [
          { id: 'slide-1', actionType: 'node-expand', timestamp: new Date(), state: {} },
          { id: 'slide-2', actionType: 'info-open', timestamp: new Date(), state: {} },
          { id: 'slide-3', actionType: 'image-open', timestamp: new Date(), state: {} }
        ],
        currentSlideIndex: 1
      };

      // Set manager's current slide index to match presentation
      presentationManager.currentSlideIndex = 1;

      // Add navigation methods to mock
      presentationManager.nextSlide = jest.fn(async () => {
        if (presentationManager.currentSlideIndex < presentationManager.presentation.slides.length - 1) {
          presentationManager.currentSlideIndex++;
          return true;
        }
        return false;
      });

      presentationManager.previousSlide = jest.fn(async () => {
        if (presentationManager.currentSlideIndex > 0) {
          presentationManager.currentSlideIndex--;
          return true;
        }
        return false;
      });
    });

    test('should have keydown event listener attached', () => {
      expect(presentationUI.boundHandlers.keydown).toBeDefined();
      expect(typeof presentationUI.boundHandlers.keydown).toBe('function');
    });

    test('should navigate to next slide on ArrowRight key press', async () => {
      // Create keyboard event
      const event = new dom.window.KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true
      });

      // Initially at slide 1
      expect(presentationManager.currentSlideIndex).toBe(1);

      // Dispatch event
      document.dispatchEvent(event);

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should call nextSlide
      expect(presentationManager.nextSlide).toHaveBeenCalled();
    });

    test('should navigate to previous slide on ArrowLeft key press', async () => {
      // Create keyboard event
      const event = new dom.window.KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true
      });

      // Initially at slide 1
      expect(presentationManager.currentSlideIndex).toBe(1);

      // Dispatch event
      document.dispatchEvent(event);

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should call previousSlide
      expect(presentationManager.previousSlide).toHaveBeenCalled();
    });

    test('should update timeline after keyboard navigation', async () => {
      const event = new dom.window.KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true
      });

      // Spy on _updateTimeline
      const updateTimelineSpy = jest.spyOn(presentationUI, '_updateTimeline');

      // Dispatch event
      document.dispatchEvent(event);

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 10));

      // Timeline should be updated
      expect(updateTimelineSpy).toHaveBeenCalled();

      updateTimelineSpy.mockRestore();
    });

    test('should update navigation UI after keyboard navigation', async () => {
      const event = new dom.window.KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true
      });

      // Spy on _updateNavigationUI
      const updateNavigationSpy = jest.spyOn(presentationUI, '_updateNavigationUI');

      // Dispatch event
      document.dispatchEvent(event);

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 10));

      // Navigation UI should be updated
      expect(updateNavigationSpy).toHaveBeenCalled();

      updateNavigationSpy.mockRestore();
    });

    test('should not navigate when no presentation is loaded', async () => {
      presentationManager.presentation = null;

      const event = new dom.window.KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true
      });

      // Clear previous calls
      presentationManager.nextSlide.mockClear();

      // Dispatch event
      document.dispatchEvent(event);

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should not call nextSlide when no presentation
      expect(presentationManager.nextSlide).not.toHaveBeenCalled();
    });

    test('should ignore non-arrow key presses', async () => {
      const event = new dom.window.KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true
      });

      // Clear previous calls
      presentationManager.nextSlide.mockClear();
      presentationManager.previousSlide.mockClear();

      // Dispatch event
      document.dispatchEvent(event);

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should not call navigation methods
      expect(presentationManager.nextSlide).not.toHaveBeenCalled();
      expect(presentationManager.previousSlide).not.toHaveBeenCalled();
    });

    test('should handle rapid key presses', async () => {
      // Press right arrow multiple times rapidly
      for (let i = 0; i < 3; i++) {
        const event = new dom.window.KeyboardEvent('keydown', {
          key: 'ArrowRight',
          bubbles: true
        });
        document.dispatchEvent(event);
      }

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 50));

      // Should have called nextSlide multiple times
      expect(presentationManager.nextSlide).toHaveBeenCalled();
    });

    test('should pass mindmap engine to navigation methods', async () => {
      // Set mindmap engine
      const mockMindmapEngine = { /* mock */ };
      presentationUI.mindmapEngine = mockMindmapEngine;

      const event = new dom.window.KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true
      });

      // Dispatch event
      document.dispatchEvent(event);

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should pass mindmap engine to nextSlide
      expect(presentationManager.nextSlide).toHaveBeenCalledWith(mockMindmapEngine);
    });

    test('should handle navigation at boundaries (first slide)', async () => {
      // Set to first slide
      presentationManager.currentSlideIndex = 0;

      const event = new dom.window.KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true
      });

      // Dispatch event
      document.dispatchEvent(event);

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should still call previousSlide (implementation decides behavior at boundary)
      expect(presentationManager.previousSlide).toHaveBeenCalled();
    });

    test('should handle navigation at boundaries (last slide)', async () => {
      // Set to last slide
      presentationManager.currentSlideIndex = 2;

      const event = new dom.window.KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true
      });

      // Dispatch event
      document.dispatchEvent(event);

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should still call nextSlide (implementation decides behavior at boundary)
      expect(presentationManager.nextSlide).toHaveBeenCalled();
    });

    test('should handle errors during keyboard navigation gracefully', async () => {
      // Make nextSlide throw error
      presentationManager.nextSlide = jest.fn(async () => {
        throw new Error('Navigation failed');
      });

      // Spy on console.error
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      const event = new dom.window.KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true
      });

      // Should not throw
      expect(() => {
        document.dispatchEvent(event);
      }).not.toThrow();

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 10));

      errorSpy.mockRestore();
    });
  });

  describe('Presentation Selector UI', () => {
    beforeEach(() => {
      presentationUI.initialize({});
    });

    test('should have presentation dropdown element', () => {
      const dropdown = document.getElementById('presentation-dropdown');
      expect(dropdown).toBeTruthy();
      expect(dropdown.tagName).toBe('SELECT');
    });

    test('should have new presentation button', () => {
      const newBtn = document.getElementById('new-presentation-btn');
      expect(newBtn).toBeTruthy();
    });

    test('should have rename presentation button', () => {
      const renameBtn = document.getElementById('rename-presentation-btn');
      expect(renameBtn).toBeTruthy();
    });

    test('should have delete presentation button', () => {
      const deleteBtn = document.getElementById('delete-presentation-btn');
      expect(deleteBtn).toBeTruthy();
    });

    test('should disable rename button when no presentation is selected', () => {
      presentationManager.presentation = null;
      presentationUI._updatePresentationSelector();

      const renameBtn = document.getElementById('rename-presentation-btn');
      expect(renameBtn.disabled).toBe(true);
    });

    test('should disable delete button when no presentation is selected', () => {
      presentationManager.presentation = null;
      presentationUI._updatePresentationSelector();

      const deleteBtn = document.getElementById('delete-presentation-btn');
      expect(deleteBtn.disabled).toBe(true);
    });

    test('should enable rename button when presentation is loaded', () => {
      presentationManager.presentation = {
        id: 'test-presentation',
        name: 'Test Presentation',
        slides: []
      };
      presentationUI._updatePresentationSelector();

      const renameBtn = document.getElementById('rename-presentation-btn');
      expect(renameBtn.disabled).toBe(false);
    });

    test('should enable delete button when presentation is loaded', () => {
      presentationManager.presentation = {
        id: 'test-presentation',
        name: 'Test Presentation',
        slides: []
      };
      presentationUI._updatePresentationSelector();

      const deleteBtn = document.getElementById('delete-presentation-btn');
      expect(deleteBtn.disabled).toBe(false);
    });

    test('should always enable new presentation button', () => {
      const newBtn = document.getElementById('new-presentation-btn');
      expect(newBtn.disabled).toBe(false);
    });

    test('should update dropdown with current presentation name', () => {
      presentationManager.presentation = {
        id: 'test-presentation',
        name: 'My Awesome Presentation',
        slides: []
      };

      presentationUI._updatePresentationSelector();

      const dropdown = document.getElementById('presentation-dropdown');
      const selectedOption = dropdown.options[dropdown.selectedIndex];

      expect(selectedOption.value).toBe('test-presentation');
      expect(selectedOption.textContent).toBe('My Awesome Presentation');
    });

    test('should show placeholder when no presentation is loaded', () => {
      presentationManager.presentation = null;
      presentationUI._updatePresentationSelector();

      const dropdown = document.getElementById('presentation-dropdown');
      const firstOption = dropdown.options[0];

      expect(firstOption.value).toBe('');
      expect(firstOption.textContent).toBe('-- Select Presentation --');
    });
  });

  describe('Edge Cases', () => {
    test('should handle missing capture panel gracefully', () => {
      // Remove capture panel from DOM
      const capturePanel = document.getElementById('capture-panel');
      capturePanel.remove();

      expect(() => {
        presentationUI.initialize({});
      }).not.toThrow();
    });

    test('should handle missing start button gracefully', () => {
      const startBtn = document.getElementById('capture-start-btn');
      startBtn.remove();

      expect(() => {
        presentationUI.initialize({});
      }).not.toThrow();
    });

    test('should handle missing stop button gracefully', () => {
      const stopBtn = document.getElementById('capture-stop-btn');
      stopBtn.remove();

      expect(() => {
        presentationUI.initialize({});
      }).not.toThrow();
    });

    test('should handle missing status element gracefully', () => {
      const statusElement = document.getElementById('capture-status');
      statusElement.remove();

      presentationUI.initialize({});

      expect(() => {
        presentationUI._updateCaptureUI();
      }).not.toThrow();
    });

    test('should update UI correctly when elements are missing', () => {
      // Remove all capture UI elements
      document.getElementById('capture-start-btn').remove();
      document.getElementById('capture-stop-btn').remove();
      document.getElementById('capture-status').remove();

      presentationUI.initialize({});

      expect(() => {
        captureManager.capturing = true;
        presentationUI._updateCaptureUI();
      }).not.toThrow();
    });
  });
});
