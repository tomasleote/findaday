# PRP-07: Competitor Comparison Hub Architecture

## Title
Competitor Comparison Hub Architecture

## Priority
Medium

## Objective
Systematize competitive positioning by creating a dedicated matrix of "versus" pages to intercept high-intent alternative search traffic.

## Problem Statement
Currently, competitor targeting consists of isolated `/doodle-alternative` and `/when2meet-alternative` pages. As the product expands, a consolidated matrix is needed to establish deeper topical authority for software comparisons in this niche.

## Scope
- Create a root `/compare` hub page.
- Relocate or duplicate existing alternative pages into `/compare/doodle`, `/compare/when2meet`.
- Add new competitor pages: `/compare/lettucemeet`, `/compare/rally`.
- Build a comprehensive, reusable feature comparison matrix component.

## Out of Scope
- Defaming competitors (content must remain strictly factual regarding features/pricing).

## Technical Implementation Plan
- **`CompareHub.jsx`**: Create a landing page outlining why Find A Day is the superior choice over standard legacy models.
- **`ComparePage.jsx`**: A template strictly mapping Find A Day's feature set vs the competitor. Will pass data via props.
- **Routing**: Setup nested routes under `/compare`. Add 301 redirects if moving existing alternative pages, although keeping the legacy `/doodle-alternative` and just interlinking it with the new hub might be safer to prevent SEO ranking drops.
- **Content**: Draft factual feature lists (e.g., Multi-day support, Account required, Cost, Ads).

## SEO Impact
Dominates "Search term + alternative" and "Find A Day vs X" queries. High conversion velocity since these users are actively unhappy with their current tools.

## Acceptance Criteria
- `/compare` hub is live.
- At least 4 dedicated competitor comparison pages exist.
- Mobile-friendly comparison tables visually highlight Find A Day's advantages.
- Breadcrumb schema accurately maps the `/compare/` hierarchy.

## Risks
- Losing current rankings if `/doodle-alternative` is improperly redirected. Ensure 301s are perfect if migrating slugs.

## Estimated Effort
High
