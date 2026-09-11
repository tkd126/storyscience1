const assert = require('node:assert/strict');
const fs = require('node:fs');
assert.ok(fs.existsSync(__dirname + '/choice-dialogue.js'), '선택 뒤 이어지는 대화 모듈이 필요합니다.');
const { followup } = require('./choice-dialogue.js');
const scenes = ['tape-choice','reaction-choice','bell-choice','intro-choice','phone-choice','eunho-reaction'];
const replies = [];
for (const scene of scenes) for (let index = 0; index < 3; index++) {
  const reply = followup(scene, index);
  assert.ok(reply && reply.speaker && reply.text.length > 15, `${scene}/${index}: 다음 화자의 대사가 있어야 합니다.`);
  replies.push(reply.text);
}
assert.equal(new Set(replies).size, 18, '모든 선택에 같은 빈말을 붙이지 않습니다.');
assert.equal(followup('unknown', 0), null);
assert.equal(followup('tape-choice', 9), null);
console.log('선택 후 후속 대화 18개 검사 통과');
