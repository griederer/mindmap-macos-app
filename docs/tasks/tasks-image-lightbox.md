# Task Breakdown: Image Lightbox Feature

## Task Progress
Total: 11 | Completed: 0 | In Progress: 0 | Remaining: 11

## High-Level Tasks

- [ ] 1.0 Add HTML structure for lightbox
  - [ ] 1.1 Add lightbox markup to index.html
  - [ ] 1.2 Position before closing body tag
  - [ ] 1.3 Verify structure in DOM inspector

- [ ] 2.0 Add CSS styles for lightbox
  - [ ] 2.1 Create overlay styles
  - [ ] 2.2 Create close button styles
  - [ ] 2.3 Create image container styles
  - [ ] 2.4 Add transitions and animations

- [ ] 3.0 Implement JavaScript functionality
  - [ ] 3.1 Create setupImageLightbox() method
  - [ ] 3.2 Add image click event listeners
  - [ ] 3.3 Implement show/hide lightbox logic
  - [ ] 3.4 Add close event handlers (X, overlay, ESC)

- [ ] 4.0 Manual testing and verification
  - [ ] 4.1 Test lightbox opens on image click
  - [ ] 4.2 Test all close methods work
  - [ ] 4.3 Test with multiple images

## Detailed Task Specifications

### 1.1 Add lightbox markup to index.html
**Location**: `index.html` (before `</body>` tag, after shortcuts modal)

**Code to Add**:
```html
<!-- Image Lightbox Modal -->
<div class="lightbox-overlay" id="lightboxOverlay">
    <div class="lightbox-content">
        <button class="lightbox-close" id="lightboxClose">✕</button>
        <img class="lightbox-image" id="lightboxImage" src="" alt="Full size image">
    </div>
</div>
```

**Acceptance Criteria**:
- HTML added before `</body>` tag
- IDs match specification
- Structure is clean and semantic

**Estimated Time**: 2 minutes

---

### 1.2 Position before closing body tag
**Location**: `index.html` (line ~450+)

**Acceptance Criteria**:
- Lightbox is last element before `</body>`
- Appears after all script tags
- Proper indentation maintained

**Estimated Time**: 1 minute

---

### 1.3 Verify structure in DOM inspector
**Testing Approach**: Chrome DevTools inspection

**Verification Steps**:
1. Reload app
2. Open DevTools (Cmd+Option+I)
3. Find `#lightboxOverlay` element
4. Verify all child elements present
5. Check IDs match specification

**Acceptance Criteria**:
- Element exists in DOM
- All child elements present
- No console errors

**Estimated Time**: 2 minutes

---

### 2.1 Create overlay styles
**Location**: `styles.css` (end of file)

**Code to Add**:
```css
/* Image Lightbox Styles */
.lightbox-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    z-index: 10000;
    opacity: 0;
    transition: opacity 300ms ease-out;
    cursor: pointer;
}

.lightbox-overlay.active {
    display: flex;
    align-items: center;
    justify-content: center;
}

.lightbox-overlay.show {
    opacity: 1;
}
```

**Acceptance Criteria**:
- Overlay covers entire viewport
- z-index higher than all other elements
- Smooth fade in/out transition
- Flexbox centering works

**Estimated Time**: 5 minutes

---

### 2.2 Create close button styles
**Location**: `styles.css` (after overlay styles)

**Code to Add**:
```css
.lightbox-close {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 24px;
    cursor: pointer;
    transition: background-color 150ms ease;
    z-index: 10001;
    display: flex;
    align-items: center;
    justify-content: center;
}

.lightbox-close:hover {
    background-color: rgba(255, 255, 255, 0.3);
}

.lightbox-close:active {
    background-color: rgba(255, 255, 255, 0.4);
}
```

**Acceptance Criteria**:
- Button positioned in top-right corner
- Circular shape with proper sizing
- Visible on dark background
- Smooth hover effect

**Estimated Time**: 5 minutes

---

### 2.3 Create image container styles
**Location**: `styles.css` (after close button styles)

**Code to Add**:
```css
.lightbox-content {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    cursor: default;
}

.lightbox-image {
    max-width: 90vw;
    max-height: 90vh;
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}
```

**Acceptance Criteria**:
- Image centered in viewport
- Maintains aspect ratio
- Scales to fit large images
- Shadow adds depth

**Estimated Time**: 3 minutes

---

### 2.4 Add transitions and animations
**Location**: `styles.css` (after image styles)

**Code to Add**:
```css
.lightbox-image {
    animation: lightboxZoomIn 300ms ease-out;
}

@keyframes lightboxZoomIn {
    from {
        transform: scale(0.9);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}
```

**Acceptance Criteria**:
- Image fades in smoothly
- Subtle zoom effect on open
- No janky animations
- Smooth 300ms duration

**Estimated Time**: 2 minutes

---

### 3.1 Create setupImageLightbox() method
**Location**: `mindmap-engine.js` (in MindmapEngine class constructor)

**Code to Add in Constructor**:
```javascript
constructor() {
    this.nodes = null;
    this.nodeData = {};
    // ... existing properties ...

    this.initCanvas();
    this.setupAnimationLoop();
    this.setupImageLightbox(); // ADD THIS LINE
}
```

**Method to Add** (after `saveNodeData()` method):
```javascript
setupImageLightbox() {
    const overlay = document.getElementById('lightboxOverlay');
    const closeBtn = document.getElementById('lightboxClose');
    const lightboxImage = document.getElementById('lightboxImage');

    if (!overlay || !closeBtn || !lightboxImage) return;

    // Close lightbox function
    const closeLightbox = () => {
        overlay.classList.remove('show');
        setTimeout(() => {
            overlay.classList.remove('active');
        }, 300);
    };

    // Store in instance for access from other methods
    this.lightboxElements = { overlay, closeBtn, lightboxImage, closeLightbox };
}
```

**Acceptance Criteria**:
- Method exists in MindmapEngine class
- Called from constructor
- Elements cached for performance
- Close function defined

**Estimated Time**: 5 minutes

---

### 3.2 Add image click event listeners
**Location**: `mindmap-engine.js:setupImageLightbox()` method

**Code to Add** (inside method):
```javascript
// Event delegation for dynamically created images
document.addEventListener('click', (e) => {
    if (e.target.matches('.info-images img')) {
        e.stopPropagation();
        const imgSrc = e.target.src;
        lightboxImage.src = imgSrc;
        overlay.classList.add('active');
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);
    }
});
```

**Acceptance Criteria**:
- Event delegation works for dynamic images
- Image src copied to lightbox
- Lightbox opens with smooth animation
- Click doesn't bubble to other handlers

**Estimated Time**: 5 minutes

---

### 3.3 Implement show/hide lightbox logic
**Already implemented in 3.2**

**Verification**:
- Lightbox shows with fade-in animation
- Close function hides with fade-out
- Proper timing for CSS transitions

**Estimated Time**: Included in 3.2

---

### 3.4 Add close event handlers
**Location**: `mindmap-engine.js:setupImageLightbox()` method

**Code to Add** (inside method):
```javascript
// Close on X button click
closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeLightbox();
});

// Close on overlay click (not image)
overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
        closeLightbox();
    }
});

// Close on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
        closeLightbox();
    }
});
```

**Acceptance Criteria**:
- X button closes lightbox
- Clicking overlay background closes lightbox
- Clicking image does NOT close lightbox
- ESC key closes lightbox
- No duplicate event listeners

**Estimated Time**: 5 minutes

---

### 4.1 Test lightbox opens on image click
**Testing Approach**: Manual interaction test

**Test Procedure**:
1. Open node with images in info panel
2. Click on thumbnail image
3. Verify lightbox opens
4. Verify correct image displays full-size
5. Check smooth fade-in animation

**Acceptance Criteria**:
- Lightbox opens immediately on click
- Correct image displays
- Smooth animation
- No console errors

**Estimated Time**: 3 minutes

---

### 4.2 Test all close methods work
**Testing Approach**: Manual interaction test

**Test Procedure**:
1. Open lightbox
2. Click X button → Should close
3. Open again, click dark overlay → Should close
4. Open again, press ESC key → Should close
5. Open again, click on image → Should NOT close

**Acceptance Criteria**:
- All three close methods work
- Smooth fade-out animation
- Image click does not close lightbox
- No errors in console

**Estimated Time**: 4 minutes

---

### 4.3 Test with multiple images
**Testing Approach**: Multiple image test

**Test Procedure**:
1. Create node with 3+ images
2. Click first image → Verify correct image shows
3. Close and click second image → Verify correct image
4. Click third image → Verify correct image
5. Verify no state issues between opens

**Acceptance Criteria**:
- Each click shows correct image
- No mixing of images
- State resets properly
- Performance is smooth

**Estimated Time**: 3 minutes

---

## Implementation Order
1. Tasks 1.1-1.3 (Add HTML)
2. Tasks 2.1-2.4 (Add CSS)
3. Tasks 3.1-3.4 (Add JavaScript)
4. Tasks 4.1-4.3 (Manual testing)

## Files Modified
1. `index.html` - Add lightbox HTML
2. `styles.css` - Add lightbox styles
3. `mindmap-engine.js` - Add lightbox logic

## Total Estimated Time
50 minutes