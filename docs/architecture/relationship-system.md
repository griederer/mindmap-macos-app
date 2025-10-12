# Relationship System (v5.0)

## Overview

The v5.0 relationship system uses a simplified bidirectional storage model where nodes store arrays of `relationshipIds` and relationships are defined separately with visual properties.

## Architecture

### Data Structure

```javascript
// Relationships definition (stored in renderer)
relationships = [
  {
    id: "rel-001",                    // Unique identifier
    name: "depends on",               // Display name
    color: "#ff6b6b",                 // Line color
    dashPattern: [5, 5]               // CSS dash pattern
  }
]

// Node data (stored in mindmapEngine.nodeData)
nodeData = {
  "node-001": {
    relationships: ["rel-001", "rel-002"],  // Array of relationship IDs
    categories: [],
    notes: "...",
    images: []
  }
}
```

### Key Principles

1. **No Connection Objects**: Unlike previous versions, relationships don't store connection pairs
2. **Automatic Pairing**: Drawing logic automatically connects nodes sharing the same relationshipId
3. **Bidirectional by Design**: If Node A and Node B both have "rel-001", they're connected
4. **Visual Properties**: Color and dash pattern stored at relationship level, not connection level

## File Locations

### Relationship Panel UI
**Location:** `renderer.js:1346-1813`

Functions:
- `toggleRelationshipsPanel()` - Show/hide panel (1405-1417)
- `renderRelationships()` - Render relationship list (1430-1528)
- `updateRelationshipStats()` - Update node counts (1531-1567)
- `saveNodeRelationships()` - Save node's relationships (1605-1649)

### Relationship Line Drawing
**Location:** `mindmap-engine.js:410-494`

Function: `drawConnections()`
- Draws hierarchy lines (parent-child)
- Draws relationship connections (v5.0 style)
- Applies color and dash patterns

Algorithm:
```javascript
// Find all nodes with this relationshipId
const nodesWithThisRel = [];
Object.keys(this.nodeData).forEach(nodeId => {
  const nodeRels = this.nodeData[nodeId].relationships || [];
  if (nodeRels.includes(relationshipId)) {
    nodesWithThisRel.push(nodeId);
  }
});

// Draw line between each pair
for (let i = 0; i < nodesWithThisRel.length; i++) {
  for (let j = i + 1; j < nodesWithThisRel.length; j++) {
    // Draw line with relationship color and dash pattern
  }
}
```

### Node Relationship Storage
**Location:** `renderer.js:1423-1428`

When editing a node:
1. User opens edit modal (double-click or context menu)
2. Checkboxes displayed for available relationships
3. User checks/unchecks relationships
4. On save, node's relationship array updated
5. Mindmap redraws with new connections

## Workflow

### Creating a Relationship

1. User clicks relationships button in toolbar
2. Panel opens with existing relationships
3. User clicks "Crear Nueva Relación"
4. Dialog prompts for:
   - Name (e.g., "depende de")
   - Color (color picker)
   - Dash pattern (solid, dashed, dotted)
5. Relationship added to `relationships` array
6. Panel refreshes to show new relationship

### Assigning Relationship to Node

1. User double-clicks node or uses context menu "Editar nodo"
2. Edit modal opens with relationship checkboxes
3. User checks desired relationships
4. **Bug Fixed**: Checkboxes now stay checked (renderer.js:1597-1610)
5. User clicks "Guardar"
6. Node's `relationships` array updated
7. Mindmap redraws connections

### Drawing Relationships

1. `drawConnections()` called after any change
2. For each active relationship:
   - Find all nodes with that relationshipId
   - Draw lines between each pair
   - Apply relationship's color and dash pattern
3. Lines drawn on top of hierarchy lines
4. Visibility controlled by active relationships set

## Panel Statistics

**Location:** `renderer.js:1531-1567`

Displays:
- **Total nodos**: Count of all nodes in project
- **Nodos conectados**: Nodes with at least one relationship
- **Updates**: On panel open, relationship change, project switch

Algorithm:
```javascript
// Count total nodes (recursive)
countProjectNodes(node = this.nodes)

// Count connected nodes
connectedNodes = count nodes where relationships.length > 0
```

## Known Issues

1. **Node Counter Bug**: Shows 130 instead of 4 (see /docs/bugs/node-counter-investigation.md)
2. **Panel Refresh**: Fixed - now refreshes on open

## Testing

### Test Project
- File: `Test-Relaciones-Vacio.pmap`
- Nodes: 4 (1 root + 3 children: A, B, C)
- Relationships: 0 (clean slate)

### Test Workflow
1. Create relationship "depende de" (red, dashed)
2. Edit Node A, check "depende de"
3. Edit Node B, check "depende de"
4. Verify red dashed line appears between A and B
5. Toggle relationship visibility
6. Verify line disappears/reappears

## Future Improvements

1. **Relationship Types**: Add arrows (A→B vs A↔B)
2. **Performance**: Optimize drawing for large mindmaps
3. **UI/UX**: Improve relationship creation workflow
4. **Validation**: Prevent duplicate relationship names
5. **Export**: Include relationships in export formats
