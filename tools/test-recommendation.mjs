import assert from "node:assert/strict";
import {
  getBestPlotIndexes,
  mergeRecommendationCandidates,
} from "../ui/recommendation.js";

assert.deepEqual(getBestPlotIndexes([]), []);
assert.deepEqual(
  getBestPlotIndexes([
    { plotIndex: 10, scored: { score: 1.4 } },
    { plotIndex: 11, scored: { score: 4.2 } },
    { plotIndex: 12, scored: { score: 2.6 } },
  ]),
  [11],
);
assert.deepEqual(
  getBestPlotIndexes([
    { plotIndex: 20, scored: { score: -2 } },
    { plotIndex: 21, scored: { score: -1 } },
    { plotIndex: 22, scored: { score: -1 } },
  ]),
  [21, 22],
);
assert.deepEqual(
  getBestPlotIndexes([
    { plotIndex: 30, scored: { score: 3 } },
    { plotIndex: 31, scored: null },
    { plotIndex: 32, scored: { score: Number.NaN } },
  ]),
  [30],
);

const cityCandidates = mergeRecommendationCandidates(
  [
    { plotIndex: 40, scored: { score: 2.2 } },
    { plotIndex: 41, scored: { score: 3.4 } },
  ],
  [
    { plotIndex: 50, scored: { score: 2.5 } },
    { plotIndex: 51, scored: { score: 1.8 } },
  ],
);
assert.deepEqual(getBestPlotIndexes(cityCandidates), [41]);

// If both branches ever refer to the same plot, keep only its stronger option
// so the recommendation VFX is never added twice.
const overlapping = mergeRecommendationCandidates(
  [{ plotIndex: 60, scored: { score: 2 } }],
  [{ plotIndex: 60, scored: { score: 3 } }],
);
assert.equal(overlapping.length, 1);
assert.equal(overlapping[0].scored.score, 3);

console.log("Weighted Yield Scores recommendation tests passed.");
