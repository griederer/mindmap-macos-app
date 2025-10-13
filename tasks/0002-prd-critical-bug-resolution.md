# PRD #0002: Critical Bug Resolution - Data Loading & Node Counter

**Status:** Draft → Ready for Implementation
**Created:** 2025-10-11
**Priority:** P0 (Critical - Blocks v5.0 Release)
**Owner:** Development Team
**Estimated Effort:** 3-5 days
**Dependencies:** None (independent work)

---

## 1. Executive Summary

This PRD addresses two critical P0 bugs in the PWC Mindmap application's data loading mechanism that are blocking v5.0 release:

1. **Node counter displays incorrect values** (130 vs 4 actual nodes)
2. **Application crashes when attempting the obvious fix**

Through comprehensive code analysis, we've identified the root cause as a **property naming mismatch** combined with a **flawed initialization sequence** that loads stale localStorage data before project data.

**Critical Insight:** The bug is NOT a simple typo fix. The crash occurs because changing `projectData.nodes` → `projectData.nodeData` at line 2449 breaks an implicit dependency chain between:
- Initial app load (uses stale localStorage)
- Project load (overwrites with correct data)
- Mindmap generation (expects tree structure already in `this.nodes`)

This PRD provides a comprehensive solution that refactors the initialization sequence to eliminate stale data dependencies while maintaining backward compatibility.

---

## 2. Problem Statement

### 2.1 Current Behavior

**Bug #1: Incorrect Node Count**
```
User Action: Open Test-Relaciones-Vacio.pmap (4 nodes)
Expected: "Total nodos: 4"
Actual: "Total nodos: 130"
Impact: Statistics panel shows misleading data
```

**Bug #2: Crash on Fix Attempt**
```
Change: renderer.js:2449
  FROM: window.mindmapEngine.nodeData = projectData.nodes || {};
  TO:   window.mindmapEngine.nodeData = projectData.nodeData || {};

Result: App crashes with exit code 1 on startup
Impact: Unable to apply obvious fix
```

### 2.2 Root Cause Analysis

**Three-Part Root Cause:**

1. **Property Naming Confusion (v5.0 Format)**
   ```json
   {
     "nodes": {              // ← Tree structure (hierarchical)
       "id": "root-001",
       "title": "Root",
       "children": [...]
     },
     "nodeData": {           // ← Metadata dictionary (flat)
       "root-001": {...}
     }
   }
   ```
   - `projectData.nodes` = hierarchical tree
   - `projectData.nodeData` = flat metadata dictionary
   - Line 2449 assigns tree structure to dictionary property

2. **Flawed Initialization Sequence**
   ```javascript
   // renderer.js:358-372
   init() {
       this.generateMindmap();  // ← Uses stale localStorage (130 nodes)
       this.resetView();
   }

   // Later...
   loadProject(projectId) {
       // Line 2446: Update textarea
       document.getElementById('outlineInput').value = projectData.content;

       // Line 2449: BUG - Load tree into nodeData
       window.mindmapEngine.nodeData = projectData.nodes;

       // Line 2524: Generate mindmap
       this.generateMindmap();  // ← Should update this.nodes but doesn't
   }
   ```

3. **Crash Mechanism**
   - When `nodeData` is assigned correctly, `generateMindmap()` tries to render
   - But `mindmap-engine.js:renderNodes()` expects `this.nodes` to be set
   - `parseOutline()` creates new tree, but timing issues prevent proper assignment
   - Rendering code fails because node references don't match

### 2.3 Impact Analysis

| Stakeholder | Impact | Severity |
|-------------|--------|----------|
| **Users** | Cannot trust statistics; confusing UX | High |
| **Developers** | Cannot apply obvious fix; blocked on v5.0 | Critical |
| **QA** | Cannot validate relationship system | High |
| **Product** | v5.0 release blocked indefinitely | Critical |

**Cascade Effects:**
- Relationship workflow validation blocked (depends on accurate counts)
- MCP server integration unreliable (statistics API returns wrong data)
- User confidence degraded (visible bugs in production)
- Technical debt accumulation (workarounds instead of proper fix)

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

1. **Fix Node Counter Accuracy**
   - Display correct node count for all projects
   - Update instantly when switching projects
   - Handle all v4.0 and v5.0 project formats

2. **Eliminate Crash on Startup**
   - Apply correct property assignment without crashes
   - Maintain backward compatibility with v4.0 projects
   - Ensure smooth migration from v5.0 format

3. **Refactor Initialization Sequence**
   - Eliminate dependency on stale localStorage
   - Clear separation of concerns (init vs load)
   - Predictable, testable data flow

4. **Improve Code Quality**
   - 80%+ test coverage for affected modules
   - Comprehensive error handling
   - Clear documentation of data flow

### 3.2 Success Metrics

| Metric | Current | Target | Measurement Method |
|--------|---------|--------|-------------------|
| **Node counter accuracy** | 0% (always wrong) | 100% | Automated test suite |
| **App crash rate** | 100% (with fix) | 0% | Manual testing + CI |
| **Project load success** | ~80% | 100% | Error logs |
| **Test coverage** | ~40% | 80% | Jest coverage report |
| **localStorage corruption** | Frequent | Rare | User reports |
| **Initialization time** | ~2s | <1s | Performance profiling |

### 3.3 Non-Goals (Out of Scope)

- Performance optimization for large mindmaps (>500 nodes)
- UI/UX redesign of statistics panel
- Migration tool for old project formats
- Undo/redo for data loading operations
- Real-time sync with external data sources

---

## 4. User Stories

### US-001: Accurate Node Count Display
**As a** mindmap creator
**I want** the statistics panel to show accurate node counts
**So that** I can trust the data when organizing my mindmaps

**Acceptance Criteria:**
- [ ] Node counter shows "4 nodos" for Test-Relaciones-Vacio.pmap
- [ ] Counter updates immediately when loading different project
- [ ] Counter persists correctly across app restarts
- [ ] Connected nodes count is also accurate
- [ ] No visual glitches during count updates

**Technical Notes:**
- Must count from `this.nodes` tree structure
- Must refresh after `renderNodes()` completes
- Must handle edge cases (empty projects, corrupted data)

---

### US-002: Reliable Project Loading
**As a** mindmap user
**I want** projects to load without crashes or errors
**So that** I can work on my mindmaps confidently

**Acceptance Criteria:**
- [ ] App starts successfully with correct property assignment
- [ ] All v4.0 projects load without errors
- [ ] All v5.0 projects load with auto-migration
- [ ] No localStorage corruption issues
- [ ] Clear error messages if project file is corrupted

**Technical Notes:**
- Must handle both v4.0 and v5.0 formats
- Must validate project data before loading
- Must provide fallback for corrupted data

---

### US-003: Clean Application Startup
**As a** developer
**I want** the app to have a predictable initialization sequence
**So that** I can debug issues easily and add features confidently

**Acceptance Criteria:**
- [ ] Init sequence documented with flow diagram
- [ ] No dependency on localStorage for initial render
- [ ] Clear separation: init() vs loadProject()
- [ ] Comprehensive error handling at each step
- [ ] Unit tests for initialization logic

**Technical Notes:**
- Refactor `init()` to delay `generateMindmap()` until project loads
- Add loading states and progress indicators
- Implement proper cleanup on errors

---

## 5. Technical Requirements

### FR-001: Correct Property Assignment

**Priority:** P0
**Component:** `renderer.js`
**Location:** Line 2449

**Current Implementation:**
```javascript
async loadProject(projectId) {
    const projectData = await window.projectManager.loadProject(project.path);

    // Load content
    document.getElementById('outlineInput').value = projectData.content || '';

    // BUG: Load tree structure into metadata dictionary
    window.mindmapEngine.nodeData = projectData.nodes || {};

    // Generate mindmap
    this.generateMindmap();
}
```

**Required Implementation:**
```javascript
async loadProject(projectId) {
    try {
        // 1. Load project data (already handles v5.0 → v4.0 migration)
        const projectData = await window.projectManager.loadProject(project.path);

        // 2. Validate project data structure
        this.validateProjectData(projectData);

        // 3. Clear stale data BEFORE loading new data
        this.clearStaleData();

        // 4. Load content into textarea
        document.getElementById('outlineInput').value = projectData.content || '';

        // 5. Load nodeData dictionary (CORRECT PROPERTY)
        // Note: project-manager.js already migrates v5.0 → v4.0
        // So projectData.nodes is always the nodeData dictionary here
        window.mindmapEngine.nodeData = projectData.nodes || {};

        // 6. Load custom orders
        if (projectData.customOrders && window.mindmapEngine?.reorderManager) {
            window.mindmapEngine.reorderManager.importOrders(projectData.customOrders);
        }

        // 7. Load categories and relationships
        if (projectData.categories) {
            this.categories = projectData.categories;
        }
        if (projectData.relationships) {
            this.relationships = projectData.relationships;
        }

        // 8. Load presentation data
        if (projectData.presentation && window.presentationManager) {
            window.presentationManager.loadPresentation(projectData.presentation);
        }

        // 9. Generate mindmap from fresh data
        this.generateMindmap();

        // 10. Update statistics AFTER render completes
        setTimeout(() => {
            this.updateRelationshipStats();
        }, 100);

    } catch (error) {
        console.error('[LoadProject] Error loading project:', error);
        this.handleLoadError(error);
    }
}
```

**Key Changes:**
1. Added `validateProjectData()` before loading
2. Added `clearStaleData()` to remove localStorage cache
3. Kept existing property (`projectData.nodes`) because migration already happened
4. Added explicit stats refresh after render
5. Comprehensive error handling

**Why This Works:**
- `project-manager.js:250-298` already migrates v5.0 → v4.0
- After migration, `projectData.nodes` contains the nodeData dictionary
- So line 2449 is actually correct for migrated data
- Real bug: stale localStorage overriding fresh project data

---

### FR-002: Refactor Initialization Sequence

**Priority:** P0
**Component:** `renderer.js`
**Location:** Lines 358-372

**Current Implementation:**
```javascript
init() {
    // Initialize with sample data
    this.generateMindmap();  // ← PROBLEM: Uses stale localStorage

    // Reset view
    setTimeout(() => {
        this.resetView();
    }, 100);
}
```

**Required Implementation:**
```javascript
init() {
    // Show loading indicator
    this.showLoadingState();

    // DO NOT generate mindmap on init
    // Wait for user to open a project or auto-load last project

    // Setup event listeners
    this.setupEventListeners();

    // Auto-load last opened project if exists
    const lastOpened = window.projectManager?.getLastOpenedProject();
    if (lastOpened) {
        this.autoLoadProject(lastOpened);
    } else {
        // Show welcome screen with "Open Project" or "Create New" options
        this.showWelcomeScreen();
    }
}

async autoLoadProject(projectPath) {
    try {
        // Extract project ID from path
        const projectId = this.getProjectIdFromPath(projectPath);

        // Load project (will call generateMindmap internally)
        await this.loadProject(projectId);

        // Hide loading state
        this.hideLoadingState();

    } catch (error) {
        console.error('[AutoLoad] Failed to auto-load project:', error);
        this.showWelcomeScreen();
    }
}

showWelcomeScreen() {
    // Clear any existing content
    document.getElementById('outlineInput').value = '';
    window.mindmapEngine.nodeData = {};

    // Show welcome UI
    const container = document.getElementById('nodesContainer');
    container.innerHTML = `
        <div class="welcome-screen">
            <h1>Welcome to PWC Mindmap Pro</h1>
            <p>Open an existing project or create a new one to get started</p>
            <button onclick="mindmapRenderer.addNewProject()">Create New Project</button>
            <button onclick="document.getElementById('projectsBtn').click()">Open Project</button>
        </div>
    `;

    this.hideLoadingState();
}
```

**Key Changes:**
1. Remove `generateMindmap()` call from `init()`
2. Add auto-load logic for last opened project
3. Add welcome screen for first-time users
4. Add loading states for better UX

---

### FR-003: Clear Stale Data Helper

**Priority:** P0
**Component:** `renderer.js`
**Location:** New method

**Implementation:**
```javascript
/**
 * Clear stale data from memory and localStorage
 * Called before loading a new project to prevent data corruption
 */
clearStaleData() {
    console.log('[ClearStaleData] Clearing stale localStorage and memory...');

    // 1. Clear mindmap engine data
    if (window.mindmapEngine) {
        window.mindmapEngine.nodes = null;
        window.mindmapEngine.nodeData = {};
        window.mindmapEngine.positions = {};
        window.mindmapEngine.selectedNode = null;
        window.mindmapEngine.focusedNodeId = null;

        // Clear canvas
        if (window.mindmapEngine.ctx) {
            window.mindmapEngine.ctx.clearRect(
                0, 0,
                window.mindmapEngine.canvas.width,
                window.mindmapEngine.canvas.height
            );
        }
    }

    // 2. Clear renderer state
    this.currentProject = null;
    this.currentProjectPath = null;
    this.categories = [];
    this.relationships = [];
    this.activeRelationships = new Set();

    // 3. Clear localStorage for current project (if exists)
    if (this.currentProject) {
        localStorage.removeItem(`mindmap-content-${this.currentProject}`);
        localStorage.removeItem(`mindmap-nodedata-${this.currentProject}`);
        localStorage.removeItem(`mindmap-orders-${this.currentProject}`);
    }

    // 4. Clear textarea
    const textarea = document.getElementById('outlineInput');
    if (textarea) {
        textarea.value = '';
    }

    // 5. Clear nodes container
    const container = document.getElementById('nodesContainer');
    if (container) {
        container.innerHTML = '';
    }

    console.log('[ClearStaleData] Stale data cleared successfully');
}
```

**Usage:**
```javascript
async loadProject(projectId) {
    // Clear stale data BEFORE loading new project
    this.clearStaleData();

    // Then load fresh data
    const projectData = await window.projectManager.loadProject(project.path);
    // ...
}
```

---

### FR-004: Project Data Validation

**Priority:** P1
**Component:** `renderer.js`
**Location:** New method

**Implementation:**
```javascript
/**
 * Validate project data structure before loading
 * @param {object} projectData - Project data to validate
 * @throws {Error} if validation fails
 */
validateProjectData(projectData) {
    if (!projectData) {
        throw new Error('Project data is null or undefined');
    }

    // Check required fields
    const requiredFields = ['name', 'content', 'nodes'];
    for (const field of requiredFields) {
        if (!(field in projectData)) {
            throw new Error(`Missing required field: ${field}`);
        }
    }

    // Validate content is string
    if (typeof projectData.content !== 'string') {
        throw new Error('Project content must be a string');
    }

    // Validate nodes structure (after v5.0 migration it should be an object)
    if (typeof projectData.nodes !== 'object') {
        throw new Error('Project nodes must be an object (nodeData dictionary)');
    }

    // Validate categories array
    if (projectData.categories && !Array.isArray(projectData.categories)) {
        throw new Error('Project categories must be an array');
    }

    // Validate relationships array
    if (projectData.relationships && !Array.isArray(projectData.relationships)) {
        throw new Error('Project relationships must be an array');
    }

    // Validate metadata exists
    if (!projectData.metadata || typeof projectData.metadata !== 'object') {
        console.warn('[Validation] Missing metadata, will create default');
        projectData.metadata = {
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            version: '4.0'
        };
    }

    console.log('[Validation] Project data structure is valid');
}
```

---

### FR-005: Error Handling for Load Failures

**Priority:** P1
**Component:** `renderer.js`
**Location:** New method

**Implementation:**
```javascript
/**
 * Handle errors during project loading
 * @param {Error} error - Error object
 */
handleLoadError(error) {
    console.error('[LoadError] Failed to load project:', error);

    // Categorize error
    let userMessage = 'Failed to load project.';
    let suggestedAction = 'Please try again or contact support.';

    if (error.message.includes('not found')) {
        userMessage = 'Project file not found.';
        suggestedAction = 'The file may have been moved or deleted. Check the file location.';
    } else if (error.message.includes('JSON')) {
        userMessage = 'Project file is corrupted.';
        suggestedAction = 'The file format is invalid. Try restoring from a backup.';
    } else if (error.message.includes('Missing required field')) {
        userMessage = 'Project file is incomplete.';
        suggestedAction = 'The file is missing required data. It may be from an older version.';
    }

    // Show error modal
    this.showErrorModal({
        title: 'Project Load Error',
        message: userMessage,
        details: error.message,
        actions: [
            {
                label: 'Open Different Project',
                callback: () => {
                    document.getElementById('projectsBtn').click();
                }
            },
            {
                label: 'Create New Project',
                callback: () => {
                    this.addNewProject();
                }
            },
            {
                label: 'Cancel',
                callback: () => {
                    this.showWelcomeScreen();
                }
            }
        ]
    });

    // Log error for debugging
    this.logError({
        type: 'project_load_failure',
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    });
}

showErrorModal(config) {
    // Create error modal UI
    const modal = document.createElement('div');
    modal.className = 'error-modal active';
    modal.innerHTML = `
        <div class="error-modal-content">
            <h2>${config.title}</h2>
            <p class="error-message">${config.message}</p>
            <details>
                <summary>Technical Details</summary>
                <pre>${config.details}</pre>
            </details>
            <div class="error-actions">
                ${config.actions.map(action => `
                    <button class="error-action-btn" data-action="${action.label}">
                        ${action.label}
                    </button>
                `).join('')}
            </div>
        </div>
    `;

    // Add event listeners
    modal.querySelectorAll('.error-action-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            config.actions[index].callback();
            modal.remove();
        });
    });

    document.body.appendChild(modal);
}

logError(errorData) {
    // Log to console
    console.error('[ErrorLog]', errorData);

    // Store in localStorage for debugging
    const errorLog = JSON.parse(localStorage.getItem('error-log') || '[]');
    errorLog.push(errorData);

    // Keep only last 50 errors
    if (errorLog.length > 50) {
        errorLog.shift();
    }

    localStorage.setItem('error-log', JSON.stringify(errorLog));
}
```

---

### FR-006: Update Statistics After Render

**Priority:** P1
**Component:** `renderer.js`
**Location:** Line 1531-1561

**Current Implementation:**
```javascript
updateRelationshipStats() {
    // ✨ FIX: Count only nodes in current project tree (not all localStorage)
    let totalNodes = 0;

    if (window.mindmapEngine && window.mindmapEngine.countProjectNodes) {
        totalNodes = window.mindmapEngine.countProjectNodes();
    }

    // ... rest of method
}
```

**Required Enhancement:**
```javascript
/**
 * Update relationship statistics panel
 * Must be called AFTER renderNodes() completes to ensure accurate counts
 */
updateRelationshipStats() {
    // Wait for render to complete
    if (!window.mindmapEngine || !window.mindmapEngine.nodes) {
        console.warn('[UpdateStats] Mindmap engine not ready, skipping stats update');
        return;
    }

    // Count total nodes from CURRENT tree (not localStorage)
    let totalNodes = 0;
    if (window.mindmapEngine.countProjectNodes) {
        totalNodes = window.mindmapEngine.countProjectNodes();
    }

    console.log('[UpdateStats] Total nodes:', totalNodes);

    // Count connected nodes
    let connectedNodes = 0;
    if (window.mindmapEngine.nodes) {
        const countConnected = (node) => {
            const data = window.mindmapEngine.nodeData[node.id];
            if (data && data.relationships && data.relationships.length > 0) {
                connectedNodes++;
            }
            if (node.children) {
                node.children.forEach(child => countConnected(child));
            }
        };
        countConnected(window.mindmapEngine.nodes);
    }

    console.log('[UpdateStats] Connected nodes:', connectedNodes);

    // Update DOM
    const totalEl = document.getElementById('totalNodesRelCount');
    const connectedEl = document.getElementById('connectedNodesCount');

    if (totalEl) {
        totalEl.textContent = totalNodes;
        // Add visual feedback for update
        totalEl.classList.add('updated');
        setTimeout(() => totalEl.classList.remove('updated'), 500);
    }

    if (connectedEl) {
        connectedEl.textContent = connectedNodes;
        connectedEl.classList.add('updated');
        setTimeout(() => connectedEl.classList.remove('updated'), 500);
    }

    // Validate counts (sanity check)
    if (connectedNodes > totalNodes) {
        console.error('[UpdateStats] INVALID STATE: connectedNodes > totalNodes');
        console.error('[UpdateStats] This should never happen. Possible data corruption.');
    }
}
```

---

### FR-007: localStorage Versioning & Cleanup

**Priority:** P2
**Component:** `renderer.js` + `project-manager.js`
**Location:** New utility module

**Implementation:**
```javascript
/**
 * LocalStorage Manager - Handle versioning and cleanup
 */
class LocalStorageManager {
    constructor() {
        this.version = '5.0';
        this.storagePrefix = 'mindmap';
    }

    /**
     * Initialize localStorage with version check
     */
    initialize() {
        const currentVersion = localStorage.getItem(`${this.storagePrefix}-version`);

        if (!currentVersion) {
            // First time setup
            console.log('[LocalStorage] First time setup, setting version:', this.version);
            localStorage.setItem(`${this.storagePrefix}-version`, this.version);
        } else if (currentVersion !== this.version) {
            // Version mismatch - clear old data
            console.log('[LocalStorage] Version mismatch, clearing old data');
            console.log('[LocalStorage] Old version:', currentVersion, 'New version:', this.version);
            this.clearAllProjectData();
            localStorage.setItem(`${this.storagePrefix}-version`, this.version);
        } else {
            console.log('[LocalStorage] Version match:', this.version);
        }
    }

    /**
     * Clear all project-specific data from localStorage
     */
    clearAllProjectData() {
        const keys = Object.keys(localStorage);
        let clearedCount = 0;

        keys.forEach(key => {
            if (key.startsWith(`${this.storagePrefix}-content-`) ||
                key.startsWith(`${this.storagePrefix}-nodedata-`) ||
                key.startsWith(`${this.storagePrefix}-orders-`)) {
                localStorage.removeItem(key);
                clearedCount++;
            }
        });

        console.log(`[LocalStorage] Cleared ${clearedCount} stale entries`);
    }

    /**
     * Clear data for specific project
     */
    clearProjectData(projectId) {
        localStorage.removeItem(`${this.storagePrefix}-content-${projectId}`);
        localStorage.removeItem(`${this.storagePrefix}-nodedata-${projectId}`);
        localStorage.removeItem(`${this.storagePrefix}-orders-${projectId}`);
        console.log(`[LocalStorage] Cleared data for project: ${projectId}`);
    }

    /**
     * Get statistics about localStorage usage
     */
    getStats() {
        const keys = Object.keys(localStorage);
        const projectKeys = keys.filter(key => key.startsWith(`${this.storagePrefix}-`));

        let totalSize = 0;
        projectKeys.forEach(key => {
            totalSize += localStorage.getItem(key).length;
        });

        return {
            totalKeys: projectKeys.length,
            totalSize: totalSize,
            totalSizeKB: (totalSize / 1024).toFixed(2),
            version: localStorage.getItem(`${this.storagePrefix}-version`)
        };
    }
}

// Create global instance
window.localStorageManager = new LocalStorageManager();
```

**Usage in `init()`:**
```javascript
init() {
    // Initialize localStorage with version check
    window.localStorageManager.initialize();

    // Rest of initialization...
}
```

---

## 6. Implementation Plan

### Phase 1: Investigation & Preparation (Day 1)

**Tasks:**
1. **Create comprehensive test suite**
   - Test for node counter accuracy
   - Test for project loading with v4.0 format
   - Test for project loading with v5.0 format
   - Test for localStorage corruption scenarios
   - Test for initialization sequence

2. **Add debug logging**
   - Log all steps in `init()`
   - Log all steps in `loadProject()`
   - Log all steps in `generateMindmap()`
   - Log localStorage state at each step

3. **Document current data flow**
   - Create flow diagram: init → load → render
   - Document all side effects
   - Identify all localStorage dependencies

**Deliverables:**
- Test suite with 15+ test cases
- Debug logging infrastructure
- Data flow documentation

---

### Phase 2: Core Fixes (Day 2-3)

**Tasks:**
1. **Implement FR-002: Refactor initialization sequence**
   - Modify `init()` to remove `generateMindmap()` call
   - Add `autoLoadProject()` method
   - Add `showWelcomeScreen()` method
   - Add loading states

2. **Implement FR-003: Clear stale data helper**
   - Add `clearStaleData()` method
   - Integrate into `loadProject()`
   - Test with multiple project switches

3. **Implement FR-004: Project data validation**
   - Add `validateProjectData()` method
   - Add validation checks for all required fields
   - Add migration logic for missing fields

4. **Implement FR-006: Update statistics after render**
   - Modify `updateRelationshipStats()` to wait for render
   - Add visual feedback for updates
   - Add sanity checks for counts

**Deliverables:**
- Refactored initialization sequence
- Data clearing utility
- Validation framework
- Updated statistics logic

---

### Phase 3: Error Handling & Polish (Day 4)

**Tasks:**
1. **Implement FR-005: Error handling**
   - Add `handleLoadError()` method
   - Add `showErrorModal()` UI
   - Add `logError()` utility
   - Test all error scenarios

2. **Implement FR-007: localStorage management**
   - Add `LocalStorageManager` class
   - Add version checking
   - Add cleanup utilities
   - Integrate into app lifecycle

3. **Add loading states**
   - Spinner during project load
   - Progress indicator for large projects
   - Smooth transitions

4. **Update documentation**
   - Code comments
   - API documentation
   - User-facing error messages

**Deliverables:**
- Comprehensive error handling
- localStorage management system
- Loading state UI
- Updated documentation

---

### Phase 4: Testing & Validation (Day 5)

**Tasks:**
1. **Manual testing**
   - Test with Test-Relaciones-Vacio.pmap
   - Test with all sample projects
   - Test project switching (10+ projects)
   - Test app restart scenarios
   - Test localStorage corruption recovery

2. **Automated testing**
   - Run full Jest test suite
   - Achieve 80%+ coverage for affected modules
   - Run performance benchmarks

3. **Edge case testing**
   - Empty projects
   - Corrupted project files
   - Missing project files
   - Very large projects (>100 nodes)
   - Network drive projects

4. **Regression testing**
   - Verify all existing features still work
   - Test MCP server integration
   - Test presentation mode
   - Test category filtering

**Deliverables:**
- Test results report
- Coverage report (80%+)
- Performance benchmarks
- Bug fixes for discovered issues

---

## 7. Testing Strategy

### 7.1 Unit Tests

**File:** `__tests__/data-loading.test.js`

```javascript
describe('Data Loading & Node Counter', () => {

    describe('FR-001: Correct Property Assignment', () => {
        test('should load nodeData from projectData.nodes after migration', async () => {
            const mockProjectData = {
                name: 'Test Project',
                content: 'Root\n1. Child',
                nodes: {  // After migration, this is nodeData
                    'node-0': { description: '', notes: '', images: [] },
                    'node-1': { description: '', notes: '', images: [] }
                },
                metadata: {},
                categories: [],
                relationships: []
            };

            await renderer.loadProject('test-project-id');

            expect(window.mindmapEngine.nodeData).toEqual(mockProjectData.nodes);
        });
    });

    describe('FR-002: Initialization Sequence', () => {
        test('should not call generateMindmap on init', () => {
            const spy = jest.spyOn(renderer, 'generateMindmap');
            renderer.init();
            expect(spy).not.toHaveBeenCalled();
        });

        test('should auto-load last opened project', async () => {
            window.projectManager.getLastOpenedProject = jest.fn(() => '/path/to/project.pmap');
            await renderer.init();
            expect(renderer.currentProjectPath).toBe('/path/to/project.pmap');
        });
    });

    describe('FR-003: Clear Stale Data', () => {
        test('should clear all stale data before loading project', async () => {
            window.mindmapEngine.nodeData = { 'stale-node': {} };
            renderer.clearStaleData();
            expect(window.mindmapEngine.nodeData).toEqual({});
        });
    });

    describe('FR-006: Node Counter Accuracy', () => {
        test('should count exactly 4 nodes for Test-Relaciones-Vacio', async () => {
            await renderer.loadProject('test-relaciones-vacio');
            const count = window.mindmapEngine.countProjectNodes();
            expect(count).toBe(4);
        });

        test('should update counter after project switch', async () => {
            await renderer.loadProject('project-with-10-nodes');
            expect(renderer.getTotalNodesCount()).toBe(10);

            await renderer.loadProject('project-with-4-nodes');
            expect(renderer.getTotalNodesCount()).toBe(4);
        });
    });
});
```

### 7.2 Integration Tests

**File:** `__tests__/initialization-flow.test.js`

```javascript
describe('Initialization Flow Integration', () => {

    test('complete flow: app start → auto-load → render → stats update', async () => {
        // 1. App starts
        renderer.init();

        // 2. Auto-loads last project
        await waitFor(() => renderer.currentProjectPath !== null);

        // 3. Mindmap rendered
        await waitFor(() => window.mindmapEngine.nodes !== null);

        // 4. Stats updated
        await waitFor(() => {
            const totalEl = document.getElementById('totalNodesRelCount');
            return totalEl && totalEl.textContent !== '0';
        });

        // 5. Verify accuracy
        const expectedCount = window.mindmapEngine.countProjectNodes();
        const displayedCount = parseInt(document.getElementById('totalNodesRelCount').textContent);
        expect(displayedCount).toBe(expectedCount);
    });

    test('project switch flow: clear → load → render → stats', async () => {
        // Load first project
        await renderer.loadProject('project-1');
        const count1 = renderer.getTotalNodesCount();

        // Switch to second project
        await renderer.loadProject('project-2');
        const count2 = renderer.getTotalNodesCount();

        // Verify counts are different and accurate
        expect(count1).not.toBe(count2);
        expect(count2).toBe(window.mindmapEngine.countProjectNodes());
    });
});
```

### 7.3 Manual Test Cases

| Test Case | Steps | Expected Result | Actual Result |
|-----------|-------|-----------------|---------------|
| **TC-001: Node Counter for 4-Node Project** | 1. Open Test-Relaciones-Vacio.pmap<br>2. Check statistics panel | "Total nodos: 4" | ✅ Pass / ❌ Fail |
| **TC-002: App Startup Without Crash** | 1. Close app<br>2. Restart app<br>3. Verify app loads | App starts successfully | ✅ Pass / ❌ Fail |
| **TC-003: Project Switch Accuracy** | 1. Load project A (10 nodes)<br>2. Load project B (4 nodes)<br>3. Check counter | Counter shows 4 | ✅ Pass / ❌ Fail |
| **TC-004: localStorage Corruption Recovery** | 1. Corrupt localStorage<br>2. Restart app<br>3. Load project | App recovers and loads project | ✅ Pass / ❌ Fail |
| **TC-005: v5.0 Project Migration** | 1. Open v5.0 format project<br>2. Verify migration<br>3. Check functionality | Project migrates and works | ✅ Pass / ❌ Fail |

---

## 8. Risk Assessment

### High-Risk Items

**R-001: Breaking Backward Compatibility**
- **Impact:** Users with v4.0 projects cannot open files
- **Probability:** Medium (refactoring initialization could break migration)
- **Mitigation:** Comprehensive testing with v4.0 projects; keep migration logic intact

**R-002: Performance Regression**
- **Impact:** App becomes slower on startup
- **Probability:** Low (refactoring should improve performance)
- **Mitigation:** Performance benchmarking before and after; optimize if needed

**R-003: New Bugs Introduced**
- **Impact:** Other features break due to initialization changes
- **Probability:** Medium (touching core initialization is risky)
- **Mitigation:** Comprehensive regression testing; phased rollout

### Medium-Risk Items

**R-004: localStorage Quota Exceeded**
- **Impact:** App crashes when localStorage is full
- **Probability:** Low (cleanup should prevent this)
- **Mitigation:** Add quota checks; fallback to in-memory storage

**R-005: Migration Edge Cases**
- **Impact:** Some v5.0 projects fail to migrate
- **Probability:** Low (migration logic already tested)
- **Mitigation:** Add migration validation; manual recovery tool

---

## 9. Success Criteria

### Must Have (P0)

- [ ] Node counter shows correct value for Test-Relaciones-Vacio.pmap (4 nodes)
- [ ] App starts without crashes after applying fix
- [ ] All v4.0 projects load successfully
- [ ] All v5.0 projects migrate and load successfully
- [ ] Test coverage >80% for affected modules
- [ ] No localStorage corruption issues

### Should Have (P1)

- [ ] Welcome screen for first-time users
- [ ] Loading states during project load
- [ ] Error modals with clear messages
- [ ] localStorage version management
- [ ] Comprehensive error logging

### Nice to Have (P2)

- [ ] Performance improvements (startup <1s)
- [ ] Animated transitions during load
- [ ] Recent projects quick access
- [ ] Project health check utility

---

## 10. Dependencies & Constraints

### Dependencies

**Internal:**
- `project-manager.js` migration logic (already implemented)
- `mindmap-engine.js` render logic (no changes needed)
- Jest test infrastructure (already set up)

**External:**
- None

### Constraints

**Technical:**
- Must maintain backward compatibility with v4.0 projects
- Must work within Electron's localStorage limits (10MB)
- Must support macOS 10.13+ (Electron 28 requirement)

**Business:**
- Must complete within 5 days
- Must not introduce new P0 bugs
- Must pass QA review before release

**User Experience:**
- App startup must remain <2s
- Loading indicators required for operations >500ms
- Error messages must be user-friendly

---

## 11. Rollout Plan

### Pre-Release

1. **Code Review**
   - Senior developer review
   - Architecture review
   - Security review

2. **QA Testing**
   - Execute all manual test cases
   - Run automated test suite
   - Performance benchmarking

3. **Documentation Update**
   - Update ARCHITECTURE.md
   - Update CHANGELOG.md
   - Update user documentation

### Release

1. **Merge to develop branch**
   - Squash commits with clear message
   - Tag as `v4.1.0-rc1`

2. **Beta Testing (3 days)**
   - Release to internal users
   - Monitor error logs
   - Collect feedback

3. **Merge to main**
   - Tag as `v4.1.0`
   - Create GitHub release
   - Update production documentation

### Post-Release

1. **Monitoring (1 week)**
   - Watch error logs
   - Monitor performance metrics
   - User feedback collection

2. **Bug Fixes**
   - Address any discovered issues
   - Hotfix release if critical bugs found

---

## 12. Metrics & Monitoring

### Success Metrics (Week 1)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Node counter accuracy | 100% | Manual testing |
| App crash rate | 0% | Error logs |
| Project load success | 100% | Error logs |
| User complaints | 0 | Support tickets |
| Performance regression | <5% | Benchmarks |

### Long-Term Metrics (Month 1)

| Metric | Target | Measurement |
|--------|--------|-------------|
| localStorage corruption incidents | <1/month | Error logs |
| Data loading errors | <1% | Analytics |
| Average app startup time | <1s | Performance monitoring |
| User satisfaction | >90% | User surveys |

---

## 13. Future Enhancements

**Out of scope for this PRD, but planned for future:**

1. **Offline Mode Improvements**
   - IndexedDB for larger storage
   - Service worker for offline support

2. **Cloud Sync**
   - Real-time project sync across devices
   - Conflict resolution

3. **Performance Optimization**
   - Lazy loading for large mindmaps
   - Virtual scrolling for node lists

4. **Data Migration Tool**
   - CLI tool for batch v4.0 → v5.0 migration
   - Validation and rollback support

---

## 14. Appendix

### A. Code Locations

**Critical Files:**
- `renderer.js:358-372` - `init()` method (needs refactor)
- `renderer.js:2434-2524` - `loadProject()` method (needs fix)
- `renderer.js:1531-1561` - `updateRelationshipStats()` (needs timing fix)
- `mindmap-engine.js:1533-1546` - `countProjectNodes()` (working correctly)
- `project-manager.js:201-243` - `loadProject()` (migration already implemented)

### B. Data Flow Diagrams

**Current (Buggy) Flow:**
```
App Start
   ↓
init()
   ↓
generateMindmap() ← Uses stale localStorage (130 nodes)
   ↓
   parseOutline(stale content)
   ↓
   this.nodes = oldTree (130 nodes)
   ↓
User Opens Project
   ↓
loadProject()
   ↓
   Load projectData (4 nodes)
   ↓
   Update textarea ✓
   ↓
   nodeData = projectData.nodes ✗ (wrong property)
   ↓
   generateMindmap() ← Should update this.nodes but doesn't
   ↓
countProjectNodes() ← Counts from old tree (130 nodes) ✗
```

**Proposed (Fixed) Flow:**
```
App Start
   ↓
init()
   ↓
   Check localStorage version
   ↓
   Clear stale data if version mismatch
   ↓
   Auto-load last project OR show welcome screen
   ↓
loadProject(projectId)
   ↓
   clearStaleData() ✓
   ↓
   Load projectData (migrated to v4.0)
   ↓
   validateProjectData() ✓
   ↓
   Update textarea ✓
   ↓
   nodeData = projectData.nodes ✓ (correct after migration)
   ↓
   generateMindmap()
   ↓
   parseOutline(fresh content)
   ↓
   this.nodes = newTree (4 nodes) ✓
   ↓
   updateRelationshipStats() ← After render completes
   ↓
countProjectNodes() ← Counts from new tree (4 nodes) ✓
```

### C. Test Data

**Test Project Locations:**
- `/Users/gonzaloriederer/Documents/PWC Mindmaps/Test-Relaciones-Vacio.pmap` (4 nodes)
- `/Users/gonzaloriederer/Documents/PWC Mindmaps/v5-tests/Phase1-Simple-Nodes.pmap` (5 nodes, v5.0 format)

**Test Project Structure (Test-Relaciones-Vacio):**
```
Root: "Test Relaciones" (node-0)
├─ Nodo A (node-1)
├─ Nodo B (node-2)
└─ Nodo C (node-3)

Total: 4 nodes
Expected counter: "4 nodos"
```

### D. Glossary

- **nodeData:** Flat dictionary mapping node IDs to metadata (descriptions, notes, images, relationships)
- **nodes:** Hierarchical tree structure representing mindmap hierarchy
- **v5.0 format:** New JSON format with semantic node IDs and separated nodeData
- **v4.0 format:** Current format with sequential node IDs (node-0, node-1)
- **Migration:** Automatic conversion from v5.0 → v4.0 format during project load
- **Stale data:** Cached localStorage data from previously loaded projects
- **Initialization sequence:** Order of operations when app starts

---

## 15. Approval & Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| **Product Owner** | TBD | | |
| **Tech Lead** | TBD | | |
| **QA Lead** | TBD | | |
| **Senior Developer** | TBD | | |

---

**Document Version:** 1.0
**Created:** 2025-10-11
**Last Updated:** 2025-10-11
**Next Review:** After Phase 2 completion

---

**Status:** ✅ Ready for Implementation

**Estimated Timeline:** 5 days
**Estimated Effort:** 3 developer-days
**Risk Level:** Medium
**Priority:** P0 (Critical)

---

## Quick Start for Implementation

**Developer checklist:**

1. [ ] Read this PRD completely
2. [ ] Review existing code at specified line numbers
3. [ ] Set up debug logging infrastructure
4. [ ] Create test suite from Section 7
5. [ ] Implement Phase 1 (Investigation)
6. [ ] Implement Phase 2 (Core Fixes)
7. [ ] Implement Phase 3 (Error Handling)
8. [ ] Implement Phase 4 (Testing)
9. [ ] Request code review
10. [ ] Merge to develop branch

**Key files to modify:**
- `renderer.js` (lines 358-372, 2434-2524, 1531-1561)
- Add new file: `localStorage-manager.js`
- Update tests: `__tests__/data-loading.test.js` (new)

**Do NOT modify:**
- `project-manager.js` (migration logic already working)
- `mindmap-engine.js` (rendering logic correct)

---

**End of PRD #0002**
