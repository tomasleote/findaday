import React from 'react';
import { HelpCircle } from 'lucide-react';

export function FaqSection() {
    return (
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
    );
}
