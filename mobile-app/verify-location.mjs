import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=new URL('./',import.meta.url);
const context=vm.createContext({window:{}});
vm.runInContext(readFileSync(new URL('location.js',root),'utf8'),context);
vm.runInContext(readFileSync(new URL('data.js',root),'utf8'),context);
const {recommend,createTracker,base}=context.window.PocketLocation;
const places=context.window.GUIDE_DATA.places;
for(const slug of ['holy-burger','masp','beco-do-batman','parque-ibirapuera-y-marquise']){
 const place=places.find(p=>p.slug===slug);
 const result=recommend(places,{lat:place.lat,lng:place.lng,accuracy:50});
 assert.equal(result.place.slug,slug);assert.equal(result.nearby,true);
}
assert.equal(recommend(places,null).outside,false);
assert.equal(recommend(places,{lat:40.7,lng:-74}).outside,true);
assert.equal(recommend(places,{...base,accuracy:5000}).nearby,false);
assert.equal(recommend([],base),null);
let success,failure,calls=0,time=1000000;
const permission={state:'prompt'};
const nav={permissions:{query:async()=>permission},geolocation:{getCurrentPosition:(ok,fail)=>{calls++;success=ok;failure=fail;}}};
const updates=[];
const tracker=createTracker({navigator:nav,secure:true,onChange:s=>updates.push(s),now:()=>time});
await tracker.resume();assert.equal(calls,1,'First visit requests geolocation automatically');
tracker.locate();tracker.locate();assert.equal(calls,1,'No duplicate pending request');
success({coords:{latitude:base.lat,longitude:base.lng,accuracy:30}});
assert.equal(tracker.getState().status,'ready');
permission.state='granted';await tracker.resume();assert.equal(calls,1);
time+=300001;await tracker.resume();assert.equal(calls,2);
failure({code:3});assert.equal(tracker.getState().status,'timeout');assert(tracker.getState().position,'Keep previous position on timeout');
tracker.locate();failure({code:1});assert.equal(tracker.getState().position,null,'Clear location on denial');
permission.state='denied';await tracker.resume();
assert.equal(tracker.getState().status,'denied');
tracker.locate();tracker.reset();success({coords:{latitude:0,longitude:0,accuracy:20}});
assert.equal(tracker.getState().position,null,'Ignore a late callback after reset');
const blocked=createTracker({navigator:nav,secure:false,onChange:()=>{}});blocked.locate();assert.equal(blocked.getState().status,'unsupported');
permission.state='granted';const granted=createTracker({navigator:nav,secure:true,onChange:()=>{}});const before=calls;await granted.resume();assert.equal(calls,before+1,'Granted permission refreshes on open');
// Safari variants without Permissions API, or where querying it throws.
for (const permissions of [undefined, {query:async()=>{throw new Error('Unsupported permission');}}]) {
 let attempts=0, reject;
 const fallback=createTracker({navigator:{permissions,geolocation:{getCurrentPosition:(ok,fail)=>{attempts++;reject=fail;}}},secure:true,onChange:()=>{},now:()=>time});
 await fallback.resume();assert.equal(attempts,1,'Automatic request without Permissions API');
 reject({code:1});time+=300001;await fallback.resume();
 assert.equal(attempts,1,'No automatic repeated prompt after denial');
}
let deniedCalls=0;
const denied=createTracker({navigator:{permissions:{query:async()=>({state:'denied'})},geolocation:{getCurrentPosition:()=>deniedCalls++}},secure:true,onChange:()=>{}});
await denied.resume();assert.equal(deniedCalls,0);assert.equal(denied.getState().status,'denied');
console.log('PASS: four neighborhoods, fallback, outside São Paulo, imprecise signal, first visit, permission granted/denied, timeouts, resume throttling, late responses and insecure contexts.');
