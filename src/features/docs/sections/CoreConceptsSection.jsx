import React from 'react';
import { Users } from 'lucide-react';

export function CoreConceptsSection() {
    return (
        <section id="core-concepts" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2 border-b border-dark-700 pb-2">
                <Users className="text-brand-400" size={20} /> Core Concepts Explained
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-dark-900 border border-dark-700 rounded-xl p-5">
                    <h3 className="font-bold text-gray-200 mb-2">Groups & Links</h3>
                    <p className="text-sm leading-relaxed">
                        A <strong>Group</strong> represents an entire event. Entering a group creates an isolated environment accessible via a unique <strong>Group ID</strong>. Participants can join the group via a direct share link holding this ID.
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
                        A <strong>Participant</strong> is an individual submitting their availability. Participants explicitly mark the exact days they are free to attend.
                        They can also specify if they only need a subset of those days (e.g., "I'm free all month, but I only want to attend for 4 consecutive days").
                    </p>
                </div>
                <div className="bg-dark-900 border border-dark-700 rounded-xl p-5">
                    <h3 className="font-bold text-gray-200 mb-2">Overlap Scheduling Engine</h3>
                    <p className="text-sm leading-relaxed">
                        The scheduling logic cross-references all participant selected dates against their required event duration.
                        If five participants want to meet for 3 days overlapping on an identical weekend, that period will achieve a 100% overlap score.
                    </p>
                </div>
            </div>
        </section>
    );
}
