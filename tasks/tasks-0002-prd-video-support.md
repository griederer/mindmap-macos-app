# Task List: Video Support Implementation

**PRD**: 0002-prd-video-support.md
**Feature**: Video Attachments for Nodes
**Branch**: `feature/video-support`
**Estimated Duration**: 6-9 days

---

## Relevant Files

### Core Files:
- `src/managers/video-manager.js` - NEW - Video management logic
- `__tests__/video-manager.test.js` - NEW - Test suite for VideoManager
- `renderer.js` - MODIFY - Add video upload handlers
- `mindmap-engine.js` - MODIFY - Render videos in info panels
- `project-manager.js` - MODIFY - v5.1 migration logic
- `index.html` - MODIFY - Add video upload UI
- `styles.css` - MODIFY - Video component styling

### Reference Files (for patterns):
- `src/managers/image-manager.js` - Reference implementation
- `__tests__/image-manager.test.js` - Test patterns

### Notes:
- All tests placed in `__tests__/` directory
- Run tests: `npm test`
- Follow TDD: Red → Green → Refactor

---

## Tasks

### Phase 1: Core Infrastructure

- [x] **1.0 Create VideoManager class with core API**
  - [x] 1.1 Create `src/managers/video-manager.js` file
  - [x] 1.2 Implement VideoManager constructor and data structures
  - [x] 1.3 Write tests for constructor (TDD - Red)
  - [x] 1.4 Make constructor tests pass (TDD - Green)
  - [x] 1.5 Implement `addVideo(nodeId, videoData)` method
  - [x] 1.6 Write tests for addVideo
  - [x] 1.7 Implement `removeVideo(nodeId, videoIndex)` method
  - [x] 1.8 Write tests for removeVideo
  - [x] 1.9 Implement `getNodeVideos(nodeId)` method
  - [x] 1.10 Write tests for getNodeVideos
  - [x] 1.11 Run full test suite and verify all pass

- [x] **2.0 Implement video validation logic**
  - [x] 2.1 Implement `validateVideo(file)` method
  - [x] 2.2 Write tests for file size validation (max 10MB)
  - [x] 2.3 Write tests for duration validation (max 30s)
  - [x] 2.4 Write tests for format validation (mp4, webm)
  - [x] 2.5 Write tests for invalid file handling
  - [x] 2.6 Implement `determineStorageType(size)` method
  - [x] 2.7 Write tests for storage type determination (2MB threshold)
  - [x] 2.8 Run validation tests and verify all pass

- [x] **3.0 Implement thumbnail generation**
  - [x] 3.1 Implement `generateThumbnail(videoFile)` using Canvas API
  - [x] 3.2 Write tests for thumbnail generation
  - [x] 3.3 Test thumbnail dimensions (max 200x150px)
  - [x] 3.4 Test thumbnail compression (JPEG quality 0.8)
  - [x] 3.5 Handle video load errors gracefully
  - [x] 3.6 Run thumbnail tests and verify all pass

- [x] **4.0 Implement file encoding utilities**
  - [x] 4.1 Implement `fileToBase64(file)` method
  - [x] 4.2 Write tests for base64 encoding
  - [x] 4.3 Implement `formatDuration(seconds)` utility
  - [x] 4.4 Write tests for duration formatting (1:25, 0:45)
  - [x] 4.5 Implement `formatFileSize(bytes)` utility
  - [x] 4.6 Write tests for file size formatting (2.5 MB, 980 KB)
  - [x] 4.7 Run utility tests and verify all pass

- [x] **5.0 Implement data persistence methods**
  - [x] 5.1 Implement `loadFromNodeData(nodeData)` method
  - [x] 5.2 Write tests for loading videos from project data
  - [x] 5.3 Implement `exportToNodeData()` method
  - [x] 5.4 Write tests for exporting videos to project format
  - [x] 5.5 Test round-trip (load → modify → export)
  - [x] 5.6 Run persistence tests and verify all pass

### Phase 2: Data Format Extension

- [x] **6.0 Extend v5.0 data format to v5.1**
  - [x] 6.1 Update project-manager.js to handle `videos` field
  - [x] 6.2 Add v5.1 version constant
  - [x] 6.3 Write migration test: v5.0 → v5.1 (add empty videos array)
  - [x] 6.4 Write migration test: v5.1 → v5.0 (strip videos array)
  - [x] 6.5 Test backward compatibility with existing .pmap files
  - [x] 6.6 Run migration tests and verify all pass

- [x] **7.0 Implement external storage logic**
  - [x] 7.1 Create `.media/` folder creation logic
  - [x] 7.2 Write tests for folder creation
  - [x] 7.3 Implement `saveExternalVideo(file)` with SHA hash naming (in video-manager.js)
  - [x] 7.4 Write tests for external video saving (hash generation tested)
  - [x] 7.5 Test file path resolution (relative vs absolute)
  - [x] 7.6 Test missing file detection and error handling
  - [x] 7.7 Run storage tests and verify all pass

### Phase 3: UI Integration

- [ ] **8.0 Add video upload to edit modal**
  - [ ] 8.1 Update index.html with video upload input
  - [ ] 8.2 Add video upload button and styling
  - [ ] 8.3 Implement file input change handler in renderer.js
  - [ ] 8.4 Add upload progress indicator UI
  - [ ] 8.5 Implement progress tracking logic
  - [ ] 8.6 Test upload with valid video file
  - [ ] 8.7 Test upload with invalid file (show error message)

- [ ] **9.0 Implement video preview in edit modal**
  - [ ] 9.1 Create video preview component HTML structure
  - [ ] 9.2 Implement dynamic video list rendering
  - [ ] 9.3 Show thumbnail before video loads
  - [ ] 9.4 Display filename, duration, and size
  - [ ] 9.5 Add delete button for each video
  - [ ] 9.6 Test video preview updates when videos added/removed

- [ ] **10.0 Render videos in node info panel**
  - [ ] 10.1 Update mindmap-engine.js info panel rendering
  - [ ] 10.2 Add video section to info panel HTML
  - [ ] 10.3 Implement video element creation with proper attributes
  - [ ] 10.4 Set `preload="metadata"` for lazy loading
  - [ ] 10.5 Add video controls and styling
  - [ ] 10.6 Test multiple videos stack vertically
  - [ ] 10.7 Test video playback functionality

- [ ] **11.0 Implement video deletion**
  - [ ] 11.1 Add delete button click handler
  - [ ] 11.2 Implement confirmation dialog
  - [ ] 11.3 Remove video from VideoManager
  - [ ] 11.4 Delete external file if storageType='external'
  - [ ] 11.5 Update UI to reflect deletion
  - [ ] 11.6 Test deletion updates nodeData correctly
  - [ ] 11.7 Test external file is removed from disk

- [ ] **12.0 Style video components**
  - [ ] 12.1 Add CSS for video upload section
  - [ ] 12.2 Style video preview items in modal
  - [ ] 12.3 Style video player in info panel
  - [ ] 12.4 Add responsive design for small screens
  - [ ] 12.5 Match existing image component styling
  - [ ] 12.6 Test visual consistency across themes

### Phase 4: Integration & Testing

- [ ] **13.0 Integration testing**
  - [ ] 13.1 Test complete workflow: upload → save → close → reopen
  - [ ] 13.2 Test switching between nodes with videos
  - [ ] 13.3 Test project save/load with videos
  - [ ] 13.4 Test external video references after project move
  - [ ] 13.5 Test max 3 videos per node limit
  - [ ] 13.6 Test multiple nodes with videos (10+ nodes)
  - [ ] 13.7 Verify no memory leaks with repeated playback

- [ ] **14.0 Error handling & edge cases**
  - [ ] 14.1 Test corrupted video file handling
  - [ ] 14.2 Test missing external file detection
  - [ ] 14.3 Test unsupported codec/format
  - [ ] 14.4 Test disk space full scenario
  - [ ] 14.5 Test network drive storage (external)
  - [ ] 14.6 Add user-friendly error messages
  - [ ] 14.7 Verify all errors logged to console

- [ ] **15.0 Performance testing**
  - [ ] 15.1 Test upload of 10MB video (should be < 3s)
  - [ ] 15.2 Test thumbnail generation (should be < 500ms)
  - [ ] 15.3 Test info panel open with 3 videos (should be smooth)
  - [ ] 15.4 Test memory usage with 10 nodes containing videos
  - [ ] 15.5 Profile rendering performance
  - [ ] 15.6 Optimize if any metric fails target

- [ ] **16.0 Documentation updates**
  - [ ] 16.1 Update README.md with video feature description
  - [ ] 16.2 Add video section to ARCHITECTURE.md
  - [ ] 16.3 Document VideoManager API in code comments
  - [ ] 16.4 Update user guide with video workflow
  - [ ] 16.5 Add troubleshooting section for video issues
  - [ ] 16.6 Update CHANGELOG.md with v5.1 changes

### Phase 5: Release Preparation

- [ ] **17.0 Final testing & commit**
  - [ ] 17.1 Run full test suite (`npm test`)
  - [ ] 17.2 Fix any failing tests
  - [ ] 17.3 Run lint check (`npm run lint` or manual review)
  - [ ] 17.4 Manual testing on fresh project
  - [ ] 17.5 Create sample project with videos for demo
  - [ ] 17.6 Stage all changes (`git add .`)
  - [ ] 17.7 Commit with message: `feat(media): add video support for node info panels`

- [ ] **18.0 Create pull request**
  - [ ] 18.1 Push branch to origin (`git push origin feature/video-support`)
  - [ ] 18.2 Create PR: `feature/video-support` → `develop`
  - [ ] 18.3 Write PR description with:
    - Summary of changes
    - List of new files
    - Testing performed
    - Screenshots/demo
  - [ ] 18.4 Request code review
  - [ ] 18.5 Address review feedback
  - [ ] 18.6 Merge to develop after approval

---

## Testing Checklist

### Unit Tests (video-manager.test.js):
- ✅ Constructor initialization
- ✅ Add video to node
- ✅ Remove video from node
- ✅ Get videos for node
- ✅ Clear all videos for node
- ✅ Validate video file (size, duration, format)
- ✅ Determine storage type (embedded vs external)
- ✅ Generate thumbnail from video
- ✅ Convert file to base64
- ✅ Load from nodeData
- ✅ Export to nodeData
- ✅ Format duration string
- ✅ Format file size string

### Integration Tests:
- ✅ Upload video → appears in modal preview
- ✅ Save node → video persists in .pmap
- ✅ Close/reopen project → videos reload correctly
- ✅ Delete video → removed from UI and storage
- ✅ External video → file created in `.media/`
- ✅ Large file → storage type = external
- ✅ Small file → storage type = embedded

### Manual Tests:
- ✅ Video playback smooth
- ✅ Multiple videos display correctly
- ✅ UI matches design mockups
- ✅ Error messages clear and helpful
- ✅ No console errors during normal operation

---

## Approval Checkpoints

**After Task 5.0**: Core VideoManager complete → Review API design
**After Task 7.0**: Data format finalized → Review migration logic
**After Task 12.0**: UI implementation complete → Review visual design
**After Task 16.0**: Documentation complete → Final approval for PR

---

## Notes

- Follow existing patterns from `image-manager.js` for consistency
- Use `window.videoManager` global instance (matching image-manager)
- Test coverage target: 90%+ for video-manager.js
- All tests must pass before moving to next phase
- Update todo list after each sub-task completion

---

**Task List Version**: 1.0
**Created**: October 13, 2025
**Status**: Ready for Implementation
