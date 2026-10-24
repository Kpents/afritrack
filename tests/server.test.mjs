import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeServer } from '../server/server.mjs';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const profile=(name)=>({version:1,profile:{name},goals:{kcal:2000,protein:100,carbs:200,fat:60,fiber:25,water:2000,steps:9000},diary:[{id:'d',date:'2026-10-14',meal:'Lunch',name:'Waakye',grams:250,kcal:410}],customFoods:[],hydration:{},steps:{},exercises:[],weights:[],favorites:[],notes:{}});

test('multi-user accounts, account-isolated state, optimistic sync, logout, deletion, CSRF and durable SQLite', async(t)=>{
 const dir=mkdtempSync(join(tmpdir(),'afritrack-v4-'));let instance;
 t.after(async()=>{if(instance)await instance.close();rmSync(dir,{recursive:true,force:true});});
 const dbPath=join(dir,'users.sqlite');
 instance=makeServer({databasePath:dbPath,publicOrigin:'http://127.0.0.1'});
 await new Promise(ok=>instance.server.listen(0,'127.0.0.1',ok));
 let base=`http://127.0.0.1:${instance.server.address().port}`;
 async function request(path,{method='GET',body,cookie,origin}={}){
  const response=await fetch(base+path,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{}),...(origin?{Origin:origin}:{})},body:body?JSON.stringify(body):undefined});
  const data=response.headers.get('content-type')?.includes('json')?await response.json():await response.text();
  return {status:response.status,data,cookie:response.headers.get('set-cookie')?.split(';')[0]};
 }
 // Local origin does not match configured publicOrigin, so origin-less requests are permitted, cross-origin requests rejected.
 assert.equal((await request('/api/auth/register',{method:'POST',body:{email:'a@example.com',password:'short'}})).status,400);
 const a=await request('/api/auth/register',{method:'POST',body:{email:'A@Example.COM ',password:'LongPassphrase-User-A!'}});
 assert.equal(a.status,200);assert.equal(a.data.user.email,'a@example.com');assert.ok(a.cookie.includes('afritrack_session='));
 const b=await request('/api/auth/register',{method:'POST',body:{email:'b@example.com',password:'LongPassphrase-User-B!'}});
 assert.equal(b.status,200);
 assert.notEqual(a.cookie,b.cookie);
 assert.equal((await request('/api/auth/register',{method:'POST',body:{email:'a@example.com',password:'otherLongPassphrase!'}})).status,409);
 assert.equal((await request('/api/session')).data.user,null);
 assert.equal((await request('/api/session',{cookie:a.cookie})).data.user.email,'a@example.com');
 assert.equal((await request('/api/state',{cookie:a.cookie})).data.revision,0);
 const x=await request('/api/state',{method:'PUT',cookie:a.cookie,body:{revision:0,state:profile('Ama')}});
 assert.deepEqual(x.data,{revision:1});
 assert.equal((await request('/api/state',{cookie:a.cookie})).data.state.profile.name,'Ama');
 assert.equal((await request('/api/state',{cookie:b.cookie})).data.state,null);
 assert.equal((await request('/api/state',{cookie:b.cookie,method:'PUT',body:{revision:1,state:profile('Overwriting user A')}})).status,409);
 assert.equal((await request('/api/state',{cookie:b.cookie,method:'PUT',body:{revision:0,state:profile('Kojo')}})).status,200);
 assert.equal((await request('/api/state',{cookie:a.cookie})).data.state.profile.name,'Ama');
 // Stale tab cannot silently overwrite account state; it must explicitly refresh/reconcile.
 assert.equal((await request('/api/state',{cookie:a.cookie,method:'PUT',body:{revision:0,state:profile('stale')}})).status,409);
 assert.equal((await request('/api/state',{cookie:a.cookie})).data.state.profile.name,'Ama');
 assert.equal((await request('/api/state',{cookie:a.cookie,method:'PUT',body:{revision:1,state:{}}})).status,400);
 assert.equal((await request('/api/state',{cookie:a.cookie,method:'PUT',body:{revision:1,state:profile('HACK')},origin:'https://evil.test'})).status,403);
 assert.equal((await request('/api/state',{cookie:a.cookie})).data.state.profile.name,'Ama');
 assert.equal((await request('/server/db.mjs')).status,403);
 assert.equal((await request('/api/auth/logout',{method:'POST',cookie:a.cookie})).status,200);
 assert.equal((await request('/api/state',{cookie:a.cookie})).status,401);
 const relog=await request('/api/auth/login',{method:'POST',body:{email:'a@example.com',password:'LongPassphrase-User-A!'}});
 assert.equal(relog.status,200);
 assert.equal((await request('/api/state',{cookie:relog.cookie})).data.state.profile.name,'Ama');
 assert.equal((await request('/api/auth/password',{method:'POST',cookie:relog.cookie,body:{oldPassword:'wrong-password-here',newPassword:'A-Different-Long-Password!'}})).status,403);
 assert.equal((await request('/api/auth/password',{method:'POST',cookie:relog.cookie,body:{oldPassword:'LongPassphrase-User-A!',newPassword:'A-Different-Long-Password!'}})).status,200);
 assert.equal((await request('/api/auth/login',{method:'POST',body:{email:'a@example.com',password:'LongPassphrase-User-A!'}})).status,401);
 assert.equal((await request('/api/account',{method:'DELETE',cookie:relog.cookie,body:{password:'wrong-long-password'}})).status,403);
 assert.equal((await request('/api/account',{method:'DELETE',cookie:relog.cookie,body:{password:'A-Different-Long-Password!'}})).status,200);
 assert.equal((await request('/api/session',{cookie:relog.cookie})).data.user,null);
 assert.equal((await request('/api/state',{cookie:b.cookie})).data.state.profile.name,'Kojo');
 // Closing and reopening the server against the same SQLite path retains unrelated user records.
 await instance.close();instance=null;
 instance=makeServer({databasePath:dbPath,publicOrigin:'http://127.0.0.1'});
 await new Promise(ok=>instance.server.listen(0,'127.0.0.1',ok));base=`http://127.0.0.1:${instance.server.address().port}`;
 const persisted=await request('/api/state',{cookie:b.cookie});
 assert.equal(persisted.status,200);assert.equal(persisted.data.state.profile.name,'Kojo');
});
