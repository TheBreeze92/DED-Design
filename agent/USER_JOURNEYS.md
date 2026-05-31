# USER_JOURNEYS.md

## User Journey 1: Extract Design Documentation

### Goal
Extract and save design documentation from a URL

### Steps
1. **Navigate to app** → User opens http://localhost:3000
2. **Enter URL** → User types or pastes a design doc URL into the input field
3. **Click Extract** → User clicks the black "Extract" button
4. **Wait for processing** → Loading indicator shows while content is extracted
5. **View output** → Extracted markdown appears in the Output panel
6. **Preview design** → Screenshot preview shows in the Preview panel
7. **Download markdown** → User clicks "Download" to save the .md file

### Happy Path
```
URL Input → Extract Button → Loading State → Markdown Output + Screenshot Preview → Download .md
```

### Error Scenarios
- **Invalid URL**: Show validation error "Please enter a valid URL"
- **Extraction fails**: Show error message with details
- **Empty content**: Show "No content could be extracted" message

---

## User Journey 2: Scroll Through Long Documentation

### Goal
Navigate through a lengthy design document while keeping the download button accessible

### Steps
1. **Enter URL and extract** → Long document is loaded (exceeds panel height)
2. **Scroll down in Output panel** → Content scrolls within the panel
3. **Header scrolls out of view** → "Output / Generated" header goes off-screen
4. **Sticky button appears** → Floating "Download" button appears at top of content
5. **Continue scrolling** → Download button stays visible (sticky at top)
6. **Scroll back to top** → Header comes back into view
7. **Sticky button hides** → Floating button disappears (header is visible again)

### Key Behavior
- Dashboard stays fixed at top (never scrolls)
- Panel scrolls independently with own scrollbar
- Download button auto-shows/hides based on header visibility
- Smooth scrolling experience with no layout jumping

---

## User Journey 3: Mobile Usage

### Goal
Use the app on a mobile device

### Steps
1. **Open on mobile** → Navigate to http://localhost:3000 on mobile browser
2. **Enter URL** → Tap input field and enter design doc URL
3. **Tap Extract** → Tap the Extract button
4. **View stacked layout** → Output and Preview panels stack vertically
5. **Scroll panels** → Each panel scrolls independently
6. **Download content** → Tap Download button when visible

### Responsive Breakpoints
- **Mobile** (< 768px): Single column, stacked panels, Footer hidden
- **Desktop** (≥ 768px): Two columns, side-by-side panels, Footer visible

### Mobile Considerations
- Touch-friendly tap targets (minimum 44px)
- Reduced padding on mobile (p-3 vs p-6)
- Smaller logo and text sizes
- Panels have minimum height to prevent excessive squishing

---

## User Journey 4: Copy Extracted Content

### Goal
Quickly copy extracted markdown to clipboard

### Steps
1. **Extract content** → Markdown appears in Output panel
2. **Click Copy button** → Button in panel header copies to clipboard
3. **Confirmation** → Visual feedback shows copy succeeded

### Implementation Note
The Copy button is in the panel header. When user scrolls, the button goes off-screen but can be accessed by scrolling back up, or via the sticky floating Download button.

---

## User Journey 5: Learn About the Tool

### Goal
Understand what DED Design does and how to use it

### Steps
1. **Read Dashboard** → See the "Extract Design Docs, Instantly" tagline
2. **Click Learn Design.md** → Opens documentation page in new tab
3. **Explore** → User learns about design documentation best practices

### Navigation Elements
- Tagline: "Extract Design Docs, Instantly"
- Learn link: "Learn Design.md →" (links to external resource)