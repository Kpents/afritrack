const CACHE='afritrack-static-v5-client-1';
const ASSETS=['./','./index.html','./styles.css','./src/app.js','./src/deployment.js','./src/welcome.js','./src/cloud.js','./src/data.js','./src/nutrition.js','./src/store.js','./src/advanced.js','./src/advanced-ui.js','./src/v3.js','./src/v3-ui.js','./src/micro.js','./assets/icon.svg','./assets/jollof.webp','./assets/waakye.webp','./assets/fufu.webp','./assets/injera.webp','./assets/banku.webp'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method==='GET'&&new URL(e.request.url).origin===self.location.origin&&!new URL(e.request.url).pathname.startsWith('/api/')){e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)))}});


