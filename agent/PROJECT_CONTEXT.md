# PROJECT_CONTEXT.md

## Project Overview

DED Design is a web application that extracts design documentation from URLs and converts them into structured markdown, with screenshot preview capabilities.

Users input a URL, and the system automatically extracts, processes, and displays the page content in a readable design-document format.

---

## Core Purpose

The system is designed to:

* Accept a URL from the user
* Extract the page's measured design values (colours, type, spacing, radii, buttons), via context.dev when a key is set, else a local headless browser
* Convert them into a design.md that contains measured values only
* Capture a visual screenshot of the page
* Display results in a preview workspace UI

---

## Tech Stack

* Framework: Next.js 16.2.6
* UI: React 19.2.4
* Styling: Tailwind CSS 4
* Runtime: Node.js with TypeScript
* Extraction Engine:

  * context.dev Styleguide and Screenshot APIs (primary, needs `CONTEXT_API_KEY`)
  * Puppeteer (local fallback, reads computed styles in a real browser)

---

## Core System Architecture

### High-Level Flow

1. User submits a URL via Dashboard UI
2. Request is sent to `/api/extract`
3. `extractDesignSystem` calls context.dev (key from `CONTEXT_API_KEY` or the `x-context-api-key` header)
4. If there is no key, or context.dev returns nothing, it falls back to local Puppeteer
5. Tokens are collected: measured colour roles, type scale, spacing, radii, buttons
6. `generateDesignMarkdown` writes only measured values and lists what it could not measure
7. Screenshot comes from context.dev, or from Puppeteer on the fallback path
8. Response is returned to frontend
9. WorkspaceCanvas renders markdown + preview

---

## Project Structure

```text
design-md/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main extraction interface
│   │   ├── layout.tsx        # Root layout
│   │   ├── globals.css       # Global styles
│   │   └── api/
│   │       └── extract/      # Extraction endpoint
│   ├── components/
│   │   ├── Dashboard.tsx     # URL input + workflow UI
│   │   └── WorkspaceCanvas.tsx # Preview + results display
│   └── lib/
│       └── scraper.ts        # Extraction (context.dev, Puppeteer fallback) and markdown generation
├── package.json
└── tsconfig.json
```

---

## UI Design System

* Brutalist visual style
* High contrast interface
* Thick borders and strong shadows
* Monospace-friendly typography

### Layout Behaviour

* Mobile: single-column stacked layout
* Desktop: two-column workspace layout
* Dashboard remains fixed at top
* Panels scroll independently

---

## Extraction System Details

### Puppeteer Fallback Behaviour

* Used when no context.dev key is set or the API returns nothing
* Launches headless Chrome, navigates to the URL, waits for network idle
* Reads computed styles for body background and text, button and link accent, h1 to h4 and p

### Markdown Generation

* Emits only values that were measured; no template defaults
* A Not measured list names anything that was omitted
* A text colour that fails 4.5:1 contrast on its surface is omitted, not emitted
* Outputs streaming response to frontend

### Screenshot Capture

* Captures visual snapshot of loaded page
* Used for preview alongside extracted content
* Currently may behave as placeholder in some environments

---

## Development Environment

### Local Setup

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Production build
npm run lint     # ESLint checks
npx tsc --noEmit # TypeScript validation
```

---

## Environment Constraints

* Chrome is NOT available in production build environments, so production relies on context.dev
* Puppeteer fallback needs a local Chrome (`npx puppeteer browsers install chrome`)
* Vercel is used for preview deployments and production hosting
* `CONTEXT_API_KEY` (env var, never committed) enables the context.dev path

---

## Known Limitations

* Screenshot preview may render as simplified or placeholder output
* Some dynamic or JavaScript-heavy websites may fail extraction
* No persistent storage (data is not saved between sessions)
* Mobile browser behaviour may differ from desktop extraction results

---

## System Notes

This file describes the structure and behaviour of the DED Design system.

It does NOT control AI behaviour.

AI behaviour is defined in AGENT.md.

Project execution state is managed in PROJECT_STATE.md.
