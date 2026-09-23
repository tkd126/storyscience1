const assert=require('node:assert/strict'),fs=require('node:fs');
const L=require('./chapter2-v3-layout');
for(const room of Object.values(L)){
 assert.ok(fs.existsSync(__dirname+'/'+room.art));
 const ids=new Set();for(const p of room.spots){assert.ok(!ids.has(p.id));ids.add(p.id);assert.ok(p.path);assert.ok(p.label);}
}
for(const id of ['camera','weather-record','leaves','fog','sky'])assert.ok(L.yard.spots.some(p=>p.id===id));
for(const id of ['ribbon','paper','ruler','broom','clip','strap','tape','recorder'])assert.ok(L.prep.spots.some(p=>p.id===id));
console.log('새 배경 자산·필수 클릭 대상 구성 통과');
