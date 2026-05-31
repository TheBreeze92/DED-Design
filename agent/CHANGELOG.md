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

* Improved error handling for extraction failures
* Loading states for better UX feedback
* Improved screenshot rendering reliability
* Additional export formats (PDF, HTML)

---

## Technical Notes (NON-FUNCTIONAL)

The following are system-level details and NOT part of changelog history:

* Framework: Next.js 16.2.6
* UI: React 19.2.4
* Styling: Tailwind CSS 4
* Extraction: Puppeteer + Cheerio

These are tracked in PROJECT_CONTEXT.md.
