# CHANGELOG.md

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.1.0] - 2026-05-31

### Added
- **Dashboard component**: URL input and extraction workflow with "Extract Design Docs, Instantly" tagline
- **WorkspaceCanvas component**: Screenshot preview panel with placeholder color inversion effect
- **Extraction API endpoint**: `/api/extract` with streaming response support
- **Scrollable panels layout**: Output and Preview panels with independent scrolling
- **Sticky floating Download button**: Appears when panel header scrolls out of view
- **Responsive mobile layout**: Stacked panels on mobile, side-by-side on desktop
- **High contrast Extract button**: Black background with white text
- **Learn Design.md link**: Navigation to external documentation
- **Brutalist UI styling**: Custom CSS with thick borders and hard shadows
- **GitHub integration**: Repository pushed to https://github.com/TheBreeze92/DED-Design

### Changed
- **Extract button**: Changed from red (#8A0303) to black (#000000) background for higher contrast
- **Learn More button**: Renamed to "Learn Design.md" for clarity
- **Scroll container height**: Adjusted from `calc(100vh - 200px)` to `calc(100vh - 180px)` for better mobile fit
- **Panel minimum heights**: Added responsive minimum heights (`200px` mobile, `250px` tablet, `0` desktop)

### Fixed
- **Sticky button positioning**: Moved inside scrollable content div for proper sticky behavior
- **Mobile height allocation**: Fixed panel minimum heights to prevent overflow on small screens
- **Unused code cleanup**: Removed unused `copied` state variable

### Technical
- **Framework**: Next.js 16.2.6
- **UI**: React 19.2.4, Tailwind CSS 4
- **Dependencies**: Puppeteer 25.1.0, Cheerio 1.2.0
- **TypeScript**: Compiles cleanly with no errors

---

## [Unreleased]

### Planned
- Copy to clipboard functionality
- Better error handling with user-friendly messages
- Loading state UI (skeleton/spinner)
- Screenshot preview improvements
- Additional export formats (PDF, HTML)