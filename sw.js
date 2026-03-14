const CACHE_NAME = 'pugi-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/yks-takip-uygulamasi.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Kurulum: temel dosyaları önbelleğe al
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Aktivasyon: eski önbellekleri temizle
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch: önce ağ, hata varsa önbellekten sun
self.addEventListener('fetch', function(e) {
  // Firebase ve harici isteklere dokunma
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    fetch(e.request)
      .then(function(response) {
        // Başarılı yanıtı önbelleğe de yaz
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, clone);
        });
        return response;
      })
      .catch(function() {
        // Ağ yoksa önbellekten sun
        return caches.match(e.request).then(function(cached) {
          return cached || caches.match('/index.html');
        });
      })
  );
});
