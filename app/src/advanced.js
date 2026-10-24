/** Client-side feature primitives. Never imply that demo food figures are verified. */
import {shiftDay, isoLocal, sumNutrition} from './nutrition.js';

export const METRICS = Object.freeze({kcal:'Calories (kcal)',protein:'Protein (g)',carbs:'Carbohydrates (g)',fat:'Fat (g)',fiber:'Fibre (g)',water:'Water (ml)',steps:'Steps',exercise:'Exercise (minutes)',weight:'Weight (kg)',sleep:'Sleep (hours)'});
export const BIOMETRICS = Object.freeze({bp_sys:['Systolic blood pressure','mmHg'],bp_dia:['Diastolic blood pressure','mmHg'],glucose:['Blood glucose','mmol/L'],heart_rate:['Resting heart rate','bpm'],waist:['Waist circumference','cm'],sleep:['Sleep duration','hours'],mood:['Mood rating (1–5)','score'],temperature:['Temperature','°C'],custom:['Custom numeric marker','unit']});
const ISO=/^\d{4}-\d{2}-\d{2}$/;
export function ensureExtensions(s){
 if(!s.repeatRules||!Array.isArray(s.repeatRules))s.repeatRules=[];
 if(!s.schedule||typeof s.schedule!=='object'||Array.isArray(s.schedule))s.schedule={};
 if(!s.biometrics||!Array.isArray(s.biometrics))s.biometrics=[];
 if(!s.fasts||!Array.isArray(s.fasts))s.fasts=[];
 if(!s.customCharts||!Array.isArray(s.customCharts))s.customCharts=[];
 if(!s.preferences||typeof s.preferences!=='object')s.preferences={};
 return s;
}
export function dayKey(day){if(!ISO.test(day)||!Number.isFinite(new Date(`${day}T12:00:00`).getTime()))throw new Error('Invalid day');return new Date(`${day}T12:00:00`).getDay();}
export function goalsForDay(s,day){const key=String(dayKey(day));return {...s.goals,...(s.schedule?.[key]||{})};}
export function applyRepeatsForDay(s,day){ensureExtensions(s);dayKey(day);let changed=0;
 for(const r of s.repeatRules){if(!r?.id||!r.template||!r.days?.includes(dayKey(day))||day<r.startDate)continue;
  if(s.diary.some(e=>e.repeatRuleId===r.id && e.date===day))continue;
  s.diary.push({...r.template,id:crypto.randomUUID(),date:day,repeatRuleId:r.id});changed++;
 }return changed;
}
export function copyPreviousDay(s,day){const prev=shiftDay(day,-1);const entries=s.diary.filter(e=>e.date===prev);for(const e of entries){const {repeatRuleId,...base}=e;s.diary.push({...base,id:crypto.randomUUID(),date:day});}return entries.length;}
export function mealStreak(s,day){let date=day;if(!s.diary.some(e=>e.date===date))date=shiftDay(date,-1);let n=0;while(n<3650&&s.diary.some(e=>e.date===date)){n++;date=shiftDay(date,-1);}return n;}
export function activeFast(s){return (s.fasts||[]).find(f=>!f.end)||null;}
export function fastElapsed(f,now=Date.now()){if(!f)return 0;return Math.max(0,Math.round(((f.end||now)-f.start)/60000));}
export function metricsForDay(s,day){const n=sumNutrition(s.diary.filter(e=>e.date===day));return {...n,water:Number(s.hydration?.[day]||0),steps:Number(s.steps?.[day]||0),exercise:s.exercises.filter(x=>x.date===day).reduce((a,e)=>a+Number(e.minutes||0),0),weight:s.weights.filter(w=>w.date<=day).sort((a,b)=>b.date.localeCompare(a.date))[0]?.kg??null,sleep:(s.biometrics||[]).filter(x=>x.date===day&&x.kind==='sleep').reduce((a,x)=>a+Number(x.value||0),0)};}
export function metricHistory(s,day,metric,count=7){if(!METRICS[metric])throw new Error('Unknown metric');if(!Number.isInteger(count)||count<1||count>365)throw new Error('Invalid range');return Array.from({length:count},(_,i)=>{const date=shiftDay(day,i-count+1);return {date,value:metricsForDay(s,date)[metric]??0};});}
export function matchFoodQuery(text,foods){
 const q=String(text||'').trim().toLowerCase();if(!q)return null;
 const grams=q.match(/(?:^|\s)(\d{1,4}(?:\.\d+)?)\s*(?:g|gram|grams)\b/);
 const meal=q.match(/\b(breakfast|lunch|dinner|snack)\b/);
 const clean=q.replace(/\d+(?:\.\d+)?\s*(?:g|gram|grams)\b/g,' ').replace(/\b(for|breakfast|lunch|dinner|snack|today|ate|i|had|with|a|some|of|please|log|grams)\b/g,' ').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
 if(!clean)return null;
 const normalize=x=>x.toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
 let best=foods.filter(f=>clean.includes(normalize(f.name))).sort((a,b)=>b.name.length-a.name.length)[0];
 if(!best){const terms=clean.split(' ').filter(w=>w.length>=3);const scored=foods.map(food=>{const name=normalize(food.name),words=name.split(' ');const hits=terms.filter(term=>words.some(w=>w===term||w.startsWith(term))).length;return {food,hits};}).sort((a,b)=>b.hits-a.hits||b.food.name.length-a.food.name.length);if(scored[0]?.hits>0)best=scored[0].food;}
 return best?{food:best,grams:grams?Number(grams[1]):best.serving,meal:meal?meal[1][0].toUpperCase()+meal[1].slice(1):null}:null;
}
export function rankedFoodSuggestions(foods,field){if(!['protein','fiber','kcal','carbs','fat'].includes(field))throw new Error('Unsupported demo nutrient');return [...foods].filter(f=>Number(f[field])>0).sort((a,b)=>Number(b[field])*Number(b.serving)/100-Number(a[field])*Number(a.serving)/100).slice(0,5);}
export function reportRows(s,end,days=7){return metricHistory(s,end,'kcal',days).map(({date})=>({date,...metricsForDay(s,date)}));}
export const WEEKNAMES=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
