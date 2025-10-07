# Changelog

All notable changes to the PWC Mindmap MCP Server.

## [2.1.0] - 2025-01-07

### ✨ Added
- **Natural Language Interface** - New `create_mindmap_smart` tool for conversational mindmap creation
- **Auto-level detection** - No need to manually specify node levels
- **Comprehensive natural language guide** (NATURAL-LANGUAGE-GUIDE.md)
- **Enhanced documentation** with conversational examples
- **2 new tests** for natural language interface (total: 38 tests)

### 🔧 Changed
- Updated README.md with natural language quick start
- Bumped version to 2.1.0 in package.json
- Enhanced server version reporting

### 📝 Documentation
- Added NATURAL-LANGUAGE-GUIDE.md with complete usage examples
- Updated README with conversational patterns
- Added CHANGELOG.md for version tracking

### ✅ Testing
- All 38 tests passing (100% suite pass rate)
- Natural language interface fully tested
- Complete integration with existing features

---

## [2.0.0] - 2025-10-03

### ✨ Added
- Complete CRUD operations for mindmaps
- Image search and integration (Unsplash API)
- Category management (create, assign)
- Relationship management (create, connect nodes)
- Focus mode for presentations
- Custom node positioning
- Node reordering capabilities
- Metadata management
- Archive system for deleted projects

### 📊 Features
- 12 core tools
- 6 advanced tools (categories, relationships, focus, positioning)
- Full project lifecycle management
- Comprehensive error handling
- 36 automated tests

---

## [1.0.0] - 2025-09-29

### ✨ Initial Release
- Basic mindmap creation (`create_mindmap`)
- Node operations (`add_node`, `update_node`, `delete_node`)
- Project data retrieval (`get_project_data`)
- Project listing (`list_projects`)
- Simple delete functionality

### 🏗️ Foundation
- MCP SDK integration
- File-based storage system
- JSON project format
- Basic error handling

---

## Version Comparison

| Feature | v1.0 | v2.0 | v2.1 |
|---------|------|------|------|
| Core Tools | 5 | 12 | 13 |
| Advanced Tools | 0 | 6 | 6 |
| Natural Language | ❌ | ❌ | ✅ |
| Categories | ❌ | ✅ | ✅ |
| Relationships | ❌ | ✅ | ✅ |
| Focus Mode | ❌ | ✅ | ✅ |
| Image Search | ❌ | ✅ | ✅ |
| Tests | 8 | 36 | 38 |
| Documentation | Basic | Complete | Enhanced |

---

## Migration Guide

### From v2.0 to v2.1

**No breaking changes!** All v2.0 tools work exactly the same.

**New features:**
1. Use `create_mindmap_smart` for natural language creation
2. All existing tools remain backward compatible
3. New documentation in NATURAL-LANGUAGE-GUIDE.md

**Example upgrade:**
```javascript
// v2.0 (still works)
create_mindmap({
  topic: "Cybersecurity",
  nodes: [
    { title: "Security Policies", level: 1, description: "..." }
  ]
})

// v2.1 (new, optional)
create_mindmap_smart({
  topic: "Cybersecurity",
  nodeDescriptions: ["Security Policies"]
})
```

### From v1.0 to v2.0

**Breaking changes:**
- Project file format updated (v1.0 → v2.0)
- Added `metadata.version` field
- New required fields in project structure

**Migration steps:**
1. Export projects from v1.0 as JSON
2. Update version field to "2.0"
3. Add missing fields (categories, relationships, customOrders)
4. Re-import into v2.0

---

## Upcoming Features (Roadmap)

### v2.2.0 (Planned)
- [ ] Bulk node operations
- [ ] Template system for common mindmap structures
- [ ] Import from Markdown/Outline format
- [ ] Export to PNG/PDF via headless browser
- [ ] Real-time collaboration (WebSocket support)

### v2.3.0 (Planned)
- [ ] AI-powered node suggestions
- [ ] Automatic categorization
- [ ] Mind map analytics and insights
- [ ] Version control (git-like snapshots)
- [ ] Cloud synchronization

### v3.0.0 (Future)
- [ ] Multi-user collaboration
- [ ] Plugin system
- [ ] Custom rendering engines
- [ ] Advanced search and filtering
- [ ] Machine learning integration

---

**Maintained by:** Gonzalo Riederer
**License:** MIT
**Repository:** github.com/griederer/mindmap-macos-app
