const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
for (const id of ['newGameDialog', 'chapterDialog', 'btnNewGame', 'btnChapters', 'playerName', 'btnStart', 'btnContinue']) {
  assert.equal((html.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1, id);
}
assert.match(html, /<dialog id="chapterDialog"/);
assert.match(html, /<dialog id="newGameDialog"/);
const chapter = require('./chapter2.js').build();
for (const scene of Object.values(chapter)) {
  if (scene.speaker === '윤하나') {
    assert.ok(scene.chars.includes('hana'));
    assert.equal(scene.active, 'hana');
  }
}
assert.ok(!chapter['chapter2-start'].chars.includes('hana'));
console.log('Title menu and Hana scene tests passed');
