# DECISIONS.md

## Purpose

This file records **why key architectural and product decisions were made**.

It exists to prevent future AI agents or developers from:

* reintroducing rejected ideas
* changing stable system architecture without reason
* losing context on why trade-offs were made

It does NOT describe implementation details.

---

## 1. Next.js App Router

**Decision**: Use Next.js App Router (app directory)

**Why**:

* Supports modern React architecture (Server Components)
* Enables streaming responses for extraction workflow
* Better long-term scalability than Pages Router

**Status**: Approved and implemented

---

## 2. Tailwind CSS

**Decision**: Use Tailwind CSS for styling

**Why**:

* Enables rapid UI iteration
* Reduces need for custom CSS architecture
* Keeps styling consistent across components

**Status**: Approved and implemented

---

## 3. Puppeteer for Extraction

**Decision**: Use Puppeteer for web content extraction

**Why**:

* Required for JavaScript-rendered pages
* Enables screenshot capture
* More reliable than HTTP-only scraping for modern websites

**Trade-offs**:

* Heavy dependency (Chromium required)
* Higher memory usage
* Slower than lightweight scraping approaches

**Status**: Approved and implemented

---

## 4. Streaming Extraction Response

**Decision**: Stream extraction results to client

**Why**:

* Improves perceived performance
* Supports large documents without blocking UI
* Enables progressive rendering of results

**Alternative Considered**:

* Batch response (fully processed result only)

**Why rejected**:

* Worse user experience for long-running extractions

**Status**: Implemented

---

## 5. Brutalist Design Direction

**Decision**: Use a brutalist visual design system

**Why**:

* Distinct product identity
* High contrast improves readability
* Aligns with “developer tool” positioning

**Alternative Considered**:

* Standard SaaS polished UI

**Why rejected**:

* Too generic
* Lacks product differentiation

**Status**: Implemented

---

## 6. Independent Panel Scrolling UX

**Decision**: Panels scroll independently within the layout

**Why**:

* Allows users to compare output and preview simultaneously
* Keeps main dashboard accessible at all times
* Improves usability for long documents

**Alternative Considered**:

* Full page scrolling layout

**Why rejected**:

* Poor multi-panel usability
* Harder to navigate long outputs

**Status**: Implemented

---

## 7. Mobile-First Design Approach

**Decision**: Mobile-first responsive design strategy

**Why**:

* Ensures baseline usability on all devices
* Forces simpler UI decisions early
* Improves performance and accessibility

**Alternative Considered**:

* Desktop-first design

**Why rejected**:

* Would require more refactoring for mobile compatibility

**Status**: Implemented

---

## Rejected System Designs

### Client-side extraction

Rejected due to:

* lack of server-side capabilities (Puppeteer required)
* security limitations
* unreliable browser execution environment

---

### Persistent storage of results

Rejected due to:

* increased system complexity
* privacy considerations
* no current user requirement

---

## Future Considerations

These are NOT decisions, but potential future directions:

* Add authentication for private URLs
* Support multiple export formats (PDF, HTML)
* Batch URL processing
* Custom extraction rules per site
* Persistent storage for saved extractions
