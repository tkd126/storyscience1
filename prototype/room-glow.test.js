const assert=require('node:assert/strict');
const fs=require('node:fs');
const room=fs.readFileSync(__dirname+'/room.js','utf8');
const css=fs.readFileSync(__dirname+'/styles.css','utf8');
assert.ok(!room.includes('<polygon'),'어긋난 다각형 외곽선 제거');
assert.ok(room.includes('room-object-glow'),'그림 좌표에 맞춘 윤곽');
assert.ok(css.includes('drop-shadow'),'윤곽에 빛 번짐 적용');
assert.ok(css.includes('stroke-linejoin:round'),'꺾인 모서리 방지');
console.log('사물 윤곽: 다각형 제거·광원·부드러운 연결 통과');
for(const id of ['globe','balance','towel','plant','mortar','sink','stool','microphone','cables']){
 assert.ok(room.includes("['"+id+"',"),id+'도 구경할 수 있어야 함');
}
const engine=require('./room.js');
for(const mode of ['supplies','finale']){
 const s=engine.initial(mode);
 for(const id of ['globe','balance','towel','plant','microphone','cables'])assert.deepEqual(engine.step(s,id),s,'장식 조사로 진행 조건을 바꾸지 않음');
}
