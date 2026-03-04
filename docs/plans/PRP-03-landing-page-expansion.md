# PRP-03: Landing Page Component & Content Expansion

## Title
Landing Page Component & Content Expansion

## Priority
High

## Objective
Increase keyword density and topical relevance by expanding page content depth, aiming for the 800-1200 word threshold required to compete for high-intent queries.

## Problem Statement
Current landing pages are extremely thin (~300-400 words), hindering ability to rank for competitive mid-funnel keywords like "doodle alternative". The calls-to-action (CTAs) are generic, limiting conversion rates.

## Scope
- Expand content on the top 8 existing landing pages.
- Increase FAQs from 3-4 to 6-8 specifically targeted questions per page.
- Add a "How It Works" 3-step visual to all landing pages (currently homepage only).
- Implement contextual dynamic CTAs based on page intent (e.g., "Plan Your Group Vacation").
- Ensure new content blocks match the current Tailwind design system.

## Out of Scope
- Creating brand new landing pages (e.g., seasonal ones).
- Adding completely new interactive components.

## Technical Implementation Plan
- **`landingPageContent.js` / Content DB**:
  - Add new FAQ entries (targeting questions like "Is there a free Doodle without ads?").
  - Add 2-3 new problem statement paragraphs per page.
  - Configure a dynamic `ctaText` property for each page.
- **`LandingPage.jsx`**:
  - Integrate the `HowItWorks` component (imported from the homepage scope) into the shared landing page layout.
  - Bind the dynamic `ctaText` to the primary conversion buttons.

## SEO Impact
Fixes thin-content devaluation. Significantly expands long-tail keyword indexing via expanded FAQs, positioning the site for "Featured Snippet" captures. Contextual CTAs will improve user session engagement signals.

## Acceptance Criteria
- Landing pages have a minimum word count of ~800 words.
- All landing pages feature the "How It Works" component.
- The Doodle alternative page features at least 6 FAQs.
- The Vacation page has a CTA reading "Plan Your Group Vacation".

## Risks
- Expanding content could disrupt mobile UI/UX flow. Must test for scannability and layout shifts (CLS).

## Estimated Effort
Medium
