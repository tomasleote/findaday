import React, { useState } from 'react';
import { hashPhrase } from '../../services/adminService';
import { apiCall } from '../../services/apiService';
import { ArrowRight, Loader2, Search } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { Input, Label, Button } from '../../shared/ui';
import { RecoveryTabSelector } from './RecoveryTabSelector';
import { PassphraseTab } from './PassphraseTab';
import { EmailTab } from './EmailTab';
import { FindGroupsTab } from './FindGroupsTab';

/**
 * RecoverAdminForm
 * Three recovery modes:
 *   - Passphrase: Group ID + passphrase → new admin link returned immediately
 *   - Email link: Group ID + email → new admin link emailed + returned
 *   - Find groups: email only → summary of all admin groups emailed (no Group ID needed)
 *
 * Props:
 *   onSuccess(groupId, adminToken) — called when passphrase/email recovery succeeds
 *   onCancel()
 */
function RecoverAdminForm({ onSuccess, onCancel }) {
    const [tab, setTab] = useState('passphrase'); // 'passphrase' | 'email' | 'find'
    const [groupId, setGroupId] = useState('');
    const [passphrase, setPassphrase] = useState('');
    const [email, setEmail] = useState('');
    const [findEmail, setFindEmail] = useState('');
    const [showPassphrase, setShowPassphrase] = useState(false);
    const [loading, setLoading] = useState(false);
    const { addNotification } = useNotification();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // ── Find my groups (email only) ──────────────────────────────────────────
            if (tab === 'find') {
                if (!findEmail) throw new Error('Please enter your email address.');
                await apiCall('/api/find-groups', {
                    method: 'POST',
                    body: JSON.stringify({ email: findEmail.trim().toLowerCase(), baseUrl: window.location.origin }),
                });

                addNotification({
                    type: 'success',
                    title: 'Summary Sent',
                    message: 'Check your inbox! We sent a summary of your groups.'
                });
                return;
            }

            // ── Passphrase / email recovery ──────────────────────────────────────────
            const body = { groupId: groupId.trim() };

            if (tab === 'passphrase') {
                const trimmedPassphrase = passphrase.trim();
                if (!trimmedPassphrase) throw new Error('Please enter your recovery passphrase.');
                // Hash client-side — passphrase never sent in plaintext
                body.passphrase = await hashPhrase(trimmedPassphrase);
            } else {
                if (!email) throw new Error('Please enter your admin email address.');
                body.email = email.trim().toLowerCase();
            }

            const data = await apiCall('/api/recover-admin', {
                method: 'POST',
                body: JSON.stringify(body),
            });

            if (tab === 'email') {
                addNotification({
                    type: 'success',
                    title: 'Email Sent',
                    message: 'Recovery email sent! Check your inbox and click the link.'
                });
            }

            onSuccess(groupId.trim(), data.adminToken);
        } catch (err) {
            console.error('[Admin Recovery Error] handleSubmit failed:', err);
            addNotification({
                type: 'error',
                title: 'Error',
                message: err.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-5">
            <RecoveryTabSelector tab={tab} onSwitch={setTab} />

            <form onSubmit={handleSubmit} className="space-y-4">

                {/* Group ID — only for passphrase/email tabs */}
                {tab !== 'find' && (
                    <div>
                        <Label>Group ID</Label>
                        <Input
                            id="recover-group-id"
                            type="text"
                            value={groupId}
                            onChange={(e) => setGroupId(e.target.value)}
                            required
                            className="text-sm"
                            placeholder="Paste your group ID here"
                        />
                    </div>
                )}

                {tab === 'passphrase' && (
                    <PassphraseTab
                        passphrase={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                        showPassphrase={showPassphrase}
                        onToggleShow={() => setShowPassphrase(s => !s)}
                    />
                )}

                {tab === 'email' && (
                    <EmailTab
                        email={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                )}

                {tab === 'find' && (
                    <FindGroupsTab
                        findEmail={findEmail}
                        onChange={(e) => setFindEmail(e.target.value)}
                    />
                )}

                <div className="flex gap-3 pt-1">
                    <Button
                        type="button"
                        onClick={onCancel}
                        variant="secondary"
                        weight="semibold"
                        className="flex-1 py-2.5 text-sm"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        variant="primary"
                        weight="bold"
                        className="flex-1 py-2.5 flex items-center justify-center gap-2 text-sm"
                    >
                        {loading
                            ? <><Loader2 size={15} className="animate-spin" /> {tab === 'find' ? 'Searching...' : 'Recovering...'}</>
                            : tab === 'find'
                                ? <><Search size={15} /> Find my groups</>
                                : <><ArrowRight size={15} /> Recover access</>
                        }
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default RecoverAdminForm;
