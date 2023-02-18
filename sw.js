const version = 52;
const cacheName = `regu0005.${version}`; 
let isOnline = true;
const cacheItems = [
  '/',
  './index.html',
  './404.html',
  './css/main.css',
  './js/app.js',
  'https://placedog.net/1024/300',
  'https://placedog.net/150/150',
  'https://placedog.net/200/200',
  'https://jsonplaceholder.typicode.com/users',
  'https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Roboto:ital,wght@0,400;0,700;1,400;1,700&display=swap',
];
async function preCache(){
  const cache = await caches.open(cacheName);
  return cache.addAll(cacheItems);
}

self.addEventListener('install', (ev) => {
    // When installing the service worker install also the new items
    // Add list 'cacheItems' to cache
    self.skipWaiting();

    ev.waitUntil(
      caches
      .open(cacheName)
      .then((cache) => {
        cache.addAll(cacheItems);     
      })
      .catch((err) => {
        console.warn('Something wrong ',err)
      })
    );
});

self.addEventListener('activate', (ev) => {
  //when the service worker is activated delete the old cache
  ev.waitUntil(
    // Delete all caches that do not match the current cacheName
    caches
      .keys()
      .then((keys) => {
        return Promise.all(keys.filter((nm) => nm !== cacheName).map((nm) => caches.delete(nm)));
      })
    // cleanCache()
  );
});

self.addEventListener('fetch', (ev) => {

  let mode = ev.request.mode;
  let url = new URL(ev.request.url);
  let method = ev.request.method;
  let isOnline = navigator.onLine;
  let isImage =
    url.pathname.includes('.png') ||
    url.pathname.includes('.jpg') ||
    url.pathname.includes('.gif') ||
    url.pathname.includes('.webp') ||
    url.pathname.includes('.jpeg') ||
    url.hostname.includes('placeholder.com');
  let isCSS = url.pathname.endsWith('.css');
  let isFont = url.hostname.includes('fonts.googleapis.com');
  let isData = url.hostname.includes('typicode.com');
  let selfLocation = new URL(self.location);
  let isRemote = selfLocation.origin !== url.origin;

  if (isOnline) {
      if (isRemote || isImage || isCSS || isFont || isData) {
      ev.respondWith(staleWhileRevalidate(ev));
    } else {
      ev.respondWith(networkFirst(ev));
    }
  } else {
    //offline
    if (mode === 'navigate') {
      ev.respondWith(cacheFirst(ev));
    } else {
      if (isImage) {
        ev.respondWith(caches.match('./404.html'));
      } else {
        ev.respondWith(cacheOnly(ev));
      }
    }
  }

});

function cacheFirst(ev) {
  //try cache then fetch
  return caches.match(ev.request).then((cacheResponse) => {
    return cacheResponse || fetch(ev.request);
  });
}
function cacheOnly(ev) {
  //only the response from the cache
  return caches.match(ev.request);
}
function networkFirst(ev) {
  //try fetch then cache
  return fetch(ev.request).then((response) => {
    if (!response.ok) return caches.match(ev.request);
    return response;
  });
}
function networkOnly(ev) {
  //only the result of a fetch
  return fetch(ev.request);
}

function staleWhileRevalidate(ev) {
  //return cache then fetch and save latest fetch
  return caches.match(ev.request).then((cacheResponse) => {
    let fetchResponse = fetch(ev.request).then((response) => {
      caches.open(cacheName).then((cache) => {
        cache.put(ev.request, response.clone());
        if (!response.ok) throw new NetworkError('Failed to get response', response);
        return response;
      });
    });
    return cacheResponse || fetchResult;
  });
}

function networkFirstAndRevalidate(ev) {
  //attempt fetch and cache result too
  return fetch(ev.request).then((response) => {
    if (!response.ok) return caches.match(ev.request);
    return response;
  });
}


self.addEventListener('message', (ev) => {
  //message received from the web pages that use the service worker
  //this is optional
});

function sendMessage(msg, clientId) {
  //send a message to one or all clients
  //this is optional
}

class NetworkError extends Error {
  constructor(msg, response) {
    super(msg);
    this.type = 'NetworkError';
    this.response = response;
    this.message = msg;
  }
}
