const CACHE_NAME = "on-the-level-podcast-v3";
const STATIC_ASSETS = [
  "./manifest.json",
  "./icon.png",
  "./logo-reel.mp4"
];

self.addEventListener("install", function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names.map(function (name) {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  const req = event.request;
  const url = new URL(req.url);
  const isPage =
    req.mode === "navigate" ||
    url.pathname.endsWith("/") ||
    url.pathname.endsWith("/index.html") ||
    url.pathname.endsWith("/sw.js");
  const isRemote = url.origin !== self.location.origin;

  if (isRemote || isPage) {
    event.respondWith(
      fetch(req).then(function (response) {
        return response;
      }).catch(function () {
        return caches.match(req);
      })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(function (cached) {
      return cached || fetch(req);
    })
  );
});
