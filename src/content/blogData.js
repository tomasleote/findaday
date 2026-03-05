import React from 'react';

export const blogPosts = [
    {
        id: "how-to-plan-group-vacation",
        slug: "how-to-plan-group-vacation",
        title: "How to Plan a Group Vacation Without the Stress",
        description: "Coordinating travel dates for a large group is often the hardest part of any trip. Here's a step-by-step guide to planning a group vacation.",
        date: "2026-03-01",
        author: "Find A Day Team",
        coverImage: "vacation-planner.jpg", // placeholder, can add real images later
    },
    {
        id: "free-doodle-alternatives",
        slug: "free-doodle-alternatives",
        title: "The Best Free Doodle Alternatives for Group Scheduling",
        description: "Tired of ads and paywalls? We break down the top free group scheduling tools available right now.",
        date: "2026-03-02",
        author: "Find A Day Team",
        coverImage: "doodle-alternative.jpg",
    },
    {
        id: "how-to-plan-dinner-party",
        slug: "how-to-plan-dinner-party",
        title: "How to Coordinate the Perfect Friends Dinner Party",
        description: "Getting everyone's schedules to align for a simple dinner shouldn't be a nightmare. Here's how to lock in a date fast.",
        date: "2026-03-03",
        author: "Find A Day Team",
        coverImage: "dinner.jpg",
    },
    {
        id: "best-team-building-activities",
        slug: "best-team-building-activities",
        title: "Must-Try Team Building Activities for Remote Companies",
        description: "Once you finally schedule that company offsite, what should you actually do? Here are the best team building exercises.",
        date: "2026-03-04",
        author: "Find A Day Team",
        coverImage: "team.jpg",
    }
];

export const getBlogPostBySlug = (slug) => {
    return blogPosts.find(post => post.slug === slug);
};
