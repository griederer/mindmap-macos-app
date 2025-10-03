# PWC Mindmap MCP Server

MCP server that enables Claude Code to create and manipulate PWC Mindmap Pro projects through natural language commands.

## Features

### Phase 1 (MVP) - Available Now
- ✅ **create_mindmap** - Create new mindmap projects with custom topics and nodes
- ✅ **add_node** - Add nodes to existing mindmaps with descriptions
- ✅ **get_project_data** - Retrieve complete project data

### Coming Soon (Phase 2-5)
- 🔜 Image search and integration
- 🔜 Node reordering
- 🔜 Categories and relationships
- 🔜 Advanced node operations (update, delete)
- 🔜 Project management (list, export)

## Installation

The server is installed at: `~/.claude-mcp-servers/pwc-mindmap-mcp/`

### Configure Claude Code

Add to your Claude Code configuration (`~/.claude-code/config.json`):

```json
{
  "mcpServers": {
    "pwc-mindmap": {
      "command": "node",
      "args": ["/Users/gonzaloriederer/.claude-mcp-servers/pwc-mindmap-mcp/index.js"]
    }
  }
}
```

Or use the Claude CLI:

```bash
claude mcp add pwc-mindmap node ~/.claude-mcp-servers/pwc-mindmap-mcp/index.js
```

## Usage Examples

### Create a mindmap about space

```
Create a mindmap about "Solar System" with nodes for planets and moons
```

Claude will use:
```javascript
create_mindmap({
  topic: "Solar System",
  nodes: [
    { title: "Planets", description: "Bodies orbiting the Sun", level: 1 },
    { title: "Moons", description: "Natural satellites of planets", level: 1 }
  ]
})
```

### Add nodes with definitions

```
Add a node "Earth" with description "Third planet from the Sun" under "Planets" in the Solar System project
```

Claude will use:
```javascript
add_node({
  projectName: "Solar System",
  title: "Earth",
  description: "Third planet from the Sun",
  level: 2,
  parentTitle: "Planets"
})
```

### Get project data

```
Show me the current structure of the Solar System mindmap
```

Claude will use:
```javascript
get_project_data({
  projectName: "Solar System"
})
```

## Data Format

### Project File Structure (.pmap)
```json
{
  "name": "Project Name",
  "content": "Project Title\\n1. Main Topic\\n* Subtopic",
  "nodes": {},
  "categories": [],
  "relationships": [],
  "customOrders": {},
  "metadata": {
    "created": "2025-01-03T...",
    "modified": "2025-01-03T...",
    "version": "1.0"
  }
}
```

### Text Format Rules
- **Root**: First line is the mindmap title
- **Level 1**: `1. Node Title | Description`
- **Level 2**: `* Node Title | Description`
- **Level 3+**: `   * Node Title` (3 spaces per level)
- **Descriptions**: Optional, separated by ` | `

## Projects Directory

All mindmaps are stored in: `~/Documents/PWC Mindmaps/`

## Development

### Testing

Test the MCP server directly:
```bash
cd ~/.claude-mcp-servers/pwc-mindmap-mcp
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node index.js
```

### Structure
- `index.js` - Main MCP server implementation
- `package.json` - Dependencies and metadata
- `README.md` - This file

## Architecture

```
Claude Code
    ↓
MCP Protocol
    ↓
PWC Mindmap MCP Server (this)
    ↓
File System (.pmap files)
    ↓
PWC Mindmap Pro App (loads files)
```

The MCP server manipulates .pmap files directly. The app loads these files when opened.

## Version History

- **1.0.0** - Phase 1 MVP (create_mindmap, add_node, get_project_data)
