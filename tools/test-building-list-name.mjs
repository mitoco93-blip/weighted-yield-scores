import assert from "node:assert/strict";
import { applyFixedBuildingListName } from "../ui/building-list-name.js";

const locale = {
  compose(name) {
    return {
      LOC_YIELD_FOOD: "食料",
      LOC_BUILDING_PORTAL_NAME: "ポルタル・デ・メルカデレス",
      LOC_BUILDING_GOLDEN_AGE_ACADEMY_NAME: "黄金時代のアカデミー",
      LOC_BUILDING_GOLDEN_AGE_AMPHITHEATER_NAME: "黄金時代の円形闘技場",
    }[name] ?? name;
  },
};

for (const [localizationKey, expectedShortName] of [
  ["LOC_BUILDING_PORTAL_NAME", "ポルタル・デ・メル…"],
]) {
  const item = { name: localizationKey };
  assert.equal(applyFixedBuildingListName(item, locale), true);
  assert.equal(item.name, expectedShortName);
  assert.equal(item.wysOriginalName, localizationKey);

  assert.equal(applyFixedBuildingListName(item, locale), true);
  assert.equal(item.name, expectedShortName);
  assert.equal(
    item.wysOriginalName,
    localizationKey,
    "reapplying must preserve the native localization key",
  );
}

for (const localizationKey of [
  "LOC_BUILDING_GOLDEN_AGE_ACADEMY_NAME",
  "LOC_BUILDING_GOLDEN_AGE_AMPHITHEATER_NAME",
]) {
  const item = { name: localizationKey };
  assert.equal(applyFixedBuildingListName(item, locale), false);
  assert.deepEqual(
    item,
    { name: localizationKey },
    `${localizationKey} must remain unshortened in Japanese`,
  );
}

const englishLocale = {
  compose(name) {
    return {
      LOC_YIELD_FOOD: "Food",
      LOC_BUILDING_PORTAL_NAME: "Portal de Mercaderes",
      LOC_BUILDING_DEFENSIVE_FORTIFICATIONS_NAME: "Defensive Fortifications",
      LOC_BUILDING_HIGHLAND_POWER_STATION_NAME: "Highland Power Station",
      LOC_BUILDING_JARDIN_A_LA_FRANCAISE_NAME: "Jardin à la Française",
      LOC_BUILDING_CASA_DE_CONTRATACION_NAME: "Casa de Contratación",
      LOC_BUILDING_WATER_PUPPET_THEATER_NAME: "Water Puppet Theater",
      LOC_BUILDING_GOLDEN_AGE_ACADEMY_NAME: "Golden Age Academy",
      LOC_BUILDING_GOLDEN_AGE_AMPHITHEATER_NAME: "Golden Age Amphitheater",
    }[name] ?? name;
  },
};

for (const [localizationKey, expectedShortName] of [
  ["LOC_BUILDING_DEFENSIVE_FORTIFICATIONS_NAME", "Defensive Fortif…"],
  ["LOC_BUILDING_HIGHLAND_POWER_STATION_NAME", "Highland Power S…"],
  ["LOC_BUILDING_JARDIN_A_LA_FRANCAISE_NAME", "Jardin à la Fran…"],
  ["LOC_BUILDING_PORTAL_NAME", "Portal de Mercad…"],
  ["LOC_BUILDING_CASA_DE_CONTRATACION_NAME", "Casa de Contrata…"],
  ["LOC_BUILDING_WATER_PUPPET_THEATER_NAME", "Water Puppet The…"],
]) {
  const item = { name: localizationKey };
  assert.equal(applyFixedBuildingListName(item, englishLocale), true);
  assert.equal(item.name, expectedShortName);
  assert.equal(item.wysOriginalName, localizationKey);
}

for (const name of ["Temple of Jupiter", "Military Academy", "Department Store"]) {
  const ordinary = { name };
  assert.equal(applyFixedBuildingListName(ordinary, englishLocale), false);
  assert.deepEqual(ordinary, { name }, `${name} must remain unshortened`);
}

for (const [name, expectedShortName] of [
  ["12345678901234567890", "1234567890123456…"],
  ["123456789012345678901", "1234567890123456…"],
]) {
  const boundary = { name };
  assert.equal(applyFixedBuildingListName(boundary, englishLocale), true);
  assert.equal(boundary.name, expectedShortName);
}

for (const name of ["学舎", "大聖堂", "王宮"]) {
  const ordinary = { name };
  assert.equal(applyFixedBuildingListName(ordinary, locale), false);
  assert.deepEqual(
    ordinary,
    { name },
    `ordinary building name ${name} must stay untouched`,
  );
}

console.log("building list fixed-name tests passed.");
