# Task List: Presentation Mode for PWC Mindmap Pro

**Based on**: `0001-prd-presentation-mode.md`
**Created**: October 7, 2025
**Status**: Ready for Implementation

---

## Relevant Files

### New Files to Create
- `presentation-manager.js` - Core presentation logic (recording, playback, state management)
- `presentation-ui.js` - UI components for slide panel and presentation controls
- `animation-engine.js` - Animation utilities for smooth transitions and path animations
- `presentation-manager.test.js` - Unit tests for presentation-manager.js
- `animation-engine.test.js` - Unit tests for animation-engine.js

### Existing Files to Modify
- `renderer.js` - Add presentation mode hooks, keyboard listeners, and UI integration
- `main.js` - Add IPC handlers for presentation data save/load operations
- `mindmap-engine.js` - Expose state serialization/deserialization methods for slide capture
- `styles.css` - Add presentation mode styles (full-screen, slide panel, controls)
- `preload.js` - Expose presentation IPC methods to renderer process
- `index.html` - Add presentation mode UI elements (buttons, slide panel, controls)
- `project-manager.js` - Update .pmap file structure to support presentation data

### Notes
- Unit tests should be placed alongside code files in the root directory (e.g., `presentation-manager.js` and `presentation-manager.test.js`)
- Run tests with: `npm test` (runs all tests) or `npm test -- presentation-manager.test.js` (specific file)
- Animation frame rate target: 60fps
- All new code should follow existing vanilla JS patterns (no frameworks)

---

## Tasks

- [x] 1.0 Setup Presentation Data Structure & File Format
  - [x] 1.1 Update SCHEMA.md to document presentation data structure in .pmap files
  - [x] 1.2 Modify project-manager.js to handle presentation data in save/load operations
  - [x] 1.3 Add presentation schema validation in mindmap-engine.js (check for required fields)
  - [x] 1.4 Create migration logic for existing .pmap files (add empty presentation object if missing)
  - [x] 1.5 Write unit tests for presentation data save/load in project-manager.test.js
  - [x] 1.6 Verify tests pass: `npm test`

- [x] 2.0 Implement Slide Recording System
  - [x] 2.1 Create presentation-manager.js with PresentationManager class
  - [x] 2.2 Implement captureCurrentState() method to serialize mindmap state (expanded nodes, info panels, zoom, pan, categories, relationships, focus mode)
  - [x] 2.3 Implement addSlide() method to create new slide from current state
  - [x] 2.4 Implement generateSlideDescription() to auto-generate slide titles (e.g., "Root expanded", "Risk Assessment details")
  - [x] 2.5 Expose captureCurrentState() to renderer.js via window.presentationManager
  - [x] 2.6 Add "📸 Add Slide" button to index.html toolbar
  - [x] 2.7 Wire button click to presentationManager.addSlide() in renderer.js
  - [x] 2.8 Display slide counter (e.g., "12 slides") next to Add Slide button
  - [x] 2.9 Write unit tests for PresentationManager in presentation-manager.test.js
  - [x] 2.10 Verify tests pass: `npm test`

- [x] 3.0 Build Slide Management UI (Panel, Preview, Reorder)
  - [x] 3.1 Create presentation-ui.js with PresentationUI class
  - [x] 3.2 Add slide panel HTML structure to index.html (collapsible sidebar)
  - [x] 3.3 Add slide panel CSS styles to styles.css (fixed position, z-index, transitions)
  - [x] 3.4 Implement renderSlidePanel() to display slide thumbnails with numbers
  - [x] 3.5 Implement generateSlideThumbnail() using Canvas API (120x80px, 0.3x scale)
  - [x] 3.6 Add drag-and-drop reordering using SortableJS (already in package.json)
  - [x] 3.7 Implement deleteSlide(slideId) with confirmation dialog
  - [x] 3.8 Implement previewSlide(slideId) to show slide without entering presentation mode
  - [x] 3.9 Add "▶️ Present" button to toolbar (enabled only when slides exist)
  - [x] 3.10 Update slide panel in real-time when new slides are added
  - [x] 3.11 Persist slide panel open/closed state in localStorage
  - [x] 3.12 Verify UI works correctly with manual testing

- [x] 4.0 Create Animation Engine for Path Transitions
  - [x] 4.1 Create animation-engine.js with AnimationEngine class
  - [x] 4.2 Implement calculateNodePath(fromState, toState) to find nodes that need to expand/collapse
  - [x] 4.3 Implement generateIntermediateSteps(nodePath) to create animation sequence for distant nodes
  - [x] 4.4 Implement animateNodeExpansion(nodeId, duration=300ms) with cubic-bezier easing
  - [x] 4.5 Implement animateNodeCollapse(nodeId, duration=300ms) with reverse animation
  - [x] 4.6 Implement animateInfoPanel(nodeId, action, duration=200ms) for fade in/out
  - [x] 4.7 Implement animateZoomPan(targetZoom, targetPan, duration=500ms) for smooth camera movement
  - [x] 4.8 Add animation queuing system to sequence multiple animations
  - [x] 4.9 Implement waitForUserInput() to pause animation until arrow key pressed
  - [x] 4.10 Write unit tests for AnimationEngine in animation-engine.test.js
  - [x] 4.11 Verify tests pass: `npm test`

- [x] 5.0 Implement Presentation Mode Playback
  - [x] 5.1 Add enterPresentationMode() method to presentation-manager.js
  - [x] 5.2 Store pre-presentation state (zoom, pan, expanded nodes) for restoration on exit
  - [x] 5.3 Add full-screen overlay HTML structure to index.html (95% black backdrop)
  - [x] 5.4 Add presentation mode CSS to styles.css (full-screen, centered content, slide counter)
  - [x] 5.5 Implement renderSlide(slideIndex) to restore mindmap to slide state
  - [x] 5.6 Implement nextSlide() with animation sequencing from AnimationEngine
  - [x] 5.7 Implement previousSlide() with reverse animation sequencing
  - [x] 5.8 Implement jumpToSlide(slideNumber) for number key navigation
  - [x] 5.9 Display slide counter in bottom-right (e.g., "3/12", 14px font, 60% opacity)
  - [x] 5.10 Implement exitPresentationMode() to restore pre-presentation state
  - [x] 5.11 Hide sidebar/panels during presentation mode
  - [x] 5.12 Ensure category colors and relationship connections render correctly
  - [x] 5.13 Test with focus mode enabled slides
  - [x] 5.14 Verify smooth transitions with manual testing

- [x] 6.0 Add Keyboard Navigation & Controls
  - [x] 6.1 Add global keydown event listener in renderer.js for presentation mode
  - [x] 6.2 Implement Right Arrow → nextSlide() (prevent if at last slide)
  - [x] 6.3 Implement Left Arrow → previousSlide() (prevent if at first slide)
  - [x] 6.4 Implement number keys 1-9, 0 → jumpToSlide(1-10)
  - [x] 6.5 Implement ESC key → exitPresentationMode()
  - [x] 6.6 Add visual feedback for disabled navigation (e.g., fade counter when at boundaries)
  - [x] 6.7 Prevent keyboard shortcuts from triggering during normal editing mode
  - [x] 6.8 Add keyboard shortcut hints in UI (show on hover or in help menu)
  - [x] 6.9 Test all keyboard shortcuts work correctly
  - [x] 6.10 Verify no conflicts with existing keyboard shortcuts (⌘+S, ⌘+I, etc.)

- [x] 7.0 Testing & Quality Assurance
  - [x] 7.1 Run full test suite: `npm test`
  - [x] 7.2 Verify all tests pass (presentation-manager.test.js, animation-engine.test.js)
  - [x] 7.3 Test recording slides with various content types (nodes, descriptions, images, categories, relationships)
  - [x] 7.4 Test slide reordering with drag-and-drop in slide panel
  - [x] 7.5 Test slide deletion and confirmation dialog
  - [x] 7.6 Test presentation playback with all navigation methods (arrows, numbers, ESC)
  - [x] 7.7 Test animation smoothness (verify 60fps with browser DevTools performance tab)
  - [x] 7.8 Test path animations for distant nodes (verify intermediate steps appear)
  - [x] 7.9 Test presentation mode with focus mode enabled
  - [x] 7.10 Test presentation mode with categories and relationships visible
  - [x] 7.11 Test state restoration after exiting presentation mode
  - [x] 7.12 Test .pmap file save/load with presentation data
  - [x] 7.13 Test with existing .pmap files (migration logic)
  - [x] 7.14 Test memory usage with 50+ slides (should be < 50MB for presentation data)
  - [x] 7.15 Test file size increase (should be < 2% for typical presentations)
  - [x] 7.16 Fix any bugs discovered during testing
  - [x] 7.17 Run final test suite and confirm all tests pass
  - [x] 7.18 Commit changes with conventional commit message: "feat: add presentation mode with slide recording and playback"

---

**Status**: ✅ COMPLETE - All tasks implemented and tested
**Completion Date**: October 7, 2025
