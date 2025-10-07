# 🔧 Task: Fix Project Selector in PWC Mindmap Electron App

## 📋 Context

**Repository**: `/Users/gonzaloriederer/Documents/GitHub/mindmap-macos-app`
**MCP Server**: Integrated and working correctly (v2.1.0)
**Issue**: Project selector panel only shows "ENTRADA DE ESQUEMA" instead of loading all projects from `.metadata.json`

## ✅ What's Working

1. **MCP Natural Language Creation**: ✅ Working perfectly
   - Tool `create_mindmap_smart` creates mindmaps successfully
   - Files created in `/Users/gonzaloriederer/Documents/PWC Mindmaps/`
   - Example mindmaps created:
     - `Cloud Security.pmap` (2 nodes)
     - `Data Privacy Framework.pmap` (4 nodes)

2. **Node Metadata Fix**: ✅ Complete
   - `mcp-server/index.js` lines 479-503 correctly populates `nodes` object
   - Each node has: `{description: "", notes: "", images: [], showInfo: false}`
   - All .pmap files have proper structure

3. **Metadata File**: ✅ Correct
   - Location: `/Users/gonzaloriederer/Documents/PWC Mindmaps/.metadata.json`
   - Contains recent projects array with 7+ projects
   - Structure verified and valid

## ❌ Current Problem

**Project Selector Not Loading Dynamic Projects**

**What's Happening**:
- Panel "PROYECTOS" only shows hardcoded "ENTRADA DE ESQUEMA"
- Should show all projects from `.metadata.json`
- Code changes made but not reflecting in UI

**Expected Behavior**:
- Panel should list all recent projects from metadata
- Clicking a project should load its .pmap file content
- Should integrate with existing ProjectManager

## 🔍 Code Already Modified

### 1. `renderer.js` - Lines 2064-2123
**Function**: `async loadProjects()`
- Modified to call `window.electronAPI.projectManager.getRecentProjects(10)`
- Maps results to internal projects array
- **Issue**: May not be executing or API not available

### 2. `renderer.js` - Lines 2147-2214
**Function**: `async loadProject(projectId)`
- Added support for loading from .pmap files
- Uses `window.projectManager.loadProject(path)` when path exists
- **Status**: Should work once projects list is populated

### 3. `renderer.js` - Line 2381
**In DOMContentLoaded handler**:
```javascript
// Reload projects list from .metadata.json
await window.mindmapRenderer.loadProjects();
```
- Called AFTER ProjectManager initialization
- Should trigger project list refresh

### 4. `renderer.js` - Constructor (Lines 347-355)
- Removed duplicate `loadProjects()` call from constructor
- Now only loads after ProjectManager is ready

## 🎯 Your Task

**Fix the project selector to dynamically load and display all projects from `.metadata.json`**

### Requirements:

1. **Verify API Availability**
   - Check if `window.electronAPI.projectManager` is properly exposed
   - Review `preload.js` lines 11-29 for API definitions
   - Ensure IPC handlers in `main.js` are working

2. **Debug Execution Flow**
   - Add console.logs to trace execution
   - Verify `loadProjects()` is being called
   - Check if `getRecentProjects()` returns data
   - Confirm `renderProjects()` is updating DOM

3. **Fix Race Conditions**
   - Ensure ProjectManager is initialized before loading projects
   - Verify DOMContentLoaded timing
   - Check if `window.projectManager` exists when needed

4. **Test Integration**
   - Verify projects appear in "PROYECTOS" panel
   - Test clicking projects loads correct content
   - Ensure "Cloud Security" and "Data Privacy Framework" are visible

## 📁 Key Files to Review

```
/Users/gonzaloriederer/Documents/GitHub/mindmap-macos-app/
├── main.js                    # Electron main process, IPC handlers
├── preload.js                 # API exposure (lines 11-29)
├── renderer.js                # UI logic
│   ├── Lines 2064-2123       # loadProjects() method
│   ├── Lines 2147-2214       # loadProject() method
│   ├── Lines 2125-2145       # renderProjects() method
│   └── Lines 2319-2390       # DOMContentLoaded handler
├── project-manager.js         # Backend ProjectManager class
│   └── Lines 282-299         # getRecentProjects() implementation
└── mcp-server/
    └── index.js               # MCP server (working correctly)
```

## 🔧 Debugging Steps

1. **Open DevTools** (⌘+Shift+I in the app)
2. **Check Console** for:
   - "Loaded recent projects:" log
   - "Converted projects:" log
   - Any errors related to ProjectManager
3. **Verify in Console**:
   ```javascript
   window.electronAPI?.projectManager
   window.projectManager
   window.mindmapRenderer.projects
   ```

## 🎯 Success Criteria

- [ ] Project panel shows all projects from `.metadata.json`
- [ ] "Cloud Security" visible in list
- [ ] "Data Privacy Framework" visible in list
- [ ] Clicking project loads its content from .pmap file
- [ ] No hardcoded projects except optional "ENTRADA DE ESQUEMA" fallback

## 📝 Additional Notes

- **Don't modify** `mcp-server/index.js` (already working)
- **Don't modify** `.metadata.json` structure
- **Test with** existing .pmap files in PWC Mindmaps folder
- **Maintain** backward compatibility with localStorage projects

## 🚀 Recommended Approach (Use Claude.md Workflow)

1. **Use Task agent** for multi-step debugging
2. **Create TodoWrite** list with:
   - Verify API exposure in preload.js
   - Add debug logging to loadProjects()
   - Test getRecentProjects() call
   - Fix DOM rendering if needed
   - Test end-to-end functionality
3. **Use frontend-developer agent** if UI changes needed
4. **Run tests** after each change
5. **Commit** when working

## 📍 Current State Files

**Test Data Available**:
- `/Users/gonzaloriederer/Documents/PWC Mindmaps/Cloud Security.pmap`
- `/Users/gonzaloriederer/Documents/PWC Mindmaps/Data Privacy Framework.pmap`
- `/Users/gonzaloriederer/Documents/PWC Mindmaps/.metadata.json`

**App Launch**:
```bash
cd ~/Documents/GitHub/mindmap-macos-app
npm start
```

Good luck! 🎯
