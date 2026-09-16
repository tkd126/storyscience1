const assert=require('node:assert/strict'),fs=require('node:fs');
assert.ok(fs.existsSync(__dirname+'/weather-chapter.js'),'날씨 활동 모듈 필요');
const W=require('./weather-chapter');
const flows={fog:[['inspect','grass'],['inspect','air'],['inspect','sky'],['classify',{grass:'dew',air:'fog',sky:'cloud'}],['cause','condense']],wind:[['inspect','pressure'],['inspect','ribbon'],['direction','east'],['search','east']],schedule:[['inspect','morning'],['inspect','noon'],['inspect','ground'],['plan','inside'],['reason','combined']],photo:[['inspect','log'],['inspect','photo'],['inspect','voice'],['time','10:20'],['arrange','front'],['protect','copy']]};
for(const [kind,actions] of Object.entries(flows)){
 let s=W.initial(kind);const wrong=W.act(s,{type:'nonsense',value:'x'});assert.equal(wrong.complete,false);
 for(const [type,value] of actions){s=W.act(s,{type,value});s=W.initial(kind,JSON.parse(JSON.stringify(s)));}
 assert.equal(s.complete,true,kind+' completes and resumes');
}
let f=W.initial('fog');f=W.act(f,{type:'cause',value:'condense'});assert.equal(f.complete,false,'不能 skip observation');
let p=W.initial('photo');for(const key of ['log','photo','voice'])p=W.act(p,{type:'inspect',value:key});
p=W.act(p,{type:'time',value:'10:40'});assert.equal(p.step,0,'wrong answer keeps puzzle open');
p=W.act(p,{type:'time',value:'１０：２０'});assert.equal(p.step,1,'fullwidth input accepted');
const C=require('./chapter2');const scenes=C.build();
const restarted=C.restartFlags({oilSeparated:true,'weather-fog':{complete:true},'weather-photo-done':true,heldHands:true});
assert.equal(restarted.oilSeparated,true);assert.equal(restarted.heldHands,true);assert.equal(restarted['weather-fog'],undefined);assert.equal(restarted['weather-photo-done'],undefined);
const visited=new Set();function walk(id,stack=[]){if(id==='chapter2-end')return;assert.ok(scenes[id],id);assert.ok(!stack.includes(id),'no cycle');visited.add(id);const s=scenes[id];for(const to of s.choices?s.choices.map(c=>c.branch||s.next):[s.next])walk(to,[...stack,id]);}
walk('chapter2-start');for(const kind of Object.keys(flows))assert.ok([...visited].some(id=>scenes[id].weather===kind),kind);
assert.equal(scenes['chapter2-start'].date,'1999년 12월 28일');assert.equal(scenes['c2-morning'].date,'1999년 12월 29일');
console.log('2편 전체 분기·날씨 4활동·오답·저장 복원 통과');
