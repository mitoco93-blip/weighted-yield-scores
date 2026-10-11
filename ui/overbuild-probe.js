// Read-only discovery of the native production/overbuild information.
// Only read state. The modifier-list zero-argument signatures are being tested;
// errors are recorded, never interpreted as zero bonuses. Never start a build.
const seen = new Set();
const safe = fn => { try { return fn(); } catch (e) { return {error:String(e)}; } };
function names(value) {
  const out=new Set();
  for(let p=value,depth=0;p && depth<4;p=Object.getPrototypeOf(p),depth++) {
    for(const key of Object.getOwnPropertyNames(p)) if(key!=='constructor')out.add(key);
  }
  return [...out].sort();
}
function snapshot(value,depth=0) {
  if(value==null || ['string','number','boolean'].includes(typeof value))return value;
  if(typeof value==='function')return '[function]';
  if(depth>=5)return '[object]';
  if(Array.isArray(value))return value.slice(0,12).map(x=>snapshot(x,depth+1));
  const out={};
  for(const key of names(value).slice(0,80)) {
    const item=safe(()=>value[key]);
    if(typeof item!=='function')out[key]=snapshot(item,depth+1);
  }
  return out;
}
export function probeOverbuild(city,placementData,api,log,version) {
  if(!city || city.isTown || !placementData?.buildings?.length)return;
  const key=JSON.stringify(city.id);
  if(seen.has(key))return;
  seen.add(key);
  const emit=(label,value)=>log('Overbuild probe '+JSON.stringify({version,city:key,label,value}));
  for(const field of ['Production','Modifiers','BuildQueue','Yields']) {
    const object=city[field];
    const keys=safe(()=>names(object));
    if(Array.isArray(keys))for(let i=0;i<keys.length;i+=12)emit(field+'-members-'+i,keys.slice(i,i+12));
    if(field==='Production'||field==='Modifiers')emit(field+'-values',safe(()=>snapshot(object)));
  }
  // Split records below the game logger's truncation limit.
  const emitDetail=(label,value)=>{
    const json=JSON.stringify(snapshot(value));
    if(!json){emit(label,{unavailable:true});return;}
    if(json.length<=1000){emit(label,JSON.parse(json));return;}
    for(let at=0;at<json.length;at+=1000)emit(label+'-chunk',{part:at/1000,total:Math.ceil(json.length/1000),text:json.slice(at,at+1000)});
  };
  const emitList=(label,value)=>{
    if(!Array.isArray(value)){emitDetail(label,value);return;}
    emit(label+'-count',{total:value.length,logged:Math.min(value.length,120)});
    value.slice(0,120).forEach((item,i)=>emitDetail(label+'-'+i,item));
  };
  const player=safe(()=>api.Players.get(city.id.owner));
  for(const [scope,object] of [['city',city.Modifiers],['player',player?.Modifiers]]) {
    // Existence confirmed for city in dev.15. Only a zero-argument read is probed.
    for(const method of ['getModifiers','getModifierSubjects']) {
      if(typeof object?.[method]==='function')emitList(scope+'-'+method,safe(()=>object[method]()));
    }
  }
  const effectNames=safe(()=>names(api.GameEffects));
  if(Array.isArray(effectNames))for(let i=0;i<effectNames.length;i+=12)emit('GameEffects-members-'+i,effectNames.slice(i,i+12));
  // Signatures below are from the shipped policy and city-details UI.
  if(player?.Culture) {
    emitDetail('government',safe(()=>api.GameInfo.Governments.lookup(player.Culture.getGovernmentType())));
    for(const slot of ['POLICY_CULTURE_SLOT','TRADITION_CULTURE_SLOT','CRISIS_CULTURE_SLOT']) {
      if(api.CultureSlotTypes?.[slot]!=null)emitList('active-'+slot,safe(()=>player.Culture.getActiveTraditions(api.CultureSlotTypes[slot]).map(id=>api.GameInfo.Traditions.lookup(id))));
    }
  }
  if(api.CityYieldNodes?.INCOME!=null && typeof city.Yields?.getYieldsForNode==='function') {
    const production=api.YieldTypes.YIELD_PRODUCTION;
    emitDetail('production-income-summary',safe(()=>city.Yields.getYieldSummaryForNode(production,[api.CityYieldNodes.INCOME])));
    for(const name of ['INCOME_MODIFIERS','CITY_EFFECTS_YIELDS','ACTIVE_CIV_TRADITIONS']) {
      if(api.CityYieldNodes[name]!=null)emitDetail('production-'+name,safe(()=>city.Yields.getYieldsForNode(production,[api.CityYieldNodes.INCOME,api.CityYieldNodes[name]],true)));
    }
  }
  emit('production-yield',safe(()=>({gross:city.Yields.getYield(api.YieldTypes.YIELD_PRODUCTION),net:city.Yields.getNetYield(api.YieldTypes.YIELD_PRODUCTION)})));
  const entries=(placementData?.buildings??[]).filter(entry=>entry.placements?.some(p=>p.overbuiltConstructibleID!=null&&p.overbuiltConstructibleID!==-1));
  for(const entry of entries.slice(0,3)) {
    const def=api.GameInfo.Constructibles.lookup(entry.constructibleType);
    if(!def || def.ConstructibleClass!=='BUILDING')continue;
    emit('building',safe(()=>({type:def.ConstructibleType,index:def.$index,hash:def.$hash,cost:city.Production.getConstructibleProductionCost(def.$hash)})));
    const replacement=entry.placements.find(p=>p.overbuiltConstructibleID!=null&&p.overbuiltConstructibleID!==-1);
    const fresh=entry.placements.find(p=>p.overbuiltConstructibleID==null||p.overbuiltConstructibleID===-1);
    for(const placement of [fresh,replacement].filter(Boolean)) {
      const location=api.GameplayMap.getLocationFromIndex(placement.plotID);
      const args={ConstructibleType:def.$index,X:location.x,Y:location.y};
      emit('placement',safe(()=>snapshot(placement)));
      emit('build-check',safe(()=>snapshot(api.Game.CityOperations.canStart(city.id,api.CityOperationTypes.BUILD,args,false))));
    }
  }
}
