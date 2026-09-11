const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const lab=require('./liquid-labs.js');

let oil=lab.oilState();
assert.equal(oil.waterLoaded,false);
oil=lab.oilStep(oil,'add-water');
assert.equal(oil.waterLoaded,true);
assert.equal(oil.oilLoaded,false);
oil=lab.oilStep(oil,'add-oil');
assert.equal(oil.oilLoaded,true);
assert.equal(oil.settled,true);

const source=fs.readFileSync(path.join(__dirname,'liquid-labs.js'),'utf8');
assert.ok(source.includes("page='experiment'"));
assert.ok(!source.includes('cabinetCode'),'숫자 231 문제 상자 제거');
assert.ok(source.includes('water-added'));

const story=fs.readFileSync(path.join(__dirname,'app.js'),'utf8');
assert.ok(story.includes('"oil-answer"'));
assert.ok(story.includes('next:"oil-answer"'));

console.log('기억 대사 분리·액체 붓기·작업대 조사·보관함 암호 흐름 통과');
