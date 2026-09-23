const assert=require('node:assert/strict');
const {R,go,work,editing}=require('./chapter2-test-helpers.cjs');
for(const order of ['lab-first','chart-first']){
 let s=R.preview('weather');
 for(const target of ['high-chart','air-balance','tape-back']){s=go(s,'inspect',target);assert.ok(!s.question);assert.ok(!s.lab);}
 s=go(s,'inspect','coded-note');s=go(s,'unfold-note');
 const lab=x=>{
  x=go(x,'inspect','air-balance');
  for(const [target,value] of [['volume','same'],['prediction','cold'],['reason','density'],['measure','yes'],['mass-choice','cold']])x=go(x,'lab-set',target,value);
  return go(x,'lab-check','density');
 };
 const chart=x=>{
  x=go(x,'inspect','low-chart');x=work(x,[['direction','left'],['claims','1'],['claims','3']]);assert.ok(!x.answers.low);
  x=work(x,[['direction','right'],['claims','1'],['claims','2']]);assert.ok(x.answers.low);return x;
 };
 s=order==='lab-first'?chart(lab(s)):lab(chart(s));
 s=go(s,'inspect','coded-note');s=go(s,'answer','gradient','오른쪽');assert.equal(s.room,'coast');
 s=go(s,'inspect','night-coast');s=work(s,editing);s=go(s,'inspect','last-recording');assert.ok(s.complete);
}
console.log('쪽지 선행·자유 조사 순서·오답·편집실 재합류 통과');
