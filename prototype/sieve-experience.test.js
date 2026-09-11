const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const source=fs.readFileSync(path.join(__dirname,'sieve.js'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'styles.css'),'utf8');

assert.ok(!source.includes('material-illustration'), '장식용 재료 배너를 다시 넣지 않는다');
assert.ok(source.includes('lab-mission'), '실험 목표를 가장 먼저 보여 준다');
assert.ok(source.includes('mission-reason'), '현재 목표가 필요한 이유를 설명한다');
assert.ok(source.includes('mission-success'), '학생이 성공 모습을 미리 알 수 있어야 한다');
assert.ok(source.includes('sieve-stage'), '작동하는 체와 낙하 효과를 한 무대로 묶는다');
assert.ok(source.includes('shake-dust'), '흔들 때 떨어지는 입자를 표시한다');
assert.ok(source.includes('setTimeout'), '흔들기 동작 뒤에 결과를 갱신한다');
assert.ok(source.includes('kindIndex=group.slice(0,i)'), '재료 종류별 좌표를 계산해 체 밖에 떠 있지 않게 한다');
assert.ok(css.includes('@keyframes sieve-wobble'));
assert.ok(css.includes('@keyframes grain-drop'));

console.log('목표 중심 배치·체 흔들기·알갱이 낙하 연출 규칙 통과');
