const assert=require('node:assert/strict');
const C=require('./chapter2');
const fs=require('node:fs');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const previewEntry=html.match(/<option value="([^"]+)">바람과 순서표<\/option>/)?.[1];
const s=C.build();
assert.equal(s[previewEntry]?.prepare,true,'wind preview must enter teacher permission and tool preparation');
for(const id of ['c2-fog','c2-wind','c2-locker','c2-schedule','c2-photo']) {
 assert.equal(s[id]?.experiment,'playground',id+' must use physical exploration');
}
assert.equal(s['c2-erased'].next,'c2-conflict-hana');
assert.equal(s['c2-conflict-hana'].next,'c2-locker-intro','Hana answers the memory conflict before investigating');
assert.equal(s['c2-night'].next,'c2-photo','film must be developed before inspection');
assert.equal(s['c2-photo'].next,'c2-proof');
assert.equal(s['c2-proof'].next,'c2-theft');
assert.equal(s['c2-photo'].time,'오후 6:10');
const visited=new Set();
function walk(id,stack=[]){
 if(id==='chapter2-end')return;
 assert.ok(s[id],id+' exists');assert.ok(!stack.includes(id),'no loop at '+id);
 visited.add(id);
 for(const to of s[id].choices?s[id].choices.map(c=>c.branch||s[id].next):[s[id].next])walk(to,[...stack,id]);
}
walk('chapter2-start');
assert.ok(visited.has('c2-locker'));
const flags=C.restartFlags({'weather-fog':{},'playground-wind':{},heldHands:true});
assert.equal(flags['playground-wind'],undefined);assert.equal(flags.heldHands,true);
console.log('운동장 본편 탐색·보관함·인화 후 추리·공통 결말 연결 통과');
