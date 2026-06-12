export const vacationPages = {
    'vacation': {
        slug: 'vacation-planner',
        title: 'Group Vacation Planner — Find When Everyone\'s Free & Vote | Find A Day',
        metaDescription: 'Planning a group trip? Everyone marks their free dates on the calendar. Find A Day finds the best overlapping vacation window instantly, then lets participants vote on proposed dates. Free, no account needed.',
        h1: 'The Best Group Vacation Date Planner',
        subtitle: 'Find overlapping vacation dates without the group chat chaos. Propose dates and let everyone vote. Coordinate multi-day travel windows instantly.',
        ctaText: 'Plan Your Group Vacation',
        emoji: '🌴',
        problemSection: [
            'Planning a group trip with friends or extended family is highly stressful. When you\'re trying to coordinate a vacation across 8 to 15 people, you\'re battling different PTO balances, school schedules, and work commitments.',
            'Often, the organizer finds a rough overlap window but then faces another debate: "I prefer the first option" vs "no, wait for better flights the following week." You end up in yet another round of negotiation. Even after you see which dates work, getting agreement on a final pick is painful.'
        ],
        whyToolsFail: 'If you try using a standard hourly poll to plan group trip dates, it breaks immediately. You need a tool that understands date ranges. When asking "which week in August works for our beach trip?", scheduling tools built for corporate zoom meetings fail. Beyond just finding overlap, Find A Day goes further — the organizer can propose final candidate dates and let participants vote in real-time, showing live results as votes come in. No more "let me think about it and get back to you." Everyone votes on the proposed dates and the best option wins.',
        useCases: [
            { title: 'The Annual Friend Trip', description: 'Finding a 5-day overlap in the summer where all 8 friends can finally take off work simultaneously.' },
            { title: 'Family Reunions', description: 'Coordinating a massive multi-generational gathering by seeing which weekend works for the highest percentage of the family tree.' },
            { title: 'Festival Squads', description: 'Narrowing down which travel window lets everyone attend the 3-day music festival together.' },
        ],
        showComparison: true,
        faqs: [
            { question: 'How do I find overlapping vacation dates for a large group?', answer: 'Create an event with your broad travel window (for example, the entire month of July). Share the link. Have everyone highlight the specific days they can take off. The calendar heatmap will instantly reveal the block of days where the most people are free.' },
            { question: 'After I find the overlap, what happens next?', answer: 'Once you see the availability overlap, you (as the organizer) can propose final candidate dates and create a poll. Participants then vote on your proposed dates in real-time, with live vote counts and results. When everyone votes, you see exactly which date wins. No more endless negotiation.' },
            { question: 'How does the voting feature work?', answer: 'After finding overlaps, click "Start Vote" in the admin panel. Propose 2–5 candidate date ranges. Participants see your proposed dates highlighted on the heatmap, vote for their preference, and can see live voting results including who voted for which dates. The organizer can close the poll and send the winning date as a calendar invite.' },
            { question: 'Does this group vacation planner cost money?', answer: 'No. Our group vacation date planner is completely free to use. There are no premium tiers required to schedule multi-day events, voting, or any other features. Unlimited participants, unlimited polls.' },
            { question: 'Do my friends need an account to mark their travel dates or vote?', answer: 'No. We know getting a group to agree is hard enough without forcing them to register for an app. They just click your link, type their name, tap their free dates on their phone, and when voting is open, they tap to vote with live results showing instantly.' },
            { question: 'Can I see exactly who voted for which dates?', answer: 'Yes. During voting, you can click any proposed date to see which participants voted for it. The voter list shows names (or initials if they prefer) and real-time vote counts. This transparency ensures the best outcome is clearly visible.' },
            { question: 'What happens if no single week works for everyone?', answer: 'The heatmap is designed to show you the best possible overlap. Once you propose dates based on the overlap, the voting feature makes the final decision clear — you\'ll see exactly which proposed date gets the most votes, even if not everyone can make it.' },
            { question: 'Is it better to use this than a standard Doodle poll?', answer: 'Yes. Standard polls are designed for discrete time slots (e.g., 2:00 PM on Tuesday). Find A Day is built for continuous blocks of days AND includes a democratic voting feature that lets everyone weigh in on final candidate dates — making it vastly superior for coordinating travel.' }
        ],
        relatedPages: ['doodle-alternative', 'group-event-planner', 'team-scheduling'],
    },
    'summer': {
        slug: 'summer-vacation-planner',
        title: 'Group Summer Vacation Date Planner | Find A Day',
        metaDescription: 'Planning a group summer trip? Don\'t guess when everyone is free. Share a link, collect multi-day availability, and book your group vacation hassle-free.',
        h1: 'Coordinate the Best Group Summer Vacation',
        subtitle: 'Find the perfect week for a beach house trip, Euro-summer, or cabin getaway across 8+ different work schedules. Free, fast, and visual.',
        emoji: '☀️',
        problemSection: [
            'Summer weekends book up incredibly fast. If you try to plan a group vacation in June by asking "what week works for you?" in February, you will never get a straight answer.',
            'You cannot book flights or reserve that perfect Airbnb until you have a locked-in date window. Text threads are useless for visualizing 5-to-7 day overlapping blocks across multiple people.',
            'Find A Day is designed specifically for multi-day travel. Select the whole summer, share the link, and let your group highlight their unbroken free days. The heatmap instantly reveals your travel window.'
        ],
        showComparison: false,
        faqs: [
            { question: 'How is this different from hourly schedulers?', answer: 'Find A Day natively supports multi-day selections perfectly. Participants simply drag across the days they can travel, creating a clear visual overlap.' },
            { question: 'Is it free for large travel groups?', answer: 'Yes, Find A Day is completely free regardless of whether 3 people or 30 people are joining the trip.' },
            { question: 'Can I use this for weekend getaways?', answer: 'Absolutely. It is perfect for finding a shared 3-day weekend among friends.' }
        ],
        relatedPages: ['vacation-planner', 'group-event-planner', 'team-scheduling'],
    },
};
