import assert from "node:assert/strict";
import {
  equationEquals,
  getModLanguage,
  parenthesize,
  t,
} from "../ui/i18n.js";

const english = { compose: () => "Food" };
const japanese = { compose: () => "食料" };
const unavailable = { compose: (key) => key };

assert.equal(getModLanguage(english), "en");
assert.equal(getModLanguage(japanese), "ja");
assert.equal(getModLanguage(unavailable), "en");
assert.equal(t("buildingEvaluation", {}, english), "Building Evaluation");
assert.equal(t("buildingEvaluation", {}, japanese), "建造物評価");
assert.equal(t("foodInline", { value: "0.37" }, english), " | Food ×0.37");
assert.equal(t("foodInline", { value: "0.37" }, japanese), "　食料×0.37");
assert.equal(
  t("relocationDestination", { destination: "Rural (Farm)" }, english),
  "Relocation destination: Rural (Farm)",
);
assert.equal(equationEquals(english), "=");
assert.equal(equationEquals(japanese), "＝");
assert.equal(parenthesize("Relocation +2", english), " (Relocation +2)");
assert.equal(parenthesize("再配置 +2", japanese), "（再配置 +2）");

console.log("i18n tests passed");
