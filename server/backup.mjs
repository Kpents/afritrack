import {DatabaseSync} from 'node:sqlite';
import {resolve} from 'node:path';
const [source,destination]=process.argv.slice(2);
if(!source||!destination)throw Error('Usage: node server/backup.mjs SOURCE.sqlite NEW_BACKUP.sqlite');
if(resolve(source)===resolve(destination))throw Error('Backup destination must differ from source.');
const db=new DatabaseSync(resolve(source),{readOnly:true});
try{db.prepare('VACUUM INTO ?').run(resolve(destination));console.log('Consistent SQLite backup created.');}finally{db.close();}
