# PRP-04: Static Pre-rendering Implementation

## Title
Static Pre-rendering Implementation

## Priority
High

## Objective
Mitigate the risks of Client-Side Rendering (CSR) by pre-rendering marketing and landing pages to serve static HTML to search engine crawlers.

## Problem Statement
The app is a React Single Page Application (SPA). Landing pages inject meta tags dynamically via React Helmet. This forces Google to use its JavaScript rendering queue, which can delay indexing and cause severe ranking fluctuations.

## Scope
- Install and configure a pre-rendering library (e.g., `react-snap` or `prerender-spa-plugin`).
- Target all static marketing pages and the 8 core landing pages for pre-rendering during the build step.
- Ensure the dynamic app routes (e.g., specific event URLs) are excluded and remain fully CSR.

## Out of Scope
- Full migration to Next.js or Remix (this is handled in a future, long-term architecture PRP).

## Technical Implementation Plan
- **`package.json`**: Add `react-snap` as a dependency. Configure a `postbuild` script: `"postbuild": "react-snap"`.
- **`src/index.js`**: Update the render method. Use `hydrate` if the root element has children (pre-rendered), otherwise fallback to `render`.
- **`react-snap` configuration**:
  - Include explicitly: `/`, `/vacation-planner`, `/doodle-alternative`, `/when2meet-alternative`, etc.
  - Exclude dynamic app paths (e.g., `/event/*`).

## SEO Impact
Provides instantaneous HTML payloads with fully resolved meta tags to all bots. Eliminates JS rendering delays and ensures deterministic indexing for high-priority pages. Rapid LCP (Largest Contentful Paint) improvement.

## Acceptance Criteria
- Running `npm run build` generates a `build/` directory containing static `index.html` files for all landing pages.
- Viewing the page source (without JS disabled) on the live site shows fully populated HTML (H1s, paragraphs, schema) instead of a blank root div.
- Lighthouse SEO score hits 100 on landing pages.

## Risks
- Conflicts between React Helmet async hydration and pre-rendered DOM could cause minor UI flickering on load.
- Ensure third-party scripts (analytics) don't trigger prematurely or duplicate during build time.

## Estimated Effort
Medium
