// One-time migration from pre-rebrand localStorage keys (vacation_* -> fad_*).
// Safe to delete once old links are no longer in circulation.
export function runStorageMigration() {
  try {
    const isMigrationComplete = localStorage.getItem('fad_migration_v1_complete');
    if (!isMigrationComplete) {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('vacation_admin_')) {
          const newKey = key.replace('vacation_admin_', 'fad_admin_');
          localStorage.setItem(newKey, localStorage.getItem(key));
          localStorage.removeItem(key);
        }
        if (key.startsWith('vacation_p_')) {
          const newKey = key.replace('vacation_p_', 'fad_p_');
          localStorage.setItem(newKey, localStorage.getItem(key));
          localStorage.removeItem(key);
        }
        if (key === 'vacation_storage_consent') {
          localStorage.setItem('fad_storage_consent', localStorage.getItem(key));
          localStorage.removeItem(key);
        }
      });
      localStorage.setItem('fad_migration_v1_complete', 'true');
    }
  } catch (error) {
    console.error("localStorage migration vacation_admin_/vacation_p_ -> fad_admin_/fad_p_ failed:", error);
  }
}
