import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {readOverbuildBonus,isBuildingOverbuild} from '../ui/overbuild-cost.js';
import {getBuildingCost} from '../ui/building-cost.js';
import {calculateBuildingPriority,selectBestBuildingPlacement} from '../ui/building-evaluator.js';
import {getBuildingEvaluationDetailModel} from '../ui/building-details.js';
const constructible={ConstructibleType:'BUILDING_TEST',ConstructibleClass:'BUILDING',$index:99,$hash:999};
function fixture(){
 let government='GOVERNMENT_NONE', slots=[[],[],[]];
 const policies={commune:{TraditionType:'TRADITION_COMMUNE',Name:'Commune'},engineering:{TraditionType:'TRADITION_CIVIL_ENGINEERING',Name:'Civil engineering'}};
 const rows=[{$index:0,$hash:31,ConstructibleClass:'BUILDING'},{$index:31,$hash:2,ConstructibleClass:'IMPROVEMENT'},constructible];
 rows.lookup=id=>id===999?constructible:null;
 const city={id:{owner:0,id:1},owner:2,Production:{getConstructibleProductionCost:()=>120}};
 const api={CultureSlotTypes:{POLICY_CULTURE_SLOT:0,TRADITION_CULTURE_SLOT:1,CRISIS_CULTURE_SLOT:2},
  GameInfo:{Constructibles:rows,Governments:{lookup:()=>({GovernmentType:government,Name:government})},Traditions:{lookup:id=>policies[id]}},
  Players:{get:id=>{assert.equal(id,2,'current owner');return {Culture:{getGovernmentType:()=>42,getActiveTraditions:slot=>slots[slot]}};}}};
 Object.assign(globalThis,api);
 return {city,api,rows,slots,setGovernment:v=>government=v};
}
const buildingPlacement={overbuiltConstructibleID:0};
test('active inherited Commune, stacking, de-duplication, policy removal and unavailable reads',()=>{
 const f=fixture();
 assert.equal(readOverbuildBonus(f.city).percent,0);
 f.slots[1].push('commune');
 assert.equal(readOverbuildBonus(f.city).percent,20);
 f.slots[0].push('commune','engineering');
 f.setGovernment('GOVERNMENT_PLUTOCRACY');
 assert.equal(readOverbuildBonus(f.city).percent,70);
 f.slots[0].length=0;f.slots[1].length=0;
 assert.equal(readOverbuildBonus(f.city).percent,20);
 f.setGovernment('GOVERNMENT_NONE');assert.equal(readOverbuildBonus(f.city).percent,0);
 f.api.Players.get=()=>{throw Error('unavailable');};
 assert.deepEqual(readOverbuildBonus(f.city),{known:false,percent:0});
});
test('only DB-index building replacement qualifies; fresh, rural, repair and purchase unaffected',()=>{
 const f=fixture();f.slots[1].push('commune');
 for(const value of [null,undefined,-1,'',false,0.5]) assert.equal(isBuildingOverbuild(constructible,{overbuiltConstructibleID:value}),false);
 assert.equal(isBuildingOverbuild(constructible,buildingPlacement),true);
 assert.equal(isBuildingOverbuild(constructible,{overbuiltConstructibleID:31}),false,'not a hash lookup');
 const args={city:f.city,constructible,placement:buildingPlacement};
 const adjusted=getBuildingCost(args);
 assert.equal(adjusted.productionCost,120);assert.equal(adjusted.efficiencyCost,100);
 assert.equal(calculateBuildingPriority({score:2,efficiencyCost:adjusted.efficiencyCost}),200);
 assert.equal(getBuildingCost({...args,placement:{overbuiltConstructibleID:-1}}).efficiencyCost,120);
 assert.equal(getBuildingCost({...args,isRepairing:true}).efficiencyCost,120);
 assert.equal(getBuildingCost({...args,item:{repairDamaged:true}}).efficiencyCost,120);
 assert.equal(getBuildingCost({...args,operationArguments:{RepairDamaged:true}}).efficiencyCost,120);
 assert.equal(getBuildingCost({...args,isPurchasing:true,item:{cost:280}}).efficiencyCost,80);
 f.city.Production.getConstructibleProductionCost=()=>0;assert.equal(getBuildingCost(args).efficiencyCost,0);
});
test('actual chooser paths use the chosen plot and preserve four UI combinations',async()=>{
 const f=fixture();f.slots[1].push('commune');
 const chooser=await readFile(new URL('../ui/patch-production-chooser.js',import.meta.url),'utf8');
 const source=chooser.slice(chooser.indexOf('function scoreItem('),chooser.indexOf('\nfunction decorateAndSortItems('));
 const scoreItem=Function('getBuildingCost','calculateBuildingPriority','evaluateBuildingPlacement','selectBestBuildingPlacement',source+';return scoreItem;')(getBuildingCost,calculateBuildingPriority,({placement})=>({...placement,placement}),selectBestBuildingPlacement);
 const plots=[{plotIndex:1,score:1.5,complete:true,overbuiltConstructibleID:-1},{plotIndex:2,score:2,complete:true,...buildingPlacement}];
 const bundle=[{constructibleType:999,placements:plots}];
 for(const combo of ['WYS','WYS+City Hall','WYS+Cool UI','WYS+City Hall+Cool UI']){
  const item={type:999,cost:280,...(combo.includes('City Hall')?{productionCost:120}:{})};
  const result=scoreItem(f.city,item,bundle,[],false);
  assert.equal(result.priority,200,combo);assert.equal(result.score,2);assert.equal(result.plotIndex,2);
  assert.equal(scoreItem(f.city,item,bundle,[],true).priority,250,combo+' purchase');
  assert.equal(scoreItem(f.city,{...item,repairDamaged:true},bundle,[],false).efficiencyCost,120);
 }
 const placementSource=await readFile(new URL('../ui/patch-building-placement.js',import.meta.url),'utf8');
 const start=placementSource.indexOf('function buildWeightedPlacementOptions('),end=placementSource.indexOf('\nfunction getScoreBadgeOffset(',start);
 const manager={cityID:f.city.id,currentConstructible:constructible,expandablePlots:[],developedPlots:[],urbanPlots:[2],getPlacementPlotData:()=>plots[1],getTotalYieldChanges:()=>[]};
 globalThis.Cities={get:()=>f.city};globalThis.GameplayMap={getLocationFromIndex:()=>({x:3,y:4})};
 const fn=Function('BuildingEvaluationMode','BuildingPlacementManager','WeightedYieldRuntime','WeightedYieldConfig','InterfaceMode','MODE_NAME','componentIDsMatch','isPurchasing','evaluateBuildingPlacement','getBuildingCost','calculateBuildingPriority','selectBestBuildingPlacement',
 'let evaluationsByPlot,bestPlotIndexes;'+placementSource.slice(start,end)+'; return buildWeightedPlacementOptions;')(
 {isExcluded:()=>false},manager,{state:{cityID:f.city.id,improvementScores:new Map([[2,1]])},getPopulationCandidates:()=>[]},{buildingValuation:{}},{getInterfaceModeHandler:()=>({Context:{OperationArguments:{}}})},'PLACE',()=>true,()=>false,({placement})=>({...placement,placement}),getBuildingCost,calculateBuildingPriority,selectBestBuildingPlacement);
 assert.equal(fn()[0].wysEvaluation.priority,200);
 manager.isRepairing=true;assert.equal(fn()[0].wysEvaluation.efficiencyCost,120);
});
test('JA/EN cost explanation includes source, and failed reads have a separate explanation',()=>{
 const f=fixture();f.slots[1].push('commune');
 const base={score:2,priority:200,correctedRecord:{},correctedContributions:[]};
 const args={city:f.city,constructible,placement:buildingPlacement};
 for(const language of ['ja','en']){
  globalThis.Locale={compose:key=>key==='Commune'?'Commune':language==='ja'?'食料':key};
  const text=getBuildingEvaluationDetailModel({...base,...getBuildingCost(args)}).breakdown;
  assert.ok(text.includes('20%'));assert.ok(text.includes('Commune'));assert.ok(text.includes('÷ 1.2'));
  f.slots[1].length=0;
  assert.ok(!getBuildingEvaluationDetailModel({...base,...getBuildingCost(args)}).breakdown.includes('÷ 1.2'));
  f.slots[1].push('commune');
 }
 f.api.Players.get=()=>{throw Error('test');};
 const unavailable=getBuildingCost(args);assert.equal(unavailable.efficiencyCost,120);assert.equal(unavailable.overbuildBonusUnavailable,true);
 assert.match(getBuildingEvaluationDetailModel({...base,...unavailable}).breakdown,/could not be read/);
});

