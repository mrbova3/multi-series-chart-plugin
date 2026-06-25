# Multi-series Chart Generator

A Figma plugin that generates multi-series bar, area, and pie charts using Signal Design System variables.
Works in **Figma Design** and **Figma Slides**.

## Features
- Stacked and grouped **vertical** bar charts
- **Horizontal** bar charts — category label inside bar, value to the right (matches DS Custom Label pattern)
- Area charts (stacked/unstacked)
- Pie charts
- Signal DS variable bindings (colors, spacing, radius, typography)
- Live canvas preview with dark/light mode toggle
- CSV data import
- Resizable plugin window (480×384 default, drag to resize)

## Getting the latest version

The plugin is deployed directly to Figma. Team members who already imported it from
`manifest.json` will get updates automatically the next time they run it.

To install fresh:
1. Download or clone this repository
2. Open the **Figma desktop app**
3. Main menu → **Plugins → Development → Import plugin from manifest**
4. Select the `manifest.json` from this folder
5. The plugin appears under **Plugins → Development → Multi-series chart generator**

> **Note:** `code.js` in this repo must be compiled from `code.ts` using the Figma plugin CLI.
> Run `figma plugin build <id>` after cloning. Or just use the deployed version above.

## Changelog

### Latest
- **Horizontal bars** — toggle in Layout section. Category name renders inside bar (white text, truncated), value appears to the right. Matches Signal DS `Bar Chart - Custom Label` pattern.
- Preview canvas updates live with horizontal toggle
- Signal DS `base/subtle` fill variable bound to card background
- All text styles use exact Signal DS text style keys

### Previous
- Stacked/grouped toggle
- Dark/light preview mode
- CSV upload with category name extraction
- Works in Figma Slides
