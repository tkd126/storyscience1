const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const P=require('./playground.js'),RoomScene=require('./room-scene.js'),ActivityClock=require('./activity-clock.js');
// A lightweight output host exercises the real view and shared renderer without a browser dependency.
// Browser QA separately verifies positioning, focus trapping and actual DOM hit targets.
function host(){
 const listeners={};
 const node={insertAdjacentHTML(_where,html){panel.html+=html;},focus(){}};
 const classes=new Set();
 const panel={html:'',children:[],classes,classList:{add(...names){names.forEach(n=>classes.add(n));},remove(...names){names.forEach(n=>classes.delete(n));},toggle(name,on){if(on)classes.add(name);else classes.delete(name);}},
  set innerHTML(html){this.html=html;},get innerHTML(){return this.html;},
  querySelector(sel){return sel==='.room-modal'||sel==='.pg-clock'?null:node;},
  insertAdjacentHTML(_where,html){this.html+=html;},
  addEventListener(name,fn){listeners[name]=fn;},removeEventListener(name){delete listeners[name];},
  click(action){listeners.click({target:{closest(){return action?{dataset:{pg:action}}:null;}}});}
 };
 return panel;
}
const context={Playground:P,RoomScene,ActivityClock,document:{addEventListener(){},removeEventListener(){}},setInterval(){return 1;},clearInterval(){}};
context.window=context;
vm.runInNewContext(fs.readFileSync(__dirname+'/hana-search-view.js','utf8'),context);
vm.runInNewContext(fs.readFileSync(__dirname+'/playground-view.js','utf8'),context);
for(const mode of ['fog','wind','locker','pack','photo']){
 const panel=host();let progress;const cleanup=context.PlaygroundView.mount(panel,mode,()=>{},undefined,s=>{progress=s;});
 assert.match(panel.html,/class="room-stage"/,mode+' uses actual shared scene rendering');
 assert.doesNotMatch(panel.html,/data-room-action="bag"/);
 assert.doesNotMatch(panel.html,/data-room-action="peek"|data-pg="teacher"/,'탐색 종료를 위한 별도 버튼 없음');
 assert.doesNotMatch(panel.html,/pg-controls|pg-inventory/,'no permanent action/inventory list');
 assert.equal(progress.clock.unlimited,true,'time challenge is opt-in');
 if(mode==='photo')assert.match(panel.html,/assets\/photo-studio-cartoon-v2.png/);
 cleanup();
}
const panel=host();let progress,completed=0;
const cleanup=context.PlaygroundView.mount(panel,'fog',()=>{completed++;},undefined,s=>{progress=s;});
for(const id of ['weatherBox','school','shed','bucket','cart','speakerBox','ball'])assert.match(panel.html,new RegExp('spot:'+id));
panel.click('spot:weatherBox');assert.match(panel.html,/백엽상/);
assert.equal(completed,0,'주변 물건 조사만으로 완료하지 않음');
panel.click('spot:lens');assert.doesNotMatch(panel.html,/pg-action-strip/);
panel.click('close');assert.doesNotMatch(panel.html,/role="dialog"/);
panel.click('spot:cloth');
assert.match(panel.html,/use:cloth:lens/);
panel.click('use:cloth:lens');assert.equal(progress.game.wipedLens,true,'직접 렌즈 닦기');
assert.doesNotMatch(panel.html,/pg-clean-lens/);
panel.click('spot:grass');
panel.click();
assert.doesNotMatch(panel.html,/pg-action-strip/,'설명 완료 후 배경 클릭으로 탐색 복귀');
assert.ok(panel.classes.has('pg-exploring'),'탐색 상태에서는 대화창을 가리지 않는다');
assert.match(panel.html,/카메라|골대/,'다음 조사 안내');
panel.click('spot:air');assert.equal(completed,0);
panel.click('spot:sky');assert.equal(completed,0,'관찰 후 짧은 날씨 적용 문제');
assert.match(panel.html,/안개/);
panel.click('spot:sky');assert.equal(completed,0,'구름 오답은 재시도');
panel.click('spot:air');assert.equal(completed,0,'안개 위치 찾기');
panel.click('spot:grass');assert.equal(completed,1,'이슬 위치 찾기 후 자동 합류');
panel.click('spot:sky');assert.equal(completed,1,'중복 완료 방지');
cleanup();
for(const [mode,options,actions] of [
 ['wind',{prepare:true},['use:key:store','take:clip','take:reacher','use:clip:board']],
 ['locker',{},['teacher-open','take:tape','use:tape:recorder','play']],
 ['pack',{},['use:cloth:box','use:notes:box','use:tape:box','close-box']]
]){
 const target=host();let count=0;
 const stop=context.PlaygroundView.mount(target,mode,()=>count++,undefined,()=>{},()=>{},options);
 for(const action of actions)target.click(action);
 assert.equal(count,1,mode+' 작업 완료 자동 합류');stop();
}
console.log('shared RoomScene rendering, modal closure, bag-to-target use, opt-in timer passed');
