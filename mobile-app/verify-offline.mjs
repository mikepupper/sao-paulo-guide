import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root = new URL('./', import.meta.url);
const scope = 'https://example.test/travel/mobile-app/';
const listeners = {};
const stores = new Map();
let offline = false;
const absolute = value => new URL(typeof value === 'string' ? value : value.url, scope).href;
const caches = {
  async open(name) {
    if (!stores.has(name)) stores.set(name, new Map());
    const entries = stores.get(name);
    return {
      async addAll(files) { for (const file of files) { assert(existsSync(new URL(file, root))); entries.set(absolute(file), new Response(file)); } },
      async match(request) { return entries.get(absolute(request))?.clone(); },
      async put(request, response) { entries.set(absolute(request), response.clone()); }
    };
  },
  async keys() { return [...stores.keys()]; },
  async delete(name) { return stores.delete(name); }
};
const context = vm.createContext({URL, Response, caches, console, fetch:async request => {
  if (offline) throw new Error('offline');
  return new Response('photo downloaded');
}, self:{registration:{scope},location:{origin:new URL(scope).origin},clients:{claim:async()=>{}},addEventListener:(name,handler)=>listeners[name]=handler}});
context.importScripts = file => vm.runInContext(readFileSync(new URL(file, root),'utf8'), context);
vm.runInContext(readFileSync(new URL('sw.js',root),'utf8'), context);
async function lifecycle(name) { let job; listeners[name]({waitUntil(promise){job=promise;}}); await job; }
async function request(path, mode='cors', destination='') {
  let response;
  listeners.fetch({request:{url:new URL(path,scope).href,method:'GET',mode,destination},respondWith(promise){response=promise;}});
  return response;
}
await lifecycle('install');
stores.set('unrelated-site-cache',new Map());
await lifecycle('activate');
assert(stores.has('unrelated-site-cache'));
assert.equal(await (await request('imágenes/example.jpg','cors','image')).text(),'photo downloaded');
offline=true;
assert.equal(await (await request('./','navigate')).text(),'./index.html');
assert.equal(await (await request('index.html','navigate')).text(),'./index.html');
assert.equal(await (await request('data.js')).text(),'./data.js');
assert.equal(await (await request('imágenes/example.jpg','cors','image')).text(),'photo downloaded');
assert.match(await (await request('imágenes/missing.jpg','cors','image')).text(),/Foto disponible/);
assert.equal(await request('https://maps.google.com/'),undefined);
const manifest=JSON.parse(readFileSync(new URL('manifest.webmanifest',root),'utf8'));
assert.equal(manifest.display,'standalone');
assert(manifest.icons.every(icon=>existsSync(new URL(icon.src,root))));
console.log('PASS: offline navigation and data, visited photos, missing-photo fallback, cache isolation, external links excluded, manifest and icons.');
