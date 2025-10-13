# PRD 0002: Video Support for Node Information Panels

**Feature Name**: Video Attachments for Nodes
**Version**: 5.1.0
**Author**: Claude (PWC Mindmap Pro Agent)
**Date**: October 13, 2025
**Status**: Ready for Implementation
**Priority**: P1 - High Value Feature
**Branch**: `feature/video-support`

---

## 1. Introduction/Overview

Enable users to attach short video clips to mindmap nodes, extending the existing rich media system. Videos will be displayed in the node information panel alongside images, descriptions, and notes, providing multimedia context for complex concepts.

### Business Value
- **Enhanced Learning**: Video demonstrations for technical concepts
- **Professional Presentations**: Embed product demos, testimonials, or explanations
- **Knowledge Retention**: Visual + audio content improves comprehension
- **Competitive Differentiation**: Feature not common in mindmap tools

---

## 2. Goals

### Primary Goals
1. **Seamless Integration**: Leverage existing image infrastructure (80% code reuse)
2. **Storage Efficiency**: Hybrid storage (base64 for small, file references for large)
3. **User Experience**: Consistent with current image upload workflow
4. **Performance**: No degradation with multiple videos per project

### Success Metrics
- ✅ Users can upload videos < 10MB, < 30s duration
- ✅ 95%+ of videos load within 2 seconds
- ✅ No crashes with 10+ nodes containing videos
- ✅ .pmap files remain manageable (< 50MB for typical projects)

---

## 3. User Stories

### US-1: Upload Video to Node
**As a** consultant creating a cybersecurity mindmap
**I want to** attach a 15-second demo video to a "Phishing Detection" node
**So that** viewers can see a real-world example of the attack

**Acceptance Criteria**:
- Upload button accepts .mp4 and .webm formats
- File size validation (max 10MB)
- Duration validation (max 30 seconds)
- Auto-generates thumbnail from first frame
- Shows upload progress indicator

---

### US-2: View Video in Info Panel
**As a** mindmap viewer
**I want to** play attached videos inline
**So that** I can understand the concept without leaving the app

**Acceptance Criteria**:
- Videos display with native HTML5 `<video>` controls
- Thumbnail shown before playback (lazy loading)
- Playback controls (play, pause, volume, fullscreen)
- Multiple videos per node stack vertically

---

### US-3: Manage Video Attachments
**As a** project manager
**I want to** delete outdated videos
**So that** my mindmap stays current and file size manageable

**Acceptance Criteria**:
- Delete button on each video with confirmation
- Video removed from UI and storage immediately
- .pmap file size reduced after deletion

---

### US-4: Hybrid Storage for Large Files
**As a** power user with many videos
**I want to** store large videos externally
**So that** my .pmap files don't become unwieldy

**Acceptance Criteria**:
- Videos > 2MB stored in `.media/` folder
- .pmap contains file reference, not full data
- Videos < 2MB embedded as base64 (portable)
- Broken references detected with clear error message

---

## 4. Functional Requirements

### FR-1: Video Upload
**Priority**: P0 (Must Have)

**Specifications**:
- Accept file input via `<input type="file" accept="video/mp4,video/webm">`
- Validate file size: `MAX_SIZE = 10 * 1024 * 1024` (10MB)
- Validate duration: `MAX_DURATION = 30` seconds
- Validate format: `.mp4`, `.webm` only
- Generate thumbnail from first frame using Canvas API
- Display upload progress (0-100%)

**Error Handling**:
- Size exceeded → "Video must be under 10MB"
- Duration exceeded → "Video must be under 30 seconds"
- Invalid format → "Only MP4 and WebM supported"
- Upload failure → Retry mechanism with timeout

---

### FR-2: Video Storage
**Priority**: P0 (Must Have)

**Specifications**:

**Small Videos (< 2MB)**:
```javascript
{
  url: 'data:video/mp4;base64,AAAAA...',
  thumbnail: 'data:image/jpeg;base64,/9j/4...',
  filename: 'demo.mp4',
  size: 1048576,  // bytes
  duration: 12.5,  // seconds
  storageType: 'embedded'
}
```

**Large Videos (≥ 2MB)**:
```javascript
{
  url: 'file:///PWC Mindmaps/.media/video-abc123.mp4',
  thumbnail: 'data:image/jpeg;base64,/9j/4...',
  filename: 'product-demo.mp4',
  size: 8388608,
  duration: 28.3,
  storageType: 'external'
}
```

**Storage Rules**:
1. Create `.media/` folder in project directory if missing
2. Copy large videos with hash-based filename: `video-{sha256}.mp4`
3. Store thumbnail (compressed JPEG, max 200x150px) as base64
4. Update `nodeData[nodeId].videos` array

---

### FR-3: Video Rendering
**Priority**: P0 (Must Have)

**Specifications**:
- Render in node info panel with native `<video>` tag
- Attributes: `controls`, `preload="metadata"`, `width="100%"`
- Max height: `200px` per video
- Show filename, duration, and delete button
- Lazy load: Only load video when info panel opens

**HTML Structure**:
```html
<div class="info-video-item">
  <video controls preload="metadata" style="max-height: 200px; width: 100%;">
    <source src="{url}" type="video/mp4">
    Your browser doesn't support video playback.
  </video>
  <div class="video-meta">
    <span class="video-filename">{filename}</span>
    <span class="video-duration">({duration}s)</span>
    <button class="remove-video-btn" data-node="{nodeId}" data-index="{index}">
      🗑️
    </button>
  </div>
</div>
```

---

### FR-4: Video Manager API
**Priority**: P0 (Must Have)

**Class Structure**:
```javascript
class VideoManager {
  constructor()

  // Core CRUD
  async addVideo(nodeId, videoFile) → VideoData
  removeVideo(nodeId, videoIndex) → boolean
  getNodeVideos(nodeId) → VideoData[]
  clearNodeVideos(nodeId) → void

  // Validation
  validateVideo(file) → { valid: boolean, error?: string }

  // Processing
  async generateThumbnail(videoFile) → base64String
  async fileToBase64(file) → base64String
  determineStorageType(size) → 'embedded' | 'external'

  // Storage Operations
  async saveExternalVideo(file) → filePath
  loadFromNodeData(nodeData) → void
  exportToNodeData() → Object

  // Utilities
  formatDuration(seconds) → string  // "1:25"
  formatFileSize(bytes) → string    // "2.5 MB"
}
```

---

### FR-5: Data Format Extension
**Priority**: P0 (Must Have)

**v5.1 Format** (backward compatible with v5.0):
```json
{
  "version": "5.1",
  "metadata": { ... },
  "content": "...",
  "nodes": { ... },
  "nodeData": {
    "node-001": {
      "description": "",
      "notes": "",
      "images": [],
      "videos": [           // ← NEW FIELD
        {
          "url": "data:video/mp4;base64,...",
          "thumbnail": "data:image/jpeg;base64,...",
          "filename": "demo.mp4",
          "size": 1048576,
          "duration": 12.5,
          "storageType": "embedded",
          "addedAt": "2025-10-13T14:30:00Z"
        }
      ],
      "showInfo": false,
      "categories": [],
      "relationships": []
    }
  },
  "relationships": [ ... ]
}
```

**Migration Strategy**:
- v5.0 → v5.1: Add empty `videos: []` array if missing
- v5.1 → v5.0: Strip `videos` field (forward compatibility)
- No breaking changes to existing data

---

## 5. Non-Goals (Out of Scope)

### What This Feature WILL NOT Include:
- ❌ **Video Editing**: No trim, crop, or effects (use external tools)
- ❌ **Video Recording**: No webcam/screen capture (upload only)
- ❌ **Streaming**: No YouTube/Vimeo embeds (local files only)
- ❌ **Transcoding**: No automatic format conversion (user provides MP4/WebM)
- ❌ **Compression**: Optional future enhancement with ffmpeg.wasm
- ❌ **Subtitles/Captions**: Future enhancement
- ❌ **Video Search**: No text search within video content

### Rationale:
Focus on core upload/display functionality first. Advanced features can be added in v5.2+ based on user feedback.

---

## 6. Design Considerations

### UI/UX Design

**Modal Edit Panel**:
```
┌─────────────────────────────────────────┐
│ ✏️ Editar Nodo                      ✕  │
├─────────────────────────────────────────┤
│ 📝 Título del Nodo                      │
│ [Input field]                           │
│                                         │
│ ℹ️ Descripción                          │
│ [Textarea]                              │
│                                         │
│ 🖼️ Imágenes                             │
│ [📷 Cargar Imagen] [Preview Grid]      │
│                                         │
│ 🎥 Videos (max 30s, 10MB)     ← NEW    │
│ [📹 Cargar Video]                       │
│ ┌─────────────────────────────────┐    │
│ │ 📹 demo.mp4 (12s)           🗑️ │    │
│ │ [Thumbnail Preview]             │    │
│ └─────────────────────────────────┘    │
│                                         │
│ [💾 Guardar Cambios]                   │
└─────────────────────────────────────────┘
```

**Node Info Panel**:
```
┌─────────────────────────────┐
│ ℹ️ Product Demo             │
├─────────────────────────────┤
│ Description text here...    │
│                             │
│ 🎥 Videos                   │
│ ┌─────────────────────────┐ │
│ │ [▶ Video Player]        │ │
│ │  demo.mp4 (12s)     🗑️  │ │
│ └─────────────────────────┘ │
│                             │
│ 🖼️ Images                   │
│ [Image Grid]                │
└─────────────────────────────┘
```

### Visual Design Principles:
- **Consistency**: Match existing image upload styling
- **Clarity**: Clear file limits (10MB, 30s) in UI
- **Feedback**: Progress bar during upload
- **Safety**: Confirm before deleting videos

---

## 7. Technical Considerations

### Architecture Changes

**New Files**:
- `src/managers/video-manager.js` - Core video logic (300 lines)
- `__tests__/video-manager.test.js` - Test suite (200 lines)

**Modified Files**:
- `renderer.js` - Add video upload handler (~50 lines)
- `mindmap-engine.js` - Render videos in info panel (~30 lines)
- `project-manager.js` - v5.1 migration logic (~20 lines)
- `index.html` - Add video input field (~10 lines)
- `styles.css` - Video styling (~30 lines)

### Dependencies:
- **No new npm packages required** ✅
- Uses native HTML5 Video API
- Uses Canvas API for thumbnails
- Uses existing FileReader for base64

### Performance Optimizations:
1. **Lazy Loading**: `preload="metadata"` (load only when visible)
2. **Thumbnail Caching**: Generate once, store in .pmap
3. **Memory Management**: Dispose video elements when panel closes
4. **Concurrent Limits**: Max 2 videos playing simultaneously

### Security:
- **Sanitize filenames**: Remove `../` path traversal
- **Content-type validation**: Check MIME type, not just extension
- **Sandbox storage**: `.media/` folder isolated from app code

---

## 8. Success Metrics

### Quantitative:
- ✅ 0 regressions in existing tests
- ✅ 90%+ code coverage for video-manager.js
- ✅ Upload < 3 seconds for 5MB video
- ✅ Thumbnail generation < 500ms

### Qualitative:
- ✅ Users can complete workflow without documentation
- ✅ Video playback smooth on 3+ year old Macs
- ✅ UI feels native (matches system video controls)

---

## 9. Open Questions

### Q1: Should we support YouTube embeds?
**Answer**: No (out of scope for v5.1). Local files only for now.

### Q2: What about audio files (mp3)?
**Answer**: Future consideration (v5.2). Focus on video first.

### Q3: Maximum videos per node?
**Answer**: 3 videos per node (prevents UI clutter).

### Q4: Automatic compression for large files?
**Answer**: Not in v5.1. Add warning if > 10MB, suggest external compression.

### Q5: Cloud storage integration (Dropbox, Google Drive)?
**Answer**: Out of scope. Local/hybrid storage only.

---

## 10. Timeline & Milestones

### Phase 1: Core Infrastructure (2-3 days)
- [ ] Create `video-manager.js` with full API
- [ ] Write comprehensive test suite
- [ ] Implement validation logic
- [ ] Generate thumbnails with Canvas

### Phase 2: Data Format (1 day)
- [ ] Extend v5.0 to v5.1 schema
- [ ] Update project-manager.js migration
- [ ] Add `.media/` folder creation logic
- [ ] Test backward compatibility

### Phase 3: UI Integration (2-3 days)
- [ ] Add video upload to edit modal
- [ ] Implement upload progress indicator
- [ ] Render videos in info panel
- [ ] Add delete functionality
- [ ] Style video components

### Phase 4: Testing & Polish (1-2 days)
- [ ] Integration tests
- [ ] Performance testing with large files
- [ ] Edge case handling (corrupted files)
- [ ] Documentation updates

**Total Estimate**: 6-9 days

---

## 11. Risks & Mitigations

### Risk 1: File Size Bloat
**Impact**: High - .pmap files > 100MB unusable
**Mitigation**: Hybrid storage (external for > 2MB)
**Contingency**: Add "Optimize Project" tool to move all to external

### Risk 2: Browser Compatibility
**Impact**: Medium - Some Electron versions lack codec support
**Mitigation**: Document supported formats (H.264, VP8/VP9)
**Contingency**: Transcode dialog with ffmpeg.wasm

### Risk 3: Performance Degradation
**Impact**: Medium - Multiple videos slow rendering
**Mitigation**: Lazy loading, thumbnail-only until play
**Contingency**: Limit to 2 concurrent playbacks

### Risk 4: Storage Path Issues
**Impact**: Low - Broken references when moving project
**Mitigation**: Relative paths, detect missing files
**Contingency**: "Repair Project" tool to re-link videos

---

## 12. Appendix

### Related Documentation:
- [ARCHITECTURE.md](../ARCHITECTURE.md) - System design
- [image-manager.js](../src/managers/image-manager.js) - Reference implementation
- [SCHEMA.md](../SCHEMA.md) - Data format specification

### References:
- [HTML5 Video Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [FileReader API](https://developer.mozilla.org/en-US/docs/Web/API/FileReader)

### Glossary:
- **Hybrid Storage**: Combination of embedded (base64) and external (file reference)
- **Thumbnail**: Static image extracted from video first frame
- **Lazy Loading**: Defer loading until content is visible
- **Base64**: Text encoding for binary data (37% size overhead)

---

**Document Version**: 1.0
**Last Updated**: October 13, 2025
**Next Review**: After Phase 1 completion
