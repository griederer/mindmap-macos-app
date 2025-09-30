# PRD: Image Lightbox Feature

## Problem Statement
Users can upload images to nodes and view them as small thumbnails in the info panel. However, thumbnails are too small to see details clearly. Users need a way to view images at full size for better visibility.

## User Story
**As a** mindmap user
**I want to** click on a thumbnail image
**So that** I can view it at full size in a modal overlay

## Key User Actions
1. User views node info panel with image thumbnails
2. User clicks on any thumbnail image
3. App displays full-size image in modal overlay
4. User clicks X button or overlay background to close modal
5. Modal closes, returns to normal view

## Success Criteria
- [x] Clicking thumbnail opens lightbox modal
- [x] Full-size image displays centered in modal
- [x] Dark overlay appears behind image
- [x] X close button visible in top-right corner
- [x] Clicking X or overlay background closes modal
- [x] ESC key also closes modal
- [x] Modal works for all images in info panel
- [x] Smooth fade in/out transitions

## Technical Requirements

### HTML Structure
```html
<div class="lightbox-overlay" id="lightboxOverlay">
    <div class="lightbox-content">
        <button class="lightbox-close" id="lightboxClose">✕</button>
        <img class="lightbox-image" id="lightboxImage" src="" alt="Full size image">
    </div>
</div>
```

### CSS Styling
- Overlay: Full screen, semi-transparent black background
- Image: Centered, max 90% viewport width/height, maintain aspect ratio
- Close button: Fixed position top-right, visible on dark background
- Transitions: 300ms fade in/out for smooth UX

### JavaScript Functionality
1. Add click listeners to all thumbnail images
2. On click: Get image src, display in lightbox
3. Show lightbox with fade-in animation
4. Close on: X button click, overlay click, ESC key
5. Hide lightbox with fade-out animation

## Non-Goals
- Image zoom/pan controls
- Multiple image gallery navigation
- Image editing or rotation
- Download image functionality
- Pinch-to-zoom gestures

## Technical Approach

### File Changes Required
1. **index.html**: Add lightbox HTML structure before `</body>`
2. **styles.css**: Add lightbox styles (.lightbox-overlay, .lightbox-content, etc.)
3. **mindmap-engine.js**: Add `setupImageLightbox()` and event handlers

### Implementation Steps
1. Add lightbox HTML markup to index.html
2. Create CSS styles for lightbox overlay and content
3. Create `setupImageLightbox()` method in MindmapEngine
4. Call `setupImageLightbox()` from constructor
5. Add click event delegation for dynamically created images
6. Add close event handlers (X button, overlay, ESC key)

## Testing Strategy

### Manual Tests
1. **Basic Functionality**
   - Click thumbnail → Lightbox opens with full-size image
   - Image centered and properly sized
   - Close button visible

2. **Close Methods**
   - Click X button → Lightbox closes
   - Click dark overlay → Lightbox closes
   - Press ESC key → Lightbox closes

3. **Multiple Images**
   - Click different thumbnails → Correct image displays
   - Switch between images works correctly

4. **Edge Cases**
   - Very large images → Scales to fit viewport
   - Very small images → Displays without stretching
   - Multiple rapid clicks → No duplicate overlays

## Design Specs

### Visual Design
- **Overlay Background**: rgba(0, 0, 0, 0.9) - 90% black
- **Close Button**:
  - Size: 40px × 40px
  - Position: 20px from top-right
  - Background: rgba(255, 255, 255, 0.2)
  - Color: white
  - Border-radius: 50%
  - Hover: rgba(255, 255, 255, 0.3)
- **Image**:
  - Max-width: 90vw
  - Max-height: 90vh
  - Object-fit: contain
  - Box-shadow: 0 4px 20px rgba(0,0,0,0.5)

### Animations
- Fade in: 300ms ease-out
- Fade out: 200ms ease-in
- Close button hover: 150ms ease

## Implementation Timeline
- Task 1.1-1.3: Add HTML structure (5 min)
- Task 2.1-2.4: Add CSS styles (15 min)
- Task 3.1-3.4: Implement JavaScript logic (20 min)
- Task 4.1-4.3: Manual testing (10 min)

**Total Estimated Time**: 50 minutes