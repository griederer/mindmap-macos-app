# Contributing to PWC Mindmap Pro

Thank you for your interest in contributing to PWC Mindmap Pro! This guide will help you get started with development, understand our workflows, and make successful contributions.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Setup](#development-setup)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Coding Standards](#coding-standards)
6. [Testing Guidelines](#testing-guidelines)
7. [Commit Guidelines](#commit-guidelines)
8. [Pull Request Process](#pull-request-process)
9. [Release Process](#release-process)
10. [Getting Help](#getting-help)

---

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- **macOS**: 11.0 (Big Sur) or later
- **Node.js**: 18+ (LTS recommended)
- **npm**: 8+
- **Git**: 2.40+
- **Code Editor**: VS Code recommended
- **GitHub Account**: For pull requests

### Quick Start

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/mindmap-macos-app.git
cd mindmap-macos-app

# 2. Install dependencies
npm install
cd mcp-server && npm install && cd ..

# 3. Start development
npm start

# 4. Run tests
npm test
```

---

## Development Setup

### 1. Fork the Repository

1. Visit https://github.com/griederer/mindmap-macos-app
2. Click the "Fork" button in the top right
3. Clone your fork locally

### 2. Set Up Remotes

```bash
# Add upstream remote
git remote add upstream https://github.com/griederer/mindmap-macos-app.git

# Verify remotes
git remote -v
# origin    https://github.com/YOUR_USERNAME/mindmap-macos-app.git (fetch)
# origin    https://github.com/YOUR_USERNAME/mindmap-macos-app.git (push)
# upstream  https://github.com/griederer/mindmap-macos-app.git (fetch)
# upstream  https://github.com/griederer/mindmap-macos-app.git (push)
```

### 3. Install Development Tools

```bash
# Install global tools
npm install -g eslint prettier jest

# Install VS Code extensions (recommended)
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension orta.vscode-jest
```

### 4. Configure Your Environment

Create `.env` file in project root (optional):

```bash
# Unsplash API (for MCP image search)
UNSPLASH_ACCESS_KEY=your_key_here

# Development settings
DEBUG=pwc-mindmap:*
NODE_ENV=development
```

---

## Project Structure

```
mindmap-macos-app/
├── main.js                         # Electron main process
├── preload.js                      # Secure IPC bridge
├── renderer.js                     # UI logic & event handling
├── mindmap-engine.js               # Core mindmap algorithms
├── project-manager.js              # Backend project management
├── renderer-project-manager.js     # Frontend project integration
├── styles.css                      # Application styles
├── index.html                      # Main UI
├── package.json                    # Main app dependencies (v4.0.0)
│
├── mcp-server/                     # MCP Server
│   ├── index.js                    # MCP implementation
│   ├── package.json                # MCP dependencies (v4.0.0)
│   ├── MCP-COMPLETE-DOCUMENTATION.md
│   ├── NATURAL-LANGUAGE-GUIDE.md
│   ├── CHANGELOG.md
│   └── __tests__/
│       └── index.test.js
│
├── docs/                           # Documentation
│   ├── README.md                   # Main documentation
│   ├── SCHEMA.md                   # File format spec
│   ├── ARCHITECTURE.md             # Technical architecture
│   ├── CONTRIBUTING.md             # This file
│   ├── CHANGELOG.md                # Version history
│   └── MINDMAP_FORMAT.md           # Text import format
│
├── assets/                         # Static assets
│   └── icon.png                    # App icon
│
├── tests/                          # Test files (coming soon)
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── dist/                           # Build output (gitignored)
```

### Key Files

| File | Purpose | Lines | Language |
|------|---------|-------|----------|
| `main.js` | Electron main process, window mgmt, IPC | ~530 | JavaScript |
| `renderer.js` | UI logic, project panel, canvas rendering | ~2100 | JavaScript |
| `mindmap-engine.js` | Core algorithms, tree structure | ~800 | JavaScript |
| `project-manager.js` | CRUD operations, metadata sync | ~500 | JavaScript |
| `mcp-server/index.js` | MCP server, 17 tools | ~1200 | JavaScript |
| `styles.css` | All styles, animations | ~1500 | CSS |

---

## Development Workflow

### 1. Create a Feature Branch

```bash
# Sync with upstream
git checkout main
git fetch upstream
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### 2. Make Changes

```bash
# Start dev server (with hot reload)
npm start

# In another terminal, run tests in watch mode
npm run test:watch
```

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run specific test file
npm test -- project-manager.test.js

# Run with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

### 4. Commit Changes

```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat: add image compression to MCP server"
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Open Pull Request

1. Go to https://github.com/griederer/mindmap-macos-app
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill out PR template
5. Submit!

---

## Coding Standards

### JavaScript Style Guide

We follow **Airbnb JavaScript Style Guide** with some modifications.

#### General Principles

1. **Use ES6+ features** - Arrow functions, destructuring, template literals
2. **Prefer `const`** - Use `let` only when reassignment needed
3. **Avoid `var`** - Never use `var`
4. **Single quotes** - Use `'single quotes'` for strings
5. **Semicolons** - Always include semicolons
6. **2-space indentation** - Consistent across all files

#### Examples

**✅ Good**:
```javascript
// Use arrow functions
const calculateSum = (a, b) => a + b;

// Use destructuring
const { topic, nodes } = projectData;

// Use template literals
const message = `Project "${topic}" loaded successfully`;

// Use const for non-reassigned variables
const projectsDir = getProjectsDirectory();

// Proper async/await
async function loadProject(path) {
  try {
    const data = await readFile(path);
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load project:', error);
    throw error;
  }
}
```

**❌ Bad**:
```javascript
// Don't use function declarations for simple functions
function calculateSum(a, b) {
  return a + b;
}

// Don't use manual property access
var topic = projectData.topic;
var nodes = projectData.nodes;

// Don't use string concatenation
var message = "Project \"" + topic + "\" loaded successfully";

// Don't use var
var projectsDir = getProjectsDirectory();

// Don't use .then() chains (prefer async/await)
function loadProject(path) {
  return readFile(path)
    .then(data => JSON.parse(data))
    .catch(error => {
      console.error('Failed to load project:', error);
      throw error;
    });
}
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| **Variables** | camelCase | `projectData`, `nodeId` |
| **Constants** | UPPER_SNAKE_CASE | `MAX_NODES`, `DEFAULT_ZOOM` |
| **Functions** | camelCase | `loadProject()`, `calculatePosition()` |
| **Classes** | PascalCase | `ProjectManager`, `MindmapEngine` |
| **Files** | kebab-case | `project-manager.js`, `mindmap-engine.js` |
| **Components** | PascalCase (if React) | `NodeComponent.jsx` |

### File Organization

```javascript
// 1. Imports (grouped and sorted)
const fs = require('fs');
const path = require('path');

const { ipcMain } = require('electron');
const chokidar = require('chokidar');

const ProjectManager = require('./project-manager');
const { parseOutline } = require('./mindmap-engine');

// 2. Constants
const DEFAULT_ZOOM = 1.0;
const MAX_NODES = 10000;

// 3. Module-level variables
let mainWindow = null;
let projectsWatcher = null;

// 4. Functions (grouped by purpose)
// --- Window Management ---
function createWindow() { ... }
function destroyWindow() { ... }

// --- File Operations ---
function openFile() { ... }
function saveFile() { ... }

// --- IPC Handlers ---
ipcMain.handle('pm-load-project', async (event, { path }) => { ... });

// 5. Exports
module.exports = { createWindow, openFile };
```

### Comments

```javascript
// ✅ Good: Explain WHY, not WHAT
// Use awaitWriteFinish to prevent reading partially-written files
// This prevents corruption when MCP server writes large .pmap files
awaitWriteFinish: {
  stabilityThreshold: 500,
  pollInterval: 100
}

// ❌ Bad: States the obvious
// Set stability threshold to 500
awaitWriteFinish: {
  stabilityThreshold: 500
}
```

### Error Handling

```javascript
// ✅ Good: Specific error messages, proper propagation
async function loadProject(projectPath) {
  if (!projectPath) {
    throw new Error('Project path is required');
  }

  if (!fs.existsSync(projectPath)) {
    throw new Error(`Project file not found: ${projectPath}`);
  }

  try {
    const content = fs.readFileSync(projectPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in project file: ${projectPath}`);
    }
    throw new Error(`Failed to load project: ${error.message}`);
  }
}

// ❌ Bad: Swallows errors, generic messages
async function loadProject(projectPath) {
  try {
    const content = fs.readFileSync(projectPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.log('Error');
    return null;  // Don't return null on error!
  }
}
```

---

## Testing Guidelines

### Test Structure

We use **Jest** for all testing.

```javascript
// project-manager.test.js
const ProjectManager = require('../project-manager');
const fs = require('fs');
const path = require('path');

describe('ProjectManager', () => {
  let pm;
  let testDir;

  beforeEach(() => {
    // Setup: Create test directory
    testDir = fs.mkdtempSync(path.join(__dirname, 'test-'));
    pm = new ProjectManager(testDir);
  });

  afterEach(() => {
    // Teardown: Clean up test directory
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  describe('createProject()', () => {
    test('creates valid .pmap file with correct structure', () => {
      const result = pm.createProject('Test Project', {});

      expect(result.path).toMatch(/\.pmap$/);
      expect(result.projectData).toHaveProperty('topic', 'Test Project');
      expect(result.projectData).toHaveProperty('version', '4.0.0');
      expect(result.projectData.nodes).toBeInstanceOf(Array);

      // Verify file exists on disk
      expect(fs.existsSync(result.path)).toBe(true);
    });

    test('throws error for invalid project name', () => {
      expect(() => {
        pm.createProject('', {});
      }).toThrow('Project name is required');

      expect(() => {
        pm.createProject(null, {});
      }).toThrow('Project name is required');
    });
  });

  describe('loadProject()', () => {
    test('loads existing project correctly', () => {
      // Arrange: Create test project
      const { path: projectPath } = pm.createProject('Test', {});

      // Act: Load it
      const data = pm.loadProject(projectPath);

      // Assert: Verify structure
      expect(data).toHaveProperty('topic', 'Test');
      expect(data.version).toBe('4.0.0');
    });

    test('throws error for non-existent project', () => {
      expect(() => {
        pm.loadProject('/non/existent/path.pmap');
      }).toThrow('Project file not found');
    });
  });
});
```

### Test Coverage Goals

| Component | Coverage Target | Priority |
|-----------|----------------|----------|
| **Core Logic** | 90%+ | High |
| **MCP Server** | 90%+ | High |
| **Project Manager** | 90%+ | High |
| **UI Rendering** | 70%+ | Medium |
| **Utilities** | 85%+ | Medium |

### Running Tests

```bash
# All tests
npm test

# Watch mode (re-run on changes)
npm run test:watch

# With coverage report
npm run test:coverage

# Specific test file
npm test -- project-manager.test.js

# Specific test suite
npm test -- --testNamePattern="createProject"
```

---

## Commit Guidelines

### Conventional Commits

We use **Conventional Commits** specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(mcp): add image compression tool` |
| `fix` | Bug fix | `fix(renderer): correct project panel loading` |
| `docs` | Documentation only | `docs(readme): update installation steps` |
| `style` | Code style (formatting) | `style(renderer): fix indentation` |
| `refactor` | Code change (no feat/fix) | `refactor(engine): simplify node positioning` |
| `perf` | Performance improvement | `perf(canvas): optimize connection rendering` |
| `test` | Add/update tests | `test(pm): add unit tests for deleteProject` |
| `chore` | Build/tooling changes | `chore(deps): update electron to 28.2.0` |

### Scope

Optional, indicates component:

- `mcp` - MCP server
- `renderer` - Renderer process
- `main` - Main process
- `engine` - Mindmap engine
- `pm` - Project manager
- `ui` - UI/styles
- `docs` - Documentation

### Examples

```bash
# Feature with scope
git commit -m "feat(mcp): add smart mindmap creation tool"

# Bug fix with detailed body
git commit -m "fix(renderer): correct project panel not updating

- Load projects from .metadata.json instead of hardcoded list
- Handle IPC response format { success, projects }
- Update projects array in renderer state

Fixes #42"

# Documentation
git commit -m "docs(schema): add comprehensive .pmap format documentation"

# Breaking change
git commit -m "feat(mcp): change tool response format

BREAKING CHANGE: All MCP tools now return { success, data } instead of raw data.
Update clients to handle new format."
```

### Commit Message Rules

1. **Subject line**:
   - Max 72 characters
   - Lowercase type and scope
   - Imperative mood ("add" not "added")
   - No period at end

2. **Body** (optional):
   - Explain WHAT and WHY, not HOW
   - Wrap at 72 characters
   - Separate from subject with blank line

3. **Footer** (optional):
   - Reference issues: `Fixes #123`, `Closes #456`
   - Note breaking changes: `BREAKING CHANGE: ...`

---

## Pull Request Process

### 1. Before Opening PR

Checklist:

- [ ] Tests pass: `npm test`
- [ ] Linting passes: `npm run lint`
- [ ] Code formatted: `npm run format`
- [ ] Documentation updated (if needed)
- [ ] CHANGELOG.md updated (for features/fixes)
- [ ] Commits follow conventional format
- [ ] Branch is up-to-date with `main`

### 2. PR Template

When opening a PR, include:

```markdown
## Description

Brief description of changes.

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issues

Fixes #123
Related to #456

## Testing

Describe testing done:

- [ ] Unit tests added/updated
- [ ] Manual testing performed
- [ ] MCP server tested with Claude Code
- [ ] Electron app tested on macOS 11+

## Screenshots (if applicable)

[Include screenshots for UI changes]

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
- [ ] CHANGELOG.md updated
```

### 3. Review Process

1. **Automated checks** - CI runs tests and linting
2. **Code review** - Maintainer reviews changes
3. **Feedback** - Address review comments
4. **Approval** - Maintainer approves PR
5. **Merge** - Squash and merge to main

### 4. After Merge

- [ ] Delete feature branch (locally and remote)
- [ ] Pull latest main
- [ ] Verify changes in main branch

```bash
# Clean up after merge
git checkout main
git pull upstream main
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

---

## Release Process

### Version Numbering

We use **Semantic Versioning** (semver):

```
MAJOR.MINOR.PATCH

4.0.0
│ │ │
│ │ └─ Patch: Bug fixes
│ └─── Minor: New features (backward compatible)
└───── Major: Breaking changes
```

### Release Workflow

**For maintainers only**:

1. **Update versions**:
   ```bash
   # Main app
   npm version minor  # or major/patch

   # MCP server
   cd mcp-server
   npm version minor
   cd ..
   ```

2. **Update CHANGELOG.md**:
   ```markdown
   ## [4.1.0] - 2025-10-15

   ### Added
   - Image compression in MCP server (#123)
   - Export to PDF feature (#145)

   ### Fixed
   - Project panel loading issue (#142)

   ### Changed
   - Improved Canvas rendering performance
   ```

3. **Commit and tag**:
   ```bash
   git add .
   git commit -m "chore: release v4.1.0"
   git tag -a v4.1.0 -m "Release v4.1.0"
   git push origin main --tags
   ```

4. **Build distribution**:
   ```bash
   npm run dist
   ```

5. **Create GitHub release**:
   - Go to Releases → New Release
   - Select tag `v4.1.0`
   - Copy CHANGELOG section
   - Upload `.dmg` file
   - Publish release

---

## Getting Help

### Resources

- **Documentation**: See [README.md](README.md), [SCHEMA.md](SCHEMA.md), [ARCHITECTURE.md](ARCHITECTURE.md)
- **Issues**: https://github.com/griederer/mindmap-macos-app/issues
- **Discussions**: https://github.com/griederer/mindmap-macos-app/discussions
- **Email**: gonzaloriederer@gmail.com

### Common Issues

#### Issue: Tests failing locally

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Jest cache
npm test -- --clearCache
```

#### Issue: Electron won't start

```bash
# Rebuild native dependencies
npm run rebuild

# Or reinstall electron
npm uninstall electron
npm install electron@28.1.0
```

#### Issue: MCP server not connecting

```bash
# Check MCP config
cat ~/.claude-code/mcp-config.json

# Verify absolute path
# Make sure path doesn't have ~, use full /Users/... path

# Test server standalone
cd mcp-server
node index.js
```

### Questions?

If you have questions:

1. **Check existing documentation** first
2. **Search existing issues** - Your question may be answered
3. **Open a discussion** - For general questions
4. **Open an issue** - For bugs or feature requests

---

## Code of Conduct

### Our Standards

- ✅ Be respectful and inclusive
- ✅ Welcome newcomers and help them learn
- ✅ Focus on constructive feedback
- ✅ Respect differing opinions
- ✅ Accept responsibility for mistakes

### Our Responsibilities

Maintainers will:

- Clarify standards of acceptable behavior
- Take fair corrective action when needed
- Remove/reject inappropriate contributions
- Communicate reasons for moderation decisions

### Enforcement

Unacceptable behavior may result in:

1. **Warning** - First offense
2. **Temporary ban** - Repeated offenses
3. **Permanent ban** - Severe violations

Report issues to: gonzaloriederer@gmail.com

---

## Recognition

### Contributors

Thank you to everyone who has contributed to PWC Mindmap Pro!

See [Contributors](https://github.com/griederer/mindmap-macos-app/graphs/contributors) for the full list.

### How We Recognize Contributions

- **Code contributions** - Listed in GitHub contributors
- **Documentation** - Credited in CHANGELOG
- **Bug reports** - Mentioned in release notes
- **Feature ideas** - Acknowledged in feature commits

---

## License

By contributing, you agree that your contributions will be licensed under the **MIT License**.

See [LICENSE](LICENSE) for full terms.

---

**Thank you for contributing to PWC Mindmap Pro! 🎉**

Every contribution, no matter how small, makes this project better for everyone.
