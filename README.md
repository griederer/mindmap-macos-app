# PWC Mindmap Pro - Professional Mindmap Editor for macOS

A sophisticated, native-feeling mindmap application for macOS built with Electron, featuring smooth animations, Canvas-based connections, and extensive customization options.

## Features

### 🎨 **Professional Design**
- Native macOS integration with proper title bar styling
- PWC-branded color scheme with smooth gradients
- High-performance Canvas rendering for connections
- Smooth animations and transitions

### 🧠 **Advanced Mindmap Functionality**
- **Hierarchical node structure** with unlimited depth
- **Expandable/collapsible branches** for focus management
- **Rich node content** with descriptions, notes, and images
- **Info Panel System** - Toggle detailed information for each node
  - Primary description (auto-imported from outline)
  - Optional additional notes
  - Image attachments with thumbnail preview
- **Smooth curved connections** drawn with Canvas for optimal performance
- **Drag-to-pan** and **zoom with ⌘+scroll**

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

### 📁 **File Support**
- **Import**: Markdown (.md), Text (.txt), JSON (.json), PWC Mindmap (.pmap)
- **Export**: JSON, PWC Mindmap format
- **Auto-save** functionality
- **Recent files** menu integration

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

## Technical Architecture

### Core Technologies
- **Electron** - Cross-platform desktop app framework
- **Canvas API** - High-performance connection rendering
- **CSS Grid & Flexbox** - Responsive layout system
- **Web Workers** (ready for future optimization)

### Performance Features
- **Canvas-based connections** instead of SVG for 60fps rendering
- **Animation loop** with requestAnimationFrame
- **Hardware acceleration** enabled
- **Optimized DOM manipulation** with minimal reflows
- **Efficient event handling** with proper event delegation

### File Structure
```
src/
├── main.js              # Electron main process
├── preload.js           # Secure IPC bridge
├── renderer.js          # UI logic and events
├── mindmap-engine.js    # Core mindmap logic
├── styles.css           # Optimized CSS with animations
└── index.html           # Main application UI
```

## Installation & Usage

### Development
```bash
npm install
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

## Data Format

### Node Structure
The application uses a hierarchical JSON structure:

```json
{
  "nodes": {
    "id": "node-0",
    "title": "Central Topic",
    "description": "Optional description",
    "children": [...],
    "level": 0,
    "expanded": true
  },
  "nodeData": {
    "node-0": {
      "description": "Primary description (shown in info panel)",
      "notes": "Additional optional notes",
      "images": ["base64..."],
      "showInfo": false
    }
  }
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
IA Responsable | Práctica de diseñar, desarrollar e implementar sistemas de IA ética.
1. Frameworks | Enfoques estructurados para implementar IA responsable.
* Marcos Éticos | Fundamentos filosóficos que guían desarrollo ético.
```

## Sample Data

The app includes sample data for "IA Responsable" (Responsible AI) covering:

1. **Principios Fundamentales**
   - Equidad y No Discriminación
   - Transparencia
   - Responsabilidad
   - Privacidad y Seguridad
   - Diseño Centrado en el Humano

2. **Riesgos y Desafíos**
   - Riesgos Técnicos
   - Riesgos Sociales

## Performance Benchmarks

- **Node rendering**: < 16ms for 100+ nodes
- **Connection drawing**: 60fps with Canvas
- **Memory usage**: < 100MB for large mindmaps
- **Startup time**: < 2 seconds

## 🤖 MCP Server Integration

### Claude Code Integration
PWC Mindmap Pro now includes an **MCP (Model Context Protocol) server** that enables control through natural language via Claude Code!

**Location**: `/mcp-server/`

### Features
- **Create mindmaps** with natural language commands
- **Add nodes** with automatic descriptions
- **Manage projects** programmatically through Claude Code

### Quick Start
```bash
# Install the MCP server
cd mcp-server
npm install

# Add to Claude Code
claude mcp add pwc-mindmap node ~/Documents/GitHub/mindmap-macos-app/mcp-server/index.js
```

### Usage Examples
```
Create a mindmap about "Solar System" with nodes for Planets and Moons
```
```
Add a node "Earth" under "Planets" in the Solar System project
```

**Full documentation**: See `/mcp-server/README.md`

## Future Enhancements

- [x] MCP server for Claude Code integration
- [ ] Image search and auto-attachment (MCP Phase 2)
- [ ] Real-time collaboration
- [ ] Export to various image formats
- [ ] Plugin system
- [ ] Cloud synchronization
- [ ] Advanced search and filtering
- [ ] Presentation mode
- [ ] Mind map templates
- [ ] Advanced analytics

## License

MIT License - Feel free to use and modify for your projects.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Built with ❤️ for productivity and creative thinking**