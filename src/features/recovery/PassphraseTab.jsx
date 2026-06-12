import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input, Label } from '../../shared/ui';

export function PassphraseTab({ passphrase, onChange, showPassphrase, onToggleShow }) {
    return (
        <div>
            <Label>Recovery passphrase</Label>
            <div className="relative">
                <Input
                    id="recover-passphrase"
                    type={showPassphrase ? 'text' : 'password'}
                    value={passphrase}
                    onChange={onChange}
                    required
                    className="text-sm pr-10"
                    placeholder="Enter the passphrase you set at creation"
                />
                <button
                    type="button"
                    onClick={onToggleShow}
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
    );
}
