import { RESOURCE_EFFECTS } from '../resource-catalog.js';
import { getModLanguage } from '../i18n.js';

export const AGE_KEYS = ['antiquity','exploration','modern'];
export const resourceText = (ja,en) => getModLanguage() === 'ja' ? ja : en;
export const SHARED_FIELDS = [
 ['resourcePlacementPercent','配置型資源の活用見込み（％）','Expected use of slotted resources (%)', {
  help:['未配置時の価値を基準に、最適配置で増える価値を何％評価に加えるかを設定します。0％なら未配置時、100％なら最適配置時、50％なら両者の中間の価値になります。','Choose how much of the gain from optimal placement to add to the unassigned value. 0% uses the unassigned value, 100% uses optimal placement, and 50% uses the midpoint.']}],
 ['resourceCelebrationPercent','祝宴が続く期間の割合（％）','Share of time in celebrations (%)', {
  help:['時代全体のうち、祝宴中になる期間の割合です。祝宴中だけ働く資源効果の評価に使います。50％なら、時代の半分は祝宴中として計算します。','The share of the age spent in celebrations. Used to value resource effects that apply only during celebrations. At 50%, half the age is treated as celebration time.']}],
];
export function ageFields(age) {
 const suffix={antiquity:'Antiquity',exploration:'Exploration',modern:'Modern'}[age];
 const fields=[
  [`resourceProduction${suffix}`,'生産力の使い道','Production spending', {
   parts:[['建物','Buildings'],['遺産','Wonders'],['ユニット','Units']],
   help:['この時代を通して、建物・遺産・ユニットの生産に使う生産力の割合を設定します。1・1・1なら、それぞれ3分の1として資源の生産ボーナスを評価します。比率の合計は自動で調整されます。','Set the share of production spent on buildings, wonders and units throughout this age. Values of 1, 1 and 1 give each one third. These shares are used to value resource production bonuses and are normalized automatically.']}],
  [`resourceCombatScience${suffix}`,'戦闘力の評価（科学力換算）','Combat strength value (Science equivalent)', {
   help:['戦闘力＋1を、科学力いくつ分の価値として評価するかを設定します。初期値は、外交の軍事支援と科学支援の効果を比較して決めています。実際の資源評価には、現在所有している軍事ユニットのうち、その効果が適用されるユニットの割合も反映します。','Set the Science-equivalent value of +1 Combat Strength. Defaults compare diplomatic military support with scientific support. Resource values also account for the share of your current military units affected by the bonus.']}],
 ];
 if(age !== 'modern') fields.push([`resourceNavy${suffix}`,'ユニット生産の内訳','Unit production breakdown', {
  parts:[['海軍','Naval'],['その他','Other']],
  help:['ユニットの生産に使う生産力のうち、海軍に使う割合を設定します。「その他」には陸上の軍事ユニットやサポートユニットを含みます。海軍の生産ボーナスを持つ資源の評価に使います。','Set how much unit production is spent on naval units. Other includes land military units and support units. Used to value resources that boost naval production.']}]);
 if(age === 'antiquity') fields.push(['resourceWonderBiomesAntiquity','遺産生産の内訳','Wonder production breakdown', {
  parts:[['大理石の対象','Marble targets'],['象牙の対象','Ivory targets']],
  help:['遺産の生産に使う生産力を、大理石の生産ボーナスが適用される遺産と、象牙の生産ボーナスが適用される遺産に、どのくらい振り分けるかを設定します。1・1なら、それぞれ半分として評価します。','Split wonder production between wonders eligible for Marble and Ivory bonuses. Values of 1 and 1 assign half to each.']}]);
 if(age === 'exploration') fields.push(['resourceIncenseActive','香料1個の使い方','Use of one Incense resource', {
  parts:[['配置して生産に活用','Slotted and used for production'],['未配置','Unassigned']],
  help:['香料1個について、配置先で対象ユニット・建物の生産に活用する期間と、未配置にする期間の割合を設定します。配置先の生産力は、帝国全体の都市の平均値を使います。簡略化のため、配置したまま生産に活用しない期間は考慮しません。','For one Incense resource, set the time spent slotted and used to produce eligible units or buildings versus time left unassigned. Destination production uses the average across cities in your empire. For simplicity, time spent slotted but not used for eligible production is omitted.']}]);
 if(age === 'modern') fields.push(
  ['resourceCivilianModern','ユニット生産の内訳','Unit production breakdown', {
   parts:[['民間','Civilian'],['軍事','Military']],
   help:['ユニットの生産に使う生産力を、民間ユニットと軍事ユニットに振り分ける割合です。民間には探検家や開拓者などを含みます。資源の生産ボーナスを評価する際に使います。','Split unit production between civilian and military units. Civilian units include Explorers and Settlers. Used to value resource production bonuses.']}],
  ['resourceMilitaryModern','軍事ユニット生産の内訳','Military production breakdown', {
   parts:[['陸軍','Land'],['海軍','Naval'],['航空','Air']],
   help:['軍事ユニットの生産に使う生産力を、陸軍・海軍・航空に振り分ける割合です。資源の生産ボーナスの評価に使います。戦闘力ボーナスの評価には、この設定ではなく現在所有しているユニットの割合を使います。','Split military production between land, naval and air units. Used for production bonuses. Combat strength bonuses use your currently owned units instead.']}],
  ['resourceConstructionPercent','生産で建てる都市の割合（％）','Cities building with production (%)', {
   section:['指定建物の建設','Specified building construction'], subtitle:['対象：工場・鉄道駅・港 ／ ターン数は標準速度基準','Applies to: Factories, Rail Stations and Ports / Turns use Standard speed'],
   help:['帝国の都市のうち、工場・鉄道駅・港を生産で建てると見込む割合です。80％なら、都市の8割で建設するとして、資源の建設ボーナスを評価します。購入する場合は含みません。','The share of your cities expected to build Factories, Rail Stations and Ports using production. 80% values construction bonuses assuming eight in ten cities build them. Purchases are not included.']}],
  ['resourceEraEndTurn','想定する近代終了ターン','Expected Modern Age end turn', {
   help:['近代が何ターン目に終わると見込むかを設定します。資源の建設ボーナスで節約できる生産力を、時代終了までの残りターンで割り、毎ターンの産出と比較できる価値に換算します。標準速度のターン数で入力し、ゲーム速度に合わせて自動換算します。','The expected end turn of the Modern Age. Production saved by resource construction bonuses is divided by the turns remaining until this point to compare it with per-turn yields. Enter Standard-speed turns; the value scales automatically with game speed.']}],
  ['resourceConstructionUsefulTurn','建設期限','Construction deadline', {
   help:['工場・鉄道駅・港を、近代の何ターン目までに建てると見込むかを設定します。想定する近代終了より早い期限を設け、建設後に活用する期間を確保します。この期限を過ぎると、資源の建設ボーナスは評価に加えません。標準速度のターン数で入力し、ゲーム速度に合わせて自動換算します。','The Modern Age turn by which you expect Factories, Rail Stations and Ports to be built. A deadline before the expected age end leaves time to use them. Construction bonuses add no value once this deadline is reached. Enter Standard-speed turns; the value scales automatically with game speed.']}],
  ['resourceHealingScience','回復効果の評価（科学力換算）','Healing value (Science equivalent)', {
   section:['回復効果','Healing'],subtitle:['対象：キニーネ','Applies to: Quinine'],
   help:['資源による毎ターンの回復量＋1を、科学力いくつ分の価値として評価するかを設定します。初期値7.5は、科学属性と軍事属性の最終段階の報酬を比較して決めています。','Set the Science-equivalent value of +1 healing per turn from resources. The default of 7.5 compares the final-tier rewards of the Scientific and Militaristic attribute trees.']}],
 );
 return fields;
}

const OMIT = new Set(['RESOURCE_LAPIS_LAZULI','RESOURCE_LAPIS','RESOURCE_CLOVES','RESOURCE_NICKEL','RESOURCE_GOLD_DISTANT_LANDS','RESOURCE_SILVER_DISTANT_LANDS']);
export function resourcesForAge(age) {
 const types = new Set(RESOURCE_EFFECTS.filter(row=>row.era===age && !OMIT.has(row.args.ResourceType)).map(row=>row.args.ResourceType));
 if(age!=='modern') types.add('RESOURCE_CAMELS');
 // Sort by scope, then effect, so related settings remain adjacent in every age.
 // Keep the same resource IDs and modifier keys used by saved settings.
 const keys=new Map([...types].map(type=>[type,resourceOrderKey(age,type)]));
 return [...types].sort((a,b)=>{
  const left=keys.get(a),right=keys.get(b);
  for(let i=0;i<left.length;i++)if(left[i]!==right[i])return left[i]-right[i];
  return a.localeCompare(b);
 });
}

function resourceOrderKey(age,type) {
 const rows=effectsForResource(age,type);
 const factory=rows.some(r=>r.args.GlobalSlots==='true' || r.effect.includes('PER_SLOTTED_RESOURCE'));
 const empire=rows.some(r=>r.args.Empire==='true' || /AVAILABLE_RESOURCE_TYPE|PLAYER_ADJUST_YIELD_PER_RESOURCE_TYPE|PLAYER_ADJUST_UNIT_PRODUCTION|COMBAT|HEAL|BUILDING_PRODUCTION_EFFICIENCY/.test(r.effect));
 const scope=factory?2:empire?1:0;
 let kind;
 if(rows.some(r=>r.effect.includes('COMBAT')))kind=6;
 else if(rows.some(r=>r.effect.includes('HEAL')))kind=7;
 else if(rows.some(r=>r.effect.includes('UNIT_PRODUCTION')))kind=5;
 else if(rows.some(r=>/CONSTRUCTIBLE_PRODUCTION|BUILDING_PRODUCTION_EFFICIENCY|BIOME_WONDER_PRODUCTION/.test(r.effect)))
  kind=rows.some(r=>r.effect.includes('BIOME_WONDER_PRODUCTION') || r.args.ConstructibleClass==='WONDER')?3:4;
 else if(rows.some(r=>r.effect==='slots'))kind=8;
 else if(rows.some(r=>r.effect.includes('CONSTRUCTIBLE_YIELD')))kind=2;
 else kind=rows.some(r=>r.args.PercentMultiplier==='true' || r.effect.includes('GROWTH'))?1:0;
 const yields=['YIELD_FOOD','YIELD_PRODUCTION','YIELD_GOLD','YIELD_SCIENCE','YIELD_CULTURE','YIELD_HAPPINESS','YIELD_DIPLOMACY'];
 const yieldOrder=Math.min(...rows.map(r=>r.effect.includes('GROWTH')?0:yields.indexOf(r.args.YieldType)).filter(i=>i>=0),yields.length);
 return [scope,kind,yieldOrder];
}
export function resourceName(type) {
 const def=globalThis.GameInfo?.Resources?.lookup?.(type);
 const key=def?.Name ?? `LOC_${type}_NAME`;
 const name=globalThis.Locale?.compose?.(key);
 return name && name!==key ? name : type.replace('RESOURCE_','').toLowerCase().replaceAll('_',' ');
}
export function effectsForResource(age,type) {
 const rows=RESOURCE_EFFECTS.filter(row=>row.era===age && row.args.ResourceType===type);
 if(type==='RESOURCE_CAMELS') rows.push({era:age,id:'slots',args:{ResourceType:type},effect:'slots',requirements:[]});
 return rows;
}
// Related modifiers describe one resource bonus. Present one adjustment while
// retaining the existing per-modifier storage keys and evaluation data.
export function effectSettingsForResource(age,type) {
 const groups=[],byBonus=new Map();
 const combine=['RESOURCE_IVORY','RESOURCE_MARBLE','RESOURCE_LIMESTONE'].includes(type);
 for(const row of effectsForResource(age,type)) {
  const biome=combine && row.effect.includes('BIOME_WONDER_PRODUCTION');
  const coffee=age==='modern' && type==='RESOURCE_COFFEE'
   && row.effect.endsWith('ADJUST_CONSTRUCTIBLE_PRODUCTION_PER_SLOTTED_RESOURCE')
   && ['BUILDING','WONDER'].includes(row.args.ConstructibleClass);
  if(!biome && !coffee) {
   groups.push({...row,members:[row]});continue;
  }
  const args=Object.entries(row.args).filter(([key])=>key!==(biome?'BiomeType':'ConstructibleClass')).sort(([a],[b])=>a.localeCompare(b));
  const key=JSON.stringify([row.effect,row.collection,args,row.requirements]);
  let group=byBonus.get(key);
  if(!group){group={...row,members:[],...(biome?{biomeTypes:[]}:{constructibleClasses:[]})};byBonus.set(key,group);groups.push(group);}
  group.members.push(row);
  if(biome)group.biomeTypes.push(row.args.BiomeType);else group.constructibleClasses.push(row.args.ConstructibleClass);
 }
 return groups;
}
const localName=(key,fallback)=>globalThis.Locale?.compose?.(key)===key ? fallback : globalThis.Locale?.compose?.(key) ?? fallback;
const FALLBACK_NAMES = {
 YIELD_FOOD:['食料','Food'],YIELD_PRODUCTION:['生産力','Production'],YIELD_GOLD:['ゴールド','Gold'],
 YIELD_SCIENCE:['科学力','Science'],YIELD_CULTURE:['文化力','Culture'],YIELD_HAPPINESS:['幸福度','Happiness'],
 BUILDING_FACTORY:['工場','Factory'],BUILDING_RAIL_STATION:['鉄道駅','Rail Station'],BUILDING_PORT:['港','Port'],
 BUILDING_PALACE:['宮殿','Palace'],BUILDING_TEMPLE:['寺院','Temple'],
 BIOME_DESERT:['砂漠','Desert'],BIOME_GRASSLAND:['草原','Grassland'],BIOME_PLAINS:['平原','Plains'],
 BIOME_TROPICAL:['熱帯','Tropical'],BIOME_TUNDRA:['ツンドラ','Tundra'],BIOME_MARINE:['海洋','Marine'],
 UNIT_CLASS_CAVALRY:['騎兵','Cavalry'],UNIT_CLASS_INFANTRY:['歩兵','Infantry'],UNIT_CLASS_RANGED:['長距離','Ranged'],
 UNIT_CLASS_SIEGE:['攻囲','Siege'],UNIT_CLASS_NAVAL:['海軍','Naval'],UNIT_CLASS_LIGHT:['軽海軍','Light naval'],
 UNIT_CLASS_HEAVY:['重海軍','Heavy naval'],UNIT_CLASS_AIRCRAFT:['航空','Air'],
};
function effectName(type) {
 const fallback=FALLBACK_NAMES[type];
 return localName(`LOC_${type}_NAME`,fallback ? resourceText(...fallback) : String(type));
}
function effectScope(row) {
 const a=row.args,e=row.effect,requirements=row.requirements ?? [];
 if(row.collection==='COLLECTION_ALL_CAPITAL_CITIES') return resourceText('首都','Capital');
 if(e.endsWith('PLAYER_ADJUST_YIELD_PER_RESOURCE_TYPE')) return resourceText('帝国全体','Empire total');
 const cityOnly=requirements.some(r=>!r.inverse && ['REQUIREMENT_CITY_IS_CITY','REQUIREMENT_CITY_HAS_BUILD_QUEUE'].includes(r.type));
 const townOnly=requirements.some(r=>r.type==='REQUIREMENT_CITY_IS_TOWN' && !r.inverse);
 const production=/PRODUCTION/.test(e) && !a.YieldType;
 const empire=a.Empire==='true' || e.includes('AVAILABLE_RESOURCE_TYPE') || e.includes('PLAYER_ADJUST_UNIT_PRODUCTION');
 const factory=a.GlobalSlots==='true' || e.includes('PER_SLOTTED_RESOURCE');
 if(e.includes('PRODUCTION_EFFICIENCY')) return resourceText('配置時・全都市','When slotted: all cities');
 if(factory) return production ? resourceText('工場配置時・全都市','Factory slots: all cities') : resourceText('工場配置時・帝国全体','Factory slots: empire-wide');
 if(empire) return cityOnly || production ? resourceText('全都市','All cities') : resourceText('全都市・町','All cities and towns');
 if(townOnly) return resourceText('配置先の町','Slotted town');
 if(cityOnly || production) return resourceText('配置先の都市','Slotted city');
 return resourceText('配置先','Slotted settlement');
}
// Use the same age-specific modifier rows as the evaluator, including their targets
// and conditions. Similar numerical bonuses must not hide different effects.
export function effectLabel(row) {
 const a=row.args,e=row.effect,requirements=row.requirements ?? [];
 if(e==='slots') return resourceText('資源スロット +2（配置先）','Resource slots +2 (slotted settlement)');
 const amount=a.Amount ?? a.Percent;
 const percent=a.Percent!=null || a.PercentMultiplier==='true' || /PRODUCTION|GROWTH/.test(e) && !a.YieldType
  || row.era==='modern' && a.ResourceType==='RESOURCE_COCOA';
 const bonus=amount==null ? '' : ` +${amount}${percent ? '%' : ''}`;
 const target=a.ConstructibleType ?? a.BuildingType;
 let label;
 if(e.includes('COMBAT')) {
  const tags=requirements.flatMap(r=>(r.args.Tag ?? '').split(',').map(t=>t.trim()).filter(Boolean));
  const units=tags.map(effectName).join(resourceText('・',' / ')) || resourceText('全ユニット','All units');
  return resourceText(`${units}の戦闘力${bonus}（最大+6）`,`${units} combat strength${bonus} (maximum +6)`);
 }
 if(e.includes('HEAL')) return resourceText(`全ユニットの毎ターン回復量${bonus}`,`Healing per turn for all units${bonus}`);
 if(a.YieldType) {
  label=effectName(a.YieldType)+bonus;
  if(e.includes('CONSTRUCTIBLE_YIELD')) {
   const building=target ? effectName(target) : a.Tag==='WAREHOUSE' ? resourceText('倉庫施設','Warehouse buildings') : a.Tag==='WATER' ? resourceText('水域建物','Water buildings') : a.Tag;
   label=resourceText(`${building}ごとの${label}`,`${label} per ${building}`);
  }
 } else if(e.includes('GROWTH')) {
  label=resourceText(`成長率${bonus}（食料増として評価）`,`Growth rate${bonus} (valued as Food)`);
 } else if(e.includes('UNIT_PRODUCTION')) {
  const units=a.Domain==='DOMAIN_SEA' ? resourceText('海軍ユニット','Naval units')
   : a.Domain==='DOMAIN_LAND' ? resourceText('陸上ユニット','Land units')
   : a.UnitClass==='UNIT_CLASS_NON_COMBAT' ? resourceText('民間ユニット','Civilian units')
   : a.UnitTag==='UNIT_CLASS_RELIGIOUS' ? resourceText('宗教ユニット','Religious units') : resourceText('全ユニット','All units');
  label=resourceText(`${units}の生産力${bonus}`,`Production toward ${units}${bonus}`);
 } else if(/CONSTRUCTIBLE_PRODUCTION|BUILDING_PRODUCTION_EFFICIENCY|BIOME_WONDER_PRODUCTION/.test(e)) {
  const building=row.constructibleClasses?.length>1 ? resourceText('建物・遺産','Buildings and Wonders') : target ? effectName(target) : a.ConstructibleClass==='WONDER' || a.BiomeType ? resourceText('遺産','Wonders') : resourceText('建物','Buildings');
  label=resourceText(`${building}の建設時の生産力${bonus}`,`Production toward ${building}${bonus}`);
 } else if(e.includes('PURCHASE_EFFICIENCY')) {
  label=resourceText('購入費用への効果','Purchase cost effect');
 } else label=resourceText('効果（詳細未対応）','Effect (details unavailable)');
 const conditions=[effectScope(row)];
 if(row.biomeTypes) {
  const all=['BIOME_DESERT','BIOME_GRASSLAND','BIOME_MARINE','BIOME_PLAINS','BIOME_TROPICAL','BIOME_TUNDRA'];
  const targets=all.every(type=>row.biomeTypes.includes(type))
   ? resourceText('すべての地形','All biomes') : row.biomeTypes.map(effectName).join(resourceText('・',', '));
  conditions.push(resourceText('対象：','Applies to: ')+targets);
 } else if(a.BiomeType) conditions.push(effectName(a.BiomeType));
 for(const req of requirements) {
  if(req.type==='REQUIREMENT_CITY_IS_CAPITAL') conditions.push(req.inverse ? resourceText('首都以外','Outside capital') : resourceText('首都','Capital'));
  if(req.type==='REQUIREMENT_CITY_IS_DISTANT_LANDS') conditions.push(req.inverse ? resourceText('本土','Homelands') : resourceText('遠隔地','Distant lands'));
  if(req.type==='REQUIREMENT_PLAYER_IS_IN_GOLDEN_AGE') conditions.push(resourceText('祝宴中','During celebrations'));
  if(req.type==='REQUIREMENT_CITY_HAS_BUILDING') conditions.push(effectName(req.args.BuildingType)+resourceText(req.inverse?'なし':'あり',req.inverse?' absent':' present'));
 }
 return `${label}（${conditions.join(' / ')}）`;
}
