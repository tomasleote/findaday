import React from 'react';
import { Input, Label } from '../../shared/ui';

export function EmailTab({ email, onChange }) {
    return (
        <div>
            <Label>Admin email</Label>
            <Input
                id="recover-email"
                type="email"
                value={email}
                onChange={onChange}
                required
                maxLength="254"
                className="text-sm"
                placeholder="The email you used when creating the group"
            />
            <p className="text-xs text-gray-500 mt-1.5">
                A new admin link will be emailed to you and shown here.
            </p>
        </div>
    );
}
