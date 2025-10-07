const RelationshipManager = require('../src/managers/relationship-manager');

describe('RelationshipManager', () => {
  let manager;

  beforeEach(() => {
    manager = new RelationshipManager();
  });

  describe('createRelationship', () => {
    test('should create relationship with unique ID', () => {
      const rel = manager.createRelationship('depends on', '#ff0000', '5,5');

      expect(rel.id).toMatch(/^rel-\d+-\d+$/);
      expect(rel.name).toBe('depends on');
      expect(rel.color).toBe('#ff0000');
      expect(rel.dashPattern).toBe('5,5');
    });

    test('should default dashPattern to solid line', () => {
      const rel = manager.createRelationship('leads to', '#00ff00');

      expect(rel.dashPattern).toBe('0');
    });

    test('should add relationship to internal list', () => {
      manager.createRelationship('depends on', '#ff0000');

      expect(manager.getAllRelationships()).toHaveLength(1);
    });

    test('should create multiple relationships with unique IDs', () => {
      const rel1 = manager.createRelationship('depends on', '#ff0000');
      const rel2 = manager.createRelationship('leads to', '#00ff00');

      expect(rel1.id).not.toBe(rel2.id);
      expect(manager.getAllRelationships()).toHaveLength(2);
    });
  });

  describe('connect', () => {
    test('should create connection with unique ID', () => {
      const rel = manager.createRelationship('depends on', '#ff0000');
      const conn = manager.connect('node-1', 'node-2', rel.id);

      expect(conn.id).toMatch(/^conn-\d+-\d+$/);
      expect(conn.fromNodeId).toBe('node-1');
      expect(conn.toNodeId).toBe('node-2');
      expect(conn.relationshipId).toBe(rel.id);
    });

    test('should add connection to internal list', () => {
      const rel = manager.createRelationship('depends on', '#ff0000');
      manager.connect('node-1', 'node-2', rel.id);

      expect(manager.getAllConnections()).toHaveLength(1);
    });

    test('should create multiple connections with unique IDs', () => {
      const rel = manager.createRelationship('depends on', '#ff0000');
      const conn1 = manager.connect('node-1', 'node-2', rel.id);
      const conn2 = manager.connect('node-2', 'node-3', rel.id);

      expect(conn1.id).not.toBe(conn2.id);
      expect(manager.getAllConnections()).toHaveLength(2);
    });
  });

  describe('disconnect', () => {
    test('should remove connection', () => {
      const rel = manager.createRelationship('depends on', '#ff0000');
      const conn = manager.connect('node-1', 'node-2', rel.id);

      manager.disconnect(conn.id);

      expect(manager.getAllConnections()).toHaveLength(0);
    });

    test('should not affect other connections', () => {
      const rel = manager.createRelationship('depends on', '#ff0000');
      const conn1 = manager.connect('node-1', 'node-2', rel.id);
      const conn2 = manager.connect('node-2', 'node-3', rel.id);
      const conn2Id = conn2.id;

      manager.disconnect(conn1.id);

      expect(manager.getAllConnections()).toHaveLength(1);
      expect(manager.getAllConnections()[0].id).toBe(conn2Id);
    });

    test('should handle removing non-existent connection', () => {
      expect(() => {
        manager.disconnect('non-existent-id');
      }).not.toThrow();
    });
  });

  describe('getNodeConnections', () => {
    test('should return connections where node is source', () => {
      const rel = manager.createRelationship('depends on', '#ff0000');
      const conn1 = manager.connect('node-1', 'node-2', rel.id);
      manager.connect('node-2', 'node-3', rel.id);

      const connections = manager.getNodeConnections('node-1');

      expect(connections).toHaveLength(1);
      expect(connections[0].id).toBe(conn1.id);
    });

    test('should return connections where node is target', () => {
      const rel = manager.createRelationship('depends on', '#ff0000');
      manager.connect('node-1', 'node-2', rel.id);
      const conn2 = manager.connect('node-2', 'node-3', rel.id);

      const connections = manager.getNodeConnections('node-3');

      expect(connections).toHaveLength(1);
      expect(connections[0].id).toBe(conn2.id);
    });

    test('should return all connections for node (source and target)', () => {
      const rel = manager.createRelationship('depends on', '#ff0000');
      manager.connect('node-1', 'node-2', rel.id);
      manager.connect('node-2', 'node-3', rel.id);

      const connections = manager.getNodeConnections('node-2');

      expect(connections).toHaveLength(2);
    });

    test('should return empty array for node without connections', () => {
      const connections = manager.getNodeConnections('node-1');
      expect(connections).toEqual([]);
    });
  });

  describe('getConnectionRelationship', () => {
    test('should return relationship for connection', () => {
      const rel = manager.createRelationship('depends on', '#ff0000');
      const conn = manager.connect('node-1', 'node-2', rel.id);

      const relationship = manager.getConnectionRelationship(conn.id);

      expect(relationship.id).toBe(rel.id);
      expect(relationship.name).toBe('depends on');
    });

    test('should return null for non-existent connection', () => {
      const relationship = manager.getConnectionRelationship('non-existent-id');
      expect(relationship).toBeNull();
    });

    test('should return null for connection with non-existent relationship', () => {
      const conn = manager.connect('node-1', 'node-2', 'non-existent-rel-id');

      const relationship = manager.getConnectionRelationship(conn.id);

      expect(relationship).toBeUndefined();
    });
  });

  describe('deleteRelationship', () => {
    test('should remove relationship from list', () => {
      const rel = manager.createRelationship('depends on', '#ff0000');

      manager.deleteRelationship(rel.id);

      expect(manager.getAllRelationships()).toHaveLength(0);
    });

    test('should remove all connections using this relationship', () => {
      const rel = manager.createRelationship('depends on', '#ff0000');
      manager.connect('node-1', 'node-2', rel.id);
      manager.connect('node-2', 'node-3', rel.id);

      manager.deleteRelationship(rel.id);

      expect(manager.getAllConnections()).toHaveLength(0);
    });

    test('should not affect other relationships and their connections', () => {
      const rel1 = manager.createRelationship('depends on', '#ff0000');
      const rel2 = manager.createRelationship('leads to', '#00ff00');
      const rel2Id = rel2.id;

      manager.connect('node-1', 'node-2', rel1.id);
      const conn2 = manager.connect('node-2', 'node-3', rel2.id);

      manager.deleteRelationship(rel1.id);

      expect(manager.getAllRelationships()).toHaveLength(1);
      expect(manager.getAllRelationships()[0].id).toBe(rel2Id);
      expect(manager.getAllConnections()).toHaveLength(1);
      expect(manager.getAllConnections()[0].id).toBe(conn2.id);
    });
  });

  describe('loadData / exportData', () => {
    test('should load relationships and connections from data', () => {
      const relationships = [
        { id: 'rel-1', name: 'depends on', color: '#ff0000', dashPattern: '5,5' },
        { id: 'rel-2', name: 'leads to', color: '#00ff00', dashPattern: '0' }
      ];
      const connections = [
        { id: 'conn-1', fromNodeId: 'node-1', toNodeId: 'node-2', relationshipId: 'rel-1' },
        { id: 'conn-2', fromNodeId: 'node-2', toNodeId: 'node-3', relationshipId: 'rel-2' }
      ];

      manager.loadData(relationships, connections);

      expect(manager.getAllRelationships()).toEqual(relationships);
      expect(manager.getAllConnections()).toEqual(connections);
    });

    test('should export relationships and connections for saving', () => {
      manager.createRelationship('depends on', '#ff0000');
      manager.createRelationship('leads to', '#00ff00');
      const rel = manager.getAllRelationships()[0];
      manager.connect('node-1', 'node-2', rel.id);

      const exported = manager.exportData();

      expect(exported.relationships).toHaveLength(2);
      expect(exported.connections).toHaveLength(1);
      expect(exported.relationships[0].name).toBe('depends on');
      expect(exported.connections[0].fromNodeId).toBe('node-1');
    });

    test('should handle null/undefined load', () => {
      manager.loadData(null, null);
      expect(manager.getAllRelationships()).toEqual([]);
      expect(manager.getAllConnections()).toEqual([]);

      manager.loadData(undefined, undefined);
      expect(manager.getAllRelationships()).toEqual([]);
      expect(manager.getAllConnections()).toEqual([]);
    });
  });
});
