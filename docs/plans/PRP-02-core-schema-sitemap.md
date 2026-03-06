# PRP-02: Core Schema & Sitemap Remediation

## Title
Core Schema & Sitemap Remediation

## Priority
Critical

## Objective
Implement missing structured data across the application to qualify for Google Knowledge Panels, enhanced SERP real estate, and ensure comprehensive crawlability via the sitemap.

## Problem Statement
The `SoftwareApplication` schema currently only fires conditionally on the vacation page. `Organization` and `WebSite` schemas are missing from the homepage, disqualifying the site from rich sitelink searches and knowledge panels. The sitemap lacks `lastmod` signals.

## Scope
- Remove the `effectiveType === 'vacation'` restriction for `SoftwareApplication` schema.
- Add `Organization` and `WebSite` schema to the homepage.
- Add `BreadcrumbList` schema to all landing pages.
- Add `lastmod` dates to `sitemap.xml`.
- Submit the updated sitemap to Google Search Console (GSC).

## Out of Scope
- Building new landing pages.
- Advanced programmatic schema for user-generated events.

## Technical Implementation Plan
- **`SchemaMarkup.jsx`**:
  - Remove the isolating `if (effectiveType === 'vacation')` block around lines 9. Always apply the `SoftwareApplication` schema.
  - Inject `Organization` and `WebSite` schemas with `SearchAction` structure when the route matches the homepage.
  - Implement `BreadcrumbList` schema mapping the nested path structure (e.g., Home > Alternative > Doodle).
- **`sitemap.xml` / Generator Script**:
  - Append `<lastmod>` tags mapped to the latest build or file modification date.
- **Operations**:
  - Log into GSC and force a recrawl of the sitemap.

## SEO Impact
Unlocks Rich Snippets for the whole site. Enhances SERP context with breadcrumbs, increasing CTR. Accelerates Google's crawl priorities via `lastmod`.

## Acceptance Criteria
- Google Rich Results Test passes for `SoftwareApplication` on all landing pages.
- Google Rich Results Test passes for `Organization` and `WebSite` on the homepage.
- Sitemap includes valid ISO-8601 `<lastmod>` values for all entries.

## Risks
- Invalid JSON-LD could cause search penalties; use the Rich Results Test to validate all changes in a staging environment.

## Estimated Effort
Low
