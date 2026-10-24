import { test } from 'node:test';
import assert from 'node:assert/strict';

const storage=new Map();
globalThis.localStorage={getItem:key=>storage.has(key)?storage.get(key):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
globalThis.window={addEventListener:()=>{}};
Object.defineProperty(globalThis,'navigator',{value:{onLine:true},configurable:true});
const { CloudSync }=await import('../app/src/cloud.js');
const { loadState, saveState, setStorageScope }=await import('../app/src/store.js');

const user={id:'some-example-user',email:'test@example.org'};
const data=()=>({...loadState(),profile:{name:'Amina',weightKg:68},diary:[{id:'one',name:'Jollof Rice',date:'2026-10-14',grams:260,kcal:400}],customFoods:[]});

test('account activation isolates guest records and cloud saves only account data', async()=>{
 storage.clear();setStorageScope(null);const original=data();saveState(original);
 const server={revision:0,state:null};let posted=[];
 globalThis.fetch=async(path,opts={})=>{
  if(path==='/api/state'&&opts.method==='PUT'){
   const body=JSON.parse(opts.body);posted.push(body);
   if(body.revision!==server.revision)return {ok:false,status:409,json:async()=>({error:'conflict',revision:server.revision})};
   server.revision++;server.state=body.state;return {ok:true,status:200,json:async()=>({revision:server.revision})};
  }
  if(path==='/api/state')return {ok:true,json:async()=>server};
  if(path==='/api/auth/logout')return {ok:true,json:async()=>({ok:true})};
  throw Error('Unexpected request '+path);
 };
 let current;
 const cloud=new CloudSync({readLocal:()=>current,replaceLocal:x=>{current=x;}});
 await cloud.activate(user);
 assert.equal(current.diary.length,0,'guest food entries should not silently transfer to account');
 assert.equal(localStorage.getItem('afritrack.local.v1')!==null,true);
 await cloud.sync();
 assert.equal(cloud.status,'synced');assert.equal(server.state.diary.length,0);
 cloud.copyGuest();
 assert.equal(current.diary.length,1,'owner requested copy');
 await cloud.sync();
 assert.equal(server.state.diary[0].name,'Jollof Rice');
 assert.equal(server.revision,2);
 await cloud.signOut();
 assert.equal(current.profile.name,'Amina');
 assert.equal(cloud.user,null);
 assert.equal(localStorage.getItem('afritrack.local.v1.user-'+user.id),null,'account cache erased on signout');
});

test('conflicting server revision does not overwrite local diary',async()=>{
 storage.clear();setStorageScope(null);
 const server={revision:4,state:{...data(),profile:{name:'Server name'}}};
 globalThis.fetch=async(path,opts={})=>{
  if(path==='/api/state')return {ok:true,json:async()=>server};
  throw Error('Unexpected request');
 };
 // Previously saved revision 3 and unuploaded browser edit.
 setStorageScope(user.id);const pending=data();pending.profile.name='Offline user edits';saveState(pending);
 localStorage.setItem('afritrack.v4.revision.'+user.id,'3');localStorage.setItem('afritrack.v4.pending.'+user.id,'1');
 let current;const cloud=new CloudSync({readLocal:()=>current,replaceLocal:x=>current=x});
 await cloud.activate(user);
 assert.equal(cloud.status,'conflict');
 assert.equal(current.profile.name,'Offline user edits');
 assert.equal(cloud.revision,3);
 assert.equal(cloud.conflict,true);
});


test('second device update refreshes a clean client, never replaces pending local edits',async()=>{
 storage.clear();setStorageScope(null);
 const server={revision:2,state:{...data(),profile:{name:'Remote updated'}}};
 globalThis.fetch=async(path)=>{if(path==='/api/state')return {ok:true,json:async()=>server};throw Error('Unexpected request');};
 let current;const cloud=new CloudSync({readLocal:()=>current,replaceLocal:x=>current=x});
 await cloud.activate(user);
 assert.equal(current.profile.name,'Remote updated');
 server.revision=3;server.state={...data(),profile:{name:'New second-device data'}};
 await cloud.refresh();assert.equal(current.profile.name,'New second-device data');
 current.profile.name='Unsynced device data';saveState(current);cloud.markDirty();
 server.revision=4;server.state={...data(),profile:{name:'Do not overwrite'}};
 await cloud.refresh();assert.equal(current.profile.name,'Unsynced device data');
 clearTimeout(cloud.timer);
});

test('transient sync failure retains durable pending data and schedules bounded retry',async()=>{
 storage.clear();setStorageScope(user.id);let current=data();saveState(current);
 const cloud=new CloudSync({readLocal:()=>current,replaceLocal:x=>current=x});
 cloud.user=user;cloud.pending=true;cloud.revision=0;
 localStorage.setItem('afritrack.v4.pending.'+user.id,'1');
 let scheduled=[];cloud.schedule=delay=>scheduled.push(delay);
 globalThis.fetch=async()=>{throw Error('connection lost');};
 await cloud.sync();assert.equal(cloud.pending,true);assert.equal(cloud.status,'offline');
 assert.equal(localStorage.getItem('afritrack.v4.pending.'+user.id),'1');assert.deepEqual(scheduled,[1000]);
 for(let i=0;i<8;i++)await cloud.sync();assert.equal(scheduled.at(-1),60000);
 globalThis.fetch=async()=>({ok:true,json:async()=>({revision:1})});
 await cloud.sync();assert.equal(cloud.pending,false);assert.equal(cloud.status,'synced');
 assert.equal(localStorage.getItem('afritrack.v4.pending.'+user.id),null);assert.equal(cloud.retryDelay,1000);
});
