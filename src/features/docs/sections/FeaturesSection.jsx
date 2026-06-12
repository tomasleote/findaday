import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function FeaturesSection() {
    return (
        <section id="features" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2 border-b border-dark-700 pb-2">
                <ShieldCheck className="text-purple-400" size={20} /> Features & Edge Cases
            </h2>

            <ul className="list-disc pl-5 space-y-3 text-sm leading-relaxed">
                <li><strong>Name Limitations:</strong> Participant names are restricted to <strong>20 characters</strong>. Group names are restricted to <strong>30 characters</strong>. Descriptions can be up to <strong>500 characters</strong>.</li>
                <li><strong>Editing Data:</strong> Modifying a participant's name or dates will push changes to the server <strong>once the Save button is clicked</strong>. Any Admin viewing the dashboard will see the updated overlap results in real-time after the synchronization completes.</li>
                <li><strong>Link Persistence:</strong> If a participant accesses their personal schedule via a device, a local cache (localStorage) remembers their identity. Revisiting the base group link will skip the join form and drop them straight into their personalized view.</li>
                <li><strong>Access Recovery Forms:</strong> If you lose your Admin link, don't worry. Clicking "Recover Admin Access" on the homepage allows you to regenerate it by searching your email or utilizing your group passphrase.</li>
                <li><strong>Offline Protection:</strong> Form states are protected until a network operation succeeds. If you save availability while offline, the app will retain your selection and gracefully alert you via a Toast error rather than instantly wiping your work.</li>
            </ul>
        </section>
    );
}
