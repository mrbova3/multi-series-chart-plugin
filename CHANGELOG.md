# Changelog

All notable changes and bug fixes to the Multi-series Chart Generator plugin.

---

## [Unreleased] — 2026-06-25

### Fixed
- **Horizontal preview blank** — Completely rewrote `pvHorizontal()` canvas function from scratch.
  The previous version accumulated layers of Python-script patches that introduced a `plotW22` typo
  (double-2 suffix, referencing an undefined variable → NaN grid coordinates). The new version uses
  clean `bL`/`bW` variables throughout with no duplicated Y-axis title code.
- **Dark mode not syncing from selected chart** — When selecting a chart that was generated in dark
  mode, the preview now correctly reflects dark mode. Previously `setPanelParams()` updated all
  other params but skipped `darkMode`. Now added `applyDarkModeUI()` helper that sets `isDarkMode`
  and updates both sun/moon icons atomically. `setPanelParams()` calls it when `darkMode` is present.
- **Dark mode initial state lost on load** — Added hidden `<input id="darkMode">` checkbox so
  `setBooleanControl()` in code.ts can inject the initial dark state from pluginData. `isDarkMode`
  is now initialized by reading that checkbox at script start.
- **Duplicate Y-axis title rendering** — Old pvHorizontal had two separate Y-axis title draw blocks
  (one at top, one at bottom of function). Rewrite has exactly one.

---

## Bugs Previously Fixed (historical)

| Bug | Fix |
|-----|-----|
| Orphan try-catch after function closing brace | Removed — illegal JS syntax broke entire script |
| `plotH` underestimation | Read `header.height` after children added |
| Y-axis absolute position 32px offset | Set `x=0, y=0` AFTER `layoutPositioning='ABSOLUTE'` |
| Stack `layoutSizingVertical` HUG on horizontal bars | Changed to `FILL` |
| Bar data labels — 186 newlines | Set `characters` BEFORE `setTextStyleIdAsync`; use direct fontName/fontSize for labels |
| `fig-switch .checked` unreliable | Added `stateHorizontal`, `stateStacked`, etc. JS tracking vars |
| Property name mismatch `d.sN`/`d.cN` | Corrected to `d.seriesNames[s]`, `d.categoryNames[i]` |
| `setBooleanControl` regex too narrow | Updated to match `<input` and `<fig-switch` |
| Canvas blank on initial plugin load | `tryDraw()` retries up to 10× every 100ms until canvas is non-zero |
| Stacked toggle not working | Toggle state tracked in `stateStacked` var, not `.checked` |

---

## Bug Log — Active / Known Issues

> Update this section as bugs are found and resolved.

| # | Status | Description | Notes |
|---|--------|-------------|-------|
| 1 | ✅ Fixed | Horizontal preview blank (plotW22 typo) | 2026-06-25 |
| 2 | ✅ Fixed | Dark mode not syncing from selected chart | 2026-06-25 |
| 3 | 🔍 Monitor | Preview blank on very first CSV load | tryDraw retries should handle it |
| 4 | 🔍 Monitor | X-axis/Y-axis titles missing on horizontal charts | Should be fixed in pvHorizontal rewrite |

---

## Development Notes

- Plugin works in both **Figma Design** and **Figma Slides** (`manifest.json` includes `editorType: ["figma","slides"]`)
- Signal Design System variable keys are hardcoded in `code.ts` — do not change without re-inspecting the DS component
- Preview canvas uses seeded random data when no CSV is loaded — preview is always visible
- `isDarkMode` in UI is tracked as a JS variable (not a checkbox state) — update via `applyDarkModeUI()` only
- `stateHorizontal`, `stateStacked`, `stateGrid`, `stateLegend` are JS tracking vars for toggles
