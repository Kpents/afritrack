export const clamp = (x, min, max) => Math.min(max, Math.max(min, Number(x) || 0));
export const round = (v, n = 1) => Math.round((Number(v) + Number.EPSILON) * 10 ** n) / 10 ** n;
export const NUTRIENTS = ['kcal','protein','carbs','fat','fiber'];
export const emptyNutrition = () => Object.fromEntries(NUTRIENTS.map(k=>[k,0]));
export function scaledNutrition(food, grams, addons=[]) {
  const ratio = clamp(grams,0,5000)/100;
  const result = emptyNutrition();
  for (const key of NUTRIENTS) result[key] = Number(food?.[key] || 0) * ratio;
  for (const extra of addons) for (const key of NUTRIENTS) result[key] += Number(extra[key] || 0);
  for (const key of NUTRIENTS) result[key] = round(result[key]);
  return result;
}
export function sumNutrition(entries=[]) {
  const result = emptyNutrition();
  for(const entry of entries) for(const key of NUTRIENTS) result[key] += Number(entry[key]||0);
  for(const key of NUTRIENTS) result[key] = round(result[key]);
  return result;
}
export const ratio = (n,d) => d>0 ? clamp((n/d)*100,0,100) : 0;
export function exerciseCalories(met, weightKg, minutes) {
  // MET-based general estimate, not a personal medical measurement.
  return Math.max(0, Math.round(Number(met||0)*3.5*Number(weightKg||0)*Number(minutes||0)/200));
}
export function isoLocal(date=new Date()) {
  const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,'0'),d=String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}
export function shiftDay(iso,n) { const d=new Date(`${iso}T12:00:00`); d.setDate(d.getDate()+n); return isoLocal(d); }
export function weekDates(lastISO) {return Array.from({length:7},(_,i)=>shiftDay(lastISO,i-6));}
export function niceDate(date) {return new Date(`${date}T12:00:00`).toLocaleDateString('en',{weekday:'short',month:'short',day:'numeric'});}
