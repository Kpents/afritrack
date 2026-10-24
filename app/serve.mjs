import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(fileURLToPath(new URL('.',import.meta.url)));
const port=Number(process.env.PORT)||4173;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json','.webmanifest':'application/manifest+json'};
const server=http.createServer(async(req,res)=>{
  try {
    const path=new URL(req.url,'http://localhost').pathname;
    const pathname=decodeURIComponent(path);
    const target=resolve(root, '.'+pathname+(pathname.endsWith('/')?'index.html':''));
    if(!target.startsWith(root+sep) && target!==resolve(root,'index.html')){res.writeHead(403).end('Forbidden');return;}
    const data=await readFile(target);
    res.writeHead(200,{'Content-Type':mime[extname(target)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'same-origin'}).end(data);
  } catch(e){res.writeHead(404,{'Content-Type':'text/plain'}).end('Not found');}
});
server.listen(port,()=>console.log(`AfriTrack running at http://localhost:${port}`));
