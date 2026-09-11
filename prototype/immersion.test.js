const assert=require('node:assert/strict'),fs=require('node:fs');
const read=f=>fs.readFileSync(__dirname+'/'+f,'utf8');
assert.match(read('fullscreen.js'),/requestFullscreen/);
assert.match(read('styles.css'),/salt-workshop-panel/);
assert.ok(!read('salt-workshop.js').includes('host.scrollTop=0'));
assert.match(read('styles.css'),/\.experiment-panel button/);
console.log('전체화면·실험 양열 배치·버튼 대비·스크롤 초기화 제거 통과');
