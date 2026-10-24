import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, join, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase, register, signIn, createSession, findSession, revokeSession, getBackup, putBackup, deleteAccount, changePassword } from './db.mjs';

const root=resolve(fileURLToPath(new URL('../app/',import.meta.url)));
const dbFile=resolve(process.env.AFRITRACK_DB||fileURLToPath(new URL('./data/afritrack.sqlite',import.meta.url)));
const files={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.json':'application/json'};
const json=(res,status,data,headers={})=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers});res.end(JSON.stringify(data));};
function cookie(token='',secure=false,clear=false){return `afritrack_session=${token}; Path=/api; HttpOnly; SameSite=Strict${secure?'; Secure':''}${clear?'; Max-Age=0':'; Max-Age=2592000'}`;}
function getCookie(req){const raw=req.headers.cookie||'';return raw.split(';').map(x=>x.trim()).find(x=>x.startsWith('afritrack_session='))?.slice(18)||'';}
async function readJson(req){
 if(!req.headers['content-type']?.toLowerCase().startsWith('application/json'))throw Object.assign(new Error('Use application/json.'),{status:415});
 let chunks=[],size=0;
 for await(const chunk of req){size+=chunk.length;if(size>2_200_000)throw Object.assign(new Error('Request exceeds 2.2 MB'),{status:413});chunks.push(chunk);}
 try{const value=JSON.parse(Buffer.concat(chunks).toString('utf8'));if(!value||typeof value!=='object'||Array.isArray(value))throw Error();return value;}catch{throw Object.assign(new Error('Expected a JSON object.'),{status:400});}
}
export function makeServer({databasePath=dbFile,publicOrigin=process.env.AFRITRACK_ORIGIN||'',now=()=>Date.now()}={}){
 if(process.env.NODE_ENV==='production'&&!publicOrigin.startsWith('https://'))throw Error('Production requires AFRITRACK_ORIGIN with HTTPS.');
 const db=openDatabase(databasePath), secure=publicOrigin.startsWith('https://'), rates=new Map();
 function guard(req){
  const origin=req.headers.origin;
  if(publicOrigin && origin && origin!==publicOrigin)return false;
  if(req.headers['sec-fetch-site'] && !['same-origin','none'].includes(req.headers['sec-fetch-site']))return false;
  const host=req.headers.host;
  try{if(!publicOrigin && origin && new URL(origin).host!==host)return false;}catch{return false;}
  return true;
 }
 function rateLimit(req){const ip=req.socket.remoteAddress||'unknown',stamp=now();for(const [key,values] of rates)if(values.at(-1)<=stamp-60000)rates.delete(key);const history=(rates.get(ip)||[]).filter(n=>n>stamp-60000);if(history.length>=12)return false;if(rates.size>=10000&&!rates.has(ip))return false;history.push(stamp);rates.set(ip,history);return true;}
 const server=http.createServer(async(req,res)=>{
  const security={'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','Cross-Origin-Resource-Policy':'same-origin'};
  for(const [k,v] of Object.entries(security))res.setHeader(k,v);
  if(secure)res.setHeader('Strict-Transport-Security','max-age=31536000');
  let url;
  try{url=new URL(req.url,'http://localhost')}catch{json(res,400,{error:'Invalid URL'});return;}
  try{
   if(url.pathname.startsWith('/api/')){
    if(!guard(req)){json(res,403,{error:'Cross-origin request blocked.'});return;}
    const route=url.pathname,method=req.method;
    if(route==='/api/health'&&method==='GET'){db.prepare('SELECT 1').get();json(res,200,{ok:true,version:'v5'});return;}
    if((route==='/api/auth/register'||route==='/api/auth/login')&&method==='POST'){
     if(!rateLimit(req)){json(res,429,{error:'Too many login attempts. Try again later.'});return;}
     const body=await readJson(req);
     const user=route.endsWith('register')?await register(db,body.email,body.password):await signIn(db,body.email,body.password);
     const oldToken=getCookie(req);revokeSession(db,oldToken);
     const session=createSession(db,user.id);
     json(res,200,{user}, {'Set-Cookie':cookie(session.token,secure)});return;
    }
    const token=getCookie(req),user=findSession(db,token);
    if(route==='/api/session'&&method==='GET'){json(res,200,{user});return;}
    if(!user){json(res,401,{error:'Sign in to continue.'});return;}
    if(route==='/api/auth/logout'&&method==='POST'){revokeSession(db,token);json(res,200,{ok:true},{'Set-Cookie':cookie('',secure,true)});return;}
    if(route==='/api/state'&&method==='GET'){const backup=getBackup(db,user.id);json(res,200,{revision:backup.revision,state:backup.body?JSON.parse(backup.body):null,updatedAt:backup.updated_at});return;}
    if(route==='/api/state'&&method==='PUT'){
     const input=await readJson(req);
     if(!Number.isSafeInteger(input.revision)||input.revision<0){json(res,400,{error:'Expected a nonnegative revision.'});return;}
     const s=input.state;
     if(!s||s.version!==1||!Array.isArray(s.diary)||!Array.isArray(s.customFoods)||!s.goals||typeof s.goals!=='object'||Array.isArray(s.goals)){json(res,400,{error:'Invalid AfriTrack backup shape.'});return;}
     const saved=putBackup(db,user.id,s,input.revision);
     if(saved.conflict){json(res,409,{error:'Another device updated this account. Resolve the conflict before syncing.',revision:saved.revision});return;}
     json(res,200,{revision:saved.revision});return;
    }
    if(route==='/api/auth/password'&&method==='POST'){
     if(!rateLimit(req)){json(res,429,{error:'Too many authentication attempts. Try later.'});return;}
     const input=await readJson(req);await changePassword(db,user.id,input.oldPassword,input.newPassword,token);
     json(res,200,{ok:true});return;
    }
    if(route==='/api/account'&&method==='DELETE'){
     const input=await readJson(req);
     await deleteAccount(db,user.id,input.password);
     json(res,200,{ok:true},{'Set-Cookie':cookie('',secure,true)});return;
    }
    json(res,404,{error:'Unknown API endpoint.'});return;
   }
   if(req.method!=='GET'&&req.method!=='HEAD'){json(res,405,{error:'Unsupported method'});return;}
   let pathname;
   try{pathname=decodeURIComponent(url.pathname)}catch{json(res,400,{error:'Invalid URL encoding'});return;}
   if(pathname==='/'||pathname==='')pathname='/index.html';
   const target=resolve(root,'.'+pathname);
   if(!target.startsWith(root+sep)||!Object.hasOwn(files,extname(target))||pathname.includes('/.')){json(res,403,{error:'Forbidden'});return;}
   try{
    const data=await readFile(target);
    res.writeHead(200,{'Content-Type':files[extname(target)],'Cache-Control':'no-cache','Content-Security-Policy':"default-src 'self'; img-src 'self' blob: data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"});
    res.end(req.method==='HEAD'?undefined:data);
   }catch{json(res,404,{error:'File not found'});}
  }catch(e){const status=e.status||500;json(res,status,{error:status===500?'Unexpected server error.':String(e.message||'Invalid request')});if(status===500)console.error(e);}
 });
 server.requestTimeout=30000;server.headersTimeout=15000;
 return {server,db,close(){return new Promise(resolve=>server.close(()=>{db.close();resolve();}));}};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const port=Number(process.env.PORT)||4173;
 const app=makeServer();app.server.listen(port,()=>console.log(`AfriTrack v5 at http://localhost:${port} (accounts + SQLite)`));
 for(const signal of ['SIGTERM','SIGINT'])process.once(signal,()=>{app.close().then(()=>process.exit(0));setTimeout(()=>process.exit(1),10000).unref();});
}
