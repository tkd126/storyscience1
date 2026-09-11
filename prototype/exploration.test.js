const assert=require('node:assert/strict');
const room=require('./room');
assert.equal(room.step(room.initial('supplies'),'tools-right').complete,false);
assert.equal(room.step(room.initial('finale'),'tape-right').tape,false);
const delay=require('./answer-delay');
// 비활성화 상태에서는 DOM 접근·타이머 없이 재시도할 수 있어야 한다.
assert.doesNotThrow(()=>{const d=delay.mount(null,'old-save');d.start();d.dispose();});
const clues=require('./clue-book');
assert.equal(clues.check('roster',['roster'],'윤하나'),false,'세 증거를 읽기 전 결론 금지');
assert.equal(clues.check('roster',['roster','duty','photo'],'강은호'),false);
assert.equal(clues.check('roster',['roster','duty','photo'],' 윤하나 '),true);
console.log('탐색 선행 조건·즉시 재시도·출석부 증거 비교 통과');
