export function isOfflineError(err) {
  return (
    (typeof window !== 'undefined' && !window.navigator.onLine) ||
    err.name === 'TypeError' ||
    err.name === 'NetworkError' ||
    (err.message && (
      err.message.includes('failed to fetch') ||
      err.message.includes('network') ||
      err.message === 'Failed to fetch'
    ))
  );
}
