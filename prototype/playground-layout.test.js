const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const P=require('./playground.js'),RoomScene=require('./room-scene.js'),ActivityClock=require('./activity-clock.js');
// A lightweight output host exercises the real view and shared renderer without a browser dependency.
// Browser QA separately verifies positioning, focus trapping and actual DOM hit targets.
function host(){
 const listeners={};
 const node={insertAdjacentHTML(_where,html){panel.html+=html;},focus(){}};
 const panel={html:'',children:[],classList:{add(){},remove(){}},
  set innerHTML(html){this.html=html;},get innerHTML(){return this.html;},
  querySelector(sel){return sel==='.room-modal'||sel==='.pg-clock'?null:node;},
  insertAdjacentHTML(_where,html){this.html+=html;},
  addEventListener(name,fn){listeners[name]=fn;},removeEventListener(name){delete listeners[name];},
  click(action){listeners.click({target:{closest(){return {dataset:{pg:action}};}}});}
 };
 return panel;
}
const context={Playground:P,RoomScene,ActivityClock,document:{addEventListener(){},removeEventListener(){}},setInterval(){return 1;},clearInterval(){}};
context.window=context;vm.runInNewContext(fs.readFileSync(__dirname+'/playground-view.js','utf8'),context);
for(const mode of ['fog','wind','locker','pack','photo']){
 const panel=host();let progress;const cleanup=context.PlaygroundView.mount(panel,mode,()=>{},undefined,s=>{progress=s;});
 assert.match(panel.html,/class="room-stage"/,mode+' uses actual shared scene rendering');
 assert.match(panel.html,/data-room-action="bag"/);
 assert.doesNotMatch(panel.html,/pg-controls|pg-inventory/,'no permanent action/inventory list');
 assert.equal(progress.clock.unlimited,true,'time challenge is opt-in');
 if(mode==='photo')assert.match(panel.html,/assets\/photo-studio-cartoon-v2.png/);
 cleanup();
}
const panel=host();let progress;
const cleanup=context.PlaygroundView.mount(panel,'fog',()=>{},undefined,s=>{progress=s;});
panel.click('spot:lens');assert.match(panel.html,/role="dialog"/);
panel.click('close');assert.doesNotMatch(panel.html,/role="dialog"/);
panel.click('spot:cloth');
panel.click('bag');assert.match(panel.html,/내 가방/);
panel.click('select:cloth');assert.doesNotMatch(panel.html,/role="dialog"/,'select closes bag');
assert.equal(progress.game.selected,'cloth');
panel.click('spot:lens');assert.equal(progress.game.wipedLens,true,'use selected cloth on actual scene target');
assert.match(panel.html,/물방울을 닦은 렌즈/);
cleanup();
console.log('shared RoomScene rendering, modal closure, bag-to-target use, opt-in timer passed');
