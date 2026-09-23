const assert=require('node:assert/strict'),R=require('./chapter2-v3-state');
const drain=s=>{for(let n=0;s.dialogue.length&&n<100;n++)s=R.act(s,{type:'next'});return s;};
const go=(s,type,target,value)=>drain(R.act(s,{type,target,value}));
for(const room of ['prep','archive','weather','coast']){const s=R.preview(room);assert.equal(s.room,room);assert.equal(s.complete,false);}
let s=R.preview('archive');s=go(s,'inspect','logbook');s=go(s,'inspect','map');assert.equal(s.question,'photo');
s=go(s,'answer','photo','1');assert.equal(s.answers.photo,undefined,'다른 날짜 사진은 다시 비교');
s=go(s,'evidence','fog');s=go(s,'evidence','east');s=go(s,'answer','photo','2');assert.equal(s.answers.photo,true);
for(const kind of ['mass','breeze','pressure']){
 s=R.preview(kind==='breeze'?'prep':'weather');s.seen.noteOpened=true;s=go(s,'lab-open',kind);
 s=go(s,'lab-check',kind);assert.ok(!s.answers['lab-'+kind]);
 if(kind==='mass'){s=go(s,'lab-set','volume','same');s=go(s,'lab-set','prediction','cold');s=go(s,'lab-set','reason','density');s=go(s,'lab-set','mass-choice','cold');s=go(s,'lab-set','measure','yes');}
 if(kind==='breeze'){for(const period of ['day','night']){s=go(s,'lab-set','period',period);s=go(s,'lab-set','observe','yes');s=go(s,'lab-set','rise',period==='day'?'land':'sea');s=go(s,'lab-set','direction',period==='day'?'land':'sea');s=go(s,'lab-check',kind);}}
 if(kind==='pressure'){s=go(s,'lab-set','left','1020');s=go(s,'lab-set','run','yes');s=go(s,'lab-set','left','1024');s=go(s,'lab-set','run','yes');s=go(s,'lab-set','pressure-choice','right-strong');}
 s=go(s,'lab-check',kind);assert.equal(s.answers['lab-'+kind],true);
}
console.log('2편 구간 선택·사진 근거·조작형 활동 통과');
const Lab=require('./chapter2-active');
for(const kind of ['mass','breeze','pressure']){
 const fresh=R.preview(kind==='breeze'?'prep':'weather');fresh.seen.noteOpened=true;const state=go(fresh,'lab-open',kind);
 assert.match(Lab.render(state.lab),/lab-apparatus/, '실제 조작 장치 표시');
 assert.match(Lab.render(state.lab),/<svg/, '관찰 가능한 그림');
 const blocked=go(state,'inspect','window');
 assert.equal(blocked.seen.window,undefined,'실험 뒤 배경 오클릭 차단');
}
