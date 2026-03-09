import React from 'react';

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

export const getBlogPostBySlug = (slug) => {
    return blogPosts.find(post => post.slug === slug);
};
