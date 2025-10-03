# PWC Mindmap MCP Server v2.0 - Complete Edition

Full-featured MCP server that provides complete control over PWC Mindmap Pro through Claude Code.

## ✅ All 12 Available Tools

### 📁 PROJECT MANAGEMENT (4 tools)

#### 1. **list_projects**
List all mindmap projects with metadata.

```
Show me all my mindmap projects
```

**Returns**: Project names, modification dates, node counts

---

#### 2. **create_mindmap**
Create a new mindmap project.

**Parameters**:
- `topic` (required): Main title
- `nodes` (optional): Array of initial nodes

```
Create a mindmap about "Solar System" with nodes for Planets and Moons
```

---

#### 3. **get_project_data**
Get complete project data including content, nodes, images, categories.

**Parameters**:
- `projectName` (required): Project name

```
Show me the complete data for project "Solar System"
```

---

#### 4. **delete_project**
Delete or archive a project.

**Parameters**:
- `projectName` (required)
- `moveToArchive` (optional, default: true): Archive instead of delete

```
Delete the project "Old Project" permanently
Move "Test Project" to archive
```

---

### 🔷 NODE OPERATIONS (5 tools)

#### 5. **add_node**
Add a new node to existing mindmap.

**Parameters**:
- `projectName` (required)
- `title` (required)
- `description` (optional)
- `level` (required): 1=numbered, 2+=bullets
- `parentTitle` (optional): Parent node to add under

```
Add node "Earth" under "Planets" with description "Third planet from Sun"
```

---

#### 6. **update_node**
Update existing node title/description.

**Parameters**:
- `projectName` (required)
- `currentTitle` (required): Node to find
- `newTitle` (optional): New title
- `newDescription` (optional): New description

```
Update node "Earth" in "Solar System" with new description "..."
Change node title from "Planets" to "Major Planets"
```

---

#### 7. **delete_node**
Delete a node and all its children.

**Parameters**:
- `projectName` (required)
- `nodeTitle` (required)

```
Delete node "Old Section" from project "My Project"
```

---

#### 8. **get_node_children**
Get all direct children of a specific node.

**Parameters**:
- `projectName` (required)
- `nodeTitle` (required)

```
Show me all children of "Planets" in "Solar System"
```

---

#### 9. **reorder_nodes**
Reorder children nodes under a parent.

**Parameters**:
- `projectName` (required)
- `parentTitle` (optional): Parent node (null for root)
- `newOrder` (required): Array of node titles in desired order

```
Reorder nodes under "Planets": ["Jupiter", "Mars", "Earth", "Venus"]
Move "Important Topic" to be first in the list
```

---

### 🖼️ IMAGE OPERATIONS (2 tools)

#### 10. **search_images**
Search for images on Unsplash.

**Parameters**:
- `query` (required): Search term
- `count` (optional, default: 5): Number of results

```
Search for 10 images of "planets"
Find images for "solar system"
```

**Returns**: Image URLs, descriptions, photographers

---

#### 11. **add_image_to_node**
Add image to a node from URL or base64.

**Parameters**:
- `projectName` (required)
- `nodeTitle` (required)
- `imageUrl` (optional): URL to download
- `imageBase64` (optional): Base64 encoded image

```
Add image from URL "https://..." to node "Earth"
```

**Auto-downloads** and converts images to base64 for storage.

---

### 📝 ADVANCED OPERATIONS (1 tool)

#### 12. **update_node_notes**
Update additional notes for a node.

**Parameters**:
- `projectName` (required)
- `nodeTitle` (required)
- `notes` (required): Notes text

```
Add notes to "Earth": "Contains 71% water surface..."
```

---

## 🎯 Complete Workflow Example

```
1. list_projects
   → See all projects

2. create_mindmap
   topic: "Space Exploration"
   nodes: [
     { title: "Planets", level: 1 },
     { title: "Moons", level: 1 },
     { title: "Asteroids", level: 1 }
   ]
   → Creates project with 3 main sections

3. add_node
   project: "Space Exploration"
   title: "Earth"
   description: "Third planet from the Sun"
   level: 2
   parentTitle: "Planets"
   → Adds Earth under Planets

4. search_images
   query: "planet earth space"
   count: 5
   → Finds 5 Earth images

5. add_image_to_node
   project: "Space Exploration"
   nodeTitle: "Earth"
   imageUrl: "https://images.unsplash.com/..."
   → Adds image to Earth node

6. get_node_children
   project: "Space Exploration"
   nodeTitle: "Planets"
   → Shows: Earth, Mars, Venus, etc.

7. reorder_nodes
   project: "Space Exploration"
   parentTitle: "Planets"
   newOrder: ["Mercury", "Venus", "Earth", "Mars"]
   → Reorders by distance from Sun

8. update_node
   project: "Space Exploration"
   currentTitle: "Earth"
   newDescription: "Third planet, only one with known life"
   → Updates description

9. update_node_notes
   project: "Space Exploration"
   nodeTitle: "Earth"
   notes: "Diameter: 12,742 km\nMoons: 1\nAtmosphere: Nitrogen, Oxygen"
   → Adds detailed notes

10. delete_node
    project: "Space Exploration"
    nodeTitle: "Asteroids"
    → Removes Asteroids section

11. get_project_data
    project: "Space Exploration"
    → Full JSON export

12. delete_project
    project: "Space Exploration"
    moveToArchive: true
    → Archives project
```

---

## 🚀 Installation

```bash
cd ~/Documents/GitHub/mindmap-macos-app/mcp-server
npm install
```

### Add to Claude Code

```bash
claude mcp add pwc-mindmap node ~/Documents/GitHub/mindmap-macos-app/mcp-server/index.js
```

Or manually in `~/.claude.json`:
```json
{
  "mcpServers": {
    "pwc-mindmap": {
      "command": "node",
      "args": ["/Users/[YOUR_USER]/Documents/GitHub/mindmap-macos-app/mcp-server/index.js"]
    }
  }
}
```

---

## 📊 Data Format

### Project File Structure (.pmap)
```json
{
  "name": "Project Name",
  "content": "Title\n1. Topic\n* Subtopic",
  "nodes": {
    "node-0": {
      "description": "Description text",
      "notes": "Additional notes",
      "images": ["data:image/jpeg;base64,..."],
      "showInfo": false
    }
  },
  "categories": [],
  "relationships": [],
  "customOrders": {},
  "metadata": {
    "created": "2025-01-03T...",
    "modified": "2025-01-03T...",
    "version": "2.0"
  }
}
```

### Text Format Rules
- **Root**: First line
- **Level 1**: `1. Title | Description`
- **Level 2**: `* Title | Description`
- **Level 3+**: `   * Title` (3 spaces per level)

---

## 🔑 Unsplash API

**Default**: Demo key (limited to ~50 requests/hour)

**For production**, replace in `index.js`:
```javascript
const UNSPLASH_ACCESS_KEY = 'YOUR_KEY_HERE';
```

Get free API key: https://unsplash.com/developers

---

## 🎨 What You Can Do

### ✅ Full Control

- **Create** projects with any structure
- **List** all projects
- **Read** complete project data
- **Delete** or archive projects
- **Add** nodes anywhere
- **Update** node titles/descriptions
- **Delete** nodes with children
- **Reorder** nodes (drag-drop via commands)
- **Search** images on Unsplash
- **Add** images to nodes (auto-download)
- **Update** node notes (additional details)
- **Get** node children (hierarchical queries)

### ⚡ Use Cases

1. **Build complete mindmaps** from natural language
2. **Populate with images** automatically
3. **Reorganize structure** dynamically
4. **Batch operations** (create 10 nodes at once)
5. **Export/import** via JSON
6. **Archive old projects**
7. **Query project structure** programmatically

---

## 🔧 Technical Details

- **Version**: 2.0.0
- **Protocol**: MCP over stdio
- **Dependencies**: @modelcontextprotocol/sdk, axios
- **Storage**: ~/Documents/PWC Mindmaps/
- **Image handling**: Auto-conversion to base64
- **Node matching**: Case-insensitive title search

---

## 📈 Version History

### v2.0.0 - Complete Edition
- ✅ All 12 tools implemented
- ✅ Full project lifecycle management
- ✅ Complete node CRUD operations
- ✅ Image search and integration
- ✅ Node reordering
- ✅ Children queries
- ✅ Notes management

### v1.0.0 - MVP
- Basic: create_mindmap, add_node, get_project_data

---

## 🎯 Next Steps

Try it out:
```
Create a mindmap about "Risk Management" with sections for
Identification, Assessment, Mitigation, and Monitoring
```

The MCP server will handle everything!
