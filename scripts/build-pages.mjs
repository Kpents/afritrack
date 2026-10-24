import {cp,mkdir,writeFile,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const output=new URL('../dist/',import.meta.url);
await mkdir(output,{recursive:true});
for(const path of ['index.html','styles.css','manifest.webmanifest','sw.js','assets','src'])await cp(new URL('../app/'+path,import.meta.url),new URL(path,output),{recursive:true});
await writeFile(new URL('src/deployment.js',output),'export const STATIC_PREVIEW = true;\n');
await writeFile(new URL('.nojekyll',output),'');
console.log('GitHub Pages preview built at '+fileURLToPath(output));
