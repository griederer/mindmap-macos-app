# PWC Mindmap Pro - New Session Prompt

**Use this prompt to start a new Claude session with full project context.**

---

## 📋 Copy-Paste Prompt (Optimized for Context)

```
I'm working on PWC Mindmap Pro v4.0 - a macOS desktop mindmap application with MCP integration.

## Project Location
/Users/gonzaloriederer/Documents/GitHub/mindmap-macos-app

## Quick Context
- **Tech Stack**: Electron 28.1.0 + Node.js + Canvas API + MCP SDK
- **File Format**: Custom `.pmap` (JSON with Base64 images inside)
- **Projects Location**: ~/Documents/PWC Mindmaps/
- **Current Version**: 4.0.0 (main + develop branches)
- **Language**: JavaScript (no frameworks, vanilla JS)

## Architecture Essentials
1. **Main Process** (main.js): Window mgmt, IPC handlers, file operations
2. **Renderer Process** (renderer.js): UI logic, Canvas rendering, event handling
3. **MCP Server** (mcp-server/): 17 tools for natural language control via Claude Code
4. **ProjectManager** (project-manager.js): CRUD operations, metadata sync

## Key Files
- `main.js` - Electron main (530 lines)
- `renderer.js` - UI + Canvas (2100 lines)
- `mindmap-engine.js` - Core algorithms (800 lines)
- `project-manager.js` - File operations (500 lines)
- `mcp-server/index.js` - MCP tools (1200 lines)
- `styles.css` - All styles (1500 lines)

## Documentation (Read These First!)
📖 **Essential Reading Order**:
1. `README.md` - Project overview, features, quick start
2. `SCHEMA.md` - .pmap file format (IMPORTANT: images stored as Base64 inside files)
3. `ARCHITECTURE.md` - System design, data flow
4. `CONTRIBUTING.md` - Dev setup, coding standards

📚 **MCP Docs**:
- `mcp-server/MCP-COMPLETE-DOCUMENTATION.md` - Full API reference
- `mcp-server/NATURAL-LANGUAGE-GUIDE.md` - Usage examples

## Git Workflow
```bash
# Development branch
git checkout develop

# Main branch (production)
git checkout main

# Current state: develop ahead of main with new docs
```

## Running the App
```bash
# Start Electron app
npm start

# Run tests
npm test

# MCP server (auto-started by Claude Code)
cd mcp-server && node index.js
```

## Common Tasks Context

### Working with .pmap Files
- **Location**: `~/Documents/PWC Mindmaps/*.pmap`
- **Format**: JSON with schema version 4.0.0
- **Images**: Base64 data URIs (33% size overhead)
- **Metadata**: `.metadata.json` tracks recent/favorites

### Working with MCP
- **17 tools available** (see MCP-COMPLETE-DOCUMENTATION.md)
- **Key tools**: create_mindmap_smart, add_node, update_node_notes, add_image_to_node
- **Integration**: Works with Claude Code via stdio

### Making Changes
1. Read relevant docs first (SCHEMA.md for file format, ARCHITECTURE.md for system)
2. Follow CONTRIBUTING.md for coding standards
3. Test changes: `npm test`
4. Commit: Conventional commits format
5. Push to develop branch

## What to Ask Claude

**Good questions** (context-efficient):
- "Fix bug in [specific file/function]" - Provide file path
- "Add feature [X] following existing patterns" - Reference similar code
- "Explain how [component] works" - Ask for specific part
- "Update [file] to do [Y]" - Clear scope

**Avoid** (wastes context):
- "Read all files and understand everything" - Too broad
- "Explain the entire codebase" - Use docs instead
- Generic questions answerable by docs

## Key Architectural Decisions (Context Savers)

### Why Base64 Images in .pmap?
**Decision**: Store images as Base64 inside JSON files
**Reason**: Portability (one file = complete project)
**Trade-off**: 33% larger files, slower parsing
**Details**: See SCHEMA.md "Image Storage" section

### Why No React/Vue/Framework?
**Decision**: Vanilla JavaScript
**Reason**: Minimal overhead, full control, better performance
**Details**: See ARCHITECTURE.md "Design Philosophy"

### Why Custom .pmap Extension?
**Decision**: Not .json but .pmap
**Reason**: File association, clear identity, future-proofing
**Details**: See SCHEMA.md "What is .pmap?"

### Why Canvas Instead of SVG?
**Decision**: Canvas for connections, DOM for nodes
**Reason**: 60fps performance with many connections
**Details**: See ARCHITECTURE.md "Rendering Pipeline"

## Recent Changes (v4.0.0)
- ✅ Fixed project selector (dynamic loading from .metadata.json)
- ✅ Enhanced MCP server with 17 tools
- ✅ Added comprehensive documentation (SCHEMA, ARCHITECTURE, CONTRIBUTING)
- ✅ Improved IPC response format handling
- ✅ Base64 image storage in nodes

## Helpful Shortcuts

**Find specific code**:
```bash
# Search for function/class
grep -r "function createWindow" .

# Find in specific file type
grep -r "loadProject" --include="*.js"
```

**Check what's changed**:
```bash
git status
git diff
git log --oneline -10
```

## Common Issues & Solutions

**Issue**: "Projects not showing in panel"
**Solution**: Check renderer.js:2067-2072, ensure IPC response format { success, projects }

**Issue**: "MCP tools not working"
**Solution**: Check ~/.claude-code/mcp-config.json has absolute path to mcp-server/index.js

**Issue**: "Images not displaying"
**Solution**: Verify Base64 format: "data:image/jpeg;base64,..."

---

## How to Use This Prompt Efficiently

### Option 1: Full Context (for major work)
Copy entire prompt above + specific task

### Option 2: Minimal Context (for small fixes)
Copy only:
- Project Location
- Quick Context
- Specific task description
- Relevant file path

### Option 3: Documentation Reference (for questions)
Copy only:
- Project Location
- Ask Claude to read specific doc file
- Your question

## Example Efficient Prompts

### Example 1: Bug Fix
```
Project: /Users/gonzaloriederer/Documents/GitHub/mindmap-macos-app

Issue: Node positions not saving correctly in renderer.js

Please read renderer.js (focus on save/load functions) and fix the issue.
Project uses vanilla JavaScript, Electron, .pmap JSON files.
Follow coding standards in CONTRIBUTING.md.
```

### Example 2: New Feature
```
Project: /Users/gonzaloriederer/Documents/GitHub/mindmap-macos-app

Task: Add export to PDF feature

Read ARCHITECTURE.md section on "Export formats" for context.
Follow existing export pattern in renderer.js.
Add new menu item in main.js menu system.
Test with `npm test`.
```

### Example 3: Understanding Code
```
Project: /Users/gonzaloriederer/Documents/GitHub/mindmap-macos-app

Question: How does the Canvas connection rendering work?

Read ARCHITECTURE.md "Rendering Pipeline" section.
Explain the bezier curve implementation in renderer.js.
```

---

## Version Info

- **App Version**: 4.0.0
- **MCP Version**: 4.0.0
- **Electron**: 28.1.0
- **Node.js**: 18+
- **Last Updated**: October 7, 2025

## Repository

- **GitHub**: https://github.com/griederer/mindmap-macos-app
- **Branch**: develop (active development)
- **Branch**: main (production)

---

## 🎯 Start Your Session

**Recommended workflow**:

1. **Copy the prompt above** (or minimal version)
2. **Add your specific task**
3. **Mention relevant files** if known
4. **Reference docs** for complex topics
5. **Let Claude read only what's needed**

**Remember**:
- Docs are comprehensive - reference them instead of asking Claude to explain
- Be specific about file paths to save context
- Ask targeted questions rather than broad ones
- Follow CONTRIBUTING.md for all code changes

---

**Ready to start!** 🚀
```
