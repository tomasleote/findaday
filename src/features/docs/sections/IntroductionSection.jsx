import React from 'react';

export function IntroductionSection() {
    return (
        <section id="introduction" className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2 border-b border-dark-700 pb-2">
                Introduction
            </h2>
            <p className="leading-relaxed">
                <strong>Find A Day</strong> is a purpose-built tool designed to eliminate the friction in coordinating group events.
                Instead of relying on sprawling chat threads or rigid calendar invites, this app determines the optimal dates automatically by calculating overlapping free time among all participants.
            </p>
            <p className="leading-relaxed">
                Whether you are planning a dinner with friends, a game night, a birthday party, a team offsite, or a multi-week group retreat, the core concept remains the same:
                every participant submits their general availability, and the engine calculates the statistically best dates to satisfy the most people.
            </p>
        </section>
    );
}
