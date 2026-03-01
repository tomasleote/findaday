import React, { useState } from 'react';
import { hashPhrase } from '../firebase';
import { KeyRound, Mail, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

/**
 * RecoverAdminForm
 * Allows an admin to recover their admin link via either:
 *   - Recovery passphrase (Option 1)
 *   - Email magic link   (Option 2, requires adminEmail to have been set)
 *
 * Props:
 *   onSuccess(groupId, adminToken) — called when recovery succeeds
 *   onCancel()                     — called when user dismisses the form
 */
function RecoverAdminForm({ onSuccess, onCancel }) {
    const [tab, setTab] = useState('passphrase'); // 'passphrase' | 'email'
    const [groupId, setGroupId] = useState('');
    const [passphrase, setPassphrase] = useState('');
    const [email, setEmail] = useState('');
    const [showPassphrase, setShowPassphrase] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [emailSent, setEmailSent] = useState(false);

    const inputClass =
        'w-full px-3 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-gray-50 ' +
        'placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 ' +
        'focus:border-blue-500 transition-colors text-sm';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const body = { groupId: groupId.trim() };

            if (tab === 'passphrase') {
                if (!passphrase) throw new Error('Please enter your recovery passphrase.');
                // Hash client-side — passphrase never sent in plaintext
                body.passphrase = await hashPhrase(passphrase);
            } else {
                if (!email) throw new Error('Please enter your admin email address.');
                body.email = email.trim().toLowerCase();
            }

            const res = await fetch('/api/recover-admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Recovery failed. Please check your details and try again.');
            }

            if (tab === 'email') {
                setEmailSent(true);
            }

            onSuccess(groupId.trim(), data.adminToken);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-5">
            {/* Tab selector */}
            <div className="flex rounded-lg overflow-hidden border border-dark-700">
                <button
                    type="button"
                    onClick={() => { setTab('passphrase'); setError(''); }}
                    className={`flex-1 py-2 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${tab === 'passphrase'
                            ? 'bg-blue-500 text-white'
                            : 'bg-dark-800 text-gray-400 hover:text-gray-200'
                        }`}
                >
                    <KeyRound size={14} /> Passphrase
                </button>
                <button
                    type="button"
                    onClick={() => { setTab('email'); setError(''); }}
                    className={`flex-1 py-2 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${tab === 'email'
                            ? 'bg-blue-500 text-white'
                            : 'bg-dark-800 text-gray-400 hover:text-gray-200'
                        }`}
                >
                    <Mail size={14} /> Email link
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Group ID */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Group ID</label>
                    <input
                        id="recover-group-id"
                        type="text"
                        value={groupId}
                        onChange={(e) => setGroupId(e.target.value)}
                        required
                        className={inputClass}
                        placeholder="Paste your group ID here"
                    />
                </div>

                {/* Passphrase tab */}
                {tab === 'passphrase' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                            Recovery passphrase
                        </label>
                        <div className="relative">
                            <input
                                id="recover-passphrase"
                                type={showPassphrase ? 'text' : 'password'}
                                value={passphrase}
                                onChange={(e) => setPassphrase(e.target.value)}
                                required
                                className={`${inputClass} pr-10`}
                                placeholder="Enter the passphrase you set at creation"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassphrase(s => !s)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                aria-label={showPassphrase ? 'Hide passphrase' : 'Show passphrase'}
                            >
                                {showPassphrase ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5">
                            Your passphrase was hashed in your browser — it was never stored in plaintext.
                        </p>
                    </div>
                )}

                {/* Email tab */}
                {tab === 'email' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Admin email</label>
                        <input
                            id="recover-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={inputClass}
                            placeholder="The email you used when creating the group"
                        />
                        <p className="text-xs text-gray-500 mt-1.5">
                            A new admin link will be emailed to you and shown here.
                        </p>
                    </div>
                )}

                {error && (
                    <p className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}

                {emailSent && (
                    <p className="text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                        ✅ Recovery email sent! Check your inbox and click the link.
                    </p>
                )}

                <div className="flex gap-3 pt-1">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 bg-dark-800 hover:bg-dark-700 text-gray-300 font-semibold py-2.5 px-4 rounded-lg border border-dark-700 transition-colors text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                    >
                        {loading
                            ? <><Loader2 size={15} className="animate-spin" /> Recovering...</>
                            : <><ArrowRight size={15} /> Recover access</>
                        }
                    </button>
                </div>
            </form>
        </div>
    );
}

export default RecoverAdminForm;
