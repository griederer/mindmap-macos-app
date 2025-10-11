# Implementation Plan: v5.0 JSON Standardization

**Branch**: `feature/v5.0-json-standardization`
**Testing Strategy**: Incremental with sample mindmaps
**Rollback**: Keep v4.0 fully functional on main branch

---

## 🎯 Incremental Phases

### Phase 1: Node Structure (PRIORITY 1)
**Goal**: Stable node IDs + basic structure
**Test**: Create simple mindmap with 3-5 nodes

#### Changes:
1. Add `generateNodeId()` function (stable IDs)
2. Update node data structure (add `id`, `title` fields)
3. Test: Create "Simple Project.pmap" with basic nodes

#### Test Case 1.1: Basic Nodes
```javascript
// Create via MCP
await mcp.create_mindmap({
  topic: "Test Project",
  nodes: [
    { title: "Node 1", level: 1 },
    { title: "Node 2", level: 1 },
    { title: "Node 3", level: 2 }
  ]
});

// Expected .pmap structure:
{
  "nodes": {
    "node-1-abc123": {
      "id": "node-1-abc123",
      "title": "Node 1",
      "description": "",
      "notes": "",
      "images": [],
      "showInfo": false
    }
  }
}

// Test in app: All 3 nodes render correctly
```

**Success Criteria**:
- [ ] Node IDs don't change when reordering
- [ ] All nodes render in app
- [ ] No console errors

---

### Phase 2: Descriptions & Notes (PRIORITY 2)
**Goal**: Clear separation between brief description and extended notes
**Test**: Add content to existing nodes

#### Changes:
1. Document `description` vs `notes` distinction
2. Update MCP `add_node` to accept both
3. Update UI to show both correctly

#### Test Case 2.1: Node with Description
```javascript
// Add description
await mcp.add_node({
  projectName: "Test Project",
  title: "Node with Info",
  level: 1,
  description: "This is a brief summary (max 200 chars)"
});

// Test in app: Description shows when node collapsed
```

#### Test Case 2.2: Node with Extended Notes
```javascript
// Add notes
await mcp.update_node_notes({
  projectName: "Test Project",
  nodeTitle: "Node with Info",
  notes: "## Extended Content\n\nThis is longer markdown content with:\n- Lists\n- **Bold text**\n- Multiple paragraphs"
});

// Test in app:
// 1. Click "i" button to open info panel
// 2. Notes render with markdown formatting
// 3. Panel scrolls correctly
```

**Success Criteria**:
- [ ] Description shows in collapsed view
- [ ] Notes show in expanded info panel
- [ ] Markdown renders correctly
- [ ] No layout issues

---

### Phase 3: Images (PRIORITY 3)
**Goal**: Structured image objects with proper metadata
**Test**: Add images to nodes via MCP

#### Changes:
1. Update image structure (always use object format)
2. Support both URL and base64
3. Add image metadata (source, photographer)

#### Test Case 3.1: Add Image from URL
```javascript
// Add image via Unsplash
const images = await mcp.search_images({
  query: "technology",
  count: 1
});

await mcp.add_image_to_node({
  projectName: "Test Project",
  nodeTitle: "Node with Info",
  image: {
    url: images.images[0].url,
    source: "unsplash",
    photographer: images.images[0].photographer
  }
});

// Test in app:
// 1. Open info panel
// 2. Image loads correctly
// 3. Attribution shows
```

#### Test Case 3.2: Add Image from Base64
```javascript
// Upload local image
await mcp.add_image_to_node({
  projectName: "Test Project",
  nodeTitle: "Node with Info",
  image: {
    base64: "data:image/png;base64,iVBORw0KGgoAAAA...",
    source: "upload",
    description: "Custom uploaded image"
  }
});

// Test in app: Base64 image renders
```

**Success Criteria**:
- [ ] URL images load correctly
- [ ] Base64 images load correctly
- [ ] Attribution shows for Unsplash
- [ ] Image thumbnails work
- [ ] Lightbox opens on click

---

### Phase 4: Categories (PRIORITY 4)
**Goal**: Bidirectional category linking
**Test**: Create and assign categories

#### Changes:
1. Add `categoryIds` array to nodes
2. Add `nodeIds` array to categories
3. Sync both directions automatically

#### Test Case 4.1: Create Category
```javascript
// Create category
await mcp.create_category({
  projectName: "Test Project",
  name: "High Priority",
  color: "#dc2626",
  icon: "⚠️"
});

// Expected structure:
{
  "categories": [
    {
      "id": "cat-high-priority-xyz",
      "name": "High Priority",
      "color": "#dc2626",
      "icon": "⚠️",
      "nodeIds": []
    }
  ]
}
```

#### Test Case 4.2: Assign Category
```javascript
// Assign to node
await mcp.assign_category({
  projectName: "Test Project",
  nodeTitle: "Node with Info",
  categoryName: "High Priority"
});

// Expected bidirectional link:
{
  "categories": [
    {
      "id": "cat-high-priority-xyz",
      "nodeIds": ["node-with-info-abc"]  // ← Added
    }
  ],
  "nodes": {
    "node-with-info-abc": {
      "categoryIds": ["cat-high-priority-xyz"]  // ← Added
    }
  }
}

// Test in app:
// 1. Node has colored border
// 2. Category badge shows
// 3. Filter by category works
```

**Success Criteria**:
- [ ] Categories create correctly
- [ ] Assignment creates bidirectional link
- [ ] Nodes show category styling
- [ ] Category filter works

---

### Phase 5: Relationships (PRIORITY 5)
**Goal**: Custom connections between nodes
**Test**: Create relationships and connections

#### Test Case 5.1: Create Relationship Type
```javascript
// Define relationship
await mcp.create_relationship({
  projectName: "Test Project",
  name: "depends on",
  color: "#3b82f6",
  dashPattern: [5, 5],
  lineStyle: "dashed"
});
```

#### Test Case 5.2: Connect Nodes
```javascript
// Create connection
await mcp.connect_nodes({
  projectName: "Test Project",
  fromNodeTitle: "Node 3",
  toNodeTitle: "Node 1",
  relationshipName: "depends on"
});

// Test in app:
// 1. Dashed blue line appears
// 2. Line connects correct nodes
// 3. Hover shows relationship name
```

**Success Criteria**:
- [ ] Relationships create correctly
- [ ] Connections draw on canvas
- [ ] Line style matches definition
- [ ] Toggle relationships works

---

## 📝 Test Files to Create

### 1. Simple Test Project
```bash
# Create via script
node create-test-project.js simple
```

**Contents**:
- 5 basic nodes
- No images, categories, or relationships
- Focus: Test node structure only

### 2. Content Test Project
```bash
node create-test-project.js content
```

**Contents**:
- 3 nodes with descriptions
- 2 nodes with extended notes
- No images yet
- Focus: Test description vs notes

### 3. Images Test Project
```bash
node create-test-project.js images
```

**Contents**:
- 2 nodes with URL images
- 1 node with base64 image
- Focus: Test image loading

### 4. Categories Test Project
```bash
node create-test-project.js categories
```

**Contents**:
- 3 categories (High, Medium, Low priority)
- 5 nodes with category assignments
- Focus: Test category styling

### 5. Full Test Project
```bash
node create-test-project.js full
```

**Contents**:
- All features combined
- 10 nodes
- 2 images
- 3 categories
- 2 relationships
- Focus: Integration test

---

## 🧪 Testing Checklist

### Before Each Phase
- [ ] Commit current changes
- [ ] Create test mindmap for phase
- [ ] Document expected behavior

### During Each Phase
- [ ] Run test mindmap creation
- [ ] Open in Electron app
- [ ] Verify rendering
- [ ] Check console for errors
- [ ] Test all interactions

### After Each Phase
- [ ] Document issues found
- [ ] Fix critical bugs
- [ ] Update PRD if needed
- [ ] Commit working code

---

## 🔄 Rollback Strategy

If Phase N fails:
1. `git stash` current changes
2. `git checkout feature/v5.0-json-standardization~N`
3. Test previous working phase
4. Identify breaking change
5. Fix and retry

---

## 📊 Progress Tracking

### Phase Status

| Phase | Status | Test File | Issues | Completion |
|-------|--------|-----------|--------|------------|
| 1. Nodes | 🔄 In Progress | simple.pmap | - | 0% |
| 2. Content | ⏳ Pending | content.pmap | - | 0% |
| 3. Images | ⏳ Pending | images.pmap | - | 0% |
| 4. Categories | ⏳ Pending | categories.pmap | - | 0% |
| 5. Relationships | ⏳ Pending | full.pmap | - | 0% |

Legend:
- 🔄 In Progress
- ✅ Complete
- ❌ Failed
- ⏳ Pending

---

## 🚀 How to Execute

### Initial Setup
```bash
cd ~/Documents/GitHub/mindmap-macos-app
git checkout feature/v5.0-json-standardization
npm install
```

### Run Each Phase
```bash
# Phase 1: Node Structure
npm run test:phase1

# Phase 2: Content
npm run test:phase2

# ... etc
```

### Manual Testing
```bash
# Start app
npm start

# In another terminal, run MCP commands
node test-mcp-client.js phase1
```

---

## 📅 Timeline

- **Phase 1**: 2-3 hours
- **Phase 2**: 2-3 hours
- **Phase 3**: 3-4 hours
- **Phase 4**: 2-3 hours
- **Phase 5**: 3-4 hours

**Total**: 12-17 hours over 2-3 days

---

## ✅ Final Validation

Before merging to develop:
- [ ] All 5 phases complete
- [ ] All test cases pass
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Migration from v4.0 works
- [ ] Documentation updated
