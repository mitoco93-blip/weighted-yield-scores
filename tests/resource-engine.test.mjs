import test from 'node:test';
import {SHARED_FIELDS,effectsForResource} from '../ui/options/resource-options-model.js';
import assert from 'node:assert/strict';
import {createResourceEvaluator} from '../ui/resource-engine.js';
import {readResourceSnapshot} from '../ui/resource-game-state.js';
import {RESOURCE_EFFECTS} from '../ui/resource-catalog.js';
import {RESOURCE_SETTING_DEFAULTS} from '../ui/resource-settings.js';
import {WeightedYieldSettingsStore} from '../ui/settings.js';
import {resourceDetailLines} from '../ui/resource-details.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const def=(type,cls='BONUS')=>({ResourceType:'RESOURCE_'+type,ResourceClassType:'RESOURCECLASS_'+cls});
const city=(key,more={})=>({key,assignable:true,connected:true,isTown:false,isCapital:false,isDistant:false,hasFactory:false,
 yields:{YIELD_FOOD:20,YIELD_PRODUCTION:60,YIELD_CULTURE:10,YIELD_GOLD:30,YIELD_SCIENCE:40,YIELD_HAPPINESS:20},buildings:[],remainingCosts:{BUILDING_FACTORY:100,BUILDING_RAIL_STATION:80,BUILDING_PORT:80},...more});
const snapshot=(more={})=>({age:'antiquity',cities:[city('a'),city('b',{isTown:true})],units:[],unitsKnown:true,counts:{},unassignedCounts:{},definitions:{},unassignedRecord:{YIELD_GOLD:2},currentTurn:10,speedScale:1,...more});
const globalScore=r=>Object.entries(r).reduce((sum,[k,v])=>sum+v*({YIELD_GOLD:2/7,YIELD_HAPPINESS:.2,YIELD_SCIENCE:.5,YIELD_CULTURE:.5,YIELD_FOOD:.2}[k]??1),0);
const scoreCity=(c,r)=>Object.entries(r).reduce((sum,[k,v])=>sum+v*(k==='YIELD_FOOD'?c.foodWeight??1:k==='YIELD_PRODUCTION'&&c.isTown?2/7:k==='YIELD_HAPPINESS'?c.happinessWeight??.2:k==='YIELD_GOLD'?2/7:k==='YIELD_SCIENCE'||k==='YIELD_CULTURE'?.5:1),0);
const evaluator=(s,opts={})=>createResourceEvaluator(s,{scoreGlobal:globalScore,scoreCity,read:k=>RESOURCE_SETTING_DEFAULTS[k],effectScale:()=>1,...opts});

test('one destination for mixed food/production, duplicate inventory takes priority, local/generic U differ',()=>{
 const s=snapshot({cities:[city('a',{foodWeight:2}),city('b',{isTown:true,foodWeight:3})]});
 const x=evaluator(s).evaluate(def('COTTON'),'a');
 close(x.score, (2/7*2 + (6+4/7))/2); // b's complete output, not max-food plus max-production
 s.unassignedCounts.RESOURCE_COTTON=1;
 close(evaluator(s).evaluate(def('COTTON'),'a').score,4/7);
 s.unassignedCounts={};s.cities[1].connected=false;
 close(evaluator(s).evaluate(def('COTTON'),'a').score,(4/7+6)/2);
});
test('city-only placement excludes towns, U floor and no legal destination',()=>{
 const s=snapshot({cities:[city('a',{isTown:true,happinessWeight:100})]});
 close(evaluator(s).evaluate(def('DYES','CITY'),'a').score,4/7);
 close(evaluator(snapshot()).evaluate(def('DYES'),'a').score,(4/7+.8)/2);
});
test('conditional modern buildings choose one branch; warehouse counts change on next snapshot',()=>{
 let s=snapshot({age:'modern',cities:[city('a',{buildings:[{type:'BUILDING_PORT',tags:[]}]})]});
 close(evaluator(s).evaluate(def('FISH'),'a').score,(4/7+8)/2);
 s.cities[0].buildings=[];close(evaluator(s).evaluate(def('FISH'),'a').score,(4/7+4)/2);
 s.age='antiquity';s.cities[0].buildings=[{type:'GRANARY',tags:['WAREHOUSE']},{type:'PALACE',tags:[]}];
 close(evaluator(s).evaluate(def('CLAY'),'a').score,(4/7+1)/2);
});
test('empire production counts producing cities, partitions biome rows, settings separate from army',()=>{
 const s=snapshot();
 close(evaluator(s).evaluate(def('MARBLE','EMPIRE'),'a').score,60*.1/3*.5);
 close(evaluator(s).evaluate(def('HARDWOOD','EMPIRE'),'a').score,60*.1/3*.1);
 s.age='exploration';close(evaluator(s).evaluate(def('MARBLE','EMPIRE'),'a').score,60*.1/3);
});
test('military union, commanders excluded, zero army, incremental resource cap',()=>{
 const s=snapshot({age:'modern',units:[{key:'1',isMilitary:true,tags:['UNIT_CLASS_RANGED','UNIT_CLASS_SIEGE']},{key:'2',isMilitary:true,tags:['UNIT_CLASS_INFANTRY']},{key:'3',isMilitary:true,isCommander:true,tags:['UNIT_CLASS_RANGED']}]});
 close(evaluator(s).evaluate(def('NITER','EMPIRE'),'a').score,1.5);
 s.counts.RESOURCE_NITER=6;close(evaluator(s).evaluate(def('NITER','EMPIRE'),'a').score,0);
 s.counts={};s.units=[];close(evaluator(s).evaluate(def('NITER','EMPIRE'),'a').score,0);
});
test('factory availability switches from U; modern domains use 5:4:1 inside military share',()=>{
 const s=snapshot({age:'modern'});
 close(evaluator(s).evaluate(def('CITRUS','FACTORY'),'a').score,4/7);
 s.cities[0].hasFactory=true;
 close(evaluator(s).evaluate(def('CITRUS','FACTORY'),'a').score,60*.05/3*.36);
 close(evaluator(s).evaluate(def('COTTON','FACTORY'),'a').score,60*.05/3*.55);
 close(evaluator(s).evaluate(def('HARDWOOD','EMPIRE'),'a').score,60*.2/3*.1);
});
test('incense active average uses no extra 50%, idle copy still overrides',()=>{
 const s=snapshot({age:'exploration',cities:[city('a'),city('b',{yields:{YIELD_PRODUCTION:30}})]});
 close(evaluator(s).evaluate(def('INCENSE','CITY'),'a').score,45/4+(4/7)*3/4);
 s.cities[1].connected=false;s.cities[1].assignable=false;
close(evaluator(s).evaluate(def('INCENSE','CITY'),'a').score,45/4+(4/7)*3/4);
 s.cities.push(city('town',{isTown:true,yields:{YIELD_PRODUCTION:10000}}));
close(evaluator(s).evaluate(def('INCENSE','CITY'),'a').score,45/4+(4/7)*3/4);
 s.unassignedCounts.RESOURCE_INCENSE=1;close(evaluator(s).evaluate(def('INCENSE','CITY'),'a').score,4/7);
});
test('camel uses two distinct positive net gains in one city, not two copies of same resource',()=>{
 const s=snapshot({cities:[city('a')],unassignedCounts:{RESOURCE_COTTON:2,RESOURCE_FISH:1},definitions:{RESOURCE_COTTON:def('COTTON'),RESOURCE_FISH:def('FISH')}});
 close(evaluator(s).evaluate(def('CAMELS'),'a').score,4+3-8/7);
});
test('construction expires without losing pitch local factory yield or oil combat',()=>{
 const s=snapshot({age:'modern',currentTurn:60,cities:[city('a',{hasFactory:true,buildings:[{type:'BUILDING_FACTORY',tags:[]}]}),city('b')]});
 close(evaluator(s).evaluate(def('PITCH'),'a').score,(4/7+1)/2);
 s.currentTurn=10;assert.ok(evaluator(s).evaluate(def('PITCH'),'a').score>(4/7+1)/2);
});
test('treasure fleet scoring and settings are suspended; empire effects remain',()=>{
 const s=snapshot({age:'exploration',cities:[city('a',{isDistant:true,treasure:{interval:10,rewardPerResource:100}})]});
 for(const data of [s.cities[0].treasure,null]) {
  s.cities[0].treasure=data;
  const val=evaluator(s).evaluate(def('GOLD','TREASURE'),'a');
  close(val.special,0);close(val.score,val.empire);assert.ok(val.empire>0);
  assert.deepEqual(val.issues,[]);
 }
 assert.ok(!SHARED_FIELDS.some(([key])=>key==='resourceTreasureRecoveryPercent'));
 for(const type of ['GOLD','SILVER','COCOA','TEA']) assert.ok(!effectsForResource('exploration','RESOURCE_'+type).some(row=>row.id==='treasure'));
});
test('per-effect coefficients persist across store instances, reset preserves other settings',()=>{
 const db=new Map();globalThis.localStorage={getItem:k=>db.get(k),setItem:(k,v)=>db.set(k,v)};
 const a=new WeightedYieldSettingsStore(),key='antiquity:RESOURCE_COTTON:MOD_COTTON_CITY_FLAT_FOOD';
 a.set('resourceMilitaryModern','2:3:1');a.setResourceEffectScale(key,.25);
 close(new WeightedYieldSettingsStore().getResourceEffectScale(key),.25);
 a.setResourceEffectScale(key,-1);close(a.getResourceEffectScale(key),.25);
 a.resetResourceEffects();close(a.getResourceEffectScale(key),1);assert.equal(a.get('resourceMilitaryModern'),'2:3:1');
});
test('adapter de-duplicates packed units and assigned on/off-map identity, no game mutation',()=>{
 const table=rows=>Object.assign(rows,{lookup:key=>rows.find(r=>r.$hash===key || r.UnitType===key || r.ResourceType===key)});
 const cityNative={id:{owner:0,id:1,type:1},isTown:false,Yields:{getYield:()=>10},Resources:{getAssignedResources:()=>[{value:3,isOffMap:false}]},Constructibles:{getIds:()=>[]}};
 const unitTable={1:{type:11,isCommanderUnit:true,armyId:9},2:{type:12},3:{type:13}};
 const api={Game:{age:1,getHash:s=>s==='AGE_ANTIQUITY'?1:2,Diplomacy:{modifyByGameSpeed:x=>x/2},turn:10,Resources:{getOriginCity:()=>cityNative.id}},GameContext:{localPlayerID:0},
 GameInfo:{Resources:table([{...def('FISH'),$hash:101}]),Yields:[{YieldType:'YIELD_GOLD',$hash:1,$index:0}],TypeTags:[{Type:'INF',Tag:'UNIT_CLASS_INFANTRY'}],Units:table([{$hash:11,UnitType:'COM',CoreClass:'CORE_CLASS_COMMAND'},{$hash:12,UnitType:'INF',CoreClass:'CORE_CLASS_MILITARY'},{$hash:13,UnitType:'MER',CoreClass:'CORE_CLASS_SUPPORT'}])},
 Players:{get:()=>({Cities:{getCities:()=>[cityNative]},Units:{getUnitIds:()=>[1,2]},Resources:{getUnassignedResourceYieldBonus:()=>2,getResources:()=>[{value:3,isOffMap:false,uniqueResource:{resource:101}},{value:3,isOffMap:true,uniqueResource:{resource:101}}]}})},Units:{get:id=>unitTable[id]},Armies:{get:()=>({getUnitIds:()=>[2,3]})}};
 let fleetCalls=0;
 for(const method of ['getGlobalTurnsUntilTreasureGenerated','getProducedTreasureFleetPoints','getProducedTreasureFleetGold','getAutoTreasureFleetValue']) cityNative.Resources[method]=()=>{fleetCalls++;throw Error('suspended');};
 const s=readResourceSnapshot(api);assert.equal(fleetCalls,0);assert.equal(s.cities[0].treasure,undefined);assert.equal(s.units.length,3);assert.equal(s.unassignedCounts.RESOURCE_FISH,1);assert.equal(s.counts.RESOURCE_FISH,2);assert.equal(s.speedScale,.5);
});
test('catalog excludes removed effects, and every surfaced value reconciles with tooltip terms',()=>{
 assert.equal(RESOURCE_EFFECTS.length,195);
 for(const age of ['antiquity','exploration','modern']) {
  const s=snapshot({age});
  for(const type of new Set(RESOURCE_EFFECTS.filter(r=>r.era===age).map(r=>r.args.ResourceType))) {
   const value=evaluator(s).evaluate({ResourceType:type,ResourceClassType:'RESOURCECLASS_BONUS'},'a');
   assert.ok(Number.isFinite(value.score),type);close(value.score,(value.unassigned??0)+(value.uplift??0)+(value.empire??0)+(value.special??0));
   assert.ok(Array.isArray(resourceDetailLines(value)));
  }
 }
});

test('effect coefficient scales value without changing happiness recovery threshold',()=>{
 const options={scoreCity:(c,r)=>Math.max(0,Math.min(1,r.YIELD_HAPPINESS??0))*100+(r.YIELD_HAPPINESS??0)*.2};
 const full=evaluator(snapshot(),options).evaluate(def('DYES'),'a');
 const half=evaluator(snapshot(),{...options,effectScale:()=>.5}).evaluate(def('DYES'),'a');
 close(full.score,(4/7+100.8)/2);close(half.score,(4/7+50.4)/2);
});

test('combat resources use the specified +6 cap without a guessed game parameter',()=>{
 for(const [age,type,tags] of [
  ['antiquity','HORSES',['UNIT_CLASS_CAVALRY']],
  ['exploration','HORSES',['UNIT_CLASS_CAVALRY']],
  ['exploration','NITER',['UNIT_CLASS_NAVAL']],
  ['modern','NITER',['UNIT_CLASS_RANGED']]
 ]) {
  const s=snapshot({age,units:[{key:'army',isMilitary:true,tags}]});
  const first=evaluator(s).evaluate(def(type,'EMPIRE'),'a');
  assert.ok(first.score>0);
  assert.deepEqual(first.issues,[]);
  s.counts['RESOURCE_'+type]=5;
  close(evaluator(s).evaluate(def(type,'EMPIRE'),'a').score,first.score);
  for(const count of [6,7]) {
   s.counts['RESOURCE_'+type]=count;
   const capped=evaluator(s).evaluate(def(type,'EMPIRE'),'a');
   close(capped.score,0);assert.deepEqual(capped.issues,[]);
  }
  s.counts={};s.units=[];
  const empty=evaluator(s).evaluate(def(type,'EMPIRE'),'a');
  close(empty.score,0);assert.deepEqual(empty.issues,[]);
  s.unitsKnown=false;
  assert.deepEqual(evaluator(s).evaluate(def(type,'EMPIRE'),'a').issues,['military-data']);
 }
});

test('resource warnings distinguish unavailable data from unsupported effects in JA/EN',()=>{
 const previousLocale=globalThis.Locale;
 try {
  for(const lang of ['ja','en']) {
   globalThis.Locale={compose:key=>key==='LOC_YIELD_FOOD'?(lang==='ja'?'食料':'Food'):key};
   const keys=['military-data','construction-data','unknown-resource','game-state','MOD_UNSUPPORTED'];
   const expected=lang==='ja'?['所有ユニット一覧','建設コスト','未登録','基本情報','計算処理のない']:['owned-unit list','Construction cost','no effect data','Basic game information','does not yet support'];
   const value={resourceType:'RESOURCE_NITER',empire:.63,issues:[]};
   const regular=resourceDetailLines(value);
   for(let i=0;i<keys.length;i++) {
    const result=resourceDetailLines({...value,issues:[keys[i]]});
    assert.deepEqual(result.slice(0,regular.length),regular,'preserve calculated scores');
    assert.equal(result.length,regular.length+1);
    assert.ok(result.at(-1).includes(expected[i]),result.at(-1));
   }
   const mixed=resourceDetailLines({...value,issues:['military-data','construction-data','MOD_A','MOD_B']});
   assert.equal(mixed.length,regular.length+3,'deduplicate unsupported-effect notices only');
   assert.ok(!mixed.some(line=>line.includes('MOD_A')||line.includes('MOD_B')));
   assert.deepEqual(resourceDetailLines({issues:[]}),[],'valid zero result is not an error');
  }
 } finally { globalThis.Locale=previousLocale; }
});

test('specified construction uses full cost until built and never reads partial progress',()=>{
 const defs=['BUILDING_FACTORY','BUILDING_RAIL_STATION','BUILDING_PORT'].map((ConstructibleType,i)=>({ConstructibleType,$hash:i+1}));
 const definitions=Object.assign(defs,{lookup:key=>defs.find(d=>d.ConstructibleType===key||d.$hash===key)});
 let built=[],costCalls=[],progressCalls=0,costMissing=false;
 const native={id:{owner:0,id:1,type:1},Constructibles:{getIds:()=>built},Resources:{getAssignedResources:()=>[]},
  Production:{getConstructibleProductionCost:type=>{costCalls.push(type);return costMissing?null:120;}},
  BuildQueue:new Proxy({},{get:()=>()=>{progressCalls++;return 60;}})};
 const api={Game:{age:3,getHash:name=>({AGE_ANTIQUITY:1,AGE_EXPLORATION:2,AGE_MODERN:3}[name]),turn:10,Diplomacy:{modifyByGameSpeed:x=>x}},
  GameContext:{localPlayerID:0},GameInfo:{Constructibles:definitions,Resources:[],Yields:[],TypeTags:[]},
  Players:{get:()=>({Cities:{getCities:()=>[native]},Units:{getUnitIds:()=>[]},Resources:{getResources:()=>[]}})},
  Constructibles:{getByComponentID:id=>({type:id})}};
 let s=readResourceSnapshot(api);
 assert.deepEqual(s.cities[0].remainingCosts,{BUILDING_FACTORY:120,BUILDING_RAIL_STATION:120,BUILDING_PORT:120});
 assert.equal(progressCalls,0,'progress and queue APIs must not be queried');
 built=[1];costCalls=[];s=readResourceSnapshot(api);
 assert.equal(s.cities[0].remainingCosts.BUILDING_FACTORY,0);
 assert.ok(!costCalls.includes('BUILDING_FACTORY'));
 costMissing=true;s=readResourceSnapshot(api);
 assert.equal(s.cities[0].remainingCosts.BUILDING_PORT,undefined,'missing cost is not a free building');
 assert.equal(progressCalls,0);
});

test('capped combat resources retain name and explicit next-copy reason at zero value in JA/EN',()=>{
 const savedLocale=globalThis.Locale;
 try {
  for(const [age,type,tags] of [
   ['antiquity','HORSES',['UNIT_CLASS_CAVALRY']],
   ['exploration','NITER',['UNIT_CLASS_NAVAL']],
   ['modern','NITER',['UNIT_CLASS_RANGED']]
  ]) {
   const s=snapshot({age,units:[{key:'unit',isMilitary:true,tags}]});
   for(const count of [5,6,7]) {
    s.counts['RESOURCE_'+type]=count;
    const value=evaluator(s).evaluate(def(type,'EMPIRE'),'a');
    assert.equal(value.cappedCombatEffects.length,count>=6?1:0);
    for(const language of ['ja','en']) {
     globalThis.Locale={compose:key=>key==='LOC_YIELD_FOOD'?(language==='ja'?'食料':'Food'):key};
     const lines=resourceDetailLines(value).join('\n');
     if(count>=6) {
      assert.equal(value.score,0);
      assert.deepEqual(value.issues,[],'cap is a known reason, not an API failure');
      assert.match(lines,language==='ja'?/評価対象資源：/:/Resource evaluated:/);
      assert.ok(lines.includes(language==='ja'?(count+1)+'個目':'copy '+(count+1)));
      assert.ok(lines.includes(language==='ja'?'上限＋6':'+6 cap'));
     } else assert.ok(!lines.includes(language==='ja'?'上限':'cap'));
    }
   }
   s.counts={};s.units=[];
   assert.equal(evaluator(s).evaluate(def(type,'EMPIRE'),'a').cappedCombatEffects.length,0,'no units is not a cap');
   s.counts['RESOURCE_'+type]=6;
   assert.equal(evaluator(s,{effectScale:()=>0}).evaluate(def(type,'EMPIRE'),'a').cappedCombatEffects.length,0,'disabled effect is not reported as capped');
  }
  const sample={resourceType:'RESOURCE_NITER',empire:2,cappedCombatEffects:[{resourceType:'RESOURCE_NITER',owned:6,nextCopy:7,strengthCap:6}]};
  assert.ok(resourceDetailLines(sample).some(line=>line.includes('2')),'other effects still display');
 } finally {globalThis.Locale=savedLocale;}
});

test('zero resource values remain visible and missing cavalry differs from unavailable data and caps',()=>{
 const savedLocale=globalThis.Locale;
 try {
  for(const language of ['ja','en']) {
   globalThis.Locale={compose:key=>key==='LOC_YIELD_FOOD'?(language==='ja'?'食料':'Food'):key};
   const label=language==='ja'?'資源価値: 0':'Resource value: 0';
   const reason=language==='ja'?'対象の騎兵':'No cavalry units';
   for(const units of [[],[{key:'infantry',isMilitary:true,tags:['UNIT_CLASS_INFANTRY']}],
     [{key:'support',isMilitary:true,isSupport:true,tags:['UNIT_CLASS_CAVALRY']}],
     [{key:'commander',isMilitary:true,isCommander:true,tags:['UNIT_CLASS_CAVALRY']}]]) {
    const value=evaluator(snapshot({units})).evaluate(def('HORSES','EMPIRE'),'a');
    assert.equal(value.score,0);
    const lines=resourceDetailLines(value).join('\n');
    assert.ok(lines.includes(label),lines);assert.ok(lines.includes(reason),lines);
   }
   for(const state of [{unitsKnown:false},{counts:{RESOURCE_HORSES:6}},
      {units:[{key:'cavalry',isMilitary:true,tags:['UNIT_CLASS_CAVALRY']}]}]) {
    const value=evaluator(snapshot(state)).evaluate(def('HORSES','EMPIRE'),'a');
    assert.equal(value.missingCombatTargets.length,0);
    assert.ok(!resourceDetailLines(value).join('\n').includes(reason));
   }
   const disabled=evaluator(snapshot(),{effectScale:()=>0}).evaluate(def('HORSES','EMPIRE'),'a');
   assert.equal(disabled.missingCombatTargets.length,0);
   assert.ok(resourceDetailLines(disabled).join('\n').includes(label));
   const mixed={resourceType:'RESOURCE_WHALES',score:2.98,unassigned:.97,uplift:2.01};
   const lines=resourceDetailLines(mixed);
   assert.equal(lines.length,2);assert.ok(lines[1].includes('2.98'));
  }
 } finally {globalThis.Locale=savedLocale;}
});

test('all catalog resources retain a visible value across zero-value conditions and classes in JA/EN',()=>{
 const savedLocale=globalThis.Locale;
 try {
  for(const lang of ['ja','en']) {
   globalThis.Locale={compose:key=>key==='LOC_YIELD_FOOD'?(lang==='ja'?'食料':'Food'):key};
   for(const age of ['antiquity','exploration','modern']) {
    const types=new Set(RESOURCE_EFFECTS.filter(r=>r.era===age).map(r=>r.args.ResourceType));
    for(const type of ['RESOURCE_CAMELS','RESOURCE_LAPIS','RESOURCE_UNKNOWN'])types.add(type);
    for(const cls of ['BONUS','CITY','EMPIRE','TREASURE','FACTORY']) {
     for(const state of [{},{cities:[]},{unitsKnown:false},{currentTurn:1000},
       {cities:[city('a',{hasFactory:true,buildings:[{type:'BUILDING_FACTORY'},{type:'BUILDING_PORT'},{type:'BUILDING_RAIL_STATION'}]})]}]) {
      for(const disabled of [false,true]) {
       const e=evaluator(snapshot({age,...state}),{effectScale:()=>disabled?0:1});
       for(const type of types) {
        const value=e.evaluate({ResourceType:type,ResourceClassType:'RESOURCECLASS_'+cls},'a');
        const lines=resourceDetailLines(value);
        assert.equal(value.resourceType,type);
        assert.ok(lines[0].includes(lang==='ja'?'評価対象資源':'Resource evaluated'),type);
        assert.ok(lines[1].includes(lang==='ja'?'資源価値':'Resource value'),type);
        if(value.score===0)assert.ok(lines.length>=3,'zero reason: '+type);
       }
      }
     }
    }
   }
   const invalid=resourceDetailLines({resourceType:'RESOURCE_HORSES',score:NaN});
   assert.ok(invalid[1].includes(lang==='ja'?'算出できません':'unavailable'));
  }
  assert.deepEqual(resourceDetailLines(null),[],'non-resource tiles stay empty');
 } finally {globalThis.Locale=savedLocale;}
});

test('current gold/silver empire yields and truffles age-specific effects match live rules',()=>{
 for(const age of ['antiquity','exploration','modern']) {
  const s=snapshot({age,cities:[city('a'),city('b',{isTown:true,foodWeight:2})]});
  close(evaluator(s).evaluate(def('GOLD','EMPIRE'),'a').score,2*(2/7+.2));
  close(evaluator(s).evaluate(def('SILVER','EMPIRE'),'a').score,2*2/7+1+2);
 }
 const s=snapshot({age:'exploration',cities:[city('a')]});
 close(evaluator(s).evaluate(def('TRUFFLES','CITY'),'a').score,(4/7+60*.2/3)/2);
 s.age='modern';
 close(evaluator(s).evaluate(def('TRUFFLES','CITY'),'a').score,(4/7+4)/2);
 s.cities[0].buildings=[{type:'BUILDING_RAIL_STATION',tags:[]}];
 close(evaluator(s).evaluate(def('TRUFFLES','CITY'),'a').score,(4/7+8)/2);
});

test('coffee has independently adjustable building and wonder effects; cocoa is a percentage',()=>{
 const s=snapshot({age:'modern',cities:[city('a',{hasFactory:true})]});
 const opts={read:k=>k==='resourceProductionModern'?'2:1:1':RESOURCE_SETTING_DEFAULTS[k]};
 close(evaluator(s,opts).evaluate(def('COFFEE','FACTORY'),'a').score,60*.05*.75);
 const only=id=>({...opts,effectScale:key=>key.endsWith(id)?1:0});
 close(evaluator(s,only('MOD_COFFEE_CITY_BUILDING_PRODUCTION')).evaluate(def('COFFEE','FACTORY'),'a').score,60*.05*.5);
 close(evaluator(s,only('MOD_COFFEE_CITY_WONDER_PRODUCTION')).evaluate(def('COFFEE','FACTORY'),'a').score,60*.05*.25);
 close(evaluator(s).evaluate(def('COCOA','FACTORY'),'a').score,20*.03*.2);
});
