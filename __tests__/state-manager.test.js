const StateManager = require('../src/managers/state-manager');

describe('StateManager', () => {
  let manager;

  beforeEach(() => {
    manager = new StateManager();
  });

  describe('getState', () => {
    test('should return immutable copy of state', () => {
      const state1 = manager.getState();
      const state2 = manager.getState();

      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });

    test('should have default state structure', () => {
      const state = manager.getState();

      expect(state).toHaveProperty('currentProject');
      expect(state).toHaveProperty('projectPath');
      expect(state).toHaveProperty('content');
      expect(state).toHaveProperty('nodes');
      expect(state).toHaveProperty('categories');
      expect(state).toHaveProperty('relationships');
      expect(state).toHaveProperty('connections');
      expect(state).toHaveProperty('focusedNodeId');
      expect(state).toHaveProperty('selectedNodeId');
      expect(state).toHaveProperty('customOrders');
      expect(state).toHaveProperty('customPositions');
      expect(state).toHaveProperty('metadata');
      expect(state).toHaveProperty('isDirty');
    });
  });

  describe('setState', () => {
    test('should update state immutably', () => {
      const oldState = manager.getState();

      manager.setState({ currentProject: 'Test Project' });
      const newState = manager.getState();

      expect(oldState).not.toBe(newState);
      expect(newState.currentProject).toBe('Test Project');
    });

    test('should mark state as dirty', () => {
      manager.setState({ currentProject: 'Test' });

      expect(manager.getState().isDirty).toBe(true);
    });

    test('should merge updates with existing state', () => {
      manager.setState({ currentProject: 'Test' });
      manager.setState({ content: 'Some content' });

      const state = manager.getState();
      expect(state.currentProject).toBe('Test');
      expect(state.content).toBe('Some content');
    });

    test('should notify subscribers', () => {
      const callback = jest.fn();
      manager.subscribe(callback);

      manager.setState({ currentProject: 'Test' });

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ currentProject: 'Test' })
      );
    });
  });

  describe('subscribe', () => {
    test('should add subscriber', () => {
      const callback = jest.fn();

      manager.subscribe(callback);
      manager.setState({ currentProject: 'Test' });

      expect(callback).toHaveBeenCalled();
    });

    test('should return unsubscribe function', () => {
      const callback = jest.fn();

      const unsubscribe = manager.subscribe(callback);
      unsubscribe();
      manager.setState({ currentProject: 'Test' });

      expect(callback).not.toHaveBeenCalled();
    });

    test('should support multiple subscribers', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      manager.subscribe(callback1);
      manager.subscribe(callback2);
      manager.setState({ currentProject: 'Test' });

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe('undo/redo', () => {
    test('should undo state change', () => {
      manager.setState({ currentProject: 'Project 1' });
      manager.setState({ currentProject: 'Project 2' });

      manager.undo();

      expect(manager.getState().currentProject).toBe('Project 1');
    });

    test('should redo state change', () => {
      manager.setState({ currentProject: 'Project 1' });
      manager.setState({ currentProject: 'Project 2' });
      manager.undo();

      manager.redo();

      expect(manager.getState().currentProject).toBe('Project 2');
    });

    test('should return false when no undo available', () => {
      const result = manager.undo();
      expect(result).toBe(false);
    });

    test('should return false when no redo available', () => {
      manager.setState({ currentProject: 'Test' });
      const result = manager.redo();
      expect(result).toBe(false);
    });

    test('should clear redo history when new change made', () => {
      manager.setState({ currentProject: 'Project 1' });
      manager.setState({ currentProject: 'Project 2' });
      manager.undo();
      manager.setState({ currentProject: 'Project 3' });

      const canRedo = manager.canRedo();
      expect(canRedo).toBe(false);
    });

    test('should notify subscribers on undo', () => {
      const callback = jest.fn();
      manager.subscribe(callback);

      manager.setState({ currentProject: 'Project 1' });
      callback.mockClear();

      manager.undo();

      expect(callback).toHaveBeenCalled();
    });

    test('should notify subscribers on redo', () => {
      const callback = jest.fn();
      manager.subscribe(callback);

      manager.setState({ currentProject: 'Project 1' });
      manager.undo();
      callback.mockClear();

      manager.redo();

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('canUndo/canRedo', () => {
    test('should return true when undo available', () => {
      manager.setState({ currentProject: 'Test' });

      expect(manager.canUndo()).toBe(true);
    });

    test('should return false when no undo available', () => {
      expect(manager.canUndo()).toBe(false);
    });

    test('should return true when redo available', () => {
      manager.setState({ currentProject: 'Test' });
      manager.undo();

      expect(manager.canRedo()).toBe(true);
    });

    test('should return false when no redo available', () => {
      expect(manager.canRedo()).toBe(false);
    });
  });

  describe('loadProject', () => {
    test('should load project data into state', () => {
      const projectData = {
        name: 'Test Project',
        content: '# Test\n## Node 1',
        nodes: { 'node-1': {} },
        categories: [{ id: 'cat-1', name: 'Important' }],
        relationships: [{ id: 'rel-1', name: 'depends on' }],
        connections: [{ id: 'conn-1', fromNodeId: 'node-1', toNodeId: 'node-2' }],
        customOrders: { 'node-1': 0 },
        customPositions: { 'node-1': { x: 100, y: 100 } },
        focusedNodeId: 'node-1',
        metadata: { created: '2025-01-01' }
      };

      manager.loadProject(projectData, '/path/to/project.pmap');

      const state = manager.getState();
      expect(state.currentProject).toBe('Test Project');
      expect(state.projectPath).toBe('/path/to/project.pmap');
      expect(state.content).toBe('# Test\n## Node 1');
      expect(state.nodes).toEqual({ 'node-1': {} });
      expect(state.categories).toEqual([{ id: 'cat-1', name: 'Important' }]);
      expect(state.isDirty).toBe(false);
    });

    test('should clear history on new project load', () => {
      manager.setState({ currentProject: 'Old Project' });

      const projectData = {
        name: 'New Project',
        content: '',
        metadata: {}
      };
      manager.loadProject(projectData, '/path/to/project.pmap');

      expect(manager.canUndo()).toBe(false);
    });

    test('should handle missing optional fields', () => {
      const projectData = {
        name: 'Minimal Project',
        content: '# Test',
        metadata: {}
      };

      manager.loadProject(projectData, '/path/to/project.pmap');

      const state = manager.getState();
      expect(state.nodes).toEqual({});
      expect(state.categories).toEqual([]);
      expect(state.relationships).toEqual([]);
      expect(state.connections).toEqual([]);
      expect(state.customOrders).toEqual({});
      expect(state.customPositions).toEqual({});
      expect(state.focusedNodeId).toBeNull();
    });
  });

  describe('markSaved', () => {
    test('should mark state as not dirty', () => {
      manager.setState({ currentProject: 'Test' });

      manager.markSaved();

      expect(manager.getState().isDirty).toBe(false);
    });

    test('should notify subscribers', () => {
      const callback = jest.fn();
      manager.subscribe(callback);
      manager.setState({ currentProject: 'Test' });
      callback.mockClear();

      manager.markSaved();

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('exportForSave', () => {
    test('should export state in project format', () => {
      manager.setState({
        currentProject: 'Test Project',
        content: '# Test',
        nodes: { 'node-1': {} },
        categories: [{ id: 'cat-1' }],
        relationships: [{ id: 'rel-1' }],
        connections: [{ id: 'conn-1' }],
        customOrders: { 'node-1': 0 },
        customPositions: { 'node-1': { x: 100, y: 100 } },
        focusedNodeId: 'node-1',
        metadata: { created: '2025-01-01' }
      });

      const exported = manager.exportForSave();

      expect(exported).toHaveProperty('name', 'Test Project');
      expect(exported).toHaveProperty('content', '# Test');
      expect(exported).toHaveProperty('nodes');
      expect(exported).toHaveProperty('categories');
      expect(exported).toHaveProperty('relationships');
      expect(exported).toHaveProperty('connections');
      expect(exported).toHaveProperty('customOrders');
      expect(exported).toHaveProperty('customPositions');
      expect(exported).toHaveProperty('focusedNodeId');
      expect(exported).toHaveProperty('metadata');
    });

    test('should add modified timestamp to metadata', () => {
      manager.setState({ currentProject: 'Test', metadata: {} });

      const exported = manager.exportForSave();

      expect(exported.metadata).toHaveProperty('modified');
      expect(typeof exported.metadata.modified).toBe('string');
    });
  });

  describe('helper methods', () => {
    test('setFocusedNode should update focusedNodeId', () => {
      manager.setFocusedNode('node-1');

      expect(manager.getState().focusedNodeId).toBe('node-1');
    });

    test('setSelectedNode should update selectedNodeId', () => {
      manager.setSelectedNode('node-1');

      expect(manager.getState().selectedNodeId).toBe('node-1');
    });

    test('updateContent should update content', () => {
      manager.updateContent('# New Content');

      expect(manager.getState().content).toBe('# New Content');
    });

    test('addCategory should add category to state', () => {
      const category = { id: 'cat-1', name: 'Important' };

      manager.addCategory(category);

      expect(manager.getState().categories).toContainEqual(category);
    });

    test('removeCategory should remove category from state', () => {
      const category = { id: 'cat-1', name: 'Important' };
      manager.addCategory(category);

      manager.removeCategory('cat-1');

      expect(manager.getState().categories).toHaveLength(0);
    });

    test('addConnection should add connection to state', () => {
      const connection = { id: 'conn-1', fromNodeId: 'node-1', toNodeId: 'node-2' };

      manager.addConnection(connection);

      expect(manager.getState().connections).toContainEqual(connection);
    });

    test('removeConnection should remove connection from state', () => {
      const connection = { id: 'conn-1', fromNodeId: 'node-1', toNodeId: 'node-2' };
      manager.addConnection(connection);

      manager.removeConnection('conn-1');

      expect(manager.getState().connections).toHaveLength(0);
    });
  });
});
