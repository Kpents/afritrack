import test from 'node:test';
import assert from 'node:assert/strict';
import {MICRO_DEFINITIONS,parseMicros,scaleMicros,recipeMicros,microSummary} from '../app/src/micro.js';
test('20 manual vitamin/mineral definitions carry units',()=>{assert.equal(Object.keys(MICRO_DEFINITIONS).length,20);assert.deepEqual(MICRO_DEFINITIONS.iron_mg,['Iron','mg']);});
test('missing micronutrient data is unknown, not automatically zero',()=>{assert.deepEqual(scaleMicros({micros:{}},150),{});let summary=microSummary([{micros:{}},{micros:{iron_mg:3}}]);assert.equal(summary.iron_mg.value,3);assert.equal(summary.iron_mg.knownEntries,1);assert.equal(summary.iron_mg.complete,false);});
test('genuine explicitly entered zero is tracked as known',()=>{let summary=microSummary([{micros:{iron_mg:0}}]);assert.equal(summary.iron_mg.value,0);assert.equal(summary.iron_mg.complete,true);});
test('micronutrients scale with portion grams',()=>{assert.equal(scaleMicros({micros:{iron_mg:1.5,vitamin_c_mg:25}},200).iron_mg,3);});
test('recipe micronutrient only propagates when all ingredients contain values',()=>{let foods=[{id:'a',micros:{iron_mg:2,vitamin_c_mg:0}},{id:'b',micros:{iron_mg:3}}];let r=recipeMicros([{id:'a',grams:100},{id:'b',grams:100}],foods,200);assert.equal(r.iron_mg,2.5);assert.ok(!('vitamin_c_mg' in r));});
test('manual micronutrient form rejects invalid negatives and preserves blank',()=>{let data=new FormData();data.set('iron_mg','0');data.set('vitamin_c_mg','');assert.deepEqual(parseMicros(data),{iron_mg:0});data.set('iron_mg','-1');assert.throws(()=>parseMicros(data));});
