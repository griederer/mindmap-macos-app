# PRD: Dynamic State-Based Presentation System

**Feature Name**: Dynamic State-Based Presentation System
**PRD Number**: 0001
**Date**: 2025-10-14
**Author**: AI Development Agent
**Status**: Draft

---

## 1. Introduction / Overview

This PRD defines the complete redesign of PWC Mindmap Pro's presentation system. The current screenshot-based system will be **completely removed** and replaced with a new **state-based presentation system** that captures and replays **dynamic movements** rather than static images.

The new system will allow users to create presentations where each slide represents a **state transition** (e.g., expanding a node, opening info panel, displaying an image) with smooth, reversible animations. When navigating backwards, animations will play in reverse (e.g., collapsing an expanded node).

### Key Concept
**Slides = Movements, not Screenshots**

Example flow:
- Slide 0: Root node view (collapsed)
- Slide 1: Expand "Architecture" node
- Slide 2: Open info panel for "Architecture"
- Slide 3: Display image #1 from "Architecture" node
- Navigation: Forward plays animations, backward reverses them

---

## 2. Goals

### Primary Goals
1. **Enable dynamic presentations** that capture state transitions, not static screenshots
2. **Support smooth animations** (500ms expand, 350ms info, 500ms image) for all interactions
3. **Allow reversible navigation** (forward plays animation, backward reverses it)
4. **Handle multi-level navigation** automatically (e.g., root → level 3 expands all intermediate nodes)
5. **Provide capture mode** that logs all user actions for easy slide creation

### Success Metrics
- User can create a 10-slide presentation in < 5 minutes using capture mode
- Animation playback is smooth (60 FPS) without janky transitions
- Backward navigation correctly reverses all animations
- Multi-level navigation (3+ levels) generates intermediate animations automatically
- Multiple presentations can be saved per project (like PowerPoint files)

---

## 3. User Stories

### US-001: Capture Mode Recording
**As a** user creating a presentation
**I want to** activate capture mode that logs all my actions
**So that** I can review the log and assign each action as a slide

**Acceptance Criteria**:
- Button "Start Capture" activates recording mode
- All interactions are logged with timestamps: node expansions, info panel opens, image displays, relationship shows
- Button "Stop Capture" deactivates recording
- UI shows capture status (red indicator or similar)
- Log is reviewable with option to convert each action into a slide

### US-002: Node Expansion Slide
**As a** user building a presentation
**I want to** capture node expansion as a slide
**So that** the presentation shows the node animating open (forward) or closed (backward)

**Acceptance Criteria**:
- Slide captures: nodeId, parent state, expansion action
- Forward navigation: node expands over 500ms
- Backward navigation: node collapses over 500ms
- Animation is smooth and natural

### US-003: Multi-Level Navigation
**As a** user presenting a mindmap
**I want to** jump from root to a deeply nested node (3 levels down)
**So that** intermediate nodes expand automatically in sequence

**Acceptance Criteria**:
- System detects path from current state to target state
- Each intermediate node expands with 300ms animation
- Total animation is fluid without jarring jumps
- Backward navigation collapses nodes in reverse order

### US-004: Info Panel Display
**As a** user presenting node details
**I want to** open/close the info panel as a slide
**So that** I can show/hide additional information dynamically

**Acceptance Criteria**:
- Slide captures: nodeId, info panel open action
- Forward: panel slides in over 350ms
- Backward: panel slides out over 350ms
- Opening info panel closes any open image modal (mutually exclusive)

### US-005: Image Modal Display
**As a** user showing visual content
**I want to** display node images as slides
**So that** images appear/disappear smoothly during presentation

**Acceptance Criteria**:
- Slide captures: nodeId, imageIndex, display action
- Forward: image modal fades in over 500ms
- Backward: image modal fades out over 500ms
- Opening image closes any open info panel (mutually exclusive)

### US-006: Relationship Visualization
**As a** user explaining connections
**I want to** show/hide relationships as slides
**So that** I can highlight specific connections during presentation

**Acceptance Criteria**:
- Slide captures: relationshipId, show/hide action
- When "show relationship" is captured, it records which relationship
- Forward: relationship appears with animation
- Backward: relationship disappears with animation

### US-007: Focus Mode Integration
**As a** user emphasizing specific nodes
**I want to** slides to activate focus mode when targeting a node
**So that** other nodes dim and attention is drawn to the active node

**Acceptance Criteria**:
- When slide targets a specific node, focus mode activates automatically
- Non-focused nodes dim (opacity reduction)
- Forward: focus animates in
- Backward: focus animates out

### US-008: Multiple Presentations
**As a** user managing multiple presentation scenarios
**I want to** create and save multiple presentations per project
**So that** I can have different presentation flows (executive summary, technical deep-dive, etc.)

**Acceptance Criteria**:
- Project can store multiple presentation files
- UI allows creating new presentation
- UI allows switching between presentations
- UI allows renaming/deleting presentations
- Each presentation has independent slide deck

### US-009: Presentation Navigation Controls
**As a** user presenting
**I want to** navigate slides using arrows and direct slide selection
**So that** I can control presentation flow flexibly

**Acceptance Criteria**:
- Arrow keys (left/right) navigate prev/next slide
- Timeline UI shows all slides with icons indicating action type
- Clicking timeline slide jumps directly to that slide
- Current slide is highlighted in timeline

### US-010: Slide Reordering
**As a** user editing a presentation
**I want to** reorder slides via drag-and-drop
**So that** I can adjust presentation flow without recreating slides

**Acceptance Criteria**:
- Slides can be dragged and dropped in timeline
- Reordering updates presentation sequence
- State transitions recalculate automatically

---

## 4. Functional Requirements

### FR-001: Capture Mode System
**Priority**: P0 (Critical)

The system must provide a "Capture Mode" that:
1. Activates via "Start Capture" button in UI
2. Logs every user interaction while active:
   - Node expand/collapse (with nodeId, timestamp)
   - Info panel open/close (with nodeId, timestamp)
   - Image modal open/close (with nodeId, imageIndex, timestamp)
   - Relationship show/hide (with relationshipId, timestamp)
   - Camera movements (zoom, pan)
3. Displays capture status indicator (e.g., red recording dot)
4. Deactivates via "Stop Capture" button
5. Presents capture log UI for review
6. Allows user to select which logged actions become slides

### FR-002: State Capture Engine
**Priority**: P0 (Critical)

Each slide must capture complete state information:
```javascript
{
  slideId: "unique-id",
  timestamp: "ISO-8601",
  description: "User-provided description",
  targetState: {
    camera: { x: number, y: number, zoom: number },
    expandedNodes: ["node-1", "node-2", ...],
    focusedNode: "node-id" | null,
    infoPanel: { open: boolean, nodeId: string | null },
    imageModal: { open: boolean, nodeId: string | null, imageIndex: number | null },
    visibleRelationships: ["rel-1", "rel-2", ...],
    focusMode: boolean
  }
}
```

### FR-003: Transition Calculation Algorithm
**Priority**: P0 (Critical)

The system must implement `calculateTransitions(currentState, targetState)` that:
1. Compares current state vs target state
2. Identifies all differences (expanded nodes, open panels, etc.)
3. Determines optimal animation sequence following hierarchy (natural path)
4. Returns ordered list of animation steps:
```javascript
[
  { type: "expandNode", nodeId: "node-1", duration: 500 },
  { type: "expandNode", nodeId: "node-2", duration: 500 },
  { type: "openInfo", nodeId: "node-2", duration: 350 },
  { type: "focusNode", nodeId: "node-2", duration: 300 }
]
```

### FR-004: Animation Engine
**Priority**: P0 (Critical)

Must implement smooth animations for all action types:

**Animation Types & Durations** (slow config):
- `expandNode`: 500ms (smooth tree expansion)
- `collapseNode`: 500ms (smooth tree collapse)
- `openInfo`: 350ms (info panel slide-in)
- `closeInfo`: 350ms (info panel slide-out)
- `openImage`: 500ms (image modal fade-in)
- `closeImage`: 500ms (image modal fade-out)
- `showRelationship`: 300ms (relationship line draw)
- `hideRelationship`: 300ms (relationship line erase)
- `focusNode`: 300ms (camera pan + zoom, other nodes dim)
- `unfocusNode`: 300ms (camera reset, other nodes brighten)

**Animation Requirements**:
- All animations must use easing functions (ease-in-out)
- Must be interruptible (if user clicks during animation)
- Must maintain 60 FPS performance
- Must work correctly in reverse (backward navigation)

### FR-005: Multi-Level Path Finding
**Priority**: P0 (Critical)

When target node is multiple levels deep:
1. Detect all ancestor nodes that need expansion
2. Generate animation sequence from root to target
3. Use 300ms per node expansion in sequence
4. Ensure smooth, continuous animation (no janky jumps)

Example: Root → Level 1 → Level 2 → Level 3
- Animations: expand(level1, 300ms) → expand(level2, 300ms) → expand(level3, 300ms)
- Total: 900ms
- Each animation waits for previous to complete

### FR-006: Mutual Exclusivity Rules
**Priority**: P0 (Critical)

During presentation mode:
- Info panel and image modal are **mutually exclusive**
- Opening info panel automatically closes image modal (with animation)
- Opening image modal automatically closes info panel (with animation)
- Both can be closed simultaneously

### FR-007: Presentation Storage
**Priority**: P0 (Critical)

Projects can store multiple presentations:
- File format: `.presentation` (JSON) stored alongside `.pmap` file
- Structure:
```javascript
{
  presentationId: "unique-id",
  projectId: "project-id",
  name: "Executive Summary",
  created: "ISO-8601",
  modified: "ISO-8601",
  slides: [
    { /* slide object */ },
    { /* slide object */ }
  ]
}
```
- Storage location: `/Users/gonzaloriederer/Documents/PWC Mindmaps/presentations/`
- UI allows creating, loading, renaming, deleting presentations

### FR-008: Timeline Visualization
**Priority**: P1 (High)

Presentation editor must show timeline UI:
- Visual timeline with slide thumbnails/icons
- Each slide shows:
  - Icon indicating action type (expand, info, image, relationship)
  - Slide number
  - Brief description
- Current slide highlighted
- Drag-and-drop to reorder slides
- Click to jump to specific slide

### FR-009: Navigation Controls
**Priority**: P1 (High)

Presentation mode must provide:
- Keyboard: Arrow Left (previous), Arrow Right (next)
- Timeline UI: Click slide to jump directly
- Direct slide access optimizes transitions from current state

### FR-010: Slide Management
**Priority**: P1 (High)

Users must be able to:
- Reorder slides via drag-and-drop in timeline
- Delete slides (with confirmation)
- **Cannot edit slide content** (FR-010 constraint: reordering only)
- View slide count and current position

### FR-011: Focus Mode Auto-Activation
**Priority**: P1 (High)

When slide targets a specific node:
- Focus mode activates automatically
- Target node receives full opacity
- Other nodes dim to 30% opacity
- Camera animates to center target node
- Reverse animation on backward navigation

### FR-012: Relationship Capture
**Priority**: P1 (High)

When user shows a relationship during capture:
- System records relationshipId
- Records show/hide state
- Creates slide that replays the show/hide action
- Animation draws/erases relationship line

---

## 5. Non-Goals (Out of Scope)

### NG-001: Video Export
- **Not included**: Export presentation as MP4 video
- **Rationale**: Phase 2 feature, adds significant complexity

### NG-002: HTML Export
- **Not included**: Export as standalone HTML
- **Rationale**: Phase 2 feature, requires separate viewer

### NG-003: Slide Content Editing
- **Not included**: Edit slide actions after creation (except reorder/delete)
- **Rationale**: User confirmed "reordenar no mas" - reordering only

### NG-004: Audio Narration
- **Not included**: Record audio narration per slide
- **Rationale**: Out of MVP scope

### NG-005: Real-time Collaboration
- **Not included**: Multiple users editing presentation simultaneously
- **Rationale**: Out of MVP scope

### NG-006: Presentation Templates
- **Not included**: Pre-built presentation templates
- **Rationale**: Phase 2 feature

### NG-007: Custom Animation Speeds Per Slide
- **Not included**: Adjustable animation speed per individual slide
- **Rationale**: User confirmed slow speeds globally, no per-slide customization

---

## 6. Design Considerations

### 6.1 UI Components

**Capture Mode Panel** (New):
- Toggle button: "Start Capture" / "Stop Capture"
- Status indicator: Recording dot (red) or idle
- Action log viewer: Scrollable list of captured actions
- "Create Slide" button per logged action

**Presentation Manager Panel** (Redesign):
- Dropdown: Select active presentation
- Button: "New Presentation", "Rename", "Delete"
- Timeline: Visual slide sequence with icons
- Slide controls: Play, Previous, Next, Jump to slide

**Timeline Component** (New):
- Horizontal scrollable timeline
- Each slide: Icon + number + description
- Drag-and-drop reordering
- Highlight current slide
- Click to jump

### 6.2 Animation Visual Language

**Node Expansion**:
- Child nodes fade in + scale up from 0.9 to 1.0
- Connection lines draw from parent to children
- Duration: 500ms, ease-in-out

**Info Panel**:
- Slide from right edge
- Content fades in after slide completes
- Duration: 350ms, ease-out

**Image Modal**:
- Fade in overlay (dark background)
- Image scales from 0.8 to 1.0
- Duration: 500ms, ease-out

**Focus Mode**:
- Camera pans to center target (500ms)
- Other nodes fade to 30% opacity (300ms)
- Target node brightness increase (glow effect)

**Relationships**:
- Line draws from source to target using SVG path animation
- Duration: 300ms, ease-in-out

### 6.3 File Format

**Presentation File** (`.presentation`):
```json
{
  "version": "1.0.0",
  "presentationId": "uuid",
  "projectId": "uuid",
  "name": "My Presentation",
  "created": "2025-10-14T10:00:00Z",
  "modified": "2025-10-14T15:30:00Z",
  "slides": [
    {
      "slideId": "slide-001",
      "order": 0,
      "description": "Root view",
      "targetState": {
        "camera": { "x": 0, "y": 0, "zoom": 1.0 },
        "expandedNodes": [],
        "focusedNode": null,
        "infoPanel": { "open": false, "nodeId": null },
        "imageModal": { "open": false, "nodeId": null, "imageIndex": null },
        "visibleRelationships": [],
        "focusMode": false
      }
    },
    {
      "slideId": "slide-002",
      "order": 1,
      "description": "Expand Architecture node",
      "targetState": {
        "camera": { "x": 100, "y": 50, "zoom": 1.2 },
        "expandedNodes": ["node-architecture"],
        "focusedNode": "node-architecture",
        "infoPanel": { "open": false, "nodeId": null },
        "imageModal": { "open": false, "nodeId": null, "imageIndex": null },
        "visibleRelationships": [],
        "focusMode": true
      }
    }
  ]
}
```

---

## 7. Technical Considerations

### 7.1 Architecture

**New Components**:
1. **CaptureManager** (`capture-manager.js`)
   - Handles capture mode activation/deactivation
   - Logs all user interactions
   - Provides UI for reviewing captured actions

2. **StateEngine** (`state-engine.js`)
   - Captures complete mindmap state
   - Compares two states and identifies differences
   - Serializes/deserializes state objects

3. **TransitionCalculator** (`transition-calculator.js`)
   - Implements `calculateTransitions(from, to)`
   - Path-finding algorithm for multi-level navigation
   - Generates optimal animation sequence

4. **AnimationEngine** (`animation-engine.js`)
   - Executes animation sequences
   - Handles all animation types (expand, info, image, etc.)
   - Ensures smooth 60 FPS playback
   - Supports forward and reverse playback

5. **PresentationManager** (`presentation-manager.js`) - **Complete Rewrite**
   - Manages multiple presentations per project
   - Handles slide storage/loading
   - Coordinates with AnimationEngine for playback
   - Provides navigation controls

6. **PresentationUI** (`presentation-ui.js`) - **Complete Redesign**
   - Timeline component
   - Capture mode UI
   - Navigation controls
   - Presentation selector

**Modified Components**:
- `renderer.js` - Integration with new presentation system
- `mindmap-engine.js` - State exposure for StateEngine

### 7.2 State Management

**Current State Tracking**:
The system must track current state in real-time:
- Subscribe to node expansion events
- Subscribe to info panel open/close events
- Subscribe to image modal open/close events
- Subscribe to relationship visibility changes
- Subscribe to camera movements

**State Comparison Algorithm**:
```javascript
function compareStates(state1, state2) {
  return {
    nodesToExpand: state2.expandedNodes.filter(n => !state1.expandedNodes.includes(n)),
    nodesToCollapse: state1.expandedNodes.filter(n => !state2.expandedNodes.includes(n)),
    infoPanelChange: state1.infoPanel.open !== state2.infoPanel.open,
    imageModalChange: state1.imageModal.open !== state2.imageModal.open,
    relationshipsToShow: state2.visibleRelationships.filter(r => !state1.visibleRelationships.includes(r)),
    relationshipsToHide: state1.visibleRelationships.filter(r => !state2.visibleRelationships.includes(r)),
    focusChange: state1.focusedNode !== state2.focusedNode
  };
}
```

### 7.3 Performance Considerations

**Animation Performance**:
- Use CSS transforms for animations (GPU-accelerated)
- Avoid layout thrashing (batch DOM reads/writes)
- Use `requestAnimationFrame` for smooth playback
- Debounce rapid state changes during capture

**Large Mindmap Handling**:
- For mindmaps with 500+ nodes, limit visible nodes during animation
- Use virtualization for off-screen nodes
- Throttle relationship rendering during multi-level expansion

### 7.4 Testing Strategy

**Unit Tests Required**:
- `StateEngine.captureState()` - Captures complete state correctly
- `StateEngine.compareStates()` - Identifies all differences accurately
- `TransitionCalculator.calculateTransitions()` - Generates correct animation sequence
- `TransitionCalculator.findPath()` - Finds optimal path for multi-level navigation
- `AnimationEngine.playAnimation()` - Executes animations smoothly
- `AnimationEngine.reverseAnimation()` - Correctly reverses all animation types
- `PresentationManager.createSlide()` - Stores slide with complete state
- `PresentationManager.navigate()` - Navigates forward/backward correctly

**Integration Tests Required**:
- Capture mode logs all actions correctly
- Multi-level navigation expands intermediate nodes in sequence
- Mutual exclusivity: info panel closes when image opens
- Focus mode activates/deactivates correctly
- Slide reordering updates presentation order
- Multiple presentations can be created and switched

**Manual Testing Required**:
- Visual smoothness of animations at 60 FPS
- Responsiveness of timeline UI
- Drag-and-drop slide reordering
- Presentation playback with complex state transitions
- Backward navigation reverses animations correctly

---

## 8. Success Metrics

### Quantitative Metrics
1. **Capture Efficiency**: User creates 10-slide presentation in < 5 minutes
2. **Animation Performance**: Maintain 60 FPS during all transitions
3. **Multi-Level Speed**: Root to level 3 navigation completes in < 1 second
4. **Storage Size**: `.presentation` file < 1 MB for 50-slide deck
5. **Load Time**: Open presentation in < 500ms

### Qualitative Metrics
1. **Smoothness**: Animations feel natural and fluid (no janky jumps)
2. **Intuitiveness**: Users understand capture mode without documentation
3. **Reversibility**: Backward navigation feels like "undo" of forward navigation
4. **Flexibility**: Timeline UI allows easy slide management

### User Acceptance Criteria
- User can create presentation without reading manual
- User can navigate presentation smoothly with arrow keys
- User can reorder slides via drag-and-drop
- User can create multiple presentations per project
- Backward navigation correctly reverses all animations

---

## 9. Open Questions

### OQ-001: Animation Interruption
**Question**: If user presses Next during a long animation (e.g., 3-level expansion), should the animation:
- A) Complete current animation then process next slide
- B) Cancel current animation and jump immediately to next slide
- C) Speed up current animation to finish quickly

**Status**: Needs decision

### OQ-002: Capture Mode Persistence
**Question**: Should capture log persist across app restarts?
- If yes, where to store? (temp file, in-memory, database)

**Status**: Needs decision

### OQ-003: Slide Descriptions
**Question**: Are slide descriptions:
- A) Auto-generated from action type ("Expand node: Architecture")
- B) User-provided (editable text field)
- C) Both (default auto-generated, user can override)

**Status**: Assume (C) for MVP

### OQ-004: Maximum Slides
**Question**: Should there be a maximum number of slides per presentation?
- Suggestion: 100 slides max to prevent performance issues

**Status**: Needs decision

### OQ-005: Presentation Sharing
**Question**: Should presentations be shareable across projects?
- If mindmap structures are identical, can presentation be imported?

**Status**: Phase 2 consideration

---

## 10. Dependencies

### Internal Dependencies
- `mindmap-engine.js` - Must expose state tracking APIs
- `renderer.js` - Must integrate with AnimationEngine
- `graph-visualizer.js` - Must support animation callbacks

### External Dependencies
- None (all features implementable with existing Electron + vanilla JS stack)

### Data Dependencies
- `.pmap` project files - Must have valid node structure
- File system access - For saving/loading `.presentation` files

---

## 11. Risks and Mitigations

### Risk 1: Animation Performance on Large Mindmaps
**Impact**: High
**Probability**: Medium
**Mitigation**:
- Implement virtualization for off-screen nodes
- Use CSS transforms for GPU acceleration
- Throttle animations when 500+ nodes visible

### Risk 2: Complex State Transitions
**Impact**: High
**Probability**: Medium
**Mitigation**:
- Comprehensive unit tests for `TransitionCalculator`
- Manual testing of edge cases (empty nodes, circular relationships)
- Fallback to "jump" if transition calculation fails

### Risk 3: User Confusion with Capture Mode
**Impact**: Medium
**Probability**: Low
**Mitigation**:
- Clear UI indicators (red recording dot)
- Tooltips explaining capture mode
- Sample presentations as templates

### Risk 4: File Format Versioning
**Impact**: Medium
**Probability**: Low
**Mitigation**:
- Include version field in `.presentation` format
- Implement migration logic for future versions
- Validate file structure on load

---

## 12. Timeline Estimate

### Phase 1: Core Infrastructure (3-4 weeks)
- Week 1: StateEngine + CaptureManager
- Week 2: TransitionCalculator + AnimationEngine
- Week 3: PresentationManager (complete rewrite)
- Week 4: Unit tests + integration tests

### Phase 2: UI Implementation (2-3 weeks)
- Week 5: Timeline component + drag-and-drop
- Week 6: Capture mode UI + presentation selector
- Week 7: Polish + manual testing

### Phase 3: Testing & Bug Fixes (1-2 weeks)
- Week 8: QA testing + performance optimization
- Week 9: Bug fixes + documentation

**Total Estimated Timeline**: 6-9 weeks

---

## Appendix A: User Response Summary

Based on clarifying questions answered by user:

1. **Relationship capture**: Click shows relationship, system records it (Option A)
2. **Multi-level animation**: Normal sequential (300ms per node) - total ~900ms (Option B)
3. **Info panel vs Image**: Mutually exclusive in presentation mode (Modified Option A)
4. **Capture mode**: "Start Capture" logs all actions, user assigns slides from log (Option A)
5. **Path optimization**: Natural path following hierarchy (Option B)
6. **Animation speeds**: Slow (expand 500ms, info 350ms, image 500ms) (Option C)
7. **Persistence**: Multiple presentations per project (Option B)
8. **Focus mode**: Yes, activate automatically when targeting node (Option A)
9. **Slide editing**: Reordering only, no content editing (Option A)
10. **State collisions**: Auto-optimize from current origin (Option B)
11. **Presentation controls**: Arrows + direct slide jump (Option B)
12. **Slide preview**: Timeline visual with icons per action type (Option C)
13. **Export**: Save/load within app only (Option A)

---

## Appendix B: Removed System Reference

**Current System to Remove**:
- `presentation-manager.js` (449 lines) - Will be completely rewritten
- `presentation-ui.js` - Will be completely redesigned
- `presentation-manager.test.js` - Will be replaced with new tests

**Reason for Complete Rewrite**:
User confirmed: "lo que hay no funcionaba, creo que hay que hacer todo de nuevo"

The existing system attempted screenshot-based presentations, which does not align with the new state-based approach. Starting fresh ensures clean architecture without legacy constraints.

---

**End of PRD**
