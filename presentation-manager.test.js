/**
 * Unit tests for PresentationManager
 */

const PresentationManager = require('./presentation-manager.js');

// Mock MindmapEngine
class MockMindmapEngine {
    constructor() {
        this.nodes = [
            { id: 'node-0', text: 'Root Node', level: 0, element: this.createMockElement(false) },
            { id: 'node-1', text: 'Child 1', level: 1, element: this.createMockElement(true) },
            { id: 'node-2', text: 'Child 2', level: 1, element: this.createMockElement(false) }
        ];
        this.zoom = 1.0;
        this.pan = { x: 0, y: 0 };
        this.focusedNodeId = null;
        this.categoriesVisible = true;
        this.relationshipsVisible = true;
    }

    createMockElement(expanded = false) {
        return {
            classList: {
                contains: (className) => className === 'expanded' && expanded
            }
        };
    }
}

// Mock DOM
global.document = {
    querySelectorAll: (selector) => {
        if (selector === '.info-panel.active') {
            return [
                { dataset: { nodeId: 'node-1' } }
            ];
        }
        return [];
    },
    querySelector: (selector) => {
        if (selector === '.image-overlay.active') {
            return {
                querySelector: () => ({
                    dataset: { nodeId: 'node-0' },
                    src: 'data:image/jpeg;base64,/9j/4AAQ...'
                })
            };
        }
        return null;
    }
};

describe('PresentationManager', () => {
    let presentationManager;
    let mockEngine;

    beforeEach(() => {
        mockEngine = new MockMindmapEngine();
        presentationManager = new PresentationManager(mockEngine);
    });

    describe('initialization', () => {
        test('should initialize with empty presentation', () => {
            expect(presentationManager.presentation.slides).toEqual([]);
            expect(presentationManager.presentation.created).toBeDefined();
            expect(presentationManager.presentation.modified).toBeDefined();
            expect(presentationManager.nextSlideId).toBe(1);
        });
    });

    describe('captureCurrentState()', () => {
        test('should capture expanded nodes', () => {
            const state = presentationManager.captureCurrentState();

            expect(state.expandedNodes).toEqual(['node-1']);
            expect(state.zoom).toBe(1.0);
            expect(state.pan).toEqual({ x: 0, y: 0 });
        });

        test('should capture open info panels', () => {
            const state = presentationManager.captureCurrentState();

            expect(state.openInfoPanels).toEqual(['node-1']);
        });

        test('should capture active image when present', () => {
            const state = presentationManager.captureCurrentState();

            expect(state.activeImage).toEqual({
                nodeId: 'node-0',
                imageUrl: 'data:image/jpeg;base64,/9j/4AAQ...'
            });
        });

        test('should capture focused node when in focus mode', () => {
            mockEngine.focusedNodeId = 'node-2';
            const state = presentationManager.captureCurrentState();

            expect(state.focusedNode).toBe('node-2');
        });

        test('should capture categories and relationships visibility', () => {
            const state = presentationManager.captureCurrentState();

            expect(state.categoriesVisible).toBe(true);
            expect(state.relationshipsVisible).toBe(true);
        });
    });

    describe('generateSlideDescription()', () => {
        test('should generate description for focus mode', () => {
            const state = {
                focusedNode: 'node-1',
                expandedNodes: [],
                openInfoPanels: [],
                activeImage: null
            };

            const description = presentationManager.generateSlideDescription(state);

            expect(description).toBe('Focus: Child 1');
        });

        test('should generate description for active image', () => {
            const state = {
                focusedNode: null,
                expandedNodes: [],
                openInfoPanels: [],
                activeImage: { nodeId: 'node-0', imageUrl: 'data:...' }
            };

            const description = presentationManager.generateSlideDescription(state);

            expect(description).toBe('Root Node (image)');
        });

        test('should generate description for expanded nodes', () => {
            const state = {
                focusedNode: null,
                expandedNodes: ['node-1'],
                openInfoPanels: [],
                activeImage: null
            };

            const description = presentationManager.generateSlideDescription(state);

            expect(description).toBe('Child 1 expanded');
        });

        test('should generate description for open info panels', () => {
            const state = {
                focusedNode: null,
                expandedNodes: [],
                openInfoPanels: ['node-2'],
                activeImage: null
            };

            const description = presentationManager.generateSlideDescription(state);

            expect(description).toBe('Child 2 details');
        });

        test('should default to root overview', () => {
            const state = {
                focusedNode: null,
                expandedNodes: [],
                openInfoPanels: [],
                activeImage: null
            };

            const description = presentationManager.generateSlideDescription(state);

            expect(description).toBe('Root Node overview');
        });
    });

    describe('addSlide()', () => {
        test('should add slide with auto-generated description', () => {
            // Mock no active image for simpler test
            global.document.querySelector = () => null;

            const slide = presentationManager.addSlide();

            expect(slide.id).toBe(1);
            expect(slide.description).toBeDefined();
            expect(slide.expandedNodes).toEqual(['node-1']);
            expect(presentationManager.presentation.slides).toHaveLength(1);
        });

        test('should add slide with custom description', () => {
            global.document.querySelector = () => null;

            const slide = presentationManager.addSlide('Custom Slide Title');

            expect(slide.description).toBe('Custom Slide Title');
        });

        test('should increment slide ID', () => {
            global.document.querySelector = () => null;

            const slide1 = presentationManager.addSlide();
            const slide2 = presentationManager.addSlide();

            expect(slide1.id).toBe(1);
            expect(slide2.id).toBe(2);
            expect(presentationManager.nextSlideId).toBe(3);
        });

        test('should update modified timestamp', () => {
            global.document.querySelector = () => null;

            const before = new Date().toISOString();
            presentationManager.addSlide();
            const after = new Date().toISOString();

            expect(presentationManager.presentation.modified >= before).toBe(true);
            expect(presentationManager.presentation.modified <= after).toBe(true);
        });
    });

    describe('deleteSlide()', () => {
        test('should delete slide by ID', () => {
            global.document.querySelector = () => null;

            presentationManager.addSlide();
            presentationManager.addSlide();

            const result = presentationManager.deleteSlide(1);

            expect(result).toBe(true);
            expect(presentationManager.presentation.slides).toHaveLength(1);
            expect(presentationManager.presentation.slides[0].id).toBe(2);
        });

        test('should return false for non-existent slide', () => {
            const result = presentationManager.deleteSlide(999);

            expect(result).toBe(false);
        });

        test('should update modified timestamp', () => {
            global.document.querySelector = () => null;

            presentationManager.addSlide();
            const before = new Date().toISOString();
            presentationManager.deleteSlide(1);
            const after = new Date().toISOString();

            expect(presentationManager.presentation.modified >= before).toBe(true);
            expect(presentationManager.presentation.modified <= after).toBe(true);
        });
    });

    describe('reorderSlides()', () => {
        test('should reorder slides correctly', () => {
            global.document.querySelector = () => null;

            presentationManager.addSlide('Slide 1');
            presentationManager.addSlide('Slide 2');
            presentationManager.addSlide('Slide 3');

            const result = presentationManager.reorderSlides([3, 1, 2]);

            expect(result).toBe(true);
            expect(presentationManager.presentation.slides[0].description).toBe('Slide 3');
            expect(presentationManager.presentation.slides[1].description).toBe('Slide 1');
            expect(presentationManager.presentation.slides[2].description).toBe('Slide 2');
        });

        test('should reject invalid order length', () => {
            global.document.querySelector = () => null;

            presentationManager.addSlide();
            presentationManager.addSlide();

            const result = presentationManager.reorderSlides([1]);

            expect(result).toBe(false);
        });

        test('should reject invalid slide IDs', () => {
            global.document.querySelector = () => null;

            presentationManager.addSlide();
            presentationManager.addSlide();

            const result = presentationManager.reorderSlides([1, 999]);

            expect(result).toBe(false);
        });
    });

    describe('getSlideCount()', () => {
        test('should return correct count', () => {
            global.document.querySelector = () => null;

            expect(presentationManager.getSlideCount()).toBe(0);

            presentationManager.addSlide();
            expect(presentationManager.getSlideCount()).toBe(1);

            presentationManager.addSlide();
            expect(presentationManager.getSlideCount()).toBe(2);
        });
    });

    describe('getSlide()', () => {
        test('should return slide by ID', () => {
            global.document.querySelector = () => null;

            presentationManager.addSlide('Test Slide');
            const slide = presentationManager.getSlide(1);

            expect(slide).toBeDefined();
            expect(slide.id).toBe(1);
            expect(slide.description).toBe('Test Slide');
        });

        test('should return null for non-existent ID', () => {
            const slide = presentationManager.getSlide(999);

            expect(slide).toBeNull();
        });
    });

    describe('getSlideByIndex()', () => {
        test('should return slide by index', () => {
            global.document.querySelector = () => null;

            presentationManager.addSlide('First');
            presentationManager.addSlide('Second');

            const slide = presentationManager.getSlideByIndex(1);

            expect(slide).toBeDefined();
            expect(slide.description).toBe('Second');
        });

        test('should return null for out-of-range index', () => {
            const slide = presentationManager.getSlideByIndex(999);

            expect(slide).toBeNull();
        });
    });

    describe('loadPresentation()', () => {
        test('should load presentation data', () => {
            const presentationData = {
                slides: [
                    {
                        id: 5,
                        description: 'Loaded Slide',
                        expandedNodes: ['node-0'],
                        openInfoPanels: [],
                        activeImage: null,
                        focusedNode: null,
                        zoom: 1.5,
                        pan: { x: 100, y: 50 },
                        categoriesVisible: false,
                        relationshipsVisible: true
                    }
                ],
                created: '2025-10-07T10:00:00.000Z',
                modified: '2025-10-07T12:00:00.000Z'
            };

            presentationManager.loadPresentation(presentationData);

            expect(presentationManager.presentation.slides).toHaveLength(1);
            expect(presentationManager.presentation.slides[0].description).toBe('Loaded Slide');
            expect(presentationManager.nextSlideId).toBe(6);
        });

        test('should handle null presentation data', () => {
            presentationManager.loadPresentation(null);

            expect(presentationManager.presentation.slides).toEqual([]);
            expect(presentationManager.nextSlideId).toBe(1);
        });

        test('should calculate next slide ID from max ID', () => {
            const presentationData = {
                slides: [
                    { id: 1, description: 'Slide 1' },
                    { id: 5, description: 'Slide 5' },
                    { id: 3, description: 'Slide 3' }
                ],
                created: new Date().toISOString(),
                modified: new Date().toISOString()
            };

            presentationManager.loadPresentation(presentationData);

            expect(presentationManager.nextSlideId).toBe(6);
        });
    });

    describe('exportPresentation()', () => {
        test('should export presentation data', () => {
            global.document.querySelector = () => null;

            presentationManager.addSlide('Test Export');

            const exported = presentationManager.exportPresentation();

            expect(exported.slides).toHaveLength(1);
            expect(exported.created).toBeDefined();
            expect(exported.modified).toBeDefined();
        });
    });
});
