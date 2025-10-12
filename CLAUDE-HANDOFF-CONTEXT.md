# Claude Code Handoff - Mindmap App Bug Investigation

## 🎯 Mission Brief

You are taking over an active debugging session for a macOS Electron mindmap application. This document contains all critical context needed to continue fixing relationship system bugs and implement pending features.

**Primary Tasks:**
1. Fix node counter showing 130 instead of 4
2. Fix checkbox functionality in edit node modal
3. Test complete relationship workflow
4. Create proper VS Code workspace structure
5. Generate comprehensive PRD for remaining issues

## 📁 Repository Structure

```
/Users/gonzaloriederer/Documents/GitHub/mindmap-macos-app/
├── main.js                 # Electron main process
├── renderer.js             # Main UI logic (2967 lines)
├── mindmap-engine.js       # Core mindmap rendering (1547 lines)
├── project-manager.js      # Project file management
├── index.html              # Main app window
└── /Users/gonzaloriederer/Documents/PWC Mindmaps/  # Project files (.pmap format)
    ├── .metadata.json      # Recent projects list
    └── Test-Relaciones-Vacio.pmap  # Empty test project (4 nodes)
```

## 🐛 Critical Bug: Node Counter Shows 130 Instead of 4

### Current Status
**Location**: renderer.js:1531-1567 (`updateRelationshipStats()`)
**Symptom**: Relationship panel displays "Total nodos: 130" when current project has only 4 nodes
**Impact**: Misleading statistics in relationship panel

### Root Cause Analysis

**Problem Flow:**
```
1. App Init (line 360)
   └─> init() → generateMindmap()
       └─> Parses STALE content from textarea (localStorage cache)
       └─> Creates tree with ~130 nodes (old project data)
       └─> Sets this.nodes = oldTree

2. Project Load (line 2434-2524)
   └─> loadProject() → loads Test-Relaciones-Vacio.pmap
       ├─> Line 2446: Updates textarea with projectData.content ✓
       ├─> Line 2449: window.mindmapEngine.nodeData = projectData.nodes ❌ BUG!
       │   (Loads tree structure into dictionary property - WRONG)
       └─> Line 2524: generateMindmap()
           └─> Should update this.nodes but doesn't work correctly

3. Counter Update
   └─> updateRelationshipStats() → countProjectNodes()
       └─> Counts from this.nodes (still has 130 node tree)
```

**Bug Identified at renderer.js:2449:**
```javascript
// ❌ INCORRECT - Loads tree structure into data dictionary
window.mindmapEngine.nodeData = projectData.nodes || {};

// ✅ CORRECT - Should load corresponding dictionary
window.mindmapEngine.nodeData = projectData.nodeData || {};
```

**v5.0 Format** (Test-Relaciones-Vacio.pmap):
```json
{
  "version": "5.0",
  "metadata": {...},
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

### ⚠️ Important Discovery

**Attempted Fix Failed:**
- Applied correction: `projectData.nodeData` instead of `projectData.nodes`
- Result: App crashed on startup (exit code 1)
- Reverted to keep stability
- **Root cause of crash**: Unknown - needs investigation

### Investigation Needed

1. **Why does the fix cause crash?**
   - Syntax is correct
   - Property exists in v5.0 format
   - May be timing/initialization issue

2. **Check entire load flow:**
   - init() → generateMindmap() timing
   - loadProject() → generateMindmap() execution
   - this.nodes update mechanism

3. **Verify parseOutline() logic:**
   - mindmap-engine.js:49-131
   - May not be parsing correctly from textarea content

4. **localStorage investigation:**
   - Clear stale data
   - Check for corrupted cache

## 🐛 Bug #2: Checkbox Not Working in Edit Node Modal

### Status: ✅ FIXED

**Location**: renderer.js:1597-1610
**Problem**: Clicking relationship checkboxes in edit modal wouldn't keep them checked
**Cause**: Double-toggle issue - checkbox inside label triggered both native and label click

**Solution Applied:**
```javascript
// Fixed: Separate change and click handlers
checkbox.addEventListener('change', (e) => {
    e.stopPropagation();
    tag.classList.toggle('selected', checkbox.checked);
});

tag.addEventListener('click', (e) => {
    if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
        tag.classList.toggle('selected', checkbox.checked);
    }
});
```

## 📋 Test Project Setup

**Current Test Environment:**
- File: `/Users/gonzaloriederer/Documents/PWC Mindmaps/Test-Relaciones-Vacio.pmap`
- Purpose: Empty project to test relationship workflow from scratch
- Nodes: 4 total (1 root + 3 children: "Nodo A", "Nodo B", "Nodo C")
- Relationships: 0 (clean slate)
- Set as default in .metadata.json

## 🔄 Relationship System (v5.0 Simplified)

### Architecture
**Format**: Simplified bidirectional storage
- Nodes store array of `relationshipIds`
- No connection objects in relationship definitions
- Drawing logic automatically connects nodes sharing same relationshipId

**Key Files:**
- renderer.js:1346-1813 - Relationship panel UI
- mindmap-engine.js:410-494 - Relationship line drawing
- renderer.js:1423-1428 - Node relationship storage

### Data Structure
```javascript
// Relationships definition (in renderer)
relationships = [
  {
    id: "rel-001",
    name: "depends on",
    color: "#ff6b6b",
    dashPattern: [5, 5]  // CSS dash pattern
  }
]

// Node data (in mindmapEngine.nodeData)
nodeData = {
  "node-001": {
    relationships: ["rel-001", "rel-002"],  // Array of IDs
    categories: [],
    notes: "...",
    images: []
  }
}
```

## ✅ Completed Tasks

1. ✅ Created empty test project (Test-Relaciones-Vacio.pmap)
2. ✅ Updated .metadata.json to load empty project by default
3. ✅ Fixed checkbox double-toggle bug in edit modal
4. ✅ Added panel refresh when relationships panel opens
5. ✅ Identified root cause of node counter bug
6. ✅ Removed problematic debug logs that caused syntax errors

## 🎯 Pending Tasks

### Immediate Priority
1. **Fix Node Counter Bug**
   - Investigate why `projectData.nodeData` fix causes crash
   - Implement correct loading mechanism
   - Verify counter shows "4 nodos" for test project

2. **Test Complete Relationship Workflow**
   - Create new relationship in panel
   - Edit a node (double-click or context menu)
   - Check relationship checkbox
   - Verify checkbox stays checked
   - Save node
   - Verify relationship line appears on canvas
   - Test with multiple nodes

3. **Verify Panel Statistics**
   - Total nodes count correct
   - Connected nodes count accurate
   - Stats update when relationships change

### VS Code Workspace Setup
1. **Create Workspace Structure**
   - `.vscode/settings.json` - Editor config
   - `.vscode/tasks.json` - Build/run tasks
   - `.vscode/launch.json` - Debug configurations
   - `.vscode/extensions.json` - Recommended extensions

2. **Documentation Organization**
   - `/docs` folder structure
   - `/tasks` for PRD and task lists
   - `/logs` for debug sessions
   - Update ARCHITECTURE.md

3. **Development Tools**
   - ESLint configuration
   - Prettier formatting
   - Git hooks (husky)
   - Test framework setup

## 🔍 Key Code Locations

### Node Counter Logic
```javascript
// renderer.js:1531-1567
updateRelationshipStats() {
    let totalNodes = 0;
    if (window.mindmapEngine && window.mindmapEngine.countProjectNodes) {
        totalNodes = window.mindmapEngine.countProjectNodes();
    }
    // Updates DOM: getElementById('totalNodesRelCount')
}

// mindmap-engine.js:1533-1546
countProjectNodes(node = null) {
    if (!node) node = this.nodes;  // ← Counts from this.nodes
    if (!node) return 0;

    let count = 1;
    if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
            count += this.countProjectNodes(child);
        });
    }
    return count;
}
```

### Project Loading
```javascript
// renderer.js:2434-2524
async loadProject(projectId) {
    const projectData = await window.projectManager.loadProject(project.path);
    if (projectData) {
        // Line 2446: Load content into textarea
        document.getElementById('outlineInput').value = projectData.content || '';

        // Line 2449: ❌ BUG - Wrong property loaded
        window.mindmapEngine.nodeData = projectData.nodes || {};

        // Line 2524: Generate mindmap from textarea content
        this.generateMindmap();
    }
}

// renderer.js:1815-1825
generateMindmap() {
    const input = document.getElementById('outlineInput').value;
    const root = window.mindmapEngine.parseOutline(input);
    window.mindmapEngine.renderNodes(root);  // Sets this.nodes = root
}
```

### Relationship Drawing
```javascript
// mindmap-engine.js:410-494
drawConnections() {
    // ... draw hierarchy lines ...

    // Draw relationship connections (v5.0)
    if (window.mindmapRenderer && window.mindmapRenderer.activeRelationships) {
        const activeRels = Array.from(window.mindmapRenderer.activeRelationships);

        activeRels.forEach(relationshipId => {
            const relationship = relationships.find(r => r.id === relationshipId);

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
        });
    }
}
```

## 🛠️ Development Environment

**Required:**
- Node.js 18+
- Electron 27+
- macOS (target platform)

**Run Commands:**
```bash
npm start              # Start Electron app
npm test              # Run tests (not set up yet)
```

**File Watching:**
- Main process watches: `/Users/gonzaloriederer/Documents/PWC Mindmaps/`
- Auto-reloads on .pmap file changes

## 📝 PRD Requirements

Create a comprehensive Product Requirements Document covering:

1. **Bug Fixes**
   - Node counter accuracy
   - Data loading consistency
   - Panel refresh behavior

2. **Relationship System**
   - Complete workflow validation
   - UI/UX improvements
   - Error handling

3. **Code Quality**
   - Refactoring opportunities
   - Test coverage plan
   - Documentation updates

4. **Development Setup**
   - VS Code workspace configuration
   - Debugging tools
   - Build automation

## 🎬 Getting Started Instructions

### Step 1: Verify Current State
```bash
cd /Users/gonzaloriederer/Documents/GitHub/mindmap-macos-app
npm start
```
- App should open with Test-Relaciones-Vacio project
- Verify 3 nodes visible (Nodo A, B, C)
- Check relationship panel shows "130 nodos" (bug confirmed)

### Step 2: Set Up VS Code Workspace
1. Create `.vscode/` folder with configurations
2. Organize documentation in `/docs`
3. Set up task runners for Electron
4. Configure debugging

### Step 3: Fix Node Counter
1. Investigate crash from `projectData.nodeData` fix
2. Add debug logging to understand load flow
3. Test fix with empty project
4. Verify counter shows correct value

### Step 4: Test Relationships
1. Create new relationship: "depende de"
2. Assign to Node A and Node B
3. Verify line appears
4. Test toggling relationship visibility

### Step 5: Create PRD
1. Document all findings
2. List remaining issues
3. Propose solutions
4. Estimate effort

## 📚 Reference Documents

**In Repository:**
- `ARCHITECTURE.md` - System design
- `README-v5.0-DEVELOPMENT.md` - v5.0 changes
- `CONTRIBUTING.md` - Development guide
- `tasks/` - Historical task lists

**Key Insights:**
- v5.0 simplified relationships (no connection objects)
- Nodes store relationship IDs directly
- Drawing happens automatically when IDs match
- Panel shows active relationships as tags

## 🚨 Known Issues to Avoid

1. **Don't add console.log inside countProjectNodes()** - Causes syntax errors
2. **Don't trust localStorage data** - May be stale/corrupted
3. **Test in clean state** - Use Test-Relaciones-Vacio.pmap
4. **Fix causes crash** - `projectData.nodeData` issue needs investigation

## ✅ Success Criteria

**Bug Fix Complete When:**
- [ ] Node counter shows "4 nodos" for test project
- [ ] No crashes on app startup
- [ ] Counter updates correctly when switching projects
- [ ] All tests pass

**Workflow Complete When:**
- [ ] Can create relationship
- [ ] Can assign to nodes via edit modal
- [ ] Checkboxes stay checked
- [ ] Lines appear on canvas
- [ ] Lines respect color and dash pattern
- [ ] Can toggle relationship visibility

**VS Code Setup Complete When:**
- [ ] Workspace configured
- [ ] Debugging works
- [ ] Tasks run correctly
- [ ] Extensions recommended
- [ ] Documentation organized

---

## 📞 Handoff Notes

**Last Session:**
- Identified node counter bug root cause
- Attempted fix but caused crash (reverted)
- All debug logs removed for stability
- Checkbox fix successfully applied
- Empty test project created and ready

**Recommended Approach:**
1. Start with VS Code workspace setup (establishes foundation)
2. Create PRD before fixing bugs (plan before execution)
3. Fix node counter with proper investigation (understand crash)
4. Test relationships thoroughly (validate v5.0 implementation)
5. Document everything (maintain context for future sessions)

**Context Efficiency:**
- Reference this document instead of reading entire codebase
- Use specific line numbers provided
- Focus on identified issues
- Leverage existing test project

Good luck! 🚀
