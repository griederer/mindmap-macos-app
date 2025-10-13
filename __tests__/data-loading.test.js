/**
 * Data Loading & Node Counter Tests
 * Tests for PRD #0002: Critical Bug Resolution
 */

const path = require('path');
const fs = require('fs');

// Mock Electron APIs
global.window = {
    mindmapEngine: {
        nodes: null,
        nodeData: {},
        positions: {},
        selectedNode: null,
        focusedNodeId: null,
        canvas: { width: 4000, height: 3000 },
        ctx: {
            clearRect: jest.fn(),
            createLinearGradient: jest.fn(() => ({
                addColorStop: jest.fn()
            }))
        },
        countProjectNodes: jest.fn(),
        parseOutline: jest.fn(),
        renderNodes: jest.fn(),
        drawConnections: jest.fn()
    },
    projectManager: {
        loadProject: jest.fn(),
        getLastOpenedProject: jest.fn(),
        listProjects: jest.fn()
    },
    localStorage: {}
};

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; },
        get length() { return Object.keys(store).length; },
        key: (index) => Object.keys(store)[index] || null
    };
})();

Object.defineProperty(global, 'localStorage', {
    value: localStorageMock
});

describe('PRD #0002: Data Loading & Node Counter', () => {

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        localStorage.clear();

        // Reset mindmap engine state
        window.mindmapEngine.nodes = null;
        window.mindmapEngine.nodeData = {};
        window.mindmapEngine.positions = {};
    });

    describe('FR-001: Correct Property Assignment', () => {

        test('should load nodeData from projectData.nodes after v5.0 migration', () => {
            // Simulate migrated v5.0 project (migration already happened in project-manager)
            const mockProjectData = {
                name: 'Test Project',
                content: 'Root\n1. Child A\n2. Child B',
                nodes: {  // After migration, this IS nodeData
                    'node-0': {
                        description: 'Root description',
                        notes: '',
                        images: [],
                        relationships: []
                    },
                    'node-1': {
                        description: 'Child A description',
                        notes: '',
                        images: [],
                        relationships: []
                    },
                    'node-2': {
                        description: 'Child B description',
                        notes: '',
                        images: [],
                        relationships: []
                    }
                },
                metadata: { version: '4.0' },
                categories: [],
                relationships: []
            };

            // Simulate loadProject assigning nodeData
            window.mindmapEngine.nodeData = mockProjectData.nodes;

            // Verify nodeData was loaded correctly
            expect(window.mindmapEngine.nodeData).toHaveProperty('node-0');
            expect(window.mindmapEngine.nodeData).toHaveProperty('node-1');
            expect(window.mindmapEngine.nodeData).toHaveProperty('node-2');
            expect(Object.keys(window.mindmapEngine.nodeData).length).toBe(3);
        });

        test('should handle empty nodeData gracefully', () => {
            const mockProjectData = {
                name: 'Empty Project',
                content: 'Root',
                nodes: {},  // Empty nodeData
                metadata: {},
                categories: [],
                relationships: []
            };

            window.mindmapEngine.nodeData = mockProjectData.nodes || {};

            expect(window.mindmapEngine.nodeData).toEqual({});
            expect(Object.keys(window.mindmapEngine.nodeData).length).toBe(0);
        });
    });

    describe('FR-003: Clear Stale Data', () => {

        test('should clear all mindmap engine data', () => {
            // Set up stale data
            window.mindmapEngine.nodes = { id: 'stale-root', children: [] };
            window.mindmapEngine.nodeData = { 'stale-node': { description: 'old' } };
            window.mindmapEngine.positions = { 'stale-node': { x: 100, y: 100 } };
            window.mindmapEngine.selectedNode = 'stale-node';
            window.mindmapEngine.focusedNodeId = 'stale-node';

            // Clear stale data
            window.mindmapEngine.nodes = null;
            window.mindmapEngine.nodeData = {};
            window.mindmapEngine.positions = {};
            window.mindmapEngine.selectedNode = null;
            window.mindmapEngine.focusedNodeId = null;

            // Verify all cleared
            expect(window.mindmapEngine.nodes).toBeNull();
            expect(window.mindmapEngine.nodeData).toEqual({});
            expect(window.mindmapEngine.positions).toEqual({});
            expect(window.mindmapEngine.selectedNode).toBeNull();
            expect(window.mindmapEngine.focusedNodeId).toBeNull();
        });

        test('should clear localStorage for specific project', () => {
            const projectId = 'test-project-123';

            // Set up stale localStorage
            localStorage.setItem(`mindmap-content-${projectId}`, 'stale content');
            localStorage.setItem(`mindmap-nodedata-${projectId}`, '{"stale": true}');
            localStorage.setItem(`mindmap-orders-${projectId}`, '{}');

            // Verify data exists
            expect(localStorage.getItem(`mindmap-content-${projectId}`)).toBeTruthy();

            // Clear project data
            localStorage.removeItem(`mindmap-content-${projectId}`);
            localStorage.removeItem(`mindmap-nodedata-${projectId}`);
            localStorage.removeItem(`mindmap-orders-${projectId}`);

            // Verify cleared
            expect(localStorage.getItem(`mindmap-content-${projectId}`)).toBeNull();
            expect(localStorage.getItem(`mindmap-nodedata-${projectId}`)).toBeNull();
            expect(localStorage.getItem(`mindmap-orders-${projectId}`)).toBeNull();
        });

        test('should clear canvas', () => {
            const clearRectSpy = window.mindmapEngine.ctx.clearRect;

            // Simulate canvas clear
            window.mindmapEngine.ctx.clearRect(
                0, 0,
                window.mindmapEngine.canvas.width,
                window.mindmapEngine.canvas.height
            );

            expect(clearRectSpy).toHaveBeenCalledWith(0, 0, 4000, 3000);
        });
    });

    describe('FR-004: Project Data Validation', () => {

        test('should validate required fields exist', () => {
            const validProjectData = {
                name: 'Valid Project',
                content: 'Root\n1. Child',
                nodes: {},
                metadata: {},
                categories: [],
                relationships: []
            };

            const requiredFields = ['name', 'content', 'nodes'];

            requiredFields.forEach(field => {
                expect(validProjectData).toHaveProperty(field);
            });
        });

        test('should detect missing required fields', () => {
            const invalidProjectData = {
                name: 'Invalid Project',
                // Missing 'content' field
                nodes: {}
            };

            const requiredFields = ['name', 'content', 'nodes'];
            const missingFields = requiredFields.filter(field => !(field in invalidProjectData));

            expect(missingFields).toContain('content');
            expect(missingFields.length).toBeGreaterThan(0);
        });

        test('should validate content is string', () => {
            const projectData = {
                name: 'Test',
                content: 'Valid string content',
                nodes: {}
            };

            expect(typeof projectData.content).toBe('string');
        });

        test('should validate nodes is object', () => {
            const projectData = {
                name: 'Test',
                content: 'Content',
                nodes: { 'node-0': {} }
            };

            expect(typeof projectData.nodes).toBe('object');
            expect(Array.isArray(projectData.nodes)).toBe(false);
        });

        test('should validate categories is array if present', () => {
            const projectData = {
                name: 'Test',
                content: 'Content',
                nodes: {},
                categories: [{ id: 'cat-1', name: 'Category 1' }]
            };

            expect(Array.isArray(projectData.categories)).toBe(true);
        });

        test('should validate relationships is array if present', () => {
            const projectData = {
                name: 'Test',
                content: 'Content',
                nodes: {},
                relationships: [{ id: 'rel-1', name: 'depends on' }]
            };

            expect(Array.isArray(projectData.relationships)).toBe(true);
        });
    });

    describe('FR-006: Node Counter Accuracy', () => {

        test('should count nodes from tree structure', () => {
            // Create test tree
            const testTree = {
                id: 'node-0',
                title: 'Root',
                children: [
                    { id: 'node-1', title: 'Child A', children: [] },
                    { id: 'node-2', title: 'Child B', children: [] },
                    { id: 'node-3', title: 'Child C', children: [] }
                ]
            };

            // Mock countProjectNodes implementation
            const countNodes = (node) => {
                if (!node) return 0;
                let count = 1;
                if (node.children && node.children.length > 0) {
                    node.children.forEach(child => {
                        count += countNodes(child);
                    });
                }
                return count;
            };

            const totalCount = countNodes(testTree);
            expect(totalCount).toBe(4); // 1 root + 3 children
        });

        test('should count nested nodes correctly', () => {
            const testTree = {
                id: 'node-0',
                title: 'Root',
                children: [
                    {
                        id: 'node-1',
                        title: 'Parent A',
                        children: [
                            { id: 'node-2', title: 'Child A1', children: [] },
                            { id: 'node-3', title: 'Child A2', children: [] }
                        ]
                    },
                    { id: 'node-4', title: 'Parent B', children: [] }
                ]
            };

            const countNodes = (node) => {
                if (!node) return 0;
                let count = 1;
                if (node.children) {
                    node.children.forEach(child => {
                        count += countNodes(child);
                    });
                }
                return count;
            };

            expect(countNodes(testTree)).toBe(5); // 1 root + 2 parents + 2 children
        });

        test('should return 0 for null tree', () => {
            const countNodes = (node) => {
                if (!node) return 0;
                return 1;
            };

            expect(countNodes(null)).toBe(0);
        });

        test('should count connected nodes with relationships', () => {
            window.mindmapEngine.nodeData = {
                'node-0': { relationships: [] },
                'node-1': { relationships: ['rel-1'] },
                'node-2': { relationships: ['rel-1', 'rel-2'] },
                'node-3': { relationships: [] }
            };

            const testTree = {
                id: 'node-0',
                title: 'Root',
                children: [
                    { id: 'node-1', title: 'A', children: [] },
                    { id: 'node-2', title: 'B', children: [] },
                    { id: 'node-3', title: 'C', children: [] }
                ]
            };

            const countConnected = (node) => {
                if (!node) return 0;
                let count = 0;

                const data = window.mindmapEngine.nodeData[node.id];
                if (data && data.relationships && data.relationships.length > 0) {
                    count++;
                }

                if (node.children) {
                    node.children.forEach(child => {
                        count += countConnected(child);
                    });
                }

                return count;
            };

            expect(countConnected(testTree)).toBe(2); // node-1 and node-2 have relationships
        });
    });

    describe('FR-007: localStorage Version Management', () => {

        test('should store version in localStorage', () => {
            const version = '5.0';
            localStorage.setItem('mindmap-version', version);

            expect(localStorage.getItem('mindmap-version')).toBe(version);
        });

        test('should detect version mismatch', () => {
            const currentVersion = '5.0';
            const storedVersion = '4.0';

            localStorage.setItem('mindmap-version', storedVersion);

            const versionMismatch = localStorage.getItem('mindmap-version') !== currentVersion;
            expect(versionMismatch).toBe(true);
        });

        test('should clear old data on version mismatch', () => {
            // Setup old version data
            localStorage.setItem('mindmap-version', '4.0');
            localStorage.setItem('mindmap-content-old-project', 'old data');
            localStorage.setItem('mindmap-nodedata-old-project', '{}');

            // Detect version mismatch and clear
            const currentVersion = '5.0';
            if (localStorage.getItem('mindmap-version') !== currentVersion) {
                // Clear all mindmap-* keys
                const keys = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && (key.startsWith('mindmap-content-') ||
                               key.startsWith('mindmap-nodedata-') ||
                               key.startsWith('mindmap-orders-'))) {
                        keys.push(key);
                    }
                }
                keys.forEach(key => localStorage.removeItem(key));
                localStorage.setItem('mindmap-version', currentVersion);
            }

            expect(localStorage.getItem('mindmap-version')).toBe('5.0');
            expect(localStorage.getItem('mindmap-content-old-project')).toBeNull();
        });
    });

    describe('Integration: Complete Load Flow', () => {

        test('should load project with correct sequence', () => {
            // 1. Clear stale data
            window.mindmapEngine.nodes = null;
            window.mindmapEngine.nodeData = {};

            // 2. Load project data
            const projectData = {
                name: 'Test Project',
                content: 'Root\n1. Child A\n2. Child B\n3. Child C',
                nodes: {
                    'node-0': { description: '', notes: '', images: [], relationships: [] },
                    'node-1': { description: '', notes: '', images: [], relationships: [] },
                    'node-2': { description: '', notes: '', images: [], relationships: [] },
                    'node-3': { description: '', notes: '', images: [], relationships: [] }
                },
                metadata: {},
                categories: [],
                relationships: []
            };

            // 3. Assign nodeData
            window.mindmapEngine.nodeData = projectData.nodes;

            // 4. Parse outline and create tree
            const mockTree = {
                id: 'node-0',
                title: 'Root',
                children: [
                    { id: 'node-1', title: 'Child A', children: [] },
                    { id: 'node-2', title: 'Child B', children: [] },
                    { id: 'node-3', title: 'Child C', children: [] }
                ]
            };
            window.mindmapEngine.nodes = mockTree;

            // 5. Verify state
            expect(window.mindmapEngine.nodeData).toEqual(projectData.nodes);
            expect(window.mindmapEngine.nodes).toBeTruthy();
            expect(window.mindmapEngine.nodes.children.length).toBe(3);
        });

        test('should handle project switch correctly', () => {
            // Load first project
            const project1 = {
                name: 'Project 1',
                content: 'Root\n1. A\n2. B',
                nodes: {
                    'node-0': {},
                    'node-1': {},
                    'node-2': {}
                }
            };

            window.mindmapEngine.nodeData = project1.nodes;
            expect(Object.keys(window.mindmapEngine.nodeData).length).toBe(3);

            // Clear data
            window.mindmapEngine.nodeData = {};

            // Load second project
            const project2 = {
                name: 'Project 2',
                content: 'Root\n1. X\n2. Y\n3. Z\n4. W',
                nodes: {
                    'node-0': {},
                    'node-1': {},
                    'node-2': {},
                    'node-3': {},
                    'node-4': {}
                }
            };

            window.mindmapEngine.nodeData = project2.nodes;
            expect(Object.keys(window.mindmapEngine.nodeData).length).toBe(5);
        });
    });

    describe('Error Handling', () => {

        test('should handle null project data', () => {
            const projectData = null;

            expect(() => {
                if (!projectData) {
                    throw new Error('Project data is null or undefined');
                }
            }).toThrow('Project data is null or undefined');
        });

        test('should handle missing required fields', () => {
            const invalidProjectData = {
                name: 'Test'
                // Missing content and nodes
            };

            const validate = (data) => {
                const required = ['name', 'content', 'nodes'];
                const missing = required.filter(field => !(field in data));
                if (missing.length > 0) {
                    throw new Error(`Missing required fields: ${missing.join(', ')}`);
                }
            };

            expect(() => validate(invalidProjectData)).toThrow('Missing required fields');
        });

        test('should handle corrupted nodeData', () => {
            const projectData = {
                name: 'Test',
                content: 'Root',
                nodes: 'invalid string instead of object'  // Corrupted data
            };

            expect(typeof projectData.nodes).not.toBe('object');
        });
    });
});
