const assert=require('node:assert/strict');
const title=require('./episode-title.js');
assert.equal(title.choose({heldHands:true}), '끝까지 손을 놓지 않은 아이');
assert.equal(title.choose({tookTape:true}), '시간의 테이프를 지킨 아이');
assert.equal(title.choose({watchedCarefully:true}), '낡은 기록을 읽은 관찰자');
assert.equal(title.choose({heldHands:true},true), '친구와 이름을 함께 지킨 동료');
assert.equal(title.choose({tookTape:true},true), '기록을 지킨 시간 탐사자');
assert.equal(title.choose({},true), '하나의 이름을 남긴 전학생');
console.log('선택 기록에 따른 단일 에피소드 칭호 판정 통과');
