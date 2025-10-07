# PWC Mindmap Pro - Technical Architecture (v4.0)

**Version**: 4.0.0
**Last Updated**: October 7, 2025
**Author**: Gonzalo Riederer

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Technology Stack](#technology-stack)
4. [Application Components](#application-components)
5. [Data Flow](#data-flow)
6. [File System Architecture](#file-system-architecture)
7. [Rendering Pipeline](#rendering-pipeline)
8. [IPC Communication](#ipc-communication)
9. [MCP Server Architecture](#mcp-server-architecture)
10. [Performance Optimizations](#performance-optimizations)
11. [Security Model](#security-model)
12. [Testing Strategy](#testing-strategy)

---

## System Overview

PWC Mindmap Pro is a **native macOS desktop application** built with Electron, featuring:

- **Multi-process architecture** - Separate main and renderer processes
- **Canvas-based rendering** - High-performance node connections
- **File-based storage** - JSON `.pmap` files with Base64 images
- **MCP integration** - Natural language control via Claude Code
- **Real-time file watching** - Auto-reload on external changes

### Design Philosophy

1. **Native macOS Feel** - Follow Apple HIG guidelines
2. **Performance First** - 60fps animations, minimal reflows
3. **Simplicity** - Single-file projects, no databases
4. **Extensibility** - MCP server for AI integration
5. **Offline-First** - No cloud dependencies

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     PWC Mindmap Pro (v4.0)                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       Claude Code / AI                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              MCP Protocol (stdio/IPC)                      │  │
│  └───────────────────────────────────────────────────────────┘  │
│         │                                                         │
│         ▼                                                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │           MCP Server (Node.js)                            │  │
│  │  • 17 Tools for mindmap control                           │  │
│  │  • Natural language processing                            │  │
│  │  • Unsplash API integration                               │  │
│  │  • File system operations                                 │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                          │
                          │ File System (Read/Write .pmap files)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Electron Application                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐         ┌──────────────────────────────┐ │
│  │   Main Process   │◄────────┤   Preload (Secure Bridge)    │ │
│  │   (Node.js)      │  IPC    └──────────────────────────────┘ │
│  │                  │                      ▲                    │
│  │ • Window mgmt    │                      │                    │
│  │ • Menu system    │                      │                    │
│  │ • File I/O       │         ┌────────────┴──────────────────┐│
│  │ • IPC handlers   │         │   Renderer Process (Chromium) ││
│  │ • ProjectManager │         │                               ││
│  │ • File watcher   │         │ ┌─────────────────────────┐   ││
│  └──────────────────┘         │ │   UI Layer (HTML/CSS)   │   ││
│           │                   │ │ • index.html            │   ││
│           │                   │ │ • styles.css            │   ││
│           ▼                   │ └─────────────────────────┘   ││
│  ┌──────────────────┐         │             ▲                 ││
│  │  ProjectManager  │         │ ┌───────────┴─────────────┐   ││
│  │  (Backend)       │         │ │   Business Logic       │   ││
│  │                  │         │ │ • renderer.js          │   ││
│  │ • CRUD ops       │         │ │ • mindmap-engine.js    │   ││
│  │ • Metadata sync  │         │ │ • project-manager.js   │   ││
│  │ • File mgmt      │         │ └─────────────┬──────────┘   ││
│  └──────────────────┘         │               │              ││
│           │                   │ ┌─────────────▼──────────┐   ││
│           │                   │ │   Rendering Engine     │   ││
│           │                   │ │ • Canvas connections   │   ││
│           │                   │ │ • Node positioning     │   ││
│           │                   │ │ • Animation loop       │   ││
│           │                   │ └────────────────────────┘   ││
│           │                   └───────────────────────────────┘│
│           ▼                                                    │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              File System (macOS)                         │ │
│  │                                                          │ │
│  │  ~/Documents/PWC Mindmaps/                              │ │
│  │  ├── .metadata.json          (Recent, favorites, etc.)  │ │
│  │  ├── Cloud Security.pmap     (Project 1)                │ │
│  │  ├── Data Privacy.pmap       (Project 2)                │ │
│  │  └── Risk Management.pmap    (Project 3)                │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
         ▲
         │ chokidar (File watcher)
         └─ Auto-reload on external .pmap changes
```

---

## Technology Stack

### Core Technologies

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Desktop Framework** | Electron | 28.1.0 | Cross-platform desktop app |
| **Runtime** | Node.js | 18+ | JavaScript runtime |
| **UI Rendering** | Chromium | 120+ | Web rendering engine |
| **Canvas Rendering** | HTML5 Canvas | - | Connection drawing |
| **MCP Protocol** | @modelcontextprotocol/sdk | 0.5.0 | AI integration |
| **File Watching** | chokidar | 3.5.3 | Real-time file monitoring |
| **HTTP Client** | axios | 1.6.2 | Unsplash API calls |
| **State Management** | Vanilla JS | - | No framework overhead |
| **Styling** | CSS3 | - | Custom animations |
| **Testing** | Jest | 29.7.0 | Unit testing |

### Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **Package Manager** | npm | 8+ | Dependency management |
| **Bundler** | Electron Packager | 17+ | App distribution |
| **Linter** | ESLint | 8+ | Code quality |
| **Formatter** | Prettier | 3+ | Code formatting |
| **Git** | 2.40+ | Version control |

### External APIs

| Service | Purpose | Required |
|---------|---------|----------|
| **Unsplash API** | Image search | Optional (MCP only) |

---

## Application Components

### 1. Main Process (`main.js`)

**Responsibilities**:
- Create and manage BrowserWindow
- Handle native macOS menu
- Register IPC handlers
- File system operations
- Project metadata management
- File watcher initialization

**Key Functions**:
```javascript
// Window creation
createWindow() → BrowserWindow

// Menu system
createMenu() → Menu

// File operations
openFile() → Promise<void>
saveFileAs() → Promise<void>

// Project management IPC handlers
ipcMain.handle('pm-create-project', ...)
ipcMain.handle('pm-load-project', ...)
ipcMain.handle('pm-save-project', ...)
```

### 2. Preload Script (`preload.js`)

**Purpose**: Secure IPC bridge using context isolation

**Exposed APIs**:
```javascript
window.electronAPI = {
  // File operations
  saveFile: (data) → Promise,
  getPlatform: () → Promise<string>,

  // Project manager
  projectManager: {
    createProject: (name, template) → Promise,
    loadProject: (path) → Promise,
    saveProject: (path, data) → Promise,
    listProjects: () → Promise,
    getRecentProjects: (limit) → Promise,
    deleteProject: (path, archive) → Promise,
    // ... more methods
  },

  // Event listeners
  onMenuAction: (callback) → void,
  onProjectsChanged: (callback) → void
}
```

### 3. Renderer Process (`renderer.js`)

**Responsibilities**:
- UI event handling
- Menu action handling
- Project panel updates
- Canvas animation loop
- Node interaction
- Modal management

**Key Classes/Objects**:
```javascript
// Global state
let currentProject = null;
let projects = [];
let autoSaveInterval = null;

// Key functions
async loadRecentProjects() → void
async handleProjectSelect(path) → void
startAutoSave() → void
handleMenuActions() → void
```

### 4. Mindmap Engine (`mindmap-engine.js`)

**Core Logic**:
- Node hierarchy management
- Tree structure building
- Node positioning algorithms
- Expand/collapse logic
- Search functionality

**Key Functions**:
```javascript
parseOutline(text) → MindmapData
buildTreeStructure(nodes) → TreeNode
calculateNodePositions(root) → void
expandNode(nodeId) → void
collapseNode(nodeId) → void
```

### 5. Project Manager Backend (`project-manager.js`)

**File Operations**:
- Create/read/update/delete projects
- Metadata synchronization
- Project import/export
- Recent files tracking

**Class Structure**:
```javascript
class ProjectManager {
  constructor()

  // CRUD operations
  createProject(name, template) → { path, projectData }
  loadProject(path) → ProjectData
  saveProject(path, data) → void
  deleteProject(path, moveToArchive) → void

  // Metadata
  updateRecentProjects(path) → void
  getRecentProjects(limit) → Project[]
  getLastOpenedProject() → string | null

  // Utilities
  getProjectsDirectory() → string
  exportProject(path, exportPath, format) → void
  importProject(sourcePath, name) → { path, projectData }
}
```

### 6. Canvas Renderer (in `renderer.js`)

**Rendering Pipeline**:
```javascript
// Animation loop
function drawConnections() {
  requestAnimationFrame(drawConnections);

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // For each connection
  connections.forEach(conn => {
    drawCurvedLine(
      conn.from.x, conn.from.y,
      conn.to.x, conn.to.y,
      conn.color
    );
  });
}

// Bezier curve drawing
function drawCurvedLine(x1, y1, x2, y2, color) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);

  // Control points for smooth curve
  const cpX = (x1 + x2) / 2;
  ctx.bezierCurveTo(cpX, y1, cpX, y2, x2, y2);

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}
```

---

## Data Flow

### 1. Project Loading Flow

```
User clicks project
       │
       ▼
renderer.js: handleProjectSelect()
       │
       ├─► electronAPI.projectManager.loadProject(path)
       │         │
       │         ▼
       │   preload.js: IPC invoke
       │         │
       │         ▼
       │   main.js: ipcMain handler
       │         │
       │         ▼
       │   project-manager.js: loadProject()
       │         │
       │         ├─► fs.readFileSync(path)
       │         ├─► JSON.parse(content)
       │         └─► updateRecentProjects()
       │                  │
       │                  ▼
       │            .metadata.json updated
       │
       ▼
renderer.js receives project data
       │
       ├─► mindmap-engine.js: parseOutline()
       ├─► buildTreeStructure()
       ├─► calculateNodePositions()
       └─► renderMindmap()
              │
              ▼
        Canvas draws connections
        DOM renders nodes
```

### 2. MCP Creation Flow

```
Claude Code: "Create mindmap about Cloud Security"
       │
       ▼
MCP Server receives request
       │
       ├─► create_mindmap_smart tool invoked
       │         │
       │         ├─► Parse natural language
       │         ├─► Build node structure
       │         └─► Generate .pmap JSON
       │
       ▼
fs.writeFileSync('Cloud Security.pmap', json)
       │
       ▼
chokidar detects new file
       │
       ▼
main.js: projectsWatcher fires 'add' event
       │
       ▼
mainWindow.webContents.send('projects-changed', { action: 'add' })
       │
       ▼
renderer.js: receives 'projects-changed' event
       │
       └─► Reloads project list
              │
              ▼
        New project appears in panel
```

### 3. Auto-Save Flow

```
User edits node
       │
       ▼
renderer.js: nodeData modified
       │
       ▼
Auto-save timer (5 seconds)
       │
       ▼
prepareMindmapData()
       │
       ├─► Collect all nodes
       ├─► Build JSON structure
       └─► Add metadata (modified timestamp)
              │
              ▼
electronAPI.projectManager.saveProject(path, data)
              │
              ▼
        main.js: IPC handler
              │
              ├─► project-manager.js: saveProject()
              │         │
              │         ├─► fs.writeFileSync()
              │         └─► Update .metadata.json
              │
              ▼
        Auto-save indicator shows "✓ Guardado"
```

---

## File System Architecture

### Directory Structure

```
~/Documents/PWC Mindmaps/              # Default projects directory
├── .metadata.json                     # Central metadata file
├── Cloud Security.pmap                # Project file 1
├── Data Privacy Framework.pmap        # Project file 2
├── Risk Management.pmap               # Project file 3
├── Cybersecurity Best Practices.pmap  # Project file 4
└── Archive/                           # Optional: Archived projects
    └── Old Project.pmap
```

### .pmap File Structure

```json
{
  "topic": "Cloud Security",
  "created": "2025-10-07T10:00:00.000Z",
  "modified": "2025-10-07T15:30:00.000Z",
  "version": "4.0.0",
  "nodes": [
    {
      "id": "node-0",
      "title": "Cloud Security",
      "level": 0,
      "parentId": null,
      "children": ["node-1", "node-2"],
      "position": { "x": 400, "y": 300 },
      "isFixed": false,
      "collapsed": false,
      "description": "...",
      "notes": "...",
      "image": "data:image/jpeg;base64,..."
    }
  ],
  "categories": [],
  "relationships": [],
  "connections": [],
  "customOrders": {},
  "nodePositions": {},
  "focusedNodeId": null
}
```

### .metadata.json Structure

```json
{
  "recentProjects": [
    "/Users/.../PWC Mindmaps/Cloud Security.pmap",
    "/Users/.../PWC Mindmaps/Data Privacy.pmap"
  ],
  "favorites": [
    "/Users/.../PWC Mindmaps/Cloud Security.pmap"
  ],
  "lastOpened": "/Users/.../PWC Mindmaps/Cloud Security.pmap"
}
```

### File Watcher (chokidar)

```javascript
const watcher = chokidar.watch('~/Documents/PWC Mindmaps/*.pmap', {
  ignored: /(^|[\/\\])\../, // Ignore dotfiles
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 500,  // Wait 500ms for file to stabilize
    pollInterval: 100
  }
});

watcher
  .on('add', path => {
    // New project created (e.g., via MCP)
    mainWindow.webContents.send('projects-changed', {
      action: 'add',
      path
    });
  })
  .on('change', path => {
    // Project modified externally
    mainWindow.webContents.send('projects-changed', {
      action: 'change',
      path
    });
  })
  .on('unlink', path => {
    // Project deleted
    mainWindow.webContents.send('projects-changed', {
      action: 'delete',
      path
    });
  });
```

---

## Rendering Pipeline

### Node Rendering

```
1. Parse .pmap file → MindmapData object
         │
         ▼
2. Build tree structure → TreeNode hierarchy
         │
         ▼
3. Calculate positions → Assign (x, y) coordinates
         │
         ├─► Root at center
         ├─► Level 1: Radial layout
         ├─► Level 2+: Hierarchical layout
         └─► Apply custom positions if defined
         │
         ▼
4. Create DOM elements → <div class="node">
         │
         ├─► Title
         ├─► Description
         ├─► Image thumbnail
         └─► Expand/collapse button
         │
         ▼
5. Attach event listeners → Click, drag, hover
         │
         ▼
6. Apply CSS transforms → translate3d(x, y, 0)
         │
         ▼
7. Render connections → Canvas bezier curves
         │
         ▼
8. Start animation loop → requestAnimationFrame
```

### Canvas Connection Rendering

**Performance Optimizations**:
- **Double buffering** - Draw to off-screen canvas first
- **Dirty regions** - Only redraw changed areas
- **Request animation frame** - Sync with display refresh
- **Hardware acceleration** - CSS `will-change` property

```javascript
// Optimized rendering loop
let lastTime = 0;
const targetFPS = 60;
const frameTime = 1000 / targetFPS;

function render(currentTime) {
  requestAnimationFrame(render);

  const deltaTime = currentTime - lastTime;

  // Throttle to target FPS
  if (deltaTime < frameTime) return;

  lastTime = currentTime - (deltaTime % frameTime);

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw all connections
  visibleConnections.forEach(conn => {
    drawConnection(conn);
  });
}

requestAnimationFrame(render);
```

### CSS Performance

```css
/* Hardware acceleration */
.node {
  will-change: transform, opacity;
  transform: translate3d(0, 0, 0);
}

/* Smooth transitions */
.node {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.2s ease-out;
}

/* GPU compositing */
.canvas-connections {
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

---

## IPC Communication

### Security Model

- **Context Isolation**: Enabled - Renderer can't access Node.js APIs
- **Node Integration**: Disabled - Must use preload bridge
- **Sandbox**: Enabled - Restricted process permissions

### IPC Message Flow

```javascript
// Renderer → Main
// renderer.js
const result = await window.electronAPI.projectManager.loadProject(path);

// preload.js (secure bridge)
contextBridge.exposeInMainWorld('electronAPI', {
  projectManager: {
    loadProject: (path) => ipcRenderer.invoke('pm-load-project', { path })
  }
});

// main.js (handler)
ipcMain.handle('pm-load-project', async (event, { projectPath }) => {
  try {
    const data = projectManager.loadProject(projectPath);
    return { success: true, projectData: data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
```

### Response Format (v4.0 Standard)

All IPC handlers return:

```javascript
{
  success: boolean,
  // On success:
  [dataKey]: any,        // e.g., "projects", "projectData"

  // On failure:
  error?: string         // Error message
}
```

**Example**:
```javascript
// Success
{ success: true, projects: [...] }

// Error
{ success: false, error: "File not found" }
```

---

## MCP Server Architecture

### Component Breakdown

```
mcp-server/
├── index.js                 # Main MCP server entry point
├── package.json             # v4.0.0 dependencies
├── MCP-COMPLETE-DOCUMENTATION.md
├── NATURAL-LANGUAGE-GUIDE.md
├── CHANGELOG.md
└── __tests__/              # Jest test suite
    └── index.test.js
```

### Tool Implementation

```javascript
// Tool definition
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'create_mindmap',
      description: 'Create a new mindmap project',
      inputSchema: {
        type: 'object',
        properties: {
          topic: { type: 'string', description: 'Main topic' },
          nodes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                level: { type: 'number' },
                description: { type: 'string' }
              }
            }
          }
        },
        required: ['topic']
      }
    },
    // ... 16 more tools
  ]
}));

// Tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'create_mindmap':
      return await handleCreateMindmap(args);
    case 'list_projects':
      return await handleListProjects(args);
    // ... more cases
  }
});
```

### MCP Communication Flow

```
Claude Code
    │
    │ (stdio)
    ▼
MCP SDK Server
    │
    ├─► Tool registration
    │     └─► 17 tools available
    │
    ├─► Request handling
    │     ├─► Parse natural language
    │     ├─► Validate parameters
    │     └─► Execute operation
    │
    ├─► File system access
    │     ├─► Read .pmap files
    │     ├─► Write .pmap files
    │     └─► Update .metadata.json
    │
    └─► Response formatting
          └─► Return structured data
```

### Unsplash Integration

```javascript
async function searchImages(query, count = 5) {
  const response = await axios.get(
    'https://api.unsplash.com/search/photos',
    {
      params: { query, per_page: count },
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
      }
    }
  );

  return response.data.results.map(photo => ({
    url: photo.urls.regular,
    thumb: photo.urls.thumb,
    photographer: photo.user.name,
    description: photo.alt_description
  }));
}
```

---

## Performance Optimizations

### 1. Canvas Rendering

- **60fps target** - Using `requestAnimationFrame`
- **Bezier curves** - Smooth connection lines
- **Dirty region tracking** - Only redraw changed areas
- **Off-screen rendering** - Pre-render static elements

### 2. DOM Manipulation

- **Document fragments** - Batch DOM updates
- **CSS transforms** - Hardware-accelerated positioning
- **Event delegation** - Single listener for multiple nodes
- **Virtual scrolling** - For large node lists

### 3. Memory Management

- **Lazy loading** - Images loaded on demand
- **Weak references** - Prevent memory leaks
- **Event cleanup** - Remove listeners on unmount
- **Debouncing** - Limit auto-save frequency

### 4. File I/O

- **Atomic writes** - Write to temp file, then rename
- **Debounced saves** - 5-second auto-save interval
- **Streaming** - For large file operations
- **Compression** - Future: gzip .pmap files

### Performance Benchmarks

| Metric | Target | Current | Notes |
|--------|--------|---------|-------|
| **App startup** | < 2s | 1.8s | Cold start |
| **Project load** | < 500ms | 350ms | 100 nodes |
| **Node render** | < 16ms | 12ms | 100+ nodes |
| **Canvas FPS** | 60 | 58-60 | During animations |
| **Memory usage** | < 200MB | 120MB | With 5 projects |
| **MCP response** | < 100ms | 85ms | Average |

---

## Security Model

### Electron Security

1. **Context Isolation** - Renderer isolated from Node.js
2. **Sandbox** - Restricted process permissions
3. **No Node Integration** - Disabled in renderer
4. **Content Security Policy** - Restrict resource loading
5. **Secure IPC** - All communication through preload bridge

### File System Security

```javascript
// Validate paths before operations
function isValidProjectPath(path) {
  const projectsDir = getProjectsDirectory();
  const resolvedPath = pathModule.resolve(path);

  // Must be within projects directory
  if (!resolvedPath.startsWith(projectsDir)) {
    throw new Error('Invalid project path');
  }

  // Must be .pmap file
  if (!resolvedPath.endsWith('.pmap')) {
    throw new Error('Invalid file extension');
  }

  return true;
}
```

### Data Sanitization

```javascript
// Sanitize user input
function sanitizeNodeTitle(title) {
  // Max length
  if (title.length > 200) {
    title = title.substring(0, 200);
  }

  // Remove dangerous characters
  title = title.replace(/[<>]/g, '');

  // Trim whitespace
  title = title.trim();

  return title;
}
```

### Image Security

- **Max file size**: 2MB per image
- **Format validation**: JPEG, PNG, WebP, GIF only
- **Base64 validation**: Verify data URI format
- **Dimension limits**: Max 1920x1080 pixels

---

## Testing Strategy

### Unit Tests

```javascript
// Example: project-manager.test.js
describe('ProjectManager', () => {
  let pm;

  beforeEach(() => {
    pm = new ProjectManager();
  });

  test('createProject creates valid .pmap file', () => {
    const result = pm.createProject('Test Project', {});

    expect(result.path).toMatch(/\.pmap$/);
    expect(result.projectData).toHaveProperty('topic');
    expect(result.projectData.version).toBe('4.0.0');
  });

  test('loadProject reads and parses .pmap file', () => {
    const path = createTestProject();
    const data = pm.loadProject(path);

    expect(data).toHaveProperty('nodes');
    expect(Array.isArray(data.nodes)).toBe(true);
  });
});
```

### Integration Tests

```javascript
// Example: mcp-server.test.js
describe('MCP Server Tools', () => {
  test('create_mindmap_smart creates valid project', async () => {
    const result = await callTool('create_mindmap_smart', {
      topic: 'Test Topic',
      nodeDescriptions: ['Item 1', 'Item 2']
    });

    expect(result.success).toBe(true);
    expect(result.projectPath).toBeDefined();

    // Verify file exists
    const exists = fs.existsSync(result.projectPath);
    expect(exists).toBe(true);
  });
});
```

### E2E Tests

```javascript
// Example: app.e2e.test.js (using Spectron)
describe('App Launch', () => {
  let app;

  beforeEach(async () => {
    app = await startApp();
  });

  afterEach(async () => {
    await app.stop();
  });

  test('window opens and displays projects', async () => {
    const window = app.browserWindow;

    expect(await window.isVisible()).toBe(true);
    expect(await window.getTitle()).toBe('PWC');

    // Check projects panel
    const projectsPanel = await app.client.$('.projects-panel');
    expect(await projectsPanel.isExisting()).toBe(true);
  });
});
```

### Test Coverage Goals

| Component | Target Coverage | Current |
|-----------|----------------|---------|
| **project-manager.js** | 90% | 85% |
| **mindmap-engine.js** | 85% | 78% |
| **MCP server** | 90% | 88% |
| **Overall** | 80% | 75% |

---

## Deployment Architecture

### Build Process

```bash
# Development
npm start                    # Electron app in dev mode
cd mcp-server && npm start   # MCP server standalone

# Testing
npm test                     # Run all tests
npm run test:coverage        # Generate coverage report

# Production build
npm run build                # Build app bundle
npm run dist                 # Create distributable
```

### Distribution Package

```
PWC Mindmap Pro.app/
├── Contents/
│   ├── MacOS/
│   │   └── PWC Mindmap Pro        # Executable
│   ├── Resources/
│   │   ├── app.asar               # Bundled application
│   │   ├── electron.icns          # App icon
│   │   └── mcp-server/            # MCP server (optional)
│   ├── Frameworks/                # Electron frameworks
│   ├── Info.plist                 # macOS metadata
│   └── PkgInfo
```

### System Requirements

- **macOS**: 11.0 (Big Sur) or later
- **RAM**: 4GB minimum, 8GB recommended
- **Disk**: 200MB for app + variable for projects
- **Display**: 1280x800 minimum resolution

---

## Future Architecture Considerations

### v5.0 Roadmap

1. **Multi-window support** - Open multiple projects simultaneously
2. **Real-time collaboration** - WebSocket-based sync
3. **Cloud storage** - Optional iCloud/Google Drive sync
4. **Plugin system** - Extend functionality with plugins
5. **Themes** - Customizable color schemes
6. **Export formats** - PDF, SVG, PNG, Markdown

### Scalability Improvements

- **Virtualized rendering** - Handle 10,000+ nodes
- **Database option** - SQLite for large projects
- **Lazy loading** - Load nodes on-demand
- **Worker threads** - Offload heavy processing

---

## References

- **[README.md](README.md)** - Project overview
- **[SCHEMA.md](SCHEMA.md)** - File format specification
- **[MCP-COMPLETE-DOCUMENTATION.md](mcp-server/MCP-COMPLETE-DOCUMENTATION.md)** - MCP API reference
- **[Electron Documentation](https://www.electronjs.org/docs)** - Official Electron docs
- **[MCP Specification](https://spec.modelcontextprotocol.io/)** - MCP protocol spec

---

## Contributing

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for development guidelines, code style, and contribution workflow.

---

**Questions?** Open an issue: https://github.com/griederer/mindmap-macos-app/issues
