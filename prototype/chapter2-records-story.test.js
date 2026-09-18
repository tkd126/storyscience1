const assert=require('node:assert/strict');
const scenes=require('./chapter2').build();
for(const [id,s] of Object.entries(scenes))assert.doesNotMatch(JSON.stringify(s),/운동회|체육대회|경기|바통|주자|결승선|응원|순서표/,id+' must investigate filming records');
assert.equal(scenes['chapter2-start'].next,'c2-voice-intro');
assert.equal(scenes['c2-voice-intro'].next,'c2-fog-intro');
assert.equal(scenes['c2-fog-after'].next,'c2-search');
for(const id of ['chapter2-start','c2-voice-intro','c2-fog-intro','c2-fog','c2-fog-after','c2-search'])assert.ok(!scenes[id].chars.includes('hana'),id+' must not reveal Hana');
assert.match(scenes['c2-race'].line,/원고/);
assert.match(scenes['c2-baton-answer'].line,/받았어/);
assert.equal(scenes['c2-race'].time,'오전 10:20');
assert.equal(scenes['c2-weather-change'].time,'오전 10:40');
for(const s of Object.values(scenes))for(const c of s.choices||[]){const first=scenes[c.branch];assert.ok(first);assert.ok(scenes[first.next]);assert.notEqual(first.next,s.next,'choice gets two reactions');}
console.log('2편 촬영 기록 이야기·발견 지연·선택 반응 통과');
