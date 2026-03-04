# PRP-10: International SEO & Localization Pipeline

## Title
International SEO & Localization Pipeline

## Priority
Long-Term

## Objective
Expand the total addressable search market by translating landing pages into high-volume languages and implementing correct geographical targeting via `hreflang` signals.

## Problem Statement
The application relies on visual calendars and numbers, heavily minimizing language barriers to use. However, by remaining English-only on index pages, non-English search queries (e.g., "encontrar fecha para viaje") are completely inaccessible.

## Scope
- Implement an i18n framework (e.g., `react-i18next`).
- Translate the top 3 critical landing pages (Homepage, Vacation, Doodle Alternative) into Spanish, French, and German.
- Serve translated pages via subdirectory structures (e.g., `/es/vacation-planner`).
- Implement bi-directional `hreflang` meta tags.

## Out of Scope
- Translating the entire blog archive or deep competitor comparison pages at Phase 1.

## Technical Implementation Plan
- Configure `react-i18next` to ingest `.json` translation files.
- Refactor landing page copy out of static strings into localization keys.
- **Routing**: Update router to handle language prefixes.
- **`Helmet` / `<head>`**: Inject `<link rel="alternate" hreflang="es" href="..." />` on every translated variant, and link back to the `x-default` English version.

## SEO Impact
Allows domain to immediately rank for uncontested queries in foreign markets. A pure arithmetic increase in potential traffic.

## Acceptance Criteria
- Navigating to `/es/` serves the Spanish version.
- `hreflang` tags pass technical validation (e.g., Ahrefs hreflang checker).
- A user's browser language prompts a smart redirect or switch.

## Risks
- Incorrect `hreflang` implementation can lead to Google ignoring the instructions completely. Subdirectories must be strictly managed.

## Estimated Effort
High
