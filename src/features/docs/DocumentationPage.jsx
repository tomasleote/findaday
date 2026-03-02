import React, { useEffect } from 'react';
import { ArrowLeft, BookOpen, Users, Calendar, ShieldCheck, HelpCircle, Code } from 'lucide-react';

export default function DocumentationPage({ onBack }) {
    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen p-4 md:p-8 text-gray-300">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <button
                        onClick={(e) => {
                            if (onBack) {
                                e.preventDefault();
                                onBack();
                            } else {
                                window.location.href = '/';
                            }
                        }}
                        className="text-gray-400 hover:text-white transition-colors bg-dark-800 p-2 rounded-lg"
                        aria-label="Go Back"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-50 flex items-center gap-3">
                        <BookOpen className="text-blue-500" />
                        Documentation
                    </h1>
                </div>

                {/* Content */}
                <article className="space-y-16 pb-20">

                    {/* 1. Introduction */}
                    <section id="introduction" className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2 border-b border-dark-700 pb-2">
                            Introduction
                        </h2>
                        <p className="leading-relaxed">
                            <strong>Vacation Scheduler</strong> is a purpose-built tool designed to eliminate the friction in organizing group travel.
                            Instead of relying on sprawling chat threads or rigid calendar invites, this app determines the optimal travel dates automatically by calculating overlapping free time among all participants.
                        </p>
                        <p className="leading-relaxed">
                            Whether you are coordinating a weekend getaway with a small group of friends or a multi-week retreat with dozens of colleagues, the core concept remains the same:
                            every participant submits their general availability, and the engine calculates the statistically best dates to satisfy the most people.
                        </p>
                    </section>

                    {/* 2. Core Concepts */}
                    <section id="core-concepts" className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2 border-b border-dark-700 pb-2">
                            <Users className="text-blue-400" size={20} /> Core Concepts Explained
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-dark-900 border border-dark-700 rounded-xl p-5">
                                <h3 className="font-bold text-gray-200 mb-2">Groups & Links</h3>
                                <p className="text-sm leading-relaxed">
                                    A <strong>Group</strong> represents an entire vacation event. Entering a group creates an isolated environment accessible via a unique <strong>Group ID</strong>. Participants can join the group via a direct share link holding this ID.
                                </p>
                            </div>
                            <div className="bg-dark-900 border border-dark-700 rounded-xl p-5">
                                <h3 className="font-bold text-gray-200 mb-2">The Admin Role</h3>
                                <p className="text-sm leading-relaxed">
                                    The creator of a group automatically receives an <strong>Admin Link</strong>. An Admin has superpowers: they can alter group details, manage participant entries, view overlap statistics, and export results.
                                </p>
                            </div>
                            <div className="bg-dark-900 border border-dark-700 rounded-xl p-5">
                                <h3 className="font-bold text-gray-200 mb-2">Participants & Availability</h3>
                                <p className="text-sm leading-relaxed">
                                    A <strong>Participant</strong> is an individual submitting their availability. Participants explicitly mark the exact days they are free to travel.
                                    They can also specify if they only need a subset of those days (e.g., "I'm free all month, but I only want to stay for 4 consecutive days").
                                </p>
                            </div>
                            <div className="bg-dark-900 border border-dark-700 rounded-xl p-5">
                                <h3 className="font-bold text-gray-200 mb-2">Overlap Scheduling Engine</h3>
                                <p className="text-sm leading-relaxed">
                                    The scheduling logic cross-references all participant selected dates against their required trip duration.
                                    If five participants want to travel for 3 days overlapping on an identical weekend, that period will achieve a 100% overlap score.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 3. Full Workflow Guide */}
                    <section id="workflow" className="space-y-8">
                        <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2 border-b border-dark-700 pb-2">
                            <Calendar className="text-emerald-400" size={20} /> Full Workflow Guide
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-200 mb-2">1. Creating a Group</h3>
                                <p className="text-sm leading-relaxed mb-2">
                                    When you create a group, you must specify a Start Date and End Date. This forms the absolute boundaries of the trip.
                                    Technically, a unique namespace is generated alongside a secure cryptographic hash mapping you as the Admin.
                                    You control the group's lifespan and can delete it entirely at any time.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-gray-200 mb-2">2. Adding Participants</h3>
                                <p className="text-sm leading-relaxed mb-2">
                                    Participants can join organically via the <code className="bg-dark-800 text-pink-300 px-1 rounded">?group=xyz</code> share link, or the Admin can manually create boilerplate participants from the Admin Panel.
                                    Names must be unique within a group (case-insensitive).
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-gray-200 mb-2">3. Submitting Availability</h3>
                                <p className="text-sm leading-relaxed mb-2">
                                    When a participant opens the dashboard, they interact with a dynamic calendar that only permits selecting days within the group's start/end boundaries.
                                    Upon clicking Save, their selected availability array is instantly synchronized to the cloud database.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-gray-200 mb-2">4. Reviewing Results</h3>
                                <p className="text-sm leading-relaxed mb-2">
                                    The Admin Panel continuously aggregates the availability matrices. The "Overlap Results" tab visualizes periods where over 50% of the participants align.
                                    If a consensus duration is found (e.g., most users want a 4-day trip), the Admin can filter the view exclusively for 4-day continuous overlapping gaps.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 4. Features & Edge Cases */}
                    <section id="features" className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2 border-b border-dark-700 pb-2">
                            <ShieldCheck className="text-purple-400" size={20} /> Features & Edge Cases
                        </h2>

                        <ul className="list-disc pl-5 space-y-3 text-sm leading-relaxed">
                            <li><strong>Name Limitations:</strong> Participant names are restricted to 100 characters. Group names are restricted to 50 characters. Duplicate names within the same group will trigger a validation error.</li>
                            <li><strong>Editing Data:</strong> Modifying a participant's name or dates will immediately push changes to the server. Any Admin viewing the dashboard will see the overlap results change in real-time.</li>
                            <li><strong>Link Persistence:</strong> If a participant accesses their personal schedule via a device, a local cookie (localStorage) securely remembers their identity. Revisiting the base group link will skip the creation form and drop them straight into their personalized view.</li>
                            <li><strong>Access Recovery Forms:</strong> If you lose your Admin link, don't worry. Clicking "Recover Admin Access" on the homepage allows you to regenerate it by searching your email or utilizing your group passphrase.</li>
                            <li><strong>Offline Protection:</strong> Form state wipes are deferred until a network operation succeeds. If you submit availability on a train going through a tunnel, the app will retain your selection and gracefully alert you via a Toast error rather than instantly wiping your work.</li>
                        </ul>
                    </section>

                    {/* 5. FAQ */}
                    <section id="faq" className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2 border-b border-dark-700 pb-2">
                            <HelpCircle className="text-yellow-400" size={20} /> Frequently Asked Questions
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <h3 className="font-bold text-gray-200 mb-1">Can I edit a participant's name as an Admin?</h3>
                                <p className="text-sm text-gray-400">Yes. The Admin Panel allows you to edit the names and emails of any participant.</p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-200 mb-1">What happens if a participant submits twice?</h3>
                                <p className="text-sm text-gray-400">Participants use a dedicated personal URL tied to their identity. Resubmitting merely overwrites their previous selections; it does not create a clone.</p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-200 mb-1">What if a participant leaves?</h3>
                                <p className="text-sm text-gray-400">An Admin can explicitly delete their record from the Admin Panel, immediately removing them from the overlap calculations.</p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-200 mb-1">Is authentication required?</h3>
                                <p className="text-sm text-gray-400">No classic username/password logins are required. Access is gated entirely by unguessable cryptographic Tokens passed within the URL parameters and backed by browser LocalStorage.</p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-200 mb-1">Is my data secure?</h3>
                                <p className="text-sm text-gray-400">Yes. Admin secrets and passphrases are irreversibly hashed server-side (and pre-hashed client-side). All transmissions are handled over secure encrypted HTTPS.</p>
                            </div>
                        </div>
                    </section>

                    {/* 6. Technical Transparency */}
                    <section id="technical" className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2 border-b border-dark-700 pb-2">
                            <Code className="text-rose-400" size={20} /> Technical Transparency
                        </h2>
                        <div className="bg-dark-950 border border-dark-800 rounded-xl p-5 text-sm leading-relaxed space-y-3 font-mono text-gray-300">
                            <p><strong>Architecture:</strong> Single Page Application (SPA) driven by React 18.</p>
                            <p><strong>Data Persistence:</strong> Firebase Realtime Database utilizing transactional writes to prevent concurrency race conditions.</p>
                            <p><strong>Serverless APIs:</strong> Node.js serverless functions process outbound emails and handle sensitive crypto actions (passphrase validations).</p>
                            <p><strong>Resilience:</strong> Top-level React Error Boundaries prevent visual crashes. Explicit `navigator.onLine` checks ensure degraded stability without network connections.</p>
                        </div>
                    </section>
                </article>
            </div>
        </div>
    );
}
