# Task List: Canvas-Based Presentation Mode Redesign

## Relevant Files

- `presentation-mode.js` - NEW: PresentationMode class (canvas-based transitions)
- `capture-log.js` - Update: Store full state when capturing slides
- `renderer.js` - Update: Add state capture/restore methods
- `mindmap-engine.js` - Update: Add getExpandedNodes() helper
- `index.html` - Update: Add presentation HUD markup
- `styles.css` - Update: Add presentation mode styles

### Notes

- Pan/zoom controlled via CSS transform on `.mindmap-wrapper` (renderer.js:700-701)
- Scroll position via `container.scrollLeft/scrollTop` (renderer.js:1897)
- No tests required for this visual feature (manual testing)

## Tasks

- [x] 1.0 **Phase 1: State Capture System**
  - [x] 1.1 Add `captureCurrentState()` method to renderer.js
  - [x] 1.2 Add `getExpandedNodes()` helper to mindmap-engine.js
  - [x] 1.3 Update `captureFromAction()` in capture-log.js to store full state
  - [x] 1.4 Update slide data structure to include state field

- [x] 2.0 **Phase 2: State Restoration**
  - [x] 2.1 Add `restoreState()` method to renderer.js
  - [x] 2.2 Implement scroll restoration
  - [x] 2.3 Implement zoom restoration
  - [x] 2.4 Implement node expand/collapse restoration

- [x] 3.0 **Phase 3: PresentationMode Class**
  - [x] 3.1 Create presentation-mode.js with PresentationMode class
  - [x] 3.2 Implement start()/stop() methods
  - [x] 3.3 Implement keyboard navigation (arrow keys, ESC)
  - [x] 3.4 Implement goToSlide() method (without transitions initially)

- [ ] 4.0 **Phase 4: Smooth Transitions**
  - [ ] 4.1 Implement pan transition (scroll animation)
  - [ ] 4.2 Implement zoom transition (scale animation)
  - [ ] 4.3 Coordinate multi-step transitions
  - [ ] 4.4 Add easing functions for natural movement

- [ ] 5.0 **Phase 5: Presentation HUD**
  - [ ] 5.1 Add HUD markup to index.html
  - [ ] 5.2 Style HUD (bottom-left, semi-transparent)
  - [ ] 5.3 Display slide number and description
  - [ ] 5.4 Add toggle HUD visibility (H key)

- [ ] 6.0 **Phase 6: UI Integration**
  - [ ] 6.1 Hide UI elements during presentation (toolbar, panels)
  - [ ] 6.2 Add presentation mode button to toolbar
  - [ ] 6.3 Update presentation-manager.js integration
  - [ ] 6.4 Handle edge cases (empty slides, missing nodes)
