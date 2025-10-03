const CategoryManager = require('../src/managers/category-manager');

describe('CategoryManager', () => {
  let manager;

  beforeEach(() => {
    manager = new CategoryManager();
  });

  describe('createCategory', () => {
    test('should create category with unique ID', () => {
      const cat = manager.createCategory('Important', '#ff0000');

      expect(cat.id).toMatch(/^cat-\d+-\d+$/);
      expect(cat.name).toBe('Important');
      expect(cat.color).toBe('#ff0000');
      expect(cat.nodeIds).toEqual([]);
    });

    test('should add category to internal list', () => {
      manager.createCategory('Important', '#ff0000');

      expect(manager.getAllCategories()).toHaveLength(1);
    });

    test('should create multiple categories with unique IDs', () => {
      const cat1 = manager.createCategory('Important', '#ff0000');
      const cat2 = manager.createCategory('Urgent', '#00ff00');

      expect(cat1.id).not.toBe(cat2.id);
      expect(manager.getAllCategories()).toHaveLength(2);
    });
  });

  describe('assignToNode', () => {
    test('should assign category to node', () => {
      const cat = manager.createCategory('Important', '#ff0000');
      manager.assignToNode(cat.id, 'node-1');

      expect(cat.nodeIds).toContain('node-1');
    });

    test('should not duplicate node assignment', () => {
      const cat = manager.createCategory('Important', '#ff0000');
      manager.assignToNode(cat.id, 'node-1');
      manager.assignToNode(cat.id, 'node-1');

      expect(cat.nodeIds).toEqual(['node-1']);
    });

    test('should assign same node to multiple categories', () => {
      const cat1 = manager.createCategory('Important', '#ff0000');
      const cat2 = manager.createCategory('Urgent', '#00ff00');

      manager.assignToNode(cat1.id, 'node-1');
      manager.assignToNode(cat2.id, 'node-1');

      const categories = manager.getNodeCategories('node-1');
      expect(categories).toHaveLength(2);
    });
  });

  describe('removeFromNode', () => {
    test('should remove category from node', () => {
      const cat = manager.createCategory('Important', '#ff0000');
      manager.assignToNode(cat.id, 'node-1');
      manager.removeFromNode(cat.id, 'node-1');

      expect(cat.nodeIds).not.toContain('node-1');
    });

    test('should handle removing non-existent assignment', () => {
      const cat = manager.createCategory('Important', '#ff0000');

      expect(() => {
        manager.removeFromNode(cat.id, 'node-1');
      }).not.toThrow();
    });
  });

  describe('getNodeCategories', () => {
    test('should return all categories for a node', () => {
      const cat1 = manager.createCategory('Important', '#ff0000');
      const cat2 = manager.createCategory('Urgent', '#00ff00');
      const cat3 = manager.createCategory('Low Priority', '#0000ff');

      manager.assignToNode(cat1.id, 'node-1');
      manager.assignToNode(cat2.id, 'node-1');

      const categories = manager.getNodeCategories('node-1');
      expect(categories).toHaveLength(2);
      expect(categories.map(c => c.id)).toContain(cat1.id);
      expect(categories.map(c => c.id)).toContain(cat2.id);
      expect(categories.map(c => c.id)).not.toContain(cat3.id);
    });

    test('should return empty array for node without categories', () => {
      const categories = manager.getNodeCategories('node-1');
      expect(categories).toEqual([]);
    });
  });

  describe('deleteCategory', () => {
    test('should remove category from list', () => {
      const cat = manager.createCategory('Important', '#ff0000');
      manager.deleteCategory(cat.id);

      expect(manager.getAllCategories()).toHaveLength(0);
    });

    test('should not affect other categories', () => {
      const cat1 = manager.createCategory('Important', '#ff0000');
      const cat2 = manager.createCategory('Urgent', '#00ff00');
      const cat2Id = cat2.id;

      manager.deleteCategory(cat1.id);

      expect(manager.getAllCategories()).toHaveLength(1);
      expect(manager.getAllCategories()[0].id).toBe(cat2Id);
      expect(manager.getAllCategories()[0].name).toBe('Urgent');
    });
  });

  describe('loadCategories / exportCategories', () => {
    test('should load categories from array', () => {
      const categories = [
        { id: 'cat-1', name: 'Important', color: '#ff0000', nodeIds: ['node-1'] },
        { id: 'cat-2', name: 'Urgent', color: '#00ff00', nodeIds: [] }
      ];

      manager.loadCategories(categories);

      expect(manager.getAllCategories()).toEqual(categories);
    });

    test('should export categories for saving', () => {
      manager.createCategory('Important', '#ff0000');
      manager.createCategory('Urgent', '#00ff00');

      const exported = manager.exportCategories();

      expect(exported).toHaveLength(2);
      expect(exported[0].name).toBe('Important');
      expect(exported[1].name).toBe('Urgent');
    });

    test('should handle null/undefined load', () => {
      manager.loadCategories(null);
      expect(manager.getAllCategories()).toEqual([]);

      manager.loadCategories(undefined);
      expect(manager.getAllCategories()).toEqual([]);
    });
  });
});
