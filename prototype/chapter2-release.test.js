const assert=require('node:assert/strict');
const P=require('./playground.js');
const E=require('./evidence-task.js');
const scenes=require('./chapter2.js').build();
const act=(s,type,value)=>P.act(s,{type,value});
let s=P.initial('wind');
assert.deepEqual(s.inventory,[],'teacher must grant the key');
assert.equal(act(s,'take','clip').inventory.includes('clip'),false);
s=act(s,'teacher-permission');s=act(s,'select','key');s=act(s,'use','store');
assert.equal(s.storeOpen,true);
for(const id of ['clip','reacher'])s=act(s,'take',id);
s=act(s,'select','clip');s=act(s,'use','board');
assert.equal(s.initialFixed,true,'fix the sheet before the gust');
s=act(s,'gust');
assert.equal(act(s,'direction','east').windStep,0,'observe flag before prediction');
for(const direction of ['east','north','east']){
 s=act(s,'inspect','flag');const before=s.windStep;
 assert.equal(act(s,'direction','west').windStep,before);
 s=act(s,'direction',direction);
}
s=act(s,'select','clip');assert.equal(act(s,'use','hedge').paper,false);
s=act(s,'select','reacher');s=act(s,'use','hedge');
s=P.initial('wind',JSON.parse(JSON.stringify(s)));assert.equal(s.paper,true);
s=act(s,'select','clip');s=act(s,'use','board');assert.equal(s.complete,true);
let tape=P.initial('locker');assert.equal(act(tape,'play').heard,false);
tape=act(tape,'teacher-open');tape=act(tape,'take','tape');
assert.equal(act(tape,'use','recorder').loaded,false);
tape=act(tape,'select','tape');tape=act(tape,'use','recorder');tape=act(tape,'play');
assert.match(tape.message,/하나야.*받아/);assert.match(tape.message,/받았어/);
let pack=P.initial('pack');
pack=act(pack,'select','notes');assert.deepEqual(act(pack,'use','box').packed,[]);
pack=act(pack,'select','cloth');pack=act(pack,'use','box');
for(const id of ['notes','tape']){pack=act(pack,'select',id);pack=act(pack,'use','box');}
assert.equal(pack.closed,false);pack=act(pack,'close');assert.equal(pack.complete,true);
const answers={a:{time:'10:00',wind:'서'},b:{time:'10:20',wind:'북'},c:{time:'10:40',wind:'북'}};
assert.equal(E.initial({answers,explanation:'B는 마른 땅, C는 빗방울이 있어서.',reviewed:true,complete:true}).complete,true,'one reason is sufficient');
assert.equal(E.initial({answers,record:{mode:'oral',spoken:true},reviewed:true,complete:true}).complete,true,'oral reason restores');
assert.equal(E.initial({answers,reviewed:true,complete:true}).complete,false);
const minute=t=>{const m=t.match(/(오전|오후|낮) (\d+):(\d+)/);return (+m[2]%12)+(m[1]==='오후'||m[1]==='낮'?12:0)+(+(m[3])/60);};
for(const [id,scene] of Object.entries(scenes)){
 for(const next of [scene.next,...(scene.choices||[]).map(c=>c.branch)].filter(n=>scenes[n])){
  if(scene.date===scenes[next].date)assert.ok(minute(scene.time)<=minute(scenes[next].time),`${id} → ${next} reverses time`);
 }
 if(['photoStudio'].includes(scene.backdrop)){
  assert.equal(scene.chars.includes('eunho'),false,`${id}: Eunho absent`);
  assert.notEqual(scene.speaker,'강은호');
 }
 assert.notEqual(scene.speaker,'박정복');
}
assert.equal(scenes['c2-night'].backdrop,'photoStudio');
assert.match(scenes['c2-depart'].line,/목도리/);
for(const start of ['c2-stay','c2-future']){let id=start,count=0;while(id!=='c2-photo-intro'&&count<10){count++;id=scenes[id].next;}assert.equal(id,'c2-photo-intro');assert.ok(count>=2);}
console.log('chapter2 release gates passed');
