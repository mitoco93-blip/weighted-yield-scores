import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ui=path.join(root,'ui');
const {WeightedYieldRuntime:active,createWeightedYieldRuntime}=await import(pathToFileURL(path.join(ui,'runtime.js')));
const {getFoodRecipientCities,combineRecipientFoodValues}=await import(pathToFileURL(path.join(ui,'food-routing.js')));
const {WeightedYieldSettings:settings,FOOD_MODE}=await import(pathToFileURL(path.join(ui,'settings.js')));
const {getBuildingEvaluationDetailModel}=await import(pathToFileURL(path.join(ui,'building-details.js')));
const close=(a,b)=>assert(Math.abs(a-b)<1e-10,`${a} != ${b}`);
let events=0;
globalThis.window={dispatchEvent:()=>events++};globalThis.CustomEvent=class{};
const yields=['FOOD','PRODUCTION','GOLD','SCIENCE','CULTURE','HAPPINESS','DIPLOMACY'].map((s,i)=>({YieldType:'YIELD_'+s,$index:i,$hash:i}));
const growthProject={ProjectType:'FISHING'};
const migrantProject={ProjectType:'MIGRANT'};
const farm={$hash:99,$index:0,ConstructibleType:'FARM',ConstructibleClass:'IMPROVEMENT',Population:1};
globalThis.GameInfo={Yields:yields,Projects:{lookup:type=>type==='FISHING'?growthProject:migrantProject},Project_Units:[{ProjectType:'MIGRANT'}],Constructibles:Object.assign([farm],{lookup:()=>farm}),Constructible_YieldChanges:[]};
globalThis.YieldTypes=Object.fromEntries(yields.map(d=>[d.YieldType,d.$index]));
globalThis.GrowthTypes={PROJECT:1};globalThis.CityCommandTypes={EXPAND:1};
globalThis.GameContext={localPlayerID:0};
globalThis.Game={age:'AGE_EXPLORATION',turn:10,maxTurns:100,CityCommands:{canStart:()=>({Plots:[]})}};
globalThis.GameplayMap={getLocationFromIndex:i=>({x:i,y:0}),getYield:()=>0};
globalThis.MapConstructibles={getConstructibles:()=>[]};
function make(id,population,threshold,food,output){
 const city={id:{owner:0,id},owner:0,name:'City '+id,isTown:false,ruralPopulation:population,
 Growth:{growthType:0,currentFood:10,getNextGrowthFoodThreshold:()=>({value:city.threshold})},
 threshold,food,output,
 Workers:{getNumWorkers:()=>0,GetAllPlacementInfo:()=>[]},
 getPurchasedPlots:()=>[],
 Yields:{getNetYield:type=>type===0?city.food:0,getYield:()=>0,
 calculateAllBuildingsPlacements:()=>({buildings:[{constructibleType:99,placements:[{plotID:id*10,overbuiltConstructibleID:-1,yieldChanges:[1,city.output,0,0,0,0,0]}]}]})}};
 return city;
}
const a=make(1,4,400,12,5),b=make(2,25,5000,60,2),town=make(3,8,800,40,40),otherTown=make(4,7,500,10,100),foreign=make(5,2,100,20,100);
town.isTown=true;town.Growth.growthType=1;town.Growth.projectType='FISHING';town.getSentFoodPerCity=()=>20;
otherTown.isTown=true;foreign.owner=1;
let connected=[a.id,b.id,otherTown.id];town.getConnectedCities=()=>connected;
const cities=[a,b,town,otherTown,foreign];globalThis.Cities={get:id=>cities.find(c=>c.id.id===id?.id)};
const local=city=>{const r=createWeightedYieldRuntime({emitEvents:false});r.refreshBuildingCandidates(city.id,city.Yields.calculateAllBuildingsPlacements());return r;};
const refresh=()=>active.refreshBuildingCandidates(town.id,town.Yields.calculateAllBuildingsPlacements());
const av=local(a).state.foodValuation,bv=local(b).state.foodValuation;
assert.notEqual(av.weight,bv.weight);
refresh();
close(active.state.foodValuation.weight,(av.weight+bv.weight)/2);
assert.equal(events,1,'Recipient estimates must not emit UI cache events');
assert.equal(active.state.cityID,town.id);assert.equal(active.state.isTown,true);
assert.deepEqual([...active.state.improvementScores.keys()],[30],'Recipient candidates must not replace town candidates');
assert.deepEqual(active.state.foodValuation.recipients.map(c=>c.placementPopulation),[4,25]);
close(active.scoreRecord({YIELD_FOOD:10}).score,10*(av.weight+bv.weight)/2);
close(active.scoreRecord({YIELD_FOOD:-2}).score,-2*(av.weight+bv.weight)/2);
const initial=active.state.foodValuation.weight;
town.ruralPopulation=99;town.threshold=99999;town.output=999;
refresh();close(active.state.foodValuation.weight,initial,'Sender population and tile quality must not affect food value');
// Even an invalid sender growth threshold cannot disable recipient valuation.
town.threshold=NaN;refresh();close(active.state.foodValuation.weight,initial);
connected=[a.id,a.id,otherTown.id,foreign.id];refresh();close(active.state.foodValuation.weight,av.weight);
assert.equal(active.state.foodValuation.recipients.length,1);
connected=[b.id];refresh();close(active.state.foodValuation.weight,bv.weight);
b.threshold=2500;b.ruralPopulation=18;b.food=95;
refresh();close(active.state.foodValuation.weight,local(b).state.foodValuation.weight);
// Partial recipient data must use fixed fallback without reweighting the other share.
a.threshold=NaN;connected=[a.id,b.id];refresh();
close(active.state.foodValuation.weight,(settings.getWeight('YIELD_FOOD')+local(b).state.foodValuation.weight)/2);
assert.equal(active.state.foodValuation.approximate,true);
a.threshold=400;
// Same native split: directly connected cities only, equal per-city export amount.
connected=[a.id,b.id,otherTown.id];
const native=await readFile("C:/Program Files (x86)/Steam/steamapps/common/Sid Meier's Civilization VII/Base/modules/base-standard/ui/city-details/model-city-details.js",'utf8');
const start=native.indexOf('  buildSendingFoodData('),end=native.indexOf('  getValidGreatPeople(',start);
assert(start>0&&end>start);
globalThis.Players={get:()=>({Cities:{getCities:()=>[town]}})};
globalThis.ComponentID={isMatch:(x,y)=>x.id===y.id};
const Native=Function('return class {nonExportingProjects=["MIGRANT"];'+native.slice(start,end)+'}')();
const nativeData=new Native().buildSendingFoodData(town);
assert.deepEqual(getFoodRecipientCities(town).map(c=>c.id),nativeData.map(c=>c.city.id));
assert(nativeData.every(c=>c.data[0].amount===20));
close(combineRecipientFoodValues([{weight:.6},{weight:.2}]).weight,.4);
// Fixed mode, growing town, non-exporting project, no recipients.
settings.foodMode=FOOD_MODE.FIXED;settings.setWeight('YIELD_FOOD',.73);refresh();
assert.equal(active.state.foodValuation,null);close(active.scoreRecord({YIELD_FOOD:1}).score,.73);
settings.foodMode=FOOD_MODE.DYNAMIC;town.threshold=800;town.ruralPopulation=8;town.output=4;
for(const [growth,project,links] of [[0,'FISHING',[a.id]],[1,'MIGRANT',[a.id]],[1,'FISHING',[]]]){
 town.Growth.growthType=growth;town.Growth.projectType=project;connected=links;refresh();
 assert.notEqual(active.state.foodValuation?.mode,'export');assert.equal(active.state.foodValuation.placementPopulation,8);
}
// Failure in a recipient must not erase sender context or publish partial state.
town.Growth.projectType='FISHING';connected=[a.id];a.Yields.calculateAllBuildingsPlacements=()=>{throw Error('Unavailable')};refresh();
assert.equal(active.state.cityID,town.id);assert.equal(globalThis.WeightedYieldScores,active);
assert.equal(active.state.foodValuation.mode,'export');
for(const lang of ['ja','en']){
 globalThis.Locale={compose:key=>lang==='ja'?'食料':key};
 const text=getBuildingEvaluationDetailModel({score:1,correctedRecord:{YIELD_FOOD:1},correctedContributions:{YIELD_FOOD:1},foodValuation:active.state.foodValuation}).breakdown;
 assert(text.includes(lang==='ja'?'送り先の1都市の平均':'average across 1 recipient cities'));
 const base={score:1,correctedRecord:{YIELD_PRODUCTION:2},correctedContributions:{YIELD_PRODUCTION:1},foodValuation:active.state.foodValuation};
 const hasNote=e=>getBuildingEvaluationDetailModel(e).breakdown.includes(lang==='ja'?'送り先の':'average across');
 assert(!hasNote(base),'production-only hides food export note');
 assert(hasNote({...base,correctedRecord:{YIELD_FOOD:-2}}),'negative food also explains its weight');
 const opposite={...base,ruralReplacement:true,buildingRecord:{YIELD_FOOD:-2},relocation:{record:{YIELD_FOOD:2}}};
 assert(hasNote(opposite),'food loss and gain cancel but remain relevant terms');
 assert(!hasNote({...opposite,excludeRuralImpacts:true}),'excluded rural food must not leave an irrelevant note');
 assert(!hasNote({...base,correctedRecord:{YIELD_FOOD:0}}));
}
console.log('Export-food valuation: native recipients, equal split, individual growth values, isolated caches/events, refresh, fixed mode, non-exporting towns and JA/EN details PASS');
