# PRP-05: Blog Architecture & Content Flywheel

## Title
Blog Architecture & Content Flywheel Setup

## Priority
High

## Objective
Establish a centralized blog architecture to capture informational ("How-to") search queries and begin building long-term topical authority.

## Problem Statement
The application captures high-intent traffic but has zero visibility for informational queries (e.g., "how to plan a group vacation"). Without editorial content, the domain's topical volume remains statically tied to the handful of feature landing pages.

## Scope
- Develop a `/blog` hub index page.
- Develop a blog post template (`/blog/:slug`).
- Implement markdown or CMS-backed content rendering.
- Publish the first 4 high-priority informational articles.

## Out of Scope
- Writing hundreds of articles (this establishes the system and initial batch).
- Complex blog categorization/tagging systems (keep it flat initially).

## Technical Implementation Plan
- Choose a lightweight markdown parser (e.g., `react-markdown`) or integrate a headless CMS (e.g., Sanity or Contentful). Given the React SPA setup, shipping static markdown files processed at build time is preferred for speed.
- **`App.js`**: Add routes for `/blog` and `/blog/:slug`.
- **`BlogIndex.jsx`**: Implement a grid UI for blog posts.
- **`BlogPost.jsx`**: Implement the article UI (Title, Author, Date, Content Body). Include `Article` schema markup.
- **Content Creation**:
  - `how-to-plan-group-vacation.md`
  - `free-doodle-alternatives.md`
  - Two additional relevant topics identified in the audit.

## SEO Impact
Unlocks the "informational" tier of the search funnel. Content pages naturally attract backlinks at a higher rate than product pages, driving up overall Domain Authority.

## Acceptance Criteria
- `/blog` is live, visually matching the brand, and lists 4 articles.
- Clicking an article loads the content successfully with proper H1/H2 structured markdown.
- `Article` JSON-LD schema applies to blog posts dynamically.

## Risks
- If heavily relying on markdown, managing internal links within markdown files can be brittle.

## Estimated Effort
Medium
