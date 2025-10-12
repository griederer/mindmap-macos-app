# Node Counter Bug Investigation

**Status:** 🔴 OPEN
**Severity:** Medium
**Component:** Relationship Panel
**Created:** 2025-10-11

## Problem Description

The relationship panel displays "Total nodos: 130" when the current project (Test-Relaciones-Vacio.pmap) contains only 4 nodes (1 root + 3 children).

## Root Cause

The issue occurs during project loading at `renderer.js:2449`:

```javascript
// ❌ INCORRECT - Loads tree structure into data dictionary
window.mindmapEngine.nodeData = projectData.nodes || {};

// ✅ SHOULD BE - Load corresponding dictionary
window.mindmapEngine.nodeData = projectData.nodeData || {};
```

### Problem Flow

1. **App Initialization (line 360)**
   - `init()` → `generateMindmap()`
   - Parses STALE content from textarea (localStorage cache)
   - Creates tree with ~130 nodes from old project data
   - Sets `this.nodes = oldTree`

2. **Project Load (lines 2434-2524)**
   - `loadProject()` loads Test-Relaciones-Vacio.pmap
   - Line 2446: Updates textarea with `projectData.content` ✅
   - Line 2449: `window.mindmapEngine.nodeData = projectData.nodes` ❌
   - Loads tree structure into dictionary property (WRONG)
   - Line 2524: Calls `generateMindmap()`
   - Should update `this.nodes` but doesn't work correctly

3. **Counter Update**
   - `updateRelationshipStats()` → `countProjectNodes()`
   - Counts from `this.nodes` (still has 130 node tree)

## Data Structure

v5.0 format separates tree structure from data dictionary:

```json
{
  "version": "5.0",
  "nodes": {          // ← Tree structure (hierarchical)
    "id": "root-001",
    "title": "Test Relaciones",
    "children": [...]  // 3 children = 4 total nodes
  },
  "nodeData": {       // ← Data dictionary (flat key-value)
    "root-001": {...},
    "node-001": {...}
  }
}
```

## Attempted Fix

Changed line 2449 from:
```javascript
window.mindmapEngine.nodeData = projectData.nodes || {};
```

To:
```javascript
window.mindmapEngine.nodeData = projectData.nodeData || {};
```

**Result:** App crashed on startup (exit code 1)

## Investigation Needed

1. **Why does the fix cause crash?**
   - Syntax is correct
   - Property exists in v5.0 format
   - May be timing/initialization issue

2. **Check entire load flow:**
   - `init()` → `generateMindmap()` timing
   - `loadProject()` → `generateMindmap()` execution
   - `this.nodes` update mechanism

3. **Verify parseOutline() logic:**
   - Location: `mindmap-engine.js:49-131`
   - May not be parsing correctly from textarea content

4. **localStorage investigation:**
   - Clear stale data
   - Check for corrupted cache

## Code Locations

- `renderer.js:2449` - Bug location (wrong property loaded)
- `renderer.js:1531-1567` - `updateRelationshipStats()`
- `mindmap-engine.js:1533-1546` - `countProjectNodes()`
- `renderer.js:1815-1825` - `generateMindmap()`
- `mindmap-engine.js:508-520` - `renderNodes()` (sets `this.nodes`)

## Test Environment

- Test project: `/Users/gonzaloriederer/Documents/PWC Mindmaps/Test-Relaciones-Vacio.pmap`
- Expected count: 4 nodes
- Actual count: 130 nodes

## Next Steps

1. Add proper logging to understand initialization sequence
2. Test localStorage clearing before project load
3. Investigate why correct property causes crash
4. Consider refactoring load flow to be more predictable

## Related Issues

- Checkbox functionality (FIXED)
- Panel refresh logic (FIXED)
