# AGENT.md

## Purpose
This file documents the agent system, tooling, and interaction patterns for the DED Design project.

## Overview
DED Design is a Next.js application that extracts design documentation from URLs, processes markdown content, and provides a preview/screenshot capture system.

## Tech Stack
- **Framework**: Next.js 16.2.6
- **UI**: React 19.2.4, Tailwind CSS 4
- **Extraction**: Puppeteer (browser automation), Cheerio (HTML parsing)
- **Runtime**: Node.js with TypeScript

## Project Structure
```
design-md/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── page.tsx      # Main extraction interface
│   │   ├── layout.tsx    # Root layout
│   │   ├── globals.css   # Brutalist UI styling
│   │   └── api/          # API routes
│   │       └── extract/  # Extraction endpoint
│   ├── components/       # React components
│   │   ├── Dashboard.tsx       # URL input & extraction workflow
│   │   └── WorkspaceCanvas.tsx # Screenshot preview
│   └── lib/              # Utilities
│       └── extract.ts    # Extraction logic
├── package.json
└── tsconfig.json
```

## Agent Interaction Pattern
1. **Understand first**: Gather context via file-picker, code-searcher, read_files before making changes
2. **Validate assumptions**: Verify libraries/APIs exist in project before using them
3. **Minimal changes**: Only modify what's needed; avoid unnecessary refactoring
4. **Test before pushing**: Run typecheck (npx tsc --noEmit) before commit

## CLI Commands
```bash
cd design-md
npm run dev      # Start development server (port 3000)
npm run build    # Production build
npm run lint     # ESLint checks
npx tsc --noEmit # TypeScript validation
```

## Key Implementation Details

### Extraction Flow
1. User enters URL in Dashboard component
2. API route `/api/extract` receives request
3. Puppeteer launches headless browser, navigates to URL
4. Content is extracted and streamed back as markdown
5. Screenshot captured via Puppeteer
6. Preview displayed in WorkspaceCanvas

### UI Styling (Brutalist Design)
- Thick black borders (border-brutal class)
- Hard drop shadows (shadow-[8px_8px_0px_0px_rgba(10,10,10,1)])
- High contrast colors (black primary, red accent)
- Monospace typography considerations

### Responsive Behavior
- Mobile: Single column layout, stacked panels
- Desktop: Two-column side-by-side panels
- Dashboard stays fixed at top (doesn't scroll)
- Panels scroll independently with sticky floating download button

## Development Guidelines
1. Always run `npx tsc --noEmit` after making TypeScript changes
2. Review code with code-reviewer-minimax for significant changes
3. Test manually at http://localhost:3000 for UI changes
4. Note: Chrome is not available in the build environment - browser testing requires manual verification