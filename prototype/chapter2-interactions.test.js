const assert=require('node:assert/strict'),I=require('./chapter2-interactions');
for(const key of Object.keys(I.scenes)){const html=I.render(key,x=>x);assert.ok(!html.includes('<input'));assert.equal((html.match(/data-clue-answer/g)||[]).length,2);}
assert.match(I.goal({room:'weather',seen:{},answers:{}}),/쪽지/);
assert.match(I.goal({room:'archive',seen:{},answers:{photo:true}}),/뒷면/);
assert.match(I.goal({room:'prep',seen:{secured:true,recovered:true},answers:{wind:true}}),/원고/);
assert.match(I.goal({room:'prep',seen:{secured:true,recovered:true,inserted:true},answers:{wind:true,manuscript:true}}),/되감/);
console.log('장면별 행동 UI와 목표 통과');
