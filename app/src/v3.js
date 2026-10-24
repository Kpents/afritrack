/** AfriTrack v3 – all features in this file work offline using explicit user-entered or demo data.
 * No feature here confers real nutrition verification, clinical status or cloud synchronization.
 */
import {scaledNutrition,sumNutrition,round,isoLocal} from './nutrition.js';
import {METRICS,metricHistory} from './advanced.js';

export function ensureV3(s){
 if(!Array.isArray(s.diaryGroups)||!s.diaryGroups.length)s.diaryGroups=['Breakfast','Lunch','Dinner','Snack'];
 if(!Array.isArray(s.mealTemplates))s.mealTemplates=[];
 if(!Array.isArray(s.foodCorrections))s.foodCorrections=[];
 if(!Array.isArray(s.customCharts))s.customCharts=[];
 if(!s.profile||typeof s.profile!=='object')s.profile={};
 if(!s.preferences||typeof s.preferences!=='object')s.preferences={};
 return s;
}
export function createMealTemplate(s,{name,date,group,makeId}){
 ensureV3(s);
 const entries=s.diary.filter(x=>x.date===date && x.meal===group);
 if(!entries.length)throw new Error('No food entries in this group on the selected date.');
 const title=String(name||'').trim();if(!title||title.length>80)throw new Error('Enter a template name (1–80 characters).');
 const id=makeId();const snapshot=entries.map(({id:oldId,date:oldDate,repeatRuleId,templateId,...rest})=>({...rest}));
 s.mealTemplates.push({id,name:title,entries:snapshot,created:isoLocal()});return id;
}
export function applyMealTemplate(s,{id,date,group,makeId}){
 ensureV3(s);const tpl=s.mealTemplates.find(x=>x.id===id);
 if(!tpl)throw new Error('Template not found.');
 if(!s.diaryGroups.includes(group))throw new Error('Invalid diary group.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error('Invalid date.');
 const entries=tpl.entries.map(e=>({...e,id:makeId(),date,meal:group,templateId:id}));
 s.diary.push(...entries);return entries.length;
}
export function bulkDiaryChange(s,{ids,day,action,group}){
 ensureV3(s);if(!['delete','move'].includes(action))throw new Error('Unsupported bulk action.');
 if(action==='move'&&!s.diaryGroups.includes(group))throw new Error('Select an existing diary group.');
 const wanted=new Set(ids);
 if(!wanted.size)throw new Error('Select at least one entry.');
 const selected=s.diary.filter(e=>e.date===day&&wanted.has(e.id));
 if(action==='delete')s.diary=s.diary.filter(e=>!(e.date===day&&wanted.has(e.id)));
 else for(const e of selected)e.meal=group;
 return selected.length;
}
export function recentFoods(s,n=7){const seen=new Set();const out=[];
 for(const x of [...s.diary].reverse())if(x.foodId&&!seen.has(x.foodId)){seen.add(x.foodId);out.push(x);if(out.length>=n)break;}
 return out;
}
export function readRecipeLines(raw,foods){
 const lines=String(raw||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 if(!lines.length||lines.length>50)throw new Error('Enter 1–50 ingredient lines.');
 const output=[];const unknown=[];
 const clean=x=>x.toLowerCase().replace(/[^\p{L}\p{N} ]/gu,' ').replace(/\s+/g,' ').trim();
 for(const line of lines){
  // Only mass units are parsed – cups/spoons have ingredient-dependent densities.
  let match=line.match(/^(\d+(?:\.\d+)?)\s*(kg|g|grams?|kilograms?)\s+(.+)$/i);
  if(!match){const postfix=line.match(/^(.+?)\s+[-:,]?\s*(\d+(?:\.\d+)?)\s*(kg|g|grams?|kilograms?)$/i);if(postfix)match=[line,postfix[2],postfix[3],postfix[1]];}
  if(!match){unknown.push(`${line}: enter grams or kg`);continue;}
  const grams=Number(match[1])*(/^k/i.test(match[2])?1000:1);
  if(!Number.isFinite(grams)||grams<=0||grams>50000){unknown.push(`${line}: invalid mass`);continue;}
  const name=clean(match[3]);
  const food=foods.find(f=>clean(f.name)===name)||foods.find(f=>clean(f.name).includes(name)&&name.length>=3);
  if(!food){unknown.push(`${line}: food not found in local catalog`);continue;}
  output.push({id:food.id,grams:round(grams,2)});
 }
 if(unknown.length)throw new Error(`Resolve these ingredient lines before saving: ${unknown.join(' | ').slice(0,700)}`);
 return output;
}
export function recipeNutrition(ingredients,foods,cookedYieldG){
 if(!ingredients?.length)throw new Error('Add at least one ingredient.');
 const yieldG=Number(cookedYieldG);if(!Number.isFinite(yieldG)||yieldG<=0||yieldG>100000)throw new Error('Enter a positive cooked yield in grams.');
 const total=sumNutrition(ingredients.map(i=>{
  const f=foods.find(f=>f.id===i.id);if(!f)throw new Error('One ingredient is no longer available.');
  return scaledNutrition(f,i.grams);
 }));
 return {total,per100g:Object.fromEntries(['kcal','protein','carbs','fat','fiber'].map(k=>[k,round(total[k]*100/yieldG,2)])),yieldG};
}
export const ACTIVITY_FACTORS={sedentary:1.2,light:1.375,moderate:1.55,active:1.725,very_active:1.9};
export function calculateEnergyNeeds({age,heightCm,weightKg,formula,activity}){
 const ageN=Number(age),height=Number(heightCm),weight=Number(weightKg);
 if(!Number.isFinite(ageN)||ageN<18||ageN>100||height<120||height>230||weight<25||weight>400)throw new Error('For adult estimates, enter age 18–100, height 120–230 cm and weight 25–400 kg.');
 if(!['female','male'].includes(formula)||!ACTIVITY_FACTORS[activity])throw new Error('Choose an available formula and activity category.');
 const bmr=10*weight+6.25*height-5*ageN+(formula==='male'?5:-161);
 return {bmr:Math.round(bmr),maintenance:Math.round(bmr*ACTIVITY_FACTORS[activity]),note:'Mifflin–St Jeor population estimate, not a prescription; accuracy varies by individual.'};
}
export function setDietPreset(s,preset){
 // Editable convenience distributions, not condition-specific recommendations.
 const weights={balanced:[.25,.50,.25],protein_focus:[.30,.45,.25],carb_focus:[.20,.55,.25]};
 if(!weights[preset])throw new Error('Unknown template.');
 const [protein,carbs,fat]=weights[preset],energy=Number(s.goals.kcal);
 if(!Number.isFinite(energy)||energy<500)throw new Error('Set a calorie target first.');
 s.goals.protein=Math.round(energy*protein/4);
 s.goals.carbs=Math.round(energy*carbs/4);
 s.goals.fat=Math.round(energy*fat/9);
 s.preferences.dietPreset=preset;
 return {...s.goals};
}
export function contributorRanking(s,day,field){
 if(!['kcal','protein','carbs','fat','fiber'].includes(field))throw new Error('Unknown nutrient.');
 return s.diary.filter(e=>e.date===day).map(e=>({id:e.id,name:e.name,quantity:Number(e[field]||0)})).sort((a,b)=>b.quantity-a.quantity);
}
export function createCorrection(s,{foodId,field,message,makeId}){
 ensureV3(s);const content=String(message||'').trim();
 if(!foodId||!content||content.length<12||content.length>1200)throw new Error('Describe the food issue in 12–1,200 characters.');
 const entry={id:makeId(),foodId,field:String(field||'general').slice(0,40),message:content,status:'local-draft',created:new Date().toISOString()};
 s.foodCorrections.push(entry);return entry;
}
// Tiny strict CSV parser supporting quoted fields and commas, not formulas/evaluation.
export function csvRows(text){
 const src=String(text||'').replace(/^\uFEFF/,'');if(src.length>1_000_000)throw new Error('CSV exceeds 1 MB.');
 const rows=[];let row=[],cell='',quoted=false;
 for(let i=0;i<src.length;i++){
  const c=src[i];if(c==='"'){if(quoted&&src[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
  else if(c===','&&!quoted){row.push(cell);cell='';}
  else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&src[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell='';}
  else cell+=c;
 }
 if(quoted)throw new Error('Malformed quoted CSV.');row.push(cell);if(row.some(x=>x.trim()))rows.push(row);
 if(rows.length>1501)throw new Error('Import at most 1,500 rows at a time.');return rows;
}
export function importHealthCsv(s,text,makeId){
 const rows=csvRows(text);if(rows.length<2)throw new Error('CSV needs a header and data.');
 const headers=rows.shift().map(x=>x.trim().toLowerCase());
 if(headers.join(',')!=='date,steps,water_ml,weight_kg,sleep_hours')throw new Error('Header must be: date,steps,water_ml,weight_kg,sleep_hours');
 // Validate all entries first to ensure an atomic, nonpartial import.
 const edits=rows.map((r,i)=>{
  if(r.length!==5)throw new Error(`Row ${i+2} has the wrong number of columns.`);
  const [date,...fields]=r.map(x=>x.trim());
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(new Date(date+'T12:00:00').getTime()))throw new Error(`Row ${i+2} has an invalid date.`);
  const vals=fields.map((x,j)=>x===''?null:Number(x));
  for(let j=0;j<4;j++)if(vals[j]!==null&&(!Number.isFinite(vals[j])||vals[j]<0||vals[j]>[100000,20000,600,24][j]))throw new Error(`Row ${i+2} has an invalid numeric field.`);
  return {date,steps:vals[0],water:vals[1],kg:vals[2],sleep:vals[3]};
 });
 for(const e of edits){
  if(e.steps!==null)s.steps[e.date]=e.steps;
  if(e.water!==null)s.hydration[e.date]=e.water;
  if(e.kg!==null&&e.kg>0){s.weights=s.weights.filter(x=>x.date!==e.date);s.weights.push({id:makeId(),date:e.date,kg:e.kg,source:'user-imported CSV'});}
  if(e.sleep!==null){ensureV3(s);s.biometrics=s.biometrics.filter(x=>!(x.date===e.date&&x.kind==='sleep'&&x.source==='user-imported CSV'));
   s.biometrics.push({id:makeId(),date:e.date,kind:'sleep',value:e.sleep,source:'user-imported CSV'});}
 }
 return edits.length;
}
export function dualMetricHistory(s,day,first,second,days=14){
 if(!METRICS[first]||!METRICS[second])throw new Error('Unknown metric.');
 const a=metricHistory(s,day,first,days),b=metricHistory(s,day,second,days);
 return a.map((p,i)=>({date:p.date,a:p.value,b:b[i].value}));
}
