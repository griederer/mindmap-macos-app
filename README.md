# PWC Mindmap Pro v4.0 - Professional Mindmap Editor for macOS

**Version**: 4.0.0
**Release Date**: October 7, 2025
**Author**: Gonzalo Riederer

A sophisticated, native-feeling mindmap application for macOS built with Electron, featuring smooth animations, Canvas-based connections, MCP integration, and extensive customization options.

---

## 🎉 What's New in v4.0.0

### 🎯 Major Fixes & Improvements

- ✅ **Fixed Project Selector** - Projects panel now dynamically loads ALL projects from `.metadata.json`
- ✅ **Dynamic Project Loading** - No more hardcoded project lists
- ✅ **Better IPC Handling** - Improved response format handling between main/renderer processes
- ✅ **Real-time Sync** - Projects automatically appear when created via MCP server
- ✅ **Enhanced Metadata** - Complete `.metadata.json` tracking for recent projects and favorites

### 🚀 New Features

- **MCP Server v4.0.0** - Complete natural language mindmap creation and management
- **Unsplash Integration** - Search and attach images to nodes via MCP
- **Categories & Relationships** - Organize nodes with color-coded categories and custom relationships
- **Focus Mode** - Filter mindmap view to specific branches
- **Custom Positioning** - Manually position nodes for better visualization

---

## Features

### 🎨 **Professional Design**
- Native macOS integration with proper title bar styling
- PWC-branded color scheme with smooth gradients
- High-performance Canvas rendering for connections
- Smooth animations and transitions
- **v4.0**: Dynamic project panel with real-time updates

### 🧠 **Advanced Mindmap Functionality**
- **Hierarchical node structure** with unlimited depth
- **Expandable/collapsible branches** for focus management
- **Rich node content** with descriptions, notes, and images
- **Info Panel System** - Toggle detailed information for each node
  - Primary description (auto-imported from outline)
  - Optional additional notes
  - Image attachments with thumbnail preview
  - Unsplash image search integration
- **Smooth curved connections** drawn with Canvas for optimal performance
- **Drag-to-pan** and **zoom with ⌘+scroll**
- **Categories** - Color-code nodes for organization
- **Relationships** - Create custom connections between nodes
- **Focus Mode** - Filter view to specific branches

### ⚡ **Performance Optimized**
- **Canvas-based connection rendering** instead of SVG for better performance
- **Hardware acceleration** enabled
- **Efficient node positioning** algorithms
- **Request animation frame** based rendering
- **Will-change CSS** properties for smooth animations

### 🔧 **macOS Integration**
- **Native menu bar** with full keyboard shortcuts
- **File handling** (open, save, recent files)
- **Drag region** for proper window dragging
- **System font rendering** with -webkit-font-smoothing
- **Proper window controls** positioning
- **File watching** - Auto-reload when .pmap files change

### 📁 **File Support**
- **Import**: Markdown (.md), Text (.txt), JSON (.json), PWC Mindmap (.pmap)
- **Export**: JSON, PWC Mindmap format, Image (PNG/SVG)
- **Auto-save** functionality with save status indicator
- **Recent files** menu integration
- **Metadata tracking** - Recent projects, favorites, last opened

### ⌨️ **Keyboard Shortcuts**
- `⌘+N` - New mindmap
- `⌘+O` - Open file
- `⌘+S` - Save / `⌘+Shift+S` - Save as
- `⌘+Shift+E` - Expand all nodes
- `⌘+Shift+C` - Collapse all nodes
- `⌘+scroll` - Zoom in/out
- `⌘+0` - Reset zoom
- `⌘+\\` - Toggle sidebar
- `Tab` - Add child node
- `Delete` - Delete selected node
- `⌘+I` - Toggle node info panel

---

## 🤖 MCP Server Integration (NEW in v4.0)

### Claude Code Integration

PWC Mindmap Pro includes a **complete MCP (Model Context Protocol) server** that enables full mindmap control through natural language via Claude Code!

**Location**: `/mcp-server/`
**Version**: 4.0.0

### ✨ MCP Features

#### 🎯 **Natural Language Creation**
Create mindmaps with simple descriptions:
```
Create a mindmap about Cloud Security with IAM, Encryption, and Monitoring
```

#### 🔧 **17 Powerful Tools**

| Category | Tools | Description |
|----------|-------|-------------|
| **Project Management** | `create_mindmap`<br>`create_mindmap_smart` ⭐<br>`list_projects`<br>`get_project_data`<br>`delete_project` | Create, read, update, delete projects<br>Natural language creation<br>Complete project data access |
| **Node Operations** | `add_node`<br>`update_node`<br>`delete_node`<br>`get_node_children`<br>`reorder_nodes` | Full CRUD operations on nodes<br>Hierarchical structure management<br>Custom ordering |
| **Image Management** | `search_images`<br>`add_image_to_node`<br>`update_node_notes` | Unsplash integration<br>Image attachments<br>Rich content |
| **Organization** | `create_category`<br>`assign_category`<br>`create_relationship`<br>`connect_nodes` | Color-coded categories<br>Custom node relationships<br>Advanced organization |
| **Visualization** | `set_focus_mode`<br>`set_node_position` | Filter views<br>Custom layouts |

### 📚 Quick Start with MCP

#### 1. Install MCP Server
```bash
cd mcp-server
npm install
```

#### 2. Add to Claude Code
Add to `~/.claude-code/mcp-config.json`:
```json
{
  "mcpServers": {
    "pwc-mindmap": {
      "command": "node",
      "args": ["/absolute/path/to/mindmap-macos-app/mcp-server/index.js"]
    }
  }
}
```

#### 3. Restart Claude Code

#### 4. Start Creating!
```
User: "Create a mindmap about Risk Management with these topics:
       Identification, Assessment, Mitigation, and Monitoring"

Claude: *Uses create_mindmap_smart tool*
        Created "Risk Management.pmap" with 5 nodes!
```

### 🎓 Usage Examples

**Example 1: Simple Creation**
```
Create a mindmap about Data Privacy
```

**Example 2: With Structure**
```
Create a cybersecurity mindmap with:
- Network Security (firewalls, IDS)
- Application Security (input validation, SQL injection)
- Data Protection (encryption at rest, in transit)
```

**Example 3: Add Rich Content**
```
Add a node "GDPR Compliance" under "Data Privacy"
and search for related images
```

**Example 4: Organize with Categories**
```
Create a "High Priority" category in red (#dc2626)
and assign it to "Risk Assessment"
```

### 📖 Complete Documentation

- **[MCP Complete Documentation](mcp-server/MCP-COMPLETE-DOCUMENTATION.md)** - Full API reference with examples
- **[Natural Language Guide](mcp-server/NATURAL-LANGUAGE-GUIDE.md)** - Conversational interface guide
- **[MCP Server README](mcp-server/README.md)** - Quick start and overview

---

## Technical Architecture

### Core Technologies
- **Electron 28.1.0** - Cross-platform desktop app framework
- **Canvas API** - High-performance connection rendering
- **MCP SDK 0.5.0** - Model Context Protocol integration
- **CSS Grid & Flexbox** - Responsive layout system
- **Chokidar** - File system watching
- **Axios** - HTTP client for Unsplash API

### Performance Features
- **Canvas-based connections** instead of SVG for 60fps rendering
- **Animation loop** with requestAnimationFrame
- **Hardware acceleration** enabled
- **Optimized DOM manipulation** with minimal reflows
- **Efficient event handling** with proper event delegation

### File Structure
```
mindmap-macos-app/
├── main.js                  # Electron main process
├── preload.js               # Secure IPC bridge
├── renderer.js              # UI logic and events (v4.0 fixes)
├── mindmap-engine.js        # Core mindmap logic
├── project-manager.js       # Backend project management
├── renderer-project-manager.js  # Frontend project integration
├── styles.css               # Optimized CSS with animations
├── index.html               # Main application UI
├── package.json             # v4.0.0
├── mcp-server/              # MCP Server v4.0.0
│   ├── index.js             # MCP implementation
│   ├── package.json         # v4.0.0
│   ├── MCP-COMPLETE-DOCUMENTATION.md  # Full API docs
│   ├── NATURAL-LANGUAGE-GUIDE.md      # Usage guide
│   ├── CHANGELOG.md         # Version history
│   └── __tests__/           # Test suite
└── docs/                    # Additional documentation
```

---

## Installation & Usage

### Development
```bash
# Clone repository
git clone https://github.com/griederer/mindmap-macos-app.git
cd mindmap-macos-app

# Install dependencies
npm install

# Install MCP server
cd mcp-server && npm install && cd ..

# Start application
npm start
```

### Building for Production
```bash
npm run build
```

### Creating Distribution
```bash
npm run dist
```

The built app will be in the `dist/` folder.

---

## Data Format

### .pmap File Structure (v4.0)
```json
{
  "name": "Cloud Security",
  "content": "Cloud Security\n1. Identity Management\n* Multi-Factor Auth",
  "nodes": {
    "Cloud Security": {
      "description": "Comprehensive security framework",
      "notes": "Last updated: Oct 2025",
      "images": [
        {
          "url": "https://images.unsplash.com/...",
          "thumb": "https://...",
          "photographer": "John Doe"
        }
      ],
      "showInfo": false
    }
  },
  "categories": [
    { "name": "High Priority", "color": "#ff6b6b" }
  ],
  "relationships": [
    { "name": "depends on", "color": "#3b82f6", "dashPattern": "5,5" }
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

### .metadata.json (v4.0)
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

### Outline Import Format
Use the pipe `|` character to add descriptions:

```
Node Title | Description text (up to 50 words)
1. Child Node | Child description
* Sub Node | Sub description
```

**Example:**
```
Cloud Security | Comprehensive approach to securing cloud infrastructure
1. Identity Management | Control access and authentication
* Multi-Factor Auth | Additional security layer
* Single Sign-On | Centralized authentication
2. Data Encryption | Protect data at rest and in transit
```

---

## Performance Benchmarks

- **Node rendering**: < 16ms for 100+ nodes
- **Connection drawing**: 60fps with Canvas
- **Memory usage**: < 100MB for large mindmaps
- **Startup time**: < 2 seconds
- **MCP response time**: < 100ms average

---

## Sample Projects

The app includes sample mindmaps:

### 1. **Cloud Security**
- Identity Management
- Data Encryption
- Network Security
- Compliance

### 2. **Data Privacy Framework**
- GDPR Compliance
- Data Classification
- Privacy by Design
- Incident Response

### 3. **Risk Management**
- Risk Identification
- Risk Assessment
- Risk Mitigation
- Risk Monitoring

---

## Troubleshooting

### Common Issues

#### Projects not showing in panel
**v4.0.0 fixed this!** If still experiencing issues:
```bash
# Ensure you're on v4.0.0
git pull origin main
npm install
npm start
```

#### MCP server not connecting
```bash
# Check MCP config
cat ~/.claude-code/mcp-config.json

# Verify path is absolute
# Restart Claude Code
```

#### File permissions error
```bash
chmod 755 ~/Documents/"PWC Mindmaps"
```

#### Unsplash images not loading
Set API key:
```bash
export UNSPLASH_ACCESS_KEY="your_key_here"
```

### Debug Mode
```bash
# Enable verbose logging
DEBUG=pwc-mindmap:* npm start

# Check MCP server logs
tail -f ~/Documents/"PWC Mindmaps"/.mcp-server.log
```

---

## Roadmap

### ✅ Completed (v4.0)
- [x] MCP server for Claude Code integration
- [x] Natural language mindmap creation
- [x] Unsplash image integration
- [x] Categories and relationships
- [x] Focus mode
- [x] Fixed project selector
- [x] Dynamic project loading

### 🔄 In Progress
- [ ] Export to PNG/SVG/PDF
- [ ] Advanced search and filtering
- [ ] Templates library

### 📋 Planned
- [ ] Real-time collaboration
- [ ] Cloud synchronization
- [ ] Presentation mode
- [ ] Advanced analytics
- [ ] Plugin system
- [ ] Mobile companion app

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Keep commits atomic and descriptive

---

## License

MIT License

Copyright (c) 2025 Gonzalo Riederer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## Support

- **Issues**: https://github.com/griederer/mindmap-macos-app/issues
- **Documentation**: [MCP Complete Documentation](mcp-server/MCP-COMPLETE-DOCUMENTATION.md)
- **Email**: gonzaloriederer@gmail.com

---

## Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- MCP SDK by [Anthropic](https://www.anthropic.com/)
- Images powered by [Unsplash](https://unsplash.com/)
- Icons from [Heroicons](https://heroicons.com/)

---

**Built with ❤️ for PWC and the productivity community**

**Version 4.0.0** - *"The Dynamic Project Era"*
