'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/AssetManifest.bin": "4230fe59c7f5da883febeb4697261c21",
"assets/AssetManifest.bin.json": "efc766dd0622da10ed5d7c9ac02af802",
"assets/AssetManifest.json": "f7d500c8e281f363867cdd6011b2bc9f",
"assets/assets/3dModel/scene.glb": "b38da04baa6d9341f0270d48caaeafa6",
"assets/assets/background_images/modelBackground.jpg": "9c588a95be5eb17004182d50b2867944",
"assets/assets/background_images/pageBackground.jpg": "4c61746dc816299aa50a50d778b93151",
"assets/assets/button_icons/heart1.png": "032d5c53360b904184868e48008f7672",
"assets/assets/button_icons/heart2.png": "66bf2a17f764835d3ac70e9564b37013",
"assets/assets/button_icons/heart3.png": "594af6e421f3a73a342484e1f848951d",
"assets/assets/card1/back.jpg": "3b24914f742b5469977366bc8579806b",
"assets/assets/card1/front.jpeg": "de0cd0e433f8393c7781bd6e2f4ec9e0",
"assets/assets/card2/back.jpg": "3b24914f742b5469977366bc8579806b",
"assets/assets/card2/front.jpeg": "be9b65f24363ac72c03b0eb079c678ba",
"assets/assets/card3/back.jpg": "3b24914f742b5469977366bc8579806b",
"assets/assets/card3/front.jpeg": "031e92360606cd5df1621609642d7766",
"assets/assets/card4/back.jpg": "3b24914f742b5469977366bc8579806b",
"assets/assets/card4/front.jpeg": "049906796c87ad537b4964ebeb36f049",
"assets/assets/decoration_images/bannerImage.jpeg": "e7758bce6156bec194964d313cfdc339",
"assets/FontManifest.json": "94bb72ebe7bab246ba259fa02525cbdb",
"assets/fonts/goudy_bookletter_1911.otf": "675e6eaf9a289c3b8766514319e02e52",
"assets/fonts/MaterialIcons-Regular.otf": "05fdefe5f8dd3f8eb60bdb78f18649ea",
"assets/NOTICES": "1d28cbf77056ff2cc0766646b03d5610",
"assets/packages/model_viewer_plus/assets/model-viewer.min.js": "4226392bee9372f20a688343e51e7b54",
"assets/packages/model_viewer_plus/assets/template.html": "8de94ff19fee64be3edffddb412ab63c",
"assets/packages/youtube_player_iframe/assets/player.html": "ea69af402f26127fa4991b611d4f2596",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"canvaskit/canvaskit.js": "7737f5fc722b6a040ac15271ea8d92fb",
"canvaskit/canvaskit.js.symbols": "ee28c743c79cf9fe910e61b7fd95b93c",
"canvaskit/canvaskit.wasm": "97f0f58b59576116cea6338ff17fd1fc",
"canvaskit/chromium/canvaskit.js": "2f82009588e8a72043db753d360d488f",
"canvaskit/chromium/canvaskit.js.symbols": "24907d700736ef0810e19bdf1cb84c22",
"canvaskit/chromium/canvaskit.wasm": "0e4b52c4ab1be1280ef35144ae0817df",
"canvaskit/skwasm.js": "445e9e400085faead4493be2224d95aa",
"canvaskit/skwasm.js.symbols": "cc728537b31d099870b80e82c164775b",
"canvaskit/skwasm.wasm": "ce8b3e20606f87265c0c0d14d8968068",
"canvaskit/skwasm.worker.js": "bfb704a6c714a75da9ef320991e88b03",
"favicon.png": "616f79b471fee4942f12cf6f2f9fa404",
"flutter.js": "4af2b91eb221b73845365e1302528f07",
"index.html": "456f093241810c5e96c2b199b13de345",
"/": "456f093241810c5e96c2b199b13de345",
"main.dart.js": "563c1d5a327558b517f3e4c23209dab7",
"manifest.json": "237d201e8155922da7592595aa7e22ba",
"version.json": "d5c36be2daaae75b16720289906e6eba"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
