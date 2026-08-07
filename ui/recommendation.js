export function getBestPlotIndexes(candidates, epsilon = 1e-9) {
  const viable = (candidates ?? []).filter(
    ({ plotIndex, scored }) =>
      plotIndex != null && Number.isFinite(Number(scored?.score)),
  );
  if (!viable.length) return [];

  const bestScore = Math.max(...viable.map(({ scored }) => Number(scored.score)));
  return viable
    .filter(({ scored }) => Math.abs(Number(scored.score) - bestScore) <= epsilon)
    .map(({ plotIndex }) => plotIndex);
}

export function mergeRecommendationCandidates(...groups) {
  const byPlot = new Map();
  for (const candidate of groups.flat()) {
    if (
      candidate?.plotIndex == null ||
      !Number.isFinite(Number(candidate?.scored?.score))
    ) {
      continue;
    }
    const previous = byPlot.get(candidate.plotIndex);
    if (
      !previous ||
      Number(candidate.scored.score) > Number(previous.scored.score)
    ) {
      byPlot.set(candidate.plotIndex, candidate);
    }
  }
  return Array.from(byPlot.values());
}
