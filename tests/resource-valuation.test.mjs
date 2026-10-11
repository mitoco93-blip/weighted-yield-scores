import test from 'node:test';
import assert from 'node:assert/strict';
import {parseRatio, evaluatePlacement, militaryShare, combatValue, productionBonus, incenseValue, camelValue, constructionBonus, treasureValue} from '../ui/resource-valuation.js';
const close = (a,b) => assert.ok(Math.abs(a-b)<1e-9, `${a} != ${b}`);

test('ratio inputs normalize arbitrary totals; reject empty/all-zero/negative/infinite', () => {
  assert.deepEqual(parseRatio('1：1：1', 3), [1/3,1/3,1/3]);
  assert.deepEqual(parseRatio('10:90', 2), [.1,.9]);
  for (const text of ['0:0', '1:', '-1:2', 'NaN:1', 'Infinity:1', '1:2:3']) assert.equal(parseRatio(text,2), null);
});
test('placement stays at unassigned value if worse, and never combines cities', () => {
  const placements=[{cityID:'a',score:12},{cityID:'b',score:8}];
  assert.equal(evaluatePlacement({unassignedScore:4,placements}).score,8);
  assert.equal(evaluatePlacement({unassignedScore:14,placements}).score,14);
  assert.equal(evaluatePlacement({unassignedScore:4,placements,hasUnassignedCopy:true}).score,4);
  assert.equal(evaluatePlacement({unassignedScore:4,placements,placementRate:1}).score,12);
  assert.equal(evaluatePlacement({unassignedScore:4,placements,placementRate:0}).score,4);
  assert.equal(evaluatePlacement({unassignedScore:4,placements:[]}).score,4);
});
test('military counts packed units equally and excludes commanders/support and duplicates', () => {
  const units=[{key:'1',isMilitary:true,tags:['ranged','siege'],hp:1,packed:true},
    {key:'1',isMilitary:true,tags:['ranged','siege']},
    {key:'2',isMilitary:true,tags:['infantry'],hp:100},
    {key:'3',isMilitary:true,isCommander:true,tags:['ranged']},
    {key:'4',isMilitary:true,isSupport:true,tags:['ranged']}];
  assert.deepEqual(militaryShare(units,u=>u.tags.includes('ranged')), {total:2,affected:1,share:.5});
  assert.equal(combatValue({units,tags:['ranged','siege'],strength:1,sciencePerStrength:6,scienceWeight:.5}).score,1.5);
  assert.equal(combatValue({units:[],tags:['ranged'],sciencePerStrength:6,scienceWeight:.5}).score,0);
});
test('production uses settings rather than owned military, and zero target means no bonus', () => {
  close(productionBonus({production:90,bonusRate:.2,productionShare:1/3,targetShare:1/3}),2);
  assert.equal(productionBonus({production:90,bonusRate:.2,productionShare:1/3,targetShare:0}),0);
});
test('incense uses city average and unassigned time without a second placement discount', () => {
  close(incenseValue({unassignedScore:3,cityProductionScores:[20,40]}),12);
  assert.equal(incenseValue({unassignedScore:3,cityProductionScores:[]}),3);
});
test('camel counts distinct positive resources in ONE city and pays its own opportunity cost', () => {
  const r=(resourceType,placementScore,unassignedScore=3)=>({resourceType,placementScore,unassignedScore,count:2,eligible:true});
  const cities=[{cityID:'a',unassignedResources:[r('salt',10),r('salt',10),r('fish',5),r('dye',1)]},
    {cityID:'b',unassignedResources:[r('salt',11)]}];
  const result=camelValue({unassignedScore:3,cities});
  assert.equal(result.score,9);assert.deepEqual(result.resources,['salt','fish']);
  assert.equal(camelValue({unassignedScore:10,cities}).score,10);
  assert.equal(camelValue({unassignedScore:3,cities,hasUnassignedCopy:true}).score,3);
});
test('construction useful deadline, age deadline, completion, speed scaling and work cap', () => {
  const base={remainingCost:110,baseProduction:10,bonusRate:.1,currentTurn:40,usefulUntil:60,eraEnd:80};
  close(constructionBonus(base),.2);
  assert.equal(constructionBonus({...base,currentTurn:60}),0);
  assert.equal(constructionBonus({...base,currentTurn:80}),0);
  assert.equal(constructionBonus({...base,remainingCost:0}),0);
  assert.ok(constructionBonus({...base,baseProduction:.1})<.2);
  close(constructionBonus({...base,remainingCost:55,currentTurn:20,usefulUntil:30,eraEnd:40}),.2);
});
test('treasure marginal cargo only, with recovery and frequency', () => {
  assert.equal(treasureValue({cargo:2,rewardPerCargo:100,spawnInterval:10}),18);
  assert.equal(treasureValue({cargo:2,rewardPerCargo:100,spawnInterval:0}),0);
});

test('modern production 5:4:1 applies within the military 90%, not all units', async () => {
  const {getProductionShares} = await import('../ui/resource-settings.js');
  const s = getProductionShares('modern');
  close(s.army,.45); close(s.naval,.36); close(s.air,.09); close(s.civilian,.1); close(s.land,.55);
  close(s.army+s.naval+s.air+s.civilian,1);
  close(s.buildings+s.wonders+s.units,1);
  close(getProductionShares('antiquity').naval,.1);
  close(getProductionShares('exploration').naval,1/4);
});
test('resource settings persist independently and invalid ratios retain last valid input', async () => {
  let stored={otherMod:{enabled:true}};
  globalThis.localStorage={getItem:()=>JSON.stringify(stored),setItem:(k,v)=>{stored=JSON.parse(v)}};
  const {WeightedYieldSettingsStore}=await import('../ui/settings.js');
  const store=new WeightedYieldSettingsStore();
  store.set('resourceMilitaryModern','10：8：2');
  store.set('resourceMilitaryModern','0:0:0');
  assert.equal(store.get('resourceMilitaryModern'),'10:8:2');
  const other=new WeightedYieldSettingsStore();
  assert.equal(other.get('resourceMilitaryModern'),'10:8:2');
  assert.equal(other.get('resourceNavyExploration'),'1:3');
  assert.equal(other.get('resourceCivilianModern'),'1:9');
  assert.deepEqual(stored.otherMod,{enabled:true});
  store.resetOption('resourceMilitaryModern');
  assert.equal(store.get('resourceMilitaryModern'),'5:4:1');
  store.set('resourceTreasureRecoveryPercent',90);
  assert.equal(store.get('resourceTreasureRecoveryPercent'),90);
  store.set('goldWeight',.4);assert.equal(store.get('goldWeight'),.4);
});
