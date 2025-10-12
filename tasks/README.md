# Tasks and PRDs

This directory contains Product Requirement Documents (PRDs) and task tracking for the PWC Mindmap project.

## Structure

### PRD Format
- Filename: `[number]-prd-[feature-name].md`
- Example: `0001-prd-relationship-system-fixes.md`

### Task List Format
- Filename: `tasks-[number]-prd-[feature-name].md`
- Example: `tasks-0001-prd-relationship-system-fixes.md`
- Generated from corresponding PRD

## Active PRDs

### [0001-prd-relationship-system-fixes.md](./0001-prd-relationship-system-fixes.md)
**Status:** Draft
**Priority:** High
**Created:** 2025-10-11

Addresses critical bugs in relationship system:
- Node counter showing 130 instead of 4
- Data loading consistency causing crashes
- Complete workflow validation
- localStorage management

**Phases:**
1. Critical Bugs (Week 1)
2. Validation (Week 2)
3. Polish (Week 3)
4. Testing & Release (Week 4)

## Workflow

### Creating New PRD
1. Discuss feature requirements with team
2. Create new PRD: `[next-number]-prd-[feature-name].md`
3. Follow template structure
4. Get approval from stakeholders

### Generating Task List
1. Use PRD as source
2. Create: `tasks-[number]-prd-[feature-name].md`
3. Break into parent tasks (1.0, 2.0, 3.0)
4. Break into sub-tasks (1.1, 1.2, 1.3)
5. Each sub-task should be 15-60 minutes

### Implementing Tasks
1. Work on one sub-task at a time
2. Mark `[x]` when complete
3. Update "Relevant Files" section
4. Commit when parent task complete

## PRD Template Structure

1. Introduction
2. Goals
3. User Stories
4. Functional Requirements
5. Non-Goals (Out of Scope)
6. Design Considerations
7. Technical Considerations
8. Success Metrics
9. Open Questions
10. Timeline and Phases
11. Risk Assessment
12. Appendix
13. Approval and Sign-Off

## Quick Reference

- **View all PRDs:** `ls -la *.md | grep prd`
- **View task lists:** `ls -la tasks-*.md`
- **Current status:** See individual PRD status section
