const assert=require('node:assert/strict');
const delay=require('./answer-delay.js');
assert.equal(delay.secondsLeft(16000,1000),15);
assert.equal(delay.secondsLeft(16000,15999),1);
assert.equal(delay.secondsLeft(16000,16000),0);
assert.equal(delay.secondsLeft(16000,17000),0);
assert.equal(delay.duration,15000);
console.log('오답 잠금 15초·경계·만료 판정 통과');
