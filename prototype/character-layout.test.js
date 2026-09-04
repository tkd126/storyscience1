"use strict";

const assert = require("node:assert/strict");
const { planCharacterLayout } = require("./character-layout.js");

assert.deepEqual(
  planCharacterLayout(["taeo"], "taeo"),
  [{ id: "taeo", position: "center", role: "active", shot: "close" }],
  "한 명만 등장하면 중앙 클로즈업이어야 합니다."
);

assert.deepEqual(
  planCharacterLayout(["taeo", "somi"], "somi"),
  [
    { id: "taeo", position: "left", role: "support", shot: "medium" },
    { id: "somi", position: "right", role: "active", shot: "close" }
  ],
  "두 명은 좌우로 나뉘고 말하는 인물만 앞으로 나와야 합니다."
);

assert.deepEqual(
  planCharacterLayout(["teacher", "taeo", "somi"], "teacher"),
  [
    { id: "teacher", position: "left", role: "active", shot: "close" },
    { id: "taeo", position: "center", role: "support", shot: "medium" },
    { id: "somi", position: "right", role: "support", shot: "medium" }
  ],
  "세 명은 좌·중앙·우에 배치되어야 합니다."
);

assert.deepEqual(planCharacterLayout([], ""), [], "등장인물이 없는 장면은 배경만 보여야 합니다.");

console.log("미연시 인물 배치 규칙 테스트 통과");
