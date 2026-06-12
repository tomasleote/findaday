import React from 'react';
import { Input, Label } from '../../shared/ui';

export function FindGroupsTab({ findEmail, onChange }) {
    return (
        <div className="space-y-3">
            <p className="text-sm text-gray-400 leading-relaxed">
                Don't remember your Group ID? Enter your email and we'll send you a summary of all groups you administer.
            </p>
            <div>
                <Label>Your admin email</Label>
                <Input
                    id="find-groups-email"
                    type="email"
                    value={findEmail}
                    onChange={onChange}
                    required
                    maxLength="254"
                    className="text-sm"
                    placeholder="The email you used when creating groups"
                />
            </div>
            <p className="text-xs text-gray-500">
                You'll receive each group's ID and participant link. Then use the <strong className="text-gray-300">Email link</strong> tab with the Group ID to get a fresh admin link.
            </p>
        </div>
    );
}
