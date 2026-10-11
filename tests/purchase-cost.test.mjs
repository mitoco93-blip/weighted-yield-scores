import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pathToFileURL,fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ui=path.join(root,'ui');
const {getBuildingCost,GOLD_TO_PRODUCTION}=await import(pathToFileURL(path.join(ui,'building-cost.js')));
const {calculateBuildingPriority,selectBestBuildingPlacement}=await import(pathToFileURL(path.join(ui,'building-evaluator.js')));
const {getBuildingEvaluationDetailModel,getBuildingListScoreParts}=await import(pathToFileURL(path.join(ui,'building-details.js')));
const {sortBuildingItems}=await import(pathToFileURL(path.join(ui,'building-list-sort.js')));
const def={$hash:42,ConstructibleType:'HARBOR'};
let production=27,gold=80,commandCost,commands=[];
const city={id:{id:1,owner:0},Production:{getConstructibleProductionCost:()=>production},Gold:{getBuildingPurchaseCost:(yieldType,type)=>{assert.equal(yieldType,2);assert.equal(type,'HARBOR');return gold;}}};
globalThis.YieldTypes={YIELD_GOLD:2};globalThis.CityCommandTypes={PURCHASE:5};
globalThis.Game={CityCommands:{canStart:(id,type,args,send)=>{assert.equal(type,5);assert.equal(send,false);commands.push(args);return {Cost:commandCost,Success:false,InsufficientFunds:true};}}};
const evaluate=cost=>calculateBuildingPriority({score:8/3.5,efficiencyCost:cost.efficiencyCost});
const cost=(purchasing,item)=>getBuildingCost({city,constructible:def,isPurchasing:purchasing,item});
assert.equal(evaluate(cost(false)),847);
assert.equal(evaluate(cost(true,{cost:80,productionCost:27})),1000);
assert.equal(cost(true,{cost:80}).efficiencyCost,80*GOLD_TO_PRODUCTION);
// Discounts apply only to the selected acquisition route.
production=50;gold=400;assert.equal(evaluate(cost(false)),457);assert.equal(evaluate(cost(true)),200);
production=100;gold=200;assert.equal(evaluate(cost(false)),229);assert.equal(evaluate(cost(true)),400);
production=50;gold=200;assert.equal(evaluate(cost(false)),457);assert.equal(evaluate(cost(true)),400);
commandCost=80;gold=96;assert.equal(cost(true).purchaseCost,80,'Command result wins over generic price, even when funds are insufficient');
assert.equal(cost(true,{cost:64}).purchaseCost,64,'Native chooser price is authoritative');
assert.equal(cost(true,{cost:0}).purchaseCost,0);assert.equal(evaluate(cost(true,{cost:0})),null);
commandCost=undefined;gold=undefined;assert.equal(cost(true).efficiencyCost,null);assert.equal(evaluate(cost(true)),null);
assert.equal(getBuildingListScoreParts({score:1,priority:null}).efficiency,'—');
// Execute the actual chooser scoring function with only yield evaluation stubbed.
globalThis.GameInfo={Constructibles:{lookup:()=>def}};
const chooser=await readFile(path.join(ui,'patch-production-chooser.js'),'utf8');
const scoreSource=chooser.slice(chooser.indexOf('function scoreItem('),chooser.indexOf('\nfunction decorateAndSortItems('));
const scoreItem=Function('getBuildingCost','calculateBuildingPriority','evaluateBuildingPlacement','selectBestBuildingPlacement',scoreSource+'; return scoreItem;')(getBuildingCost,calculateBuildingPriority,({placement})=>placement,selectBestBuildingPlacement);
const bundle=[{constructibleType:42,placements:[{plotIndex:1,score:8/3.5,complete:true}]}];
production=27;gold=80;
for(const combo of ['WYS','WYS+City Hall','WYS+Cool UI','WYS+City Hall+Cool UI']) {
  const item={type:'HARBOR',cost:80,...(combo.includes('City Hall')?{productionCost:27}:{})};
  assert.equal(scoreItem(city,item,bundle,[],false).priority,847,combo+' production');
  assert.equal(scoreItem(city,item,bundle,[],true).priority,1000,combo+' purchase');
  assert.equal(scoreItem(city,{...item,cost:96},bundle,[],true).priority,833,combo+' no purchase discount');
}
assert.deepEqual(sortBuildingItems([{type:'A',wysBuildingPriority:833},{type:'B',wysBuildingPriority:1000}], 'efficiency').map(x=>x.type),['B','A']);
// Execute the actual placement path, preserving command context and per-plot coordinates.
const source=await readFile(path.join(ui,'patch-building-placement.js'),'utf8');
const start=source.indexOf('function buildWeightedPlacementOptions('),end=source.indexOf('\nfunction getScoreBadgeOffset(',start);
const context={OperationArguments:{ConstructibleType:42,RepairDamaged:true}};
let purchasing=true;
const manager={cityID:city.id,currentConstructible:def,expandablePlots:[7],developedPlots:[],urbanPlots:[],getPlacementPlotData:()=>({plotIndex:7,score:8/3.5,complete:true}),getTotalYieldChanges:()=>[]};
globalThis.Cities={get:()=>city};globalThis.GameplayMap={getLocationFromIndex:()=>({x:3,y:4})};
const placementFn=Function('BuildingEvaluationMode','BuildingPlacementManager','WeightedYieldRuntime','WeightedYieldConfig','InterfaceMode','MODE_NAME','componentIDsMatch','isPurchasing','evaluateBuildingPlacement','getBuildingCost','calculateBuildingPriority','selectBestBuildingPlacement',
 'let evaluationsByPlot,bestPlotIndexes;'+source.slice(start,end)+'; return buildWeightedPlacementOptions;')(
 {isExcluded:()=>false},manager,{state:{cityID:city.id,improvementScores:new Map([[7,1]])},getPopulationCandidates:()=>[]},{buildingValuation:{}},{getInterfaceModeHandler:()=>({Context:context})},'PLACE',()=>true,()=>purchasing,({placement})=>placement,getBuildingCost,calculateBuildingPriority,selectBestBuildingPlacement);
commandCost=80;
assert.equal(placementFn()[0].wysEvaluation.priority,1000);
assert.deepEqual(commands.at(-1),{ConstructibleType:42,RepairDamaged:true,X:3,Y:4});
assert.deepEqual(context.OperationArguments,{ConstructibleType:42,RepairDamaged:true});
purchasing=false;assert.equal(placementFn()[0].wysEvaluation.priority,847);
// Localized explanations must expose gold-to-production conversion only for purchases.
const evaluation={score:8/3.5,priority:1000,correctedRecord:{},correctedContributions:[],...cost(true,{cost:80})};
for(const language of ['ja','en']){
 globalThis.Locale={compose:key=>language==='ja'?'食料':key};
 const detail=getBuildingEvaluationDetailModel(evaluation).breakdown;
 assert(detail.includes('80 [icon:YIELD_GOLD] × 2/7'));
 assert(detail.includes('22.86 [icon:YIELD_PRODUCTION]'));
 assert(!getBuildingEvaluationDetailModel({...evaluation,...cost(false)}).breakdown.includes('× 2/7'));
}
console.log('Purchase-only / production-only discounts, native prices, missing/free costs, four chooser combinations, sorting, placement and JA/EN breakdown: PASS');
