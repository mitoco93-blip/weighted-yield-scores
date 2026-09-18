// Keep native conditional nodes and insertion anchors in their original parents.
// Use an ordinary, stretched cost column: the game rejects CSS var() fallbacks,
// and out-of-flow clock positioning behaved differently from browser fixtures.
const layouts = new WeakMap();
const STYLE_ID = 'wys-production-row-layout';
const CSS = `
[data-wys-production-row-layout] { display: flex; width: 100%; min-width: 0; }
[data-wys-row-chooser] { width: 100%; min-width: 0; flex: 1 1 auto; }
[data-wys-production-row-layout] .hud_sidepanel_list-bg-no-fill { min-width: 0; flex: 1 1 0%; }
[data-wys-row-body] { min-width: 0; flex: 1 1 0%; }
[data-wys-row-info] { min-width: 0; flex: 1 1 0%; }
[data-wys-row-header] {
  display: flex; flex-direction: row; flex-wrap: nowrap;
  align-items: center; align-self: stretch; width: 100%; min-width: 0;
}
[data-wys-row-name] {
  display: block; flex: 0 1 auto; text-overflow: ellipsis;
  min-width: 0; white-space: nowrap; overflow: hidden; margin-right: 0;
}
[data-wys-row-name] > * {
  min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
}
[data-wys-row-tags], [data-wys-ageless-container], [data-wys-recommendations] { flex: 0 0 auto; }
[data-wys-row-tags] { margin-left: 0.25rem; }
[data-wys-ageless-container] { display: flex; align-items: center; align-self: center; }
[data-wys-row-right] {
  flex: 0 0 auto; align-self: stretch; margin-left: 0.25rem;
}
[data-wys-production-row-layout="standard"] [data-wys-row-right] {
  display: flex; flex-direction: column; justify-content: space-between;
  align-items: flex-end; padding-top: 0.444444rem; padding-bottom: 0.333333rem;
  min-height: 3.555556rem;
}
[data-wys-native-cost] { flex: 0 0 auto; align-self: flex-end; }
[data-wys-native-cost] > div > div { display: none; }
[data-wys-native-cost] > div { margin-right: 0.111111rem; }
[data-wys-native-cost] > div > span:last-child { margin-right: 0; }
[data-wys-recommendations] { display: flex; align-items: center; }
[data-wys-recommendations] > * { margin-left: 0.25rem; margin-right: 0; }
[data-wys-row-right] > [data-wys-production-cost] {
  display: flex; flex: 0 0 auto; align-items: center;
  color: #85878c; white-space: nowrap; margin-right: 0.111111rem;
}
[data-wys-row-right] > [data-wys-production-cost][hidden] { display: none; }
[data-wys-row-right] > [data-wys-production-cost] [data-wys-cost-icon] {
  flex-shrink: 0; width: 1.333333rem; height: 1.333333rem; margin-left: 0.222222rem; margin-right: 0.222222rem;
  background-position: center; background-size: contain; background-repeat: no-repeat;
}
[data-wys-production-row-layout="city-hall"] [data-wys-row-right] {
  align-items: stretch; margin-top: 0.222222rem; margin-bottom: 0.222222rem;
}
[data-wys-production-row-layout="city-hall"] [data-wys-row-right] > * {
  flex-direction: column; justify-content: space-between; align-items: flex-end;
}
[data-wys-production-row-layout="city-hall"] .bz-pci-recs { margin-left: 0; margin-right: 0; }
[data-wys-production-row-layout] [data-wys-ageless-icon] {
  width: 1.25rem; min-width: 1.25rem; max-width: 1.25rem;
  height: 1.25rem; min-height: 1.25rem; flex: 0 0 1.25rem;
  padding: 0; margin: 0 0.25rem; border: 0 !important; border-radius: 0;
  background-color: transparent !important; background-image: url("blp:city_ageless");
  background-position: center; background-repeat: no-repeat; background-size: contain;
  pointer-events: auto; align-self: center;
}
[data-wys-ageless-icon] > * { display: none; }
[data-wys-row-info] > .bz-pci-details,
[data-wys-row-info] > .bz-pci-yields,
[data-wys-row-info] > .text-sm { min-width: 0; max-width: 100%; flex-wrap: wrap; }
[data-wys-row-info] [data-wys-yield-part] {
  flex: 0 0 auto; white-space: nowrap; margin-right: 0.444444rem; letter-spacing: normal;
}
[data-wys-production-row-layout="standard"] [data-wys-row-info] > .text-sm .flex.items-center { margin-right: 0.444444rem; }
[data-wys-production-row-layout="standard"] [data-wys-row-info] > .text-sm img:not([data-wys-yield-icon]) { width: 1.333333rem; height: 1.333333rem; margin-left: 0; margin-right: 0; }
[data-wys-yield-icon] { margin-left: 0; margin-right: 0; }
[data-wys-yield-density="dense"] [data-wys-yield-part],
[data-wys-production-row-layout="standard"] [data-wys-row-info] > .text-sm[data-wys-yield-density="dense"] .flex.items-center { margin-right: 0.111111rem; }
[data-wys-yield-density="dense"] [data-wys-yield-part] img,
[data-wys-production-row-layout="standard"] [data-wys-row-info] > .text-sm[data-wys-yield-density="dense"] img { margin-right: -0.111111rem; }
`;

function ensureStyles(doc) {
  if (!doc?.head || doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = STYLE_ID; style.textContent = CSS; doc.head.appendChild(style);
}
function syncAgelessIcon(layout) {
  const pill = layout.tags
    ? layout.tags.querySelector('.bz-pci-ageless')
    : layout.ageless.querySelector('.rounded-full');
  if (!pill || pill.hasAttribute('data-wys-ageless-icon')) return;
  const label = pill.textContent.trim();
  if (!label) return;
  pill.setAttribute('data-wys-ageless-icon', '');
  pill.setAttribute('role', 'img');
  pill.setAttribute('aria-label', label);
  pill.setAttribute('data-tooltip-content', label);
}
// Match City Hall's count threshold. Observe rebuilt yield rows, not geometry.
function syncYieldSpacing(layout) {
  for (const line of Array.from(layout.info.children)) {
    const parts = Array.from(line.children).filter(el => el.hasAttribute('data-wys-yield-part'));
    const nativePreview = !layout.tags && line.classList.contains('text-sm');
    const count = parts.length || (nativePreview ? line.children.length : 0);
    if (count) line.setAttribute('data-wys-yield-density', count >= 6 ? 'dense' : 'sparse');
    else line.removeAttribute('data-wys-yield-density');
  }
}
function syncStandardExtras(layout) {
  if (layout.tags) return;
  // Reflect only the recommendation decoration; native cost spans and all their
  // Solid anchors stay in place. No purchase/build actions are intercepted.
  const nativeLine = layout.nativeCost.firstElementChild;
  const recommendation = Array.from(nativeLine?.children ?? []).find(el => el.tagName === 'DIV');
  // Same number-size classes as City Hall: text-xs for hammers, text-sm for turns.
  Array.from(nativeLine?.children ?? []).find(el => el.tagName === 'SPAN')?.classList.add('text-sm');
  const signature = recommendation?.outerHTML ?? '';
  if (signature !== layout.recommendationSignature) {
    layout.recommendationSignature = signature;
    layout.recommendations.textContent = '';
    if (recommendation) layout.recommendations.appendChild(recommendation.cloneNode(true));
  }
  const raw = layout.row.getAttribute('data-wys-production-cost');
  const amount = raw == null || raw === '' ? NaN : Number(raw);
  layout.productionCost.hidden = !Number.isFinite(amount) || amount <= 0;
  const formatted = Number.isFinite(amount)
    ? (globalThis.Locale?.compose?.('{1_Cost: number #,###.##}', amount) ?? String(amount)) : '';
  if (layout.productionValue.textContent !== formatted) layout.productionValue.textContent = formatted;
}
// Read the existing left-hand layout; only translate the complete right-hand
// cost group. Relative positioning keeps its original space and width intact.
function alignLowerCost(layout) {
  if (!layout.row.isConnected) return;
  const cost = layout.tags ? layout.right.querySelector('.bz-pci-cost') : layout.nativeCost;
  if (!cost) return;
  const parts = Array.from(layout.info.querySelectorAll('[data-wys-yield-part]'));
  const detail = Array.from(layout.info.children).find(el =>
    el.classList.contains('text-sm') || el.classList.contains('bz-pci-details') ||
    el.classList.contains('bz-pci-yields'));
  const target = parts.length ? parts[parts.length - 1] : detail;
  const targetBox = target?.getBoundingClientRect();
  const costBox = cost.getBoundingClientRect();
  let offset = 0;
  if (targetBox?.height > 0 && targetBox.width > 0 && costBox.height > 0) {
    const scale = cost.offsetHeight > 0 ? costBox.height / cost.offsetHeight : 1;
    const previous = Number.parseFloat(cost.style.top) || 0;
    offset = previous + ((targetBox.top + targetBox.bottom - costBox.top - costBox.bottom) / 2) / scale;
    if (!Number.isFinite(offset)) offset = 0;
  }
  // Limit rounding noise without accumulating the preceding correction.
  const value = (Math.round(offset * 64) / 64) + 'px';
  cost.style.position = 'relative';
  if (cost.style.top !== value) cost.style.top = value;
}
function scheduleLowerAlignment(layout, doc) {
  alignLowerCost(layout);
  if (layout.alignmentPending) return;
  layout.alignmentPending = true;
  const view = doc.defaultView ?? globalThis;
  const next = () => {
    layout.alignmentPending = false;
    if (layouts.get(layout.row) === layout) alignLowerCost(layout);
  };
  if (view.requestAnimationFrame) view.requestAnimationFrame(next);
  else view.setTimeout?.(next, 0);
}
function installExtras(layout, doc) {
  if (!layout.tags) {
    layout.ageless.setAttribute('data-wys-ageless-container', '');
    layout.nativeCost.setAttribute('data-wys-native-cost', '');
    // The ageless container is permanent in the game's template.
    layout.header.appendChild(layout.ageless);
    layout.recommendations = doc.createElement('div');
    layout.recommendations.setAttribute('data-wys-recommendations', '');
    layout.header.appendChild(layout.recommendations);
    layout.productionCost = doc.createElement('div');
    layout.productionCost.setAttribute('data-wys-production-cost', '');
    layout.productionValue = doc.createElement('span');
    layout.productionValue.className = 'text-xs';
    const icon = doc.createElement('span');
    icon.setAttribute('data-wys-cost-icon', '');
    icon.style.backgroundImage = 'url(Yield_Production)';
    icon.setAttribute('aria-label', globalThis.Locale?.compose?.('LOC_YIELD_PRODUCTION') ?? 'Production');
    layout.productionCost.appendChild(layout.productionValue);
    layout.productionCost.appendChild(icon);
    layout.right.insertBefore(layout.productionCost, layout.nativeCost);
  }
  syncAgelessIcon(layout); syncStandardExtras(layout); syncYieldSpacing(layout); scheduleLowerAlignment(layout, doc);
  const Resize = doc.defaultView?.ResizeObserver ?? globalThis.ResizeObserver;
  if (Resize) {
    layout.resizeObserver = new Resize(() => scheduleLowerAlignment(layout, doc));
    layout.resizeObserver.observe(layout.row);
    layout.resizeObserver.observe(layout.info);
    layout.resizeObserver.observe(layout.right);
  }
  doc.fonts?.ready?.then(() => {
    if (layouts.get(layout.row) === layout) scheduleLowerAlignment(layout, doc);
  });
  const Observer = doc.defaultView?.MutationObserver ?? globalThis.MutationObserver;
  if (!Observer) return;
  layout.observer = new Observer(() => { syncAgelessIcon(layout); syncStandardExtras(layout); syncYieldSpacing(layout); scheduleLowerAlignment(layout, doc); });
  layout.observer.observe(layout.info, {childList: true, subtree: true});
  if (layout.tags) layout.observer.observe(layout.right, {childList: true, characterData: true, subtree: true});
  if (!layout.tags) {
    layout.observer.observe(layout.nativeCost, {childList: true, characterData: true, subtree: true});
    layout.observer.observe(layout.row, {attributes: true, attributeFilter: ['data-wys-production-cost']});
  }
}

export function findProductionName(row) {
  return row?.querySelector?.('.font-title.text-accent-2.uppercase') ?? null;
}
export function arrangeProductionRow(row, doc = globalThis.document) {
  if (!row?.querySelector || !doc?.createElement) return null;
  const previous = layouts.get(row);
  if (previous && row.contains(previous.header) && row.contains(previous.name)) {
    syncAgelessIcon(previous); syncStandardExtras(previous); syncYieldSpacing(previous); scheduleLowerAlignment(previous, doc); return previous;
  }
  previous?.observer?.disconnect();
  previous?.resizeObserver?.disconnect();
  const name = findProductionName(row);
  if (!name?.parentElement) return null;
  const cityHall = Boolean(row.querySelector('.bz-pci-icon'));
  let header = cityHall ? name.parentElement : null;
  const info = cityHall ? header.parentElement : name.parentElement;
  const right = info?.nextElementSibling;
  const body = info?.parentElement;
  if (!body || !right || !info.classList.contains('flex-col')) return null;
  const tags = cityHall ? name.nextElementSibling : null;
  const ageless = cityHall ? null : right.children[0];
  const nativeCost = cityHall ? null : right.children[1];
  if (cityHall) {
    if (!header.classList.contains('flex-row') || !tags) return null;
  } else {
    if (name.tagName !== 'SPAN' || !right.classList.contains('flex-col') || !ageless || !nativeCost) return null;
    header = doc.createElement('div'); info.insertBefore(header, name); header.appendChild(name);
  }
  ensureStyles(doc);
  row.setAttribute('data-wys-production-row-layout', cityHall ? 'city-hall' : 'standard');
  row.querySelector('.fxs-chooser-item')?.setAttribute('data-wys-row-chooser', '');
  body.setAttribute('data-wys-row-body', '');
  info.setAttribute('data-wys-row-info', '');
  header.setAttribute('data-wys-row-header', '');
  name.setAttribute('data-wys-row-name', '');
  right.setAttribute('data-wys-row-right', '');
  tags?.setAttribute('data-wys-row-tags', '');
  const layout = {row, info, name, header, tags, right, ageless, nativeCost, scoreAnchor: tags ?? ageless};
  installExtras(layout, doc);
  layouts.set(row, layout);
  return layout;
}
export function updateProductionRowCosts(row, item, city, doc = globalThis.document) {
  const layout = arrangeProductionRow(row, doc);
  if (!layout) return;
  if (!layout.tags) {
    const cost = productionCostForItem(item, city);
    const value = cost == null ? '' : String(cost);
    if (row.getAttribute('data-wys-production-cost') !== value) row.setAttribute('data-wys-production-cost', value);
    syncStandardExtras(layout);
  }
}

export function productionCostForItem(item, city) {
  if (!item) return null;
  if (item.productionCost != null && item.productionCost !== '' &&
      Number.isFinite(Number(item.productionCost))) return Number(item.productionCost);
  const type = item.type;
  if (!type || !city?.Production) return null;
  try {
    const constructible = globalThis.GameInfo?.Constructibles?.lookup?.(type);
    if (constructible) {
      const total = Number(city.Production.getConstructibleProductionCost?.(constructible.$hash));
      const progress = Number(city.BuildQueue?.getProgress?.(constructible.$hash) ?? 0);
      return Number.isFinite(total) && Number.isFinite(progress) ? Math.max(0, total - progress) : null;
    }
    const unit = globalThis.GameInfo?.Units?.lookup?.(type);
    if (unit) {
      const total = Number(city.Production.getUnitProductionCost?.(unit.$hash));
      return Number.isFinite(total) ? total : null;
    }
    if (item.category === 'projects') {
      const total = Number(city.Production.getProjectProductionCost?.(type));
      return Number.isFinite(total) ? total : null;
    }
  } catch (_) { /* Unsupported row types retain their native cost display. */ }
  return null;
}

