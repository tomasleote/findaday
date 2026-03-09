# PRP10: Blog Audit & SEO Optimization

## Objective

Transform the current blog from unstyled plain text into a professional, SEO-focused blog section that looks visually polished, improves search rankings, attracts organic traffic, and helps users understand how to use the app.

## Problem Statement

The blog section at `/blog` has 4 markdown posts that are structurally sound but suffer from critical issues:

1. **Broken typography**: `@tailwindcss/typography` is NOT installed, so all `prose` classes in `BlogPost.jsx` are silently ignored -- headings, paragraphs, and lists render without any typographic styling
2. **No professional formatting**: Posts lack callout boxes (Tip/Important/Note), bold keyword emphasis, and internal links to the 11 existing landing pages
3. **Weak SEO optimization**: Posts miss keyword-rich subheadings, meta descriptions could be stronger, no internal linking strategy
4. **No custom markdown renderers**: `ReactMarkdown` v10 is used with zero plugins or custom components -- blockquotes render as plain unstyled text

### Current Blog Architecture

- **Content**: 4 `.md` files in `src/content/blog/`
- **Metadata**: `src/content/blogData.js` (id, slug, title, description, date, author, coverImage)
- **Components**: `BlogIndex.jsx` (listing page), `BlogPost.jsx` (article renderer)
- **Rendering**: `ReactMarkdown` with Tailwind `prose` classes (currently broken)
- **Routing**: `/blog` and `/blog/:slug` via React Router (lazy-loaded)
- **SEO**: Helmet meta tags and JSON-LD structured data already present

### Available Landing Pages for Internal Linking

| Route | Type |
|---|---|
| `/vacation-planner` | vacation |
| `/doodle-alternative` | doodle |
| `/when2meet-alternative` | when2meet |
| `/find-a-day-for-dinner` | dinner |
| `/group-event-planner` | event |
| `/team-scheduling` | team |
| `/party-planner` | party |
| `/game-night-planner` | gamenight |
| `/christmas-dinner-planner` | christmas |
| `/summer-vacation-planner` | summer |
| `/family-reunion-planner` | family |
| `/compare` | comparison hub |

## Scope

- Install `@tailwindcss/typography` and configure prose theming
- Enhance `BlogPost.jsx` with custom ReactMarkdown renderers for callouts, internal links, and heading anchors
- Enhance `BlogIndex.jsx` with reading time and category badges
- Update `blogData.js` with category, keywords, and reading time fields
- Rewrite all 4 existing blog posts with professional SEO-optimized content
- Generate new blog post ideas for future content

## Out of Scope

- Writing and adding the new blog post ideas (only ideation)
- Cover image generation/design
- Portuguese translations of blog posts
- Blog search or filtering functionality
- Blog RSS feed

## Technical Implementation Plan

### Step 1 -- Install @tailwindcss/typography

Install the missing typography plugin:

```bash
npm install @tailwindcss/typography
```

### Step 2 -- Configure Tailwind typography plugin

Update `tailwind.config.js`:

```js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // ... existing theme config ...
      typography: (theme) => ({
        invert: {
          css: {
            '--tw-prose-body': theme('colors.gray.300'),
            '--tw-prose-headings': theme('colors.white'),
            '--tw-prose-links': theme('colors.brand.400'),
            '--tw-prose-bold': theme('colors.white'),
            '--tw-prose-bullets': theme('colors.brand.400'),
            '--tw-prose-quotes': theme('colors.gray.300'),
            '--tw-prose-quote-borders': theme('colors.brand.500'),
            '--tw-prose-counters': theme('colors.brand.400'),
            '--tw-prose-hr': theme('colors.dark.700'),
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

### Step 3 -- Enhance BlogPost.jsx with custom renderers

Add custom ReactMarkdown component renderers:

```jsx
// Custom components for ReactMarkdown
const markdownComponents = {
    // Callout boxes: detect > **Tip:**, > **Important:**, > **Note:** in blockquotes
    blockquote: ({ children }) => {
        const text = extractTextContent(children);

        if (text.startsWith('Tip:') || text.startsWith('💡')) {
            return (
                <div className="my-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <div className="flex items-start gap-3">
                        <span className="text-emerald-400 text-lg mt-0.5">💡</span>
                        <div className="text-emerald-200 text-base leading-relaxed">{children}</div>
                    </div>
                </div>
            );
        }

        if (text.startsWith('Important:') || text.startsWith('⚠️')) {
            return (
                <div className="my-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <div className="flex items-start gap-3">
                        <span className="text-amber-400 text-lg mt-0.5">⚠️</span>
                        <div className="text-amber-200 text-base leading-relaxed">{children}</div>
                    </div>
                </div>
            );
        }

        if (text.startsWith('Note:') || text.startsWith('📝')) {
            return (
                <div className="my-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <div className="flex items-start gap-3">
                        <span className="text-blue-400 text-lg mt-0.5">📝</span>
                        <div className="text-blue-200 text-base leading-relaxed">{children}</div>
                    </div>
                </div>
            );
        }

        // Default blockquote
        return (
            <blockquote className="border-l-4 border-brand-500/50 pl-4 my-6 italic text-gray-400">
                {children}
            </blockquote>
        );
    },

    // Internal links rendered as React Router <Link> components
    a: ({ href, children }) => {
        if (href && href.startsWith('/')) {
            return <Link to={href} className="text-brand-400 hover:text-brand-300 underline transition-colors">{children}</Link>;
        }
        return <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:text-brand-300 underline transition-colors">{children}</a>;
    },

    // Headings with anchor IDs
    h2: ({ children }) => {
        const id = String(children).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return <h2 id={id}>{children}</h2>;
    },
    h3: ({ children }) => {
        const id = String(children).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return <h3 id={id}>{children}</h3>;
    },

    // Horizontal rule as a styled section divider
    hr: () => (
        <div className="my-10 flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-dark-700 to-transparent"></div>
        </div>
    ),
};
```

### Step 4 -- Enhance BlogIndex.jsx

Add reading time estimate and category badge to each blog card:

```jsx
// In the card rendering:
<div className="flex items-center gap-3 text-xs font-bold tracking-wider uppercase">
    <span className="text-brand-500">
        {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
    </span>
    <span className="text-dark-700">•</span>
    <span className="text-gray-500">{post.readingTime} min read</span>
    {post.category && (
        <>
            <span className="text-dark-700">•</span>
            <span className="px-2 py-0.5 bg-brand-500/10 text-brand-400 rounded-full text-[10px]">
                {post.category}
            </span>
        </>
    )}
</div>
```

### Step 5 -- Update blogData.js

Add `category`, `keywords`, and `readingTime` fields:

```js
export const blogPosts = [
    {
        id: "how-to-plan-group-vacation",
        slug: "how-to-plan-group-vacation",
        title: "How to Plan a Group Vacation Without the Stress",
        description: "Learn the step-by-step process for coordinating travel dates across large groups. Discover tools and strategies that eliminate the chaos of group trip planning.",
        date: "2026-03-01",
        author: "Find A Day Team",
        category: "Guide",
        readingTime: 8,
        keywords: ["plan a group vacation", "group trip planning", "coordinating travel dates", "vacation scheduling tool", "group travel organizer"],
    },
    {
        id: "free-doodle-alternatives",
        slug: "free-doodle-alternatives",
        title: "The Best Free Doodle Alternatives for Group Scheduling in 2026",
        description: "Tired of ads and paywalls? Compare the top free Doodle alternatives for group scheduling, including tools with no sign-up, visual heatmaps, and mobile-first design.",
        date: "2026-03-02",
        author: "Find A Day Team",
        category: "Comparison",
        readingTime: 7,
        keywords: ["doodle alternatives", "free scheduling tools", "group scheduling app", "doodle alternative free", "best scheduling poll"],
    },
    {
        id: "how-to-plan-dinner-party",
        slug: "how-to-plan-dinner-party",
        title: "How to Coordinate the Perfect Friends Dinner Party",
        description: "Getting everyone's schedules to align for a dinner shouldn't be a nightmare. Learn how to pick the perfect date, plan the menu, and host stress-free.",
        date: "2026-03-03",
        author: "Find A Day Team",
        category: "How-To",
        readingTime: 6,
        keywords: ["plan a dinner party", "dinner party scheduling", "coordinate dinner with friends", "schedule dinner date", "friends dinner planning"],
    },
    {
        id: "best-team-building-activities",
        slug: "best-team-building-activities",
        title: "Must-Try Team Building Activities for Remote Companies in 2026",
        description: "Planning a team offsite? Discover the best team building activities for distributed teams, plus how to find the perfect dates that work for everyone.",
        date: "2026-03-04",
        author: "Find A Day Team",
        category: "Guide",
        readingTime: 7,
        keywords: ["team building activities remote", "company offsite planning", "schedule team event", "team scheduling", "remote team bonding"],
    }
];
```

### Step 6 -- Rewrite all 4 blog posts

Each post will be rewritten to include:

- **Hook introduction** (2-3 engaging sentences)
- **H2/H3 section hierarchy** with keyword-rich headings
- **Short readable paragraphs** (3-4 sentences max)
- **Bullet and numbered lists** for scannable content
- **Callout boxes** using blockquote syntax: `> **Tip:** ...`, `> **Important:** ...`, `> **Note:** ...`
- **Bold keyword emphasis** throughout
- **Internal links** to relevant landing pages (e.g., `[vacation planner](/vacation-planner)`)
- **Strong CTA conclusion** with link to the app

#### Post 1: how-to-plan-group-vacation.md

- **Primary keyword**: "plan a group vacation"
- **Secondary**: group trip planning, coordinating travel dates, vacation scheduling tool
- **Internal links to**: `/vacation-planner`, `/summer-vacation-planner`, `/family-reunion-planner`
- **Structure**: Introduction → Why Group Trips Fail → 5-Step Planning System (numbered) → Real Example → Mistakes to Avoid → Essential Tools → CTA

#### Post 2: free-doodle-alternatives.md

- **Primary keyword**: "doodle alternatives"
- **Secondary**: free scheduling tools, group scheduling app, scheduling poll
- **Internal links to**: `/doodle-alternative`, `/when2meet-alternative`, `/compare`
- **Structure**: Introduction → Problems with Doodle → What to Look For → Top 5 Alternatives (ranked) → Comparison Table → When to Use Each → CTA

#### Post 3: how-to-plan-dinner-party.md

- **Primary keyword**: "plan a dinner party"
- **Secondary**: dinner party scheduling, coordinate dinner with friends
- **Internal links to**: `/find-a-day-for-dinner`, `/group-event-planner`
- **Structure**: Introduction → Why Dinner Parties Fall Apart → 5 Steps to a Perfect Dinner → Menu Planning Tips → Real Example → Expert Tips → CTA

#### Post 4: best-team-building-activities.md

- **Primary keyword**: "team building activities remote"
- **Secondary**: company offsite planning, schedule team event, team scheduling
- **Internal links to**: `/team-scheduling`, `/group-event-planner`
- **Structure**: Introduction → Why Offsites Matter → Planning the Date → Top 10 Activities → Common Mistakes → Essential Logistics Tools → CTA

### Step 7 -- Generate new blog post ideas

#### Educational / SEO Traffic Posts

| # | SEO Keyword | Suggested Title | Sections Outline |
|---|---|---|---|
| 1 | schedule meetings with large groups | How to Schedule Meetings with Large Groups (Without Losing Your Mind) | Why It's Hard → Tools Comparison → Step-by-Step → Tips → CTA |
| 2 | best tools for group scheduling | The 10 Best Group Scheduling Tools in 2026 (Free & Paid) | Evaluation Criteria → Top 10 Ranked → Comparison Table → Verdict |
| 3 | scheduling meetings across time zones | How to Schedule Meetings Across Time Zones: A Complete Guide | The Math Problem → Tools That Help → Best Practices → Templates |
| 4 | how to plan events with friends | How to Plan Events with Friends When Everyone is Busy | The Coordination Problem → The Solution Framework → Real Examples → CTA |
| 5 | group availability finder | The Ultimate Guide to Finding Group Availability Fast | Manual vs. Automated → Tool Comparison → Step-by-Step → CTA |
| 6 | when2meet alternatives | The Best When2Meet Alternatives for Modern Teams | When2Meet Limitations → Modern Alternatives → Feature Comparison → CTA |
| 7 | how to organize a reunion | How to Organize a Family Reunion Everyone Actually Attends | Planning Timeline → Date Coordination → Activity Ideas → Budgeting → CTA |

#### Product / Feature Posts

| # | SEO Keyword | Suggested Title | Sections Outline |
|---|---|---|---|
| 1 | how to plan an event with Find A Day | How to Plan Any Event in 3 Simple Steps with Find A Day | Create → Share → See Results → Real Examples |
| 2 | availability heatmap tool | How Availability Heatmaps Help You Find the Best Date Instantly | What Is a Heatmap → How It Works → Why It's Better → Try It |
| 3 | voting system for group scheduling | How the Voting System Works: Let Your Group Decide the Best Date | The Problem → How Voting Works → Real Use Cases → CTA |
| 4 | coordinate large groups efficiently | How to Coordinate Large Groups of 20+ People for Any Event | Scaling Challenges → The Solution → Step-by-Step → Case Study |
| 5 | no signup scheduling tool | Why No-Signup Scheduling Tools Get 3x More Responses | Friction Analysis → Response Rate Data → Feature Comparison → CTA |

## SEO / UX / Performance Impact

- **Typography fix**: Immediately improves readability of all blog content (prose classes actually work)
- **Callout boxes**: Increases time-on-page and engagement by breaking up text walls
- **Internal linking**: Distributes page authority across all landing pages, improving overall domain SEO
- **Keyword targeting**: Each post targets 1 primary + 4-5 secondary keywords for better SERP positioning
- **Meta descriptions**: Stronger CTR from search results with improved descriptions
- **Reading time**: Sets user expectations, improving engagement metrics

## Risks

- **Typography plugin size**: `@tailwindcss/typography` adds ~10KB to the CSS bundle (negligible for modern connections)
- **Content length increase**: Longer posts may not be ideal if users prefer brief content. However, SEO data strongly favors 1,500-2,500 word articles for informational queries.
- **ReactMarkdown custom components**: The callout detection logic relies on text pattern matching in blockquotes. Edge cases with nested formatting may need testing.

## Estimated Effort

**Medium-Large** -- 2-3 focused sessions. Step 1-4 (infrastructure) can ship in one session. Step 5-6 (content rewrites) require dedicated writing time. Step 7 (ideas) is documentation only.
