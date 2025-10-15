/**
 * Unit tests for PresentationManager
 * Task 5.2 - Write tests for createPresentation(name) creating new empty presentation
 */

const PresentationManager = require('./presentation-manager');
const StateEngine = require('./state-engine');
const AnimationEngine = require('./animation-engine');

describe('PresentationManager', () => {
  let presentationManager;
  let stateEngine;
  let animationEngine;
  let mockMindmap;

  beforeEach(() => {
    // Create mock mindmap engine
    mockMindmap = {
      camera: { x: 0, y: 0, zoom: 1 },
      expandedNodes: new Set(),
      focusedNode: null,
      infoPanel: { open: false, nodeId: null },
      imageModal: { open: false, nodeId: null, imageIndex: null },
      visibleRelationships: new Set(),
      focusMode: false,
      updateTransform: jest.fn(),
      render: jest.fn()
    };

    // Create dependencies
    stateEngine = new StateEngine();
    animationEngine = new AnimationEngine(mockMindmap);

    // Create presentation manager
    presentationManager = new PresentationManager(stateEngine, animationEngine);
  });

  describe('createPresentation()', () => {
    test('should create a new empty presentation with valid name', () => {
      const presentation = presentationManager.createPresentation('My Presentation');

      expect(presentation).toBeDefined();
      expect(presentation.name).toBe('My Presentation');
      expect(presentation.id).toBeDefined();
      expect(typeof presentation.id).toBe('string');
      expect(presentation.slides).toEqual([]);
      expect(presentation.currentSlideIndex).toBe(0);
    });

    test('should generate unique presentation ID', () => {
      const presentation1 = presentationManager.createPresentation('Presentation 1');
      const presentation2 = presentationManager.createPresentation('Presentation 2');

      expect(presentation1.id).not.toBe(presentation2.id);
    });

    test('should include created and modified timestamps', () => {
      const beforeTime = Date.now();
      const presentation = presentationManager.createPresentation('Test');
      const afterTime = Date.now();

      expect(presentation.created).toBeDefined();
      expect(presentation.created).toBeInstanceOf(Date);
      expect(presentation.created.getTime()).toBeGreaterThanOrEqual(beforeTime);
      expect(presentation.created.getTime()).toBeLessThanOrEqual(afterTime);

      expect(presentation.modified).toBeDefined();
      expect(presentation.modified).toBeInstanceOf(Date);
    });

    test('should set presentation as current presentation', () => {
      const presentation = presentationManager.createPresentation('Current');

      expect(presentationManager.getCurrentPresentation()).toBe(presentation);
    });

    test('should reset current slide index to 0', () => {
      presentationManager.createPresentation('Test');

      expect(presentationManager.getCurrentSlideIndex()).toBe(0);
    });

    test('should throw error if name is empty string', () => {
      expect(() => {
        presentationManager.createPresentation('');
      }).toThrow('Presentation name is required');
    });

    test('should throw error if name is null', () => {
      expect(() => {
        presentationManager.createPresentation(null);
      }).toThrow('Presentation name is required');
    });

    test('should throw error if name is undefined', () => {
      expect(() => {
        presentationManager.createPresentation(undefined);
      }).toThrow('Presentation name is required');
    });

    test('should throw error if name is not a string', () => {
      expect(() => {
        presentationManager.createPresentation(123);
      }).toThrow('Presentation name is required');
    });

    test('should trim whitespace from presentation name', () => {
      const presentation = presentationManager.createPresentation('  Spaced Name  ');

      expect(presentation.name).toBe('Spaced Name');
    });

    test('should throw error if name is only whitespace', () => {
      expect(() => {
        presentationManager.createPresentation('   ');
      }).toThrow('Presentation name is required');
    });
  });

  describe('getCurrentPresentation()', () => {
    test('should return null when no presentation is loaded', () => {
      expect(presentationManager.getCurrentPresentation()).toBeNull();
    });

    test('should return current presentation after creation', () => {
      const presentation = presentationManager.createPresentation('Test');

      expect(presentationManager.getCurrentPresentation()).toBe(presentation);
    });
  });

  describe('getCurrentSlideIndex()', () => {
    test('should return 0 initially', () => {
      expect(presentationManager.getCurrentSlideIndex()).toBe(0);
    });

    test('should return 0 after creating new presentation', () => {
      presentationManager.createPresentation('Test');

      expect(presentationManager.getCurrentSlideIndex()).toBe(0);
    });
  });

  describe('getSlideCount()', () => {
    test('should return 0 when no presentation is loaded', () => {
      expect(presentationManager.getSlideCount()).toBe(0);
    });

    test('should return 0 for newly created empty presentation', () => {
      presentationManager.createPresentation('Empty');

      expect(presentationManager.getSlideCount()).toBe(0);
    });
  });

  describe('hasNextSlide()', () => {
    test('should return false when no presentation is loaded', () => {
      expect(presentationManager.hasNextSlide()).toBe(false);
    });

    test('should return false for empty presentation', () => {
      presentationManager.createPresentation('Empty');

      expect(presentationManager.hasNextSlide()).toBe(false);
    });
  });

  describe('hasPreviousSlide()', () => {
    test('should return false when no presentation is loaded', () => {
      expect(presentationManager.hasPreviousSlide()).toBe(false);
    });

    test('should return false for empty presentation', () => {
      presentationManager.createPresentation('Empty');

      expect(presentationManager.hasPreviousSlide()).toBe(false);
    });

    test('should return false when at first slide', () => {
      presentationManager.createPresentation('Test');
      // currentSlideIndex is 0

      expect(presentationManager.hasPreviousSlide()).toBe(false);
    });
  });

  describe('addSlide()', () => {
    beforeEach(() => {
      presentationManager.createPresentation('Test Presentation');
    });

    test('should add slide to empty presentation', () => {
      const slideData = {
        id: 'slide-1',
        actionType: 'node-expand',
        actionData: { nodeId: 'node-1' },
        timestamp: new Date(),
        state: {
          camera: { x: 0, y: 0, zoom: 1 },
          expandedNodes: ['node-1'],
          focusedNode: null,
          infoPanel: { open: false, nodeId: null },
          imageModal: { open: false, nodeId: null, imageIndex: null },
          visibleRelationships: [],
          focusMode: false
        }
      };

      const result = presentationManager.addSlide(slideData);

      expect(result).toBe(slideData);
      expect(presentationManager.getSlideCount()).toBe(1);
      expect(presentationManager.getCurrentPresentation().slides).toContain(slideData);
    });

    test('should append slide to presentation with existing slides', () => {
      const slide1 = {
        id: 'slide-1',
        actionType: 'node-expand',
        actionData: { nodeId: 'node-1' },
        timestamp: new Date(),
        state: {}
      };
      const slide2 = {
        id: 'slide-2',
        actionType: 'info-open',
        actionData: { nodeId: 'node-1' },
        timestamp: new Date(),
        state: {}
      };

      presentationManager.addSlide(slide1);
      presentationManager.addSlide(slide2);

      expect(presentationManager.getSlideCount()).toBe(2);
      const slides = presentationManager.getCurrentPresentation().slides;
      expect(slides[0]).toBe(slide1);
      expect(slides[1]).toBe(slide2);
    });

    test('should update presentation modified timestamp', () => {
      const beforeTime = Date.now();

      const slideData = {
        id: 'slide-1',
        actionType: 'node-expand',
        actionData: { nodeId: 'node-1' },
        timestamp: new Date(),
        state: {}
      };

      presentationManager.addSlide(slideData);
      const afterTime = Date.now();

      const modified = presentationManager.getCurrentPresentation().modified;
      expect(modified.getTime()).toBeGreaterThanOrEqual(beforeTime);
      expect(modified.getTime()).toBeLessThanOrEqual(afterTime);
    });

    test('should throw error if no presentation is loaded', () => {
      const pm = new PresentationManager(stateEngine, animationEngine);

      expect(() => {
        pm.addSlide({ id: 'slide-1', actionType: 'node-expand', state: {} });
      }).toThrow('No presentation loaded');
    });

    test('should throw error if slideData is null', () => {
      expect(() => {
        presentationManager.addSlide(null);
      }).toThrow('Invalid slide data');
    });

    test('should throw error if slideData is undefined', () => {
      expect(() => {
        presentationManager.addSlide(undefined);
      }).toThrow('Invalid slide data');
    });

    test('should throw error if slideData is missing id', () => {
      expect(() => {
        presentationManager.addSlide({ actionType: 'node-expand', state: {} });
      }).toThrow('Invalid slide data');
    });

    test('should throw error if slideData is missing actionType', () => {
      expect(() => {
        presentationManager.addSlide({ id: 'slide-1', state: {} });
      }).toThrow('Invalid slide data');
    });

    test('should throw error if slideData is missing state', () => {
      expect(() => {
        presentationManager.addSlide({ id: 'slide-1', actionType: 'node-expand' });
      }).toThrow('Invalid slide data');
    });

    test('should update hasNextSlide after adding slides', () => {
      // Initially at slide 0 with no slides
      expect(presentationManager.hasNextSlide()).toBe(false);

      presentationManager.addSlide({ id: 'slide-1', actionType: 'node-expand', state: {} });

      // Now at slide 0 with 1 slide (still no next)
      expect(presentationManager.hasNextSlide()).toBe(false);

      presentationManager.addSlide({ id: 'slide-2', actionType: 'info-open', state: {} });

      // Now at slide 0 with 2 slides (has next)
      expect(presentationManager.hasNextSlide()).toBe(true);
    });
  });

  describe('deleteSlide()', () => {
    beforeEach(() => {
      presentationManager.createPresentation('Test Presentation');
      presentationManager.addSlide({ id: 'slide-1', actionType: 'node-expand', state: {} });
      presentationManager.addSlide({ id: 'slide-2', actionType: 'info-open', state: {} });
      presentationManager.addSlide({ id: 'slide-3', actionType: 'image-open', state: {} });
    });

    test('should delete slide by ID', () => {
      const result = presentationManager.deleteSlide('slide-2');

      expect(result).toBe(true);
      expect(presentationManager.getSlideCount()).toBe(2);
      const slides = presentationManager.getCurrentPresentation().slides;
      expect(slides.find(s => s.id === 'slide-2')).toBeUndefined();
    });

    test('should update presentation modified timestamp', () => {
      const beforeTime = Date.now();
      presentationManager.deleteSlide('slide-1');
      const afterTime = Date.now();

      const modified = presentationManager.getCurrentPresentation().modified;
      expect(modified.getTime()).toBeGreaterThanOrEqual(beforeTime);
      expect(modified.getTime()).toBeLessThanOrEqual(afterTime);
    });

    test('should adjust currentSlideIndex if deleting current or earlier slide', () => {
      // Set current slide to index 2
      presentationManager.currentSlideIndex = 2;

      // Delete slide at index 1 (should shift current index down)
      presentationManager.deleteSlide('slide-2');

      expect(presentationManager.getCurrentSlideIndex()).toBe(1);
    });

    test('should not change currentSlideIndex if deleting later slide', () => {
      // Set current slide to index 0
      presentationManager.currentSlideIndex = 0;

      // Delete slide at index 2 (should not affect current index)
      presentationManager.deleteSlide('slide-3');

      expect(presentationManager.getCurrentSlideIndex()).toBe(0);
    });

    test('should throw error if no presentation is loaded', () => {
      const pm = new PresentationManager(stateEngine, animationEngine);

      expect(() => {
        pm.deleteSlide('slide-1');
      }).toThrow('No presentation loaded');
    });

    test('should throw error if slideId is null', () => {
      expect(() => {
        presentationManager.deleteSlide(null);
      }).toThrow('Invalid slide ID');
    });

    test('should throw error if slideId is undefined', () => {
      expect(() => {
        presentationManager.deleteSlide(undefined);
      }).toThrow('Invalid slide ID');
    });

    test('should throw error if slide not found', () => {
      expect(() => {
        presentationManager.deleteSlide('nonexistent-slide');
      }).toThrow('Slide not found');
    });

    test('should handle deleting the only slide', () => {
      presentationManager.createPresentation('Single Slide');
      presentationManager.addSlide({ id: 'only-slide', actionType: 'node-expand', state: {} });

      presentationManager.deleteSlide('only-slide');

      expect(presentationManager.getSlideCount()).toBe(0);
      expect(presentationManager.getCurrentSlideIndex()).toBe(0);
    });
  });

  describe('reorderSlides()', () => {
    beforeEach(() => {
      presentationManager.createPresentation('Test Presentation');
      presentationManager.addSlide({ id: 'slide-1', actionType: 'node-expand', state: {} });
      presentationManager.addSlide({ id: 'slide-2', actionType: 'info-open', state: {} });
      presentationManager.addSlide({ id: 'slide-3', actionType: 'image-open', state: {} });
      presentationManager.addSlide({ id: 'slide-4', actionType: 'relationship-show', state: {} });
    });

    test('should move slide forward in array', () => {
      // Move slide from index 1 to index 3
      presentationManager.reorderSlides(1, 3);

      const slides = presentationManager.getCurrentPresentation().slides;
      expect(slides[0].id).toBe('slide-1');
      expect(slides[1].id).toBe('slide-3');
      expect(slides[2].id).toBe('slide-4');
      expect(slides[3].id).toBe('slide-2');
    });

    test('should move slide backward in array', () => {
      // Move slide from index 3 to index 1
      presentationManager.reorderSlides(3, 1);

      const slides = presentationManager.getCurrentPresentation().slides;
      expect(slides[0].id).toBe('slide-1');
      expect(slides[1].id).toBe('slide-4');
      expect(slides[2].id).toBe('slide-2');
      expect(slides[3].id).toBe('slide-3');
    });

    test('should handle moving to same position', () => {
      presentationManager.reorderSlides(1, 1);

      const slides = presentationManager.getCurrentPresentation().slides;
      expect(slides[0].id).toBe('slide-1');
      expect(slides[1].id).toBe('slide-2');
      expect(slides[2].id).toBe('slide-3');
      expect(slides[3].id).toBe('slide-4');
    });

    test('should update presentation modified timestamp', () => {
      const beforeTime = Date.now();
      presentationManager.reorderSlides(1, 2);
      const afterTime = Date.now();

      const modified = presentationManager.getCurrentPresentation().modified;
      expect(modified.getTime()).toBeGreaterThanOrEqual(beforeTime);
      expect(modified.getTime()).toBeLessThanOrEqual(afterTime);
    });

    test('should throw error if no presentation is loaded', () => {
      const pm = new PresentationManager(stateEngine, animationEngine);

      expect(() => {
        pm.reorderSlides(0, 1);
      }).toThrow('No presentation loaded');
    });

    test('should throw error if fromIndex is out of bounds', () => {
      expect(() => {
        presentationManager.reorderSlides(10, 1);
      }).toThrow('Invalid slide index');
    });

    test('should throw error if toIndex is out of bounds', () => {
      expect(() => {
        presentationManager.reorderSlides(1, 10);
      }).toThrow('Invalid slide index');
    });

    test('should throw error if fromIndex is negative', () => {
      expect(() => {
        presentationManager.reorderSlides(-1, 1);
      }).toThrow('Invalid slide index');
    });

    test('should throw error if toIndex is negative', () => {
      expect(() => {
        presentationManager.reorderSlides(1, -1);
      }).toThrow('Invalid slide index');
    });

    test('should adjust currentSlideIndex when moving current slide', () => {
      presentationManager.currentSlideIndex = 1;

      // Move current slide from index 1 to index 2
      presentationManager.reorderSlides(1, 2);

      expect(presentationManager.getCurrentSlideIndex()).toBe(2);
    });

    test('should adjust currentSlideIndex when moving slide before current', () => {
      presentationManager.currentSlideIndex = 2;

      // Move slide from index 0 to index 3 (shifts current left)
      presentationManager.reorderSlides(0, 3);

      expect(presentationManager.getCurrentSlideIndex()).toBe(1);
    });

    test('should adjust currentSlideIndex when moving slide after current', () => {
      presentationManager.currentSlideIndex = 1;

      // Move slide from index 3 to index 0 (shifts current right)
      presentationManager.reorderSlides(3, 0);

      expect(presentationManager.getCurrentSlideIndex()).toBe(2);
    });
  });

  describe('nextSlide()', () => {
    beforeEach(() => {
      presentationManager.createPresentation('Test Presentation');
      presentationManager.addSlide({
        id: 'slide-1',
        actionType: 'node-expand',
        actionData: { nodeId: 'node-1' },
        state: { camera: { x: 0, y: 0, zoom: 1 }, expandedNodes: ['node-1'] }
      });
      presentationManager.addSlide({
        id: 'slide-2',
        actionType: 'info-open',
        actionData: { nodeId: 'node-1' },
        state: { camera: { x: 0, y: 0, zoom: 1 }, infoPanel: { open: true, nodeId: 'node-1' } }
      });
      presentationManager.addSlide({
        id: 'slide-3',
        actionType: 'image-open',
        actionData: { nodeId: 'node-1', imageIndex: 0 },
        state: { camera: { x: 0, y: 0, zoom: 1 }, imageModal: { open: true, nodeId: 'node-1', imageIndex: 0 } }
      });
    });

    test('should navigate to next slide and update index', async () => {
      expect(presentationManager.getCurrentSlideIndex()).toBe(0);

      const result = await presentationManager.nextSlide(mockMindmap);

      expect(result).toBe(true);
      expect(presentationManager.getCurrentSlideIndex()).toBe(1);
    });

    test('should return false when at last slide', async () => {
      presentationManager.currentSlideIndex = 2; // Last slide

      const result = await presentationManager.nextSlide(mockMindmap);

      expect(result).toBe(false);
      expect(presentationManager.getCurrentSlideIndex()).toBe(2); // Unchanged
    });

    test('should throw error if no presentation is loaded', async () => {
      const pm = new PresentationManager(stateEngine, animationEngine);

      await expect(pm.nextSlide(mockMindmap)).rejects.toThrow('No presentation loaded');
    });

    test('should throw error if mindmapEngine is not provided', async () => {
      await expect(presentationManager.nextSlide(null)).rejects.toThrow('MindmapEngine is required');
    });
  });

  describe('previousSlide()', () => {
    beforeEach(() => {
      presentationManager.createPresentation('Test Presentation');
      presentationManager.addSlide({
        id: 'slide-1',
        actionType: 'node-expand',
        actionData: { nodeId: 'node-1' },
        state: { camera: { x: 0, y: 0, zoom: 1 } }
      });
      presentationManager.addSlide({
        id: 'slide-2',
        actionType: 'info-open',
        actionData: { nodeId: 'node-1' },
        state: { camera: { x: 0, y: 0, zoom: 1 } }
      });
      presentationManager.addSlide({
        id: 'slide-3',
        actionType: 'image-open',
        actionData: { nodeId: 'node-1', imageIndex: 0 },
        state: { camera: { x: 0, y: 0, zoom: 1 } }
      });
      presentationManager.currentSlideIndex = 2; // Start at slide 3
    });

    test('should navigate to previous slide and update index', async () => {
      expect(presentationManager.getCurrentSlideIndex()).toBe(2);

      const result = await presentationManager.previousSlide(mockMindmap);

      expect(result).toBe(true);
      expect(presentationManager.getCurrentSlideIndex()).toBe(1);
    });

    test('should return false when at first slide', async () => {
      presentationManager.currentSlideIndex = 0;

      const result = await presentationManager.previousSlide(mockMindmap);

      expect(result).toBe(false);
      expect(presentationManager.getCurrentSlideIndex()).toBe(0); // Unchanged
    });

    test('should throw error if no presentation is loaded', async () => {
      const pm = new PresentationManager(stateEngine, animationEngine);

      await expect(pm.previousSlide(mockMindmap)).rejects.toThrow('No presentation loaded');
    });

    test('should throw error if mindmapEngine is not provided', async () => {
      await expect(presentationManager.previousSlide(null)).rejects.toThrow('MindmapEngine is required');
    });
  });

  describe('jumpToSlide()', () => {
    beforeEach(() => {
      presentationManager.createPresentation('Test Presentation');
      for (let i = 1; i <= 5; i++) {
        presentationManager.addSlide({
          id: `slide-${i}`,
          actionType: 'node-expand',
          actionData: { nodeId: `node-${i}` },
          state: { camera: { x: i * 100, y: i * 100, zoom: 1 } }
        });
      }
      presentationManager.currentSlideIndex = 0; // Start at slide 1
    });

    test('should jump to specified slide index', async () => {
      expect(presentationManager.getCurrentSlideIndex()).toBe(0);

      const result = await presentationManager.jumpToSlide(3, mockMindmap);

      expect(result).toBe(true);
      expect(presentationManager.getCurrentSlideIndex()).toBe(3);
    });

    test('should jump forward multiple slides', async () => {
      const result = await presentationManager.jumpToSlide(4, mockMindmap);

      expect(result).toBe(true);
      expect(presentationManager.getCurrentSlideIndex()).toBe(4);
    });

    test('should jump backward multiple slides', async () => {
      presentationManager.currentSlideIndex = 4;

      const result = await presentationManager.jumpToSlide(1, mockMindmap);

      expect(result).toBe(true);
      expect(presentationManager.getCurrentSlideIndex()).toBe(1);
    });

    test('should handle jumping to same slide', async () => {
      presentationManager.currentSlideIndex = 2;

      const result = await presentationManager.jumpToSlide(2, mockMindmap);

      expect(result).toBe(true);
      expect(presentationManager.getCurrentSlideIndex()).toBe(2);
    });

    test('should throw error if no presentation is loaded', async () => {
      const pm = new PresentationManager(stateEngine, animationEngine);

      await expect(pm.jumpToSlide(0, mockMindmap)).rejects.toThrow('No presentation loaded');
    });

    test('should throw error if mindmapEngine is not provided', async () => {
      await expect(presentationManager.jumpToSlide(1, null)).rejects.toThrow('MindmapEngine is required');
    });

    test('should throw error if slideIndex is out of bounds', async () => {
      await expect(presentationManager.jumpToSlide(10, mockMindmap)).rejects.toThrow('Invalid slide index');
    });

    test('should throw error if slideIndex is negative', async () => {
      await expect(presentationManager.jumpToSlide(-1, mockMindmap)).rejects.toThrow('Invalid slide index');
    });

    test('should jump to first slide (index 0)', async () => {
      presentationManager.currentSlideIndex = 3;

      const result = await presentationManager.jumpToSlide(0, mockMindmap);

      expect(result).toBe(true);
      expect(presentationManager.getCurrentSlideIndex()).toBe(0);
    });

    test('should jump to last slide', async () => {
      const lastIndex = presentationManager.getSlideCount() - 1;

      const result = await presentationManager.jumpToSlide(lastIndex, mockMindmap);

      expect(result).toBe(true);
      expect(presentationManager.getCurrentSlideIndex()).toBe(lastIndex);
    });
  });
});
