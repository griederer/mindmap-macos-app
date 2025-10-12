# VS Code Setup Complete

**Date:** 2025-10-11
**Status:** ✅ Ready for Development

## Overview

The mindmap-macos-app project is now fully configured for VS Code development with Claude Code integration. All workspace structure, documentation, and PRDs are in place.

## Created Structure

```
mindmap-macos-app/
├── .vscode/                        # VS Code workspace configuration
│   ├── settings.json               # Editor settings
│   ├── tasks.json                  # Build/run tasks
│   ├── launch.json                 # Debug configurations
│   └── extensions.json             # Recommended extensions
│
├── docs/                           # Documentation
│   ├── README.md                   # Documentation index
│   ├── architecture/               # Technical design
│   │   └── relationship-system.md  # v5.0 relationship architecture
│   ├── bugs/                       # Bug tracking
│   │   └── node-counter-investigation.md  # Critical bug analysis
│   └── development/                # Dev guides
│       └── setup.md                # Development setup guide
│
├── tasks/                          # PRDs and task lists
│   ├── README.md                   # Tasks directory guide
│   └── 0001-prd-relationship-system-fixes.md  # Main PRD
│
├── logs/                           # Debug session logs (empty)
│
└── CLAUDE-HANDOFF-CONTEXT.md      # Claude Code session context
```

## VS Code Configuration

### Editor Settings (.vscode/settings.json)
- Format on save: enabled
- Tab size: 2 spaces
- Trim trailing whitespace: enabled
- Insert final newline: enabled
- JavaScript validation and auto-imports enabled

### Build Tasks (.vscode/tasks.json)
Available tasks (Cmd+Shift+P → "Tasks: Run Task"):
- **Start Electron App** (Cmd+Shift+B)
- **Kill All Electron Processes**
- **Restart Electron App**
- **Run Tests**
- **Lint Code**

### Debug Configurations (.vscode/launch.json)
Press F5 to debug:
- **Debug Main Process** - Electron main process
- **Debug Renderer Process** - Chrome DevTools integration
- **Debug All** - Both processes simultaneously

### Recommended Extensions (.vscode/extensions.json)
- ESLint
- Prettier
- TypeScript Next
- SQLite
- REST Client
- GitLens
- Markdown All in One
- Live Server

## Documentation

### Architecture Documentation
**Location:** `/docs/architecture/`

- **relationship-system.md** - Complete v5.0 relationship system documentation
  - Data structure
  - Drawing algorithm
  - Workflow
  - Code locations
  - Known issues

### Bug Tracking
**Location:** `/docs/bugs/`

- **node-counter-investigation.md** - Critical bug analysis
  - Problem description
  - Root cause
  - Attempted fix and crash
  - Investigation plan
  - Code references

### Development Guide
**Location:** `/docs/development/`

- **setup.md** - Complete development setup
  - Prerequisites
  - Installation
  - Running the app
  - Debugging
  - Testing
  - Troubleshooting

## Product Requirements

### PRD #0001: Relationship System Fixes
**Location:** `/tasks/0001-prd-relationship-system-fixes.md`
**Status:** Draft
**Priority:** High

**Scope:**
- Fix node counter showing 130 instead of 4
- Ensure data loading consistency (prevent crashes)
- Validate complete relationship workflow
- Improve localStorage management
- Enhance error handling

**Phases:**
1. **Critical Bugs** (Week 1) - Fix crashes and node counter
2. **Validation** (Week 2) - Ensure workflow works end-to-end
3. **Polish** (Week 3) - Improve UX and error handling
4. **Testing & Release** (Week 4) - Comprehensive testing

**Key Requirements:**
- FR-001: Node Counter Fix (P0)
- FR-002: Data Loading Consistency (P0)
- FR-003: Initialization Sequence (P1)
- FR-004: localStorage Management (P1)
- FR-005: Relationship Workflow Validation (P1)
- FR-007: Error Handling (P2)

## Quick Start

### Opening in VS Code

```bash
cd /Users/gonzaloriederer/Documents/GitHub/mindmap-macos-app
code .
```

### Running the App

**Option 1: Keyboard shortcut**
- Press `Cmd+Shift+B` → "Start Electron App"

**Option 2: Terminal**
```bash
npm start
```

**Option 3: Debug mode**
- Press `F5` → Select debug configuration

### Restarting After Changes

**Option 1: Task runner**
- Press `Cmd+Shift+P`
- Type "Tasks: Run Task"
- Select "Restart Electron App"

**Option 2: Terminal**
```bash
killall Electron
npm start
```

### Debugging

**Main process:**
1. Set breakpoints in `main.js`
2. Press `F5`
3. Select "Debug Main Process"

**Renderer process:**
1. Start app with `npm start`
2. Press `Cmd+Option+I` in app
3. Use Chrome DevTools

## Context Documents

### For New Sessions

When starting a new Claude Code session, reference these documents:

1. **CLAUDE-HANDOFF-CONTEXT.md** - Complete investigation context
   - Bug analysis with code locations
   - Root cause identification
   - Fix attempts and failures
   - Step-by-step instructions

2. **tasks/0001-prd-relationship-system-fixes.md** - Requirements
   - User stories
   - Functional requirements
   - Technical considerations
   - Success metrics

3. **docs/bugs/node-counter-investigation.md** - Bug details
   - Problem description
   - Investigation findings
   - Next steps

## Key Information

### Critical Bug

**Node Counter Shows 130 Instead of 4**

**Location:** `renderer.js:2449`

**Current (incorrect):**
```javascript
window.mindmapEngine.nodeData = projectData.nodes || {};
```

**Should be (but causes crash):**
```javascript
window.mindmapEngine.nodeData = projectData.nodeData || {};
```

**Status:** Investigation needed - correct fix causes app crash

### Fixed Issues

✅ **Checkbox double-toggle** (renderer.js:1597-1610)
✅ **Panel refresh** (renderer.js:1405-1417)

### Test Environment

**Test Project:** Test-Relaciones-Vacio.pmap
**Location:** `/Users/gonzaloriederer/Documents/PWC Mindmaps/`
**Nodes:** 4 (1 root + 3 children: A, B, C)
**Relationships:** 0 (clean slate)

## Next Steps

1. **Read PRD** - `/tasks/0001-prd-relationship-system-fixes.md`
2. **Understand bug** - `/docs/bugs/node-counter-investigation.md`
3. **Set up environment** - Follow `/docs/development/setup.md`
4. **Start Phase 1** - Critical bug fixes
5. **Generate task list** - Break PRD into implementation tasks

## Success Criteria

### Workspace Setup ✅
- [x] VS Code configuration files created
- [x] Debugging configured
- [x] Tasks configured
- [x] Extensions recommended
- [x] Documentation organized

### Next Phase (Implementation)
- [ ] Node counter shows correct value (4 instead of 130)
- [ ] No crashes on project load
- [ ] Complete relationship workflow validated
- [ ] All tests passing
- [ ] Code coverage >80%

## Resources

- **Electron Docs:** https://www.electronjs.org/docs
- **VS Code Debugging:** https://code.visualstudio.com/docs/editor/debugging
- **VS Code Tasks:** https://code.visualstudio.com/docs/editor/tasks

---

## Notes for Claude Code Sessions

**Context Efficiency:**
- Use `CLAUDE-HANDOFF-CONTEXT.md` for complete investigation context
- Reference specific line numbers provided in documentation
- Focus on identified issues in PRD
- Leverage test project (Test-Relaciones-Vacio.pmap)

**Development Workflow:**
1. Read relevant documentation first
2. Use TodoWrite tool for task tracking
3. Test changes with test project
4. Update documentation as you work
5. Mark tasks complete only when validated

**Debugging Tips:**
- Use VS Code debugger (F5)
- Check DevTools console (Cmd+Option+I)
- Review logs in console
- Test with cleared localStorage

Good luck! 🚀
