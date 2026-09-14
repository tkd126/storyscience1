const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={document:{querySelector:()=>null}};vm.createContext(context);
vm.runInContext(fs.readFileSync(__dirname+'/app.js','utf8').replace(/init\(\);\s*$/,'')+'\nglobalThis.story=scenes;',context);
const scenes=context.story;
const path=[];let id='phone-path-jeongbok';
while(id!=='teacher-slip'){assert.ok(scenes[id]&&!path.includes(id));path.push(id);id=scenes[id].next;}
assert.ok(path.length>=4,'거짓말을 들킨 뒤 해명, 상대 반응, 화제 연결을 거쳐야 한다');
assert.notEqual(scenes['phone-path-jeongbok'].active,'eunho','정복 대사에 은호를 화자로 강조하면 안 된다');
for(const scene of Object.values(scenes))for(const choice of scene.choices||[]){
 let next=choice.branch||scene.next,seen=new Set();
 while(next&&!['end','chapter1-preview-end'].includes(next)){
  assert.ok(scenes[next],next);if(seen.has(next))break;seen.add(next);next=scenes[next].next;
 }
}
console.log('선택 분기 연결과 정복 해명 경로 통과');
