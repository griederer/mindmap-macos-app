# PRD #0001: Relationship System Fixes and Improvements

**Status:** Draft
**Created:** 2025-10-11
**Priority:** High
**Owner:** TBD

---

## 1. Introduction

This PRD addresses critical bugs in the PWC Mindmap application's relationship system (v5.0) and defines improvements needed for a stable, production-ready implementation.

### Context

The mindmap application recently migrated to v5.0 with a simplified relationship model where nodes store arrays of relationshipIds. During testing, several issues were discovered:

1. Node counter displays incorrect values (130 vs 4)
2. Checkbox functionality in edit modal (FIXED)
3. Panel refresh behavior (FIXED)
4. Data loading inconsistency causing crashes

---

## 2. Goals

### Primary Objectives

1. **Fix node counter accuracy** - Display correct count matching actual project nodes
2. **Ensure data loading consistency** - Prevent crashes when loading projects
3. **Validate complete workflow** - Verify end-to-end relationship creation and assignment
4. **Improve code maintainability** - Refactor problematic areas for future development

### Success Metrics

- Node counter shows correct value for all projects
- Zero crashes on project load
- 100% relationship workflow completion rate
- Code coverage >80% for relationship module
- All integration tests passing

---

## 3. User Stories

### US-001: Accurate Statistics Display
**As a** mindmap user
**I want** the relationship panel to show accurate node counts
**So that** I can trust the statistics when managing relationships

**Acceptance Criteria:**
- [ ] Node counter matches actual project node count
- [ ] Connected nodes count updates when relationships change
- [ ] Statistics refresh when switching projects
- [ ] No crashes or errors during count calculation

### US-002: Reliable Project Loading
**As a** mindmap user
**I want** projects to load without crashes
**So that** I can work on my mindmaps reliably

**Acceptance Criteria:**
- [ ] All v5.0 projects load successfully
- [ ] Node data dictionary loads correctly
- [ ] Tree structure updates properly
- [ ] No localStorage corruption issues

### US-003: Complete Relationship Workflow
**As a** mindmap user
**I want** to create and assign relationships smoothly
**So that** I can visualize connections between concepts

**Acceptance Criteria:**
- [ ] Can create new relationship with custom properties
- [ ] Can assign relationship to multiple nodes
- [ ] Checkboxes stay checked when selected (FIXED)
- [ ] Relationship lines appear on canvas
- [ ] Lines respect color and dash pattern
- [ ] Can toggle relationship visibility

---

## 4. Functional Requirements

### FR-001: Node Counter Fix
**Priority:** P0 (Critical)
**Component:** Relationship Panel

**Description:**
Fix the node counting logic to accurately reflect the current project's node count.

**Current Behavior:**
- Displays "130 nodos" for test project with 4 nodes
- Counts from stale `this.nodes` tree
- Not updated after project load

**Expected Behavior:**
- Displays "4 nodos" for test project
- Counts from current project's tree
- Updates immediately after project load

**Technical Details:**
- Location: `renderer.js:2449`
- Root cause: Loading `projectData.nodes` (tree) into `nodeData` (dictionary)
- Should load: `projectData.nodeData`
- Attempted fix caused crash - needs investigation

**Dependencies:**
- FR-002 (Data loading fix)
- FR-004 (localStorage handling)

---

### FR-002: Data Loading Consistency
**Priority:** P0 (Critical)
**Component:** Project Manager

**Description:**
Fix the project loading sequence to correctly populate both tree structure and data dictionary.

**Current Behavior:**
```javascript
// Line 2449 - INCORRECT
window.mindmapEngine.nodeData = projectData.nodes || {};
```

**Expected Behavior:**
```javascript
// Load correct properties
window.mindmapEngine.nodeData = projectData.nodeData || {};
```

**Problem:**
- Correct fix causes app crash (exit code 1)
- Crash reason unknown
- May be timing/initialization issue

**Investigation Needed:**
1. Why does correct property cause crash?
2. Is `generateMindmap()` called at wrong time?
3. Is `parseOutline()` receiving stale data?
4. Are there circular dependencies?

**Technical Approach:**
1. Add comprehensive logging to load sequence
2. Test with cleared localStorage
3. Verify v5.0 format compatibility
4. Check for race conditions

---

### FR-003: Initialization Sequence
**Priority:** P1 (High)
**Component:** App Initialization

**Description:**
Improve app initialization to prevent loading stale data from localStorage.

**Current Flow:**
```
1. init() → generateMindmap()
   └─> Parses textarea (localStorage cache with 130 nodes)
   └─> Sets this.nodes = oldTree

2. loadProject()
   └─> Loads Test-Relaciones-Vacio.pmap (4 nodes)
   └─> Updates textarea
   └─> Calls generateMindmap() again
   └─> Should update this.nodes but doesn't work
```

**Proposed Flow:**
```
1. init()
   └─> Clear stale localStorage
   └─> Load last opened project
   └─> Generate mindmap from fresh data

2. loadProject()
   └─> Load project data
   └─> Clear textarea first
   └─> Update textarea
   └─> Load nodeData correctly
   └─> Generate mindmap
```

**Implementation:**
- Clear localStorage on app start (configurable)
- Validate project data before loading
- Add loading indicators
- Handle errors gracefully

---

### FR-004: localStorage Management
**Priority:** P1 (High)
**Component:** Storage

**Description:**
Implement proper localStorage management to prevent corruption and stale data issues.

**Requirements:**
1. **Version Control**
   - Store data format version
   - Migrate old formats automatically
   - Clear incompatible data

2. **Cache Invalidation**
   - Clear on app version change
   - Clear on project switch
   - Option to clear manually

3. **Data Validation**
   - Validate before storing
   - Validate before loading
   - Handle corrupted data

4. **Fallback Strategy**
   - Load from file if cache invalid
   - Don't rely solely on localStorage
   - User notification on cache clear

---

### FR-005: Relationship Workflow Validation
**Priority:** P1 (High)
**Component:** Relationship System

**Description:**
Validate and test complete relationship workflow end-to-end.

**Test Scenarios:**

**Scenario 1: Create Relationship**
1. Open relationships panel
2. Click "Crear Nueva Relación"
3. Enter name: "depende de"
4. Select color: red (#ff0000)
5. Select dash: dashed
6. Save
7. Verify appears in panel

**Scenario 2: Assign to Nodes**
1. Double-click Node A
2. Check "depende de" relationship
3. Verify checkbox stays checked ✅ (FIXED)
4. Save node
5. Repeat for Node B
6. Verify red dashed line appears between A and B

**Scenario 3: Toggle Visibility**
1. Click relationship tag in panel
2. Verify line disappears
3. Click again
4. Verify line reappears

**Scenario 4: Multiple Relationships**
1. Create "relacionado con" (blue, solid)
2. Assign to Node A and Node C
3. Verify both lines appear
4. Toggle each independently

---

### FR-006: Panel Refresh Behavior
**Priority:** P2 (Medium)
**Component:** Relationship Panel

**Status:** ✅ FIXED

**Description:**
Ensure relationship panel shows fresh data when opened.

**Fix Applied:**
```javascript
// renderer.js:1405-1417
toggleRelationshipsPanel() {
    if (this.relationshipsPanelVisible) {
        panel.classList.remove('hidden');
        this.renderRelationships(); // ✅ Added refresh
    }
}
```

---

### FR-007: Error Handling
**Priority:** P2 (Medium)
**Component:** All

**Description:**
Improve error handling throughout relationship system.

**Requirements:**

1. **User-Facing Errors**
   - Clear error messages
   - Suggested actions
   - Non-blocking where possible

2. **Developer Errors**
   - Detailed console logs
   - Stack traces
   - Context information

3. **Recovery**
   - Graceful degradation
   - Fallback behaviors
   - Auto-retry where appropriate

4. **Validation**
   - Input validation
   - Data format validation
   - Constraint checking

**Examples:**
```javascript
// Before
window.mindmapEngine.nodeData = projectData.nodes || {};

// After
try {
    if (!projectData.nodeData) {
        console.error('Project missing nodeData:', projectData);
        throw new Error('Invalid project format');
    }
    window.mindmapEngine.nodeData = projectData.nodeData;
} catch (error) {
    console.error('Failed to load node data:', error);
    // Show user-friendly message
    // Attempt recovery or fallback
}
```

---

## 5. Non-Goals (Out of Scope)

The following are explicitly **not** included in this PRD:

1. **Directional Relationships** - A→B vs A↔B arrows (future feature)
2. **Relationship Labels on Lines** - Text labels on connection lines
3. **Custom Relationship Icons** - Icons instead of/in addition to colors
4. **Relationship Templates** - Pre-defined relationship sets
5. **Export Format Changes** - Relationship export to other formats
6. **Performance Optimization** - Large mindmap performance (>1000 nodes)
7. **Undo/Redo for Relationships** - History management
8. **Relationship Search/Filter** - Advanced relationship filtering

These may be addressed in future PRDs.

---

## 6. Design Considerations

### UI/UX

**Current State:**
- Relationship panel slides in from right
- Checkboxes in edit modal
- Color picker for relationship creation
- Tag-based visibility toggle

**Improvements Needed:**
- Loading indicators during project switch
- Success confirmation on relationship create
- Error messages for validation failures
- Visual feedback when relationships change

### Visual Design

**Colors:**
- Maintain existing color picker
- Validate contrast for accessibility
- Default colors: Red, Blue, Green, Yellow, Purple

**Dash Patterns:**
- Solid: `[0, 0]`
- Dashed: `[5, 5]`
- Dotted: `[2, 2]`
- Custom: User-defined array

### Accessibility

- Keyboard navigation in panel
- Screen reader support
- Color blind friendly defaults
- High contrast mode support

---

## 7. Technical Considerations

### Architecture

**Current v5.0 Design:**
```
relationships: [
  { id, name, color, dashPattern }
]

nodeData: {
  nodeId: {
    relationships: [relationshipId, ...]
  }
}
```

**Advantages:**
- Simple data structure
- Easy to understand
- Bidirectional by default
- Minimal storage

**Challenges:**
- No directional support
- Performance with many nodes
- Complex multi-hop queries

### Data Migration

**v4.0 → v5.0:**
- Old format had connection objects
- New format uses ID arrays
- Migration already implemented
- Need to ensure backwards compatibility

### Testing Strategy

1. **Unit Tests**
   - `countProjectNodes()` accuracy
   - Project loading logic
   - Relationship creation
   - Checkbox behavior

2. **Integration Tests**
   - Complete workflow (create→assign→render)
   - Panel refresh behavior
   - Project switching
   - localStorage handling

3. **E2E Tests**
   - User workflow scenarios
   - Multi-project testing
   - Crash recovery

4. **Performance Tests**
   - Load time with large projects
   - Rendering speed
   - Memory usage

### Dependencies

**External:**
- Electron 27+
- Node.js 18+
- No external libraries for relationships

**Internal:**
- `renderer.js` - UI logic
- `mindmap-engine.js` - Rendering
- `project-manager.js` - File operations

---

## 8. Success Metrics

### Quantitative

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Node counter accuracy | 0% | 100% | Test suite |
| Project load success | ~90% | 100% | Error logs |
| Workflow completion | Unknown | 100% | User testing |
| Test coverage | 0% | 80% | Jest |
| Crash rate | High | 0 | Error tracking |

### Qualitative

- User confidence in statistics
- Smooth workflow experience
- No confusion or errors
- Maintainable codebase

---

## 9. Open Questions

### Technical Questions

1. **Q:** Why does the correct `projectData.nodeData` fix cause crash?
   **A:** Investigation needed - may be timing or initialization issue

2. **Q:** Should we clear localStorage on every app start?
   **A:** Configurable - default to clear on version change

3. **Q:** How to handle large mindmaps (>500 nodes)?
   **A:** Out of scope for this PRD - performance optimization later

4. **Q:** What happens to relationships when nodes are deleted?
   **A:** Need to implement cleanup logic

### Product Questions

1. **Q:** Should relationships be project-specific or global?
   **A:** Currently project-specific - keep this behavior

2. **Q:** Maximum number of relationships per node?
   **A:** No limit - but consider UI implications

3. **Q:** Can relationships connect more than 2 nodes?
   **A:** Yes - current design supports N-way connections

---

## 10. Timeline and Phases

### Phase 1: Critical Bugs (Week 1)
**Goal:** Fix crashes and node counter

- [ ] FR-002: Data loading consistency
- [ ] FR-001: Node counter fix
- [ ] FR-004: localStorage management
- [ ] Unit tests for fixes

### Phase 2: Validation (Week 2)
**Goal:** Ensure workflow works end-to-end

- [ ] FR-005: Relationship workflow validation
- [ ] FR-003: Initialization sequence
- [ ] Integration tests
- [ ] User testing

### Phase 3: Polish (Week 3)
**Goal:** Improve UX and error handling

- [ ] FR-007: Error handling
- [ ] Loading indicators
- [ ] Success confirmations
- [ ] Documentation updates

### Phase 4: Testing & Release (Week 4)
**Goal:** Comprehensive testing and deployment

- [ ] E2E test suite
- [ ] Performance testing
- [ ] Bug fixes from testing
- [ ] Release preparation

---

## 11. Risk Assessment

### High Risk

**R-001: Crash on Data Loading Fix**
- **Impact:** Blocks critical bug fix
- **Probability:** High (already occurred)
- **Mitigation:** Thorough investigation, alternative approaches, extensive testing

### Medium Risk

**R-002: localStorage Corruption**
- **Impact:** User data loss
- **Probability:** Medium
- **Mitigation:** Validation, fallback to file, user warnings

**R-003: Performance with Large Projects**
- **Impact:** Poor user experience
- **Probability:** Medium (for power users)
- **Mitigation:** Out of scope, but document limitations

### Low Risk

**R-004: UI/UX Confusion**
- **Impact:** Users don't understand workflow
- **Probability:** Low (workflow is intuitive)
- **Mitigation:** Documentation, tooltips, user testing

---

## 12. Appendix

### A. Code References

**Critical Files:**
- `renderer.js:2449` - Bug location
- `renderer.js:1531-1567` - `updateRelationshipStats()`
- `renderer.js:1597-1610` - Checkbox fix (DONE)
- `renderer.js:1405-1417` - Panel refresh fix (DONE)
- `mindmap-engine.js:1533-1546` - `countProjectNodes()`
- `mindmap-engine.js:410-494` - `drawConnections()`

### B. Test Projects

**Test-Relaciones-Vacio.pmap:**
- Location: `/Users/gonzaloriederer/Documents/PWC Mindmaps/`
- Nodes: 4 (1 root + 3 children)
- Relationships: 0
- Purpose: Clean slate testing

### C. Related Documents

- `CLAUDE-HANDOFF-CONTEXT.md` - Detailed investigation notes
- `/docs/bugs/node-counter-investigation.md` - Bug analysis
- `/docs/architecture/relationship-system.md` - System design
- `/docs/development/setup.md` - Development guide

### D. Glossary

- **Node:** Individual concept in mindmap
- **Relationship:** Connection between nodes with visual properties
- **Relationship ID:** Unique identifier for relationship definition
- **Node Data:** Dictionary of node-specific data (relationships, notes, etc.)
- **Tree Structure:** Hierarchical parent-child node organization
- **.pmap:** Project file format (JSON)
- **v5.0:** Current relationship system version

---

## 13. Approval and Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| Product Owner | TBD | | Pending |
| Tech Lead | TBD | | Pending |
| QA Lead | TBD | | Pending |

---

**Document Version:** 1.0
**Last Updated:** 2025-10-11
**Next Review:** TBD
