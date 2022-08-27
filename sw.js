const coreAssets = [
  "offline.html",
  "index.html",
  "treasure.html",
  "dice.html",
  "style.css",
  "index.js",
  "treasure.js",
  "dice.js",
];

async function preCache() {
  const cache = await caches.open("core");

  for (const asset of coreAssets) {
    cache.add(new Request(asset));
  }
}

async function cacheOnRequest(cacheName, request, response) {
  const copy = response.clone();
  const cache = await caches.open(cacheName);
  cache.put(request, copy);
}

async function networkFirst(event, request) {
  const path = new URL(request.url).pathname.slice(1);

  try {
    const response = await fetch(request);

    if (path && !coreAssets.includes(path)) {
      event.waitUntil(cacheOnRequest("pages", request, response));
    }

    return response;
  } catch {
    const response = await caches.match(request);
    if (response) return response;

    if (!path) return caches.match("index.html");

    return caches.match("offline.html");
  }
}

async function offlineFirst(event, request) {
  let response = await caches.match(request);
  if (response) return response;

  const header = request.headers.get("Accept");
  response = await fetch(request);

  if (header.includes("image")) {
    event.waitUntil(cacheOnRequest("img", request, response));
  }

  return response;
}

self.addEventListener("install", function (event) {
  self.skipWaiting();
  event.waitUntil(preCache());
});

self.addEventListener("fetch", function (event) {
  const { request } = event;

  // Bug fix: https://stackoverflow.com/a/49719964
  const { cache, mode } = request;
  if (cache === "only-if-cached" && mode !== "same-origin") return;

  const header = request.headers.get("Accept");

  if (header.includes("text/html")) {
    event.respondWith(networkFirst(event, request));
    return;
  }

  const offlineTypes = ["image", "text/css", "text/javascript"];

  if (offlineTypes.some((type) => header.includes(type))) {
    event.respondWith(offlineFirst(event, request));
    return;
  }
});
