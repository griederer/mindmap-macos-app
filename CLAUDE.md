# Claude Code Configuration - PWC Mindmap Pro

## Project Context

**PWC Mindmap Pro** - Professional macOS Electron application for creating and managing mindmaps with advanced relationship systems.

**Current Branch:** `feature/v5.0-json-standardization`
**Project Root:** `/Users/gonzaloriederer/Documents/GitHub/mindmap-macos-app`
**Data Directory:** `/Users/gonzaloriederer/Documents/PWC Mindmaps`

## Core Behavior

- **Test-driven development is mandatory** - Write tests before marking tasks complete
- **One task at a time** - Complete current task before starting next
- **Show test results** before stopping - Display output of test commands
- **Use TodoWrite tool** for task tracking and progress visibility
- **Dangerous mode enabled** - Execute without confirmation in sandboxed environment

## Project Structure

```
mindmap-macos-app/
├── main.js                 # Electron main process
├── renderer.js             # Main UI logic (2967 lines)
├── mindmap-engine.js       # Core mindmap rendering (1547 lines)
├── project-manager.js      # Project file management
├── index.html              # Main app window
├── styles.css              # Application styles
├── preload.js              # Electron preload script
├── __tests__/              # Jest test suite
├── docs/                   # Documentation
│   ├── architecture/       # System design docs
│   ├── bugs/              # Bug investigation notes
│   ├── development/       # Development guides
│   └── prds/              # Product requirements
├── tasks/                  # PRDs and task lists
├── .vscode/               # VS Code configuration
└── node_modules/          # Dependencies
```

## Tech Stack

**Runtime:**
- Node.js 18+
- Electron 28+
- macOS (target platform)

**Dependencies:**
- chokidar (file watching)
- electron-store (settings)
- sortablejs (drag & drop)
- lucide (icons)

**Dev Tools:**
- Jest (testing framework)
- electron-builder (packaging)

## Current Focus: Relationship System v5.0 Bugs

### Critical Bugs

#### Bug #1: Node Counter Showing 130 Instead of 4
**Status:** Under Investigation
**Location:** `renderer.js:2449`
**Priority:** P0

**Problem:**
```javascript
// INCORRECT - Line 2449
window.mindmapEngine.nodeData = projectData.nodes || {};

// SHOULD BE
window.mindmapEngine.nodeData = projectData.nodeData || {};
```

**Symptom:**
- Relationship panel shows "Total nodos: 130" when project has only 4 nodes
- Counts from stale `this.nodes` tree cached in localStorage

**Investigation Status:**
- Root cause identified
- Fix attempted but causes app crash (exit code 1)
- Crash reason unknown - needs deep investigation

**Test Project:**
- File: `Test-Relaciones-Vacio.pmap`
- Location: `/Users/gonzaloriederer/Documents/PWC Mindmaps/`
- Nodes: 4 (1 root + 3 children: Nodo A, B, C)
- Expected counter: "4 nodos"

#### Bug #2: Data Loading Causes Crash
**Status:** Blocking Bug #1 Fix
**Priority:** P0

**Issue:**
When correcting the property from `projectData.nodes` to `projectData.nodeData`, the app crashes on startup.

**Needs Investigation:**
1. Why does correct property cause crash?
2. Timing/initialization issue?
3. parseOutline() logic problem?
4. localStorage corruption?

### Completed Fixes

- Checkbox double-toggle in edit node modal (renderer.js:1597-1610)
- Relationship panel auto-refresh when opened (renderer.js:1405-1417)

## Development Workflow

### Git Flow Strategy (MANDATORY)

**Repository:** https://github.com/griederer/mindmap-macos-app

This project follows **Git Flow** for version control. Always use this workflow:

#### Branch Structure

| Branch | Purpose | Status |
|--------|---------|--------|
| `main` | Production releases (v5.0.0) | ✅ **STABLE** - Never commit directly |
| `develop` | Integration & testing | 🔄 **ACTIVE** - Merge features here first |
| `feature/*` | New features | 🚀 Create from develop |
| `bugfix/*` | Non-critical fixes | 🐛 Create from develop |
| `hotfix/*` | Critical production fixes | 🚨 Create from main |
| `release/*` | Release preparation | 📦 Create from develop |

#### Standard Workflow

```bash
# ALWAYS start new work from develop
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# Work and commit (use conventional commits)
git add .
git commit -m "feat: add feature description"

# Push and create PR to develop (NOT main)
git push origin feature/your-feature-name
# → Create PR: feature/your-feature-name → develop
```

#### Commit Message Format (Conventional Commits)

```
<type>(<scope>): <subject>

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- test: Tests
- refactor: Code refactoring
- chore: Build/tooling

Examples:
git commit -m "feat(export): add PDF export functionality"
git commit -m "fix(counter): correct node count in relationship panel"
git commit -m "docs(workflow): add Git Flow documentation"
```

#### Release Process

```bash
# When develop is ready for production
git checkout develop
git checkout -b release/v5.1.0
npm version 5.1.0  # Updates package.json

# Final testing
npm test && npm run build

# Merge to main (production)
git checkout main
git merge --no-ff release/v5.1.0
git tag -a v5.1.0 -m "Release v5.1.0 - Description"
git push origin main --tags

# Merge back to develop
git checkout develop
git merge --no-ff release/v5.1.0
git push origin develop
```

#### CI/CD Pipeline

**GitHub Actions runs automatically on:**
- Push to `develop` or `main`
- Pull requests to `develop` or `main`

**What it does:**
1. ✅ Run all tests (`npm test`)
2. ✅ Build app (`npm run build`)
3. ✅ Create macOS DMG (on main)
4. ✅ Upload artifacts
5. ✅ Create GitHub release (on main with tag)

**View status:** GitHub → Actions tab

#### Critical Rules

1. **NEVER commit directly to `main`** - Always go through develop
2. **ALWAYS create PRs to `develop`** - Not main
3. **Test before merging** - CI must pass
4. **One feature per branch** - Keep it focused
5. **Use conventional commits** - For changelog generation

#### Quick Reference

```bash
# Check current branch
git branch --show-current

# List all branches
git branch -a

# View workflow docs
cat DEVELOPMENT-WORKFLOW.md

# Create feature
git checkout develop && git checkout -b feature/name

# Push and create PR
git push origin feature/name
# Then: GitHub → Compare & Pull Request → target: develop
```

**Full Documentation:** See [DEVELOPMENT-WORKFLOW.md](DEVELOPMENT-WORKFLOW.md)

---

### AI Dev Tasks Integration

This project uses the [ai-dev-tasks workflow](https://github.com/snarktank/ai-dev-tasks) for structured feature development.

**Three-Phase Process:**

1. **Create PRD** (`~/ai-dev-tasks/create-prd.md`)
   - Ask clarifying questions
   - Generate comprehensive requirements
   - Save to `/tasks/[n]-prd-[feature-name].md`

2. **Generate Tasks** (`~/ai-dev-tasks/generate-tasks.md`)
   - Phase 2A: High-level parent tasks (1.0, 2.0, 3.0)
   - Wait for "Go" confirmation
   - Phase 2B: Detailed sub-tasks (1.1, 1.2, 1.3)
   - Save to `/tasks/tasks-[prd-file-name].md`

3. **Implement Tasks** (`~/ai-dev-tasks/process-task-list.md`)
   - One sub-task at a time
   - Write tests (TDD: Red → Green → Refactor)
   - Mark `[x]` in markdown file
   - STOP and wait for approval
   - Only "yes" or "y" continues

### Active PRD

**Current:** `tasks/0001-prd-relationship-system-fixes.md` (34KB)

**Timeline:**
- Phase 1 (Week 1): Critical bugs - IN PROGRESS
- Phase 2 (Week 2): Validation - PENDING
- Phase 3 (Week 3): Polish - PENDING
- Phase 4 (Week 4): Testing & Release - PENDING

## Commands

```bash
# Development
npm start                   # Start Electron app
npm run dev                 # Start with dev tools open
npm test                    # Run Jest tests
npm run test:coverage       # Test coverage report

# Building
npm run build              # Build app
npm run dist               # Create macOS distribution

# Debugging
npm start -- --dev         # Open with DevTools
```

## Testing Requirements

### TDD Workflow
1. **Red** - Write failing test
2. **Green** - Make test pass
3. **Refactor** - Improve code
4. **Show results** - Display test output

### Test Coverage
- Target: 80%+ coverage
- Framework: Jest
- Location: `__tests__/`

### Critical Test Areas
- `countProjectNodes()` accuracy
- Project loading sequence
- Relationship creation and assignment
- Checkbox behavior in edit modal
- localStorage handling

## Code Standards

### JavaScript
- Use strict mode
- Avoid global variables
- Prefer const/let over var
- Use async/await for async operations
- Comprehensive error handling

### Electron Best Practices
- Separate main/renderer concerns
- Use preload scripts for IPC
- Validate all data from renderer
- Handle crashes gracefully

### Documentation
- Update ARCHITECTURE.md for major changes
- Document bugs in `/docs/bugs/`
- Keep PRDs current in `/tasks/`
- Add code comments for complex logic

## Key Code Locations

### Node Counter Logic
```javascript
// renderer.js:1531-1567
updateRelationshipStats() {
    let totalNodes = window.mindmapEngine.countProjectNodes();
    // Updates DOM
}

// mindmap-engine.js:1533-1546
countProjectNodes(node = null) {
    if (!node) node = this.nodes;  // ← COUNTS FROM this.nodes
    // Recursive count of tree
}
```

### Project Loading
```javascript
// renderer.js:2434-2524
async loadProject(projectId) {
    const projectData = await window.projectManager.loadProject(project.path);
    // Line 2446: Load content into textarea ✓
    document.getElementById('outlineInput').value = projectData.content || '';

    // Line 2449: BUG - Wrong property loaded ❌
    window.mindmapEngine.nodeData = projectData.nodes || {};
    // Should be: projectData.nodeData

    // Line 2524: Generate mindmap
    this.generateMindmap();
}
```

### Relationship Drawing
```javascript
// mindmap-engine.js:410-494
drawConnections() {
    // Draw hierarchy lines
    // Draw relationship connections (v5.0)
    activeRels.forEach(relationshipId => {
        // Find all nodes with this relationshipId
        // Draw lines between each pair
    });
}
```

## Data Format (v5.0)

### Project File (.pmap)
```json
{
  "version": "5.0",
  "metadata": {
    "created": "...",
    "modified": "...",
    "author": "..."
  },
  "content": "Root\n\tChild 1\n\tChild 2",
  "nodes": {
    "id": "root-001",
    "title": "Root",
    "children": [...]
  },
  "nodeData": {
    "root-001": {
      "relationships": ["rel-001"],
      "categories": [],
      "notes": "",
      "images": []
    }
  },
  "relationships": [
    {
      "id": "rel-001",
      "name": "depends on",
      "color": "#ff6b6b",
      "dashPattern": [5, 5]
    }
  ]
}
```

### Key Properties
- **content:** Plain text outline (for textarea)
- **nodes:** Hierarchical tree structure
- **nodeData:** Flat dictionary of node data
- **relationships:** Relationship definitions

## Known Issues to Avoid

1. **Don't add console.log inside countProjectNodes()** - Causes syntax errors
2. **Don't trust localStorage data** - May be stale/corrupted
3. **Always test with Test-Relaciones-Vacio.pmap** - Clean state
4. **Fix at line 2449 causes crash** - Needs investigation before applying

## Success Criteria

### Bug Fix Complete
- [ ] Node counter shows "4 nodos" for test project
- [ ] No crashes on app startup
- [ ] Counter updates correctly when switching projects
- [ ] All tests passing

### Workflow Complete
- [ ] Can create relationship
- [ ] Can assign to nodes via edit modal
- [ ] Checkboxes stay checked (DONE)
- [ ] Lines appear on canvas
- [ ] Lines respect color and dash pattern
- [ ] Can toggle relationship visibility

## Reference Documents

**Essential Reading:**
- `CLAUDE-HANDOFF-CONTEXT.md` - Complete debugging context
- `tasks/0001-prd-relationship-system-fixes.md` - Current PRD (34KB)
- `ARCHITECTURE.md` - System design
- `README-v5.0-DEVELOPMENT.md` - v5.0 changes
- `VSCODE-SETUP-COMPLETE.md` - VS Code configuration summary

**Bug Analysis:**
- `docs/bugs/node-counter-investigation.md` - Detailed bug analysis

**Architecture:**
- `docs/architecture/relationship-system.md` - Relationship system design

## Quick Start

### First Time Setup
```bash
cd /Users/gonzaloriederer/Documents/GitHub/mindmap-macos-app
npm install
npm start
```

### Verify Current State
1. App opens with Test-Relaciones-Vacio project
2. See 3 nodes (Nodo A, B, C) on canvas
3. Open relationship panel (right side)
4. Bug confirmed: Shows "130 nodos" instead of "4 nodos"

### Before Starting Work
1. Read `CLAUDE-HANDOFF-CONTEXT.md` for full context
2. Review active PRD in `tasks/`
3. Check current branch: `feature/v5.0-json-standardization`
4. Verify test project loads correctly

## Approval Keywords

**Task Flow Control:**
- **"Go"** → Proceed from Phase 2A to Phase 2B (generate sub-tasks)
- **"yes"** or **"y"** → Approve sub-task and continue to next
- **"Continue"** → Resume after pause
- **"Stop"** → Pause current work
- **"Show tasks"** → Display current progress

## Important Reminders

- Keep responses concise - Avoid unnecessary explanations
- Use TodoWrite tool for all multi-step tasks
- Show test output before marking complete
- Never skip tests - TDD is non-negotiable
- One sub-task at a time - Wait for approval
- Update task markdown files immediately when completing tasks
- Reference line numbers when discussing code (e.g., renderer.js:2449)
