const assert=require('node:assert/strict');
const lab=require('./sieve.js');
const cards=lab.reviewCards();
assert.equal(cards.length,3);
for(const card of cards){
 assert.ok(card.question&&card.context&&card.hint);
 assert.equal(card.options.filter(o=>o.correct).length,1);
 assert.ok(card.options.every(o=>o.reply));
}
assert.deepEqual(cards.map(c=>c.id),['evidence','repair','transfer']);
cards[0].options[0].text='변경';
assert.notEqual(lab.reviewCards()[0].options[0].text,'변경');
console.log('단원 정리: 관찰 근거·실험 수정·다른 상황 적용 카드 통과');
