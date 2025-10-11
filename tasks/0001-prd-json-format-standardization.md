# PRD: JSON Format Standardization for PWC Mindmap Pro

**PRD Number**: 0001
**Feature Name**: JSON Format Standardization and MCP-App Synchronization
**Priority**: P0 (Critical)
**Target Version**: 5.0.0
**Created**: 2025-01-11
**Author**: Gonzalo Riederer
**Status**: Draft

---

## 1. Introduction/Overview

### Problem Statement

The current PWC Mindmap Pro v4.0.0 has critical inconsistencies between:
- MCP server data generation (Claude Code interface)
- .pmap file format specification
- Electron app data consumption

**User Pain Points**:
- Claude creates mindmaps but descriptions don't appear in the app
- Images added via MCP don't show up correctly
- Categories and relationships are created but not properly linked
- Node IDs change unexpectedly, breaking references

**Impact**:
- Users cannot reliably create mindmaps via Claude Code
- 40% of MCP-created content doesn't render correctly
- Trust in AI-assisted mindmap creation is broken

### Goals

1. **Define Single Source of Truth** - One canonical JSON schema that MCP and App both follow
2. **Bidirectional Consistency** - Data created by Claude renders perfectly in app, data from app exports correctly
3. **Clear Documentation** - Every field has explicit purpose, format, and validation rules
4. **Backward Compatibility** - Existing .pmap files auto-migrate to new format

---

## 2. Goals (Measurable)

| Goal | Success Metric | Measurement Method |
|------|---------------|-------------------|
| **100% Field Consistency** | All fields in spec match implementation | Schema validation tests |
| **Zero Data Loss** | MCP-created content renders 100% in app | Integration tests |
| **Clear Documentation** | Every field documented with examples | Documentation completeness audit |
| **Developer Clarity** | Junior dev can implement in < 4 hours | Time-to-implement test |
| **Migration Success** | All existing .pmap files migrate without errors | Migration test suite |

---

## 3. User Stories

### Primary User Stories

**US-1: As a Claude Code user**
I want to create a mindmap with descriptions, images, and categories
So that when I open it in the app, everything appears exactly as specified

**Acceptance Criteria**:
- [ ] Claude creates mindmap via `create_mindmap_smart`
- [ ] Nodes with descriptions show in info panels
- [ ] Images from `add_image_to_node` appear in UI
- [ ] Categories colorize nodes correctly
- [ ] Relationships draw connections between nodes

---

**US-2: As an app user**
I want to export my mindmap to JSON
So that Claude can read and modify it accurately

**Acceptance Criteria**:
- [ ] Exported JSON follows documented schema exactly
- [ ] Claude can parse and understand all fields
- [ ] Re-importing the same file produces identical visualization

---

**US-3: As a developer**
I want unambiguous field definitions
So that I know exactly where to put each piece of data

**Acceptance Criteria**:
- [ ] Every field has JSDoc type annotation
- [ ] Every field has usage example
- [ ] Every field has validation rules
- [ ] Schema validator catches all format errors

---

### Edge Case Stories

**US-4: As a power user**
I want to manually edit .pmap files in VS Code
So that I can bulk-update content quickly

**Acceptance Criteria**:
- [ ] JSON is human-readable with clear structure
- [ ] JSON Schema provides autocomplete in editors
- [ ] Invalid JSON shows helpful error messages in app

---

## 4. Functional Requirements

### FR-1: Canonical .pmap File Format

#### FR-1.1: Root Structure
```json
{
  "$schema": "./mindmap-schema.json",
  "version": "5.0.0",
  "name": "Project Name",
  "content": "markdown outline",
  "nodes": {},
  "categories": [],
  "relationships": [],
  "connections": [],
  "customOrders": {},
  "nodePositions": {},
  "focusedNode": null,
  "metadata": {}
}
```

**Validation Rules**:
- `version` MUST be semver string
- `name` MUST be 1-200 characters
- `content` MUST be valid markdown

---

#### FR-1.2: Node Data Structure (FIXED)

**CURRENT PROBLEM**:
```javascript
// ❌ BAD: nodeId = `node-${lineIndex}` (changes when outline reordered)
"nodes": {
  "node-0": { ... },
  "node-1": { ... }
}
```

**NEW SOLUTION**:
```javascript
// ✅ GOOD: nodeId = stable UUID based on node title
"nodes": {
  "cloud-security-abc123": {
    "title": "Cloud Security",          // ✅ Explicit title
    "id": "cloud-security-abc123",      // ✅ Stable UUID
    "description": "Main description",  // ✅ Brief summary (max 200 chars)
    "notes": "Detailed notes here",     // ✅ Extended content (unlimited)
    "images": [                          // ✅ Structured image objects
      {
        "id": "img-xyz789",
        "url": "https://...",
        "thumbnail": "https://...",
        "source": "unsplash",
        "photographer": "John Doe",
        "description": "Cloud infrastructure",
        "base64": null                   // Optional: for embedded images
      }
    ],
    "showInfo": false,                   // ✅ UI state
    "categoryIds": ["cat-priority-1"],   // ✅ Bidirectional link
    "relationshipIds": ["rel-depends-1"],// ✅ Bidirectional link
    "metadata": {
      "created": "2025-01-11T10:00:00Z",
      "modified": "2025-01-11T12:30:00Z",
      "author": "claude-mcp",
      "version": 1
    }
  }
}
```

**Validation Rules**:
- `id` MUST match pattern: `^[a-z0-9-]+$`
- `title` MUST be 1-500 characters
- `description` MUST be 0-200 characters (brief summary)
- `notes` can be unlimited (extended markdown content)
- `images` MUST be array of structured objects
- `images[].url` OR `images[].base64` MUST be present (not both)
- `categoryIds` MUST reference existing categories
- `relationshipIds` MUST reference existing relationships

---

#### FR-1.3: Category Structure (FIXED)

**NEW FORMAT**:
```json
{
  "categories": [
    {
      "id": "cat-priority-1",
      "name": "High Priority",
      "color": "#dc2626",
      "icon": "⚠️",                 // Optional emoji
      "description": "Critical items",
      "nodeIds": [                   // ✅ Node references
        "cloud-security-abc123",
        "data-privacy-def456"
      ],
      "metadata": {
        "created": "2025-01-11T10:00:00Z",
        "usageCount": 2
      }
    }
  ]
}
```

**Validation Rules**:
- `id` MUST match pattern: `^cat-[a-z0-9-]+$`
- `color` MUST be valid hex color
- `nodeIds` MUST reference existing node IDs
- Bidirectional sync: if category contains nodeId, node MUST contain categoryId

---

#### FR-1.4: Relationship Structure (FIXED)

**NEW FORMAT**:
```json
{
  "relationships": [
    {
      "id": "rel-depends-1",
      "name": "depends on",
      "color": "#3b82f6",
      "dashPattern": [5, 5],        // ✅ Array of numbers (SVG dash-array)
      "lineStyle": "dashed",        // "solid" | "dashed" | "dotted"
      "description": "Dependency relationship",
      "nodeIds": [                   // ✅ All nodes in this relationship
        "mfa-auth-ghi789",
        "identity-mgmt-jkl012"
      ],
      "metadata": {
        "created": "2025-01-11T10:00:00Z",
        "connectionCount": 1
      }
    }
  ]
}
```

---

#### FR-1.5: Connection Structure (NEW)

**PURPOSE**: Explicit connections between nodes using relationships

```json
{
  "connections": [
    {
      "id": "conn-1",
      "fromNodeId": "mfa-auth-ghi789",
      "toNodeId": "identity-mgmt-jkl012",
      "relationshipId": "rel-depends-1",
      "label": "requires",              // Optional label on arrow
      "metadata": {
        "created": "2025-01-11T10:00:00Z"
      }
    }
  ]
}
```

**Validation Rules**:
- `fromNodeId` and `toNodeId` MUST exist in nodes
- `relationshipId` MUST exist in relationships
- No duplicate connections between same nodes with same relationship

---

### FR-2: Node ID Generation Algorithm

**CURRENT PROBLEM**: `nodeId = "node-" + lineIndex` (UNSTABLE)

**NEW ALGORITHM** (Deterministic + Stable):

```javascript
/**
 * Generate stable node ID from title
 * @param {string} title - Node title
 * @returns {string} - Format: "slug-hash8"
 * @example generateNodeId("Cloud Security") => "cloud-security-a1b2c3d4"
 */
function generateNodeId(title) {
  // 1. Slugify title
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);

  // 2. Generate short hash (first 8 chars of SHA256)
  const hash = crypto
    .createHash('sha256')
    .update(title + Date.now())
    .digest('hex')
    .substring(0, 8);

  return `${slug}-${hash}`;
}
```

**Benefits**:
- IDs don't change when outline is reordered
- Human-readable (contains actual title)
- Unique (hash prevents collisions)
- Stable (same title won't collide with existing IDs)

---

### FR-3: MCP Server Changes

#### FR-3.1: Update `createMindmap` Tool

**NEW SIGNATURE**:
```javascript
async createMindmap({
  topic,              // Project name
  nodes = [],         // Optional structured nodes
  categories = [],    // Optional categories to create
  relationships = []  // Optional relationships to create
})
```

**NEW NODE OBJECT**:
```javascript
{
  title: "Node Title",
  description: "Brief summary (max 200 chars)",  // ✅ EXPLICIT: short summary
  notes: "Extended markdown content",             // ✅ EXPLICIT: long form notes
  images: [                                       // ✅ EXPLICIT: structured images
    {
      url: "https://...",
      source: "unsplash",
      photographer: "John Doe"
    }
  ],
  level: 1,
  categoryNames: ["High Priority"],               // ✅ Link by name (resolved to IDs)
  relationshipNames: ["depends on"]
}
```

---

#### FR-3.2: Update `add_image_to_node` Tool

**NEW SIGNATURE**:
```javascript
async addImageToNode({
  projectName,
  nodeTitle,
  image: {                        // ✅ Structured object
    url: "https://...",           // Option 1: URL
    base64: "data:image/...",     // Option 2: Base64
    source: "unsplash",           // "unsplash" | "upload" | "url"
    photographer: "John Doe",     // Optional attribution
    description: "Image alt text" // Optional accessibility
  }
})
```

---

#### FR-3.3: Update `update_node` Tool

**NEW SIGNATURE**:
```javascript
async updateNode({
  projectName,
  nodeTitle,                    // Find by title
  updates: {                    // ✅ Explicit update object
    title: "New Title",         // Optional: rename
    description: "New desc",    // Optional: update brief summary
    notes: "New notes",         // Optional: update extended notes
    appendNotes: "Add to end",  // Optional: append instead of replace
    showInfo: true              // Optional: toggle info panel
  }
})
```

---

### FR-4: App Renderer Changes

#### FR-4.1: Parse New Format

```javascript
// mindmap-engine.js - parseOutline() UPDATE
parseOutline(text) {
  // ... existing parsing logic ...

  // NEW: Generate stable node IDs
  node.id = this.generateNodeId(node.title);

  // NEW: Initialize node data with correct structure
  if (!this.nodeData[node.id]) {
    this.nodeData[node.id] = {
      title: node.title,
      id: node.id,
      description: extractedDescription,  // From markdown | separator
      notes: '',
      images: [],
      showInfo: false,
      categoryIds: [],
      relationshipIds: [],
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        version: 1
      }
    };
  }
}
```

---

#### FR-4.2: Render Categories and Relationships

```javascript
// NEW: Apply category styling
renderNode(node) {
  const nodeData = this.nodeData[node.id];

  // Apply category colors
  if (nodeData.categoryIds && nodeData.categoryIds.length > 0) {
    const category = this.getCategory(nodeData.categoryIds[0]);
    if (category) {
      nodeEl.style.borderLeft = `4px solid ${category.color}`;
      nodeEl.dataset.categoryId = category.id;
    }
  }

  // Show relationship indicators
  if (nodeData.relationshipIds && nodeData.relationshipIds.length > 0) {
    const relIcon = document.createElement('span');
    relIcon.className = 'relationship-indicator';
    relIcon.textContent = '🔗';
    nodeEl.appendChild(relIcon);
  }
}
```

---

### FR-5: JSON Schema Validation

**CREATE**: `mindmap-schema.json` (JSON Schema Draft 7)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://pwc-mindmap.com/schemas/mindmap-v5.json",
  "title": "PWC Mindmap Project File",
  "version": "5.0.0",
  "type": "object",
  "required": ["version", "name", "content", "nodes"],
  "properties": {
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "Semantic version of the file format"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
      "description": "Project name"
    },
    "nodes": {
      "type": "object",
      "patternProperties": {
        "^[a-z0-9-]+$": {
          "$ref": "#/definitions/node"
        }
      }
    },
    "categories": {
      "type": "array",
      "items": { "$ref": "#/definitions/category" }
    },
    "relationships": {
      "type": "array",
      "items": { "$ref": "#/definitions/relationship" }
    }
  },
  "definitions": {
    "node": {
      "type": "object",
      "required": ["id", "title"],
      "properties": {
        "id": {
          "type": "string",
          "pattern": "^[a-z0-9-]+$"
        },
        "title": {
          "type": "string",
          "minLength": 1,
          "maxLength": 500
        },
        "description": {
          "type": "string",
          "maxLength": 200,
          "description": "Brief summary (shown in collapsed state)"
        },
        "notes": {
          "type": "string",
          "description": "Extended notes (markdown supported)"
        },
        "images": {
          "type": "array",
          "items": { "$ref": "#/definitions/image" }
        },
        "showInfo": {
          "type": "boolean",
          "default": false
        },
        "categoryIds": {
          "type": "array",
          "items": { "type": "string" }
        },
        "relationshipIds": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    },
    "image": {
      "type": "object",
      "required": ["id"],
      "oneOf": [
        { "required": ["url"] },
        { "required": ["base64"] }
      ],
      "properties": {
        "id": { "type": "string" },
        "url": { "type": "string", "format": "uri" },
        "thumbnail": { "type": "string", "format": "uri" },
        "base64": { "type": "string", "pattern": "^data:image\\/(png|jpeg|jpg|gif|webp);base64," },
        "source": { "enum": ["unsplash", "upload", "url"] },
        "photographer": { "type": "string" },
        "description": { "type": "string" }
      }
    },
    "category": {
      "type": "object",
      "required": ["id", "name", "color"],
      "properties": {
        "id": { "type": "string", "pattern": "^cat-[a-z0-9-]+$" },
        "name": { "type": "string", "minLength": 1 },
        "color": { "type": "string", "pattern": "^#[0-9a-fA-F]{6}$" },
        "icon": { "type": "string", "maxLength": 2 },
        "nodeIds": { "type": "array", "items": { "type": "string" } }
      }
    },
    "relationship": {
      "type": "object",
      "required": ["id", "name", "color"],
      "properties": {
        "id": { "type": "string", "pattern": "^rel-[a-z0-9-]+$" },
        "name": { "type": "string" },
        "color": { "type": "string", "pattern": "^#[0-9a-fA-F]{6}$" },
        "dashPattern": { "type": "array", "items": { "type": "number" } },
        "lineStyle": { "enum": ["solid", "dashed", "dotted"] },
        "nodeIds": { "type": "array", "items": { "type": "string" } }
      }
    }
  }
}
```

---

## 5. Non-Goals (Out of Scope)

### Explicitly NOT Included in v5.0

1. **Real-time Collaboration** - Still single-user file format
2. **Cloud Sync** - Still local filesystem only
3. **Version Control** - No git-like diffing/merging
4. **Template System** - Not addressing templates in this PRD
5. **Export to Other Formats** - PNG/SVG export separate feature
6. **Mobile Apps** - Desktop-only for now
7. **Plugin System** - Extension architecture future work

### Why These Are Out of Scope

**Focus**: This PRD solves ONE critical problem - data consistency between MCP and App. Adding more features would:
- Delay critical bug fix
- Increase testing surface
- Complicate migration

---

## 6. Design Considerations

### 6.1: Migration Strategy

**Challenge**: 500+ existing .pmap files in v4.0 format

**Solution**: Auto-migration on first load

```javascript
// project-manager.js - NEW: migrate() method
async loadProject(projectPath) {
  const data = JSON.parse(await fs.readFile(projectPath));

  // Check version
  if (!data.version || semver.lt(data.version, '5.0.0')) {
    // Auto-migrate
    const migrated = this.migrateToV5(data);

    // Backup original
    await fs.copyFile(projectPath, projectPath + '.v4.backup');

    // Save migrated version
    await fs.writeFile(projectPath, JSON.stringify(migrated, null, 2));

    return migrated;
  }

  return data;
}

migrateToV5(oldData) {
  const newData = {
    $schema: "./mindmap-schema.json",
    version: "5.0.0",
    name: oldData.name,
    content: oldData.content,
    nodes: {},
    categories: oldData.categories || [],
    relationships: oldData.relationships || [],
    connections: [],
    customOrders: oldData.customOrders || {},
    nodePositions: oldData.nodePositions || {},
    focusedNode: oldData.focusedNode,
    metadata: {
      ...oldData.metadata,
      migrated: new Date().toISOString(),
      originalVersion: "4.0.0"
    }
  };

  // Migrate nodes: node-0 => cloud-security-abc123
  const nodeIdMap = {}; // old ID => new ID

  Object.entries(oldData.nodes || {}).forEach(([oldId, nodeData]) => {
    // Extract title from content using old ID
    const title = this.getTitleFromOldId(oldData.content, oldId);
    const newId = this.generateNodeId(title);

    nodeIdMap[oldId] = newId;

    newData.nodes[newId] = {
      id: newId,
      title: title,
      description: nodeData.description || '',
      notes: nodeData.notes || '',
      images: this.migrateImages(nodeData.images || []),
      showInfo: nodeData.showInfo || false,
      categoryIds: [],  // Populated below
      relationshipIds: [],
      metadata: {
        created: oldData.metadata?.created || new Date().toISOString(),
        modified: new Date().toISOString(),
        version: 1
      }
    };
  });

  // Update category nodeIds
  newData.categories.forEach(cat => {
    if (cat.nodeIds) {
      cat.nodeIds = cat.nodeIds.map(oldId => nodeIdMap[oldId]).filter(Boolean);

      // Bidirectional sync: add categoryIds to nodes
      cat.nodeIds.forEach(newNodeId => {
        if (newData.nodes[newNodeId]) {
          if (!newData.nodes[newNodeId].categoryIds) {
            newData.nodes[newNodeId].categoryIds = [];
          }
          newData.nodes[newNodeId].categoryIds.push(cat.id);
        }
      });
    }
  });

  // Migrate connections (old format => new format)
  if (oldData.connections) {
    newData.connections = oldData.connections.map(conn => ({
      id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fromNodeId: nodeIdMap[conn.fromNodeId] || conn.fromNodeId,
      toNodeId: nodeIdMap[conn.toNodeId] || conn.toNodeId,
      relationshipId: conn.relationshipId,
      metadata: {
        created: new Date().toISOString(),
        migrated: true
      }
    }));
  }

  return newData;
}

migrateImages(oldImages) {
  return oldImages.map((img, index) => {
    // Old format: could be string URL or base64
    if (typeof img === 'string') {
      if (img.startsWith('data:image')) {
        // Base64
        return {
          id: `img-${Date.now()}-${index}`,
          base64: img,
          source: 'upload'
        };
      } else {
        // URL
        return {
          id: `img-${Date.now()}-${index}`,
          url: img,
          source: 'url'
        };
      }
    } else if (typeof img === 'object') {
      // Already structured (v3.0+ format)
      return {
        id: img.id || `img-${Date.now()}-${index}`,
        url: img.url,
        thumbnail: img.thumb || img.thumbnail,
        source: img.source || 'unsplash',
        photographer: img.photographer,
        description: img.description
      };
    }
  }).filter(Boolean);
}
```

---

### 6.2: Performance Considerations

**Challenge**: Large mindmaps (1000+ nodes) with many images

**Solutions**:

1. **Lazy Image Loading**
```javascript
// Only load images when info panel opens
async loadNodeImages(nodeId) {
  const node = this.nodeData[nodeId];
  if (!node.images) return;

  // Convert base64 to blob URLs for better memory
  node.images.forEach(img => {
    if (img.base64 && !img.blobUrl) {
      const blob = this.base64ToBlob(img.base64);
      img.blobUrl = URL.createObjectURL(blob);
    }
  });
}
```

2. **Image Compression**
```javascript
// Compress large base64 images on import
async compressImage(base64, maxWidth = 1200) {
  const canvas = document.createElement('canvas');
  const img = new Image();

  return new Promise((resolve) => {
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = base64;
  });
}
```

3. **Pagination for Large Projects**
```javascript
// MCP: List only first 50 projects
async listProjects({ limit = 50, offset = 0 }) {
  const allProjects = await this.getAllProjects();
  return {
    projects: allProjects.slice(offset, offset + limit),
    total: allProjects.length,
    hasMore: offset + limit < allProjects.length
  };
}
```

---

## 7. Technical Considerations

### 7.1: Breaking Changes from v4.0

| Change | Old Format | New Format | Migration |
|--------|-----------|------------|-----------|
| Node IDs | `node-0`, `node-1` | `cloud-security-a1b2c3d4` | Auto-remap |
| Images | String or object | Always object | Normalize |
| Categories | One-way link | Bidirectional | Sync both directions |
| Version field | Optional | Required | Add default |

---

### 7.2: Validation Layer

**NEW FILE**: `validation.js`

```javascript
import Ajv from 'ajv';
import schema from './mindmap-schema.json';

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

export function validatePmapFile(data) {
  const valid = validate(data);

  if (!valid) {
    throw new ValidationError(
      'Invalid .pmap file format',
      validate.errors
    );
  }

  // Additional semantic validation
  validateBidirectionalLinks(data);
  validateNodeReferences(data);

  return true;
}

function validateBidirectionalLinks(data) {
  // Check: If category has nodeId, node must have categoryId
  data.categories.forEach(cat => {
    cat.nodeIds.forEach(nodeId => {
      const node = data.nodes[nodeId];
      if (!node) {
        throw new ValidationError(
          `Category "${cat.name}" references non-existent node: ${nodeId}`
        );
      }
      if (!node.categoryIds.includes(cat.id)) {
        throw new ValidationError(
          `Node "${node.title}" missing categoryId "${cat.id}"`
        );
      }
    });
  });
}
```

---

### 7.3: TypeScript Definitions (Optional)

**NEW FILE**: `types.d.ts`

```typescript
// Full TypeScript definitions for IDE autocomplete
export interface PmapFile {
  $schema: string;
  version: string;
  name: string;
  content: string;
  nodes: Record<string, Node>;
  categories: Category[];
  relationships: Relationship[];
  connections: Connection[];
  customOrders: Record<string, string[]>;
  nodePositions: Record<string, Position>;
  focusedNode: string | null;
  metadata: Metadata;
}

export interface Node {
  id: string;
  title: string;
  description: string;      // Brief (max 200 chars)
  notes: string;            // Extended (markdown)
  images: Image[];
  showInfo: boolean;
  categoryIds: string[];
  relationshipIds: string[];
  metadata: NodeMetadata;
}

export interface Image {
  id: string;
  url?: string;
  thumbnail?: string;
  base64?: string;
  source: 'unsplash' | 'upload' | 'url';
  photographer?: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  nodeIds: string[];
  metadata: EntityMetadata;
}

export interface Relationship {
  id: string;
  name: string;
  color: string;
  dashPattern: number[];
  lineStyle: 'solid' | 'dashed' | 'dotted';
  description?: string;
  nodeIds: string[];
  metadata: EntityMetadata;
}

export interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  relationshipId: string;
  label?: string;
  metadata: EntityMetadata;
}
```

---

## 8. Success Metrics

### Quantitative Metrics

| Metric | Current (v4.0) | Target (v5.0) | Measurement |
|--------|---------------|--------------|-------------|
| **MCP Content Rendering Accuracy** | 60% | 100% | Integration tests |
| **Schema Validation Pass Rate** | N/A | 100% | Validator tests |
| **Migration Success Rate** | N/A | 100% | Migration test suite |
| **Developer Setup Time** | N/A | < 4 hours | Time tracking |
| **Documentation Completeness** | 70% | 100% | Field coverage audit |

### Qualitative Metrics

- **Developer Confidence**: "I know exactly where to put each field"
- **User Trust**: "Claude-created mindmaps work perfectly"
- **Maintenance Burden**: "Adding new fields is straightforward"

---

## 9. Open Questions

### High Priority

1. **Q**: Should we support multiple image formats (PNG, JPEG, WebP, SVG)?
   **A**: TBD - Need performance testing on large files

2. **Q**: Should `description` support markdown or plain text only?
   **A**: TBD - Plain text simpler, but markdown more flexible

3. **Q**: Maximum file size limit for .pmap files?
   **A**: TBD - Suggest 50MB limit, warn at 25MB

### Medium Priority

4. **Q**: Should we add a `tags` field separate from categories?
   **A**: Out of scope for v5.0, revisit in v5.1

5. **Q**: Should connections support custom bezier control points?
   **A**: Out of scope for v5.0

### Low Priority

6. **Q**: Should we support external file references (e.g., `images: [{file: './img.png'}]`)?
   **A**: Future enhancement, not v5.0

---

## 10. Timeline

### Phase 1: Specification (Week 1)
- [ ] Finalize JSON schema
- [ ] Review PRD with stakeholders
- [ ] Create test fixtures (20+ sample .pmap files)

### Phase 2: MCP Server (Week 2)
- [ ] Update all 17 MCP tools
- [ ] Add schema validation
- [ ] Write integration tests

### Phase 3: App Renderer (Week 3)
- [ ] Update parseOutline()
- [ ] Update renderNodes()
- [ ] Implement migration logic

### Phase 4: Testing & Documentation (Week 4)
- [ ] Run migration tests on 500+ files
- [ ] Update all documentation
- [ ] Create video tutorial
- [ ] Beta testing with 10 users

---

## 11. Dependencies

### Internal Dependencies
- `mindmap-engine.js` - Core parsing logic
- `project-manager.js` - File I/O operations
- `mcp-server/index.js` - All MCP tools
- `renderer.js` - UI rendering

### External Dependencies
- `ajv` (new) - JSON Schema validation
- `crypto` (node built-in) - Hash generation for node IDs
- `semver` (new) - Version comparison for migration

---

## 12. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Breaking existing files** | High | Critical | Auto-migration + backup |
| **Performance degradation** | Medium | High | Lazy loading + compression |
| **User confusion** | Low | Medium | Clear migration notification |
| **MCP API changes** | Low | High | Version pinning + tests |

---

## 13. Appendix

### A. Example Complete .pmap File (v5.0)

```json
{
  "$schema": "./mindmap-schema.json",
  "version": "5.0.0",
  "name": "Cloud Security Framework",
  "content": "Cloud Security\\n1. Identity Management | User authentication and access control\\n* Multi-Factor Auth | TOTP and SMS verification\\n* Single Sign-On | Centralized authentication\\n2. Data Encryption\\n* At Rest | AES-256 encryption\\n* In Transit | TLS 1.3",
  "nodes": {
    "cloud-security-a1b2c3d4": {
      "id": "cloud-security-a1b2c3d4",
      "title": "Cloud Security",
      "description": "Comprehensive approach to securing cloud infrastructure",
      "notes": "## Overview\\n\\nThis framework covers all aspects of cloud security including identity, encryption, and network protection.\\n\\n## References\\n- NIST SP 800-144\\n- CIS AWS Foundations Benchmark",
      "images": [
        {
          "id": "img-unsplash-xyz789",
          "url": "https://images.unsplash.com/photo-1234567890",
          "thumbnail": "https://images.unsplash.com/photo-1234567890?w=400",
          "source": "unsplash",
          "photographer": "John Doe",
          "description": "Cloud infrastructure visualization"
        }
      ],
      "showInfo": true,
      "categoryIds": ["cat-priority-high"],
      "relationshipIds": [],
      "metadata": {
        "created": "2025-01-11T10:00:00Z",
        "modified": "2025-01-11T12:30:00Z",
        "author": "claude-mcp",
        "version": 1
      }
    },
    "identity-mgmt-e5f6g7h8": {
      "id": "identity-mgmt-e5f6g7h8",
      "title": "Identity Management",
      "description": "User authentication and access control",
      "notes": "",
      "images": [],
      "showInfo": false,
      "categoryIds": ["cat-priority-high"],
      "relationshipIds": ["rel-depends-on"],
      "metadata": {
        "created": "2025-01-11T10:05:00Z",
        "modified": "2025-01-11T10:05:00Z",
        "author": "claude-mcp",
        "version": 1
      }
    },
    "mfa-auth-i9j0k1l2": {
      "id": "mfa-auth-i9j0k1l2",
      "title": "Multi-Factor Auth",
      "description": "TOTP and SMS verification",
      "notes": "## Implementation\\n\\n- Use Google Authenticator or Authy\\n- Fallback to SMS for 2FA\\n- Backup codes required",
      "images": [],
      "showInfo": false,
      "categoryIds": [],
      "relationshipIds": ["rel-depends-on"],
      "metadata": {
        "created": "2025-01-11T10:10:00Z",
        "modified": "2025-01-11T10:10:00Z",
        "author": "claude-mcp",
        "version": 1
      }
    }
  },
  "categories": [
    {
      "id": "cat-priority-high",
      "name": "High Priority",
      "color": "#dc2626",
      "icon": "⚠️",
      "description": "Critical security components",
      "nodeIds": [
        "cloud-security-a1b2c3d4",
        "identity-mgmt-e5f6g7h8"
      ],
      "metadata": {
        "created": "2025-01-11T10:00:00Z",
        "usageCount": 2
      }
    }
  ],
  "relationships": [
    {
      "id": "rel-depends-on",
      "name": "depends on",
      "color": "#3b82f6",
      "dashPattern": [5, 5],
      "lineStyle": "dashed",
      "description": "Dependency relationship",
      "nodeIds": [
        "mfa-auth-i9j0k1l2",
        "identity-mgmt-e5f6g7h8"
      ],
      "metadata": {
        "created": "2025-01-11T10:12:00Z",
        "connectionCount": 1
      }
    }
  ],
  "connections": [
    {
      "id": "conn-1",
      "fromNodeId": "mfa-auth-i9j0k1l2",
      "toNodeId": "identity-mgmt-e5f6g7h8",
      "relationshipId": "rel-depends-on",
      "label": "requires",
      "metadata": {
        "created": "2025-01-11T10:12:00Z"
      }
    }
  ],
  "customOrders": {
    "cloud-security-a1b2c3d4": [
      "identity-mgmt-e5f6g7h8",
      "data-encryption-m3n4o5p6"
    ]
  },
  "nodePositions": {
    "cloud-security-a1b2c3d4": { "x": 400, "y": 300 }
  },
  "focusedNode": null,
  "metadata": {
    "created": "2025-01-11T10:00:00Z",
    "modified": "2025-01-11T12:30:00Z",
    "version": "5.0.0",
    "author": "Gonzalo Riederer",
    "appVersion": "5.0.0",
    "nodeCount": 3,
    "categoryCount": 1,
    "relationshipCount": 1
  }
}
```

---

### B. Claude Code Usage Examples (v5.0)

**Example 1: Create Complete Mindmap**

```javascript
// Claude Code command:
await mcp.createMindmap({
  topic: "Risk Management",
  nodes: [
    {
      title: "Risk Identification",
      description: "Systematic process to find and document risks",
      notes: "## Methods\\n- Brainstorming\\n- SWOT Analysis\\n- Checklists",
      level: 1,
      categoryNames: ["Critical"],
      images: [
        {
          url: "https://images.unsplash.com/photo-risk",
          source: "unsplash",
          photographer: "Jane Smith"
        }
      ]
    },
    {
      title: "Risk Assessment",
      description: "Evaluate likelihood and impact",
      notes: "Use quantitative and qualitative methods",
      level: 1,
      relationshipNames: ["follows"]
    }
  ],
  categories: [
    { name: "Critical", color: "#dc2626", icon: "🔥" }
  ],
  relationships: [
    { name: "follows", color: "#10b981", lineStyle: "solid" }
  ]
});
```

**Result**: Creates fully-formed mindmap with all connections working perfectly in app.

---

**Example 2: Update Node Content**

```javascript
await mcp.updateNode({
  projectName: "Risk Management",
  nodeTitle: "Risk Assessment",
  updates: {
    description: "Comprehensive risk evaluation",
    notes: "## Quantitative Methods\\n- Monte Carlo\\n- Decision Trees\\n\\n## Qualitative\\n- Expert judgment",
    showInfo: true
  }
});
```

**Result**: Opens info panel in app showing updated content.

---

### C. References

- [JSON Schema Specification](https://json-schema.org/)
- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [Electron IPC Best Practices](https://www.electronjs.org/docs/latest/tutorial/ipc)
- [PWC Mindmap v4.0 README](../README.md)

---

## Approval

**Product Owner**: _________________
**Lead Developer**: _________________
**Date**: _________________

---

**Next Steps**:
1. Review and approve PRD
2. Create task breakdown (tasks-0001-prd-json-format-standardization.md)
3. Begin Phase 1 implementation
