# CHANGELOG.md

All notable product changes are documented in this file.

This file tracks **user-visible and product-level changes**, not internal implementation details.

Format based on Keep a Changelog.

---

## [0.1.0] - 2026-05-31

### Added

* URL-based design document extraction workflow
* Markdown output generation from extracted content
* Screenshot preview of extracted pages
* Dual-panel interface (Output + Preview)
* Responsive layout for mobile and desktop
* Download functionality for extracted markdown
* Copy functionality for extracted content
* Learning/documentation link for onboarding
* Brutalist design system for visual identity

---

### Changed

* Improved visual contrast of primary action button
* Simplified navigation labeling for onboarding clarity
* Improved layout responsiveness across screen sizes

---

### Fixed

* Issues with panel layout on smaller screens
* Scroll behaviour inconsistencies in output panels
* UI state issues affecting copy functionality

---

## [Unreleased]

### Planned

* Extraction history (local storage)
* Persistent session data
* Section-specific copy functionality
* Additional export formats (PDF, HTML)
* Improved screenshot rendering reliability

---

## [0.1.1] - 2026-05-31

### Added

* Keyboard shortcuts: Cmd/Ctrl+Enter to extract, Escape to clear input
* Auto-focus on URL input field
* Visual keyboard hint when URL is valid
* Loading skeleton animations

### Changed

* Sticky headers now show keyboard shortcut hint instead of static text
* Improved accessibility with title attributes on buttons

---

## Technical Notes (NON-FUNCTIONAL)

The following are system-level details and NOT part of changelog history:

* Framework: Next.js 16.2.6
* UI: React 19.2.4
* Styling: Tailwind CSS 4
* Extraction: Puppeteer + Cheerio

These are tracked in PROJECT_CONTEXT.md.
