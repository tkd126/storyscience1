const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const P=require('./playground.js'),RoomScene=require('./room-scene.js'),ActivityClock=require('./activity-clock.js');
// A lightweight output host exercises the real view and shared renderer without a browser dependency.
// Browser QA separately verifies positioning, focus trapping and actual DOM hit targets.
function host(){
 const listeners={};
 const node={insertAdjacentHTML(_where,html){panel.html+=html;},focus(){}};
 const classes=new Set();
 const panel={html:'',inputValue:'',children:[],classes,classList:{add(...names){names.forEach(n=>classes.add(n));},remove(...names){names.forEach(n=>classes.delete(n));},toggle(name,on){if(on)classes.add(name);else classes.delete(name);}},
  set innerHTML(html){this.html=html;},get innerHTML(){return this.html;},
  querySelector(sel){if(sel==='.room-modal'||sel==='.pg-clock')return null;if(sel.startsWith('[data-weather-input='))return {value:this.inputValue};return node;},
  insertAdjacentHTML(_where,html){this.html+=html;},
  addEventListener(name,fn){listeners[name]=fn;},removeEventListener(name){delete listeners[name];},
  contains(){return true;},
  click(action){listeners.click({target:{closest(){return action?{dataset:{pg:action}}:null;}}});},
  submit(concept,answer){this.inputValue=answer;listeners.submit({preventDefault(){},target:{closest(){return {dataset:{weather:concept}};}}});}
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
assert.match(panel.html,/name="weather-answer"/,'관찰한 개념은 직접 입력한다');
panel.submit('dew','물');assert.equal(progress.game.weatherConcepts.dew,false,'오답은 재시도');
panel.submit('dew','이슬');assert.equal(progress.game.weatherConcepts.dew,true);
panel.click('spot:air');panel.submit('fog','안개');assert.equal(completed,0);
panel.click('spot:sky');assert.equal(completed,0,'세 번째 개념도 직접 답한다');
panel.submit('cloud','구름');assert.equal(completed,1,'세 개념 입력 뒤 자동 합류');
assert.match(panel.html,/pg-fog-bank/,'먼 골대 앞 안개가 시각적으로 보인다');
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
