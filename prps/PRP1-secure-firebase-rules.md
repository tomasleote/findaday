# PRP1: Secure Firebase Database Rules and Prevent Unauthorized Writes

## Objective

Close the most critical security vulnerability in the application: **any client with a group ID can write arbitrary data** to any group, participant, or poll node in the database.

## Problem Statement

The current database rules at `database.rules.json:7-8` grant write access to anyone:

```json
"$groupId": {
    ".read": "true",
    ".write": "!data.exists() || newData.exists()"
}
```

This means a malicious user who knows (or guesses) a group ID can:
- Overwrite the group name, description, or dates
- Delete or modify any participant's data
- Inject fake participants
- Manipulate poll results by casting votes as any participant
- Write arbitrarily large `availableDays` arrays (no size validation)

The admin token validation exists only in the client-side JavaScript (`src/services/adminService.js:30-34`) and provides no actual security against direct RTDB REST API calls.

## Scope

- `database.rules.json` -- complete rewrite of security rules
- Potentially: Firebase Authentication integration (anonymous auth)
- Potentially: new Vercel API route for admin-only operations

## Out of Scope

- Data architecture changes (PRP2)
- Listener restructuring (PRP3)
- Performance fixes (PRP4)
- Rate limiting on API endpoints (PRP7)

## Technical Implementation Plan

### Phase A -- Add `availableDays` size validation (immediate, no migration)

1. Add `.validate` rules constraining `availableDays` children count:
   ```json
   "availableDays": {
       ".validate": "newData.numChildren() <= 400",
       "$dayIndex": {
           ".validate": "newData.isString() && newData.val().length <= 10"
       }
   }
   ```
   This prevents abuse where a malicious client writes millions of entries.

2. Add `.validate` for participant count at the `participants` level:
   ```json
   "participants": {
       ".validate": "newData.numChildren() <= 150"
   }
   ```

3. Add `.validate` for poll candidates count:
   ```json
   "candidates": {
       ".validate": "newData.numChildren() <= 15"
   }
   ```

### Phase B -- Introduce Firebase Anonymous Authentication

4. Enable Anonymous Authentication in the Firebase Console.

5. Update `src/services/firebaseConfig.js` to initialize Firebase Auth:
   ```js
   import { getAuth, signInAnonymously } from 'firebase/auth';
   const auth = getAuth(app);
   // Sign in anonymously on app load
   signInAnonymously(auth);
   ```

6. Update database rules to require authentication:
   ```json
   "$groupId": {
       ".read": "auth != null",
       ".write": "auth != null && (!data.exists() || newData.exists())"
   }
   ```

### Phase C -- Protect immutable fields and admin operations

7. Lock down group-level fields that should only be written at creation:
   ```json
   "id": { ".write": "!data.exists()" },
   "createdAt": { ".write": "!data.exists()" },
   "adminTokenHash": { ".write": "!data.exists()" }
   ```
   These rules already partially exist but must be verified for coverage.

8. For admin-only mutations (group update, group delete, participant delete), consider one of two approaches:
   - **Option A (simpler)**: Store the admin's `auth.uid` at group creation time and check it in rules: `".write": "data.child('adminUid').val() === auth.uid"`
   - **Option B (current token model)**: Move admin operations to Vercel API routes that validate the admin token server-side and use Firebase Admin SDK for writes. This keeps the existing token-sharing UX intact.

   **Recommended: Option B** -- it preserves the current shareable-admin-link UX while adding real server-side authorization.

9. Create a new API route `api/admin-action.js` that:
   - Accepts `{ groupId, adminToken, action, payload }`
   - Validates the admin token against the stored hash (using Firebase Admin SDK to read)
   - Performs the write using Firebase Admin SDK (which bypasses security rules)
   - Returns success/failure

10. Update frontend admin operations (`updateGroup`, `deleteGroup`, `deleteParticipant`) to call the new API route instead of writing directly to RTDB.

### Phase D -- Tighten participant write rules

11. Ensure participants can only create new entries (not overwrite others):
    ```json
    "$participantId": {
        ".write": "!data.exists() || (data.exists() && newData.exists())"
    }
    ```
    This already exists but add validation that `newData.child('id').val() === $participantId` to prevent ID spoofing.

12. Deploy updated rules and test with the Firebase Emulator Suite.

## SEO / UX / Performance Impact

- **No UX changes** -- users see the same flows
- **No performance regression** -- anonymous auth is lightweight
- **Major security improvement** -- closes the most critical vulnerability

## Risks

- Anonymous auth UIDs change across sessions/devices; if we tie admin auth to UID (Option A), the shareable admin link breaks. **Option B avoids this**.
- Existing groups created before the rules change will not have `adminUid` stored. The API-route approach (Option B) handles this gracefully since it validates using the existing `adminTokenHash`.
- Tightening rules could break legitimate writes if validation constraints are too strict. **Must test exhaustively with the Firebase Emulator before deploying.**

## Estimated Effort

**Medium** -- 2-3 focused development sessions. Phase A (validation rules) can ship independently in under an hour.
