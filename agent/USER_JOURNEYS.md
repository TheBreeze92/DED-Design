# USER_JOURNEYS.md

## Purpose

This file defines how users interact with the product.

It describes **user goals and end-to-end flows**, not technical implementation details.

It should help AI understand:

* what users are trying to achieve
* what success looks like
* what can go wrong in user experience

It should NOT define technical implementation or UI mechanics.

---

## User Journey 1: Extract Design Documentation

### Goal

User wants to extract structured design documentation from a URL.

### Flow

1. User opens the application
2. User enters a valid URL
3. User triggers extraction
4. System processes the request
5. User receives:

   * structured markdown output
   * visual preview of the page
6. User can download the extracted result

### Success Criteria

* Extraction completes successfully
* Output is readable and structured
* User can download result

### Failure Scenarios

* Invalid URL provided
* Extraction fails due to unsupported site
* No content available

---

## User Journey 2: Review Long-Form Output

### Goal

User wants to review extracted documentation comfortably.

### Flow

1. User extracts a long document
2. User scrolls through generated output
3. User reviews markdown and preview content
4. User downloads or copies result if needed

### Success Criteria

* Content remains readable for long documents
* User can access full output without loss

---

## User Journey 3: Mobile Usage

### Goal

User wants to use the product on a mobile device.

### Flow

1. User opens app on mobile
2. User enters URL
3. User extracts content
4. User reviews output in mobile layout
5. User downloads or shares result

### Success Criteria

* Core functionality works on mobile
* No loss of content or usability

---

## User Journey 4: Copy Extracted Content

### Goal

User wants to quickly copy extracted markdown.

### Flow

1. User completes extraction
2. User copies generated markdown
3. User pastes content elsewhere

### Success Criteria

* Copy action works reliably
* Content is correctly formatted in clipboard

---

## User Journey 5: Understand the Tool

### Goal

User wants to understand what the product does.

### Flow

1. User lands on homepage
2. User reads product description
3. User optionally opens documentation link

### Success Criteria

* User understands product purpose within seconds
