const assert=require('node:assert/strict'),R=require('./chapter2-v3-state');
const drain=s=>{for(let n=0;s.dialogue.length&&n<40;n++)s=R.act(s,{type:'next'});return s;};
let s=R.preview('weather');s=drain(R.act(s,{type:'inspect',target:'coded-note'}));
assert.equal(s.question,'unfold-note');
s=drain(R.act(s,{type:'unfold-note'}));assert.equal(s.seen.noteOpened,true);
assert.equal(s.question,'');
console.log('쪽지 발견 → 펼치기 → 단서 연결 통과');
