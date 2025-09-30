# PRD: Info Panel Image Display Fix

## Problem Statement
When users upload images to a mindmap node and then press the "Info" button, the info panel displays text descriptions correctly but does NOT display the uploaded images. Images are stored in `nodeData[nodeId].images` but are not rendered in the DOM when the info panel is toggled.

## Root Cause Analysis
1. Info panel HTML is generated once during `renderNodes()` execution (lines 408-455)
2. When `toggleInfo()` is called, it only toggles the CSS `active` class (line 635)
3. Panel content is never refreshed after initial creation
4. Images uploaded after panel creation are stored in data but never rendered to DOM

## Target Users
- Mindmap users who upload images to nodes
- Users who want to view uploaded images via the Info panel

## Key User Actions
1. User uploads image(s) to a node via Edit modal
2. User saves the node (images are stored in `nodeData[nodeId].images`)
3. User clicks "Info" button to view node information
4. **Expected**: Panel shows description, notes, AND images
5. **Actual**: Panel shows description and notes but NOT images

## Success Criteria
- [x] Info panel displays uploaded images when toggled
- [x] Images display in the correct order they were uploaded
- [x] Info panel shows all content types: description, notes, AND images
- [x] Panel content refreshes dynamically when toggled
- [x] No performance degradation from repeated DOM updates

## Technical Requirements
1. Extract info panel HTML generation into reusable method `updateInfoPanel(nodeId)`
2. Call `updateInfoPanel()` from both `renderNodes()` and `toggleInfo()`
3. Preserve existing CSS transitions and animations
4. Maintain proper order: description → notes → images
5. Handle edge cases: no data, only images, only text, etc.

## Non-Goals
- Changing the info panel layout or styling
- Adding new features to image handling
- Modifying the Edit modal functionality
- Performance optimizations beyond the immediate fix

## Technical Approach
1. Create `updateInfoPanel(nodeId)` method that:
   - Finds the info panel element by ID
   - Reads data from `nodeData[nodeId]`
   - Generates HTML for description, notes, and images
   - Updates `innerHTML` with new content

2. Modify `toggleInfo()` to:
   - Toggle `showInfo` flag (existing)
   - Call `updateInfoPanel(nodeId)` before toggling CSS class
   - Toggle `active` CSS class (existing)

3. Modify `renderNodes()` to:
   - Use `updateInfoPanel(nodeId)` instead of inline HTML generation
   - Maintain all existing node creation logic

## Testing Strategy
1. Manual testing workflow:
   - Create node with text description
   - Upload 1-3 images
   - Toggle info panel off/on
   - Verify images display correctly

2. Edge cases to test:
   - Node with only description (no images)
   - Node with only images (no description)
   - Node with no data at all
   - Multiple images (grid layout)

## Implementation Timeline
- Task 1.1-1.3: Extract and create `updateInfoPanel()` method (15-20 min)
- Task 2.1-2.2: Update `toggleInfo()` to use new method (10 min)
- Task 3.1-3.2: Update `renderNodes()` to use new method (10 min)
- Task 4.1-4.3: Manual testing and verification (15 min)

**Total Estimated Time**: 50-60 minutes