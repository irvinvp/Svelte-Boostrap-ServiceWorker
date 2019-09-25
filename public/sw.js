var CACHE_NAME = 'Cache-v1';
var urlsToCache = [
  '/',
  'css/bootstrap.min.css',
  'css/bootstrap.min.css.map',
  'js/jquery-3.3.1.slim.min.js',
  'js/popper.min.js',
  'js/popper.min.js.map',
  'js/bootstrap.min.js',
  'js/bootstrap.min.js.map',
  'js/register_sw.js',
  '/icon144x144.png',
  '/icon310x310.png',
  '/favicon.ico',
  '/bundle.js'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        //return cache.addAll(urlsToCache);
        cache.addAll(urlsToCache.map(function(urls) {
		  return new Request(urls, { mode: 'no-cors' });
		})).then(function() {
		  console.log('All resources have been fetched and cached.');
		});
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response.
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

self.addEventListener('activate', function(event) {
  var cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});