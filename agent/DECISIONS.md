# DECISIONS.md

## Architectural Decisions

### 1. Next.js App Router over Pages Router
**Decision**: Use Next.js 16 App Router (app directory)

**Rationale**:
- Modern React patterns (Server Components, Server Actions)
- Better streaming support for extraction response
- File-based routing with layouts
- Future-proof architecture

**Status**: ✅ Implemented

---

### 2. Tailwind CSS for Styling
**Decision**: Use Tailwind CSS 4 for all styling

**Rationale**:
- Rapid UI development
- Consistent design system
- Easy responsive breakpoints
- Built-in dark mode support (unused but available)

**Status**: ✅ Implemented

---

### 3. Puppeteer for Browser Automation
**Decision**: Use Puppeteer for content extraction

**Rationale**:
- Full JavaScript execution support
- Screenshot capture capability
- Wait for network idle
- Headless operation

**Trade-offs**:
- Heavy dependency (chromium binary ~170MB)
- Slower than simple HTTP fetching
- Memory intensive

**Status**: ✅ Implemented

---

### 4. Streaming Response for Extraction
**Decision**: Stream extraction content back to client

**Rationale**:
- Better UX (content appears progressively)
- Can handle large documents
- Connection stays alive during extraction

**Implementation**: 
- API route uses ReadableStream
- Client-side uses fetch with readable streams

**Status**: ✅ Implemented

---

### 5. Brutalist UI Design
**Decision**: Use brutalist design aesthetic

**Rationale**:
- Differentiation from polished SaaS products
- High contrast for accessibility
- Hard edges fit the "design tool" persona
- Memorable visual identity

**Design Elements**:
- Thick black borders (3px)
- Hard drop shadows (8px offset, no blur)
- Minimal border-radius
- Bold typography
- Limited color palette (black, white, red accent)

**Status**: ✅ Implemented

---

### 6. Independent Panel Scrolling
**Decision**: Each panel (Output, Preview) scrolls independently

**Rationale**:
- User can scroll output while keeping preview in view
- Dashboard stays accessible at top
- Sticky elements work within scroll context

**Implementation**:
- `overflow-auto` on panel content divs
- `max-height: calc(100vh - 180px)` limits height
- Flex layout for proper height distribution

**Status**: ✅ Implemented

---

### 7. Sticky Floating Download Button
**Decision**: Download button appears when header scrolls off-screen

**Rationale**:
- Download action always accessible
- No need to scroll back to top
- Visual indication of available action

**Implementation**:
- `position: sticky` inside scrollable container
- `headerRef` tracks header position
- `panelScrollRef` detects scroll within container
- Shows when `headerRect.bottom < containerRect.top`
- Hides when header comes back into view

**Status**: ✅ Implemented

---

### 8. Mobile-First Responsive Layout
**Decision**: Design for mobile first, enhance for desktop

**Rationale**:
- Better performance on constrained devices
- Progressive enhancement approach
- Easier to add complexity than remove it

**Breakpoints**:
- Default: Mobile (grid-cols-1)
- sm: Small tablets (still single column)
- lg: Desktop (grid-cols-2 side-by-side)

**Status**: ✅ Implemented

---

## Rejected Approaches

### 1. Client-Side Only Extraction
**Rejected in favor of**: Server-side API route

**Reason**: 
- Extraction requires Node.js (Puppeteer)
- API keys may be needed for some URLs
- Security concerns with exposing extraction logic

### 2. Sticky Panel Headers
**Rejected in favor of**: Headers scroll with content, floating button shows

**Reason**:
- Complexity of managing multiple sticky elements
- Conflicting scroll contexts
- Current approach provides better UX

### 3. Local Storage Persistence
**Rejected in favor of**: Session-only content

**Reason**:
- Privacy concerns
- Storage quota limits
- Complexity of managing versioned content
- Not requested by users

---

## Future Considerations

1. **Persistent storage**: Could add localStorage or database for saving extractions
2. **Multiple format export**: PDF, HTML alongside Markdown
3. **Batch extraction**: Process multiple URLs at once
4. **Custom extraction rules**: User-defined selectors
5. **API authentication**: For private design documents