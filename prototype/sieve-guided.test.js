const assert=require('node:assert/strict');
const lab=require('./sieve.js');
const source=require('node:fs').readFileSync(require('node:path').join(__dirname,'sieve.js'),'utf8');
assert.ok(!source.includes('data-predict'),'예상 선택을 강제하지 않는다');
assert.ok(source.includes('if(selected&&s.steps<4)'),'체 선택 직후 흔들 수 있다');
assert.ok(!source.includes('materials-anime-v1.png'),'장식용 재료 삽화를 표시하지 않는다');
assert.ok(source.includes('mission-success'),'실험 전에 성공 모습을 알려 준다');
function run(kinds,tool){let s=lab.create();s.groups=[kinds];s=lab.select(lab.load(s,0),tool);for(let i=0;i<4;i++)s=lab.shake(s);return s;}
const all=lab.create().groups[0];
assert.equal(lab.matchesGoal(run(all,'wide'),1),true);
assert.equal(lab.matchesGoal(run(all,'medium'),1),false);
assert.equal(lab.matchesGoal(run(all,'fine'),1),false);
assert.equal(lab.matchesGoal(run(all.filter(k=>k!=='large'),'medium'),2),true);
assert.equal(lab.matchesGoal(run(all.filter(k=>k!=='large'),'wide'),2),false);
assert.equal(lab.matchesGoal(lab.create(),1),false);
console.log('단계별 분리 목표와 잘못된 체 재시도 판정 통과');
