const assert=require('node:assert/strict');
const lab=require('./sieve.js');
assert.equal(typeof lab.load,'function','재료 묶음을 다시 체에 넣는 기능');
assert.deepEqual(lab.predictions(),[
 ['', '예상해 보기'],
 ['none', '아무것도 안 내려온다'],
 ['sand', '모래만'],
 ['sand,small', '모래와 작은 자갈'],
 ['small', '작은 자갈만'],
 ['all', '전부']
],'예상 선택지는 값과 문구가 빠짐없이 짝을 이룸');
assert.equal(lab.storedMessage('sand'),'고운 모래를 보관했어!');
assert.equal(lab.storedMessage('small'),'작은 자갈을 보관했어!');
assert.equal(lab.storedMessage('large'),'큰 자갈을 보관했어!');
assert.deepEqual(lab.finalExplanation(),{
 text:'맞아! 알갱이보다 작은 체 눈은 통과할 수 없지. 크기가 다른 체를 차례로 써서 세 재료를 나눴어.',
 feedback:''
},'마지막 정답 뒤에는 이전 오답 안내가 남지 않음');
function pass(s,index,tool){s=lab.load(s,index);s=lab.select(s,tool);for(let i=0;i<4;i++)s=lab.shake(s);return lab.unload(s);}
for(const order of [['medium','wide'],['wide','medium']]) {
 let s=lab.create();
 s=pass(s,0,order[0]);
 assert.equal(s.groups.flat().length,36,'분리 중 재료 보존');
 const mixed=s.groups.findIndex(g=>new Set(g).size>1);
 s=pass(s,mixed,order[1]);
 assert.equal(s.groups.length,3);
 for(const kind of ['sand','small','large'])s=lab.store(s,s.groups.findIndex(g=>g[0]===kind),kind);
 assert.equal(lab.complete(s),true,'어느 순서로든 모두 분리');
 assert.equal(s.bins.sand.length,20);assert.equal(s.bins.small.length,10);assert.equal(s.bins.large.length,6);
}
let s=lab.create();
assert.deepEqual(lab.store(s,0,'sand'),s,'섞인 재료는 완성 통에 넣을 수 없음');
assert.deepEqual(lab.load(s,99),s);
s=lab.load(s,0);assert.deepEqual(lab.unload(s),s,'흔들기 전 분리 완료 불가');
assert.deepEqual(lab.shake(s),s,'체 선택 전 진행 불가');
s=lab.select(s,'fine');for(let i=0;i<4;i++)s=lab.shake(s);
assert.equal(s.bottom.length,0);assert.equal(s.top.length,36);
assert.deepEqual(lab.shake(s),s,'중복 조작 방지');
s=lab.unload(s);s=pass(s,0,'wide');assert.equal(s.groups.flat().length,36,'잘못된 체 사용 후 복구');
for(const answer of ['혼합물',' 혼 합 물 ','혼합물입니다.']) assert.equal(lab.check('mixture',answer),true);
for(const answer of ['크기','알갱이 크기','크기 차이']) assert.equal(lab.check('property',answer),true);
for(const answer of ['','색깔','크기가 아니다','혼합물이 아님']) assert.equal(lab.check('property',answer),false);
assert.equal(lab.check('reason','크기'),true);assert.equal(lab.check('reason','작기'),false);
console.log('다단계 분리·재료 보존·양방향 순서·입력 판정 테스트 통과');
