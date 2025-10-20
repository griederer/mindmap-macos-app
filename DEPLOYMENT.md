# PWC Mindmap Pro - Deployment Guide

## 📋 Current Status

**Repository**: mindmap-macos-app
**Latest Stable**: v5.1.2
**Latest Dev**: v6.0.0-dev
**Main Branch**: main (v5.1.2+)

---

## 🌳 Branch Strategy

### Production Branches

#### `main` (Production)
- **Current Version**: v5.1.2+
- **Latest Tag**: v5.1.2
- **Status**: ✅ Stable
- **Purpose**: Production-ready code
- **Features**:
  - Video upload and playback with loop control
  - Focus mode with camera auto-focus
  - Relationships with enhanced visual prominence
  - All v5.x features

#### `develop` (Pre-Release)
- **Current Version**: v5.1.x
- **Status**: ✅ Stable
- **Purpose**: Integration branch for tested features
- **Merge Target**: main

---

### Feature Branches

#### `version/6-clean-slate` (Major Rewrite)
- **Version**: v6.0.0-dev
- **Tag**: v6.0.0-dev
- **Status**: 🚧 In Development
- **Purpose**: Complete presentation system removal and cleanup
- **Breaking Changes**:
  - Removed presentation mode entirely
  - Cleaned up renderer.js (removed presentation UI)
  - Cleaned up mindmap-engine.js (removed presentation logic)
  - Cleaned up styles.css (removed presentation CSS)
  - Restored checkbox event listeners for categories/relationships

#### `feature/v5.0-json-standardization`
- **Status**: ✅ Merged to main
- **Purpose**: JSON format standardization (completed)

#### `feature/theme-overhaul`
- **Tag**: v1.0-stable (legacy)
- **Status**: ⚠️ Experimental
- **Purpose**: Legacy theme experiments
- **Note**: Do not use - merged functionality in main

#### `feature/camera-system-redesign`
- **Status**: 🚧 Paused
- **Purpose**: Camera system improvements

#### `feature/video-support`
- **Status**: ✅ Merged to main (v5.0.0)

#### `feature/wcag-accessibility-overhaul`
- **Status**: 🚧 Not started

---

### Bug Fix Branches

#### `focus-mode-fix`
- **Status**: ⚠️ Has stashed changes
- **Purpose**: Focus mode camera integration fixes
- **Stash**: `WIP on focus-mode-fix: 103abf7`

#### `capture-button-fix`
- **Status**: 🔧 Active fix branch

---

### Backup Branches

#### `backup/v3.3.1-20251003-182903`
- **Version**: v3.3.1
- **Date**: October 3, 2025
- **Purpose**: Safety backup before major changes

---

## 📦 Version History

### Latest Versions

| Version | Date | Tag | Branch | Status |
|---------|------|-----|--------|--------|
| **v6.0.0-dev** | Oct 13 | `v6.0.0-dev` | `version/6-clean-slate` | 🚧 Development |
| **v5.1.2** | Oct 13 | `v5.1.2` | `main` | ✅ **CURRENT STABLE** |
| **v5.1.1** | Oct 13 | `v5.1.1` | `main` | ✅ Stable |
| **v5.1.0** | Oct 13 | `v5.1.0` | `main` | ✅ Stable |
| v4.1.0 | Oct 7 | `v4.1.0` | `main` | ✅ Stable |
| v4.0.0 | Oct 7 | `v4.0.0` | `main` | ✅ Stable |
| v3.3.1 | Oct 1 | `v3.3.1` | backup | 🔒 Archived |
| v3.3.0 | Sep 30 | `v3.3.0-stable` | - | 🔒 Archived |

---

## 🚀 Deployment Workflow

### For Stable Releases (v5.x → v5.x+1)

1. **Feature Development**
   ```bash
   git checkout -b feature/my-feature develop
   # Develop and test
   git commit -m "feat: description"
   ```

2. **Merge to Develop**
   ```bash
   git checkout develop
   git merge --no-ff feature/my-feature
   npm test
   ```

3. **Release to Main**
   ```bash
   git checkout main
   git merge --no-ff develop
   npm version minor  # or patch/major
   git push origin main --tags
   ```

4. **Tag Version**
   ```bash
   git tag -a v5.x.x -m "Release v5.x.x: Description"
   git push origin v5.x.x
   ```

---

### For Major Version (v6.0.0)

**Branch**: `version/6-clean-slate`

**Current Status**:
- ✅ Presentation system removed
- ✅ Code cleanup complete
- 🚧 Testing required before merge

**Merge Steps** (when ready):
```bash
# 1. Ensure all tests pass
cd ~/Documents/GitHub/mindmap-macos-app
git checkout version/6-clean-slate
npm test

# 2. Update version
npm version major  # 6.0.0

# 3. Merge to main
git checkout main
git merge --no-ff version/6-clean-slate

# 4. Tag and push
git tag -a v6.0.0 -m "Release v6.0.0: Clean slate - presentation system removed"
git push origin main --tags
```

---

## 📝 Version Naming Convention

### Tags Format
- **Stable releases**: `vX.Y.Z` (e.g., v5.1.2)
- **Development snapshots**: `vX.Y.Z-dev` (e.g., v6.0.0-dev)
- **Stable backups**: `vX.Y.Z-stable` (e.g., v3.3.0-stable)

### Branch Format
- **Features**: `feature/description` (e.g., feature/video-support)
- **Versions**: `version/X-description` (e.g., version/6-clean-slate)
- **Fixes**: `fix-name` (e.g., focus-mode-fix)
- **Backups**: `backup/vX.Y.Z-YYYYMMDD-HHMMSS`

---

## 🔍 Current Changelog Summary

### v5.1.2 (Latest Stable)
- Bug fixes from v5.1.1

### v5.1.1
- Presentation mode reset fixes
- Image rendering improvements

### v5.1.0 (October 13, 2025)
- **Video loop control** - Toggle automatic video looping
- Per-video loop settings
- Auto-migration from v5.0

### v5.0.0 (October 13, 2025)
- **Video upload support** (MP4/WebM, max 30s/10MB)
- Hybrid storage system (base64 / external .media/)
- Automatic thumbnail generation
- Enhanced VideoManager class
- Project format v5.0

### v4.1.0
- Enhanced relationship visual prominence

### v4.0.0 (October 7, 2025)
- MCP server integration
- Natural language mindmap creation
- Categories and relationships
- Focus mode
- Custom node positioning

---

## 📋 Release Checklist

Before tagging a new version:

- [ ] All tests passing (`npm test`)
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] README.md version updated
- [ ] No console errors in app
- [ ] Manual testing on macOS
- [ ] Video features tested (if applicable)
- [ ] MCP server compatibility verified
- [ ] Migration from previous version tested

---

## 🔧 Emergency Rollback

If v6.0.0 causes issues, rollback to v5.1.2:

```bash
git checkout v5.1.2
git checkout -b emergency/rollback-v6
npm install
npm start
```

Or restore from backup:
```bash
git checkout backup/v3.3.1-20251003-182903
```

---

## 📊 Branch Health Status

| Branch | Health | Last Commit | Notes |
|--------|--------|-------------|-------|
| `main` | ✅ Healthy | Focus mode auto-focus | Production ready |
| `develop` | ✅ Healthy | Relationship enhancements | Ready for features |
| `version/6-clean-slate` | ⚠️ Testing | Presentation cleanup | Needs testing before merge |
| `focus-mode-fix` | ⚠️ Stashed | Has uncommitted work | Resolve stash before merge |
| `feature/theme-overhaul` | ❌ Stale | v1.0-stable tag | Do not use |

---

**Last Updated**: October 20, 2025
**Maintainer**: Gonzalo Riederer
**Documentation**: See CHANGELOG.md for detailed version history
