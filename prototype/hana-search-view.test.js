const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const H=require('./hana-search');
function render(saved){
  let output='';
  const node={insertAdjacentHTML:(_,html)=>{output+=html;},focus(){},classList:{add(){}},setAttribute(){},querySelector(){return node;}};
  const host={set innerHTML(html){output=html;},querySelector(selector){return selector==='.room-modal'?null:node;},insertAdjacentHTML:node.insertAdjacentHTML,classList:{add(){},remove(){}},addEventListener(){},removeEventListener(){}};
  const context={HanaSearch:H,RoomScene:require('./room-scene'),setInterval:()=>1,clearInterval(){}};
  vm.runInNewContext(fs.readFileSync(__dirname+'/hana-search-view.js','utf8'),context);
  context.HanaSearchView.mount(host,()=>{},saved);
  return output;
}
const drain=s=>{while(s.talk)s=H.act(s,'next');return s;};
let s=drain(H.initial());
s=drain(H.act(s,'goal'));
assert.ok(!render(s).includes('hana-first-meeting-v1.png'),'발견 전에는 하나 그림을 숨긴다');
s=drain(H.act(s,'approach'));
assert.ok(render(s).includes('class="hana-meeting"'),'탐색 중에는 인물에게 물건을 사용할 수 있다');
const talking=H.act(s,'eunho');
assert.ok(!render(s).includes('data-room-action="bag"'),'이 구간에는 가방 조작 없음');
assert.ok(!render(talking).includes('class="hana-meeting"'),'대화 중 탐색 인물을 중복 렌더하지 않는다');
assert.ok(render(talking).includes('room-dialogue-portrait'));
assert.ok(render(drain(talking)).includes('class="hana-meeting"'),'대화 후 탐색 인물 복원');
console.log('하나 탐색 인물 중복 방지 통과');

// Run the actual mount with a deterministic clock and minimal DOM adapter.
let tick=null,savedState=null;
const handlers={};
const paragraph={textContent:''};
const element={insertAdjacentHTML(){},focus(){},setAttribute(){}};
const host={
  set innerHTML(html){paragraph.textContent=html.match(/<p>(.*?)<\/p>/s)[1];},
  querySelector(q){return q==='.room-modal'?null:q==='.room-speech p'?paragraph:element;},
  insertAdjacentHTML(){},classList:{add(){},remove(){}},
  addEventListener(type,handler){handlers[type]=handler;},removeEventListener(){},contains(){return true;}
};
const context={HanaSearch:H,RoomScene:require('./room-scene'),setInterval(fn,delay){assert.equal(delay,18);tick=fn;return 1;},clearInterval(){tick=null;}};
vm.runInNewContext(fs.readFileSync(__dirname+'/hana-search-view.js','utf8'),context);
const dispose=context.HanaSearchView.mount(host,()=>{},undefined,s=>{savedState=s;});
const full=H.speech(H.initial())[1];
assert.equal(paragraph.textContent,'','대화는 빈 문장에서 타이핑 시작');
tick();assert.equal(paragraph.textContent,Array.from(full)[0]);
handlers.click({target:{closest(){return null;}}});
assert.equal(paragraph.textContent,full,'첫 배경 클릭은 문장 완성');
assert.equal(savedState,null,'완성 클릭은 대사를 넘기지 않는다');
handlers.click({target:{closest(){return null;}}});
assert.equal(savedState.beat,1,'두 번째 클릭에 다음 대사');
assert.equal(paragraph.textContent,'');
while(tick)tick();
assert.equal(paragraph.textContent,H.speech(savedState)[1],'타이머가 문장 끝에서 종료');
handlers.click({target:{closest(q){return q==='[data-room-action]'?{dataset:{roomAction:'next'}}:null;}}});
assert.equal(savedState.talk,'','마지막 대사 뒤 탐색 복귀');
handlers.click({target:{closest(q){return q==='[data-room-action]'?{dataset:{roomAction:'goal'}}:null;}}});
assert.ok(tick,'사물 조사 대사도 타이핑');
dispose();assert.equal(tick,null,'장면 종료 시 타이머 정리');
console.log('탐색 대화 타이핑·완성·다음·정리 통과');
let reunited=0;
const resume=H.initial({version:1,heard:true,found:true,talk:'memory',beat:4});
const stop=context.HanaSearchView.mount(host,()=>{reunited++;},resume,s=>{savedState=s;});
while(tick)tick();
handlers.click({target:{closest(){return null;}}});
assert.equal(savedState.talk,'teacher','기억 대화 후 별도 교사 버튼 없이 동행 대화');
for(let i=0;i<3;i++){
 while(tick)tick();
 handlers.click({target:{closest(){return null;}}});
}
assert.equal(reunited,1,'동행 대화 후 별도 이동 버튼 없이 다음 장면');
assert.doesNotMatch(render(H.initial()),/data-room-action="teacher"|data-room-action="peek"/);
stop();
