const assert = require('node:assert/strict');
const P = require('./playground.js');
const source = require('node:fs').readFileSync(require.resolve('./playground.js'), 'utf8');
assert.doesNotMatch(source, /바통|경기 전|4번, 출발|체육대회/);
assert.match(source, /소개 원고 받아/);

function act(state, type, value) {
  return P.act(state, { type, value });
}

function inspectAll(state, ids) {
  return ids.reduce((next, id) => act(next, 'inspect', id), state);
}

(function exportsStableUiData() {
  assert.deepEqual(P.windDirections, ['east', 'north', 'east']);
  assert.deepEqual(P.cards, [
    { id: 'card-a', time: '09:40', end: 'east' },
    { id: 'card-b', time: '09:45', end: 'south' },
    { id: 'card-c', time: '09:50', end: 'west' },
  ]);
  assert.equal(P.items.reacher, '긴 집게');
})();

(function returnsFreshBaseStateAndRejectsUnknownModes() {
  const first = P.initial('photo');
  const second = P.act(first, { type: 'unknown' });
  assert.notEqual(second, first);
  assert.deepEqual(first.dials, ['north', 'north', 'north']);
  assert.equal(first.speaker, '소미');
  assert.equal(first.version, 2);
  assert.throws(() => P.initial('quiz'), /mode/i);
})();

(function fogNeedsOutdoorObservationsAndAWipedLens() {
  let state = P.initial('fog');
  state = act(state, 'inspect', 'lens');
  state = act(state, 'take', 'cloth');
  state = act(state, 'select', 'cloth');
  state = act(state, 'use', 'air');
  assert.equal(state.wipedLens, false, 'cloth cannot wipe away fog in the air');
  assert.equal(state.selected, 'cloth');
  state = act(state, 'use', 'lens');
  assert.equal(state.wipedLens, true);
  state = act(state, 'wait');
  assert.equal(state.complete, false, 'waiting early must not complete');
  state = inspectAll(state, ['grass', 'air', 'sky']);
  assert.equal(P.ready(state), true);
  for (const [value, answer] of [['dew', '이슬'], ['fog', '안개'], ['cloud', '구름']]) {
    state = P.act(state, { type: 'answer-weather', value, answer });
  }
  state = act(state, 'wait');
  assert.equal(state.complete, true);
})();

(function fogConceptsRequireObservedEvidenceAndTypedAnswers() {
  let state = P.initial('fog');
  assert.deepEqual(state.weatherConcepts, { dew: false, fog: false, cloud: false });
  state = P.act(state, { type: 'answer-weather', value: 'dew', answer: '이슬' });
  assert.equal(state.weatherConcepts.dew, false, '풀잎을 보기 전에는 용어만 맞혀도 통과하지 않는다');

  state = act(state, 'inspect', 'grass');
  state = P.act(state, { type: 'answer-weather', value: 'dew', answer: '물' });
  assert.equal(state.weatherConcepts.dew, false, '오답은 같은 관찰에서 다시 시도한다');
  assert.match(state.message, /풀잎|물방울/);
  state = P.act(state, { type: 'answer-weather', value: 'dew', answer: '  이슬  ' });
  assert.equal(state.weatherConcepts.dew, true, '앞뒤 공백을 무시하고 이슬을 기록한다');

  state = inspectAll(state, ['air', 'sky', 'lens']);
  state = act(state, 'take', 'cloth');
  state = act(state, 'select', 'cloth');
  state = act(state, 'use', 'lens');
  state = P.act(state, { type: 'answer-weather', value: 'fog', answer: '안개' });
  state = act(state, 'wait');
  assert.equal(state.complete, false, '구름 설명 전에는 다음 이야기로 합류하지 않는다');
  state = P.act(state, { type: 'answer-weather', value: 'cloud', answer: '구름' });
  assert.equal(P.weatherConceptsReady(state), true);
  state = act(state, 'wait');
  assert.equal(state.complete, true, '세 개념을 직접 설명하면 자동 합류 조건을 만족한다');

  const restored = P.initial('fog', JSON.parse(JSON.stringify(state)));
  assert.deepEqual(restored.weatherConcepts, { dew: true, fog: true, cloud: true });
})();

(function windRequiresOpeningTheStoreAndKeepsProgressOnMistakes() {
  let state = P.initial('wind');
  assert.deepEqual(state.inventory, []);
  state = act(state, 'take', 'clip');
  assert.deepEqual(state.inventory, [], 'closed store must not yield tools');
  state = act(state, 'teacher-permission');
  state = act(state, 'select', 'key');
  state = act(state, 'use', 'store');
  assert.equal(state.storeOpen, true);
  for (const item of ['clip', 'reacher', 'cloth', 'box', 'clip']) {
    state = act(state, 'take', item);
  }
  assert.equal(state.inventory.filter((item) => item === 'clip').length, 1);
  assert.equal(P.ready(state), true);
  state = act(state, 'select', 'clip');
  state = act(state, 'use', 'board');
  state = act(state, 'gust');
  state = act(state, 'inspect', 'flag');
  state = act(state, 'direction', 'east');
  assert.equal(state.windStep, 1);
  state = act(state, 'direction', 'west');
  assert.equal(state.windStep, 1, 'wrong direction must preserve progress');
  state = act(state, 'inspect', 'flag');state = act(state, 'direction', 'north');
  state = act(state, 'inspect', 'flag');state = act(state, 'direction', 'east');
  state = act(state, 'select', 'clip');
  state = act(state, 'use', 'board');
  assert.equal(state.complete, false, 'paper must be recovered before fixing');
  state = act(state, 'select', 'reacher');
  state = act(state, 'use', 'hedge');
  assert.equal(state.paper, true);
  state = act(state, 'select', 'clip');
  state = act(state, 'use', 'board');
  assert.equal(state.fixed, true);
  assert.equal(state.complete, true);
})();

(function windDirectionCannotAdvanceBeforeBothToolsAreReady() {
  const state = act(P.initial('wind'), 'direction', 'east');
  assert.equal(state.windStep, 0);
})();

(function lockerGuardsUnlockTapeAndPlaybackInOrder() {
  let state = P.initial('locker');
  assert.equal(act(state, 'play').heard, false);
  state = inspectAll(state, ['card-a', 'card-b', 'card-c']);
  state = act(state, 'dial', { index: 0, direction: 'west' });
  state = act(state, 'dial', { index: 1, direction: 'up' });
  assert.equal(state.dials[1], 'north', 'non-cardinal dial values are rejected');
  state = act(state, 'dial', { index: 1, direction: 'north' });
  state = act(state, 'dial', { index: 2, direction: 'east' });
  state = act(state, 'unlock');
  assert.equal(state.lockerOpen, true);
  state = act(state, 'take', 'tape');
  state = act(state, 'use', 'recorder');
  assert.equal(state.loaded, false, 'the tape must be selected before use');
  state = act(state, 'select', 'tape');
  state = act(state, 'use', 'recorder');
  state = act(state, 'play');
  assert.equal(state.loaded, true);
  assert.equal(state.heard, true);
  assert.equal(state.complete, true);
})();

(function lockerDoesNotOpenWithoutEveryCardOrTheExactDirections() {
  let state = inspectAll(P.initial('locker'), ['card-a', 'card-b']);
  state = act(state, 'dial', { index: 0, direction: 'west' });
  state = act(state, 'dial', { index: 1, direction: 'north' });
  state = act(state, 'dial', { index: 2, direction: 'east' });
  assert.equal(act(state, 'unlock').lockerOpen, false);
  state = act(state, 'inspect', 'card-c');
  state = act(state, 'dial', { index: 2, direction: 'south' });
  assert.equal(act(state, 'unlock').lockerOpen, false);
})();

(function packingNeedsEvidenceSafetyAndACleanBox() {
  let state = P.initial('pack');
  assert.deepEqual(state.inventory, ['cloth', 'box', 'notes', 'tape']);
  state = act(state, 'plan', 'inside');
  assert.equal(state.safe, true, 'the teacher already stopped the event before packing');
  state = inspectAll(state, ['morning', 'forecast', 'ground']);
  state = act(state, 'plan', 'outside');
  assert.equal(state.safe, true, 'an unsafe suggestion cannot undo the teacher decision');
  state = act(state, 'plan', 'inside');
  assert.equal(P.ready(state), true);
  state = act(state, 'pack', 'notes');
  assert.deepEqual(state.packed, [], 'dirty box must not accept records');
  state = act(state, 'select', 'cloth');
  state = act(state, 'use', 'box');
  assert.equal(state.clean, true);
  for (const item of ['ball', 'flag', 'notes', 'notes', 'tape']) {
    state = act(state, 'pack', item);
  }
  assert.deepEqual(state.packed, ['notes', 'tape']);
  state = act(state, 'close');
  assert.equal(state.closed, true);
  assert.equal(state.complete, true);
})();

(function photoNeedsAllEvidenceAndTheCompleteConnection() {
  let state = P.initial('photo');
  state = act(state, 'connect', {
    photo: 'finish', wind: 'north', rain: 'dry', time: '10:20',
  });
  assert.equal(state.complete, false);
  state = inspectAll(state, ['log', 'photo', 'voice']);
  assert.equal(P.ready(state), true);
  state = act(state, 'connect', {
    photo: 'finish', wind: 'north', rain: 'wet', time: '10:20',
  });
  assert.equal(state.complete, false, 'wrong evidence connection stays open');
  state = act(state, 'connect', {
    photo: 'finish', wind: 'north', rain: 'dry', time: '10:20',
  });
  assert.equal(state.complete, true);
})();

(function restoreSanitizesValuesAndImpossibleProgress() {
  const wind = P.initial('wind', {
    version: 1,
    mode: 'wind',
    seen: ['hedge', 'hedge', 'invalid'],
    inventory: ['key', 'clip', 'clip', 'invalid'],
    selected: 'invalid',
    windStep: 90,
    paper: true,
    fixed: true,
    complete: true,
    dials: ['west'],
    message: 7,
    speaker: null,
  });
  assert.deepEqual(wind.seen, ['hedge']);
  assert.deepEqual(wind.inventory, ['key']);
  assert.equal(wind.selected, '');
  assert.equal(wind.windStep, 3);
  assert.equal(wind.paper, false, 'paper without a reacher is impossible');
  assert.equal(wind.fixed, false);
  assert.equal(wind.complete, false);
  assert.deepEqual(wind.dials, ['north', 'north', 'north']);

  const wrongMode = P.initial('fog', { mode: 'wind', complete: true, wipedLens: true });
  assert.equal(wrongMode.complete, false);
  assert.equal(wrongMode.wipedLens, false);
})();

(function completionIsImmutable() {
  let state = inspectAll(P.initial('photo'), ['log', 'photo', 'voice']);
  state = act(state, 'connect', {
    photo: 'finish', wind: 'north', rain: 'dry', time: '10:20',
  });
  const after = act(state, 'inspect', 'not-real');
  assert.notEqual(after, state);
  assert.deepEqual(after, state);
})();

console.log('playground tests passed');
