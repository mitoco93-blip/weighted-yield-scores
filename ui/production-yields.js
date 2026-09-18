import { Icon } from "/core/ui/utilities/utilities-image.js";

const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char =>
  ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"})[char]);

// Use City Hall's direct YIELD image + ordinary localized number structure in
// every configuration. Inline [icon:...] text has a separate rendering path.
// Inherit the row's native text size, including City Hall's compact text-xs.
export function correctedYieldDetailsHTML(evaluation) {
  const record = evaluation?.correctedRecord ?? {};
  const parts = [];
  for (const definition of globalThis.GameInfo?.Yields ?? []) {
    const type = definition?.YieldType;
    if (!type) continue;
    const value = Number(record[type] ?? 0);
    if (!Number.isFinite(value) || Math.abs(value) < 1e-9) continue;
    const amount = escapeHTML(globalThis.Locale?.compose?.(
      "LOC_UI_CITY_DETAILS_YIELD_ONE_DECIMAL", value,
    ) ?? (value > 0 ? "+" + value : String(value)));
    const text = value < 0 ? '<span class="text-negative">' + amount + '</span>' : amount;
    const icon = escapeHTML(Icon.getYieldIcon(type));
    const label = escapeHTML(globalThis.Locale?.compose?.(definition.Name ?? type) ?? type);
    parts.push('<div data-wys-yield-part class="flex items-center mr-2">' +
      '<img data-wys-yield-icon aria-label="' + label + '" src="' + icon + '" class="size-6 mr-0" />' + text + '</div>');
  }
  return parts.join("");
}
