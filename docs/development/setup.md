# Development Setup

## Prerequisites

- Node.js 18+
- Electron 27+
- macOS (target platform)
- VS Code (recommended)

## Installation

```bash
cd /Users/gonzaloriederer/Documents/GitHub/mindmap-macos-app
npm install
```

## Running the Application

```bash
npm start
```

Or use VS Code task: `Cmd+Shift+B` → "Start Electron App"

## Project Structure

```
mindmap-macos-app/
├── main.js                 # Electron main process
├── renderer.js             # Main UI logic (2967 lines)
├── mindmap-engine.js       # Core mindmap rendering (1547 lines)
├── project-manager.js      # Project file management
├── index.html              # Main app window
├── .vscode/                # VS Code configuration
│   ├── settings.json       # Editor settings
│   ├── tasks.json          # Build tasks
│   ├── launch.json         # Debug configurations
│   └── extensions.json     # Recommended extensions
├── docs/                   # Documentation
│   ├── architecture/       # Technical design
│   ├── development/        # Dev guides
│   └── bugs/               # Bug tracking
├── tasks/                  # PRDs and task lists
└── logs/                   # Debug sessions
```

## Development Workflow

### Running the App

**Method 1: npm command**
```bash
npm start
```

**Method 2: VS Code task**
- Press `Cmd+Shift+B`
- Select "Start Electron App"

**Method 3: VS Code debug**
- Press `F5`
- Select "Debug Main Process" or "Debug All"

### Restarting the App

When you make changes:

**Kill Electron processes:**
```bash
killall Electron
```

**Restart:**
```bash
npm start
```

**Or use VS Code task:**
- Press `Cmd+Shift+P`
- Type "Tasks: Run Task"
- Select "Restart Electron App"

### File Watching

The main process watches `/Users/gonzaloriederer/Documents/PWC Mindmaps/` for changes to `.pmap` files and auto-reloads when detected.

## Debugging

### Main Process
1. Press `F5` in VS Code
2. Select "Debug Main Process"
3. Set breakpoints in `main.js`

### Renderer Process
1. Start app with `npm start`
2. Press `Cmd+Option+I` in app to open DevTools
3. Use Console, Network, Sources tabs

### Both Processes
1. Press `F5` in VS Code
2. Select "Debug All"
3. Debug main and renderer simultaneously

## Testing

**Currently not set up**

Recommended setup:
- Jest for unit tests
- Spectron for E2E tests
- Coverage target: 80%+

## Code Style

### JavaScript
- Tab size: 2 spaces
- Format on save: enabled
- Trim trailing whitespace: enabled

### File Organization
- Main logic: `renderer.js`
- Rendering: `mindmap-engine.js`
- File operations: `project-manager.js`
- UI: `index.html`

## Common Tasks

### Create New Project
```bash
# Projects are stored in:
/Users/gonzaloriederer/Documents/PWC Mindmaps/

# Format: .pmap (JSON)
```

### Clear localStorage Cache
```javascript
// In DevTools console:
localStorage.clear();
// Then refresh app
```

### View Recent Projects
```bash
cat /Users/gonzaloriederer/Documents/PWC\ Mindmaps/.metadata.json
```

### Change Default Project
Edit `.metadata.json`:
```json
{
  "lastOpened": "/path/to/project.pmap",
  "recentProjects": [...]
}
```

## Troubleshooting

### App Won't Start
1. Check Electron processes: `ps aux | grep Electron`
2. Kill all: `killall Electron`
3. Check node_modules: `npm install`
4. Try: `npm start`

### Changes Not Showing
1. Clear localStorage (see above)
2. Restart app completely
3. Check DevTools console for errors

### Node Counter Shows Wrong Value
Known issue - see `/docs/bugs/node-counter-investigation.md`

## Resources

- [Electron Docs](https://www.electronjs.org/docs)
- [Node.js API](https://nodejs.org/api/)
- [VS Code Tasks](https://code.visualstudio.com/docs/editor/tasks)

## Next Steps

1. Set up testing framework
2. Add ESLint configuration
3. Configure Prettier
4. Set up git hooks with husky
5. Add CI/CD pipeline
