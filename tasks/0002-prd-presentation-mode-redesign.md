# PRD: Canvas-Based Presentation Mode Redesign

## 1. Introduction

The current presentation mode shows a black fullscreen overlay and doesn't respond properly to arrow key navigation. Users need a presentation mode that works directly on the canvas, smoothly transitioning between captured slide states while maintaining the mindmap visualization.

## 2. Goals

1. **Eliminate black screen issue** - Remove fullscreen overlay approach
2. **Canvas-based presentation** - Show the mindmap canvas during presentations
3. **Smooth transitions** - Animate between captured states
4. **Responsive navigation** - Arrow keys properly navigate between slides
5. **Maintain context** - Keep mindmap visible throughout presentation

## 3. User Stories

**As a** presenter
**I want to** see the mindmap canvas during presentation mode
**So that** my audience can follow the visual structure

**As a** presenter
**I want to** navigate slides with arrow keys
**So that** I can smoothly move through my presentation

**As a** presenter
**I want to** see smooth transitions between slides
**So that** the presentation flow feels professional

**As a** presenter
**I want to** exit presentation mode easily
**So that** I can return to editing mode quickly

## 4. Functional Requirements

### FR1: Canvas-Based Display
- Presentation mode uses the existing mindmap canvas (NOT an overlay)
- Remove the fullscreen black overlay completely
- Canvas remains visible and interactive during presentation
- UI controls (toolbar, panels) hide during presentation mode

### FR2: State Capture & Restoration
- Each slide stores the mindmap state at capture time:
  - Pan position (x, y offset)
  - Zoom level
  - Expanded/collapsed nodes
  - Visible info panels
  - Fullscreen images (if any)
  - Active categories/relationships
- State restoration recreates the exact view when slide was captured

### FR3: Smooth Transitions
- Animated transitions between slide states:
  - Pan movement: ease-in-out animation (500ms)
  - Zoom changes: smooth scale animation (500ms)
  - Node expand/collapse: coordinated with pan/zoom
- Transitions run sequentially, not simultaneously
- Skip animation option (instant jump to slide)

### FR4: Navigation Controls
- **Arrow Right / Arrow Down**: Next slide
- **Arrow Left / Arrow Up**: Previous slide
- **Escape / Q**: Exit presentation mode
- **Home**: First slide
- **End**: Last slide
- **Number keys (1-9)**: Jump to slide number

### FR5: Presentation HUD
- Minimal heads-up display showing:
  - Current slide number / total slides (e.g., "3 / 12")
  - Slide description
  - Navigation hints (initially, fade after 3s)
- HUD positioned in bottom-left corner
- Semi-transparent background
- Keyboard shortcut to toggle HUD visibility (H key)

### FR6: Capture Enhancements
- When capturing a slide, store:
  ```javascript
  {
    id: number,
    description: string,
    timestamp: ISO string,
    state: {
      panX: number,
      panY: number,
      scale: number,
      expandedNodes: string[],
      visibleInfoPanels: string[],
      fullscreenImage: { nodeId, imageUrl }?,
      activeCategories: string[],
      activeRelationships: string[]
    }
  }
  ```

## 5. Technical Considerations

### Architecture Changes
- **New file**: `presentation-mode.js` (PresentationMode class)
- **Refactor**: `presentation-manager.js` to separate slide data from display logic
- **Update**: `mindmap-engine.js` to support state capture/restore
- **Update**: `renderer.js` for presentation mode initialization

### State Management
```javascript
class PresentationMode {
    constructor(mindmapEngine, presentationManager) {
        this.engine = mindmapEngine;
        this.manager = presentationManager;
        this.currentSlideIndex = 0;
        this.isActive = false;
    }

    start() {
        // Hide UI elements
        // Show HUD
        // Load first slide
        // Set up keyboard listeners
    }

    goToSlide(index) {
        // Get slide state
        // Animate to new state
        // Update HUD
    }

    animateToState(targetState) {
        // Calculate transition steps
        // Animate pan, zoom, node states
    }

    captureCurrentState() {
        // Return current mindmap state object
    }

    restoreState(state) {
        // Apply state to mindmap
    }
}
```

### Transition Logic
1. **Pan transition**: Interpolate from current (panX, panY) to target (panX, panY)
2. **Zoom transition**: Interpolate scale value
3. **Node states**: Expand/collapse nodes after pan/zoom complete
4. **Info panels**: Show/hide after node states applied
5. **Images**: Display fullscreen image (if any) after all transitions

### Performance Optimization
- Pre-calculate transition paths
- Use `requestAnimationFrame` for smooth animation
- Debounce rapid key presses
- Cache rendered node positions

## 6. Non-Goals (Out of Scope)

- Slide reordering in presentation mode
- Speaker notes or teleprompter
- Slide thumbnails preview
- Remote control support
- Recording presentations
- Exporting presentations to video/PDF

## 7. Design Considerations

### Visual Design
- HUD styling matches PWC Mindmap Pro design system
- Transition animations feel natural (not jarring)
- Loading indicator during state transitions
- Error state if slide data is corrupted

### User Experience
- Presentation mode should feel like "guided canvas navigation"
- Minimal disruption between editing and presenting
- Clear visual feedback for current state
- Graceful handling of edge cases (empty slides, missing nodes)

## 8. Success Metrics

1. **Black screen eliminated** - No more fullscreen overlay
2. **Navigation works** - Arrow keys properly move between slides
3. **Smooth transitions** - Pan/zoom animations feel professional
4. **User satisfaction** - Positive feedback on presentation flow
5. **Performance** - Transitions complete in < 500ms

## 9. Migration Strategy

### Backward Compatibility
- Existing slides without state data show warning
- Prompt user to re-capture slides with new system
- Old presentation mode removed completely

### Data Migration
- Add `state` field to existing slide objects (null if not captured with new system)
- Update capture flow to populate state data
- Clear localStorage presentation data if format incompatible

## 10. Open Questions

1. Should we auto-hide/show nodes based on viewport during presentation?
2. Should we support custom transition speeds?
3. Should we show a progress indicator during multi-step transitions?
4. How do we handle slides where nodes have been deleted since capture?

## 11. Implementation Phases

### Phase 1: State Capture System
- Implement state capture in capture-log.js
- Update slide data structure
- Add state restoration methods

### Phase 2: Presentation Mode Core
- Create PresentationMode class
- Implement navigation (without transitions)
- Add keyboard controls

### Phase 3: Transition System
- Implement pan/zoom animations
- Add node state transitions
- Coordinate multi-step transitions

### Phase 4: HUD and Polish
- Create presentation HUD
- Add visual indicators
- Handle edge cases
- Performance optimization
