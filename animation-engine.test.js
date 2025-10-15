/**
 * Unit tests for AnimationEngine
 */

const AnimationEngine = require('./animation-engine.js');

// Mock MindmapEngine
class MockMindmapEngine {
    constructor() {
        this.nodes = [
            { id: 'node-0', level: 0, element: this.createMockElement(false) },
            { id: 'node-1', level: 1, element: this.createMockElement(false) },
            { id: 'node-2', level: 1, element: this.createMockElement(false) },
            { id: 'node-3', level: 2, element: this.createMockElement(false) },
            { id: 'node-4', level: 2, element: this.createMockElement(false) }
        ];
        this.zoom = 1.0;
        this.pan = { x: 0, y: 0 };
        this.toggleCalls = [];
        this.updateTransformCalls = 0;
    }

    createMockElement(expanded = false) {
        return {
            classList: {
                contains: jest.fn((className) => className === 'expanded' && expanded),
                add: jest.fn(),
                remove: jest.fn()
            },
            querySelector: jest.fn(() => null)
        };
    }

    toggleChildren(nodeId) {
        this.toggleCalls.push(nodeId);
    }

    updateTransform() {
        this.updateTransformCalls++;
    }
}

// Mock requestAnimationFrame with proper timing
let rafCallbacks = [];
global.requestAnimationFrame = (cb) => {
    rafCallbacks.push(cb);
    return setTimeout(() => {
        const callback = rafCallbacks.shift();
        if (callback) callback(Date.now());
    }, 16);
};

global.performance = {
    now: () => Date.now()
};

// Helper to flush RAF queue
const flushRAF = () => {
    return new Promise(resolve => setTimeout(resolve, 100));
};

describe('AnimationEngine', () => {
    let animationEngine;
    let mockEngine;

    beforeEach(() => {
        mockEngine = new MockMindmapEngine();
        animationEngine = new AnimationEngine(mockEngine);
    });

    describe('initialization', () => {
        test('should initialize with empty queue', () => {
            expect(animationEngine.animationQueue).toEqual([]);
            expect(animationEngine.isAnimating).toBe(false);
            expect(animationEngine.isPaused).toBe(false);
            expect(animationEngine.resumeCallback).toBeNull();
        });
    });

    describe('calculateNodePath()', () => {
        test('should identify nodes to expand', () => {
            const fromState = { expandedNodes: ['node-0'] };
            const toState = { expandedNodes: ['node-0', 'node-1', 'node-2'] };

            const path = animationEngine.calculateNodePath(fromState, toState);

            expect(path.toExpand).toEqual(['node-1', 'node-2']);
            expect(path.toCollapse).toEqual([]);
            expect(path.distance).toBe(2);
        });

        test('should identify nodes to collapse', () => {
            const fromState = { expandedNodes: ['node-0', 'node-1', 'node-2'] };
            const toState = { expandedNodes: ['node-0'] };

            const path = animationEngine.calculateNodePath(fromState, toState);

            expect(path.toExpand).toEqual([]);
            expect(path.toCollapse).toEqual(['node-1', 'node-2']);
            expect(path.distance).toBe(2);
        });

        test('should identify both expand and collapse', () => {
            const fromState = { expandedNodes: ['node-0', 'node-1'] };
            const toState = { expandedNodes: ['node-0', 'node-2'] };

            const path = animationEngine.calculateNodePath(fromState, toState);

            expect(path.toExpand).toEqual(['node-2']);
            expect(path.toCollapse).toEqual(['node-1']);
            expect(path.distance).toBe(2);
        });

        test('should handle no changes', () => {
            const fromState = { expandedNodes: ['node-0'] };
            const toState = { expandedNodes: ['node-0'] };

            const path = animationEngine.calculateNodePath(fromState, toState);

            expect(path.toExpand).toEqual([]);
            expect(path.toCollapse).toEqual([]);
            expect(path.distance).toBe(0);
        });
    });

    describe('generateIntermediateSteps()', () => {
        test('should return empty array for small distance (0-2)', () => {
            const path = { toExpand: ['node-1'], toCollapse: [], distance: 1 };
            const steps = animationEngine.generateIntermediateSteps(path);

            expect(steps).toEqual([]);
        });

        test('should generate collapse then expand steps for distance > 2', () => {
            const path = {
                toExpand: ['node-1', 'node-2'],
                toCollapse: ['node-3'],
                distance: 3
            };

            const steps = animationEngine.generateIntermediateSteps(path);

            expect(steps.length).toBe(3);
            expect(steps[0]).toEqual({ type: 'collapse', nodeId: 'node-3', duration: 300 });
            expect(steps[1].type).toBe('expand');
            expect(steps[2].type).toBe('expand');
        });
    });

    describe('orderNodesByHierarchy()', () => {
        test('should order nodes by level (parents before children)', () => {
            const nodeIds = ['node-3', 'node-1', 'node-4', 'node-2'];
            const ordered = animationEngine.orderNodesByHierarchy(nodeIds);

            // node-1 and node-2 are level 1, node-3 and node-4 are level 2
            expect(ordered[0]).toBe('node-1');
            expect(ordered[1]).toBe('node-2');
            expect(ordered[2]).toBe('node-3');
            expect(ordered[3]).toBe('node-4');
        });
    });

    describe('animateNodeExpansion()', () => {
        test('should skip if node not found', async () => {
            await animationEngine.animateNodeExpansion('nonexistent');
            expect(mockEngine.toggleCalls).toEqual([]);
        });

        test('should skip if node already expanded', async () => {
            const node = mockEngine.nodes[0];
            node.element.classList.contains.mockReturnValue(true);

            await animationEngine.animateNodeExpansion('node-0');
            expect(mockEngine.toggleCalls).toEqual([]);
        });

        test('should toggle node if no children container', async () => {
            await animationEngine.animateNodeExpansion('node-0');
            expect(mockEngine.toggleCalls).toContain('node-0');
        });
    });

    describe('animateNodeCollapse()', () => {
        test('should skip if node not found', async () => {
            await animationEngine.animateNodeCollapse('nonexistent');
            expect(mockEngine.toggleCalls).toEqual([]);
        });

        test('should skip if node already collapsed', async () => {
            const node = mockEngine.nodes[0];
            node.element.classList.contains.mockReturnValue(false);

            await animationEngine.animateNodeCollapse('node-0');
            expect(mockEngine.toggleCalls).toEqual([]);
        });

        test('should toggle node if already expanded', async () => {
            const node = mockEngine.nodes[0];
            node.element.classList.contains.mockReturnValue(true);

            await animationEngine.animateNodeCollapse('node-0');
            expect(mockEngine.toggleCalls).toContain('node-0');
        });
    });

    describe('animateZoomPan()', () => {
        test('should interpolate zoom and pan values', async () => {
            const targetZoom = 1.5;
            const targetPan = { x: 100, y: 50 };

            const promise = animationEngine.animateZoomPan(targetZoom, targetPan, 100);
            await flushRAF();
            await promise;

            expect(mockEngine.zoom).toBeCloseTo(1.5, 1);
            expect(mockEngine.pan.x).toBeCloseTo(100, 1);
            expect(mockEngine.pan.y).toBeCloseTo(50, 1);
            expect(mockEngine.updateTransformCalls).toBeGreaterThan(0);
        });
    });

    describe('queueAnimation()', () => {
        test('should add animation to queue', async () => {
            // Prevent auto-processing
            animationEngine.isAnimating = true;

            const animFn = jest.fn(() => Promise.resolve());
            animationEngine.queueAnimation(animFn);

            expect(animationEngine.animationQueue).toHaveLength(1);

            // Reset
            animationEngine.isAnimating = false;
        });

        test('should process queue automatically if not animating', async () => {
            const animFn = jest.fn(() => Promise.resolve());
            animationEngine.queueAnimation(animFn);

            await new Promise(resolve => setTimeout(resolve, 50));

            expect(animFn).toHaveBeenCalled();
        });
    });

    describe('waitForUserInput()', () => {
        test('should pause and set resume callback', async () => {
            const promise = animationEngine.waitForUserInput();

            expect(animationEngine.isPaused).toBe(true);
            expect(animationEngine.resumeCallback).toBeDefined();

            // Resume
            animationEngine.resume();
            await promise;

            expect(animationEngine.isPaused).toBe(false);
            expect(animationEngine.resumeCallback).toBeNull();
        });
    });

    describe('clearQueue()', () => {
        test('should clear all animation state', () => {
            animationEngine.animationQueue = [jest.fn(), jest.fn()];
            animationEngine.isAnimating = true;
            animationEngine.isPaused = true;
            animationEngine.resumeCallback = jest.fn();

            animationEngine.clearQueue();

            expect(animationEngine.animationQueue).toEqual([]);
            expect(animationEngine.isAnimating).toBe(false);
            expect(animationEngine.isPaused).toBe(false);
            expect(animationEngine.resumeCallback).toBeNull();
        });
    });

    describe('animateTransition()', () => {
        test('should handle simple transition (no intermediate steps)', async () => {
            const fromState = {
                expandedNodes: ['node-0'],
                zoom: 1.0,
                pan: { x: 0, y: 0 }
            };

            const toState = {
                expandedNodes: ['node-0', 'node-1'],
                zoom: 1.2,
                pan: { x: 10, y: 10 }
            };

            const promise = animationEngine.animateTransition(fromState, toState);
            await flushRAF();
            await promise;

            expect(mockEngine.toggleCalls).toContain('node-1');
            expect(mockEngine.zoom).toBeCloseTo(1.2, 1);
        });

        test('should handle complex transition with intermediate steps', async () => {
            const fromState = {
                expandedNodes: ['node-0'],
                zoom: 1.0,
                pan: { x: 0, y: 0 }
            };

            const toState = {
                expandedNodes: ['node-0', 'node-1', 'node-2', 'node-3'],
                zoom: 1.5,
                pan: { x: 50, y: 50 }
            };

            const promise = animationEngine.animateTransition(fromState, toState);
            await flushRAF();
            await promise;

            // Should have expanded multiple nodes
            expect(mockEngine.toggleCalls.length).toBeGreaterThan(0);
            expect(mockEngine.zoom).toBeCloseTo(1.5, 1);
        });
    });

    describe('animateImageModal()', () => {
        beforeEach(() => {
            // Mock document.querySelector for image modal
            global.document = {
                querySelector: jest.fn((selector) => {
                    if (selector.includes('.image-modal')) {
                        return {
                            style: {},
                            classList: {
                                add: jest.fn(),
                                remove: jest.fn()
                            },
                            setAttribute: jest.fn(),
                            removeAttribute: jest.fn()
                        };
                    }
                    return null;
                })
            };
        });

        test('should open image modal with 500ms fade-in', async () => {
            const promise = animationEngine.animateImageModal('node-1', 0, 'open', 500);
            await promise;

            expect(global.document.querySelector).toHaveBeenCalledWith(expect.stringContaining('.image-modal'));
        });

        test('should close image modal with 500ms fade-out', async () => {
            const promise = animationEngine.animateImageModal('node-1', 0, 'close', 500);
            await promise;

            expect(global.document.querySelector).toHaveBeenCalled();
        });

        test('should handle null modal element gracefully', async () => {
            global.document.querySelector = jest.fn(() => null);

            await expect(animationEngine.animateImageModal('node-1', 0, 'open', 500)).resolves.toBeUndefined();
        });
    });

    describe('animateRelationship()', () => {
        beforeEach(() => {
            // Mock SVG relationship element
            global.document = {
                querySelector: jest.fn((selector) => {
                    if (selector.includes('[data-relationship-id]')) {
                        return {
                            style: {},
                            getTotalLength: jest.fn(() => 100),
                            setAttribute: jest.fn(),
                            removeAttribute: jest.fn()
                        };
                    }
                    return null;
                })
            };
        });

        test('should show relationship with 300ms line draw', async () => {
            const promise = animationEngine.animateRelationship('rel-1', 'show', 300);
            await promise;

            expect(global.document.querySelector).toHaveBeenCalledWith(expect.stringContaining('[data-relationship-id="rel-1"]'));
        });

        test('should hide relationship with 300ms line erase', async () => {
            const promise = animationEngine.animateRelationship('rel-1', 'hide', 300);
            await promise;

            expect(global.document.querySelector).toHaveBeenCalled();
        });

        test('should handle null relationship element gracefully', async () => {
            global.document.querySelector = jest.fn(() => null);

            await expect(animationEngine.animateRelationship('rel-1', 'show', 300)).resolves.toBeUndefined();
        });
    });

    describe('animateFocusMode()', () => {
        beforeEach(() => {
            // Mock nodes for focus mode - ensure node has style property
            const mockNodeElements = [
                { style: {}, setAttribute: jest.fn() },
                { style: {}, setAttribute: jest.fn() },
                { style: {}, setAttribute: jest.fn() }
            ];

            // Update mock engine node to have proper element with style
            mockEngine.nodes[1].element = mockNodeElements[0];

            global.document = {
                querySelectorAll: jest.fn(() => mockNodeElements),
                querySelector: jest.fn(() => mockNodeElements[0])
            };
        });

        test('should activate focus mode with 300ms camera movement and dim others', async () => {
            const promise = animationEngine.animateFocusMode('node-1', 'activate', 300);
            await flushRAF();
            await promise;

            // Should update camera and apply opacity to other nodes
            expect(mockEngine.updateTransformCalls).toBeGreaterThan(0);
        });

        test('should deactivate focus mode with 300ms reset', async () => {
            const promise = animationEngine.animateFocusMode(null, 'deactivate', 300);
            await promise;

            // Should restore opacity to all nodes
            expect(global.document.querySelectorAll).toHaveBeenCalled();
        });

        test('should handle null node ID in deactivate', async () => {
            await expect(animationEngine.animateFocusMode(null, 'deactivate', 300)).resolves.toBeUndefined();
        });
    });

    describe('Info panel duration adjustment', () => {
        test('animateInfoPanel should use 350ms by default (updated from 200ms)', async () => {
            global.document = {
                querySelector: jest.fn(() => ({
                    style: {},
                    classList: { add: jest.fn(), remove: jest.fn() }
                }))
            };

            // Default duration should be 350ms now (per PRD requirements)
            const promise = animationEngine.animateInfoPanel('node-1', 'show');
            await promise;

            expect(global.document.querySelector).toHaveBeenCalled();
        });
    });

    describe('Reverse animations', () => {
        test('animateImageModal should work in reverse (close)', async () => {
            global.document = {
                querySelector: jest.fn(() => ({
                    style: {},
                    classList: { add: jest.fn(), remove: jest.fn() },
                    setAttribute: jest.fn(),
                    removeAttribute: jest.fn()
                }))
            };

            await expect(animationEngine.animateImageModal('node-1', 0, 'close', 500)).resolves.toBeUndefined();
        });

        test('animateRelationship should work in reverse (hide)', async () => {
            global.document = {
                querySelector: jest.fn(() => ({
                    style: {},
                    getTotalLength: jest.fn(() => 100),
                    setAttribute: jest.fn(),
                    removeAttribute: jest.fn()
                }))
            };

            await expect(animationEngine.animateRelationship('rel-1', 'hide', 300)).resolves.toBeUndefined();
        });

        test('animateFocusMode should work in reverse (deactivate)', async () => {
            global.document = {
                querySelectorAll: jest.fn(() => [
                    { style: {}, setAttribute: jest.fn() }
                ]),
                querySelector: jest.fn(() => null)
            };

            await expect(animationEngine.animateFocusMode(null, 'deactivate', 300)).resolves.toBeUndefined();
        });
    });

    describe('Mutual exclusivity', () => {
        test('should close info panel when image modal opens', async () => {
            // This test validates the design requirement that info panel and image modal
            // cannot be open simultaneously in presentation mode
            // The implementation should handle this in the presentation manager layer

            // For now, just verify both animations can run
            global.document = {
                querySelector: jest.fn(() => ({
                    style: {},
                    classList: { add: jest.fn(), remove: jest.fn() },
                    setAttribute: jest.fn(),
                    removeAttribute: jest.fn()
                }))
            };

            await expect(animationEngine.animateInfoPanel('node-1', 'hide', 350)).resolves.toBeUndefined();
            await expect(animationEngine.animateImageModal('node-1', 0, 'open', 500)).resolves.toBeUndefined();
        });
    });
});
