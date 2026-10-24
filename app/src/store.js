import { DEFAULT_GOALS } from './data.js';
import { isoLocal } from './nutrition.js';
import { ensureExtensions } from './advanced.js';
import { ensureV3 } from './v3.js';
const BASE_KEY = 'afritrack.local.v1';
let KEY=BASE_KEY;
export function setStorageScope(accountId){ KEY=accountId?`${BASE_KEY}.user-${accountId}`:BASE_KEY; }
export function clearScopedState(accountId){localStorage.removeItem(`${BASE_KEY}.user-${accountId}`);}
const fresh = () => ({version:1,profile:{name:'Ama',weightKg:72},goals:{...DEFAULT_GOALS},diary:[],hydration:{},steps:{},exercises:[],weights:[],customFoods:[],favorites:[],notes:{},created:isoLocal()});
export function loadState() {
  try {
    const raw=JSON.parse(localStorage.getItem(KEY));
    if(raw?.version===1) return ensureV3(ensureExtensions({
      ...fresh(),...raw,
      profile:{...fresh().profile,...raw.profile},
      goals:{...DEFAULT_GOALS,...raw.goals},
      diary:Array.isArray(raw.diary)?raw.diary:[],
      exercises:Array.isArray(raw.exercises)?raw.exercises:[],
      customFoods:Array.isArray(raw.customFoods)?raw.customFoods:[],
      favorites:Array.isArray(raw.favorites)?raw.favorites:[],
      hydration:raw.hydration||{},steps:raw.steps||{},weights:Array.isArray(raw.weights)?raw.weights:[]
    }));
  }catch (e) { console.warn('Local saved data could not be read', e); }
  return ensureV3(ensureExtensions(fresh()));
}
export function saveState(state) {localStorage.setItem(KEY,JSON.stringify(state));}
export function clearState() {const s=ensureV3(ensureExtensions(fresh())); saveState(s); return s;}
export function importState(json) {
  const parsed=JSON.parse(json);
  if(!parsed || parsed.version!==1 || !Array.isArray(parsed.diary) || !Array.isArray(parsed.customFoods) || !parsed.goals) throw new Error('This is not an AfriTrack v1 backup.');
  // Keep only a known, constrained data model rather than trusting arbitrary imported keys.
  const base=fresh();
  const imported={...base,
    profile:{name:String(parsed.profile?.name||'Friend').slice(0,80),weightKg:Number(parsed.profile?.weightKg)||72,...Object.fromEntries(['age','heightCm','formula','activity'].filter(k=>parsed.profile?.[k]!=null).map(k=>[k,parsed.profile[k]]))},
    goals:Object.fromEntries(Object.keys(DEFAULT_GOALS).map(k=>[k,Math.max(1,Number(parsed.goals[k])||DEFAULT_GOALS[k])])),
    diary:parsed.diary.slice(-10000),hydration:parsed.hydration||{},steps:parsed.steps||{},
    exercises:Array.isArray(parsed.exercises)?parsed.exercises.slice(-10000):[],
    weights:Array.isArray(parsed.weights)?parsed.weights.slice(-10000):[],
    customFoods:parsed.customFoods.slice(-2000),favorites:Array.isArray(parsed.favorites)?parsed.favorites:[],notes:parsed.notes||{}
  };
  for(const key of ['repeatRules','biometrics','fasts','customCharts','mealTemplates','foodCorrections','diaryGroups'])if(Array.isArray(parsed[key]))imported[key]=parsed[key].slice(-5000);
  if(parsed.schedule&&typeof parsed.schedule==='object'&&!Array.isArray(parsed.schedule))imported.schedule=parsed.schedule;
  if(parsed.preferences&&typeof parsed.preferences==='object'&&!Array.isArray(parsed.preferences))imported.preferences=parsed.preferences;
  ensureV3(ensureExtensions(imported));saveState(imported);return imported;
}
export const uid = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
