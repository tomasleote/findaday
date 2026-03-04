# PRP-01: Critical Meta & Canonical Fixes

## Title
Critical Meta & Canonical Fixes

## Priority
Critical

## Objective
Resolve malformed canonical URLs and meta tags that are currently causing search engines to misinterpret or ignore landing pages, and optimize immediate conversion signals.

## Problem Statement
The application is appending spaces in the domain string for canonical tags (`https://Find A Day.app/`), which breaks canonicalization. Additionally, optimal meta tags (year intent strings, conditional comparison tables) are missing, resulting in lost search traffic and poor social sharing previews.

## Scope
- Fix canonical URL domain string across all generated pages.
- Fix OpenGraph (`og:url`, `og:image`) and Twitter Card URLs.
- Update mapping for `og:image` to match the specific landing page.
- Add year modifier (`2026`) to the When2Meet alternative page title.
- Enable the competitor comparison table on the vacation planner page.

## Out of Scope
- Implementing pre-rendering.
- Expanding landing page word count.
- Modifying schema markup.

## Technical Implementation Plan
- **`LandingPage.jsx`**: Modify lines 41, 44, 46, and 51. Replace `https://Find A Day.app/` with `https://findaday.app/`.
- Ensure conditional logic correctly maps `og-image-vacation.png` for the vacation page and `og-image-default.png` for all other pages.
- **`landingPageContent.js`**: 
  - Update When2Meet alternative title target to include "2026".
  - Change `showComparison: false` to `showComparison: true` for the vacation planner page.

## SEO Impact
Restores canonical indexing for all 8 landing pages. Prevents Google from dropping pages due to malformed URLs. Enhances social click-through rates (CTR).

## Acceptance Criteria
- Inspecting source on any landing page shows `<link rel="canonical" href="https://findaday.app/[slug]" />`.
- When2Meet page title includes "2026".
- Vacation page renders the comparison table.
- Vacation page OpenGraph image points to `og-image-vacation.png`.

## Risks
- Minor risk of cache invalidation delay; ensure serverless edge cache is flushed.

## Estimated Effort
Low
