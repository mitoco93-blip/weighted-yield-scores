import Panel from '/core/ui/panel-support.js';
import { ContextManager } from '/core/ui/context-manager/context-manager.js';
import { DropdownSelectionChangeEventName } from '/core/ui/components/fxs-dropdown.js';
import { InputEngineEventName } from '/core/ui/input/input-support.js';
import { WeightedYieldSettings as settings } from '../settings.js';
import { RESOURCE_SETTING_DEFAULTS, normalizeResourceSetting } from '../resource-settings.js';
import { parseRatio } from '../resource-valuation.js';
import { resourceEffectKey } from '../resource-engine.js';
import { AGE_KEYS, SHARED_FIELDS, resourceText as txt, ageFields, resourcesForAge, resourceName, effectSettingsForResource, effectLabel } from './resource-options-model.js';

class ResourceSettingsEditor extends Panel {
 constructor(root) { super(root); this.ageIndex=0; this.listeners=[]; }
 onInitialize() {
  super.onInitialize();
  this.effectsOnly = this.Root.tagName.toLowerCase() === 'wys-resource-effects-editor';
  const initialAge = Number(this.Root.getAttribute('data-age-index'));
  if (Number.isInteger(initialAge) && initialAge >= 0 && initialAge < 3) this.ageIndex = initialAge;
  if(!document.getElementById('wys-resource-style')) {
   const style=document.createElement('style');style.id='wys-resource-style';
   style.textContent=`
     .wys-resource-panel .wys-resource-frame{width:60rem;max-width:95%;height:52rem;max-height:90%;margin-top:2rem}
     .wys-resource-panel .wys-resource-content{width:100%;box-sizing:border-box;padding:.25rem 1.5rem}
     .wys-resource-panel .wys-resource-row{display:flex;align-items:center;justify-content:space-between;min-height:2.6rem;margin-bottom:.2rem}
     .wys-resource-panel .wys-resource-label{display:flex;align-items:center;flex:1;min-width:0;padding-right:.75rem}
     .wys-resource-panel .wys-resource-number{display:flex;align-items:center;flex:none}
     .wys-resource-panel .wys-resource-unit{width:1.5rem;margin-left:.35rem}
    .wys-resource-panel input{width:5rem;height:2.15rem;box-sizing:border-box;flex:none;border:1px solid #807153;border-radius:0;background-color:rgba(0,0,0,.72);color:#f4eee1;padding:0 .5rem;line-height:calc(2.15rem - 2px);text-align:center;appearance:none;-webkit-appearance:none;box-shadow:none}
    .wys-resource-panel input:focus{border-color:#d6b66f;outline:none}
     .wys-resource-panel .wys-resource-invalid{color:#ff8080;border-color:#ff8080}
     .wys-resource-panel .wys-resource-section{margin-top:.8rem;margin-bottom:.3rem;color:#d6b66f}
     .wys-resource-panel .wys-resource-note{margin-bottom:.4rem;color:#c3c6cb;font-size:.9rem}
     .wys-resource-panel .wys-resource-intro{display:flex;align-items:center}
     .wys-resource-panel .wys-resource-intro-icon{flex:none;margin-right:.3rem;color:#d6b66f}
     .wys-resource-panel .wys-resource-intro-text{flex:1;min-width:0}
     .wys-resource-panel .wys-resource-help{color:#d6b66f;margin-left:.4rem;flex:none}
     .wys-resource-panel .wys-resource-ratio{display:flex;flex-wrap:wrap;align-items:center;padding:.35rem 0;border-bottom:1px solid rgba(128,113,83,.25);margin-bottom:.25rem}
     .wys-resource-panel .wys-resource-parts{display:flex;align-items:stretch;width:58%;flex:none;margin-top:0}
     .wys-resource-panel .wys-resource-part{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;padding:0 .5rem}
     .wys-resource-panel .wys-resource-part-label{min-height:1.25rem;text-align:center;width:100%;font-size:.85rem;margin-bottom:.15rem}
     .wys-resource-panel .wys-resource-percent{margin-top:.1rem;color:#d6b66f;font-size:.85rem;text-align:center}
     .wys-resource-panel .wys-resource-error{color:#ff8080;font-size:.85rem;margin-top:.15rem;width:100%}
     .wys-resource-panel .wys-resource-card{border-top:1px solid rgba(128,113,83,.3);margin-top:.5rem;padding-top:.25rem}
     .wys-resource-panel .wys-resource-name{color:#d6b66f;margin:.25rem 0}
     .wys-resource-panel .wys-resource-card .wys-resource-row{padding-left:.5rem}
    .wys-resource-panel .wys-resource-label-text{min-width:0;flex:0 1 auto}
    .wys-resource-panel .wys-resource-age-bar{display:flex;align-items:center;justify-content:space-between;margin:.65rem 0 .4rem}
    .wys-resource-panel .wys-resource-age-bar .wys-resource-section{margin:0}
    .wys-resource-panel .wys-resource-age-bar fxs-dropdown{width:14rem;flex:none}
    .wys-resource-panel .wys-resource-footer{display:flex;align-items:center;justify-content:space-between;margin-top:.65rem;padding-top:.5rem;border-top:1px solid rgba(128,113,83,.3)}
    .wys-resource-panel .wys-resource-footer fxs-button{max-width:24rem}
    .wys-resource-panel .wys-resource-effect-window{height:48rem}
   `;
   document.head.appendChild(style);
  }
  this.Root.classList.add('wys-resource-panel','absolute','flex','justify-center','fullscreen','max-w-screen','max-h-screen','pointer-events-auto');
  const shared = this.effectsOnly ? '' : `<div class="wys-resource-section">${txt('共通設定','Shared settings')}</div><div data-shared></div>`;
  const content = this.effectsOnly
   ? `<div class="wys-resource-note">${txt('100％＝通常評価、0％＝除外。効果ごとに0～1000％で調整できます。','100% = normal, 0% = excluded. Adjust each effect from 0 to 1000%.')}</div><div data-effects></div>`
   : `<div data-age-fields></div><div class="wys-resource-footer"><fxs-button data-open-effects caption="${txt('資源ごとの個別設定','Individual resource settings')}"></fxs-button><fxs-button data-reset caption="${txt('資源設定を初期値に戻す','Reset resource settings')}"></fxs-button></div>`;
  this.Root.innerHTML=`<div class="absolute img-lsgb-egypt-720 fullscreen"></div>
   <fxs-frame class="wys-resource-frame ${this.effectsOnly ? 'wys-resource-effect-window' : ''} flex-initial" content-as="fxs-vslot" content-class="flex-auto">
    <fxs-header class="self-center mb-2 font-title text-xl text-secondary" title="${txt(this.effectsOnly?'資源ごとの個別設定':'資源評価の設定',this.effectsOnly?'Individual resource settings':'Resource valuation settings')}" filigree-style="none"></fxs-header>
    <fxs-scrollable class="flex-auto" attached-scrollbar="true" allow-mouse-panning="true"><div class="wys-resource-content font-body text-base">
     ${this.effectsOnly ? '' : `<div class="wys-resource-note wys-resource-intro"><div class="wys-resource-intro-icon" aria-hidden="true">ⓘ</div><div class="wys-resource-intro-text">${txt('にマウスを重ねると説明を表示。比率の％は自動計算し、入力確定時に保存します。','Hover over the information icon for help. Percentages update automatically; values save when confirmed.')}</div></div>`}
     ${shared}
     <div class="wys-resource-age-bar"><div class="wys-resource-section">${txt('時代ごとの設定','Settings by age')}</div><fxs-dropdown class="w-64" data-age></fxs-dropdown></div>
     ${content}
    </div></fxs-scrollable><fxs-hero-button class="self-center mt-2" data-close caption="${txt(this.effectsOnly?'戻る':'閉じる',this.effectsOnly?'Back':'Close')}"></fxs-hero-button>
   </fxs-frame>`;
  this.age=this.Root.querySelector('[data-age]');
  this.age.setAttribute('dropdown-items',JSON.stringify([txt('古代','Antiquity'),txt('探検','Exploration'),txt('近代','Modern')].map(label=>({label}))));
  this.age.setAttribute('selected-item-index',String(this.ageIndex));
  if (!this.effectsOnly) this.renderFields(this.Root.querySelector('[data-shared]'),SHARED_FIELDS);
  this.renderAge();
 }

 listen(node,event,fn) {if(!node)return;node.addEventListener(event,fn);this.listeners.push(()=>node.removeEventListener(event,fn));}
 onAttach() {
  super.onAttach();
  this.listen(this.age,DropdownSelectionChangeEventName,event=>{
   const i=Number(event.detail.selectedIndex);
   if(i>=0 && i<3 && i!==this.ageIndex){this.commitAll();this.ageIndex=i;this.renderAge();}
  });
  this.listen(this.Root,'input',event=>{
   const group=event.target.closest?.('[data-ratio]');
   if(group)this.updateRatio(group,false);
  });
  this.listen(this.Root,'change',event=>this.commitInput(event.target));
  this.listen(this.Root,'focusout',event=>this.commitInput(event.target));
  this.listen(this.Root,'keydown',event=>{
   if(event.key==='Enter' && event.target.tagName==='INPUT'){this.commitInput(event.target);event.preventDefault();event.stopPropagation();}
  });
  this.listen(this.Root.querySelector('[data-close]'),'action-activate',()=>this.closeEditor());
  this.listen(this.Root.querySelector('[data-open-effects]'),'action-activate',()=>{
   this.commitAll();
   ContextManager.push('wys-resource-effects-editor', {singleton:true,createMouseGuard:true,attributes:{'data-age-index':String(this.ageIndex)}});
  });
  this.listen(this.Root.querySelector('[data-reset]'),'action-activate',()=>{
   this.resetting=true;
   try {
    for(const key of Object.keys(RESOURCE_SETTING_DEFAULTS))settings.resetOption(key);
    settings.resetResourceEffects();this.renderFields(this.Root.querySelector('[data-shared]'),SHARED_FIELDS);this.renderAge();
   } finally {this.resetting=false;}
  });
  this.listen(this.Root,InputEngineEventName,event=>{
   if(event.detail.status===InputActionStatuses.FINISH && event.isCancelInput()){this.closeEditor();event.preventDefault();event.stopPropagation();}
  });
 }
 onDetach() {for(const remove of this.listeners)remove();this.listeners=[];super.onDetach();}
 element(tag,className,text) {const el=document.createElement(tag);if(className)el.className=className;if(text!=null)el.textContent=text;return el;}
 label(text,help) {
  const label=this.element('div','wys-resource-label');
  label.appendChild(this.element('div','wys-resource-label-text',text));
  if(help){label.setAttribute('data-tooltip-content',help);const icon=this.element('div','wys-resource-help','ⓘ');icon.setAttribute('data-tooltip-content',help);label.appendChild(icon);}
  return label;
 }
 // Keep the game's font-body/text-base rules: Cohtml treats font-family:inherit as a literal font name.
 input(label,value) {
  const input=this.element('input','font-body text-base');input.type='text';input.inputMode='decimal';input.value=String(value);input.maxLength=32;
  input.setAttribute('aria-label',label);input.setAttribute('autocomplete','off');input.setAttribute('spellcheck','false');return input;
 }
 row(label,key,value,effect=false,meta={}) {
  const row=this.element('div','wys-resource-row');
  const help=meta.help?txt(...meta.help):null;
  row.appendChild(this.label(label,help));
  const number=this.element('div','wys-resource-number'),input=this.input(label,value);
  input.setAttribute(effect?'data-effect':'data-setting',key);if(help)input.setAttribute('data-tooltip-content',help);
  number.appendChild(input);if(effect)number.appendChild(this.element('span','wys-resource-unit','%'));
  row.appendChild(number);return row;
 }
 ratioRow(label,key,meta) {
  const group=this.element('div','wys-resource-ratio');group.setAttribute('data-ratio',key);
  group.appendChild(this.label(label,txt(...meta.help)));
  const parts=this.element('div','wys-resource-parts'),values=String(settings.get(key)).split(':');
  meta.parts.forEach((part,i)=>{
   const cell=this.element('div','wys-resource-part'),name=txt(...part);
   cell.appendChild(this.element('div','wys-resource-part-label',name));
   const input=this.input(label+' — '+name,values[i]);input.setAttribute('data-ratio-part',String(i));input.setAttribute('data-tooltip-content',txt(...meta.help));cell.appendChild(input);
   const percent=this.element('div','wys-resource-percent');percent.setAttribute('data-percent','');cell.appendChild(percent);parts.appendChild(cell);
  });
  group.appendChild(parts);
  const error=this.element('div','wys-resource-error');error.setAttribute('data-ratio-error','');error.setAttribute('aria-live','polite');group.appendChild(error);
  this.updateRatio(group,false);return group;
 }
 updateRatio(group,save) {
  const inputs=[...group.querySelectorAll('[data-ratio-part]')],values=inputs.map(input=>input.value.trim());
  const shares=parseRatio(values,inputs.length);
  inputs.forEach(input=>{input.classList.toggle('wys-resource-invalid',!shares);if(shares)input.removeAttribute('aria-invalid');else input.setAttribute('aria-invalid','true');});
  group.querySelectorAll('[data-percent]').forEach((el,i)=>{el.textContent=shares?`${Number((shares[i]*100).toFixed(1))}%`:'—';});
  group.querySelector('[data-ratio-error]').textContent=shares?'':txt('0以上の数値を入力し、少なくとも1項目を0より大きくしてください。未保存です。','Enter non-negative numbers with at least one greater than zero. Not saved.');
  if(save && shares)settings.set(group.getAttribute('data-ratio'),values.join(':'));
 }
 renderFields(container,fields) {
  container.innerHTML='';
  for(const [key,ja,en,meta={}] of fields){
   if(meta.section)container.appendChild(this.element('div','wys-resource-section',txt(...meta.section)));
   if(meta.subtitle)container.appendChild(this.element('div','wys-resource-note',txt(...meta.subtitle)));
   container.appendChild(meta.parts?this.ratioRow(txt(ja,en),key,meta):this.row(txt(ja,en),key,settings.get(key),false,meta));
  }
 }
 renderAge() {
  const age=AGE_KEYS[this.ageIndex];
  if (!this.effectsOnly) {
   this.renderFields(this.Root.querySelector('[data-age-fields]'),ageFields(age));
   this.Root.querySelector('fxs-scrollable')?.component?.resizeScrollThumb?.();
   return;
  }
  const container=this.Root.querySelector('[data-effects]');container.innerHTML='';
  for(const type of resourcesForAge(age)) {
   const card=this.element('div','wys-resource-card');card.setAttribute('data-resource-type',type);
   card.appendChild(this.element('div','wys-resource-name',resourceName(type)));
   for(const effect of effectSettingsForResource(age,type)){
    const keys=effect.members.map(resourceEffectKey);
    // Preserve the aggregate of old settings: biomes have equal weights;
    // Coffee uses the configured building/wonder production shares.
    const shares=effect.constructibleClasses ? parseRatio(settings.get('resourceProductionModern'),3) : null;
    let weights=effect.members.map(row=>shares ? shares[row.args.ConstructibleClass==='WONDER'?1:0] : 1);
    if(!weights.some(w=>w>0))weights=keys.map(()=>1);
    const total=weights.reduce((sum,w)=>sum+w,0);
    const percent=Number((keys.reduce((sum,key,i)=>sum+settings.getResourceEffectScale(key)*weights[i],0)/total*100).toFixed(6));
    const row=this.row(effectLabel(effect),keys[0],percent,true),input=row.querySelector('input');
    if(keys.length>1){input.setAttribute('data-effect-keys',JSON.stringify(keys));input.setAttribute('data-initial-value',String(percent));}
    card.appendChild(row);
   }
   container.appendChild(card);
  }
  this.Root.querySelector('fxs-scrollable')?.component?.resizeScrollThumb?.();
 }
 commitAll() {
  for(const group of this.Root.querySelectorAll('[data-ratio]'))this.updateRatio(group,true);
  for(const input of this.Root.querySelectorAll('[data-setting],[data-effect]'))this.commitInput(input);
 }
 closeEditor() {this.commitAll();this.close();}
 commitInput(input) {
  if(this.resetting)return;
  const group=input?.closest?.('[data-ratio]');if(group){this.updateRatio(group,true);return;}
  const key=input?.getAttribute?.('data-setting'),effect=input?.getAttribute?.('data-effect');if(!key && !effect)return;
  const value=String(input.value).trim();
  const valid=key ? normalizeResourceSetting(key,value,null)!==null : value!=='' && Number.isFinite(Number(value)) && Number(value)>=0 && Number(value)<=1000;
  input.classList.toggle('wys-resource-invalid',!valid);
  if(!valid){input.setAttribute('aria-invalid','true');return;}
  input.removeAttribute('aria-invalid');
  if(key){settings.set(key,value);input.value=String(settings.get(key));}
  else {
   const grouped=input.getAttribute('data-effect-keys'),keys=grouped ? JSON.parse(grouped) : [effect];
   // Opening/closing alone must not rewrite previously distinct effect coefficients.
   if(grouped && value===input.getAttribute('data-initial-value'))return;
   for(const member of keys)settings.setResourceEffectScale(member,Number(value)/100);
   input.value=String(Number(value));
   if(grouped)input.setAttribute('data-initial-value',input.value);
  }
 }
}
Controls.define('wys-resource-editor',{createInstance:ResourceSettingsEditor,description:'Resource valuation settings'});

Controls.define('wys-resource-effects-editor',{createInstance:ResourceSettingsEditor,description:'Individual resource settings'});
