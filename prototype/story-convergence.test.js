"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");
const styles = fs.readFileSync(path.join(__dirname, "styles.css"), "utf8");
const choiceLines = source.split(/\r?\n/).filter((line) => line.includes("{ text:"));
const choiceSceneCount = (source.match(/^\s+choices: \[/gm) || []).length;
const commonNextCount = (source.match(/^\s+next: "[^"]+",\r?\n\s+choices: \[/gm) || []).length;

assert.equal(
  choiceLines.some((line) => line.includes("next:")),
  false,
  "각 선택지가 서로 다른 스토리 경로를 가지면 안 됩니다."
);

assert.equal(
  commonNextCount,
  choiceSceneCount,
  "모든 선택 장면에는 하나의 공통 next가 있어야 합니다."
);

assert.equal(
  choiceLines.every((line) => line.includes("feedbackSpeaker:")),
  true,
  "모든 선택 반응에는 누가 말하거나 생각하는지 명시해야 합니다."
);

assert.match(
  source,
  /function setDialogue\(speaker, text, type = "speech"\)/,
  "말과 생각을 다른 스타일로 표시할 수 있어야 합니다."
);

const assetUrls = Array.from(styles.matchAll(/url\("(assets\/[^"]+)"\)/g), (match) => match[1]);
for (const assetUrl of assetUrls) {
  assert.equal(fs.existsSync(path.join(__dirname, assetUrl)), true, `${assetUrl} 파일을 불러올 수 있어야 합니다.`);
}
assert.ok(new Set(assetUrls.filter((url) => url.includes("v3"))).size >= 4, "장면별로 서로 다른 어두운 배경을 사용해야 합니다.");

assert.match(
  source,
  /dom\.dialogue\.classList\.toggle\("thought", type === "thought"\)/,
  "속마음 대사에는 생각 말풍선 스타일을 적용해야 합니다."
);

assert.doesNotMatch(
  source,
  /speaker \|\| "기록"/,
  "화자가 없는 장면을 '기록'으로 표시하면 안 됩니다."
);

assert.doesNotMatch(
  source,
  /feedbackSpeaker: "내 생각"/,
  "주인공의 속마음을 '내 생각'이라는 고정 이름표로 표시하면 안 됩니다."
);

assert.match(
  source,
  /feedbackSpeaker: \(\) => state\.playerName, feedbackType: "thought"/,
  "속마음 이름표에는 플레이어가 입력한 주인공 이름을 사용해야 합니다."
);

assert.match(
  source,
  /const resolvedSpeaker = resolve\(speaker\) \|\| "상황";/,
  "대화창은 함수로 지정된 동적 이름표를 해석해야 합니다."
);

assert.match(
  source,
  /const destination = choice\.branch \|\| choice\.next \|\| scene\.next;/,
  "중요 선택은 짧은 고유 경로를 거치고, 나머지는 공통 next로 합류해야 합니다."
);

const branchLines = choiceLines.filter((line) => line.includes("branch:"));
assert.equal(
  branchLines.length,
  9,
  "중요 선택 3곳의 각 3개 답안에만 짧은 고유 경로가 있어야 합니다."
);

for (const joinScene of ["play-tape", "eunho-first", "teacher-slip"]) {
  const joinCount = (source.match(new RegExp(`next: "${joinScene}"`, "g")) || []).length;
  assert.ok(joinCount >= 4, `${joinScene}으로 다시 합류하는 경로가 부족합니다.`);
}

assert.match(
  source,
  /pendingNext = destination;[\s\S]*?setDialogue\(feedbackSpeaker, choice\.feedback, choice\.feedbackType \|\| "speech"\);/,
  "선택 결과는 상단 알림이 아니라 대화창에 보여 줘야 합니다."
);

assert.match(
  source,
  /if \(pendingNext\) \{[\s\S]*?renderScene\(destination\);[\s\S]*?return;/,
  "선택 반응을 읽고 대화창을 한 번 더 눌러야 공통 장면으로 진행해야 합니다."
);

assert.doesNotMatch(
  source,
  /toast\(choice\.feedback\)/,
  "선택 반응을 상단 알림으로 표시하면 안 됩니다."
);

console.log("선택지 합류 규칙 테스트 통과");
