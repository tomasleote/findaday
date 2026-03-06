# PRP-09: Architecture Migration (SSG via Next.js)

## Title
Architecture Migration (SSG via Next.js)

## Priority
Long-Term

## Objective
De-couple marketing content from the internal Single Page Application (SPA), migrating external pages to a Static Site Generation (SSG) framework for ultimate SEO performance.

## Problem Statement
While `react-snap` provides a stop-gap, scaling a blog and dozens of dynamic SEO hub pages inside a raw React SPA becomes fragile. True server-rendered metadata and sub-second HTML delivery is required for enterprise-tier SEO.

## Scope
- Port all marketing pages (Homepage, `/blog/*`, `/compare/*`, use-case landing pages) to Next.js.
- Isolate the core application functionality (Event Creation, Voting, Group Management) behind a subdomain (e.g., `app.findaday.app`) or as client-rendered routes inside Next.js.
- Ensure perfect 301 redirection tracking from legacy SPA paths to Next.js paths if URL structures shift.

## Out of Scope
- Rewriting the database logic or backend APIs.

## Technical Implementation Plan
- Initialize a Next.js (App Router or Pages Router) repository.
- Migrate Tailwind configurations and shared UI components.
- Convert React components using `react-helmet` to Next.js `<meta>` configurations using the Metadata API.
- Use `getStaticProps` / `generateStaticParams` for blazing-fast edge-delivered marketing pages.
- Set up reverse proxy or careful deployment to serve the backend API.

## SEO Impact
The holy grail of technical SEO. Perfect indexing, zero JS-rendering dependency, guaranteed 100/100 Core Web Vitals if built cleanly. Massive compounding advantage.

## Acceptance Criteria
- Marketing pages are generated at build time as raw HTML.
- Lighthouse scores hit max ratings.
- The transition causes zero broken internal links.

## Risks
- High risk of dropping organic traffic during transition if legacy URLs are not meticulously mapped via 301 redirects.
- Significant engineering effort potentially pausing feature development.

## Estimated Effort
High
