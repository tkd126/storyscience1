const assert=require('node:assert/strict');
const P=require('./playground.js');
const s=P.act(P.initial('locker'),{type:'teacher-open'});
assert.equal(s.lockerOpen,true);
assert.equal(s.heard,false,'허락만으로 녹음 증거가 생기지 않음');
assert.equal(P.initial('locker',s).lockerOpen,true,'새 보관함 진행 복원');
console.log('교사 허락으로 보관함 열기 통과');
