# PWC Mindmap MCP Server - Complete Documentation

**Version**: 4.0.0
**Last Updated**: October 7, 2025

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Architecture](#architecture)
4. [API Reference](#api-reference)
5. [Natural Language Interface](#natural-language-interface)
6. [Data Structures](#data-structures)
7. [Usage Examples](#usage-examples)
8. [Integration Guide](#integration-guide)
9. [Troubleshooting](#troubleshooting)
10. [Changelog](#changelog)

---

## Overview

The **PWC Mindmap MCP Server** is a Model Context Protocol (MCP) server that provides complete programmatic control over mindmap creation, manipulation, and management. It's designed to work seamlessly with Claude Code and other MCP-compatible AI assistants.

### Key Features

- ✅ **Natural Language Mindmap Creation** - Create complex mindmaps from simple text descriptions
- ✅ **Complete CRUD Operations** - Create, read, update, delete projects and nodes
- ✅ **Image Integration** - Unsplash API integration for node images
- ✅ **Advanced Organization** - Categories, relationships, and custom ordering
- ✅ **Focus Mode** - Filter mindmap views to specific branches
- ✅ **File-based Storage** - All data stored in `.pmap` JSON files
- ✅ **Metadata Management** - Recent projects, favorites, last opened tracking

### What's New in v4.0.0

- 🎯 **Fixed Project Selector** - Dynamic loading of all projects from `.metadata.json`
- 🎨 **Enhanced UI** - Projects panel now displays all recent projects correctly
- 🔄 **Better IPC Handling** - Improved response format handling between main and renderer
- 📊 **Complete Metadata Sync** - All .pmap files properly tracked and displayed
- 🐛 **Bug Fixes** - Resolved hardcoded project list issue

---

## Installation

### Prerequisites

- **Node.js** v16+
- **Claude Code** or any MCP-compatible AI assistant
- **macOS** (for the Electron app)

### Method 1: NPM Global Installation

```bash
npm install -g pwc-mindmap-mcp
```

### Method 2: Local Installation

```bash
cd /path/to/mindmap-macos-app/mcp-server
npm install
```

### Method 3: Claude Code Integration

Add to your Claude Code MCP configuration (`~/.claude-code/mcp-config.json`):

```json
{
  "mcpServers": {
    "pwc-mindmap": {
      "command": "node",
      "args": ["/path/to/mindmap-macos-app/mcp-server/index.js"],
      "env": {}
    }
  }
}
```

Then restart Claude Code.

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                   PWC Mindmap Pro (v4.0)                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Electron   │  │   Renderer   │  │     Main     │ │
│  │     App      │◄─┤   Process    │◄─┤   Process    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         ▲                                       ▲       │
│         │                                       │       │
│         ▼                                       ▼       │
│  ┌──────────────────────────────────────────────────┐  │
│  │           ProjectManager (Backend)               │  │
│  │  - File I/O                                      │  │
│  │  - Metadata Management                           │  │
│  │  - .pmap File Operations                         │  │
│  └──────────────────────────────────────────────────┘  │
│                          ▲                             │
└──────────────────────────┼─────────────────────────────┘
                           │
                           │ IPC / File Access
                           │
                           ▼
         ┌─────────────────────────────────────┐
         │     MCP Server (v4.0.0)             │
         ├─────────────────────────────────────┤
         │  Tools:                             │
         │  - create_mindmap                   │
         │  - create_mindmap_smart ⭐          │
         │  - list_projects                    │
         │  - get_project_data                 │
         │  - delete_project                   │
         │  - add_node                         │
         │  - update_node                      │
         │  - delete_node                      │
         │  - get_node_children                │
         │  - reorder_nodes                    │
         │  - search_images (Unsplash)         │
         │  - add_image_to_node                │
         │  - update_node_notes                │
         │  - create_category                  │
         │  - assign_category                  │
         │  - create_relationship              │
         │  - connect_nodes                    │
         │  - set_focus_mode                   │
         │  - set_node_position                │
         └─────────────────────────────────────┘
                           │
                           ▼
         ┌─────────────────────────────────────┐
         │    File System Storage              │
         │  ~/Documents/PWC Mindmaps/          │
         │  - *.pmap (Project files)           │
         │  - .metadata.json                   │
         └─────────────────────────────────────┘
```

### Data Flow

1. **User Request** → Claude Code / AI Assistant
2. **MCP Tool Call** → MCP Server
3. **File Operation** → ProjectManager
4. **Data Persistence** → `.pmap` files + `.metadata.json`
5. **UI Update** → Electron App (if running)
6. **Response** → AI Assistant → User

---

## API Reference

### Core Tools

#### `create_mindmap`
Create a new mindmap project with structured nodes.

**Parameters**:
```json
{
  "topic": "string (required)",
  "nodes": [
    {
      "title": "string (required)",
      "level": "number (required, 0-based)",
      "description": "string (optional)"
    }
  ]
}
```

**Example**:
```javascript
await mcp.create_mindmap({
  topic: "Cloud Security",
  nodes: [
    { title: "Cloud Security", level: 0 },
    { title: "Identity Management", level: 1, description: "User auth and access" },
    { title: "Data Encryption", level: 1 }
  ]
});
```

**Response**:
```json
{
  "success": true,
  "projectName": "Cloud Security",
  "path": "/Users/.../PWC Mindmaps/Cloud Security.pmap",
  "nodesCreated": 3
}
```

---

#### `create_mindmap_smart` ⭐ **NEW**
Create mindmaps using natural language descriptions. The server automatically determines node structure and hierarchy.

**Parameters**:
```json
{
  "topic": "string (required)",
  "nodeDescriptions": ["string", "string", ...] (optional)
}
```

**Example**:
```javascript
await mcp.create_mindmap_smart({
  topic: "Data Privacy Framework",
  nodeDescriptions: [
    "GDPR Compliance",
    "Data Classification",
    "Privacy by Design",
    "Incident Response"
  ]
});
```

**Auto-Structure Detection**:
- Single-word nodes → Level 1 (subtopics)
- Multi-word descriptive nodes → Level 1 with descriptions
- Empty array → Creates topic only
- The server intelligently assigns hierarchy

**Response**:
```json
{
  "success": true,
  "projectName": "Data Privacy Framework",
  "path": "/Users/.../PWC Mindmaps/Data Privacy Framework.pmap",
  "nodesCreated": 4,
  "structure": "auto-detected"
}
```

---

#### `list_projects`
Get all mindmap projects with metadata.

**Parameters**: None

**Response**:
```json
{
  "projects": [
    {
      "name": "Cloud Security",
      "path": "/Users/.../Cloud Security.pmap",
      "created": "2025-10-07T10:30:00.000Z",
      "modified": "2025-10-07T14:30:00.000Z",
      "nodeCount": 5
    }
  ]
}
```

---

#### `get_project_data`
Get complete project data including all nodes, relationships, and metadata.

**Parameters**:
```json
{
  "projectName": "string (required)"
}
```

**Response**:
```json
{
  "name": "Cloud Security",
  "content": "Cloud Security\n1. Identity Management\n...",
  "nodes": {
    "Cloud Security": {
      "description": "",
      "notes": "",
      "images": [],
      "showInfo": false
    }
  },
  "categories": [],
  "relationships": [],
  "customOrders": {},
  "focusedNode": null
}
```

---

#### `delete_project`
Delete or archive a project.

**Parameters**:
```json
{
  "projectName": "string (required)",
  "moveToArchive": "boolean (optional, default: true)"
}
```

**Response**:
```json
{
  "success": true,
  "archived": true,
  "archivePath": "/Users/.../PWC Mindmaps/Archives/Cloud Security.pmap"
}
```

---

### Node Operations

#### `add_node`
Add a new node to the mindmap.

**Parameters**:
```json
{
  "projectName": "string (required)",
  "title": "string (required)",
  "level": "number (required)",
  "parentTitle": "string (optional)",
  "description": "string (optional)"
}
```

**Example**:
```javascript
await mcp.add_node({
  projectName: "Cloud Security",
  title: "Multi-Factor Authentication",
  level: 2,
  parentTitle: "Identity Management",
  description: "MFA using TOTP/SMS"
});
```

---

#### `update_node`
Update node title and/or description.

**Parameters**:
```json
{
  "projectName": "string (required)",
  "currentTitle": "string (required)",
  "newTitle": "string (optional)",
  "newDescription": "string (optional)"
}
```

---

#### `delete_node`
Delete a node and all its children.

**Parameters**:
```json
{
  "projectName": "string (required)",
  "nodeTitle": "string (required)"
}
```

---

#### `get_node_children`
Get all direct children of a node.

**Parameters**:
```json
{
  "projectName": "string (required)",
  "nodeTitle": "string (required)"
}
```

**Response**:
```json
{
  "children": [
    {
      "title": "Multi-Factor Authentication",
      "level": 2,
      "description": "MFA using TOTP/SMS"
    }
  ]
}
```

---

#### `reorder_nodes`
Change the order of child nodes under a parent.

**Parameters**:
```json
{
  "projectName": "string (required)",
  "parentTitle": "string (optional, null for root)",
  "newOrder": ["node1", "node2", "node3"]
}
```

---

### Image Management

#### `search_images`
Search Unsplash for images.

**Parameters**:
```json
{
  "query": "string (required)",
  "count": "number (optional, default: 5)"
}
```

**Response**:
```json
{
  "images": [
    {
      "id": "abc123",
      "url": "https://images.unsplash.com/...",
      "thumb": "https://images.unsplash.com/.../thumb",
      "photographer": "John Doe",
      "description": "Cloud infrastructure"
    }
  ]
}
```

---

#### `add_image_to_node`
Add an image to a node from URL or base64.

**Parameters**:
```json
{
  "projectName": "string (required)",
  "nodeTitle": "string (required)",
  "imageUrl": "string (optional)",
  "imageBase64": "string (optional)"
}
```

---

#### `update_node_notes`
Add or update additional notes for a node.

**Parameters**:
```json
{
  "projectName": "string (required)",
  "nodeTitle": "string (required)",
  "notes": "string (required)"
}
```

---

### Organization Tools

#### `create_category`
Create a color-coded category for node organization.

**Parameters**:
```json
{
  "projectName": "string (required)",
  "name": "string (required)",
  "color": "string (required, hex color)"
}
```

**Example**:
```javascript
await mcp.create_category({
  projectName: "Cloud Security",
  name: "High Priority",
  color: "#ff6b6b"
});
```

---

#### `assign_category`
Assign a category to a node.

**Parameters**:
```json
{
  "projectName": "string (required)",
  "nodeTitle": "string (required)",
  "categoryName": "string (required)"
}
```

---

#### `create_relationship`
Define a relationship type for connecting nodes.

**Parameters**:
```json
{
  "projectName": "string (required)",
  "name": "string (required)",
  "color": "string (required, hex color)",
  "dashPattern": "string (optional, SVG dash pattern)"
}
```

**Example**:
```javascript
await mcp.create_relationship({
  projectName: "Cloud Security",
  name: "depends on",
  color: "#3b82f6",
  dashPattern: "5,5"
});
```

---

#### `connect_nodes`
Create a connection between two nodes using a relationship.

**Parameters**:
```json
{
  "projectName": "string (required)",
  "fromNodeTitle": "string (required)",
  "toNodeTitle": "string (required)",
  "relationshipName": "string (required)"
}
```

---

#### `set_focus_mode`
Filter mindmap view to show only a specific node and its children.

**Parameters**:
```json
{
  "projectName": "string (required)",
  "nodeTitle": "string (optional, null to unfocus)"
}
```

---

#### `set_node_position`
Set custom position for a node in the visualization.

**Parameters**:
```json
{
  "projectName": "string (required)",
  "nodeTitle": "string (required)",
  "x": "number (required)",
  "y": "number (required)"
}
```

---

## Natural Language Interface

### Using `create_mindmap_smart`

The `create_mindmap_smart` tool is designed for conversational mindmap creation. Here's how Claude Code uses it:

#### Example 1: Simple Topic
**User**: "Create a mindmap about Cloud Security"

**Claude Code**:
```javascript
await mcp.create_mindmap_smart({
  topic: "Cloud Security"
});
```

**Result**: Creates a mindmap with just the root node "Cloud Security"

---

#### Example 2: With Subtopics
**User**: "Create a mindmap for Data Privacy with GDPR, Encryption, and Access Control"

**Claude Code**:
```javascript
await mcp.create_mindmap_smart({
  topic: "Data Privacy Framework",
  nodeDescriptions: [
    "GDPR Compliance",
    "Data Classification",
    "Privacy by Design",
    "Incident Response"
  ]
});
```

**Result**: Creates a mindmap with 1 root + 4 level-1 nodes

---

#### Example 3: Complex Structure
**User**: "Create a cybersecurity mindmap with network security, application security, and data protection as main categories"

**Claude Code**:
```javascript
await mcp.create_mindmap_smart({
  topic: "Cybersecurity Best Practices",
  nodeDescriptions: [
    "Network Security",
    "Firewalls and IDS",
    "VPN Configuration",
    "Application Security",
    "Input Validation",
    "SQL Injection Prevention",
    "Data Protection",
    "Encryption at Rest",
    "Encryption in Transit"
  ]
});
```

**Result**: Server auto-detects hierarchy based on context

---

## Data Structures

### .pmap File Format

```json
{
  "name": "Cloud Security",
  "content": "Cloud Security\n1. Identity Management\n* Multi-Factor Auth\n2. Data Encryption",
  "nodes": {
    "Cloud Security": {
      "description": "Comprehensive security framework",
      "notes": "Last updated: Oct 2025",
      "images": [
        {
          "url": "https://...",
          "thumb": "https://...",
          "photographer": "John Doe"
        }
      ],
      "showInfo": false
    }
  },
  "categories": [
    {
      "name": "High Priority",
      "color": "#ff6b6b"
    }
  ],
  "relationships": [
    {
      "name": "depends on",
      "color": "#3b82f6",
      "dashPattern": "5,5"
    }
  ],
  "connections": [
    {
      "from": "Multi-Factor Auth",
      "to": "Identity Management",
      "relationship": "depends on"
    }
  ],
  "customOrders": {
    "Cloud Security": ["Identity Management", "Data Encryption"]
  },
  "nodePositions": {
    "Cloud Security": { "x": 400, "y": 300 }
  },
  "focusedNode": null
}
```

### .metadata.json Format

```json
{
  "recentProjects": [
    "/Users/.../PWC Mindmaps/Cloud Security.pmap",
    "/Users/.../PWC Mindmaps/Data Privacy Framework.pmap"
  ],
  "favorites": [
    "/Users/.../PWC Mindmaps/Cloud Security.pmap"
  ],
  "lastOpened": "/Users/.../PWC Mindmaps/Cloud Security.pmap"
}
```

---

## Usage Examples

### Example 1: Complete Risk Management Mindmap

```javascript
// Step 1: Create project
await mcp.create_mindmap_smart({
  topic: "Risk Management",
  nodeDescriptions: [
    "Risk Identification",
    "Risk Assessment",
    "Risk Mitigation",
    "Risk Monitoring"
  ]
});

// Step 2: Add detailed nodes
await mcp.add_node({
  projectName: "Risk Management",
  title: "Quantitative Analysis",
  level: 2,
  parentTitle: "Risk Assessment",
  description: "Statistical modeling and Monte Carlo simulations"
});

// Step 3: Add notes
await mcp.update_node_notes({
  projectName: "Risk Management",
  nodeTitle: "Risk Assessment",
  notes: "Use ISO 31000 framework for assessment methodology"
});

// Step 4: Add images
const images = await mcp.search_images({
  query: "risk management",
  count: 3
});

await mcp.add_image_to_node({
  projectName: "Risk Management",
  nodeTitle: "Risk Assessment",
  imageUrl: images.images[0].url
});

// Step 5: Create categories
await mcp.create_category({
  projectName: "Risk Management",
  name: "Critical",
  color: "#dc2626"
});

await mcp.assign_category({
  projectName: "Risk Management",
  nodeTitle: "Risk Identification",
  categoryName: "Critical"
});

// Step 6: Create relationships
await mcp.create_relationship({
  projectName: "Risk Management",
  name: "feeds into",
  color: "#10b981",
  dashPattern: "0"
});

await mcp.connect_nodes({
  projectName: "Risk Management",
  fromNodeTitle: "Risk Identification",
  toNodeTitle: "Risk Assessment",
  relationshipName: "feeds into"
});
```

---

### Example 2: Quick Project Setup

```javascript
// Create multiple projects quickly
const topics = [
  "Cloud Security",
  "Data Privacy",
  "Incident Response",
  "Compliance Framework"
];

for (const topic of topics) {
  await mcp.create_mindmap_smart({ topic });
}

// List all projects
const projects = await mcp.list_projects();
console.log(`Created ${projects.projects.length} projects`);
```

---

### Example 3: Bulk Node Operations

```javascript
// Add multiple related nodes
const securityNodes = [
  { title: "Authentication", level: 1 },
  { title: "Authorization", level: 1 },
  { title: "Encryption", level: 1 },
  { title: "Auditing", level: 1 }
];

for (const node of securityNodes) {
  await mcp.add_node({
    projectName: "Cloud Security",
    ...node
  });
}

// Reorder them alphabetically
await mcp.reorder_nodes({
  projectName: "Cloud Security",
  parentTitle: "Cloud Security",
  newOrder: ["Auditing", "Authentication", "Authorization", "Encryption"]
});
```

---

## Integration Guide

### Integrating with Claude Code

1. **Configure MCP Server** in `~/.claude-code/mcp-config.json`:
```json
{
  "mcpServers": {
    "pwc-mindmap": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/index.js"]
    }
  }
}
```

2. **Restart Claude Code**

3. **Verify Connection**:
```
User: "List all my mindmap projects"
Claude: *Uses list_projects tool*
```

### Integrating with Electron App

The MCP server reads/writes `.pmap` files that the Electron app automatically detects via file watching:

1. **File Watcher** (`main.js`):
```javascript
const watcher = chokidar.watch(projectsDir, {
  ignored: /(^|[\/\\])\../,
  persistent: true
});

watcher.on('change', path => {
  mainWindow.webContents.send('projects-changed', { path });
});
```

2. **Auto-Reload** (`renderer.js`):
```javascript
window.electronAPI.onProjectsChanged(async (event, data) => {
  await window.mindmapRenderer.loadProjects();
});
```

### Custom Integration

```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'node',
  args: ['/path/to/mcp-server/index.js']
});

const client = new Client({
  name: 'my-app',
  version: '1.0.0'
}, {
  capabilities: {}
});

await client.connect(transport);

// Call tools
const result = await client.callTool('create_mindmap_smart', {
  topic: 'My Project',
  nodeDescriptions: ['Node 1', 'Node 2']
});
```

---

## Troubleshooting

### Common Issues

#### 1. "Projects directory not found"

**Cause**: MCP server can't find the PWC Mindmaps directory

**Solution**:
```bash
mkdir -p ~/Documents/"PWC Mindmaps"
```

Or set custom path in environment:
```bash
export PWC_MINDMAPS_DIR="/custom/path"
```

---

#### 2. "Project not found"

**Cause**: Project name doesn't match exactly

**Solution**: Use `list_projects` to get exact names:
```javascript
const projects = await mcp.list_projects();
console.log(projects.projects.map(p => p.name));
```

---

#### 3. "Unsplash API not working"

**Cause**: No API key or rate limit exceeded

**Solution**: Check API key in `mcp-server/index.js`:
```javascript
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || 'YOUR_KEY';
```

Set environment variable:
```bash
export UNSPLASH_ACCESS_KEY="your_key_here"
```

---

#### 4. "Projects not showing in app"

**Cause**: v4.0.0 fixed this! Make sure you're running the latest version.

**Solution**:
```bash
cd /path/to/mindmap-macos-app
git pull origin main
npm install
npm start
```

---

#### 5. "Permission denied writing files"

**Cause**: Incorrect file permissions

**Solution**:
```bash
chmod 755 ~/Documents/"PWC Mindmaps"
```

---

### Debug Mode

Enable detailed logging:

```bash
DEBUG=pwc-mindmap:* node mcp-server/index.js
```

Check logs:
```bash
tail -f ~/Documents/"PWC Mindmaps"/.mcp-server.log
```

---

## Changelog

### v4.0.0 (October 7, 2025)

#### 🎯 Major Fixes
- **Fixed Project Selector** - Projects panel now dynamically loads all projects from `.metadata.json`
- **IPC Response Handling** - Proper handling of `{ success: true, projects: [...] }` format
- **UI Synchronization** - Real-time project list updates when files change

#### ✨ Enhancements
- **Better Logging** - Added debug logs for API responses and project loading
- **Metadata Tracking** - All .pmap files properly tracked in `.metadata.json`
- **Error Handling** - Improved error messages and fallback behavior

#### 🐛 Bug Fixes
- Resolved hardcoded "ENTRADA DE ESQUEMA" project list issue
- Fixed race condition between ProjectManager initialization and project loading
- Corrected response format expectations in renderer.js

#### 📚 Documentation
- Complete MCP API documentation
- Natural language usage examples
- Integration guides for Claude Code and custom apps
- Troubleshooting section with common issues

---

### v2.1.0 (Previous Release)

- Added `create_mindmap_smart` for natural language creation
- Improved node metadata structure
- Fixed node data initialization bugs
- Enhanced test coverage

---

### v2.0.0

- Complete MCP protocol implementation
- All 17 tools functional
- Unsplash integration
- Categories and relationships support

---

### v1.0.0

- Initial MCP server release
- Basic CRUD operations
- File-based storage

---

## License

MIT License - See LICENSE file for details

---

## Support

**Issues**: https://github.com/griederer/mindmap-macos-app/issues
**Documentation**: https://github.com/griederer/mindmap-macos-app/blob/main/mcp-server/
**Author**: Gonzalo Riederer
**Email**: gonzaloriederer@gmail.com

---

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

---

**Built with ❤️ for PWC and the MCP community**
