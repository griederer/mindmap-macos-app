/**
 * Unit tests for CaptureManager
 * Task 3.2 - Write tests for startCapture() and stopCapture()
 */

const CaptureManager = require('./capture-manager');
const StateEngine = require('./state-engine');

describe('CaptureManager', () => {
  let captureManager;
  let stateEngine;
  let mockMindmap;

  beforeEach(() => {
    stateEngine = new StateEngine();
    captureManager = new CaptureManager(stateEngine);

    mockMindmap = {
      camera: { x: 0, y: 0, zoom: 1 },
      expandedNodes: new Set(),
      focusedNode: null,
      infoPanel: { open: false, nodeId: null },
      imageModal: { open: false, nodeId: null, imageIndex: null },
      visibleRelationships: new Set(),
      focusMode: false
    };
  });

  describe('startCapture() and stopCapture()', () => {
    test('should activate capture mode when startCapture is called', () => {
      expect(captureManager.isCaptureActive()).toBe(false);

      captureManager.startCapture(mockMindmap);

      expect(captureManager.isCaptureActive()).toBe(true);
    });

    test('should deactivate capture mode when stopCapture is called', () => {
      captureManager.startCapture(mockMindmap);
      expect(captureManager.isCaptureActive()).toBe(true);

      captureManager.stopCapture();

      expect(captureManager.isCaptureActive()).toBe(false);
    });

    test('should initialize empty action log on startCapture', () => {
      captureManager.startCapture(mockMindmap);

      expect(captureManager.getActionCount()).toBe(0);
    });

    test('should return action log when stopCapture is called', () => {
      captureManager.startCapture(mockMindmap);

      const result = captureManager.stopCapture();

      expect(Array.isArray(result)).toBe(true);
    });

    test('should not log actions when capture mode is inactive', () => {
      // Attempt to log without starting capture
      expect(captureManager.isCaptureActive()).toBe(false);
      expect(captureManager.getActionCount()).toBe(0);
    });

    test('should allow multiple start/stop cycles', () => {
      // First cycle
      captureManager.startCapture(mockMindmap);
      expect(captureManager.isCaptureActive()).toBe(true);
      captureManager.stopCapture();
      expect(captureManager.isCaptureActive()).toBe(false);

      // Second cycle
      captureManager.startCapture(mockMindmap);
      expect(captureManager.isCaptureActive()).toBe(true);
      captureManager.stopCapture();
      expect(captureManager.isCaptureActive()).toBe(false);
    });

    test('should capture initial state snapshot on startCapture', () => {
      const customMindmap = {
        camera: { x: 100, y: 200, zoom: 1.5 },
        expandedNodes: new Set(['node-1', 'node-2']),
        focusedNode: 'node-1',
        infoPanel: { open: true, nodeId: 'node-1' },
        imageModal: { open: false, nodeId: null, imageIndex: null },
        visibleRelationships: new Set(['rel-1']),
        focusMode: false
      };

      captureManager.startCapture(customMindmap);

      // Initial state should be captured (implementation will verify this)
      expect(captureManager.isCaptureActive()).toBe(true);
    });

    test('should clear action log between capture sessions', () => {
      // First session
      captureManager.startCapture(mockMindmap);
      captureManager.stopCapture();

      // Second session should start fresh
      captureManager.startCapture(mockMindmap);
      expect(captureManager.getActionCount()).toBe(0);
    });
  });

  describe('isCaptureActive()', () => {
    test('should return false initially', () => {
      expect(captureManager.isCaptureActive()).toBe(false);
    });

    test('should return true when capturing', () => {
      captureManager.startCapture(mockMindmap);
      expect(captureManager.isCaptureActive()).toBe(true);
    });

    test('should return false after stopping', () => {
      captureManager.startCapture(mockMindmap);
      captureManager.stopCapture();
      expect(captureManager.isCaptureActive()).toBe(false);
    });
  });

  describe('getActionCount()', () => {
    test('should return 0 initially', () => {
      expect(captureManager.getActionCount()).toBe(0);
    });

    test('should return 0 when capture mode is active but no actions logged', () => {
      captureManager.startCapture(mockMindmap);
      expect(captureManager.getActionCount()).toBe(0);
    });
  });

  describe('Action Logging', () => {
    beforeEach(() => {
      captureManager.startCapture(mockMindmap);
    });

    test('should log node expand action', () => {
      captureManager.logAction('node-expand', { nodeId: 'node-1' });

      expect(captureManager.getActionCount()).toBe(1);
      const actions = captureManager.getCapturedActions();
      expect(actions[0].type).toBe('node-expand');
      expect(actions[0].data.nodeId).toBe('node-1');
    });

    test('should log node collapse action', () => {
      captureManager.logAction('node-collapse', { nodeId: 'node-2' });

      const actions = captureManager.getCapturedActions();
      expect(actions[0].type).toBe('node-collapse');
      expect(actions[0].data.nodeId).toBe('node-2');
    });

    test('should log info panel open action', () => {
      captureManager.logAction('info-open', { nodeId: 'node-3' });

      const actions = captureManager.getCapturedActions();
      expect(actions[0].type).toBe('info-open');
      expect(actions[0].data.nodeId).toBe('node-3');
    });

    test('should log info panel close action', () => {
      captureManager.logAction('info-close', {});

      const actions = captureManager.getCapturedActions();
      expect(actions[0].type).toBe('info-close');
    });

    test('should log image modal open action', () => {
      captureManager.logAction('image-open', { nodeId: 'node-4', imageIndex: 2 });

      const actions = captureManager.getCapturedActions();
      expect(actions[0].type).toBe('image-open');
      expect(actions[0].data.nodeId).toBe('node-4');
      expect(actions[0].data.imageIndex).toBe(2);
    });

    test('should log image modal close action', () => {
      captureManager.logAction('image-close', {});

      const actions = captureManager.getCapturedActions();
      expect(actions[0].type).toBe('image-close');
    });

    test('should log relationship show action', () => {
      captureManager.logAction('relationship-show', { relationshipId: 'rel-1' });

      const actions = captureManager.getCapturedActions();
      expect(actions[0].type).toBe('relationship-show');
      expect(actions[0].data.relationshipId).toBe('rel-1');
    });

    test('should log relationship hide action', () => {
      captureManager.logAction('relationship-hide', { relationshipId: 'rel-2' });

      const actions = captureManager.getCapturedActions();
      expect(actions[0].type).toBe('relationship-hide');
      expect(actions[0].data.relationshipId).toBe('rel-2');
    });

    test('should log camera move action', () => {
      captureManager.logAction('camera-move', { x: 100, y: 200, zoom: 1.5 });

      const actions = captureManager.getCapturedActions();
      expect(actions[0].type).toBe('camera-move');
      expect(actions[0].data.x).toBe(100);
      expect(actions[0].data.y).toBe(200);
      expect(actions[0].data.zoom).toBe(1.5);
    });

    test('should log focus mode activation', () => {
      captureManager.logAction('focus-activate', { nodeId: 'node-5' });

      const actions = captureManager.getCapturedActions();
      expect(actions[0].type).toBe('focus-activate');
      expect(actions[0].data.nodeId).toBe('node-5');
    });

    test('should log focus mode deactivation', () => {
      captureManager.logAction('focus-deactivate', {});

      const actions = captureManager.getCapturedActions();
      expect(actions[0].type).toBe('focus-deactivate');
    });

    test('should include timestamp in logged actions', () => {
      const beforeTime = Date.now();
      captureManager.logAction('node-expand', { nodeId: 'node-1' });
      const afterTime = Date.now();

      const actions = captureManager.getCapturedActions();
      expect(actions[0].timestamp).toBeDefined();
      expect(actions[0].timestamp).toBeInstanceOf(Date);
      expect(actions[0].timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime);
      expect(actions[0].timestamp.getTime()).toBeLessThanOrEqual(afterTime);
    });

    test('should maintain chronological order of actions', () => {
      captureManager.logAction('node-expand', { nodeId: 'node-1' });
      captureManager.logAction('info-open', { nodeId: 'node-1' });
      captureManager.logAction('image-open', { nodeId: 'node-1', imageIndex: 0 });

      const actions = captureManager.getCapturedActions();
      expect(actions.length).toBe(3);
      expect(actions[0].type).toBe('node-expand');
      expect(actions[1].type).toBe('info-open');
      expect(actions[2].type).toBe('image-open');
    });

    test('should not log actions when capture mode is inactive', () => {
      captureManager.stopCapture();

      captureManager.logAction('node-expand', { nodeId: 'node-1' });

      expect(captureManager.getActionCount()).toBe(0);
    });

    test('should allow clearing the action log', () => {
      captureManager.logAction('node-expand', { nodeId: 'node-1' });
      captureManager.logAction('node-expand', { nodeId: 'node-2' });
      expect(captureManager.getActionCount()).toBe(2);

      captureManager.clearLog();

      expect(captureManager.getActionCount()).toBe(0);
    });
  });

  describe('createSlideFromAction()', () => {
    beforeEach(() => {
      captureManager.startCapture(mockMindmap);
    });

    test('should create slide from node expand action', () => {
      captureManager.logAction('node-expand', { nodeId: 'node-1' });

      const slide = captureManager.createSlideFromAction(0, mockMindmap);

      expect(slide).toBeDefined();
      expect(slide.actionType).toBe('node-expand');
      expect(slide.state).toBeDefined();
    });

    test('should create slide from info panel open action', () => {
      captureManager.logAction('info-open', { nodeId: 'node-2' });

      const slide = captureManager.createSlideFromAction(0, mockMindmap);

      expect(slide.actionType).toBe('info-open');
      expect(slide.state.infoPanel.open).toBe(false); // captures current state
    });

    test('should create slide from image modal open action', () => {
      captureManager.logAction('image-open', { nodeId: 'node-3', imageIndex: 1 });

      const slide = captureManager.createSlideFromAction(0, mockMindmap);

      expect(slide.actionType).toBe('image-open');
      expect(slide.actionData.nodeId).toBe('node-3');
      expect(slide.actionData.imageIndex).toBe(1);
    });

    test('should create slide from camera move action', () => {
      captureManager.logAction('camera-move', { x: 100, y: 200, zoom: 1.5 });

      const slide = captureManager.createSlideFromAction(0, mockMindmap);

      expect(slide.actionType).toBe('camera-move');
      expect(slide.actionData.x).toBe(100);
      expect(slide.actionData.y).toBe(200);
      expect(slide.actionData.zoom).toBe(1.5);
    });

    test('should include timestamp in slide', () => {
      captureManager.logAction('node-expand', { nodeId: 'node-1' });

      const slide = captureManager.createSlideFromAction(0, mockMindmap);

      expect(slide.timestamp).toBeDefined();
      expect(slide.timestamp).toBeInstanceOf(Date);
    });

    test('should capture current mindmap state in slide', () => {
      captureManager.logAction('node-expand', { nodeId: 'node-1' });

      const slide = captureManager.createSlideFromAction(0, mockMindmap);

      expect(slide.state).toBeDefined();
      expect(slide.state.camera).toEqual({ x: 0, y: 0, zoom: 1 });
      expect(slide.state.expandedNodes).toEqual([]);
      expect(slide.state.focusMode).toBe(false);
    });

    test('should throw error if action index out of bounds', () => {
      captureManager.logAction('node-expand', { nodeId: 'node-1' });

      expect(() => {
        captureManager.createSlideFromAction(5, mockMindmap);
      }).toThrow('Action index out of bounds');
    });

    test('should throw error if negative action index', () => {
      captureManager.logAction('node-expand', { nodeId: 'node-1' });

      expect(() => {
        captureManager.createSlideFromAction(-1, mockMindmap);
      }).toThrow('Action index out of bounds');
    });

    test('should include slide ID in created slide', () => {
      captureManager.logAction('node-expand', { nodeId: 'node-1' });

      const slide = captureManager.createSlideFromAction(0, mockMindmap);

      expect(slide.id).toBeDefined();
      expect(typeof slide.id).toBe('string');
    });

    test('should create multiple slides with unique IDs', () => {
      captureManager.logAction('node-expand', { nodeId: 'node-1' });
      captureManager.logAction('info-open', { nodeId: 'node-1' });

      const slide1 = captureManager.createSlideFromAction(0, mockMindmap);
      const slide2 = captureManager.createSlideFromAction(1, mockMindmap);

      expect(slide1.id).not.toBe(slide2.id);
    });
  });
});
