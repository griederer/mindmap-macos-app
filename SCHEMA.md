# PWC Mindmap File Format Schema (v4.0)

**Version**: 4.0.0
**Format**: `.pmap` (Custom JSON-based format)
**Last Updated**: October 7, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [File Format](#file-format)
3. [Schema Specification](#schema-specification)
4. [Node Structure](#node-structure)
5. [Image Storage](#image-storage)
6. [Categories & Relationships](#categories--relationships)
7. [Metadata System](#metadata-system)
8. [Migration Guide](#migration-guide)
9. [Best Practices](#best-practices)

---

## Overview

### What is .pmap?

`.pmap` stands for **"PWC Mindmap"** - a custom file format created specifically for PWC Mindmap Pro. While the extension is unique, the format is **JSON-based** for maximum compatibility and readability.

### Why a Custom Extension?

1. **File Association** - macOS can associate `.pmap` files with the PWC Mindmap app
2. **Professional Branding** - Aligns with PWC naming conventions
3. **Clear Identity** - Distinguishes mindmap projects from generic JSON files
4. **Future-Proofing** - Allows format evolution without breaking compatibility
5. **Double-Click Support** - Users can double-click to open in app

### Technical Details

- **Format**: JSON (UTF-8 encoded)
- **Extension**: `.pmap`
- **MIME Type**: `application/json` (or custom `application/x-pwc-mindmap`)
- **Compatibility**: Can be renamed to `.json` and still work
- **Version**: Schema version tracked in each file

---

## File Format

### Basic Structure

Every `.pmap` file contains:

```json
{
  "topic": "string",           // Main topic/title (required)
  "created": "ISO-8601",       // Creation timestamp (required)
  "modified": "ISO-8601",      // Last modification timestamp (required)
  "version": "4.0.0",          // Schema version (required)
  "nodes": [],                 // Array of node objects (required)
  "categories": [],            // Array of category objects (optional)
  "relationships": [],         // Array of relationship types (optional)
  "connections": [],           // Array of node connections (optional)
  "customOrders": {},          // Custom child node ordering (optional)
  "nodePositions": {},         // Fixed node positions (optional)
  "focusedNodeId": null,       // Currently focused node (optional)
  "presentation": {}           // Presentation mode data (optional, v4.0+)
}
```

### File Naming Convention

- **Format**: `Topic Name.pmap`
- **Examples**:
  - `Cloud Security.pmap`
  - `Data Privacy Framework.pmap`
  - `Risk Management.pmap`
- **Rules**:
  - No special characters except spaces, hyphens, underscores
  - Maximum 255 characters
  - Must end with `.pmap` extension

---

## Schema Specification

### Root Object

```typescript
interface PmapFile {
  // Basic metadata
  topic: string;                    // Main topic (max 200 chars)
  created: string;                  // ISO-8601 timestamp
  modified: string;                 // ISO-8601 timestamp
  version: string;                  // Semantic version (e.g., "4.0.0")

  // Core data
  nodes: Node[];                    // All nodes in the mindmap

  // Optional features (v4.0+)
  categories?: Category[];          // Color-coded categories
  relationships?: Relationship[];   // Relationship type definitions
  connections?: Connection[];       // Inter-node connections
  customOrders?: { [nodeId: string]: string[] };  // Custom child ordering
  nodePositions?: { [nodeId: string]: Position }; // Fixed positions
  focusedNodeId?: string | null;   // Currently focused node ID
  presentation?: Presentation;      // Presentation mode data
}
```

### Data Type Constraints

| Field | Type | Required | Max Length | Format |
|-------|------|----------|------------|--------|
| `topic` | string | ✅ Yes | 200 chars | Plain text |
| `created` | string | ✅ Yes | - | ISO-8601 |
| `modified` | string | ✅ Yes | - | ISO-8601 |
| `version` | string | ✅ Yes | 10 chars | Semver (x.y.z) |
| `nodes` | array | ✅ Yes | 10,000 nodes | Node[] |
| `categories` | array | ❌ No | 100 categories | Category[] |
| `relationships` | array | ❌ No | 50 types | Relationship[] |
| `connections` | array | ❌ No | 1,000 connections | Connection[] |
| `customOrders` | object | ❌ No | - | Object |
| `nodePositions` | object | ❌ No | - | Object |
| `focusedNodeId` | string/null | ❌ No | 50 chars | node-{id} |
| `presentation` | object | ❌ No | - | Presentation |

---

## Node Structure

### Node Object Schema

```typescript
interface Node {
  // Identity
  id: string;                      // Unique identifier (e.g., "node-0")
  title: string;                   // Node title (max 200 chars)

  // Hierarchy
  level: number;                   // Depth level (0 = root)
  parentId: string | null;         // Parent node ID (null for root)
  children: string[];              // Array of child node IDs

  // Positioning
  position: Position;              // {x, y} coordinates
  isFixed: boolean;                // Whether position is manually set

  // Visual state
  collapsed: boolean;              // Whether node is collapsed

  // Content (optional)
  description?: string;            // Short description (max 500 chars)
  notes?: string;                  // Additional notes (max 5000 chars)
  image?: string;                  // Base64 data URI or URL

  // Organization (optional, v4.0+)
  categoryId?: string;             // Assigned category ID
}
```

### Position Object

```typescript
interface Position {
  x: number;                       // X coordinate (pixels from left)
  y: number;                       // Y coordinate (pixels from top)
}
```

### Node ID Format

- **Pattern**: `node-{incrementing-number}`
- **Examples**: `node-0`, `node-1`, `node-42`
- **Root Node**: Always `node-0`
- **Uniqueness**: Must be unique within file

### Hierarchy Rules

1. **Root node** (level 0) has `parentId: null`
2. **Child nodes** reference parent via `parentId`
3. **Children array** lists all direct children IDs
4. **Maximum depth**: Recommended 6 levels, hard limit 20
5. **Ordering**: Children rendered in array order (unless `customOrders` overrides)

### Example Node

```json
{
  "id": "node-0",
  "title": "Cloud Security",
  "level": 0,
  "parentId": null,
  "children": ["node-1", "node-2", "node-3"],
  "position": { "x": 400, "y": 300 },
  "isFixed": false,
  "collapsed": false,
  "description": "Comprehensive approach to securing cloud infrastructure and data",
  "notes": "Last updated: October 2025\n\nKey focus areas:\n- Identity management\n- Data encryption\n- Network security",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

---

## Image Storage

### Storage Method: Base64 Encoding

PWC Mindmap Pro stores images **directly inside .pmap files** using Base64 encoding. This design choice prioritizes **portability** and **simplicity** over file size.

### Image Field Format

```typescript
type ImageData = string;  // Base64 data URI
```

**Format**: `data:{mime-type};base64,{base64-encoded-data}`

**Example**:
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBD..."
}
```

### Supported Image Types

| Format | MIME Type | Max Size (Decoded) | Quality |
|--------|-----------|-------------------|---------|
| JPEG | `image/jpeg` | 2 MB | 85% |
| PNG | `image/png` | 2 MB | Lossless |
| WebP | `image/webp` | 2 MB | 85% |
| GIF | `image/gif` | 1 MB | - |

### Image Processing Pipeline

1. **Input**: URL (e.g., Unsplash API) or local file path
2. **Download**: Fetch image data via HTTP/file system
3. **Validation**: Check format, size, dimensions
4. **Compression**: Resize if needed (max 1920x1080)
5. **Encoding**: Convert to Base64 data URI
6. **Storage**: Save in node's `image` field

### Base64 Size Overhead

Base64 encoding adds approximately **33% overhead**:

- **Original JPEG**: 500 KB
- **Base64 encoded**: ~670 KB
- **In JSON**: ~670 KB (no additional overhead)

### Pros & Cons

✅ **Advantages**:
- **Self-contained** - One file includes everything
- **Portable** - No broken image links
- **Simple** - No asset folder management
- **Version control friendly** - Git tracks all changes
- **Cloud sync ready** - Single file to sync

❌ **Disadvantages**:
- **Larger file sizes** - 33% overhead from encoding
- **Memory usage** - All images loaded with file
- **Slower parsing** - JSON parsing includes image data
- **Not ideal for many images** - 10+ images can create large files

### Alternative Approaches (Not Implemented)

#### Option 1: External Assets Folder
```
Cloud Security.pmap
Cloud Security_assets/
  ├── node-1-image.jpg
  ├── node-2-image.jpg
  └── node-3-image.jpg
```

**Pros**: Smaller .pmap files, faster parsing
**Cons**: More complex file management, broken links possible

#### Option 2: URL References
```json
{
  "image": "https://images.unsplash.com/photo-123..."
}
```

**Pros**: No storage overhead
**Cons**: Requires internet, external dependencies

### Best Practices

1. **Compress images** before adding to mindmap
2. **Limit to 5-10 images** per mindmap for optimal performance
3. **Use JPEG** for photos (smaller size)
4. **Use PNG** for diagrams/text (better quality)
5. **Resize to max 1920px** width before encoding
6. **Consider external storage** for image-heavy mindmaps

---

## Categories & Relationships

### Categories (v4.0+)

Categories allow color-coding and organization of nodes.

```typescript
interface Category {
  id: string;                      // Unique identifier (e.g., "cat-1")
  name: string;                    // Display name (max 50 chars)
  color: string;                   // Hex color code (e.g., "#ff6b6b")
  description?: string;            // Optional description
}
```

**Example**:
```json
{
  "categories": [
    {
      "id": "cat-1",
      "name": "High Priority",
      "color": "#dc2626",
      "description": "Critical security issues requiring immediate attention"
    },
    {
      "id": "cat-2",
      "name": "Best Practices",
      "color": "#3b82f6"
    }
  ]
}
```

### Relationships (v4.0+)

Define custom relationship types between nodes.

```typescript
interface Relationship {
  id: string;                      // Unique identifier (e.g., "rel-1")
  name: string;                    // Display name (e.g., "depends on")
  color: string;                   // Hex color for connection line
  dashPattern?: string;            // SVG dash pattern (e.g., "5,5")
  bidirectional?: boolean;         // Whether relationship goes both ways
}
```

**Example**:
```json
{
  "relationships": [
    {
      "id": "rel-1",
      "name": "depends on",
      "color": "#3b82f6",
      "dashPattern": "5,5"
    },
    {
      "id": "rel-2",
      "name": "conflicts with",
      "color": "#ef4444",
      "dashPattern": "10,5",
      "bidirectional": true
    }
  ]
}
```

### Connections

Link nodes using defined relationships.

```typescript
interface Connection {
  id: string;                      // Unique identifier (e.g., "conn-1")
  fromNodeId: string;              // Source node ID
  toNodeId: string;                // Target node ID
  relationshipId: string;          // Relationship type ID
  label?: string;                  // Optional connection label
}
```

**Example**:
```json
{
  "connections": [
    {
      "id": "conn-1",
      "fromNodeId": "node-5",
      "toNodeId": "node-2",
      "relationshipId": "rel-1",
      "label": "requires authentication"
    }
  ]
}
```

---

## Presentation Mode (v4.0+)

### Overview

Presentation mode allows users to create slide-based presentations from their mindmaps. Each slide captures the complete state of the mindmap at a specific moment, enabling dynamic playback with smooth animations.

### Presentation Object Schema

```typescript
interface Presentation {
  slides: Slide[];                 // Array of presentation slides
  created: string;                 // ISO-8601 timestamp
  modified: string;                // ISO-8601 timestamp
}
```

### Slide Object Schema

```typescript
interface Slide {
  // Identity
  id: number;                      // Unique slide number (1, 2, 3...)
  description: string;             // Auto-generated or user-provided description

  // Node state
  expandedNodes: string[];         // Array of expanded node IDs
  openInfoPanels: string[];        // Array of node IDs with info panels open

  // Image state
  activeImage: {                   // Full-screen image being displayed (if any)
    nodeId: string;                // Node containing the image
    imageUrl: string;              // Image data URI
  } | null;

  // View state
  focusedNode: string | null;      // Focused node ID (for focus mode)
  zoom: number;                    // Zoom level (e.g., 1.0, 1.5)
  pan: Position;                   // Pan position {x, y}

  // Feature toggles
  categoriesVisible: boolean;      // Whether categories are visible
  relationshipsVisible: boolean;   // Whether relationships are visible
}
```

### Example Presentation Data

```json
{
  "presentation": {
    "slides": [
      {
        "id": 1,
        "description": "Root node overview",
        "expandedNodes": ["node-0"],
        "openInfoPanels": [],
        "activeImage": null,
        "focusedNode": null,
        "zoom": 1.0,
        "pan": { "x": 0, "y": 0 },
        "categoriesVisible": true,
        "relationshipsVisible": true
      },
      {
        "id": 2,
        "description": "Identity Management expanded",
        "expandedNodes": ["node-0", "node-1"],
        "openInfoPanels": [],
        "activeImage": null,
        "focusedNode": null,
        "zoom": 1.2,
        "pan": { "x": -50, "y": -30 },
        "categoriesVisible": true,
        "relationshipsVisible": true
      },
      {
        "id": 3,
        "description": "Multi-Factor Auth details",
        "expandedNodes": ["node-0", "node-1"],
        "openInfoPanels": ["node-4"],
        "activeImage": null,
        "focusedNode": null,
        "zoom": 1.5,
        "pan": { "x": -100, "y": -80 },
        "categoriesVisible": true,
        "relationshipsVisible": false
      },
      {
        "id": 4,
        "description": "Cloud Security image",
        "expandedNodes": ["node-0"],
        "openInfoPanels": [],
        "activeImage": {
          "nodeId": "node-0",
          "imageUrl": "data:image/jpeg;base64,/9j/4AAQ..."
        },
        "focusedNode": null,
        "zoom": 1.0,
        "pan": { "x": 0, "y": 0 },
        "categoriesVisible": false,
        "relationshipsVisible": false
      }
    ],
    "created": "2025-10-07T16:00:00.000Z",
    "modified": "2025-10-07T16:15:30.000Z"
  }
}
```

### Slide Description Auto-Generation

The system automatically generates descriptive slide titles based on the slide state:

| Slide State | Generated Description |
|-------------|----------------------|
| Root only | "Root node overview" |
| Branch expanded | "{NodeTitle} expanded" |
| Info panel open | "{NodeTitle} details" |
| Image displayed | "{NodeTitle} image" |
| Focus mode active | "Focused on {NodeTitle}" |
| Multiple changes | "{NodeTitle} branch with details" |

### Data Size Considerations

- **Typical slide size**: ~500 bytes (without image references)
- **With image URL**: +100 bytes (image data stored in node, not duplicated)
- **100 slides**: ~50 KB
- **File size impact**: < 1% for typical presentations

### Presentation State Rules

1. **Slide IDs**: Sequential integers starting from 1
2. **Expanded nodes**: Must include all ancestors (e.g., expanding `node-2-3` requires `node-0`, `node-2`, `node-2-3`)
3. **Open info panels**: Only nodes with `description` or `notes` fields
4. **Active image**: Only one image can be active per slide
5. **Zoom range**: 0.5 (50%) to 3.0 (300%)
6. **Pan coordinates**: Relative to canvas center (0,0)

### Backward Compatibility

Files without `presentation` field:
- Load normally without presentation features
- Presentation can be added and saved later
- No migration required

Files with `presentation` field:
- Fully supported in v4.0+
- Older versions will ignore the field (graceful degradation)

---

## Metadata System

### .metadata.json File

PWC Mindmap Pro maintains a **central metadata file** to track all projects:

**Location**: `~/Documents/PWC Mindmaps/.metadata.json`

```typescript
interface Metadata {
  recentProjects: string[];        // Array of absolute file paths
  favorites: string[];             // Array of favorite project paths
  lastOpened: string | null;       // Last opened project path
}
```

### Example .metadata.json

```json
{
  "recentProjects": [
    "/Users/gonzalo/Documents/PWC Mindmaps/Cybersecurity Best Practices.pmap",
    "/Users/gonzalo/Documents/PWC Mindmaps/Data Privacy Framework.pmap",
    "/Users/gonzalo/Documents/PWC Mindmaps/Cloud Security.pmap",
    "/Users/gonzalo/Documents/PWC Mindmaps/Risk Management.pmap"
  ],
  "favorites": [
    "/Users/gonzalo/Documents/PWC Mindmaps/Cybersecurity Best Practices.pmap"
  ],
  "lastOpened": "/Users/gonzalo/Documents/PWC Mindmaps/Cybersecurity Best Practices.pmap"
}
```

### Metadata Rules

1. **Recent projects** - Maximum 10 entries, most recent first
2. **Favorites** - No limit, alphabetically sorted
3. **Last opened** - Updated on every project load
4. **Absolute paths** - All paths must be absolute
5. **Auto-cleanup** - Non-existent files removed automatically

### Metadata Updates

The metadata file is automatically updated when:
- ✅ Project opened/loaded
- ✅ Project created via MCP
- ✅ Project deleted
- ✅ Project favorited/unfavorited
- ✅ App launched (cleanup check)

---

## Migration Guide

### Upgrading from v3.x to v4.0

Version 4.0 introduces several new fields but maintains **backward compatibility**.

#### New Fields in v4.0

```json
{
  "version": "4.0.0",              // ← NEW: Schema version tracking
  "categories": [],                // ← NEW: Category system
  "relationships": [],             // ← NEW: Relationship types
  "connections": [],               // ← NEW: Inter-node connections
  "customOrders": {},              // ← NEW: Custom child ordering
  "nodePositions": {},             // ← NEW: Fixed positioning
  "focusedNodeId": null            // ← NEW: Focus mode support
}
```

#### Migration Steps

**Option 1: Automatic Migration** (Recommended)
1. Open v3.x `.pmap` file in v4.0 app
2. App automatically adds new fields with defaults
3. Save file to complete migration

**Option 2: Manual Migration**
```bash
# Backup original
cp "Cloud Security.pmap" "Cloud Security.pmap.backup"

# Add new fields via script
node migrate-to-v4.js "Cloud Security.pmap"
```

#### Breaking Changes

**None!** v4.0 is fully backward compatible with v3.x files.

#### Deprecations

- None in v4.0

---

## Best Practices

### File Organization

```
~/Documents/PWC Mindmaps/
├── .metadata.json                    # Metadata file
├── Cloud Security.pmap               # Project 1
├── Data Privacy Framework.pmap       # Project 2
├── Risk Management.pmap              # Project 3
└── Archive/                          # Optional: Old projects
    └── Old Project.pmap
```

### Performance Guidelines

| Metric | Recommended | Maximum | Notes |
|--------|-------------|---------|-------|
| **Nodes** | < 100 | 10,000 | Optimal rendering performance |
| **Images** | < 10 | 50 | Keep file size manageable |
| **File Size** | < 5 MB | 50 MB | Larger files may slow app |
| **Hierarchy Depth** | < 6 levels | 20 levels | Deeper = harder to visualize |
| **Categories** | < 10 | 100 | Too many = visual clutter |
| **Relationships** | < 5 types | 50 | Keep relationship types simple |
| **Connections** | < 20 | 1,000 | Too many = spaghetti diagram |

### Naming Conventions

**Good Names**:
- ✅ `Cloud Security.pmap`
- ✅ `GDPR Compliance Framework.pmap`
- ✅ `Q1-2025-Security-Roadmap.pmap`

**Bad Names**:
- ❌ `untitled.pmap` (not descriptive)
- ❌ `project (1).pmap` (auto-generated names)
- ❌ `security/compliance.pmap` (avoid slashes)

### Content Guidelines

1. **Node Titles**: 5-50 characters, descriptive
2. **Descriptions**: 50-200 words, concise
3. **Notes**: For detailed context, not core content
4. **Images**: Relevant to topic, compressed
5. **Categories**: 5-10 logical groupings
6. **Relationships**: Define clear, meaningful types

### Version Control

If storing `.pmap` files in Git:

```gitignore
# Don't ignore .pmap files - they're source files!
# *.pmap

# But ignore metadata
.metadata.json

# Ignore large image caches (if using external assets)
*_assets/
```

**Commit Messages**:
```bash
git commit -m "feat(cloud-security): add encryption section"
git commit -m "fix(data-privacy): correct GDPR compliance nodes"
git commit -m "docs(risk-mgmt): add mitigation strategies"
```

### Backup Strategy

1. **Local Backups**: Enable Time Machine (macOS)
2. **Cloud Sync**: Store in iCloud/Dropbox/Google Drive
3. **Version Control**: Use Git for project tracking
4. **Export JSON**: Regular JSON exports for compatibility

### Security Considerations

1. **Sensitive Data**: Avoid storing credentials or PII
2. **Image Privacy**: Be mindful of image content
3. **File Permissions**: Set appropriate file permissions
   ```bash
   chmod 600 ~/Documents/PWC\ Mindmaps/*.pmap
   ```
4. **Encryption**: Use encrypted volumes for sensitive mindmaps

---

## Example: Complete .pmap File

```json
{
  "topic": "Cloud Security",
  "created": "2025-10-07T10:30:00.000Z",
  "modified": "2025-10-07T15:45:23.000Z",
  "version": "4.0.0",

  "nodes": [
    {
      "id": "node-0",
      "title": "Cloud Security",
      "level": 0,
      "parentId": null,
      "children": ["node-1", "node-2", "node-3"],
      "position": { "x": 400, "y": 300 },
      "isFixed": false,
      "collapsed": false,
      "description": "Comprehensive approach to securing cloud infrastructure",
      "notes": "Focus areas for Q1 2025:\n- Zero Trust Architecture\n- CSPM tools evaluation\n- Incident response planning",
      "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...",
      "categoryId": "cat-1"
    },
    {
      "id": "node-1",
      "title": "Identity & Access Management",
      "level": 1,
      "parentId": "node-0",
      "children": ["node-4", "node-5"],
      "position": { "x": 200, "y": 150 },
      "isFixed": false,
      "collapsed": false,
      "description": "Control and monitor user access to cloud resources",
      "categoryId": "cat-1"
    },
    {
      "id": "node-2",
      "title": "Data Encryption",
      "level": 1,
      "parentId": "node-0",
      "children": ["node-6", "node-7"],
      "position": { "x": 600, "y": 150 },
      "isFixed": false,
      "collapsed": false,
      "description": "Protect data at rest and in transit"
    },
    {
      "id": "node-3",
      "title": "Network Security",
      "level": 1,
      "parentId": "node-0",
      "children": ["node-8"],
      "position": { "x": 400, "y": 450 },
      "isFixed": false,
      "collapsed": false,
      "categoryId": "cat-2"
    },
    {
      "id": "node-4",
      "title": "Multi-Factor Authentication",
      "level": 2,
      "parentId": "node-1",
      "children": [],
      "position": { "x": 100, "y": 50 },
      "isFixed": false,
      "collapsed": false,
      "description": "Require multiple verification methods",
      "notes": "Recommended: Hardware tokens (YubiKey) + Biometrics"
    },
    {
      "id": "node-5",
      "title": "Single Sign-On",
      "level": 2,
      "parentId": "node-1",
      "children": [],
      "position": { "x": 300, "y": 50 },
      "isFixed": false,
      "collapsed": false,
      "description": "Centralized authentication across services"
    },
    {
      "id": "node-6",
      "title": "Encryption at Rest",
      "level": 2,
      "parentId": "node-2",
      "children": [],
      "position": { "x": 500, "y": 50 },
      "isFixed": false,
      "collapsed": false,
      "description": "Encrypt stored data (AES-256)"
    },
    {
      "id": "node-7",
      "title": "Encryption in Transit",
      "level": 2,
      "parentId": "node-2",
      "children": [],
      "position": { "x": 700, "y": 50 },
      "isFixed": false,
      "collapsed": false,
      "description": "Use TLS 1.3 for all communications"
    },
    {
      "id": "node-8",
      "title": "Firewall Rules",
      "level": 2,
      "parentId": "node-3",
      "children": [],
      "position": { "x": 400, "y": 550 },
      "isFixed": false,
      "collapsed": false,
      "categoryId": "cat-2"
    }
  ],

  "categories": [
    {
      "id": "cat-1",
      "name": "High Priority",
      "color": "#dc2626",
      "description": "Critical security controls"
    },
    {
      "id": "cat-2",
      "name": "Infrastructure",
      "color": "#3b82f6"
    }
  ],

  "relationships": [
    {
      "id": "rel-1",
      "name": "depends on",
      "color": "#3b82f6",
      "dashPattern": "5,5"
    }
  ],

  "connections": [
    {
      "id": "conn-1",
      "fromNodeId": "node-4",
      "toNodeId": "node-5",
      "relationshipId": "rel-1",
      "label": "requires"
    }
  ],

  "customOrders": {
    "node-0": ["node-1", "node-2", "node-3"]
  },

  "nodePositions": {
    "node-0": { "x": 400, "y": 300 }
  },

  "focusedNodeId": null,

  "presentation": {
    "slides": [
      {
        "id": 1,
        "description": "Root node overview",
        "expandedNodes": ["node-0"],
        "openInfoPanels": [],
        "activeImage": null,
        "focusedNode": null,
        "zoom": 1.0,
        "pan": { "x": 0, "y": 0 },
        "categoriesVisible": true,
        "relationshipsVisible": true
      },
      {
        "id": 2,
        "description": "Identity Management expanded",
        "expandedNodes": ["node-0", "node-1"],
        "openInfoPanels": [],
        "activeImage": null,
        "focusedNode": null,
        "zoom": 1.2,
        "pan": { "x": -50, "y": -30 },
        "categoriesVisible": true,
        "relationshipsVisible": true
      }
    ],
    "created": "2025-10-07T16:00:00.000Z",
    "modified": "2025-10-07T16:15:30.000Z"
  }
}
```

---

## Schema Validation

### JSON Schema (Draft-07)

For automated validation:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PWC Mindmap Format",
  "type": "object",
  "required": ["topic", "created", "modified", "version", "nodes"],
  "properties": {
    "topic": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200
    },
    "created": {
      "type": "string",
      "format": "date-time"
    },
    "modified": {
      "type": "string",
      "format": "date-time"
    },
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$"
    },
    "nodes": {
      "type": "array",
      "items": { "$ref": "#/definitions/node" }
    }
  },
  "definitions": {
    "node": {
      "type": "object",
      "required": ["id", "title", "level", "parentId", "children", "position"],
      "properties": {
        "id": { "type": "string", "pattern": "^node-\\d+$" },
        "title": { "type": "string", "maxLength": 200 },
        "level": { "type": "integer", "minimum": 0 },
        "parentId": { "type": ["string", "null"] },
        "children": { "type": "array", "items": { "type": "string" } },
        "position": {
          "type": "object",
          "required": ["x", "y"],
          "properties": {
            "x": { "type": "number" },
            "y": { "type": "number" }
          }
        }
      }
    }
  }
}
```

### Validation Tools

**Node.js**:
```javascript
const Ajv = require('ajv');
const schema = require('./pmap-schema.json');
const data = require('./Cloud Security.pmap');

const ajv = new Ajv();
const validate = ajv.compile(schema);
const valid = validate(data);

if (!valid) console.log(validate.errors);
```

**CLI**:
```bash
npm install -g ajv-cli
ajv validate -s pmap-schema.json -d "Cloud Security.pmap"
```

---

## Future Considerations

### Potential v5.0 Features

- **External Asset Folders** - Option for separate image storage
- **Compression** - Built-in gzip compression
- **Encryption** - Native file encryption support
- **Collaboration Metadata** - Multi-user editing support
- **Version History** - Built-in file versioning
- **Templates** - Reusable mindmap templates

### Backward Compatibility Promise

PWC Mindmap Pro guarantees:
- ✅ v4.x files will open in v5.x
- ✅ v3.x files will open in v4.x
- ✅ Deprecations announced 6 months in advance
- ✅ Migration tools provided for breaking changes

---

## References

- **[README.md](README.md)** - Main project documentation
- **[MCP Documentation](mcp-server/MCP-COMPLETE-DOCUMENTATION.md)** - MCP server API reference
- **[MINDMAP_FORMAT.md](MINDMAP_FORMAT.md)** - Text import format guide
- **[CHANGELOG.md](CHANGELOG.md)** - Version history

---

**Questions or issues?** Open an issue at: https://github.com/griederer/mindmap-macos-app/issues
