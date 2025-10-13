# Development Workflow - PWC Mindmap Pro v5.0

**Last Updated:** October 12, 2025
**Current Stable Version:** v5.0.0
**Repository:** [griederer/mindmap-macos-app](https://github.com/griederer/mindmap-macos-app)

## 🎯 Branch Strategy (Git Flow)

### Main Branches

```
main          ← Production-ready code (v5.0.0)
  └─ develop  ← Integration branch for features
      ├─ feature/feature-name
      ├─ bugfix/bug-name
      └─ hotfix/critical-fix
```

### Branch Types

| Branch Type | Purpose | Base Branch | Merge Into | Naming |
|-------------|---------|-------------|------------|--------|
| **main** | Production releases | - | - | `main` |
| **develop** | Development integration | `main` | `main` | `develop` |
| **feature/** | New features | `develop` | `develop` | `feature/feature-name` |
| **bugfix/** | Non-critical fixes | `develop` | `develop` | `bugfix/bug-description` |
| **hotfix/** | Critical production fixes | `main` | `main` + `develop` | `hotfix/critical-issue` |
| **release/** | Release preparation | `develop` | `main` + `develop` | `release/v5.x.x` |

## 🚀 Development Process

### 1. Starting New Feature

```bash
# Ensure develop is up to date
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name

# Work on feature
# ... make changes ...

# Commit following conventions
git add .
git commit -m "feat: add new feature description"
```

### 2. Working on Bug Fix

```bash
# For non-critical bugs
git checkout develop
git pull origin develop
git checkout -b bugfix/bug-description

# For critical production bugs (hotfix)
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-description
```

### 3. Testing Before Merge

```bash
# Run tests
npm test

# Run linter (if configured)
npm run lint

# Build to verify
npm run build

# Manual testing
npm start
```

### 4. Creating Pull Request

```bash
# Push feature branch
git push origin feature/your-feature-name

# Create PR on GitHub
# - Base: develop (for features/bugfixes)
# - Base: main (for hotfixes)
# - Add description with changes
# - Link related issues/PRDs
```

### 5. Merging to Develop

```bash
# After PR approval
git checkout develop
git pull origin develop
git merge --no-ff feature/your-feature-name
git push origin develop

# Delete feature branch (optional)
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

### 6. Release Process

```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v5.1.0

# Update version in package.json
npm version 5.1.0

# Final testing and bug fixes on release branch
# ... test thoroughly ...

# Merge to main
git checkout main
git merge --no-ff release/v5.1.0
git tag -a v5.1.0 -m "Release v5.1.0 - Description"
git push origin main --tags

# Merge back to develop
git checkout develop
git merge --no-ff release/v5.1.0
git push origin develop

# Delete release branch
git branch -d release/v5.1.0
```

## 📋 Commit Message Convention

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Build process, dependencies, tooling

### Examples

```bash
# Feature
git commit -m "feat(relationships): add visual line connections between nodes"

# Bug fix
git commit -m "fix(counter): correct node counter to use nodeData instead of nodes"

# Documentation
git commit -m "docs(workflow): add Git Flow development process guide"

# With body
git commit -m "feat(export): add PDF export functionality

- Implement PDF generation using electron-pdf
- Add export button to toolbar
- Support custom page sizes

Closes #123"
```

## 🧪 Testing Workflow

### Before Committing

```bash
# 1. Run unit tests
npm test

# 2. Check test coverage
npm run test:coverage
# Target: 80%+ coverage

# 3. Manual testing
npm start
# - Test main functionality
# - Test new feature
# - Test edge cases
```

### Test Files Structure

```
__tests__/
├── unit/
│   ├── mindmap-engine.test.js
│   └── project-manager.test.js
├── integration/
│   └── project-loading.test.js
└── fixtures/
    └── test-projects/
```

## 🔄 Workflow Examples

### Example 1: New Feature

```bash
# Start feature
git checkout develop
git pull origin develop
git checkout -b feature/node-export-pdf

# Develop with TDD
# 1. Write failing test
# 2. Implement feature
# 3. Make test pass
# 4. Refactor

# Commit work
git add .
git commit -m "feat(export): add PDF export for selected nodes"

# Push and create PR
git push origin feature/node-export-pdf
# → Create PR on GitHub: feature/node-export-pdf → develop

# After approval and merge
git checkout develop
git pull origin develop
git branch -d feature/node-export-pdf
```

### Example 2: Bug Fix

```bash
# Start bugfix
git checkout develop
git pull origin develop
git checkout -b bugfix/node-counter-incorrect

# Fix bug with test
npm test  # Should fail initially
# ... implement fix ...
npm test  # Should pass now

# Commit
git add .
git commit -m "fix(counter): use nodeData instead of cached nodes tree

- Corrects node counter in relationship panel
- Counter now shows accurate count
- Fixes issue where 130 nodes shown instead of 4

Related to PRD #0002"

# Push and create PR
git push origin bugfix/node-counter-incorrect
# → Create PR: bugfix/node-counter-incorrect → develop
```

### Example 3: Hotfix (Critical Production Bug)

```bash
# Start from main (production)
git checkout main
git pull origin main
git checkout -b hotfix/crash-on-startup

# Quick fix
# ... fix critical bug ...
npm test

# Commit
git add .
git commit -m "fix: resolve crash on app startup

Critical fix for null reference error in project loading.

BREAKING: This hotfix must be deployed immediately."

# Merge to main
git checkout main
git merge --no-ff hotfix/crash-on-startup
git tag -a v5.0.1 -m "Hotfix v5.0.1 - Startup crash fix"
git push origin main --tags

# Merge back to develop
git checkout develop
git merge --no-ff hotfix/crash-on-startup
git push origin develop

# Cleanup
git branch -d hotfix/crash-on-startup
```

## 🏷️ Version Numbering

### Semantic Versioning (SemVer)

Format: `MAJOR.MINOR.PATCH` (e.g., `5.2.3`)

- **MAJOR** (5.x.x): Breaking changes, incompatible API changes
- **MINOR** (x.2.x): New features, backwards-compatible
- **PATCH** (x.x.3): Bug fixes, backwards-compatible

### Current Version Status

- **Stable:** v5.0.0 (main branch)
- **Development:** v5.1.0-dev (develop branch)
- **Feature Branches:** v5.1.0-alpha

### Updating Version

```bash
# Patch release (5.0.0 → 5.0.1)
npm version patch

# Minor release (5.0.0 → 5.1.0)
npm version minor

# Major release (5.0.0 → 6.0.0)
npm version major
```

## 📊 Branch Status

### Current Branches

| Branch | Status | Version | Purpose |
|--------|--------|---------|---------|
| `main` | ✅ Stable | v5.0.0 | Production releases |
| `develop` | 🔄 Active | v5.1.0-dev | Integration branch |
| `feature/v5.0-json-standardization` | ⚠️ Merging | v5.0.0 | v5.0 format work |

### Stale Branches (To Review)

- `backup/v3.3.1-20251003-182903` - Backup branch (can archive)
- `feature/wcag-accessibility-overhaul` - Review and merge or close

## 🤖 CI/CD Pipeline (Future)

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop, main]

jobs:
  test:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run build

  release:
    needs: test
    runs-on: macos-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - run: npm run dist
      - uses: actions/upload-artifact@v3
        with:
          name: macos-dmg
          path: dist/*.dmg
```

## 📝 Pull Request Template

Create `.github/pull_request_template.md`:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Test coverage maintained (80%+)

## Checklist
- [ ] Code follows project style
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] Commit messages follow convention

## Related Issues
Closes #XXX
Related to PRD #XXXX
```

## 🔍 Code Review Process

### Before Requesting Review

1. **Self-review**: Read your own code changes
2. **Test**: All tests pass
3. **Build**: App builds successfully
4. **Manual test**: Feature works as expected
5. **Documentation**: Update relevant docs

### Review Checklist

- [ ] Code is clear and maintainable
- [ ] Tests cover new functionality
- [ ] No obvious bugs or security issues
- [ ] Performance impact considered
- [ ] Documentation updated
- [ ] Commit messages are clear

### Review Timeline

- **Small changes** (< 100 lines): 24 hours
- **Medium changes** (100-500 lines): 48 hours
- **Large changes** (> 500 lines): 72 hours

## 🚨 Emergency Procedures

### Critical Production Bug

1. **Create hotfix branch from main**
2. **Fix and test quickly**
3. **Merge to main immediately**
4. **Tag new patch version**
5. **Merge back to develop**
6. **Deploy to production**

### Rolling Back Release

```bash
# Revert to previous version
git checkout main
git revert <commit-hash>
git push origin main

# Or reset to previous tag
git reset --hard v5.0.0
git push origin main --force  # ⚠️ Use with caution
```

## 📚 Resources

### Essential Documents

- **[CLAUDE.md](CLAUDE.md)** - Project context for AI assistance
- **[README.md](README.md)** - Project overview and features
- **[ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md)** - System design
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines

### Tools

- **Git Flow CLI**: `brew install git-flow`
- **GitHub CLI**: `brew install gh`
- **Conventional Commits**: Use VS Code extension

## 💡 Tips

### Git Flow Commands

```bash
# Install git-flow
brew install git-flow

# Initialize git-flow (already done)
git flow init

# Start feature
git flow feature start feature-name

# Finish feature (merges to develop)
git flow feature finish feature-name

# Start release
git flow release start 5.1.0

# Finish release (merges to main + develop, tags)
git flow release finish 5.1.0
```

### Useful Git Commands

```bash
# Show current branch
git branch --show-current

# List recent commits
git log --oneline -10

# Undo last commit (keep changes)
git reset --soft HEAD~1

# View file changes
git diff HEAD

# Stash changes
git stash save "WIP: feature description"
git stash pop

# Cherry-pick commit
git cherry-pick <commit-hash>
```

## 🎯 Quick Reference

### Daily Workflow

```bash
# Morning
git checkout develop
git pull origin develop

# Start work
git checkout -b feature/my-feature
# ... code ...
npm test
git add .
git commit -m "feat: description"
git push origin feature/my-feature

# Create PR on GitHub
# Wait for review
# After approval, merge via GitHub UI

# End of day
git checkout develop
git pull origin develop
```

---

**Questions?** Open an issue or contact gonzaloriederer@gmail.com

**Version:** 1.0.0
**Last Updated:** October 12, 2025
