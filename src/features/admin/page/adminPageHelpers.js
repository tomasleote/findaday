/**
 * Pure helper: given a poll's votes and candidates maps, returns the winning
 * candidate (highest vote count; tie-broken by label ascending).
 */
export function computeVoteWinner(votes, candidates) {
  const voteCounts = Object.entries(candidates).map(([id, c]) => ({
    ...c,
    count: Object.values(votes).filter(v => v.candidateIds?.includes(id)).length,
  }));
  return voteCounts.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.label - b.label; // Deterministic tie-breaker
  })[0];
}
