import test from 'node:test';
import assert from 'node:assert/strict';
import {effectLabel,effectsForResource,effectSettingsForResource,resourcesForAge,ageFields} from '../ui/options/resource-options-model.js';

test('resource labels distinguish current targets, conditions and percentages in both languages',()=>{
 const saved=globalThis.Locale;
 try {
  for(const lang of ['ja','en']) {
   globalThis.Locale={compose:key=>key==='LOC_YIELD_FOOD'?(lang==='ja'?'食料':'Food'):key};
   const labels=(age,type)=>effectsForResource(age,'RESOURCE_'+type).map(effectLabel);
   const modern=type=>labels('modern',type).join('\n');
   const has=(text,ja,en)=>assert.ok(text.includes(lang==='ja'?ja:en),text);
   for(const age of ['antiquity','exploration','modern']) {
    const gold=labels(age,'GOLD').join('\n'),silver=labels(age,'SILVER').join('\n');
    has(gold,'全都市・町','All cities and towns');has(gold,'幸福度 +1','Happiness +1');has(gold,'ゴールド +1','Gold +1');
    has(silver,'食料 +1','Food +1');has(silver,'全都市・町','All cities and towns');
    assert.ok(!/20|購入|Purchase/.test(gold+silver));
    for(const type of resourcesForAge(age)) {
     const list=effectsForResource(age,type).map(effectLabel);
     assert.equal(new Set(list).size,list.length,`${age} ${type}: indistinguishable effect rows`);
     assert.ok(list.every(s=>s.length && !/LOC_|RESOURCE_|BUILDING_|BIOME_|UNIT_CLASS_|未対応|unavailable|生産ボーナス|Production bonus/.test(s)),list.join('\n'));
    }
   }
   has(modern('COFFEE'),'建物の建設時の生産力 +5%','Production toward Buildings +5%');
   has(modern('COFFEE'),'遺産の建設時の生産力 +5%','Production toward Wonders +5%');
   has(modern('COFFEE'),'工場配置時','Factory slots');
   const truffles=labels('modern','TRUFFLES');
   has(truffles.find(s=>s.includes('+8')),'鉄道駅あり','Rail Station present');
   has(truffles.find(s=>s.includes('+4')),'鉄道駅なし','Rail Station absent');
   assert.ok(!modern('TRUFFLES').includes('20%'));
   has(labels('exploration','TRUFFLES')[0],'全ユニットの生産力 +20%','Production toward All units +20%');
   has(labels('antiquity','SALT')[0],'全ユニットの生産力 +20%','Production toward All units +20%');
   has(modern('COCOA'),'幸福度 +3%','Happiness +3%');
   has(modern('COTTON'),'陸上ユニット','Land units');has(modern('CITRUS'),'海軍ユニット','Naval units');
   has(modern('HARDWOOD'),'民間ユニット','Civilian units');
   const pitch=labels('modern','PITCH');
   has(pitch.find(s=>s.includes('+1 ' ) || s.includes('+1（')),'工場ごとの生産力','per Factory');
   has(pitch.find(s=>s.includes('10%')),'工場の建設時の生産力','Production toward Factory');
   has(labels('antiquity','HORSES')[0],'騎兵の戦闘力','Cavalry combat strength');
   has(modern('NITER'),'長距離・攻囲','Ranged / Siege');
   has(labels('antiquity','GYPSUM')[0],'首都','Capital');
   has(labels('exploration','TEA').join('\n'),'本土','Homelands');
   has(labels('antiquity','WINE').join('\n'),'祝宴中','During celebrations');
  }
 } finally {globalThis.Locale=saved;}
});

test('biome wonder bonuses have one setting and list their targets; other effects remain separate',()=>{
 const saved=globalThis.Locale;
 try {
  for(const lang of ['ja','en']) {
   globalThis.Locale={compose:key=>key==='LOC_YIELD_FOOD'?(lang==='ja'?'食料':'Food'):key};
   for(const [age,type,count,ja,en] of [
    ['antiquity','IVORY',3,['砂漠','平原','熱帯'],['Desert','Plains','Tropical']],
    ['antiquity','MARBLE',3,['草原','ツンドラ','海洋'],['Grassland','Tundra','Marine']],
    ['antiquity','LIMESTONE',6,['すべての地形'],['All biomes']],
    ['exploration','MARBLE',6,['すべての地形'],['All biomes']],
    ['modern','MARBLE',6,['すべての地形'],['All biomes']],
   ]) {
    const groups=effectSettingsForResource(age,'RESOURCE_'+type);
    assert.equal(groups.length,1,age+' '+type);
    assert.equal(groups[0].members.length,count);
    const label=effectLabel(groups[0]);
    for(const target of lang==='ja'?ja:en)assert.ok(label.includes(target),label);
    assert.ok(label.includes(lang==='ja'?'遺産':'Wonders'));
   }
   for(const age of ['exploration','modern']) {
    const limestone=effectSettingsForResource(age,'RESOURCE_LIMESTONE');
    assert.equal(limestone.length,1);
    assert.ok(effectLabel(limestone[0]).includes(lang==='ja'?'建物':'Buildings'));
    assert.equal(effectSettingsForResource(age,'RESOURCE_IVORY').length,2,'food/production/happiness effects are not biome duplicates');
   }
   const coffee=effectSettingsForResource('modern','RESOURCE_COFFEE');
   assert.equal(coffee.length,1,'Coffee has one adjustment');
   assert.equal(coffee[0].members.length,2,'both native effects remain');
   const coffeeLabel=effectLabel(coffee[0]);
   assert.ok(coffeeLabel.includes(lang==='ja'?'建物・遺産の建設時の生産力 +5%':'Production toward Buildings and Wonders +5%'),coffeeLabel);
   assert.ok(ageFields('antiquity').some(([key])=>key==='resourceWonderBiomesAntiquity'),'shared wonder spending breakdown is unchanged');
  }
 } finally {globalThis.Locale=saved;}
});
