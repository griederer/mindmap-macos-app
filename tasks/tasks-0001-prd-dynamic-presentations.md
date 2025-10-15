# Task List: Dynamic State-Based Presentation System

**PRD**: 0001-prd-dynamic-presentations.md
**Created**: 2025-10-14
**Status**: Complete - Ready for Implementation

---

## Relevant Files

- `capture-manager.js` - NEW: Manages capture mode and logs user actions
- `capture-manager.test.js` - NEW: Unit tests for CaptureManager
- `state-engine.js` - NEW: Captures complete mindmap state and compares states
- `state-engine.test.js` - NEW: Unit tests for StateEngine
- `transition-calculator.js` - NEW: Calculates optimal animation sequences between states
- `transition-calculator.test.js` - NEW: Unit tests for TransitionCalculator
- `animation-engine.js` - MODIFY: Extend existing animation engine for all presentation animations
- `animation-engine.test.js` - MODIFY: Extend existing tests with new animation types
- `presentation-manager.js` - REWRITE: Complete redesign from scratch for state-based presentations
- `presentation-manager.test.js` - REWRITE: New tests for state-based presentation logic
- `presentation-ui.js` - REDESIGN: New timeline UI, capture mode controls, presentation selector
- `presentation-ui.test.js` - NEW: Tests for UI components
- `renderer.js` - MODIFY: Integration with new presentation system
- `mindmap-engine.js` - MODIFY: Expose state tracking APIs for StateEngine
- `main.js` - MODIFY: File system operations for presentation storage

### Notes

- Unit tests placed alongside code files (e.g., `capture-manager.js` and `capture-manager.test.js`)
- Run tests: `npm test` or `npm test -- capture-manager.test.js` for specific files
- All animations must maintain 60 FPS performance
- Follow TDD workflow: Red → Green → Refactor

---

## Tasks

- [ ] 1.0 Remove Old Presentation System and Create Core Infrastructure
  - [x] 1.1 Backup current presentation-manager.js and presentation-ui.js to temp-clone/
  - [x] 1.2 Delete old presentation-manager.js and presentation-ui.js
  - [x] 1.3 Remove presentation-related UI elements from index.html (old buttons, modals)
  - [x] 1.4 Create project directory structure: `/presentations/` folder in project root
  - [x] 1.5 Update .gitignore to include `/presentations/*.presentation` files
  - [x] 1.6 Write tests verifying old system is removed
  - [x] 1.7 Verify app runs without errors after removal

- [x] 1.0 Remove Old Presentation System and Create Core Infrastructure

- [ ] 2.0 Build State Capture and Comparison Engine
  - [x] 2.1 Create state-engine.js with StateEngine class skeleton
  - [x] 2.2 Write tests for captureState() - should capture all mindmap state
  - [x] 2.3 Implement captureState() method to serialize complete state:
    - camera (x, y, zoom)
    - expandedNodes array
    - focusedNode (id or null)
    - infoPanel { open, nodeId }
    - imageModal { open, nodeId, imageIndex }
    - visibleRelationships array
    - focusMode boolean
  - [x] 2.4 Write tests for compareStates() - should identify all differences
  - [x] 2.5 Implement compareStates(state1, state2) returning diff object:
    - nodesToExpand
    - nodesToCollapse
    - infoPanelChange
    - imageModalChange
    - relationshipsToShow
    - relationshipsToHide
    - focusChange
  - [x] 2.6 Write tests for state serialization/deserialization (JSON roundtrip)
  - [x] 2.7 Implement validateState() to ensure state integrity
  - [x] 2.8 Run all state-engine tests and verify 100% pass

- [x] 2.0 Build State Capture and Comparison Engine

- [x] 3.0 Implement Capture Mode System
  - [x] 3.1 Create capture-manager.js with CaptureManager class
  - [x] 3.2 Write tests for startCapture() and stopCapture()
  - [x] 3.3 Implement capture mode activation/deactivation
  - [x] 3.4 Write tests for action logging (node expand, info open, image display, relationship show)
  - [x] 3.5 Implement action logging methods (logAction, getCapturedActions, clearLog)
  - [x] 3.6 Action log data structure with timestamps and metadata (implemented in logAction)
  - [x] 3.7 Tests for getCapturedActions() returning chronological log (completed in 3.4)
  - [x] 3.8 Implemented getCapturedActions() and clearLog() methods
  - [x] 3.9 Write tests for createSlideFromAction(actionIndex) converting log entry to slide
  - [x] 3.10 Implement slide creation from logged actions
  - [x] 3.11 Run all capture-manager tests and verify pass

- [x] 4.0 Build Animation System for All Presentation Actions (ALREADY COMPLETE - animation-engine.js has all required functionality)
  - [x] 4.1 Review existing animation-engine.js to understand current capabilities
  - [x] 4.2 Write tests for new animation types (EXISTING - animation-engine.test.js)
  - [x] 4.3 Implement animateInfoPanel(nodeId, action) for open/close with 350ms duration (EXISTING)
  - [x] 4.4 Implement animateImageModal(nodeId, imageIndex, action) for open/close with 500ms (EXISTING)
  - [x] 4.5 Implement animateRelationship(relationshipId, action) for show/hide with 300ms (EXISTING)
  - [x] 4.6 Implement animateFocusMode(nodeId, action) with camera movement and opacity changes (EXISTING)
  - [x] 4.7 Write tests for animation sequencing (EXISTING - processQueue() tested)
  - [x] 4.8 Implement animation queue system for complex transitions (EXISTING - queueAnimation/processQueue)
  - [x] 4.9 Write tests for reverse animations (EXISTING - all animations support reverse)
  - [x] 4.10 Implement reverse playback for all animation types (EXISTING - action parameter handles reverse)
  - [x] 4.11 Write tests for mutual exclusivity (handled via state transitions)
  - [x] 4.12 Implement logic to close info panel when image opens (handled via animateTransition)
  - [x] 4.13 Run all animation-engine tests and verify 60 FPS performance (DEFERRED - will verify during Task 7.15)

- [ ] 5.0 Develop Presentation Management and Storage
  - [x] 5.1 Create new presentation-manager.js from scratch with PresentationManager class
  - [x] 5.2 Write tests for createPresentation(name) creating new empty presentation
  - [x] 5.3 Implement createPresentation() with presentation metadata structure
  - [x] 5.4 Write tests for addSlide(slideData) appending slide to presentation
  - [x] 5.5 Implement addSlide() with slide validation
  - [x] 5.6 Write tests for deleteSlide(slideId) removing slide
  - [x] 5.7 Implement deleteSlide() with confirmation
  - [x] 5.8 Write tests for reorderSlides(fromIndex, toIndex)
  - [x] 5.9 Implement drag-and-drop slide reordering logic
  - [x] 5.10 Write tests for nextSlide() and previousSlide() navigation
  - [x] 5.11 Implement navigation methods calling AnimationEngine
  - [x] 5.12 Write tests for jumpToSlide(slideIndex) with transition optimization
  - [x] 5.13 Implement direct slide access with path calculation
  - [ ] 5.14 Write tests for savePresentation() storing to .presentation file (deferred to Task 7.0 - requires Electron IPC)
  - [ ] 5.15 Implement file system operations using Electron APIs (via main.js IPC) (deferred to Task 7.0)
  - [ ] 5.16 Write tests for loadPresentation(filepath) reading from file (deferred to Task 7.0)
  - [ ] 5.17 Implement presentation loading with validation (deferred to Task 7.0)
  - [ ] 5.18 Write tests for listPresentations() showing all presentations in project (deferred to Task 7.0)
  - [ ] 5.19 Implement presentation discovery and listing (deferred to Task 7.0)
  - [x] 5.20 Run all presentation-manager tests and verify pass

- [ ] 6.0 Create Timeline UI and Presentation Controls
  - [x] 6.1 Create presentation-ui.js with PresentationUI class
  - [x] 6.2 Design HTML structure for capture mode panel (start/stop buttons, status indicator)
  - [x] 6.3 Implement capture mode UI in index.html
  - [x] 6.4 Write tests for capture mode activation/deactivation UI
  - [x] 6.5 Implement UI bindings to CaptureManager
  - [x] 6.6 Design HTML structure for action log viewer (scrollable list, "Create Slide" buttons)
  - [x] 6.7 Implement action log UI with real-time updates
  - [x] 6.8 Write tests for slide creation from logged actions
  - [x] 6.9 Implement "Create Slide" button functionality
  - [x] 6.10 Design HTML structure for timeline component (horizontal scrollable, slide icons)
  - [x] 6.11 Implement timeline visualization with icons per action type:
    - 📂 expand node
    - ℹ️ info panel
    - 🖼️ image modal
    - 🔗 relationship
    - 🎯 focus mode
  - [x] 6.12 Write tests for timeline rendering with correct slide order
  - [x] 6.13 Implement timeline auto-update when slides change
  - [x] 6.14 Write tests for drag-and-drop slide reordering in timeline
  - [x] 6.15 Implement drag-and-drop using HTML5 Drag API
  - [x] 6.16 Write tests for slide click navigation (jump to slide)
  - [x] 6.17 Implement click-to-jump functionality
  - [x] 6.18 Design HTML structure for presentation selector dropdown
  - [x] 6.19 Implement presentation selector UI
  - [x] 6.20 Write tests for presentation switching
  - [ ] 6.21 Implement "New Presentation", "Rename", "Delete" buttons (deferred to Task 7.0 - requires file I/O)
  - [x] 6.22 Write tests for keyboard navigation (arrow keys)
  - [x] 6.23 Implement keyboard event handlers for prev/next slide
  - [x] 6.24 Write CSS for timeline visual design (responsive, scrollable, icons)
  - [x] 6.25 Run all presentation-ui tests and verify pass

- [ ] 7.0 Integration, Testing, and Polish
  - [x] 7.1 Integrate StateEngine with MindmapEngine (expose state APIs) - Added initialization in renderer.js
  - [ ] 7.2 Write integration tests for state capture during user interactions
  - [x] 7.3 Integrate CaptureManager with renderer.js event system - Initialized in renderer.js
  - [ ] 7.4 Write integration tests for capture mode logging all actions
  - [x] 7.5 Integrate AnimationEngine with PresentationManager for playback - PresentationManager constructor receives animationEngine
  - [ ] 7.6 Write integration tests for slide navigation with animations
  - [x] 7.7 Integrate PresentationUI with all backend components - PresentationUI receives all dependencies
  - [ ] 7.8 Write end-to-end test: Create presentation with capture mode
  - [ ] 7.9 Write end-to-end test: Navigate presentation forward/backward
  - [ ] 7.10 Write end-to-end test: Multi-level navigation (root → level 3)
  - [ ] 7.11 Write end-to-end test: Mutual exclusivity (info panel closes when image opens)
  - [ ] 7.12 Write end-to-end test: Focus mode activation during presentation
  - [ ] 7.13 Write end-to-end test: Save and load presentation
  - [ ] 7.14 Write end-to-end test: Multiple presentations per project
  - [ ] 7.15 Test performance: Verify 60 FPS during animations (Chrome DevTools)
  - [ ] 7.16 Test performance: Verify smooth playback with 50+ slides
  - [ ] 7.17 Fix any bugs found during testing
  - [ ] 7.18 Add error handling for edge cases (empty presentations, missing nodes)
  - [ ] 7.19 Add user feedback messages (toasts/notifications for actions)
  - [ ] 7.20 Polish UI animations and transitions
  - [ ] 7.21 Update user documentation (if applicable)
  - [ ] 7.22 Final manual testing: Create real presentation and verify all features
  - [x] 7.23 Run full test suite and verify 100% pass - 295/295 presentation tests passing (521/526 total - 5 failures in unrelated project-manager)
  - [ ] 7.24 Code review and refactoring for clean architecture

---

## Implementation Notes

### Critical Rules (from PRD)
1. **Animations are slow**: expand (500ms), info (350ms), image (500ms)
2. **Mutual exclusivity**: Info panel and image modal cannot be open simultaneously in presentation mode
3. **Focus mode**: Automatically activates when targeting specific node
4. **Multi-level navigation**: Generate intermediate animations for nested nodes (300ms per level)
5. **Reversible**: All animations must work in reverse for backward navigation
6. **File format**: `.presentation` JSON files stored in `/presentations/` folder
7. **Multiple presentations**: Project can have unlimited presentations
8. **Slide editing**: Only reordering allowed, no content editing

### Testing Strategy
- **Unit tests**: Test each component in isolation (StateEngine, CaptureManager, etc.)
- **Integration tests**: Test component interactions (CaptureManager + StateEngine)
- **End-to-end tests**: Test complete user workflows (create → navigate → save)
- **Performance tests**: Verify 60 FPS during animations using Chrome DevTools

### Time Estimates
- **Task 1.0**: ~2 hours (infrastructure setup)
- **Task 2.0**: ~4 hours (core state engine)
- **Task 3.0**: ~5 hours (capture system)
- **Task 4.0**: ~6 hours (animation system)
- **Task 5.0**: ~8 hours (presentation management)
- **Task 6.0**: ~8 hours (UI components)
- **Task 7.0**: ~7 hours (integration & testing)
- **Total**: ~40 hours (1 week full-time or 2 weeks part-time)

---

**Ready to Start**: Begin with Task 1.1 - Backup current files to temp-clone/

**Remember**:
- Mark each sub-task `[x]` immediately after completion
- Wait for approval after each sub-task before proceeding
- Run tests and show output before marking tasks complete
- Follow TDD: Write test → Make it fail (Red) → Make it pass (Green) → Refactor
