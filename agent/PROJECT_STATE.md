# PROJECT_STATE.md

## Current Version

v0.1.0 - Initial Release

---

## Current Focus (MOST IMPORTANT)

The system is currently focused on:

* v1.0.0 has shipped — all core features are merged to main and deployed

All AI work should prioritise stabilisation and testing over new features unless explicitly requested.

Do NOT introduce unrelated features unless explicitly requested.

---

## Priority Order (STRICT)

All development work must follow this order:

1. ~~Error handling improvements~~ ✅ Done
2. ~~Loading states and UI feedback~~ ✅ Done
3. ~~Copy to clipboard functionality~~ ✅ Done
4. UX polish and minor improvements — In Progress
5. New feature development

If a task does not fit into this order, it is LOW PRIORITY.

---

## Active Work

### In Progress

* Broader testing and bug fixes for v1.0.0

### Not Started

* v0.2.0 feature development (extraction history, persistent storage, section-specific copy, keyboard shortcuts)

---

## Completed Features

* URL input & validation
* Content extraction (Puppeteer + context.dev API)
* Markdown generation (streaming)
* Screenshot capture
* Scrollable UI panels
* Sticky headers (Copy/Download buttons stay visible)
* Mobile responsive layout
* Extract button UI styling
* Error handling with actionable messages (missing browser/API key)
* Loading skeletons in output and screenshot panels
* Copy to clipboard + Download markdown
* Clear output button
* Dismissible error states
* Auto-extract example URLs

---

## Definition of Done (MANDATORY)

A task is only considered complete when ALL of the following are true:

* Feature works correctly in browser
* No TypeScript errors
* No console errors in development
* No regression in existing features
* Manual test completed in localhost
* Code is committed with clear message

If any of these are missing, the task is NOT complete.

---

## Risk Awareness

### High Risk Areas (Handle Carefully)

* Puppeteer extraction logic
* API route changes (/api/extract)
* Markdown generation pipeline
* Screenshot capture logic

Any changes here require careful review before implementation.

---

### Medium Risk Areas

* UI components
* State handling
* Loading / error UI

---

### Low Risk Areas

* Styling changes
* Text updates
* Layout adjustments

---

## Known Issues (DO NOT IGNORE)

* Chrome is not available in production build environment
* Screenshot preview is currently a visual placeholder
* Some dynamic websites fail extraction
* No persistent storage (data is not saved)

These issues should be considered during development decisions.

---

## Development Rules for AI Agents

When working in this project:

### 1. Always start by checking Current Focus

Do not begin implementation without understanding current priority.

---

### 2. Do not introduce new features

Unless explicitly requested.

Focus is on stabilisation, not expansion.

---

### 3. Make minimal changes

Prefer the smallest possible change that solves the problem.

Avoid refactoring unless necessary.

---

### 4. Preserve working functionality

Never break existing extraction flow.

---

### 5. Explain before implementation

For any non-trivial change:

* explain the problem
* propose solution
* highlight risks
* then implement

---

## Output Expectations (for AI responses)

When making changes, structure responses as:

### Objective

What is being solved

### Plan

Step-by-step approach

### Changes

Code or implementation

### Risks

What could break

### Validation

How to test

---

## System Intent

This project is in early-stage development.

The goal is:

* stability over features
* correctness over complexity
* clarity over optimisation

Shipping a working system is more important than adding new functionality.
