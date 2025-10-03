/**
 * @typedef {Object} Relationship
 * @property {string} id - Unique relationship identifier
 * @property {string} name - Relationship name (e.g., "depends on")
 * @property {string} color - Hex color code
 * @property {string} dashPattern - SVG dash pattern (e.g., "5,5" for dashed line)
 */

/**
 * @typedef {Object} Connection
 * @property {string} id - Unique connection identifier
 * @property {string} fromNodeId - Source node ID
 * @property {string} toNodeId - Target node ID
 * @property {string} relationshipId - Relationship type ID
 */

/**
 * RelationshipManager - Handles relationships and connections between nodes
 *
 * Relationships define types of connections (e.g., "depends on", "leads to")
 * Connections are actual links between specific nodes using a relationship type.
 */
class RelationshipManager {
  constructor() {
    /** @type {Relationship[]} */
    this.relationships = [];
    /** @type {Connection[]} */
    this.connections = [];
    /** @type {number} */
    this.relIdCounter = 0;
    /** @type {number} */
    this.connIdCounter = 0;
  }

  /**
   * Create a new relationship type
   * @param {string} name - Relationship name (e.g., "depends on")
   * @param {string} color - Hex color code
   * @param {string} dashPattern - SVG dash pattern (e.g., "5,5" for dashed line)
   * @returns {Relationship}
   */
  createRelationship(name, color, dashPattern = '0') {
    const relationship = {
      id: `rel-${Date.now()}-${this.relIdCounter++}`,
      name,
      color,
      dashPattern
    };
    this.relationships.push(relationship);
    return relationship;
  }

  /**
   * Create a connection between two nodes
   * @param {string} fromNodeId - Source node ID
   * @param {string} toNodeId - Target node ID
   * @param {string} relationshipId - Relationship type ID
   * @returns {Connection}
   */
  connect(fromNodeId, toNodeId, relationshipId) {
    const connection = {
      id: `conn-${Date.now()}-${this.connIdCounter++}`,
      fromNodeId,
      toNodeId,
      relationshipId
    };
    this.connections.push(connection);
    return connection;
  }

  /**
   * Remove a connection
   * @param {string} connectionId - Connection ID
   */
  disconnect(connectionId) {
    this.connections = this.connections.filter(c => c.id !== connectionId);
  }

  /**
   * Get all connections for a specific node
   * @param {string} nodeId - Node ID
   * @returns {Connection[]} Connections where node is source or target
   */
  getNodeConnections(nodeId) {
    return this.connections.filter(
      c => c.fromNodeId === nodeId || c.toNodeId === nodeId
    );
  }

  /**
   * Get relationship details for a connection
   * @param {string} connectionId - Connection ID
   * @returns {Relationship|null|undefined} Relationship object or null
   */
  getConnectionRelationship(connectionId) {
    const connection = this.connections.find(c => c.id === connectionId);
    if (!connection) return null;
    return this.relationships.find(r => r.id === connection.relationshipId);
  }

  /**
   * Get all relationships
   * @returns {Relationship[]} All relationships
   */
  getAllRelationships() {
    return this.relationships;
  }

  /**
   * Get all connections
   * @returns {Connection[]} All connections
   */
  getAllConnections() {
    return this.connections;
  }

  /**
   * Delete a relationship type
   * @param {string} relationshipId - Relationship ID
   */
  deleteRelationship(relationshipId) {
    // Remove all connections using this relationship
    this.connections = this.connections.filter(
      c => c.relationshipId !== relationshipId
    );
    // Remove the relationship
    this.relationships = this.relationships.filter(
      r => r.id !== relationshipId
    );
  }

  /**
   * Load relationships and connections from project data
   * @param {Relationship[]|null|undefined} relationships - Relationships array
   * @param {Connection[]|null|undefined} connections - Connections array
   */
  loadData(relationships, connections) {
    this.relationships = relationships || [];
    this.connections = connections || [];
  }

  /**
   * Export data for saving
   * @returns {{relationships: Relationship[], connections: Connection[]}}
   */
  exportData() {
    return {
      relationships: this.relationships,
      connections: this.connections
    };
  }
}

// Export for use in renderer
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RelationshipManager;
}
