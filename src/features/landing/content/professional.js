export const professionalPages = {
    'event': {
        slug: 'group-event-planner',
        title: 'Group Event Date Finder — Schedule Any Group Activity | Find A Day',
        metaDescription: 'Find the best date for any group event. Propose dates and vote. Weddings, reunions, meetups, outings — everyone marks availability, Find A Day finds the overlap and lets the group decide.',
        h1: 'Find the Best Date for Any Group Event',
        subtitle: 'Whether it\'s a reunion, a meetup, a workshop, or a celebration — stop guessing and start coordinating. Visual availability + democratic voting for groups of any size.',
        emoji: '🎪',
        problemSection: [
            'Every group event starts the same way: someone needs to Find A Day that works for everyone. Whether it\'s a family reunion, a neighborhood meetup, a club outing, or a workshop — the coordination problem is universal.',
            'Existing tools either force everyone to create accounts (Doodle) or offer a dated interface that barely works on phones (When2Meet). Most people default to group chats, which inevitably devolve into a scheduling nightmare. And even after you see the overlaps, you still have to manually decide which date is best.',
            'Find A Day handles the universal "when is everyone free?" problem with zero friction. One link, visual calendar, instant overlap results. Then propose final dates and let everyone vote. Works for 4 people or 40.'
        ],
        showComparison: false,
        faqs: [
            { question: 'What types of events can I plan with Find A Day?', answer: 'Any event where you need to Find A Day that works for a group. Vacations, dinners, parties, game nights, team offsites, weddings, reunions, club meetings — if multiple people need to agree on a date, Find A Day helps. You can even propose final dates and vote.' },
            { question: 'How many participants can join?', answer: 'There is no hard limit on participants. Find A Day works for small groups of 3-5 and large groups of 20+. Voting scales effortlessly regardless of group size.' },
            { question: 'How do I finalize a date after seeing the overlap?', answer: 'Once you see the availability heatmap, you can propose 2–5 final candidate dates. Participants then vote on which date they prefer, and you see live voting results. The date with the most votes wins. This removes the ambiguity of manual decision-making.' },
            { question: 'Is Find A Day good for recurring events?', answer: 'Yes. Create a new event each time you need to find the next date. It\'s designed to be fast enough that creating a fresh event and running a vote takes under a minute.' }
        ],
        relatedPages: ['vacation-planner', 'doodle-alternative', 'team-scheduling'],
    },
    'team': {
        slug: 'team-scheduling',
        title: 'Team Offsite & Retreat Date Planner | Find A Day',
        metaDescription: 'Coordinate team offsite dates across timezones. Visual availability heatmap + voting finalizes dates. Free for teams of any size.',
        h1: 'Find the Best Date for Your Team Offsite or Retreat',
        subtitle: 'Distributed team? Multiple timezones? Conflicting PTO? Share one link, see availability overlap, then vote on final dates.',
        emoji: '💼',
        problemSection: [
            'Many remote teams span at least two timezones. Planning a quarterly offsite, annual retreat, or all-hands meeting means coordinating across different work schedules, PTO calendars, and travel constraints. Enterprise tools are often overkill (and expensive) for what should be a simple question: when can everyone make it?',
            'Find A Day gives you the answer in minutes. Set the potential date range for your offsite (e.g., Q3 2026), share the link with your team on Slack or email, and everyone marks their available days. The visual heatmap immediately shows which weeks have the highest team availability. Then propose final dates and let the team vote to finalize.',
            'No per-seat pricing. No SSO required. No account creation for team members. Just a link, a calendar, and democratic voting to decide.'
        ],
        showComparison: false,
        faqs: [
            { question: 'Can I use Find A Day for team scheduling across timezones?', answer: 'Yes. Find A Day focuses on date availability (not hourly time slots), which makes timezone differences irrelevant. Everyone marks which days they\'re available regardless of their timezone. Perfect for distributed teams.' },
            { question: 'How does voting work for team offsites?', answer: 'After seeing the availability overlap, propose 2–3 final date options. Team members vote on which date they prefer, and you see live results including who voted for what. The winning date gets the most votes.' },
            { question: 'Is Find A Day free for teams?', answer: 'Yes, completely free for teams of any size. No per-seat pricing, no team plan, no limits on voting or participants.' },
            { question: 'How do I share Find A Day with my team?', answer: 'Create an event, set your date range, and share the generated link via Slack, email, or any messaging tool. Team members click the link, mark their availability, vote on final dates, and you get the results in real-time.' }
        ],
        relatedPages: ['group-event-planner', 'vacation-planner', 'doodle-alternative'],
    },
};
