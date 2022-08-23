self.addEventListener("install", function (event) {
  self.skipWaiting();

  async function preCache() {
    const cache = await caches.open("app");
    cache.add(new Request("offline.html"));
  }

  event.waitUntil(preCache());
});

self.addEventListener("fetch", function (event) {
  const { request } = event;

  // Bug fix: https://stackoverflow.com/a/49719964
  const { cache, mode } = request;
  if (cache === "only-if-cached" && mode !== "same-origin") return;

  const header = request.headers.get("Accept");
  if (!header.includes("text/html")) return;

  async function handleRequest(request) {
    try {
      const response = await fetch(request);
      return response;
    } catch {
      const response = await caches.match("offline.html");
      return response;
    }
  }

  event.respondWith(handleRequest(request));
});
