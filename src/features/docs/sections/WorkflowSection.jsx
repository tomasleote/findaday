import React from 'react';
import { Calendar } from 'lucide-react';

export function WorkflowSection() {
    return (
        <section id="workflow" className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2 border-b border-dark-700 pb-2">
                <Calendar className="text-emerald-400" size={20} /> Full Workflow Guide
            </h2>

            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-200 mb-2">1. Creating a Group</h3>
                    <p className="text-sm leading-relaxed mb-2">
                        When you create a group, you must specify a Start Date and End Date. This forms the absolute boundaries of the event window.
                        Technically, a unique namespace is generated alongside a secure cryptographic hash mapping you as the Admin.
                        You control the group's lifespan and can delete it entirely at any time.
                    </p>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-gray-200 mb-2">2. Adding Participants</h3>
                    <p className="text-sm leading-relaxed mb-2">
                        Participants can join organically via the <code className="bg-dark-800 text-pink-300 px-1 rounded">?group=xyz</code> share link, or the Admin can manually create boilerplate participants from the Admin Panel.
                        Names must be unique within a group (case-insensitive) and are restricted to <strong>20 characters</strong>.
                    </p>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-gray-200 mb-2">3. Submitting Availability</h3>
                    <p className="text-sm leading-relaxed mb-2">
                        When a participant opens the dashboard, they interact with a dynamic calendar that only permits selecting days within the group's start/end boundaries.
                        <strong>Important:</strong> Your changes are only synchronized to the cloud <strong>after you click the "Submit Availability" or "Save Details" buttons</strong>.
                        Closing the tab before saving will result in the loss of unsaved selections.
                    </p>
                    <div className="bg-dark-900 border border-dark-700 p-4 rounded-xl mt-4 space-y-3">
                        <h4 className="text-sm font-bold text-brand-400 uppercase">Selection Modes</h4>
                        <ul className="text-sm space-y-2">
                            <li><span className="text-brand-300 font-semibold">Flexible:</span> Click individual dates to toggle your availability one day at a time. Ideal for when your schedule is scattered.</li>
                            <li><span className="text-brand-300 font-semibold">Block Mode:</span> Set a specific number of days (e.g., 4) and click a start date. The system will automatically select a continuous block of time for you.</li>
                        </ul>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-gray-200 mb-2">4. Reviewing Results</h3>
                    <p className="text-sm leading-relaxed mb-2">
                        The Admin Panel continuously aggregates the availability matrices. The "Overlap Results" tab visualizes periods where over 50% of the participants align.
                        If a consensus duration is found (e.g., most users want a 4-day event), the Admin can filter the view exclusively for 4-day continuous overlapping gaps.
                    </p>
                </div>
            </div>
        </section>
    );
}
