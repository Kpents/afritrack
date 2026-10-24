import test from 'node:test';
import assert from 'node:assert/strict';
import {FOODS,DEFAULT_GOALS} from '../app/src/data.js';
import {ensureV3,createMealTemplate,applyMealTemplate,bulkDiaryChange,recentFoods,readRecipeLines,recipeNutrition,calculateEnergyNeeds,setDietPreset,contributorRanking,createCorrection,csvRows,importHealthCsv,dualMetricHistory} from '../app/src/v3.js';
const blank=()=>ensureV3({diary:[],mealTemplates:[],customFoods:[],diaryGroups:[],foodCorrections:[],profile:{weightKg:72},goals:{...DEFAULT_GOALS},steps:{},hydration:{},weights:[],biometrics:[],exercises:[]});
const ids=()=>{let i=0;return ()=>`test-${++i}`};
test('v3 migrates existing local state with default diary groups',()=>{const s=blank();assert.deepEqual(s.diaryGroups,['Breakfast','Lunch','Dinner','Snack']);assert.deepEqual(s.mealTemplates,[]);assert.deepEqual(s.foodCorrections,[])});
test('saved meal template contains independent nutrition snapshots and can be applied to a selected date',()=>{
 const s=blank();s.diary.push({id:'old',date:'2026-10-14',meal:'Lunch',foodId:'jollof',name:'Jollof Rice',grams:250,kcal:292});
 const id=createMealTemplate(s,{name:'Waakye lunch',date:'2026-10-14',group:'Lunch',makeId:ids()});
 s.diary[0].kcal=900;
 const count=applyMealTemplate(s,{id,date:'2026-10-15',group:'Dinner',makeId:ids()});
 assert.equal(count,1);assert.equal(s.diary[1].kcal,292);assert.equal(s.diary[1].meal,'Dinner');assert.notEqual(s.diary[1].id,'old');
});
test('templates refuse empty group and invalid target group',()=>{const s=blank();assert.throws(()=>createMealTemplate(s,{name:'x',date:'2026-10-14',group:'Lunch',makeId:ids()}));s.mealTemplates.push({id:'a',entries:[]});assert.throws(()=>applyMealTemplate(s,{id:'a',group:'Nonexistent',date:'2026-10-15',makeId:ids()}));});
test('bulk action operates only on selected date and specified IDs',()=>{
 const s=blank();s.diary=[{id:'a',date:'2026-10-14',meal:'Lunch'},{id:'b',date:'2026-10-14',meal:'Lunch'},{id:'c',date:'2026-10-13',meal:'Lunch'}];
 assert.equal(bulkDiaryChange(s,{ids:['a','c'],day:'2026-10-14',action:'move',group:'Snack'}),1);
 assert.equal(s.diary[0].meal,'Snack');assert.equal(s.diary[2].meal,'Lunch');
 assert.equal(bulkDiaryChange(s,{ids:['a','c'],day:'2026-10-14',action:'delete'}),1);assert.deepEqual(s.diary.map(x=>x.id),['b','c']);
});
test('recent foods are distinct by ID',()=>{const s=blank();s.diary=[{foodId:'a',id:1},{foodId:'b',id:2},{foodId:'a',id:3}];assert.deepEqual(recentFoods(s).map(x=>x.foodId),['a','b']);});
test('text recipe import recognizes grams, kilograms and postfix amounts',()=>{
 const x=readRecipeLines('250g Jollof Rice\nWaakye 0.5 kg',FOODS);
 assert.deepEqual(x,[{id:'jollof',grams:250},{id:'waakye',grams:500}]);
});
test('unknown or unsupported ingredients fail atomically rather than getting ignored',()=>{
 assert.throws(()=>readRecipeLines('250g Jollof Rice\n2 cups Mystery fish',FOODS),/Resolve/);
 assert.throws(()=>readRecipeLines('2 cups Waakye',FOODS),/grams or kg/);
});
test('cooked recipe yield changes nutrient density but not full recipe nutrient totals',()=>{
 const items=[{id:'jollof',grams:100}];const a=recipeNutrition(items,FOODS,100),b=recipeNutrition(items,FOODS,200);
 assert.equal(a.total.kcal,b.total.kcal);assert.equal(a.per100g.kcal,b.per100g.kcal*2);
 assert.throws(()=>recipeNutrition(items,FOODS,0));
});
test('adult BMR and maintenance estimates follow Mifflin–St Jeor arithmetic',()=>{
 const result=calculateEnergyNeeds({age:30,heightCm:170,weightKg:70,formula:'female',activity:'sedentary'});
 assert.equal(result.bmr,1452);assert.equal(result.maintenance,1742);
 assert.throws(()=>calculateEnergyNeeds({age:16,heightCm:170,weightKg:70,formula:'female',activity:'sedentary'}));
});
test('macro preset is derived from energy and does not change target calories',()=>{
 const s=blank();s.goals.kcal=2000;setDietPreset(s,'protein_focus');assert.equal(s.goals.kcal,2000);assert.equal(s.goals.protein,150);assert.equal(s.goals.carbs,225);assert.equal(s.goals.fat,56);
});
test('contributor ranking sums logged snapshots',()=>{const s=blank();s.diary=[{id:'a',date:'2026-10-14',name:'Jollof',protein:14},{id:'b',date:'2026-10-14',name:'Waakye',protein:28}];assert.equal(contributorRanking(s,'2026-10-14','protein')[0].name,'Waakye');});
test('feedback is a local draft, never verified or submitted automatically',()=>{const s=blank();createCorrection(s,{foodId:'jollof',field:'nutrition',message:'This portion looks inaccurate',makeId:ids()});assert.equal(s.foodCorrections[0].status,'local-draft');});
test('CSV parser respects quoted commas, headers and blank lines',()=>{assert.deepEqual(csvRows('a,b\n"hello, world",2\n'),[['a','b'],['hello, world','2']]);});
test('CSV health imports records, preserves blanks, replaces same-day totals',()=>{
 const s=blank();s.steps['2026-10-14']=11;
 let n=importHealthCsv(s,'date,steps,water_ml,weight_kg,sleep_hours\n2026-10-14,5000,1200,72.3,7\n2026-10-15,,1300,,',ids());
 assert.equal(n,2);assert.equal(s.steps['2026-10-14'],5000);assert.equal(s.steps['2026-10-15'],undefined);assert.equal(s.hydration['2026-10-15'],1300);assert.equal(s.weights[0].kg,72.3);assert.equal(s.biometrics[0].value,7);
});
test('bad CSV does not partially import earlier good rows',()=>{
 const s=blank();assert.throws(()=>importHealthCsv(s,'date,steps,water_ml,weight_kg,sleep_hours\n2026-10-14,5000,,,\n2026-10-15,-1,,,',ids()));assert.deepEqual(s.steps,{});
});
test('dual metrics share date keys and respect chosen lookback',()=>{const s=blank();s.steps['2026-10-14']=2000;const points=dualMetricHistory(s,'2026-10-14','kcal','steps',7);assert.equal(points.length,7);assert.equal(points[6].b,2000);});
