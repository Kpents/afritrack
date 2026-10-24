import test from 'node:test';
import assert from 'node:assert/strict';
import { scaledNutrition, sumNutrition, exerciseCalories, isoLocal, shiftDay, weekDates, ratio } from '../app/src/nutrition.js';
import { FOODS, ADDONS } from '../app/src/data.js';

test('nutrients scale linearly by portion mass',()=>{
 const food=FOODS.find(f=>f.id==='jollof'); const a=scaledNutrition(food,100); const b=scaledNutrition(food,200);
 assert.equal(b.kcal,a.kcal*2); assert.equal(b.carbs,a.carbs*2);
});
test('optional accompaniment adds to nutrient breakdown',()=>{
 const food=FOODS.find(f=>f.id==='waakye'); const no=scaledNutrition(food,300); const withEgg=scaledNutrition(food,300,[ADDONS[0]]);
 assert.equal(withEgg.kcal,no.kcal+78);assert.equal(withEgg.protein,no.protein+6.3);
});
test('sum nutrition includes multiple foods and handles empty diaries',()=>{
 assert.equal(sumNutrition([]).kcal,0);
 assert.equal(sumNutrition([{kcal:100,protein:4},{kcal:150,protein:7}]).kcal,250);
});
test('portions cannot be negative or excessive',()=>{
 const food=FOODS[0]; assert.equal(scaledNutrition(food,-100).kcal,0); assert.equal(scaledNutrition(food,9000).kcal,scaledNutrition(food,5000).kcal);
});
test('activity estimates are nonnegative',()=>{
 assert.equal(exerciseCalories(3.5,72,30),132); assert.equal(exerciseCalories(3.5,72,-20),0);
});
test('day navigation survives month rollover',()=>{
 assert.equal(shiftDay('2026-10-01',-1),'2026-09-30');assert.equal(weekDates('2026-10-14').length,7);
});
test('goal percentage clamps to 100',()=>{assert.equal(ratio(240,100),100);assert.equal(ratio(10,0),0);});
test('food catalog contains major regions',()=>{const s=new Set(FOODS.map(f=>f.region));assert.ok(s.has('West Africa')&&s.has('East Africa')&&s.has('Southern Africa')&&s.has('North Africa'));});
