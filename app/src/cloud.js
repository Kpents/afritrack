import { setStorageScope, loadState, saveState, importState, clearScopedState } from './store.js';
import { STATIC_PREVIEW } from './deployment.js';
const pendingKey=id=>`afritrack.v4.pending.${id}`;
const revKey=id=>`afritrack.v4.revision.${id}`;
const req=async(path,options={})=>{
 const response=await fetch(path,{credentials:'same-origin',cache:'no-store',...options,headers:{...(options.body?{'Content-Type':'application/json'}:{}),...(options.headers||{})}});
 let result={};try{result=await response.json();}catch{}
 if(!response.ok){const error=new Error(result.error||`Server returned ${response.status}`);error.status=response.status;error.revision=result.revision;throw error;}
 return result;
};
export class CloudSync {
 constructor({replaceLocal,readLocal,onChange=()=>{}}){
  this.user=null;this.revision=0;this.status='guest';this.pending=false;this.conflict=false;
  this.replaceLocal=replaceLocal;this.readLocal=readLocal;this.onChange=onChange;
  this.timer=null;this.busy=false;this.changes=0;this.enabled=true;this.retryDelay=1000;
  window.addEventListener('online',()=>{if(this.user&&this.pending)this.schedule(100);else if(this.user)this.refresh();});
  window.addEventListener('focus',()=>{if(this.user&&!this.pending)this.refresh();});
 }
 changed(){this.onChange();}
 async start(){
  if(STATIC_PREVIEW){this.enabled=false;this.status='local-only';this.changed();return;}
  try{const result=await req('/api/session');if(result.user)await this.activate(result.user);else{this.status='guest';this.changed();}}
  catch{this.enabled=false;this.status='local-only';this.changed();}
 }
 async signIn(email,password,register=false){
  const path=register?'/api/auth/register':'/api/auth/login';
  const result=await req(path,{method:'POST',body:JSON.stringify({email,password})});
  await this.activate(result.user);
 }
 async activate(user){
  clearTimeout(this.timer);this.user=user;this.status='loading';this.conflict=false;
  setStorageScope(user.id);
  this.pending=localStorage.getItem(pendingKey(user.id))==='1';
  this.revision=Number(localStorage.getItem(revKey(user.id))||0);
  this.changed();
  // Never mix guest data into an account implicitly.
  const local=loadState();
  this.replaceLocal(local);
  try{
   const remote=await req('/api/state');
   if(this.pending){
    // Keep unsynced local edits; never overwrite them with a remote snapshot.
    if(remote.revision!==this.revision){this.conflict=true;this.status='conflict';}
    else {this.status='pending';this.schedule(50);}
   }else{
    this.revision=remote.revision;localStorage.setItem(revKey(user.id),String(this.revision));
    if(remote.state){const validated=importState(JSON.stringify(remote.state));this.replaceLocal(validated);this.status='synced';}
    else {this.status='pending';this.markDirty();}
   }
  }catch{this.status='offline';}
  this.changed();
 }
 markDirty(){
  if(!this.user)return;
  this.pending=true;this.changes++;
  localStorage.setItem(pendingKey(this.user.id),'1');
  if(!this.conflict){this.status=navigator.onLine?'pending':'offline';this.schedule();}
  this.changed();
 }
 schedule(delay=750){clearTimeout(this.timer);if(!this.user||this.conflict)return;this.timer=setTimeout(()=>this.sync(),delay);}
 async refresh(){
  if(!this.user||this.busy||this.pending||this.conflict)return;
  const userId=this.user.id;
  try{
   const remote=await req('/api/state');
   if(this.user?.id!==userId||this.pending)return;
   if(remote.revision>this.revision&&remote.state){
    this.revision=remote.revision;localStorage.setItem(revKey(userId),String(this.revision));
    this.replaceLocal(importState(JSON.stringify(remote.state)));
   }
   this.status='synced';
  }catch{if(this.user?.id===userId)this.status='offline';}
  this.changed();
 }
 async sync(){
  if(!this.user||this.conflict||this.busy)return;
  if(!this.pending){await this.refresh();return;}
  this.busy=true;this.status='syncing';this.changed();const seq=this.changes,userId=this.user.id;
  try{
   const value=await req('/api/state',{method:'PUT',body:JSON.stringify({revision:this.revision,state:this.readLocal()})});
   if(this.user?.id!==userId)return;
   this.revision=value.revision;localStorage.setItem(revKey(userId),String(this.revision));
   this.retryDelay=1000;
   if(this.changes===seq){this.pending=false;localStorage.removeItem(pendingKey(userId));this.status='synced';}
   else {this.status='pending';}
  }catch(err){
   if(this.user?.id!==userId)return;
   if(err.status===409){this.conflict=true;this.status='conflict';}
   else this.status='offline';
  }finally{this.busy=false;this.changed();if(this.pending&&!this.conflict&&this.user?.id===userId){if(this.status==='pending')this.schedule(200);else if(this.status==='offline'){this.schedule(this.retryDelay);this.retryDelay=Math.min(this.retryDelay*2,60000);}}}
 }
 async useServer(){
  if(!this.user)throw Error('Sign in first.');
  const remote=await req('/api/state');
  this.pending=false;this.conflict=false;this.changes++;
  this.revision=remote.revision;
  localStorage.setItem(revKey(this.user.id),String(this.revision));localStorage.removeItem(pendingKey(this.user.id));
  if(remote.state)this.replaceLocal(importState(JSON.stringify(remote.state)));
  else {this.status='pending';this.markDirty();return;}
  this.status='synced';this.changed();
 }
 async replaceServer(){
  if(!this.user)throw Error('Sign in first.');
  const latest=await req('/api/state');
  this.revision=latest.revision;this.conflict=false;this.status='pending';this.pending=true;
  localStorage.setItem(pendingKey(this.user.id),'1');this.changed();await this.sync();
  if(this.conflict)throw Error('The account changed again. Try resolving once more.');
  if(this.status==='offline')throw Error('Server unavailable; your local data is still saved.');
 }
 copyGuest(){
  if(!this.user)throw Error('Sign in first.');
  const account=this.user.id;
  setStorageScope(null);
  let guest;
  try{guest=loadState();}finally{setStorageScope(account);}
  // The owner must explicitly confirm this replacement in the UI.
  this.replaceLocal(guest);
  saveState(guest);
  this.markDirty();
 }
 async signOut(){
  if(this.pending)throw Error('Unsynced changes. Connect and sync before signing out, or download a backup.');
  await req('/api/auth/logout',{method:'POST'});
  const id=this.user?.id;this.user=null;clearTimeout(this.timer);this.pending=false;this.status='guest';
  if(id)clearScopedState(id); // privacy on shared devices
  setStorageScope(null);this.replaceLocal(loadState());this.changed();
 }
 async changePassword(oldPassword,newPassword){if(!this.user)throw Error('Sign in first.');await req('/api/auth/password',{method:'POST',body:JSON.stringify({oldPassword,newPassword})});}
 async deleteAccount(password){
  if(!this.user)throw Error('Sign in first.');
  await req('/api/account',{method:'DELETE',body:JSON.stringify({password})});
  const id=this.user.id;this.user=null;clearTimeout(this.timer);clearScopedState(id);
  localStorage.removeItem(pendingKey(id));localStorage.removeItem(revKey(id));
  setStorageScope(null);this.replaceLocal(loadState());this.status='guest';this.pending=false;this.conflict=false;this.changed();
 }
}
export function accountMarkup(cloud){
 const e=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const labels={guest:'Not signed in',loading:'Connecting…',synced:'Saved on account server',pending:'Changes waiting to sync',syncing:'Saving…',offline:'Offline · saved on this device',conflict:'Sync conflict · review required','local-only':'Local-only mode'};
 if(!cloud.enabled)return `<section class="panel cloud-panel"><h2>Saved on this device</h2><p class="quiet">${STATIC_PREVIEW?'This client preview stores records in this browser. Cloud registration, login and cross-device sync need the separately hosted account service.':'The account service is unavailable. Your offline diary continues to work.'}</p><p class="hint">Download a backup before clearing browser data or switching devices.</p></section>`;
 return `<section class="panel cloud-panel"><div class="panel-top"><h2>Account & device sync</h2><span class="cloud-status ${e(cloud.status)}">${e(labels[cloud.status]||cloud.status)}</span></div><p class="quiet">${cloud.user?`Signed in as <strong>${e(cloud.user.email)}</strong>. Your records are stored on this AfriTrack server.`:'Keep separate user accounts and access your diary from another device connected to the same server.'}</p>
 ${cloud.user?`<div class="settings-actions"><button type="button" class="action-item" data-cloud-sync>Sync now <span>↗</span></button><button type="button" class="action-item" data-cloud-guest>Copy offline guest diary into account <span>→</span></button>${cloud.conflict?`<p class="cloud-warning">Your browser and the account server contain different edits. Download a backup before choosing one copy.</p><button class="action-item" type="button" data-cloud-server>Use account copy</button><button class="action-item" type="button" data-cloud-upload>Replace account copy with this device</button>`:''}<button class="action-item" data-cloud-logout type="button">Sign out <span>→</span></button></div><details class="account-delete"><summary>Change account password</summary><form id="account-password-form"><label>Current password<input type="password" name="oldPassword" autocomplete="current-password" required /></label><label>New password (12+ characters)<input type="password" name="newPassword" minlength="12" maxlength="128" autocomplete="new-password" required /></label><button class="outline-btn" type="submit">Change password and revoke other sessions</button></form></details><details class="account-delete"><summary>Delete my account and server data</summary><form id="account-delete-form"><label>Confirm password<input type="password" name="password" autocomplete="current-password" required /></label><button type="submit" class="outline-btn">Delete account permanently</button></form></details>`:
 `<form id="cloud-login-form"><label>Email<input type="email" name="email" autocomplete="username" maxlength="254" required /></label><label>Password (12+ characters)<input type="password" name="password" minlength="12" maxlength="128" autocomplete="current-password" required /></label><div class="two-btns"><button class="primary-btn" type="submit" name="mode" value="login">Sign in</button><button class="outline-btn" type="submit" name="mode" value="register">Create account</button></div></form>`}
 <p class="hint">This is a self-hosted account service. For access outside your computer, deploy it securely behind HTTPS with backups. Demo food values remain unverified. Never upload confidential clinical records to an unreviewed server.</p></section>`;
}
