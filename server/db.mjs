import { DatabaseSync } from 'node:sqlite';
import { randomBytes, randomUUID, scrypt as scryptCallback, createHash, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
const scrypt=promisify(scryptCallback);
const sha256 = value => createHash('sha256').update(value).digest('hex');
const NOW=()=>Date.now();
const DAYS=30*24*3600*1000;
export function openDatabase(path){
 mkdirSync(dirname(path),{recursive:true});
 const db=new DatabaseSync(path,{timeout:5000});
 const schemaVersion=db.prepare('PRAGMA user_version').get().user_version;
 if(schemaVersion>1){db.close();throw Error('Database schema is newer than this application. Restore a compatible release.');}
 db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
 CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, password_salt TEXT NOT NULL, created_at INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL);
 CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
 CREATE TABLE IF NOT EXISTS backups(user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, revision INTEGER NOT NULL DEFAULT 0, body TEXT NOT NULL, updated_at INTEGER NOT NULL);
 PRAGMA user_version=1;
 `);
 return db;
}
export const normalizeEmail=email=>typeof email==='string'?email.trim().toLowerCase():'';
export async function passwordHash(password,salt=randomBytes(16).toString('hex')){
 return {salt,hash:(await scrypt(password,Buffer.from(salt,'hex'),64)).toString('hex')};
}
export async function verifyPassword(password,user){
 if(typeof password!=='string'||password.length>128)return false;
 // Comparable amount of work even for a non-existing user, to avoid obvious timing differences.
 const {salt,hash}=user?{salt:user.password_salt,hash:user.password_hash}:await passwordHash('nonexistent-password', '00000000000000000000000000000000');
 const calculated=Buffer.from((await passwordHash(password,salt)).hash,'hex');
 const expected=Buffer.from(hash,'hex');
 return calculated.length===expected.length&&timingSafeEqual(calculated,expected)&&Boolean(user);
}
export async function register(db,email,password){
 const normalized=normalizeEmail(email);
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)||normalized.length>254)throw Object.assign(new Error('Enter a valid email address.'),{status:400});
 if(typeof password!=='string'||password.length<12||password.length>128)throw Object.assign(new Error('Use a password between 12 and 128 characters.'),{status:400});
 const existing=db.prepare('SELECT id FROM users WHERE email=?').get(normalized);
 if(existing)throw Object.assign(new Error('This email is already registered.'),{status:409});
 const hashed=await passwordHash(password);const user={id:randomUUID(),email:normalized};
 try{db.prepare('INSERT INTO users(id,email,password_hash,password_salt,created_at) VALUES (?,?,?,?,?)').run(user.id,user.email,hashed.hash,hashed.salt,NOW());}
 catch(e){if(String(e).includes('UNIQUE'))throw Object.assign(new Error('This email is already registered.'),{status:409});throw e;}
 return user;
}
export async function signIn(db,email,password){
 const user=db.prepare('SELECT * FROM users WHERE email=?').get(normalizeEmail(email));
 if(typeof password!=='string'||password.length>128||!(await verifyPassword(password,user)))throw Object.assign(new Error('Incorrect email or password.'),{status:401});
 return {id:user.id,email:user.email};
}
export function createSession(db,userId){
 const token=randomBytes(32).toString('base64url'), expires=NOW()+DAYS;
 db.prepare('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)').run(sha256(token),userId,expires);
 return {token,expires};
}
export function findSession(db,token){
 if(!token||token.length>256)return null;
 const user=db.prepare('SELECT u.id,u.email FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?').get(sha256(token),NOW());
 return user||null;
}
export function revokeSession(db,token){if(token)db.prepare('DELETE FROM sessions WHERE token_hash=?').run(sha256(token));}
export function getBackup(db,userId){return db.prepare('SELECT revision,body,updated_at FROM backups WHERE user_id=?').get(userId)||{revision:0,body:null,updated_at:null};}
export function putBackup(db,userId,body,revision){
 const text=JSON.stringify(body);
 if(text.length>2_000_000)throw Object.assign(new Error('Backup exceeds 2 MB.'),{status:413});
 db.exec('BEGIN IMMEDIATE');
 try{
  const old=getBackup(db,userId);
  if(old.revision!==revision){db.exec('ROLLBACK');return {conflict:true,revision:old.revision};}
  const next=revision+1;
  db.prepare('INSERT INTO backups(user_id,revision,body,updated_at) VALUES(?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET revision=excluded.revision,body=excluded.body,updated_at=excluded.updated_at').run(userId,next,text,NOW());
  db.exec('COMMIT');
  return {revision:next};
 }catch(e){try{db.exec('ROLLBACK')}catch{}throw e;}
}
export async function deleteAccount(db,userId,password){
 const user=db.prepare('SELECT * FROM users WHERE id=?').get(userId);
 if(!(await verifyPassword(password,user)))throw Object.assign(new Error('Incorrect password.'),{status:403});
 db.prepare('DELETE FROM users WHERE id=?').run(userId); // sessions/backups removed by foreign keys
}
export async function changePassword(db,userId,oldPassword,newPassword,currentToken){
 const user=db.prepare('SELECT * FROM users WHERE id=?').get(userId);
 if(!(await verifyPassword(oldPassword,user)))throw Object.assign(new Error('Current password is incorrect.'),{status:403});
 if(typeof newPassword!=='string'||newPassword.length<12||newPassword.length>128)throw Object.assign(new Error('New password must contain 12–128 characters.'),{status:400});
 const next=await passwordHash(newPassword);
 db.exec('BEGIN IMMEDIATE');
 try{
  db.prepare('UPDATE users SET password_hash=?,password_salt=? WHERE id=?').run(next.hash,next.salt,userId);
  db.prepare('DELETE FROM sessions WHERE user_id=? AND token_hash<>?').run(userId,sha256(currentToken));
  db.exec('COMMIT');
 }catch(e){db.exec('ROLLBACK');throw e;}
}
