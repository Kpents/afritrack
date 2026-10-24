// AfriTrack demonstration catalog.
// All numeric nutrient values below are ILLUSTRATIVE TEST FIXTURES, NOT verified food-composition measurements.
// Before production, replace with region- and recipe-specific, sourced, reviewed records.
export const REGIONS = ['All', 'West Africa', 'East Africa', 'Southern Africa', 'North Africa', 'Central Africa'];
// nutrients per 100g of the prepared food. Values are not suitable for clinical advice.
const f = (id, name, country, region, serving, kcal, protein, carbs, fat, fiber, image='', description='', tags=[]) => ({
  id,name,country,region,serving,kcal,protein,carbs,fat,fiber,image,description,tags,source:'Demo estimate · not verified'
});
export const FOODS = [
 f('jollof','Jollof rice','Ghana / Nigeria','West Africa',250,155,3.6,26.8,4.0,1.3,'jollof','Rice cooked in a spiced tomato and pepper base. Preparation and oil content vary widely.',['rice','tomato']),
 f('waakye','Waakye','Ghana','West Africa',300,146,5.6,26,2.3,3.8,'waakye','Rice and beans cooked together; accompaniments are logged separately.',['rice','beans']),
 f('fufu','Fufu & light soup','Ghana','West Africa',350,113,3.5,21,1.5,1.7,'fufu','Pounded cassava/plantain with a light soup; meat and fish differ by serving.',['cassava','soup']),
 f('banku','Banku & tilapia','Ghana','West Africa',350,152,9.6,19.0,4.1,1.5,'banku','Fermented corn and cassava dough with grilled tilapia.',['fish','maize']),
 f('kelewele','Kelewele','Ghana','West Africa',150,205,1.5,34,7,3,'','Spiced fried plantain bites.',['plantain']),
 f('redred','Red red','Ghana','West Africa',300,162,6.5,20,6.1,5.8,'','Black-eyed peas stew, often served with plantain.',['beans']),
 f('kontomire','Kontomire stew','Ghana','West Africa',180,115,5.4,7,7.8,2.5,'','Leafy stew with peppers and protein, dependent on recipe.',['greens']),
 f('egusi','Egusi soup','Nigeria','West Africa',250,188,9.3,7,13.5,2.8,'','Ground melon-seed stew with leafy greens.',['soup']),
 f('suya','Beef suya','Nigeria','West Africa',180,214,23,5,11,1,'','Grilled spiced meat with a nut-and-pepper coating.',['protein']),
 f('thieb','Thieboudienne','Senegal','West Africa',350,160,8.2,20,5.3,2,'','Rice, fish and vegetables in a tomato-based sauce.',['rice','fish']),
 f('injera','Injera & doro wat','Ethiopia','East Africa',350,148,9.6,17,4.5,2.1,'injera','Fermented flatbread served with spiced chicken stew.',['teff','chicken']),
 f('misir','Misir wat','Ethiopia','East Africa',220,135,8.0,17,4.1,5.4,'','Spiced red lentil stew.',['lentils']),
 f('ugali','Ugali','Kenya / Tanzania','East Africa',250,117,2.1,25,0.4,1.1,'','Cooked maize meal, commonly eaten alongside greens and stews.',['maize']),
 f('sukuma','Sukuma wiki','Kenya','East Africa',180,66,3.2,6.9,3.4,2.6,'','Sautéed leafy greens with onions and tomatoes.',['greens']),
 f('nyama','Nyama choma','Kenya','East Africa',200,230,26,0,14,0,'','Grilled meat; values depend on cut, fat and preparation.',['protein']),
 f('pilau','East African pilau','Tanzania / Kenya','East Africa',300,166,5.5,25,5,1.6,'','Aromatic rice cooked with spices and sometimes meat.',['rice']),
 f('matoke','Matoke stew','Uganda','East Africa',300,106,2.5,20,2.4,2.6,'','Green bananas stewed with onion, tomato and spices.',['banana']),
 f('pap','Pap & chakalaka','South Africa','Southern Africa',300,123,3.5,24,1.6,2.2,'','Maize porridge alongside a spicy vegetable relish.',['maize']),
 f('bobotie','Bobotie','South Africa','Southern Africa',250,181,13.0,10.5,10.1,1.4,'','Baked spiced mince with an egg-based topping.',['protein']),
 f('sadza','Sadza & greens','Zimbabwe','Southern Africa',300,116,3.1,23.0,1.4,2.1,'','Maize-meal staple with leafy vegetables.',['maize']),
 f('chakalaka','Chakalaka','South Africa','Southern Africa',170,73,2.5,10,2.6,3.3,'','Spicy vegetable-and-bean relish.',['vegetables']),
 f('couscous','Vegetable couscous','Morocco','North Africa',300,127,4.5,24,1.8,3.0,'','Steamed semolina with seasoned vegetables.',['wheat']),
 f('tagine','Chicken tagine','Morocco','North Africa',300,132,14.5,6,5.5,1.6,'','Slow-cooked chicken with aromatic spices and vegetables.',['chicken']),
 f('shakshuka','Shakshuka','Tunisia','North Africa',230,104,6.2,7,5.4,1.9,'','Eggs poached in a pepper and tomato sauce.',['egg']),
 f('ndole','Ndolé','Cameroon','Central Africa',250,161,12.5,8,8.8,3.4,'','Bitterleaf stew with nuts and protein.',['greens'])
];

export const ADDONS = [
 {id:'egg',name:'Boiled egg',grams:50,kcal:78,protein:6.3,carbs:0.6,fat:5.3,fiber:0},
 {id:'shito',name:'Shito (1 tbsp)',grams:15,kcal:60,protein:0.7,carbs:1.6,fat:5.4,fiber:0.2},
 {id:'gari',name:'Gari (2 tbsp)',grams:20,kcal:72,protein:0.3,carbs:17.2,fat:0.1,fiber:0.6},
 {id:'plantain',name:'Fried plantain',grams:90,kcal:210,protein:1.1,carbs:34,fat:8.8,fiber:2.1},
 {id:'fish',name:'Grilled fish',grams:100,kcal:150,protein:25,carbs:0,fat:5.5,fiber:0},
 {id:'chicken',name:'Grilled chicken',grams:100,kcal:195,protein:27,carbs:0,fat:9,fiber:0}
];
export const MEALS = ['Breakfast','Lunch','Dinner','Snacks'];
export const DEFAULT_GOALS = {kcal:2100,protein:125,carbs:260,fat:70,fiber:28,water:2500,steps:8000};
export const EXERCISES = [
 {id:'walk',name:'Walking',met:3.5,icon:'footprints'},
 {id:'run',name:'Running',met:8,icon:'activity'},
 {id:'cycle',name:'Cycling',met:6,icon:'bike'},
 {id:'dance',name:'Dancing',met:5,icon:'music'},
 {id:'strength',name:'Strength training',met:3.5,icon:'dumbbell'},
 {id:'yoga',name:'Yoga / stretching',met:2.5,icon:'heart'}
];
