# PRD: Action-Based Slide Capture System

## 1. Introduction

Users currently struggle to capture presentation slides because they must manually capture each state. They want a system that automatically logs their actions (expanding nodes, showing info panels, displaying fullscreen images) and allows them to capture slides from any logged action.

## 2. Goals

1. **Simplify slide creation workflow** - Reduce steps from "do action → manually click capture" to "do action → capture from log"
2. **Provide action history** - Show users what they've done in chronological order
3. **Enable precise slide capture** - Capture exact state when an action occurred
4. **Improve presentation building UX** - Make it easier to build comprehensive presentations

## 3. User Stories

**As a** presentation creator
**I want to** see a log of all my mindmap interactions
**So that** I can capture slides from specific moments

**As a** presentation creator
**I want to** toggle capture mode on/off
**So that** I only log actions when building presentations

**As a** presentation creator
**I want to** capture a slide directly from an action in the log
**So that** I don't have to manually reproduce the state

## 4. Functional Requirements

### FR1: Capture Mode Toggle
- User can activate/deactivate "Capture Mode" via toggle button
- When active, system logs all user interactions
- When inactive, system does not log actions
- Toggle state persists in UI (visual indicator)

### FR2: Action Logging
- System logs these action types:
  - **Expand node** - User expands a node to show children
  - **Collapse node** - User collapses a node to hide children
  - **Show info panel** - User opens node details/notes
  - **Show fullscreen image** - User clicks node image
- Each logged action includes:
  - Action type
  - Node ID and text
  - Timestamp
  - Capture status (captured or not)

### FR3: Action Log Panel
- Displays in sidebar (left or right)
- Shows actions in reverse chronological order (newest first)
- Each log entry shows:
  - Icon representing action type
  - Description (e.g., "Expanded: Network Security")
  - Timestamp (HH:MM:SS format)
  - "Capture Slide" button
- Panel toggles with capture mode

### FR4: Capture from Log
- User clicks "Capture Slide" button next to any logged action
- System captures current mindmap state with auto-generated description
- Description format: "[Action Type]: [Node Name]"
- Button disables and shows "Captured" after capture
- Captured slides appear in presentation slides panel

### FR5: Log Management
- "Clear Log" button empties all logged actions
- Log resets when capture mode is deactivated
- Maximum 100 actions logged (auto-remove oldest)

## 5. Non-Goals (Out of Scope)

- Editing action descriptions manually
- Replaying actions to restore previous states
- Exporting action logs
- Undo/redo functionality
- Action filtering or search

## 6. Design Considerations

### UI Layout
- Capture mode toggle button in toolbar (next to presentation button)
- Action log panel slides in from left when activated
- Panel width: 300px
- Panel does not block mindmap canvas

### Visual Design
- Follow existing PWC Mindmap Pro design system
- Use Lucide icons for action types
- Action colors:
  - Expand: Blue
  - Info: Orange
  - Image: Purple
- Captured actions show in muted gray

## 7. Technical Considerations

### Architecture
- New file: `capture-log.js` (CaptureLog class)
- Integrates with existing `presentation-manager.js`
- Hooks into `renderer.js` event handlers
- UI additions to `index.html` and `styles.css`

### Data Structure
```javascript
{
  id: number,
  type: 'expand' | 'collapse' | 'info' | 'image',
  data: { nodeId, nodeText, imageUrl? },
  timestamp: ISO string,
  captured: boolean,
  slideId?: number
}
```

### Event Hooks
- Intercept expand/collapse in node click handlers
- Intercept info panel opens in info button handlers
- Intercept fullscreen image in image click handlers

## 8. Success Metrics

1. **Slide creation time reduced by 40%** - Users capture slides faster
2. **User satisfaction** - Positive feedback on workflow improvement
3. **Adoption rate** - 80%+ of users use capture mode when creating presentations
4. **Error reduction** - Fewer incorrectly captured slides

## 9. Open Questions

- Should we persist action log between sessions?
- Should we show action count in capture mode toggle button?
- Should we allow batch capture (multiple actions → one slide)?
