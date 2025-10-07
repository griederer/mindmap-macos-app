# PRD-0001: Presentation Mode for PWC Mindmap Pro

## Introduction/Overview

PWC Mindmap Pro currently allows users to create and edit mindmaps but lacks a way to present them dynamically to audiences. This feature introduces a **Presentation Mode** that captures the user's exploration of a mindmap as a sequence of slides, enabling presenters to showcase mindmaps with smooth animations of branch expansions, node details, images, and relationships.

**Problem**: Users cannot effectively present their mindmaps in meetings or presentations. They must manually expand/collapse nodes, which is distracting and unprofessional.

**Solution**: A presentation mode that:
1. Lets users **record** their mindmap exploration as slides
2. **Plays back** the exploration with smooth animations
3. Supports **navigation** with keyboard arrows
4. Shows **dynamic content** (categories, relationships, focus mode states)

---

## Goals

1. **Enable dynamic mindmap presentations** with smooth branch expansion/collapse animations
2. **Capture user interactions** as replayable presentation slides
3. **Support multiple content types**: node overviews, descriptions, images, categories, relationships
4. **Provide intuitive navigation** with keyboard shortcuts (arrows, numbers, ESC)
5. **Maintain mindmap visual fidelity** during presentations (colors, connections, layout)
6. **Save presentation sequences** within `.pmap` files for reusability

---

## User Stories

### US-1: Recording Presentation Slides
**As a** mindmap creator
**I want to** record my exploration of the mindmap as presentation slides
**So that** I can replay the same sequence during presentations without manual clicking

**Acceptance Criteria:**
- "📸 Add Slide" button visible when not in presentation mode
- Each user action (expand, open info, view image) can be captured as a slide
- Slides are numbered sequentially (Slide 1, Slide 2, etc.)
- User can see current slide count

### US-2: Playing Presentation
**As a** presenter
**I want to** play my recorded presentation with keyboard navigation
**So that** I can focus on speaking instead of manipulating the mindmap

**Acceptance Criteria:**
- Dedicated "▶️ Present" button launches presentation mode
- Right arrow advances to next slide with animation
- Left arrow returns to previous slide with reverse animation
- ESC key exits presentation mode
- Slide counter shows "3/12" format

### US-3: Smart Path Animation
**As a** presenter
**I want to** jump to distant nodes with animated intermediate steps
**So that** the audience understands the path through the mindmap hierarchy

**Acceptance Criteria:**
- When slide jumps to deep node, all parent branches expand sequentially
- Animation shows clear visual path from current state to target state
- Reverse navigation collapses branches in reverse order

### US-4: Slide Management
**As a** mindmap creator
**I want to** edit my presentation slide order and preview slides
**So that** I can refine the presentation flow before presenting

**Acceptance Criteria:**
- Slide panel shows thumbnails of all recorded slides
- Drag & drop reorders slides
- Delete button removes individual slides
- Preview button shows slide without entering full presentation mode

### US-5: Rich Content Display
**As a** presenter
**I want to** show node descriptions, images, categories, and relationships in slides
**So that** I can present all aspects of my mindmap

**Acceptance Criteria:**
- Slides can display node description (not notes)
- Slides can show node images full-screen
- Category colors visible on nodes during presentation
- Relationship connections rendered if active in recorded state
- Focus mode state preserved if enabled during recording

---

## Functional Requirements

### Recording Mode

**FR-1**: System MUST provide a "📸 Add Slide" button visible in normal editing mode
**FR-2**: System MUST capture current mindmap state when user clicks "Add Slide"
**FR-3**: System MUST record the following state per slide:
- Expanded/collapsed state of all nodes
- Open/closed state of node info panels
- Active image being viewed (if any)
- Category visibility and assigned categories
- Relationship connections visibility
- Focus mode state (focused node ID or null)
- Zoom level and pan position

**FR-4**: System MUST assign sequential slide numbers (1, 2, 3...) automatically
**FR-5**: System MUST show a slide counter indicating total slides recorded (e.g., "12 slides")

### Slide Management

**FR-6**: System MUST provide a "Slide Panel" UI component showing:
- Thumbnail preview of each slide
- Slide number
- Brief description (e.g., "Root expanded", "Risk Assessment details")

**FR-7**: System MUST allow drag-and-drop reordering of slides in the Slide Panel
**FR-8**: System MUST provide a delete button (🗑️) for each slide
**FR-9**: System MUST provide a preview button (👁️) to view slide without entering presentation mode
**FR-10**: System MUST update `.pmap` file structure to include presentation data:

```json
{
  "topic": "...",
  "nodes": [...],
  "presentation": {
    "slides": [
      {
        "id": 1,
        "expandedNodes": ["node-0", "node-1"],
        "openInfoPanels": ["node-5"],
        "activeImage": null,
        "focusedNode": null,
        "zoom": 1.0,
        "pan": { "x": 0, "y": 0 },
        "categoriesVisible": true,
        "relationshipsVisible": true
      }
    ]
  }
}
```

### Presentation Mode

**FR-11**: System MUST provide a "▶️ Present" button to launch presentation mode
**FR-12**: System MUST enter full-screen mode when presentation starts
**FR-13**: System MUST fit current slide content to screen automatically
**FR-14**: System MUST preserve all visual elements during presentation:
- Node category colors
- Relationship connection lines
- Canvas connections (Bezier curves)
- Node positions and layout

**FR-15**: System MUST display slide counter in format "3/12" (current/total)
**FR-16**: System MUST show slide counter in a non-intrusive position (bottom-right corner)

### Navigation Controls

**FR-17**: System MUST advance to next slide when user presses **Right Arrow** key
**FR-18**: System MUST return to previous slide when user presses **Left Arrow** key
**FR-19**: System MUST jump to specific slide when user presses **number keys** (1-9 for slides 1-9, 0 for slide 10)
**FR-20**: System MUST exit presentation mode when user presses **ESC** key
**FR-21**: System MUST prevent navigation beyond first slide (no action on Left Arrow at slide 1)
**FR-22**: System MUST prevent navigation beyond last slide (no action on Right Arrow at last slide)

### Animation Engine

**FR-23**: System MUST animate branch expansion with the following behavior:
- All children appear **simultaneously** (not one-by-one)
- Animation duration: **300ms**
- Easing: **cubic-bezier(0.4, 0, 0.2, 1)** (smooth deceleration)

**FR-24**: System MUST animate branch collapse with **reverse** of expansion animation
**FR-25**: System MUST show **intermediate steps** when jumping to distant nodes:
- Example: Jumping from root to `node-2-3-1` (3 levels deep)
  - Step 1: Expand level 1 parent (300ms)
  - Step 2: Expand level 2 parent (300ms)
  - Step 3: Expand level 3 to show target node (300ms)
  - Total animation time: ~900ms

**FR-26**: System MUST wait for user input before playing next animation (no auto-advance)
**FR-27**: System MUST smoothly transition node info panel open/close with fade animation (200ms)
**FR-28**: System MUST smoothly zoom/pan to fit slide content with animation (500ms)

### Content Display Types

**FR-29**: System MUST support the following slide content types:
- **Type A**: Node overview (title + collapsed state)
- **Type B**: Node with expanded children
- **Type C**: Node with description panel open (description only, not notes)
- **Type D**: Node image full-screen view
- **Type E**: Multiple nodes with categories highlighted
- **Type F**: Multiple nodes with relationship connections visible

**FR-30**: When displaying node description (Type C):
- System MUST show **description field only**
- System MUST NOT show notes field
- System MUST maintain description formatting (line breaks, etc.)

**FR-31**: When displaying node image (Type D):
- System MUST show image full-screen (maximize within viewport)
- System MUST maintain image aspect ratio
- System MUST show image caption/photographer credit if available

### State Preservation

**FR-32**: System MUST preserve the following during slide transitions:
- Category color assignments on nodes
- Relationship connection visibility (if enabled in recorded state)
- Focus mode state (if a node was focused during recording)
- Custom node positions (if manually positioned)

**FR-33**: System MUST restore exact mindmap state when exiting presentation mode (return to editing view with same zoom/pan/expanded nodes as before presentation started)

---

## Non-Goals (Out of Scope)

**NG-1**: **Recording/exporting to video** - No video export functionality (future v5.0)
**NG-2**: **Presenter notes separate from slides** - No hidden notes for presenter only
**NG-3**: **Multi-monitor support** - No separate presenter view on second display
**NG-4**: **Custom slide transitions** - No fade/slide/dissolve effects between slides (only expand/collapse animations)
**NG-5**: **Audio recording** - No voiceover or audio narration
**NG-6**: **Slide templates** - No pre-built slide layouts or themes
**NG-7**: **Collaboration features** - No real-time co-presenting or remote control
**NG-8**: **Export to PowerPoint/PDF** - No export to other presentation formats (future feature)

---

## Design Considerations

### UI Components

**Recording Mode UI:**
```
┌─────────────────────────────────────────────────────────┐
│  PWC Mindmap Pro                    📸 Add Slide  ▶️ Present │
│                                     (12 slides)           │
├─────────────────────────────────────────────────────────┤
│  [Mindmap canvas with nodes]                            │
│                                                          │
│  [Slide Panel - collapsible sidebar]                    │
│  ┌───────────────────┐                                  │
│  │ Slide 1: Root     │  [👁️] [🗑️]                        │
│  │ [thumbnail]       │                                  │
│  ├───────────────────┤                                  │
│  │ Slide 2: Level 1  │  [👁️] [🗑️]                        │
│  │ [thumbnail]       │                                  │
│  └───────────────────┘                                  │
└─────────────────────────────────────────────────────────┘
```

**Presentation Mode UI:**
```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│                                                          │
│                [Mindmap content                          │
│                 fitted to screen]                        │
│                                                          │
│                                                3/12       │
└─────────────────────────────────────────────────────────┘
         ← →  Navigate    [1-0] Jump    ESC Exit
```

### Visual Specifications

- **Slide counter**: 14px font, 60% opacity white text on dark background
- **Full-screen backdrop**: 95% opacity black overlay during presentation
- **Animation timing**: 300ms expand/collapse, 200ms info panel, 500ms zoom/pan
- **Thumbnail size**: 120px × 80px in slide panel
- **Button styling**: Consistent with existing PWC button theme

---

## Technical Considerations

### Architecture Changes

**New Components:**
1. `presentation-manager.js` - Core presentation logic
   - Slide recording
   - Slide playback
   - State capture/restoration

2. `presentation-ui.js` - UI components
   - Slide panel
   - Recording controls
   - Presentation controls

3. `animation-engine.js` - Animation utilities
   - Branch expansion sequencer
   - Path animation calculator
   - Smooth transitions

**Modified Files:**
- `renderer.js` - Add presentation mode hooks and keyboard listeners
- `main.js` - Add IPC handlers for presentation data save/load
- `mindmap-engine.js` - Expose state serialization methods
- `styles.css` - Add presentation mode styles

### Data Structure

Extend `.pmap` schema to include:
```json
{
  "version": "4.0.0",
  "presentation": {
    "slides": [
      {
        "id": 1,
        "description": "Root node overview",
        "expandedNodes": ["node-0"],
        "openInfoPanels": [],
        "activeImage": null,
        "focusedNode": null,
        "categoriesVisible": true,
        "relationshipsVisible": true,
        "zoom": 1.0,
        "pan": { "x": 0, "y": 0 }
      }
    ],
    "created": "2025-10-07T10:00:00.000Z",
    "modified": "2025-10-07T15:30:00.000Z"
  }
}
```

### Performance Constraints

- **Max slides per presentation**: 100 (reasonable limit for memory)
- **Thumbnail generation**: Use Canvas API with 0.3x scale for performance
- **Animation frame rate**: Target 60fps for smooth transitions
- **Memory usage**: < 50MB for presentation data (estimated 500KB per slide thumbnail)

### Integration Points

- **Keyboard shortcuts**: Register new handlers in `renderer.js`
- **IPC communication**: Add `presentation-save`, `presentation-load` channels
- **File watching**: Update `.pmap` watcher to detect presentation changes
- **Auto-save**: Include presentation data in 5-second auto-save cycle

---

## Success Metrics

**Adoption Metrics:**
- **70% of active users** create at least one presentation within 30 days of feature launch
- **Average 8 slides** per presentation

**Engagement Metrics:**
- **80% of presentations** are replayed at least once
- **50% of presentations** are edited/reordered after initial recording

**Quality Metrics:**
- **< 100ms latency** for slide navigation (perceived as instant)
- **0 animation frame drops** during transitions (60fps maintained)
- **95% user satisfaction** in post-feature survey

**Technical Metrics:**
- **< 2% increase** in `.pmap` file size with presentation data
- **Zero crashes** related to presentation mode in first 30 days

---

## Open Questions

**Q1**: Should we provide a "auto-record" mode that captures every user interaction automatically, or only manual "Add Slide" button clicks?
**Answer needed from**: Product team

**Q2**: Should slide thumbnails be generated in real-time (slower but accurate) or use canvas snapshots (faster but may miss details)?
**Answer needed from**: Engineering team

**Q3**: Should we limit the number of intermediate steps in path animations to prevent overly long transitions (e.g., max 5 levels deep)?
**Answer needed from**: UX team

**Q4**: Should presentations be exportable as standalone files that can be shared with non-app users (e.g., HTML export)?
**Answer needed from**: Product team (consider for v5.0)

**Q5**: Should we provide keyboard shortcut customization for presentation controls (e.g., Space instead of Right Arrow)?
**Answer needed from**: UX/Accessibility team

---

## Appendix: Example User Flow

### Scenario: Creating a Risk Management Presentation

**Step 1: Recording Slides**
1. User opens "Risk Management.pmap"
2. User clicks "📸 Add Slide" → **Slide 1**: Root node only
3. User expands "Risk Identification" branch
4. User clicks "📸 Add Slide" → **Slide 2**: Root + Risk Identification children
5. User opens info panel for "Threat Assessment" node
6. User clicks "📸 Add Slide" → **Slide 3**: Threat Assessment description visible
7. User collapses "Risk Identification", expands "Risk Mitigation"
8. User clicks "📸 Add Slide" → **Slide 4**: Risk Mitigation branch expanded
9. User selects image in "Cybersecurity Controls" node
10. User clicks "📸 Add Slide" → **Slide 5**: Cybersecurity image full-screen

**Step 2: Presenting**
1. User clicks "▶️ Present"
2. App enters full-screen, shows **Slide 1** (root only)
3. User presses **Right Arrow**
4. System animates expansion of "Risk Identification" branch → **Slide 2**
5. User presses **Right Arrow**
6. System opens info panel for "Threat Assessment" → **Slide 3**
7. User presses **Left Arrow**
8. System closes info panel, returns to → **Slide 2**
9. User presses **4** (number key)
10. System collapses "Risk Identification", expands "Risk Mitigation" → **Slide 4**
11. User presses **ESC**
12. App exits presentation mode, returns to editing view

---

**Document Version**: 1.0
**Created**: October 7, 2025
**Author**: PWC Mindmap Pro Team
**Status**: Ready for Task Generation
