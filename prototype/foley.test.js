const assert = require('node:assert/strict');
const fs = require('node:fs');
assert.ok(fs.existsSync(__dirname + '/foley.js'), '전자음 대신 짧은 질감 효과음 모듈이 필요합니다.');
const {samples} = require('./foley.js');
for (const kind of ['paper','wood','tape']) {
  const audio = samples(kind, 8000);
  assert.ok(audio.length >= 400 && audio.length <= 3200);
  assert.ok(audio.every(n => Number.isFinite(n) && Math.abs(n) <= 1));
  assert.ok(audio.some(n => Math.abs(n) > .01), '효과음은 무음이 아니어야 합니다.');
  assert.ok(Math.abs(audio[audio.length-1]) < .002, '끝에서 소리가 잘리지 않고 잦아들어야 합니다.');
}
console.log('질감 효과음 샘플 검사 통과');
const bell = samples('bell',8000);
assert.ok(bell.length >= 16000, '종은 짧은 클릭이 아니라 2초 이상 여운이 있어야 합니다.');
