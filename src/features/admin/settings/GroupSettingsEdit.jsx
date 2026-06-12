import React from 'react';
import { Save, Eye, EyeOff } from 'lucide-react';
import { Input, Label, LocationInput, CalendarPicker, Button } from '../../../shared/ui';
import { todayYMD } from '../../../utils/dateUtils';
import { MAX_GROUP_NAME_LENGTH } from '../../../utils/constants/validation';

function GroupSettingsEdit({
  group,
  editData,
  setEditData,
  onSaveEdit,
  setEditing,
  showPassphrase,
  setShowPassphrase,
}) {
  return (
    <div className="space-y-4 border-t border-dark-700 pt-6">
      <div>
        <Label size="compact">Group Name</Label>
        <Input
          type="text"
          size="compact"
          value={editData.name}
          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
          maxLength={MAX_GROUP_NAME_LENGTH}
        />
      </div>

      <div>
        <Label size="compact">
          Description {(editData.description || '').length}/500
        </Label>
        <textarea
          value={editData.description || ''}
          onChange={(e) => setEditData({ ...editData, description: e.target.value.slice(0, 500) })}
          className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors"
          rows="2"
          maxLength="500"
        />
      </div>

      <div>
        <LocationInput
          value={editData.location || null}
          onSelect={(location) => setEditData({ ...editData, location })}
          onError={(error) => console.error('Location error:', error)}
        />
        <p className="text-xs text-gray-500 mt-1">Where will you meet? City, address, or restaurant.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CalendarPicker
          label="Start Date"
          id="edit-start-date"
          value={editData.startDate}
          onChange={(v) => {
            const next = { ...editData, startDate: v };
            if (editData.endDate && v && editData.endDate < v) next.endDate = '';
            setEditData(next);
          }}
          minDate={todayYMD()}
          placeholder="Start date"
        />
        <CalendarPicker
          label="End Date"
          id="edit-end-date"
          value={editData.endDate}
          onChange={(v) => setEditData({ ...editData, endDate: v })}
          minDate={editData.startDate || todayYMD()}
          placeholder="End date"
        />
      </div>

      <div className="border-t border-dark-700/50 pt-4 mt-2 space-y-4">
        <h3 className="text-sm font-semibold text-gray-300">Recovery Settings</h3>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Admin Email</label>
          <Input
            type="email"
            size="compact"
            value={editData.adminEmail || ''}
            onChange={(e) => setEditData({ ...editData, adminEmail: e.target.value })}
            maxLength="254"
            placeholder="your@email.com"
          />
          <p className="text-xs text-gray-500 mt-1">Used for password recovery and sending reminders.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Recovery Passphrase</label>
          <div className="relative">
            <Input
              type={showPassphrase ? 'text' : 'password'}
              size="compact"
              value={editData.newPassphrase || ''}
              onChange={(e) => setEditData({ ...editData, newPassphrase: e.target.value })}
              className="pr-10"
              placeholder={group.recoveryPasswordHash ? "Enter to change existing passphrase" : "Set a new passphrase"}
            />
            <button
              type="button"
              onClick={() => setShowPassphrase(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              aria-label={showPassphrase ? 'Hide passphrase' : 'Show passphrase'}
              aria-pressed={showPassphrase}
            >
              {showPassphrase ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Leave blank to keep existing.</p>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button variant="primary" fullWidth onClick={onSaveEdit}>
          <Save size={18} className="inline mr-1.5" /> Save
        </Button>
        <Button variant="secondary" fullWidth onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export default GroupSettingsEdit;
