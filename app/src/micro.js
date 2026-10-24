/** Voluntary micronutrient tracking. Missing input is UNKNOWN, never zero.
 * These definitions establish units only, not recommended dietary intakes.
 */
export const MICRO_DEFINITIONS=Object.freeze({
 vitamin_a_ug:['Vitamin A','µg'],vitamin_c_mg:['Vitamin C','mg'],vitamin_d_ug:['Vitamin D','µg'],vitamin_e_mg:['Vitamin E','mg'],vitamin_k_ug:['Vitamin K','µg'],
 thiamin_mg:['Vitamin B1 (thiamin)','mg'],riboflavin_mg:['Vitamin B2 (riboflavin)','mg'],niacin_mg:['Vitamin B3 (niacin)','mg'],b6_mg:['Vitamin B6','mg'],b12_ug:['Vitamin B12','µg'],folate_ug:['Folate','µg'],
 calcium_mg:['Calcium','mg'],iron_mg:['Iron','mg'],magnesium_mg:['Magnesium','mg'],zinc_mg:['Zinc','mg'],potassium_mg:['Potassium','mg'],sodium_mg:['Sodium','mg'],selenium_ug:['Selenium','µg'],phosphorus_mg:['Phosphorus','mg'],copper_mg:['Copper','mg']
});
export function parseMicros(form){const micros={};for(const key of Object.keys(MICRO_DEFINITIONS)){const raw=form.get(key);if(raw===null||String(raw).trim()==='')continue;const value=Number(raw);if(!Number.isFinite(value)||value<0||value>1000000)throw new Error(`Invalid value for ${key}.`);micros[key]=value;}return micros;}
export function scaleMicros(food,grams){const ratio=Number(grams)/100;if(!Number.isFinite(ratio)||ratio<=0||ratio>1000)throw new Error('Invalid serving mass.');
 const output={};for(const key of Object.keys(MICRO_DEFINITIONS))if(food?.micros?.[key]!==undefined&&food?.micros?.[key]!==null){const val=Number(food.micros[key]);if(Number.isFinite(val)&&val>=0)output[key]=Math.round(val*ratio*1000)/1000;}return output;
}
export function recipeMicros(ingredients,foods,cookedYieldG){
 const summed={};const complete={};for(const key of Object.keys(MICRO_DEFINITIONS))complete[key]=true;
 for(const ing of ingredients){const food=foods.find(f=>f.id===ing.id);if(!food)throw new Error('Unknown recipe ingredient.');const piece=scaleMicros(food,ing.grams);
  for(const key of Object.keys(MICRO_DEFINITIONS)){if(!(key in piece))complete[key]=false;else summed[key]=(summed[key]||0)+piece[key];}}
 const output={};for(const key of Object.keys(MICRO_DEFINITIONS))if(complete[key])output[key]=Math.round((summed[key]||0)*100/cookedYieldG*1000)/1000;
 return output;
}
export function microSummary(entries){const count=entries.length;const result={};for(const key of Object.keys(MICRO_DEFINITIONS)){
  let total=0,measured=0;for(const entry of entries){const val=entry.micros?.[key];if(val!==undefined&&val!==null&&Number.isFinite(Number(val))){total+=Number(val);measured++;}}
  result[key]={value:Math.round(total*1000)/1000,knownEntries:measured,totalEntries:count,complete:count>0&&measured===count};
 }return result;
}
