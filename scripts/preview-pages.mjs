import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('dist');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
http.createServer(async(req,res)=>{try{const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(!path.startsWith('/afritrack/')){res.writeHead(404).end();return;}const target=resolve(root,'.'+path.slice('/afritrack'.length)+(path.endsWith('/')?'index.html':''));if(!target.startsWith(root+sep)){res.writeHead(403).end();return;}res.writeHead(200,{'Content-Type':mime[extname(target)]||'text/plain','Cache-Control':'no-store'}).end(await readFile(target));}catch{res.writeHead(404).end();}}).listen(4174,'127.0.0.1',()=>console.log('Pages preview: http://127.0.0.1:4174/afritrack/'));
