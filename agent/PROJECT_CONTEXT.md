# PROJECT_CONTEXT.md

## Project Overview

DED Design is a web application that extracts design documentation from URLs and converts them into structured markdown, with screenshot preview capabilities.

Users input a URL, and the system automatically extracts, processes, and displays the page content in a readable design-document format.

---

## Core Purpose

The system is designed to:

* Accept a URL from the user
* Extract page content using a headless browser
* Convert content into structured markdown documentation
* Capture a visual screenshot of the page
* Display results in a preview workspace UI

---

## Tech Stack

* Framework: Next.js 16.2.6
* UI: React 19.2.4
* Styling: Tailwind CSS 4
* Runtime: Node.js with TypeScript
* Extraction Engine:

  * Puppeteer (browser automation)
  * Cheerio (HTML parsing)

---

## Core System Architecture

### High-Level Flow

1. User submits a URL via Dashboard UI
2. Request is sent to `/api/extract`
3. Puppeteer launches a headless browser
4. Target page is loaded
5. Content is extracted from DOM
6. Content is converted into markdown
7. Screenshot is captured
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
│       └── extract.ts        # Extraction logic (Puppeteer + Cheerio)
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

### Puppeteer Behaviour

* Launches headless Chrome instance
* Navigates to user-provided URL
* Waits for page load completion
* Extracts structured DOM content

### Markdown Generation

* Converts extracted HTML into structured markdown
* Preserves headings, paragraphs, and key sections
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

* Chrome is NOT available in production build environments
* Puppeteer requires manual verification in preview/local environments
* Vercel is used for preview deployments and production hosting
* No external APIs or keys are currently required

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
