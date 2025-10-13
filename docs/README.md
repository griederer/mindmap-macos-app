# PWC Mindmap Pro - Documentation

## Quick Navigation

### For Developers

**Getting Started:**
- [Main README](../README.md) - Project overview and quick start
- [Development Guide](development/setup.md) - Development environment setup
- [Contributing Guidelines](../CONTRIBUTING.md) - How to contribute
- [Architecture Overview](../ARCHITECTURE.md) - System design and structure

**Current Focus:**
- [Relationship System Design](architecture/relationship-system.md) - v5.0 architecture
- [v5.0 Development Notes](../README-v5.0-DEVELOPMENT.md) - Migration to v5.0

### For Claude Code Sessions

**Essential Context:**
- [CLAUDE.md](../CLAUDE.md) - Project configuration for Claude Code
- [Handoff Context](claude/CLAUDE-HANDOFF-CONTEXT.md) - Complete debugging context
- [Session Prompt](claude/CLAUDE-SESSION-PROMPT.md) - Session initialization
- [VS Code Setup](claude/VSCODE-SETUP-COMPLETE.md) - IDE configuration summary

### Bug Investigation

**Active Issues:**
- [Node Counter Bug](bugs/node-counter-investigation.md) - Detailed analysis of counting bug

### Product Requirements

**Active PRDs:**
- [Relationship System Fixes](../tasks/0001-prd-relationship-system-fixes.md) - Current focus (34KB)

**Historical PRDs:**
- [Info Panel Image Fix](prds/info-panel-image-display-fix.md)
- [Image Lightbox Feature](prds/image-lightbox-feature.md)

**Task Lists:**
- [Task Archives](tasks/) - Historical task breakdowns

### Guides and Tutorials

**User Guides:**
- [Presentation Mode Demo](guides/DEMO-PRESENTATION-MODE.md)
- [Presentation Guide](guides/GUIA-PRESENTACION.md)
- [Visual Tutorial](guides/TUTORIAL-VISUAL-PRESENTACION.md)

### Technical Specifications

**Data Formats:**
- [Mindmap Format Spec](specs/MINDMAP_FORMAT.md) - .pmap file format
- [Schema Definition](specs/SCHEMA.md) - Data schema
- [MCP Server Design](specs/MCP-SERVER-DESIGN.md) - MCP integration

**Policies:**
- [Responsible AI](specs/ia-responsable.md)
- [ESG Sustainability](specs/sostenibilidad-esg.md)

### Implementation Notes

**Feature Implementations:**
- [Project Manager](development/PROJECT-MANAGER-IMPLEMENTATION.md)
- [Project Selector Fix](development/FIX-PROJECT-SELECTOR.md)
- [Sync Fix](development/SYNC-FIX-IMPLEMENTATION.md)
- [Problem Analysis](development/PROBLEMA_PROYECTOS.md)

### Testing

**Test Documentation:**
- [Phase 1 Test Results](testing/TEST-PHASE-1-RESULTS.md)
- [Slide Capture Tests](testing/TEST-SLIDE-CAPTURE.md)
- [Testing Results Summary](TESTING_RESULTS.md)

## Documentation Structure

```
docs/
├── README.md                    # This file
├── architecture/                # System design documents
│   └── relationship-system.md
├── bugs/                        # Bug investigation notes
│   └── node-counter-investigation.md
├── claude/                      # Claude Code session context
│   ├── CLAUDE-HANDOFF-CONTEXT.md
│   ├── CLAUDE-SESSION-PROMPT.md
│   └── VSCODE-SETUP-COMPLETE.md
├── development/                 # Implementation notes
│   ├── setup.md
│   ├── FIX-PROJECT-SELECTOR.md
│   ├── PROBLEMA_PROYECTOS.md
│   ├── PROJECT-MANAGER-IMPLEMENTATION.md
│   └── SYNC-FIX-IMPLEMENTATION.md
├── guides/                      # User guides and tutorials
│   ├── DEMO-PRESENTATION-MODE.md
│   ├── GUIA-PRESENTACION.md
│   └── TUTORIAL-VISUAL-PRESENTACION.md
├── prds/                        # Product requirements (historical)
│   ├── info-panel-image-display-fix.md
│   └── image-lightbox-feature.md
├── specs/                       # Technical specifications
│   ├── MINDMAP_FORMAT.md
│   ├── SCHEMA.md
│   ├── MCP-SERVER-DESIGN.md
│   ├── ia-responsable.md
│   └── sostenibilidad-esg.md
├── tasks/                       # Task list archives
│   ├── tasks-info-panel-fix.md
│   └── tasks-image-lightbox.md
└── testing/                     # Test documentation
    ├── TEST-PHASE-1-RESULTS.md
    └── TEST-SLIDE-CAPTURE.md
```

## Active Work

**Current Branch:** `feature/v5.0-json-standardization`

**Current Focus:** Fixing relationship system bugs in v5.0
- Node counter showing incorrect values
- Data loading consistency issues
- Relationship workflow validation

**Active PRD:** [0001-prd-relationship-system-fixes.md](../tasks/0001-prd-relationship-system-fixes.md)

**Timeline:** 4-week implementation plan (currently Phase 1)

## Finding What You Need

### I want to...

**Understand the codebase:**
→ Start with [Architecture Overview](../ARCHITECTURE.md)

**Fix a bug:**
→ Check [Bug Investigation](bugs/) for existing analysis
→ Review [Handoff Context](claude/CLAUDE-HANDOFF-CONTEXT.md) for current issues

**Implement a feature:**
→ Read relevant [PRD](../tasks/)
→ Follow [Development Guide](development/setup.md)
→ Check [Contributing Guidelines](../CONTRIBUTING.md)

**Set up development environment:**
→ Follow [Development Setup](development/setup.md)
→ Review [VS Code Setup](claude/VSCODE-SETUP-COMPLETE.md)

**Understand v5.0 changes:**
→ Read [v5.0 Development Notes](../README-v5.0-DEVELOPMENT.md)
→ Review [Relationship System Architecture](architecture/relationship-system.md)
