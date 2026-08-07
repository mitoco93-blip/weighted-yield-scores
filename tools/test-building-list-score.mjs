import assert from "node:assert/strict";
import {
  clearBuildingListScore,
  renderBuildingListScore,
} from "../ui/building-list-score.js";

globalThis.Locale = { compose: () => "食料" };

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.attributes = new Map();
    this.children = [];
    this.parentElement = null;
    this.style = {};
    this.textContent = "";
    this.className = "";
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  hasAttribute(name) {
    return this.attributes.has(name);
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  append(...elements) {
    for (const element of elements) {
      element.remove();
      element.parentElement = this;
      this.children.push(element);
    }
  }

  remove() {
    const siblings = this.parentElement?.children;
    if (siblings) {
      const index = siblings.indexOf(this);
      if (index >= 0) siblings.splice(index, 1);
    }
    this.parentElement = null;
  }

  insertAdjacentElement(position, element) {
    if (position !== "afterend" || !this.parentElement) return null;
    element.remove();
    const siblings = this.parentElement.children;
    const index = siblings.indexOf(this);
    element.parentElement = this.parentElement;
    siblings.splice(index + 1, 0, element);
    return element;
  }

  get previousElementSibling() {
    if (!this.parentElement) return null;
    const index = this.parentElement.children.indexOf(this);
    return index > 0 ? this.parentElement.children[index - 1] : null;
  }

  matches(selector) {
    const attribute = selector.match(
      /^\[([a-z0-9-]+)(?:="([^"]*)")?\]$/i,
    );
    if (attribute) {
      const [, name, value] = attribute;
      return value === undefined
        ? this.hasAttribute(name)
        : this.getAttribute(name) === value;
    }
    if (selector.startsWith(".")) {
      const classes = new Set(this.className.split(/\s+/).filter(Boolean));
      return selector
        .split(".")
        .filter(Boolean)
        .every((className) => classes.has(className));
    }
    return false;
  }

  querySelector(selector) {
    for (const child of this.children) {
      if (child.matches(selector)) return child;
      const nested = child.querySelector(selector);
      if (nested) return nested;
    }
    return null;
  }
}

const fakeDocument = {
  createElement(tagName) {
    return new FakeElement(tagName);
  },
};

const row = new FakeElement("production-chooser-item");
const itemBody = new FakeElement("div");
const icon = new FakeElement("div");
const information = new FakeElement("div");
const titleRow = new FakeElement("div");
const name = new FakeElement("div");
name.className = "shrink font-title text-accent-2 uppercase tracking-25";
name.textContent = "ポルタル・デ・メルカデレス";
titleRow.append(name);
information.append(titleRow);
itemBody.append(icon, information);
row.append(itemBody);

const firstEvaluation = { score: 4.628, priority: 114 };
assert.equal(
  renderBuildingListScore(row, firstEvaluation, fakeDocument),
  true,
);

const score = row.querySelector("[data-wys-building-list-score]");
assert.ok(score, "a dedicated score element must be added");
assert.equal(titleRow.children[0], name, "the native name must stay untouched");
assert.equal(
  score.parentElement,
  name,
  "the score must sit inline inside the native name element",
);
assert.equal(score.style.display, "inline-flex");
assert.equal(score.style.whiteSpace, "nowrap");
assert.equal(score.style.flexShrink, "0");
assert.equal(score.style.marginLeft, "0.4rem");
assert.match(score.className, /\bfont-body\b/);

const weighted = score.querySelector('[data-wys-score-part="weighted"]');
const efficiency = score.querySelector('[data-wys-score-part="efficiency"]');
assert.equal(weighted.textContent, "W4.63");
assert.equal(weighted.style.fontSize, "0.8em");
assert.equal(weighted.style.fontWeight, "400");
assert.equal(efficiency.textContent, "E114");
assert.equal(efficiency.style.fontSize, "0.8em");
assert.equal(efficiency.style.fontWeight, "700");
assert.equal(
  weighted.style.fontSize,
  efficiency.style.fontSize,
  "W and E must share a baseline-friendly font size",
);

assert.equal(
  renderBuildingListScore(
    row,
    { score: 2.66, priority: 66 },
    fakeDocument,
  ),
  true,
);
assert.equal(
  row.children.length,
  1,
  "rerendering must not duplicate the row structure",
);
assert.equal(
  name.children.filter((element) =>
    element.hasAttribute("data-wys-building-list-score")).length,
  1,
  "rerendering must reuse the dedicated score element",
);
assert.equal(weighted.textContent, "W2.66");
assert.equal(efficiency.textContent, "E66");

globalThis.Locale = { compose: () => "Food" };
assert.equal(
  renderBuildingListScore(row, { score: 2.66, priority: 66 }, fakeDocument),
  true,
);
assert.equal(
  score.getAttribute("aria-label"),
  "Weighted value W2.66, efficiency E66",
);

clearBuildingListScore(row);
assert.equal(row.querySelector("[data-wys-building-list-score]"), null);
assert.equal(name.textContent, "ポルタル・デ・メルカデレス");

console.log("building list score tests passed.");
