// Temporary read-only diagnostics for native relocation-candidate discovery.
const seen = new Set();
const safe = fn => { try { return fn(); } catch(e) { return {error:String(e)}; } };
function names(obj) {
  const found = new Set();
  for (let p=obj,depth=0;p && depth<4;depth++,p=Object.getPrototypeOf(p)) {
    for (const name of Object.getOwnPropertyNames(p)) if(name!=='constructor') found.add(name);
  }
  return [...found].sort();
}
export function probeRelocation(city, api, log, version) {
  const key = JSON.stringify(city?.id);
  if(!city || seen.has(key)) return;
  seen.add(key);
  const emit=(label,value)=>log('Relocation probe '+JSON.stringify({version,city:key,label,value}));
  emit('city-context',{location:city.location, isTown:city.isTown, ruralPopulation:city.ruralPopulation, urbanPopulation:city.urbanPopulation});
  for(const field of ['Growth','Workers','Yields','Constructibles','']) {
    const found=safe(()=>names(field?city[field]:city));
    if(Array.isArray(found)) for(let i=0;i<found.length;i+=12) emit('members-'+(field||'City')+'-'+i,found.slice(i,i+12));
    else emit('members-'+field,found);
  }
  for(const mode of [false,true]) {
    const result=safe(()=>api.Game.CityCommands.canStart(city.id,api.CityCommandTypes.EXPAND,{},mode));
    emit('EXPAND-'+mode+'-keys',result?Object.keys(result):null);
    for(const [field,value] of Object.entries(result??{})) {
      if(Array.isArray(value)) { for(let i=0;i<value.length;i+=8) emit('EXPAND-'+mode+'-'+field+'-'+i,value.slice(i,i+8)); if(!value.length)emit('EXPAND-'+mode+'-'+field,[]); }
      else emit('EXPAND-'+mode+'-'+field,value);
    }
  }
  const data=safe(()=>city.Yields.calculateAllBuildingsPlacements());
  emit('placements-keys',data?Object.keys(data):null);
  for(const [field,value] of Object.entries(data??{})) {
    if(Array.isArray(value)) { emit('placements-'+field+'-count',value.length); for(let i=0;i<Math.min(2,value.length);i++)emit('placements-'+field+'-sample-'+i,value[i]); }
  }
}
