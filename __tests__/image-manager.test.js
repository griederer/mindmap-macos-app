const ImageManager = require('../src/managers/image-manager');

describe('ImageManager', () => {
  let manager;

  beforeEach(() => {
    manager = new ImageManager();
  });

  describe('addImage', () => {
    test('should add image to node', () => {
      const imageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA';
      const index = manager.addImage('node-1', imageData);

      expect(index).toBe(0);
      expect(manager.getNodeImages('node-1')).toEqual([imageData]);
    });

    test('should add multiple images to same node', () => {
      const img1 = 'data:image/png;base64,image1';
      const img2 = 'data:image/png;base64,image2';

      manager.addImage('node-1', img1);
      manager.addImage('node-1', img2);

      expect(manager.getNodeImages('node-1')).toHaveLength(2);
      expect(manager.getNodeImages('node-1')).toEqual([img1, img2]);
    });

    test('should add images to different nodes', () => {
      const img1 = 'data:image/png;base64,image1';
      const img2 = 'data:image/png;base64,image2';

      manager.addImage('node-1', img1);
      manager.addImage('node-2', img2);

      expect(manager.getNodeImages('node-1')).toEqual([img1]);
      expect(manager.getNodeImages('node-2')).toEqual([img2]);
    });

    test('should return correct index for added images', () => {
      const index1 = manager.addImage('node-1', 'img1');
      const index2 = manager.addImage('node-1', 'img2');
      const index3 = manager.addImage('node-1', 'img3');

      expect(index1).toBe(0);
      expect(index2).toBe(1);
      expect(index3).toBe(2);
    });
  });

  describe('removeImage', () => {
    test('should remove image from node', () => {
      manager.addImage('node-1', 'img1');
      manager.addImage('node-1', 'img2');

      manager.removeImage('node-1', 0);

      expect(manager.getNodeImages('node-1')).toEqual(['img2']);
    });

    test('should remove node from nodeImages when last image removed', () => {
      manager.addImage('node-1', 'img1');

      manager.removeImage('node-1', 0);

      expect(manager.hasImages('node-1')).toBe(false);
      expect(manager.getNodeImages('node-1')).toEqual([]);
    });

    test('should handle removing from non-existent node', () => {
      expect(() => {
        manager.removeImage('non-existent', 0);
      }).not.toThrow();
    });

    test('should handle invalid index', () => {
      manager.addImage('node-1', 'img1');

      expect(() => {
        manager.removeImage('node-1', 5);
      }).not.toThrow();
    });
  });

  describe('getNodeImages', () => {
    test('should return all images for node', () => {
      manager.addImage('node-1', 'img1');
      manager.addImage('node-1', 'img2');
      manager.addImage('node-1', 'img3');

      const images = manager.getNodeImages('node-1');

      expect(images).toEqual(['img1', 'img2', 'img3']);
    });

    test('should return empty array for node without images', () => {
      const images = manager.getNodeImages('node-1');
      expect(images).toEqual([]);
    });
  });

  describe('hasImages', () => {
    test('should return true when node has images', () => {
      manager.addImage('node-1', 'img1');

      expect(manager.hasImages('node-1')).toBe(true);
    });

    test('should return false when node has no images', () => {
      expect(manager.hasImages('node-1')).toBe(false);
    });

    test('should return false after all images removed', () => {
      manager.addImage('node-1', 'img1');
      manager.removeImage('node-1', 0);

      expect(manager.hasImages('node-1')).toBe(false);
    });
  });

  describe('getImageCount', () => {
    test('should return correct count', () => {
      manager.addImage('node-1', 'img1');
      manager.addImage('node-1', 'img2');

      expect(manager.getImageCount('node-1')).toBe(2);
    });

    test('should return 0 for node without images', () => {
      expect(manager.getImageCount('node-1')).toBe(0);
    });

    test('should update count after removal', () => {
      manager.addImage('node-1', 'img1');
      manager.addImage('node-1', 'img2');
      manager.removeImage('node-1', 0);

      expect(manager.getImageCount('node-1')).toBe(1);
    });
  });

  describe('clearNodeImages', () => {
    test('should remove all images from node', () => {
      manager.addImage('node-1', 'img1');
      manager.addImage('node-1', 'img2');

      manager.clearNodeImages('node-1');

      expect(manager.hasImages('node-1')).toBe(false);
      expect(manager.getImageCount('node-1')).toBe(0);
    });

    test('should not affect other nodes', () => {
      manager.addImage('node-1', 'img1');
      manager.addImage('node-2', 'img2');

      manager.clearNodeImages('node-1');

      expect(manager.hasImages('node-1')).toBe(false);
      expect(manager.hasImages('node-2')).toBe(true);
    });

    test('should handle clearing non-existent node', () => {
      expect(() => {
        manager.clearNodeImages('non-existent');
      }).not.toThrow();
    });
  });

  describe('loadFromNodeData / exportToNodeData', () => {
    test('should load images from node data', () => {
      const nodeData = {
        'node-1': { images: ['img1', 'img2'] },
        'node-2': { images: ['img3'] }
      };

      manager.loadFromNodeData(nodeData);

      expect(manager.getNodeImages('node-1')).toEqual(['img1', 'img2']);
      expect(manager.getNodeImages('node-2')).toEqual(['img3']);
    });

    test('should skip nodes without images', () => {
      const nodeData = {
        'node-1': { images: ['img1'] },
        'node-2': { images: [] },
        'node-3': {}
      };

      manager.loadFromNodeData(nodeData);

      expect(manager.getNodeImages('node-1')).toEqual(['img1']);
      expect(manager.getNodeImages('node-2')).toEqual([]);
      expect(manager.getNodeImages('node-3')).toEqual([]);
    });

    test('should export images to node data format', () => {
      manager.addImage('node-1', 'img1');
      manager.addImage('node-1', 'img2');
      manager.addImage('node-2', 'img3');

      const nodeData = manager.exportToNodeData();

      expect(nodeData).toEqual({
        'node-1': { images: ['img1', 'img2'] },
        'node-2': { images: ['img3'] }
      });
    });

    test('should clear previous data when loading', () => {
      manager.addImage('node-1', 'img1');

      const nodeData = {
        'node-2': { images: ['img2'] }
      };
      manager.loadFromNodeData(nodeData);

      expect(manager.hasImages('node-1')).toBe(false);
      expect(manager.hasImages('node-2')).toBe(true);
    });
  });
});
