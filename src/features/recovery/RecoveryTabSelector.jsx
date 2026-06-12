import React from 'react';
import { KeyRound, Mail, Search } from 'lucide-react';

export function RecoveryTabSelector({ tab, onSwitch }) {
    const btnClass = (t) =>
        `flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
            tab === t ? 'bg-brand-500 text-white' : 'bg-dark-800 text-gray-400 hover:text-gray-200'
        }`;

    return (
        <div className="flex rounded-lg overflow-hidden border border-dark-700">
            <button type="button" onClick={() => onSwitch('passphrase')} className={btnClass('passphrase')}>
                <KeyRound size={12} /> Passphrase
            </button>
            <button type="button" onClick={() => onSwitch('email')} className={btnClass('email')}>
                <Mail size={12} /> Email link
            </button>
            <button type="button" onClick={() => onSwitch('find')} className={btnClass('find')}>
                <Search size={12} /> Find groups
            </button>
        </div>
    );
}
