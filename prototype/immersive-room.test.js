const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=f=>fs.readFileSync(__dirname+'/'+f,'utf8');
const view=read('hana-search-view.js');
assert.ok(view.includes("if(s.talk&&!host.querySelector('.room-modal')"),'dialogue surface excludes modal interaction');
assert.ok(view.includes("e.key==='Enter'"),'keyboard can advance');
const css=read('immersive-room.css');
assert.match(css,/\.room-panel \.room-stage\s*\{[^}]*inset:0!important/s);
// CSS smoke check only; rendered coverage and aspect ratio are checked in-browser.
assert.match(css,/\.room-panel \.room-picture\s*\{[^}]*width:max\(100cqw,/s);
assert.ok(read('index.html').includes('immersive-room.css'));
console.log('Immersive room layout and dialogue input regression passed');
