# Task Breakdown: Info Panel Image Display Fix

## Task Progress
Total: 12 | Completed: 0 | In Progress: 0 | Remaining: 12

## High-Level Tasks

- [ ] 1.0 Extract info panel generation into reusable method
  - [ ] 1.1 Create `updateInfoPanel(nodeId)` method in MindmapEngine class
  - [ ] 1.2 Move HTML generation logic from `renderNodes()` to new method
  - [ ] 1.3 Test method generates correct HTML for all data combinations

- [ ] 2.0 Update `toggleInfo()` to refresh panel content
  - [ ] 2.1 Add call to `updateInfoPanel()` before toggling CSS class
  - [ ] 2.2 Test info panel updates when toggled with new images

- [ ] 3.0 Update `renderNodes()` to use new method
  - [ ] 3.1 Replace inline HTML generation with `updateInfoPanel()` call
  - [ ] 3.2 Verify no regression in initial node rendering

- [ ] 4.0 Manual testing and verification
  - [ ] 4.1 Test with node containing description + images
  - [ ] 4.2 Test with node containing only images
  - [ ] 4.3 Test with node containing no data

## Detailed Task Specifications

### 1.1 Create `updateInfoPanel(nodeId)` method
**Location**: `mindmap-engine.js` (after `toggleInfo()` method, ~line 645)

**Acceptance Criteria**:
- Method exists in MindmapEngine class
- Takes `nodeId` as parameter
- Finds info panel element by `id="info-${nodeId}"`
- Returns early if element not found

**Estimated Time**: 5 minutes

---

### 1.2 Move HTML generation logic to new method
**Location**: `mindmap-engine.js:updateInfoPanel()` method

**Acceptance Criteria**:
- Reads `nodeData[nodeId]` or defaults to empty object
- Checks for description, notes, images existence
- Generates HTML in order: description → notes → images
- Handles empty state with "Sin información" message
- Updates `element.innerHTML` with generated HTML

**Code to Extract**: Lines 412-455 from `renderNodes()`

**Estimated Time**: 10 minutes

---

### 1.3 Test method generates correct HTML
**Testing Approach**: Manual verification in browser console

**Test Cases**:
1. Node with description + notes + images → All displayed
2. Node with only description → Description shown
3. Node with only images → Images shown
4. Node with no data → "Sin información" shown

**Acceptance Criteria**:
- All test cases pass
- HTML structure matches original
- No JavaScript errors in console

**Estimated Time**: 5 minutes

---

### 2.1 Add call to `updateInfoPanel()` before toggling
**Location**: `mindmap-engine.js:toggleInfo()` method (line 622-644)

**Changes Required**:
```javascript
toggleInfo(nodeId) {
    // Initialize nodeData if it doesn't exist
    if (!this.nodeData[nodeId]) {
        this.nodeData[nodeId] = { description: '', notes: '', images: [], showInfo: false };
    }

    // Toggle the showInfo flag
    this.nodeData[nodeId].showInfo = !this.nodeData[nodeId].showInfo;

    // *** ADD THIS: Refresh panel content ***
    this.updateInfoPanel(nodeId);

    // Find the info panel element
    const infoPanel = document.getElementById(`info-${nodeId}`);

    if (infoPanel) {
        // Toggle 'active' class directly
        if (this.nodeData[nodeId].showInfo) {
            infoPanel.classList.add('active');
        } else {
            infoPanel.classList.remove('active');
        }
    }

    // Recalculate positions and redraw
    this.positions = this.calculateNodePositions(this.nodes);
    this.isDirty = true;
}
```

**Acceptance Criteria**:
- `updateInfoPanel(nodeId)` called before toggling CSS class
- No errors when toggling info panel
- Panel content refreshes on each toggle

**Estimated Time**: 5 minutes

---

### 2.2 Test info panel updates with new images
**Testing Approach**: Full workflow test

**Test Procedure**:
1. Create or select a node
2. Add description: "Test description"
3. Upload 2 test images
4. Save node
5. Click "Info" button → Panel opens
6. Verify: Description + 2 images visible
7. Click "Info" again → Panel closes
8. Click "Info" again → Panel reopens with same content

**Acceptance Criteria**:
- Images display correctly when panel opens
- Panel content persists through multiple toggles
- No console errors

**Estimated Time**: 5 minutes

---

### 3.1 Replace inline HTML with `updateInfoPanel()` call
**Location**: `mindmap-engine.js:renderNodes()` method (lines 408-455)

**Changes Required**:
Replace existing info panel creation code with:
```javascript
// Extra info panel - Show description + notes + images
const extraInfo = document.createElement('div');
extraInfo.className = 'node-extra-info';
extraInfo.id = `info-${node.id}`;

const data = this.nodeData[node.id] || {};

// Add 'active' class if showInfo is true
if (data.showInfo) {
    extraInfo.classList.add('active');
}

nodeEl.appendChild(extraInfo);

// *** REPLACE inline HTML with method call ***
this.updateInfoPanel(node.id);
```

**Acceptance Criteria**:
- Info panel element created with correct ID and class
- `updateInfoPanel()` called to populate content
- Active class applied if `showInfo` is true
- No duplicate HTML generation

**Estimated Time**: 5 minutes

---

### 3.2 Verify no regression in initial rendering
**Testing Approach**: Load app and check initial state

**Test Cases**:
1. Load app with default data
2. Generate mindmap
3. Verify nodes render correctly
4. Check info panels are hidden by default
5. Toggle one info panel → Should display content

**Acceptance Criteria**:
- App loads without errors
- Nodes render with correct positions
- Info panels hidden initially
- Toggling works as expected

**Estimated Time**: 5 minutes

---

### 4.1 Test with description + images
**Test Procedure**:
1. Create node "Test Node 1"
2. Add description: "This node has both text and images"
3. Add notes: "Additional notes here"
4. Upload 3 test images
5. Save node
6. Click "Info" → Verify all content displays
7. Close and reopen info → Content persists

**Acceptance Criteria**:
- Description displayed first
- Notes displayed second
- Images displayed in grid (3 columns)
- Order preserved on multiple toggles

**Estimated Time**: 5 minutes

---

### 4.2 Test with only images
**Test Procedure**:
1. Create node "Test Node 2"
2. Leave description and notes empty
3. Upload 2 test images
4. Save node
5. Click "Info" → Verify images display without text sections

**Acceptance Criteria**:
- Images display correctly
- No empty text sections shown
- Layout looks clean

**Estimated Time**: 3 minutes

---

### 4.3 Test with no data
**Test Procedure**:
1. Create node "Test Node 3"
2. Leave all fields empty
3. Save node
4. Click "Info" → Verify "Sin información" message displays

**Acceptance Criteria**:
- Empty state message displays
- No broken layout
- No console errors

**Estimated Time**: 2 minutes

---

## Implementation Order
1. Task 1.1 → 1.2 → 1.3 (Create and test new method)
2. Task 2.1 → 2.2 (Update toggleInfo)
3. Task 3.1 → 3.2 (Update renderNodes)
4. Task 4.1 → 4.2 → 4.3 (Full verification)

## Notes
- No external dependencies or package installations required
- All changes in single file: `mindmap-engine.js`
- Manual testing in Electron app (run `npm start`)
- Consider taking screenshots of test results for documentation