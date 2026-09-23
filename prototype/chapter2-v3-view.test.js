const assert=require('node:assert/strict');
const V=require('./chapter2-v3-view');
assert.equal(typeof V.canInspect,'function','배경 조작 가능 여부를 공통으로 판단해야 함');
assert.equal(V.canInspect({dialogue:[],question:'',lab:null}),true);
assert.equal(V.canInspect({dialogue:[],question:'sea',lab:null}),false);
assert.equal(V.canInspect({dialogue:[],question:'',lab:{kind:'mass'}}),false);
assert.equal(V.canInspect({dialogue:[{speaker:'소미',text:'잠깐.'}],question:'',lab:null}),false);
let callback,cleared=0,text='';
const t=V.typeLine('하나야',v=>text=v,{set:f=>(callback=f,1),clear:()=>cleared++});
assert.equal(text,'');callback();assert.equal(text,'하');assert.equal(t.finish(),true);assert.equal(text,'하나야');assert.equal(t.finish(),false);t.dispose();assert.ok(cleared>0);
console.log('타이핑 첫 클릭 완성·둘째 클릭 진행·타이머 정리 통과');
// Browser timer functions reject being invoked with the clock object as receiver.
const vm=require('node:vm'),fs=require('node:fs');
let timerCallback;
const context=vm.createContext({module:{exports:{}},setInterval:f=>(timerCallback=f,7),clearInterval:function(id){'use strict';assert.equal(this,undefined);assert.equal(id,7);}});
vm.runInContext(fs.readFileSync(__dirname+'/chapter2-v3-view.js','utf8'),context);
const browserTyping=context.module.exports.typeLine('가',()=>{});timerCallback();browserTyping.dispose();
