import assert from "node:assert/strict";
import {
  evaluateHappinessDeficitAdjustment,
  getNegativeHappinessPenalty,
} from "../ui/happiness-valuation.js";

assert.equal(getNegativeHappinessPenalty(4), 0);
assert.ok(Math.abs(getNegativeHappinessPenalty(-3) - 0.15) < 1e-12);
assert.equal(getNegativeHappinessPenalty(-16), 0.8);
assert.equal(getNegativeHappinessPenalty(-30), 0.8);

const crossesZero = evaluateHappinessDeficitAdjustment({
  currentHappiness: -3,
  happinessDelta: 5,
  penaltyFreeWeightedOutput: 40,
});
assert.equal(crossesZero.afterHappiness, 2);
assert.ok(Math.abs(crossesZero.beforePenaltyRate - 0.15) < 1e-12);
assert.equal(crossesZero.afterPenaltyRate, 0);
assert.ok(Math.abs(crossesZero.recoveryRate - 0.15) < 1e-12);
assert.ok(Math.abs(crossesZero.adjustment - 6) < 1e-12);

const partialRecovery = evaluateHappinessDeficitAdjustment({
  currentHappiness: -3,
  happinessDelta: 2,
  penaltyFreeWeightedOutput: 40,
});
assert.equal(partialRecovery.afterHappiness, -1);
assert.ok(Math.abs(partialRecovery.recoveryRate - 0.1) < 1e-12);
assert.ok(Math.abs(partialRecovery.adjustment - 4) < 1e-12);

const createsDeficit = evaluateHappinessDeficitAdjustment({
  currentHappiness: 2,
  happinessDelta: -5,
  penaltyFreeWeightedOutput: 40,
});
assert.equal(createsDeficit.afterHappiness, -3);
assert.ok(Math.abs(createsDeficit.recoveryRate + 0.15) < 1e-12);
assert.ok(Math.abs(createsDeficit.adjustment + 6) < 1e-12);

const cappedDeficit = evaluateHappinessDeficitAdjustment({
  currentHappiness: -20,
  happinessDelta: 5,
  penaltyFreeWeightedOutput: 40,
});
assert.equal(cappedDeficit.beforePenaltyRate, 0.8);
assert.equal(cappedDeficit.afterPenaltyRate, 0.75);
assert.ok(Math.abs(cappedDeficit.adjustment - 2) < 1e-12);

console.log("happiness valuation tests passed");
