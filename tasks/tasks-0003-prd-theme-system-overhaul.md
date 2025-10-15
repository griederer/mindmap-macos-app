# Task List: Theme System Overhaul

**PRD**: 0003-prd-theme-system-overhaul.md
**Feature**: Enhanced Theme System - Normal & Dark Mode Only
**Branch**: `feature/theme-overhaul`
**Estimated Duration**: 6 days

---

## Relevant Files

### Core Files:
- `themes.css` - MODIFY - Complete theme system rewrite
- `mindmap-engine.js` - MODIFY - Theme-aware relationship labels
- `index.html` - MODIFY - Update theme selector UI
- `renderer.js` - MODIFY - Remove unused theme logic
- `styles.css` - MODIFY - Ribbon and modal component styles

### Test Files:
- `__tests__/theme-contrast.test.js` - NEW - Automated contrast tests

### Reference Files:
- `0003-prd-theme-system-overhaul.md` - Complete PRD with specs
- Screenshots from user showing visibility issues

### Notes:
- All tests placed in `__tests__/` directory
- Run tests: `npm test`
- Follow TDD: Red → Green → Refactor
- Use WCAG contrast checker: https://webaim.org/resources/contrastchecker/

---

## Tasks

### Phase 1: Theme Cleanup & Preparation

- [ ] **1.0 Remove unused themes from CSS**
  - [ ] 1.1 Read themes.css file to understand current structure
  - [ ] 1.2 Remove `body[data-theme="blueprint"]` block (lines 47-91)
  - [ ] 1.3 Remove `body[data-theme="monochrome"]` block (lines 129-165)
  - [ ] 1.4 Remove blueprint grid pattern styles (lines 84-90)
  - [ ] 1.5 Verify only `:root` and `body[data-theme="dark"]` remain
  - [ ] 1.6 Test theme.css syntax is valid (no missing braces)
  - [ ] 1.7 Commit: "refactor(themes): remove blueprint and monochrome themes"

- [ ] **2.0 Update theme selector UI**
  - [ ] 2.1 Read index.html to locate theme selector
  - [ ] 2.2 Remove blueprint and monochrome buttons from HTML
  - [ ] 2.3 Add text labels to theme buttons ("Normal", "Dark")
  - [ ] 2.4 Update theme button titles/tooltips
  - [ ] 2.5 Test theme selector renders with 2 buttons only
  - [ ] 2.6 Verify active state shows correctly
  - [ ] 2.7 Test responsive behavior (labels hide on mobile)

- [ ] **3.0 Clean up theme switcher logic**
  - [ ] 3.1 Read renderer.js to find theme switching code
  - [ ] 3.2 Remove references to "blueprint" theme
  - [ ] 3.3 Remove references to "monochrome" theme
  - [ ] 3.4 Ensure only "default" and "dark" themes work
  - [ ] 3.5 Test theme switching between Normal ↔ Dark
  - [ ] 3.6 Test theme persistence after app restart
  - [ ] 3.7 Verify no console errors when switching

### Phase 2: Enhanced Color Palettes

- [ ] **4.0 Implement improved Dark Mode palette**
  - [ ] 4.1 Read current Dark Mode variables in themes.css
  - [ ] 4.2 Update background colors (darker main, lighter panels)
  - [ ] 4.3 Update text colors (brighter for better contrast)
  - [ ] 4.4 Update border colors (more visible)
  - [ ] 4.5 Add new variables: --bg-input, --bg-modal, --text-placeholder
  - [ ] 4.6 Add label-specific variables: --label-bg, --label-text, --label-border
  - [ ] 4.7 Increase relationship line opacity (0.4 → 0.6, 0.7 → 0.9)
  - [ ] 4.8 Test Dark Mode displays correctly in app

- [ ] **5.0 Refine Normal (Light) Mode palette**
  - [ ] 5.1 Read current :root variables in themes.css
  - [ ] 5.2 Increase panel opacity (0.85 → 0.95)
  - [ ] 5.3 Darken borders for better definition (#e0e0e0 → #d0d0d0)
  - [ ] 5.4 Add new variables matching Dark Mode structure
  - [ ] 5.5 Add label-specific variables for consistency
  - [ ] 5.6 Increase relationship line opacity (0.3 → 0.4, 0.6 → 0.7)
  - [ ] 5.7 Test Normal Mode displays correctly in app

- [ ] **6.0 Validate contrast ratios (WCAG AA)**
  - [ ] 6.1 Create spreadsheet of all text/background combinations
  - [ ] 6.2 Use WebAIM checker to test each combination
  - [ ] 6.3 Verify Dark Mode primary text ≥ 4.5:1 ratio
  - [ ] 6.4 Verify Normal Mode primary text ≥ 4.5:1 ratio
  - [ ] 6.5 Adjust colors if any fail AA standard
  - [ ] 6.6 Document all ratios in spreadsheet
  - [ ] 6.7 Screenshot contrast checker results for documentation

### Phase 3: Component-Specific Fixes

- [ ] **7.0 Fix relationship label rendering (mindmap-engine.js)**
  - [ ] 7.1 Read mindmap-engine.js lines 467-507 (label rendering)
  - [ ] 7.2 Locate hardcoded white background `rgba(255, 255, 255, 0.9)`
  - [ ] 7.3 Add function to read CSS variables from computed styles
  - [ ] 7.4 Replace hardcoded background with `--label-bg` variable
  - [ ] 7.5 Replace hardcoded text color with `--label-text` variable
  - [ ] 7.6 Replace hardcoded border with `--label-border` variable
  - [ ] 7.7 Test labels visible in Normal Mode
  - [ ] 7.8 Test labels visible in Dark Mode
  - [ ] 7.9 Test labels at various zoom levels (50%, 100%, 200%)
  - [ ] 7.10 Verify no console errors from missing variables

- [ ] **8.0 Enhance modal input styling**
  - [ ] 8.1 Add new CSS section in themes.css for modal inputs
  - [ ] 8.2 Style input backgrounds using --bg-input variable
  - [ ] 8.3 Style input borders using --border-input variable
  - [ ] 8.4 Add focus state with --border-focus (PwC orange)
  - [ ] 8.5 Style placeholder text with --text-placeholder
  - [ ] 8.6 Add focus shadow for better UX (orange glow)
  - [ ] 8.7 Test input visibility in Normal Mode modal
  - [ ] 8.8 Test input visibility in Dark Mode modal
  - [ ] 8.9 Test focus states work correctly
  - [ ] 8.10 Test placeholder text readable in both themes

- [ ] **9.0 Improve ribbon badge contrast**
  - [ ] 9.1 Locate ribbon styles in styles.css
  - [ ] 9.2 Update .category-ribbon to use theme variables
  - [ ] 9.3 Update .ribbon-badge background to --accent-primary
  - [ ] 9.4 Force badge text to white (always high contrast on orange)
  - [ ] 9.5 Add white border to badge (2px solid)
  - [ ] 9.6 Update .relationship-ribbon similarly
  - [ ] 9.7 Update .relationship-count badge
  - [ ] 9.8 Test ribbon visibility in Normal Mode
  - [ ] 9.9 Test ribbon visibility in Dark Mode
  - [ ] 9.10 Test badge numbers clearly readable

- [ ] **10.0 Update theme switcher appearance**
  - [ ] 10.1 Update .theme-selector CSS in themes.css
  - [ ] 10.2 Increase button padding for better touch targets
  - [ ] 10.3 Add font-weight to make labels readable
  - [ ] 10.4 Enhance active state (higher opacity, box shadow)
  - [ ] 10.5 Improve hover state visibility
  - [ ] 10.6 Add gap between icon and label
  - [ ] 10.7 Test theme switcher in both themes
  - [ ] 10.8 Test active state clearly shows current theme
  - [ ] 10.9 Test hover effects work smoothly

### Phase 4: Testing & Validation

- [ ] **11.0 Create automated contrast tests**
  - [ ] 11.1 Create `__tests__/theme-contrast.test.js` file
  - [ ] 11.2 Implement `getContrastRatio()` helper function
  - [ ] 11.3 Write test: Dark Mode primary text meets WCAG AA
  - [ ] 11.4 Write test: Normal Mode primary text meets WCAG AA
  - [ ] 11.5 Write test: Label background distinct from canvas
  - [ ] 11.6 Write test: All required CSS variables defined
  - [ ] 11.7 Write test: No hardcoded colors in canvas rendering
  - [ ] 11.8 Run tests and verify all pass
  - [ ] 11.9 Fix any failing tests
  - [ ] 11.10 Achieve 100% test coverage for theme logic

- [ ] **12.0 Visual regression testing**
  - [ ] 12.1 Take screenshots of all components in Normal Mode
  - [ ] 12.2 Take screenshots of all components in Dark Mode
  - [ ] 12.3 Test relationship labels at 50% zoom
  - [ ] 12.4 Test relationship labels at 100% zoom
  - [ ] 12.5 Test relationship labels at 200% zoom
  - [ ] 12.6 Test modal with multiple inputs filled
  - [ ] 12.7 Test ribbons with badges showing counts
  - [ ] 12.8 Test theme switching transitions
  - [ ] 12.9 Document any visual issues found
  - [ ] 12.10 Fix all identified visual issues

- [ ] **13.0 Component consistency audit**
  - [ ] 13.1 Grep for hardcoded colors in all CSS files
  - [ ] 13.2 Grep for hardcoded colors in mindmap-engine.js
  - [ ] 13.3 Replace any found hardcoded colors with variables
  - [ ] 13.4 Verify all buttons use theme variables
  - [ ] 13.5 Verify all panels use theme variables
  - [ ] 13.6 Verify all text uses theme variables
  - [ ] 13.7 Verify all borders use theme variables
  - [ ] 13.8 Test app with both themes active
  - [ ] 13.9 Document any inconsistencies
  - [ ] 13.10 Fix all inconsistencies found

- [ ] **14.0 Cross-feature testing**
  - [ ] 14.1 Test relationship creation in both themes
  - [ ] 14.2 Test category ribbons in both themes
  - [ ] 14.3 Test node editing modal in both themes
  - [ ] 14.4 Test info panel in both themes
  - [ ] 14.5 Test context menus in both themes
  - [ ] 14.6 Test video upload UI in both themes
  - [ ] 14.7 Test image display in both themes
  - [ ] 14.8 Test search functionality in both themes
  - [ ] 14.9 Test export features in both themes
  - [ ] 14.10 Document any feature-specific theme issues

### Phase 5: Documentation & Release

- [ ] **15.0 Update documentation**
  - [ ] 15.1 Update README.md with theme section
  - [ ] 15.2 Document theme architecture in ARCHITECTURE.md
  - [ ] 15.3 Add theme CSS variable reference table
  - [ ] 15.4 Document contrast ratios achieved
  - [ ] 15.5 Add troubleshooting section for theme issues
  - [ ] 15.6 Update CHANGELOG.md with v5.2 changes
  - [ ] 15.7 Create theme switching GIF for docs
  - [ ] 15.8 Screenshot both themes for comparison

- [ ] **16.0 Final testing & commit**
  - [ ] 16.1 Run full test suite (`npm test`)
  - [ ] 16.2 Fix any failing tests
  - [ ] 16.3 Run lint check (`npm run lint` or manual review)
  - [ ] 16.4 Manual testing with fresh project file
  - [ ] 16.5 Test theme persistence across sessions
  - [ ] 16.6 Verify no console errors in either theme
  - [ ] 16.7 Stage all changes (`git add .`)
  - [ ] 16.8 Commit: "feat(themes): overhaul theme system with enhanced contrast"

- [ ] **17.0 Create pull request**
  - [ ] 17.1 Push branch (`git push origin feature/theme-overhaul`)
  - [ ] 17.2 Create PR: `feature/theme-overhaul` → `develop`
  - [ ] 17.3 Write PR description with before/after screenshots
  - [ ] 17.4 List all components fixed
  - [ ] 17.5 Include contrast ratio documentation
  - [ ] 17.6 Request code review
  - [ ] 17.7 Address review feedback
  - [ ] 17.8 Merge to develop after approval

---

## Testing Checklist

### Unit Tests (theme-contrast.test.js):
- [ ] Contrast ratio calculation works correctly
- [ ] Dark Mode primary text meets WCAG AA (≥4.5:1)
- [ ] Normal Mode primary text meets WCAG AA (≥4.5:1)
- [ ] All CSS variables defined in both themes
- [ ] No hardcoded colors in canvas rendering
- [ ] Label colors distinct from backgrounds
- [ ] Input colors meet accessibility standards

### Integration Tests:
- [ ] Theme switching updates all components instantly
- [ ] Theme preference persists after restart
- [ ] Canvas redraws with new colors on theme change
- [ ] Modals reflect active theme
- [ ] Ribbons reflect active theme
- [ ] No visual glitches during transition

### Manual Visual Tests:
- [ ] Relationship labels visible in Normal Mode
- [ ] Relationship labels visible in Dark Mode
- [ ] Modal inputs have clear borders in both themes
- [ ] Modal text readable in both themes
- [ ] Ribbon badges high contrast in both themes
- [ ] Theme switcher shows active state clearly
- [ ] No hardcoded colors visible anywhere
- [ ] Professional appearance in both themes

### Accessibility Tests:
- [ ] All text meets WCAG AA minimum (4.5:1)
- [ ] Large text meets WCAG AA (3:1)
- [ ] Focus indicators clearly visible
- [ ] Color not sole means of conveying information
- [ ] Sufficient contrast in all states (hover, active, disabled)

---

## Approval Checkpoints

**After Task 3.0**: Theme cleanup complete → Review removed themes no longer accessible
**After Task 6.0**: Color palettes finalized → Review contrast ratios documented
**After Task 10.0**: All components fixed → Review visual consistency
**After Task 14.0**: Cross-feature testing complete → Review all features work in both themes
**After Task 17.0**: PR ready → Final approval for merge

---

## Notes

- **Priority**: Focus on Dark Mode first (most visibility issues)
- **Testing**: Use real content, not lorem ipsum (authentic testing)
- **Contrast**: Use WebAIM checker, don't guess ratios
- **Documentation**: Screenshot every problem found and fixed
- **Commits**: Small, atomic commits for easy rollback if needed

---

## Contrast Ratio Reference

### WCAG Standards:
- **AA (Minimum)**: 4.5:1 for normal text, 3:1 for large text (18pt+)
- **AAA (Enhanced)**: 7:1 for normal text, 4.5:1 for large text

### Target Ratios for This Project:
- Primary text: **≥ 12:1** (AAA level)
- Secondary text: **≥ 7:1** (AAA level)
- Muted text: **≥ 4.5:1** (AA minimum)
- UI elements: **≥ 3:1** (AA minimum)

---

## Color Palette Quick Reference

### Dark Mode:
```
Backgrounds:  #0d0d0d (main) → #1f1f1f (nodes) → #252525 (inputs)
Text:         #f5f5f5 (primary) → #c0c0c0 (secondary) → #858585 (muted)
Borders:      #404040 (primary) → #3a3a3a (inputs)
Accents:      #DC6900 (orange) → #f5b895 (light)
Labels:       rgba(10,10,10,0.95) bg, #f5f5f5 text
```

### Normal Mode:
```
Backgrounds:  #fafaf8 (main) → #ffffff (nodes/inputs)
Text:         #2c2c2c (primary) → #666666 (secondary) → #999999 (muted)
Borders:      #d0d0d0 (primary)
Accents:      #DC6900 (orange) → #f5b895 (light)
Labels:       rgba(255,255,255,0.95) bg, #2c2c2c text
```

---

**Task List Version**: 1.0
**Created**: October 13, 2025
**Status**: Ready for Implementation
