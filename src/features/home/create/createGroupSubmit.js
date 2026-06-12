import { createGroup } from '../../../services/groupService';
import { hashPhrase } from '../../../services/adminService';
import { apiCall } from '../../../services/apiService';

export async function submitCreateGroup({ name, description, location, startDate, endDate, eventType, adminEmail, passphrase }) {
  const recoveryPasswordHash = passphrase.trim() ? await hashPhrase(passphrase.trim()) : null;
  const result = await createGroup({
    name,
    description,
    location,
    startDate,
    endDate,
    eventType,
    adminEmail,
    recoveryPasswordHash,
  });
  // Best-effort welcome email — does not block group creation
  if (adminEmail) {
    apiCall('/api/send-welcome', {
      method: 'POST',
      body: JSON.stringify({
        groupId: result.groupId,
        adminToken: result.adminToken,
        groupName: name,
        startDate,
        endDate,
        adminEmail,
        baseUrl: window.location.origin,
      }),
    }).catch((err) => { console.error('[send-welcome] fetch failed:', err); });
  }
  return result;
}
