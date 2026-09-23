const assert=require('node:assert/strict');
const {R,drain,go}=require('./chapter2-test-helpers.cjs');
const I=require('./chapter2-investigation');
assert.equal(Object.keys(I.choices).length,8);
for(const [id,c] of Object.entries(I.choices))for(let index=0;index<c.options.length;index++){
 let s=R.preview(id==='voice'?'prep':id==='promise'?'coast':'yard');s.question='story-choice';s.choiceId=id;
 if(id==='voice')s.after='reveal-door';
 if(id==='promise')s.after='end';
 s=R.act(s,{type:'story-choice',value:String(index)});
 assert.equal(s.choices[id],index);assert.ok(s.dialogue.length);
 s=R.initial(JSON.parse(JSON.stringify(s)));assert.equal(s.choices[id],index);
 s=drain(s);
 if(id==='voice'){assert.equal(s.room,'archive');assert.ok(s.seen.doorOpen);}
 if(id==='promise')assert.ok(s.complete);
}
let legacy={version:3,room:'prep',seen:{secured:true,doorOpen:true},answers:{},dialogue:[],question:'tapePressure'};
let s=R.initial(legacy);assert.equal(s.question,'manuscript');assert.ok(!s.seen.doorOpen);
s=go(s,'work-set','error','4');assert.equal(s.work.manuscript.error,'4');
console.log('이야기 선택 전 갈래·저장 복원·공통 합류·이전 저장 호환 통과');
