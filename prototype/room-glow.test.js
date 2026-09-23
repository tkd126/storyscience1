const assert=require('node:assert/strict');
const fs=require('node:fs');
const room=fs.readFileSync(__dirname+'/room.js','utf8');
const css=fs.readFileSync(__dirname+'/styles.css','utf8');
const hanaView=fs.readFileSync(__dirname+'/hana-search-view.js','utf8');
const playgroundView=fs.readFileSync(__dirname+'/playground-view.js','utf8');
assert.ok(!room.includes('<polygon'),'어긋난 다각형 외곽선 제거');
assert.ok(room.includes('room-object-glow'),'그림 좌표에 맞춘 윤곽');
assert.ok(css.includes('drop-shadow'),'윤곽에 빛 번짐 적용');
assert.ok(css.includes('stroke-linejoin:round'),'꺾인 모서리 방지');
assert.ok(css.includes('.room-hotspot:hover>span'),'마우스를 올리면 클릭 대상 이름도 표시');
assert.ok(hanaView.includes("path||'M'+x"),'윤곽이 비어 있는 클릭 대상도 표시용 외곽선을 가진다');
assert.ok(playgroundView.includes('pg-fog-bank'),'먼 골대 앞 안개가 그림에서 보인다');
console.log('사물 윤곽: 다각형 제거·광원·부드러운 연결 통과');
for(const id of ['globe','balance','towel','plant','mortar','sink','stool','microphone','cables']){
 assert.ok(room.includes("['"+id+"',"),id+'도 구경할 수 있어야 함');
}
const engine=require('./room.js');
for(const mode of ['supplies','finale']){
 const s=engine.initial(mode);
 for(const id of ['globe','balance','towel','plant','microphone','cables'])assert.deepEqual(engine.step(s,id),s,'장식 조사로 진행 조건을 바꾸지 않음');
}
