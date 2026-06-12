import React from 'react';
import { Edit, Trash2, CheckCircle2, Link, Send, Mail } from 'lucide-react';
import { TruncatedText } from '../../../shared/ui';

const ParticipantRow = React.memo(function ParticipantRow({
  participant,
  onEdit,
  onDelete,
  onCopyLink,
  onSendInvite,
  copiedLinkId,
  inviteSendingId,
}) {
  return (
    <tr key={participant.id} className="border-b border-dark-700 hover:bg-dark-800 group">
      <td className="px-4 py-2 text-gray-300">
        <TruncatedText text={participant.name || 'N/A'} maxWidth="200px" />
      </td>
      <td className="px-4 py-2 text-gray-300">
        <TruncatedText text={participant.email} maxWidth="200px" />
        {!participant.email && <span className="text-gray-500 italic">No email</span>}
      </td>
      <td className="px-4 py-2 text-gray-300">{participant.duration || 0} days</td>
      <td className="px-4 py-2 text-gray-300">{(participant.availableDays || []).length}</td>
      <td className="px-4 py-2 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(participant)}
            className="p-1.5 text-gray-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-md transition-colors"
            title="Edit participant"
            data-testid={`edit-participant-${participant.id}`}
          >
            <Edit size={15} />
          </button>
          <button
            onClick={() => onDelete(participant)}
            className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
            title="Delete participant"
            data-testid={`delete-participant-${participant.id}`}
          >
            <Trash2 size={15} />
          </button>
          <button
            onClick={() => onCopyLink(participant)}
            className="p-1.5 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-colors"
            title="Copy personal link"
            data-testid={`copy-link-${participant.id}`}
          >
            {copiedLinkId === participant.id ? <CheckCircle2 size={15} className="text-emerald-400" /> : <Link size={15} />}
          </button>
          <button
            onClick={() => onSendInvite(participant)}
            disabled={!participant.email || !participant.email.trim() || inviteSendingId === participant.id}
            className="p-1.5 text-gray-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title={!participant.email || !participant.email.trim() ? 'No email address' : 'Send invite email'}
            data-testid={`send-invite-${participant.id}`}
          >
            {inviteSendingId === participant.id ? <Mail size={15} className="animate-pulse" /> : <Send size={15} />}
          </button>
        </div>
      </td>
    </tr>
  );
});

export default ParticipantRow;
