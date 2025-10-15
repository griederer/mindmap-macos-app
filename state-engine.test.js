/**
 * Unit tests for StateEngine
 * Task 2.2 - Write tests for captureState()
 */

const StateEngine = require('./state-engine');

describe('StateEngine', () => {
  let stateEngine;

  beforeEach(() => {
    stateEngine = new StateEngine();
  });

  describe('captureState()', () => {
    test('should capture camera state (x, y, zoom)', () => {
      const mockMindmap = {
        camera: { x: 100, y: 200, zoom: 1.5 }
      };

      const state = stateEngine.captureState(mockMindmap);

      expect(state.camera).toEqual({ x: 100, y: 200, zoom: 1.5 });
    });

    test('should capture expanded nodes as array', () => {
      const mockMindmap = {
        camera: { x: 0, y: 0, zoom: 1 },
        expandedNodes: new Set(['node-1', 'node-2', 'node-3'])
      };

      const state = stateEngine.captureState(mockMindmap);

      expect(state.expandedNodes).toEqual(['node-1', 'node-2', 'node-3']);
    });

    test('should capture focused node (id or null)', () => {
      const mockMindmap = {
        camera: { x: 0, y: 0, zoom: 1 },
        expandedNodes: new Set(),
        focusedNode: 'node-5'
      };

      const state = stateEngine.captureState(mockMindmap);

      expect(state.focusedNode).toBe('node-5');
    });

    test('should capture null focused node', () => {
      const mockMindmap = {
        camera: { x: 0, y: 0, zoom: 1 },
        expandedNodes: new Set(),
        focusedNode: null
      };

      const state = stateEngine.captureState(mockMindmap);

      expect(state.focusedNode).toBeNull();
    });

    test('should capture info panel state (open, nodeId)', () => {
      const mockMindmap = {
        camera: { x: 0, y: 0, zoom: 1 },
        expandedNodes: new Set(),
        focusedNode: null,
        infoPanel: { open: true, nodeId: 'node-7' }
      };

      const state = stateEngine.captureState(mockMindmap);

      expect(state.infoPanel).toEqual({ open: true, nodeId: 'node-7' });
    });

    test('should capture closed info panel', () => {
      const mockMindmap = {
        camera: { x: 0, y: 0, zoom: 1 },
        expandedNodes: new Set(),
        focusedNode: null,
        infoPanel: { open: false, nodeId: null }
      };

      const state = stateEngine.captureState(mockMindmap);

      expect(state.infoPanel).toEqual({ open: false, nodeId: null });
    });

    test('should capture image modal state (open, nodeId, imageIndex)', () => {
      const mockMindmap = {
        camera: { x: 0, y: 0, zoom: 1 },
        expandedNodes: new Set(),
        focusedNode: null,
        infoPanel: { open: false, nodeId: null },
        imageModal: { open: true, nodeId: 'node-10', imageIndex: 2 }
      };

      const state = stateEngine.captureState(mockMindmap);

      expect(state.imageModal).toEqual({ open: true, nodeId: 'node-10', imageIndex: 2 });
    });

    test('should capture closed image modal', () => {
      const mockMindmap = {
        camera: { x: 0, y: 0, zoom: 1 },
        expandedNodes: new Set(),
        focusedNode: null,
        infoPanel: { open: false, nodeId: null },
        imageModal: { open: false, nodeId: null, imageIndex: null }
      };

      const state = stateEngine.captureState(mockMindmap);

      expect(state.imageModal).toEqual({ open: false, nodeId: null, imageIndex: null });
    });

    test('should capture visible relationships as array', () => {
      const mockMindmap = {
        camera: { x: 0, y: 0, zoom: 1 },
        expandedNodes: new Set(),
        focusedNode: null,
        infoPanel: { open: false, nodeId: null },
        imageModal: { open: false, nodeId: null, imageIndex: null },
        visibleRelationships: new Set(['rel-1', 'rel-2'])
      };

      const state = stateEngine.captureState(mockMindmap);

      expect(state.visibleRelationships).toEqual(['rel-1', 'rel-2']);
    });

    test('should capture focus mode boolean', () => {
      const mockMindmap = {
        camera: { x: 0, y: 0, zoom: 1 },
        expandedNodes: new Set(),
        focusedNode: 'node-3',
        infoPanel: { open: false, nodeId: null },
        imageModal: { open: false, nodeId: null, imageIndex: null },
        visibleRelationships: new Set(),
        focusMode: true
      };

      const state = stateEngine.captureState(mockMindmap);

      expect(state.focusMode).toBe(true);
    });

    test('should capture complete state with all properties', () => {
      const mockMindmap = {
        camera: { x: 150, y: 250, zoom: 2.0 },
        expandedNodes: new Set(['node-1', 'node-2']),
        focusedNode: 'node-2',
        infoPanel: { open: true, nodeId: 'node-2' },
        imageModal: { open: false, nodeId: null, imageIndex: null },
        visibleRelationships: new Set(['rel-1']),
        focusMode: false
      };

      const state = stateEngine.captureState(mockMindmap);

      expect(state).toEqual({
        camera: { x: 150, y: 250, zoom: 2.0 },
        expandedNodes: ['node-1', 'node-2'],
        focusedNode: 'node-2',
        infoPanel: { open: true, nodeId: 'node-2' },
        imageModal: { open: false, nodeId: null, imageIndex: null },
        visibleRelationships: ['rel-1'],
        focusMode: false
      });
    });
  });

  describe('compareStates()', () => {
    test('should identify nodes to expand', () => {
      const state1 = {
        camera: { x: 0, y: 0, zoom: 1 },
        expandedNodes: ['node-1'],
        focusedNode: null,
        infoPanel: { open: false, nodeId: null },
        imageModal: { open: false, nodeId: null, imageIndex: null },
        visibleRelationships: [],
        focusMode: false
      };

      const state2 = {
        ...state1,
        expandedNodes: ['node-1', 'node-2', 'node-3']
      };

      const diff = stateEngine.compareStates(state1, state2);

      expect(diff.nodesToExpand).toEqual(['node-2', 'node-3']);
    });

    test('should identify nodes to collapse', () => {
      const state1 = {
        camera: { x: 0, y: 0, zoom: 1 },
        expandedNodes: ['node-1', 'node-2', 'node-3'],
        focusedNode: null,
        infoPanel: { open: false, nodeId: null },
        imageModal: { open: false, nodeId: null, imageIndex: null },
        visibleRelationships: [],
        focusMode: false
      };

      const state2 = {
        ...state1,
        expandedNodes: ['node-1']
      };

      const diff = stateEngine.compareStates(state1, state2);

      expect(diff.nodesToCollapse).toEqual(['node-2', 'node-3']);
    });

    test('should identify info panel opening', () => {
      const state1 = {
        camera: { x: 0, y: 0, zoom: 1 },
        expandedNodes: [],
        focusedNode: null,
        infoPanel: { open: false, nodeId: null },
        imageModal: { open: false, nodeId: null, imageIndex: null },
        visibleRelationships: [],
        focusMode: false
      };

      const state2 = {
        ...state1,
        infoPanel: { open: true, nodeId: 'node-5' }
      };

      const diff = stateEngine.compareStates(state1, state2);

      expect(diff.infoPanelChange).toEqual({ action: 'open', nodeId: 'node-5' });
    });

    test('should identify info panel closing', () => {
      const state1 = {
        camera: { x: 0, y: 0, zoom: 1 },
        expandedNodes: [],
        focusedNode: null,
        infoPanel: { open: true, nodeId: 'node-5' },
        imageModal: { open: false, nodeId: null, imageIndex: null },
        visibleRelationships: [],
        focusMode: false
      };

      const state2 = {
        ...state1,
        infoPanel: { open: false, nodeId: null }
      };

      const diff = stateEngine.compareStates(state1, state2);

      expect(diff.infoPanelChange).toEqual({ action: 'close', nodeId: null });
    });

    test('should identify image modal opening', () => {
      const state1 = {
        camera: { x: 0, y: 0, zoom: 1 },
        expandedNodes: [],
        focusedNode: null,
        infoPanel: { open: false, nodeId: null },
        imageModal: { open: false, nodeId: null, imageIndex: null },
        visibleRelationships: [],
        focusMode: false
      };

      const state2 = {
        ...state1,
        imageModal: { open: true, nodeId: 'node-7', imageIndex: 2 }
      };

      const diff = stateEngine.compareStates(state1, state2);

      expect(diff.imageModalChange).toEqual({ action: 'open', nodeId: 'node-7', imageIndex: 2 });
    });

    test('should identify image modal closing', () => {
      const state1 = {
        camera: { x: 0, y: 0, zoom: 1 },
        expandedNodes: [],
        focusedNode: null,
        infoPanel: { open: false, nodeId: null },
        imageModal: { open: true, nodeId: 'node-7', imageIndex: 2 },
        visibleRelationships: [],
        focusMode: false
      };

      const state2 = {
        ...state1,
        imageModal: { open: false, nodeId: null, imageIndex: null }
      };

      const diff = stateEngine.compareStates(state1, state2);

      expect(diff.imageModalChange).toEqual({ action: 'close', nodeId: null, imageIndex: null });
    });

    test('should identify relationships to show', () => {
      const state1 = {
        camera: { x: 0, y: 0, zoom: 1 },
        expandedNodes: [],
        focusedNode: null,
        infoPanel: { open: false, nodeId: null },
        imageModal: { open: false, nodeId: null, imageIndex: null },
        visibleRelationships: ['rel-1'],
        focusMode: false
      };

      const state2 = {
        ...state1,
        visibleRelationships: ['rel-1', 'rel-2', 'rel-3']
      };

      const diff = stateEngine.compareStates(state1, state2);

      expect(diff.relationshipsToShow).toEqual(['rel-2', 'rel-3']);
    });

    test('should identify relationships to hide', () => {
      const state1 = {
        camera: { x: 0, y: 0, zoom: 1 },
        expandedNodes: [],
        focusedNode: null,
        infoPanel: { open: false, nodeId: null },
        imageModal: { open: false, nodeId: null, imageIndex: null },
        visibleRelationships: ['rel-1', 'rel-2', 'rel-3'],
        focusMode: false
      };

      const state2 = {
        ...state1,
        visibleRelationships: ['rel-1']
      };

      const diff = stateEngine.compareStates(state1, state2);

      expect(diff.relationshipsToHide).toEqual(['rel-2', 'rel-3']);
    });

    test('should identify focus mode activation', () => {
      const state1 = {
        camera: { x: 0, y: 0, zoom: 1 },
        expandedNodes: [],
        focusedNode: null,
        infoPanel: { open: false, nodeId: null },
        imageModal: { open: false, nodeId: null, imageIndex: null },
        visibleRelationships: [],
        focusMode: false
      };

      const state2 = {
        ...state1,
        focusedNode: 'node-10',
        focusMode: true
      };

      const diff = stateEngine.compareStates(state1, state2);

      expect(diff.focusChange).toEqual({ enabled: true, nodeId: 'node-10' });
    });

    test('should identify focus mode deactivation', () => {
      const state1 = {
        camera: { x: 0, y: 0, zoom: 1 },
        expandedNodes: [],
        focusedNode: 'node-10',
        infoPanel: { open: false, nodeId: null },
        imageModal: { open: false, nodeId: null, imageIndex: null },
        visibleRelationships: [],
        focusMode: true
      };

      const state2 = {
        ...state1,
        focusedNode: null,
        focusMode: false
      };

      const diff = stateEngine.compareStates(state1, state2);

      expect(diff.focusChange).toEqual({ enabled: false, nodeId: null });
    });

    test('should identify camera position change', () => {
      const state1 = {
        camera: { x: 0, y: 0, zoom: 1 },
        expandedNodes: [],
        focusedNode: null,
        infoPanel: { open: false, nodeId: null },
        imageModal: { open: false, nodeId: null, imageIndex: null },
        visibleRelationships: [],
        focusMode: false
      };

      const state2 = {
        ...state1,
        camera: { x: 100, y: 200, zoom: 1.5 }
      };

      const diff = stateEngine.compareStates(state1, state2);

      expect(diff.cameraChange).toEqual({ x: 100, y: 200, zoom: 1.5 });
    });

    test('should return null for unchanged properties', () => {
      const state1 = {
        camera: { x: 0, y: 0, zoom: 1 },
        expandedNodes: ['node-1'],
        focusedNode: null,
        infoPanel: { open: false, nodeId: null },
        imageModal: { open: false, nodeId: null, imageIndex: null },
        visibleRelationships: [],
        focusMode: false
      };

      const state2 = { ...state1 };

      const diff = stateEngine.compareStates(state1, state2);

      expect(diff.nodesToExpand).toEqual([]);
      expect(diff.nodesToCollapse).toEqual([]);
      expect(diff.infoPanelChange).toBeNull();
      expect(diff.imageModalChange).toBeNull();
      expect(diff.relationshipsToShow).toEqual([]);
      expect(diff.relationshipsToHide).toEqual([]);
      expect(diff.focusChange).toBeNull();
      expect(diff.cameraChange).toBeNull();
    });
  });

  describe('State Serialization/Deserialization', () => {
    test('should serialize state to JSON string', () => {
      const state = {
        camera: { x: 100, y: 200, zoom: 1.5 },
        expandedNodes: ['node-1', 'node-2'],
        focusedNode: 'node-2',
        infoPanel: { open: true, nodeId: 'node-2' },
        imageModal: { open: false, nodeId: null, imageIndex: null },
        visibleRelationships: ['rel-1'],
        focusMode: false
      };

      const json = stateEngine.serializeState(state);

      expect(typeof json).toBe('string');
      expect(json).toContain('"x":100');
      expect(json).toContain('"expandedNodes":["node-1","node-2"]');
    });

    test('should deserialize JSON string to state object', () => {
      const json = '{"camera":{"x":100,"y":200,"zoom":1.5},"expandedNodes":["node-1","node-2"],"focusedNode":"node-2","infoPanel":{"open":true,"nodeId":"node-2"},"imageModal":{"open":false,"nodeId":null,"imageIndex":null},"visibleRelationships":["rel-1"],"focusMode":false}';

      const state = stateEngine.deserializeState(json);

      expect(state.camera).toEqual({ x: 100, y: 200, zoom: 1.5 });
      expect(state.expandedNodes).toEqual(['node-1', 'node-2']);
      expect(state.focusedNode).toBe('node-2');
    });

    test('should complete JSON roundtrip without data loss', () => {
      const originalState = {
        camera: { x: 150, y: 250, zoom: 2.0 },
        expandedNodes: ['node-1', 'node-2', 'node-3'],
        focusedNode: 'node-3',
        infoPanel: { open: true, nodeId: 'node-3' },
        imageModal: { open: false, nodeId: null, imageIndex: null },
        visibleRelationships: ['rel-1', 'rel-2'],
        focusMode: true
      };

      const json = stateEngine.serializeState(originalState);
      const deserializedState = stateEngine.deserializeState(json);

      expect(deserializedState).toEqual(originalState);
    });

    test('should handle empty arrays in serialization', () => {
      const state = {
        camera: { x: 0, y: 0, zoom: 1 },
        expandedNodes: [],
        focusedNode: null,
        infoPanel: { open: false, nodeId: null },
        imageModal: { open: false, nodeId: null, imageIndex: null },
        visibleRelationships: [],
        focusMode: false
      };

      const json = stateEngine.serializeState(state);
      const result = stateEngine.deserializeState(json);

      expect(result.expandedNodes).toEqual([]);
      expect(result.visibleRelationships).toEqual([]);
    });

    test('should handle null values in serialization', () => {
      const state = {
        camera: { x: 0, y: 0, zoom: 1 },
        expandedNodes: [],
        focusedNode: null,
        infoPanel: { open: false, nodeId: null },
        imageModal: { open: false, nodeId: null, imageIndex: null },
        visibleRelationships: [],
        focusMode: false
      };

      const json = stateEngine.serializeState(state);
      const result = stateEngine.deserializeState(json);

      expect(result.focusedNode).toBeNull();
      expect(result.infoPanel.nodeId).toBeNull();
      expect(result.imageModal.nodeId).toBeNull();
      expect(result.imageModal.imageIndex).toBeNull();
    });
  });

  describe('validateState()', () => {
    test('should validate correct state structure', () => {
      const validState = {
        camera: { x: 100, y: 200, zoom: 1.5 },
        expandedNodes: ['node-1', 'node-2'],
        focusedNode: 'node-2',
        infoPanel: { open: true, nodeId: 'node-2' },
        imageModal: { open: false, nodeId: null, imageIndex: null },
        visibleRelationships: ['rel-1'],
        focusMode: false
      };

      const result = stateEngine.validateState(validState);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should reject state missing camera property', () => {
      const invalidState = {
        expandedNodes: [],
        focusedNode: null,
        infoPanel: { open: false, nodeId: null },
        imageModal: { open: false, nodeId: null, imageIndex: null },
        visibleRelationships: [],
        focusMode: false
      };

      const result = stateEngine.validateState(invalidState);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required property: camera');
    });

    test('should reject state with invalid camera structure', () => {
      const invalidState = {
        camera: { x: 100 }, // missing y and zoom
        expandedNodes: [],
        focusedNode: null,
        infoPanel: { open: false, nodeId: null },
        imageModal: { open: false, nodeId: null, imageIndex: null },
        visibleRelationships: [],
        focusMode: false
      };

      const result = stateEngine.validateState(invalidState);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should reject state with non-array expandedNodes', () => {
      const invalidState = {
        camera: { x: 0, y: 0, zoom: 1 },
        expandedNodes: 'not-an-array',
        focusedNode: null,
        infoPanel: { open: false, nodeId: null },
        imageModal: { open: false, nodeId: null, imageIndex: null },
        visibleRelationships: [],
        focusMode: false
      };

      const result = stateEngine.validateState(invalidState);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('expandedNodes must be an array');
    });

    test('should reject state with invalid infoPanel structure', () => {
      const invalidState = {
        camera: { x: 0, y: 0, zoom: 1 },
        expandedNodes: [],
        focusedNode: null,
        infoPanel: { open: true }, // missing nodeId
        imageModal: { open: false, nodeId: null, imageIndex: null },
        visibleRelationships: [],
        focusMode: false
      };

      const result = stateEngine.validateState(invalidState);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should reject state with invalid imageModal structure', () => {
      const invalidState = {
        camera: { x: 0, y: 0, zoom: 1 },
        expandedNodes: [],
        focusedNode: null,
        infoPanel: { open: false, nodeId: null },
        imageModal: { open: true, nodeId: 'node-5' }, // missing imageIndex
        visibleRelationships: [],
        focusMode: false
      };

      const result = stateEngine.validateState(invalidState);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should reject state with non-boolean focusMode', () => {
      const invalidState = {
        camera: { x: 0, y: 0, zoom: 1 },
        expandedNodes: [],
        focusedNode: null,
        infoPanel: { open: false, nodeId: null },
        imageModal: { open: false, nodeId: null, imageIndex: null },
        visibleRelationships: [],
        focusMode: 'not-a-boolean'
      };

      const result = stateEngine.validateState(invalidState);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('focusMode must be a boolean');
    });

    test('should accept state with null focusedNode', () => {
      const validState = {
        camera: { x: 0, y: 0, zoom: 1 },
        expandedNodes: [],
        focusedNode: null,
        infoPanel: { open: false, nodeId: null },
        imageModal: { open: false, nodeId: null, imageIndex: null },
        visibleRelationships: [],
        focusMode: false
      };

      const result = stateEngine.validateState(validState);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });
});
