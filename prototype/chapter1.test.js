const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
// Inspect actual scene data without starting browser event bindings.
const context={document:{querySelector:()=>null}};
vm.createContext(context);
const src=fs.readFileSync(path.join(__dirname,'app.js'),'utf8').replace(/init\(\);\s*$/,'');
vm.runInContext(src+'\nglobalThis.story=scenes;',context);
const scenes=context.story;
assert.notEqual(scenes['hana-name'].next,'end','이름이 지워진 뒤 새 사건이 이어져야 한다');
function trace(start,stop){const visited=new Set();let id=start;while(id!==stop){assert.ok(!visited.has(id),'무한 순환 없음');visited.add(id);assert.ok(scenes[id],`장면 존재: ${id}`);id=scenes[id].next;}return visited;}
assert.ok(trace('hana-name','end').has('pager-message'));
assert.ok(trace('chapter1-start','chapter1-end').has('sand-lab'));
assert.equal(scenes['sand-lab'].experiment,'sieve');
assert.equal(scenes['sand-lab'].next,'sand-result');
console.log('프롤로그 연결·첫 실험·공통 합류 테스트 통과');
