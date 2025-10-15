
self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open('radio-fullpill-v1').then(cache=>cache.addAll([
    './','./index.html','./manifest.webmanifest','./sw.js','./icon-192.png','./icon-512.png'
  ])));
  self.skipWaiting();
});
self.addEventListener('activate', (e)=>{ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', (e)=>{
  e.respondWith(
    caches.match(e.request).then(resp=> resp || fetch(e.request).then(r=>{
      const copy = r.clone();
      caches.open('radio-fullpill-v1').then(c=>c.put(e.request, copy));
      return r;
    }).catch(()=>caches.match('./')) )
  );
});
