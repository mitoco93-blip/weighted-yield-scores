import { getModLanguage } from './i18n.js';
import { formatScore } from './scorer.js';

function localizedResourceName(type) {
  if (!type) return "";
  let definition;
  try {
    const table = globalThis.GameInfo?.Resources;
    definition = table?.lookup?.(type);
    if (!definition && table?.[Symbol.iterator]) {
      definition = Array.from(table).find(row => row.ResourceType === type);
    }
  } catch { /* A readable type name remains available during loading. */ }
  const key = definition?.Name ?? `LOC_${type}_NAME`;
  try {
    const translated = globalThis.Locale?.compose?.(key);
    if (translated && translated !== key) return translated;
  } catch { /* Keep the detail available when a translation is missing. */ }
  return String(type).replace(/^RESOURCE_/, '').toLowerCase().replaceAll('_', ' ');
}

// Keep unavailable game data separate from missing mod data/implementations.
const RESOURCE_ISSUE_MESSAGES = {
  "military-data": [
    "※所有ユニット一覧を取得できないため、戦闘力ボーナスは未算入です。",
    "The owned-unit list is unavailable; combat strength bonuses are omitted."
  ],
  "construction-data": [
    "※建設コスト・ターン・速度の情報が不足し、一部の建設ボーナスは未算入です。",
    "Construction cost, turn or speed information is unavailable; some construction bonuses are omitted."
  ],
  "unknown-resource": [
    "※この時代の資源効果データがMODに未登録のため、資源固有の効果は未算入です。",
    "The mod has no effect data for this resource in this age; resource-specific effects are omitted."
  ],
  "game-state": [
    "※ゲームの基本情報を取得・識別できないため、資源効果は簡易評価です。",
    "Basic game information cannot be read or identified; resource effects use a fallback estimate."
  ],
  "unsupported": [
    "※MODに計算処理のない資源効果があり、その効果は未算入です。",
    "The mod does not yet support calculating some resource effects; those effects are omitted."
  ]
};

export function resourceDetailLines(value) {
  if (!value) return [];
  const ja = getModLanguage() === 'ja';
  const score = Number(value.score ?? ['unassigned', 'uplift', 'empire', 'special']
    .reduce((total, key) => total + Number(value[key] ?? 0), 0));
  const scoreKnown = Number.isFinite(score);
  const lines = value.resourceType || Math.abs(score) > 1e-9
    ? [scoreKnown
      ? `${score >= 0 ? '+' : '−'} ${ja ? '資源価値' : 'Resource value'}: ${formatScore(Math.abs(score),2)}`
      : (ja ? '資源価値：算出できません' : 'Resource value: unavailable')]
    : [];
  for (const capped of value.cappedCombatEffects ?? []) {
    const resourceName = localizedResourceName(capped.resourceType);
    lines.push(ja
      ? '※' + resourceName + 'は' + capped.nextCopy + '個目（既存' + capped.owned + '個）。戦闘力は上限＋' + capped.strengthCap + 'に達しているため、追加分の評価は0です。'
      : resourceName + ': copy ' + capped.nextCopy + ' (' + capped.owned + ' already owned). Combat strength is at the +' + capped.strengthCap + ' cap; this copy adds 0 combat value.');
  }
  for (const target of value.missingCombatTargets ?? []) {
    const cavalryOnly = target.tags.length === 1 && target.tags[0] === 'UNIT_CLASS_CAVALRY';
    lines.push(ja
      ? '※' + (cavalryOnly ? '対象の騎兵' : '効果の対象となる軍事ユニット') + 'を所有していないため、戦闘力ボーナスの評価は0です。'
      : 'No ' + (cavalryOnly ? 'cavalry units' : 'eligible military units') + ' are currently owned; the combat strength bonus has a value of 0.');
  }
  const name = localizedResourceName(value.resourceType);
  if (name && (lines.length || value.issues?.length)) lines.unshift(ja ? `評価対象資源：${name}` : `Resource evaluated: ${name}`);
  const warnings = (value.issues ?? []).map(issue => {
    const message = RESOURCE_ISSUE_MESSAGES[issue] ?? RESOURCE_ISSUE_MESSAGES.unsupported;
    return message[ja ? 0 : 1];
  });
  lines.push(...new Set(warnings));
  if (value.resourceType && scoreKnown && Math.abs(score) <= 1e-9 && lines.length === 2) {
    lines.push(value.reason === 'excluded-resource'
      ? (ja ? '※この資源はMODの評価対象外です。' : 'This resource is excluded from the mod evaluation.')
      : (ja ? '※現在の条件・評価設定では、資源効果による加点はありません。' : 'This resource adds no value under the current conditions and evaluation settings.'));
  }
  return lines;
}

