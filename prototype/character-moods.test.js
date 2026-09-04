"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const { getCharacterMood, CHARACTER_MOODS } = require("./character-moods.js");

assert.equal(getCharacterMood("storage-1", "taeo"), "happy");
assert.equal(getCharacterMood("tape-path-teacher", "taeo"), "fear");
assert.equal(getCharacterMood("phone-path-organizer", "taeo"), "worried");
assert.equal(getCharacterMood("eunho-first", "eunho"), "angry");
assert.equal(getCharacterMood("eunho-tease", "eunho"), "happy");
assert.equal(getCharacterMood("phone-path-future", "somi"), "fear");
assert.equal(getCharacterMood("school-name", "teacher"), "surprised");
assert.equal(getCharacterMood("unknown-scene", "somi"), "normal");

for (const [character, moods] of Object.entries(CHARACTER_MOODS)) {
  for (const mood of moods) {
    const asset = path.join(__dirname, "assets", "characters", character, `${mood}.png`);
    assert.equal(fs.existsSync(asset), true, `${character}/${mood}.png 이미지가 필요합니다.`);
  }
}

console.log("장면별 감정 이미지 규칙 테스트 통과");
