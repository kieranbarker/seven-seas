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
  const cache = await caches.open("app");

  for (const asset of coreAssets) {
    cache.add(new Request(asset));
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch {
    const response = await caches.match(request);
    return response || caches.match("offline.html");
  }
}

async function offlineFirst(request) {
  let response = await caches.match(request);
  if (response) return response;

  response = await fetch(request);
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
    event.respondWith(networkFirst(request));
    return;
  }

  if (header.includes("text/css") || header.includes("text/javascript")) {
    event.respondWith(offlineFirst(request));
    return;
  }
});
