(function (root) {
  'use strict';

  const MODES = ['fog', 'wind', 'locker', 'pack', 'photo'];
  const CARDINALS = ['north', 'east', 'south', 'west'];
  const windDirections = ['east', 'north', 'east'];
  const cards = [
    { id: 'card-a', time: '09:40', end: 'east' },
    { id: 'card-b', time: '09:45', end: 'south' },
    { id: 'card-c', time: '09:50', end: 'west' },
  ];
  const items = {
    key: '열쇠',
    clip: '집게',
    reacher: '긴 집게',
    cloth: '마른 천',
    box: '기록 상자',
    tape: '녹음테이프',
    notes: '관측 기록',
    ball: '젖은 공',
    'bad-ball': '젖은 공',
    flag: '젖은 깃발',
  };
  const seenIds = {
    fog: ['grass', 'air', 'sky', 'lens'],
    wind: ['store', 'hedge', 'board'],
    locker: cards.map((card) => card.id),
    pack: ['morning', 'forecast', 'ground'],
    photo: ['log', 'photo', 'voice'],
  };
  const allowedInventory = {
    fog: ['cloth'],
    wind: ['key', 'clip', 'reacher', 'cloth', 'box'],
    locker: ['tape'],
    pack: ['cloth', 'box'],
    photo: [],
  };

  function uniqueAllowed(value, allowed) {
    if (!Array.isArray(value)) return [];
    return value.filter((entry, index) =>
      typeof entry === 'string' && allowed.includes(entry) && value.indexOf(entry) === index
    );
  }

  function baseState(mode) {
    return {
      version: 1,
      mode,
      seen: [],
      inventory: mode === 'wind' ? ['key'] : mode === 'pack' ? ['cloth', 'box'] : [],
      selected: '',
      storeOpen: false,
      clean: false,
      windStep: 0,
      paper: false,
      fixed: false,
      dials: ['north', 'north', 'north'],
      lockerOpen: false,
      loaded: false,
      heard: false,
      packed: [],
      closed: false,
      complete: false,
      message: '',
      speaker: '소미',
      wipedLens: false,
      safe: false,
    };
  }

  function hasEvery(state, ids) {
    return ids.every((id) => state.seen.includes(id));
  }

  function isReady(state) {
    if (!state || !MODES.includes(state.mode)) return false;
    if (state.mode === 'fog') {
      return hasEvery(state, ['grass', 'air', 'sky']) && state.wipedLens;
    }
    if (state.mode === 'wind') {
      return state.inventory.includes('clip') && state.inventory.includes('reacher');
    }
    if (state.mode === 'locker') return hasEvery(state, seenIds.locker);
    if (state.mode === 'pack') return state.safe;
    return hasEvery(state, seenIds.photo);
  }

  function initial(mode, saved) {
    if (!MODES.includes(mode)) throw new Error('Unknown playground mode');
    const state = baseState(mode);
    const validSaved = saved && typeof saved === 'object' && saved.mode === mode &&
      (saved.version === undefined || saved.version === 1);
    if (!validSaved) return state;

    state.seen = uniqueAllowed(saved.seen, seenIds[mode]);
    const restoredInventory = uniqueAllowed(saved.inventory, allowedInventory[mode]);
    if (mode === 'wind') state.inventory = ['key', ...restoredInventory.filter((id) => id !== 'key')];
    else if (mode === 'pack') state.inventory = ['cloth', 'box'];
    else state.inventory = restoredInventory;
    state.selected = typeof saved.selected === 'string' && state.inventory.includes(saved.selected)
      ? saved.selected
      : '';
    state.message = typeof saved.message === 'string' ? saved.message : '';
    state.speaker = typeof saved.speaker === 'string' && saved.speaker.trim()
      ? saved.speaker
      : '소미';

    if (mode === 'fog') {
      state.wipedLens = !!saved.wipedLens && state.seen.includes('lens') && state.inventory.includes('cloth');
      state.complete = !!saved.complete && isReady(state);
    } else if (mode === 'wind') {
      state.storeOpen = !!saved.storeOpen;
      if (!state.storeOpen) state.inventory = ['key'];
      if (!state.inventory.includes(state.selected)) state.selected = '';
      state.windStep = Number.isInteger(saved.windStep)
        ? Math.max(0, Math.min(windDirections.length, saved.windStep))
        : 0;
      state.paper = !!saved.paper && state.windStep === windDirections.length &&
        state.inventory.includes('reacher');
      state.fixed = !!saved.fixed && state.paper && state.inventory.includes('clip');
      state.complete = !!saved.complete && state.fixed;
    } else if (mode === 'locker') {
      state.dials = Array.isArray(saved.dials) && saved.dials.length === 3
        ? saved.dials.map((direction) => CARDINALS.includes(direction) ? direction : 'north')
        : ['north', 'north', 'north'];
      const correctDials = state.dials.join(',') === 'west,north,east';
      state.teacherOpened = saved.teacherOpened === true;
      state.lockerOpen = !!saved.lockerOpen && (state.teacherOpened || (hasEvery(state, seenIds.locker) && correctDials));
      if (!state.lockerOpen) state.inventory = [];
      if (!state.inventory.includes(state.selected)) state.selected = '';
      state.loaded = !!saved.loaded && state.lockerOpen && state.inventory.includes('tape');
      state.heard = !!saved.heard && state.loaded;
      state.complete = !!saved.complete && state.heard;
    } else if (mode === 'pack') {
      state.safe = !!saved.safe && hasEvery(state, seenIds.pack);
      state.clean = !!saved.clean;
      state.packed = state.safe && state.clean
        ? uniqueAllowed(saved.packed, ['notes', 'tape'])
        : [];
      state.closed = !!saved.closed && ['notes', 'tape'].every((id) => state.packed.includes(id));
      state.complete = !!saved.complete && state.closed;
    } else {
      state.complete = !!saved.complete && isReady(state);
    }
    return state;
  }

  function respond(state, speaker, message) {
    state.speaker = speaker;
    state.message = message;
    return state;
  }

  function addOnce(list, value) {
    if (!list.includes(value)) list.push(value);
  }

  function selectItem(state, value) {
    if (!state.inventory.includes(value)) {
      return respond(state, '태오', '먼저 그 물건을 찾아서 챙겨야 해.');
    }
    state.selected = value;
    return respond(state, '태오', `${items[value]}을(를) 골랐어. 어디에 쓸까?`);
  }

  function actFog(state, action) {
    if (action.type === 'inspect' && seenIds.fog.includes(action.value)) {
      addOnce(state.seen, action.value);
      if (action.value === 'lens') return respond(state, '하나', '렌즈에도 물방울이 맺혔어. 옆에 마른 천이 있어.');
      if (action.value === 'grass') return respond(state, '소미', '풀잎 표면에 작은 물방울이 붙어 있어.');
      if (action.value === 'air') return respond(state, '소미', '먼 골대 앞 공기 속에 작은 물방울이 떠 있어.');
      return respond(state, '하나', '높은 하늘에는 물방울이 모인 구름이 보여.');
    }
    if (action.type === 'take' && action.value === 'cloth') {
      if (!state.seen.includes('lens')) return respond(state, '하나', '렌즈 가까이를 먼저 살펴보자.');
      addOnce(state.inventory, 'cloth');
      return respond(state, '하나', '렌즈 옆의 마른 천을 챙겼어.');
    }
    if (action.type === 'select') return selectItem(state, action.value);
    if (action.type === 'use' && ['grass', 'air', 'sky'].includes(action.value)) {
      return respond(state, '소미', '밖의 물방울은 렌즈 때가 아니야. 닦아도 운동장의 안개는 사라지지 않아.');
    }
    if (action.type === 'use' && action.value === 'lens') {
      if (state.selected !== 'cloth') return respond(state, '하나', '렌즈를 긁지 않게 마른 천을 골라서 닦자.');
      state.wipedLens = true;
      return respond(state, '하나', '렌즈는 맑아졌는데 먼 골대는 여전히 뿌옇네. 렌즈 밖을 관찰해 보자.');
    }
    if (action.type === 'wait') {
      if (!isReady(state)) return respond(state, '소미', '기다리기 전에 풀잎, 공기, 하늘과 닦은 렌즈를 모두 비교해 보자.');
      state.complete = true;
      return respond(state, '소미', '해가 들자 운동장 안개가 옅어졌어. 렌즈가 아니라 공기 속 물방울이었네.');
    }
    return respond(state, '소미', '지금 살펴볼 수 있는 곳과 가진 물건을 다시 확인해 보자.');
  }

  function actWind(state, action) {
    if (action.type === 'inspect' && seenIds.wind.includes(action.value)) {
      addOnce(state.seen, action.value);
      return respond(state, '은호', '눈에 보이는 위치와 바람의 방향을 함께 기억해 두자.');
    }
    if (action.type === 'select') return selectItem(state, action.value);
    if (action.type === 'use' && action.value === 'store') {
      if (state.selected !== 'key') return respond(state, '은호', '보관장은 잠겨 있어. 맞는 열쇠를 골라 보자.');
      state.storeOpen = true;
      return respond(state, '은호', '열렸다! 순서표를 되찾는 데 필요한 도구를 챙기자.');
    }
    if (action.type === 'take' && ['clip', 'reacher', 'cloth', 'box'].includes(action.value)) {
      if (!state.storeOpen) return respond(state, '은호', '먼저 열쇠로 보관장을 열어야 해.');
      addOnce(state.inventory, action.value);
      return respond(state, '태오', `${items[action.value]}을(를) 챙겼어.`);
    }
    if (action.type === 'direction') {
      if (!isReady(state)) return respond(state, '소미', '종이를 따라가기 전에 긴 집게와 고정할 집게를 챙기자.');
      if (state.windStep >= windDirections.length) return respond(state, '하나', '종이는 동쪽 생울타리에 걸려 있어.');
      const expected = windDirections[state.windStep];
      if (action.value !== expected) return respond(state, '은호', '그쪽에서는 종이가 보이지 않아. 깃발 끝과 종이 움직임을 다시 보자.');
      state.windStep += 1;
      return respond(state, '은호', state.windStep === windDirections.length
        ? '생울타리 안쪽에 순서표가 보여!'
        : '맞아, 이쪽으로 날아간 흔적이 이어져.');
    }
    if (action.type === 'use' && action.value === 'hedge') {
      if (state.windStep !== windDirections.length) return respond(state, '하나', '종이가 어디에 걸렸는지 먼저 따라가 보자.');
      if (state.selected !== 'reacher') return respond(state, '태오', '손을 넣기엔 가시가 많아. 멀리 닿는 도구가 필요해.');
      state.paper = true;
      return respond(state, '하나', '긴 집게로 순서표를 꺼냈어. 이제 다시 날아가지 않게 하자.');
    }
    if (action.type === 'use' && action.value === 'board') {
      if (!state.paper) return respond(state, '소미', '게시판에 붙이기 전에 순서표부터 되찾아야 해.');
      if (state.selected !== 'clip') return respond(state, '소미', '바람에도 버티도록 집게로 단단히 고정하자.');
      state.fixed = true;
      state.complete = true;
      return respond(state, '하나', '순서표를 집게로 고정했어. 이제 이름도 날아가지 않을 거야.');
    }
    return respond(state, '은호', '열쇠와 도구, 바람의 흔적을 차례로 확인해 보자.');
  }

  function actLocker(state, action) {
    if (action.type === 'teacher-open') {
      state.teacherOpened = true;
      state.lockerOpen = true;
      return respond(state, '1999년 담임', '잠금은 풀어 두었다. 방금 녹음한 테이프를 확인하렴. 기억과 다르다면 지우지 말고 내게 가져오고.');
    }
    if (action.type === 'inspect' && seenIds.locker.includes(action.value)) {
      addOnce(state.seen, action.value);
      const card = cards.find((entry) => entry.id === action.value);
      return respond(state, '소미', `${card.time} 관측 스케치에서 깃발 끝은 ${itemsDirection(card.end)}쪽을 향해.`);
    }
    if (action.type === 'dial') {
      if (state.lockerOpen) return state;
      const value = action.value;
      if (!value || !Number.isInteger(value.index) || value.index < 0 || value.index > 2 ||
          !CARDINALS.includes(value.direction)) {
        return respond(state, '소미', '세 방향 다이얼 중 하나를 동서남북으로 돌려 보자.');
      }
      state.dials[value.index] = value.direction;
      return respond(state, '태오', `${value.index + 1}번째 다이얼을 돌렸어.`);
    }
    if (action.type === 'unlock') {
      if (!isReady(state)) return respond(state, '소미', '사진 카드 세 장을 모두 살펴본 뒤 방향을 연결하자.');
      if (state.dials.join(',') !== 'west,north,east') {
        return respond(state, '은호', '잠금장치가 움직이지 않아. 깃발 끝과 바람이 불어온 방향을 구분해 보자.');
      }
      state.lockerOpen = true;
      return respond(state, '은호', '보관함이 열렸어. 안에 작은 녹음테이프가 있어.');
    }
    if (action.type === 'take' && action.value === 'tape') {
      if (!state.lockerOpen) return respond(state, '하나', '녹음테이프는 잠긴 보관함 안에 있어.');
      addOnce(state.inventory, 'tape');
      return respond(state, '하나', '녹음테이프를 꺼냈어. 재생기에 넣어 보자.');
    }
    if (action.type === 'select') return selectItem(state, action.value);
    if (action.type === 'use' && action.value === 'recorder') {
      if (state.selected !== 'tape') return respond(state, '태오', '재생할 녹음테이프를 먼저 골라야 해.');
      state.loaded = true;
      return respond(state, '하나', '테이프를 넣었어. 이제 재생 버튼을 누르면 돼.');
    }
    if (action.type === 'play') {
      if (!state.loaded) return respond(state, '하나', '재생기에 테이프가 들어 있지 않아.');
      state.heard = true;
      state.complete = true;
      return respond(state, '은호', '분명 하나의 목소리야. 순서표에서 지워진 이름이 녹음에는 남아 있어!');
    }
    return respond(state, '소미', '사진 카드와 방향 다이얼, 녹음기를 차례로 확인해 보자.');
  }

  function itemsDirection(direction) {
    return { north: '북', east: '동', south: '남', west: '서' }[direction];
  }

  function actPack(state, action) {
    if (action.type === 'inspect' && seenIds.pack.includes(action.value)) {
      addOnce(state.seen, action.value);
      return respond(state, '소미', '아침 기록, 새 예보, 지금 운동장 상태를 따로 확인했어.');
    }
    if (action.type === 'plan') {
      if (!hasEvery(state, seenIds.pack)) return respond(state, '소미', '정하기 전에 세 가지 날씨 기록을 모두 확인하자.');
      if (action.value !== 'inside') return respond(state, '소미', '지금은 바닥이 젖고 바람도 세졌어. 안전한 장소를 다시 골라 보자.');
      state.safe = true;
      return respond(state, '선생님', '야외 활동을 멈추고 강당으로 옮기자. 중요한 기록도 함께 챙기렴.');
    }
    if (action.type === 'select') return selectItem(state, action.value);
    if (action.type === 'use' && action.value === 'box') {
      if (state.selected !== 'cloth') return respond(state, '하나', '젖은 상자에 기록을 넣을 수는 없어. 닦을 것을 골라 보자.');
      state.clean = true;
      return respond(state, '하나', '마른 천으로 상자 안의 물기를 닦았어.');
    }
    if (action.type === 'pack') {
      if (!state.safe) return respond(state, '선생님', '먼저 모두가 이동할 안전한 장소를 정하자.');
      if (!state.clean) return respond(state, '하나', '상자 안이 아직 젖었어. 종이를 넣기 전에 말려야 해.');
      if (!['notes', 'tape'].includes(action.value)) {
        return respond(state, '태오', '젖은 운동 도구보다 하나의 기록을 먼저 지키자.');
      }
      addOnce(state.packed, action.value);
      return respond(state, '하나', `${items[action.value]}을(를) 상자에 넣었어.`);
    }
    if (action.type === 'close') {
      if (!['notes', 'tape'].every((id) => state.packed.includes(id))) {
        return respond(state, '소미', '관측 기록과 녹음테이프를 모두 넣었는지 확인하자.');
      }
      state.closed = true;
      state.complete = true;
      return respond(state, '선생님', '상자를 닫았구나. 이제 기록과 함께 강당으로 이동하자.');
    }
    return respond(state, '소미', '날씨를 확인하고 안전한 계획을 세운 뒤 기록을 챙기자.');
  }

  function actPhoto(state, action) {
    if (action.type === 'inspect' && seenIds.photo.includes(action.value)) {
      addOnce(state.seen, action.value);
      return respond(state, action.value === 'voice' ? '은호' : '소미', '사진과 날씨 기록이 같은 순간을 가리키는지 살펴보자.');
    }
    if (action.type === 'connect') {
      if (!isReady(state)) return respond(state, '소미', '사진, 날씨 기록, 녹음 내용을 모두 확인해야 연결할 수 있어.');
      const value = action.value;
      const correct = value && value.photo === 'finish' && value.wind === 'north' &&
        value.rain === 'dry' && value.time === '10:20';
      if (!correct) return respond(state, '소미', '한 기록만 맞아도 부족해. 깃발 끝, 빗방울, 녹음과 시각을 모두 연결해 보자.');
      state.complete = true;
      return respond(state, '은호', '결승선 사진은 북풍이 불고 비가 오기 전인 10시 20분에 찍혔어!');
    }
    return respond(state, '소미', '서로 다른 세 기록을 하나씩 펼쳐 보자.');
  }

  function act(previous, action) {
    if (!previous || !MODES.includes(previous.mode)) throw new Error('Invalid playground state mode');
    const state = initial(previous.mode, previous);
    if (state.complete) return state;
    const safeAction = action && typeof action === 'object' ? action : {};
    if (state.mode === 'fog') return actFog(state, safeAction);
    if (state.mode === 'wind') return actWind(state, safeAction);
    if (state.mode === 'locker') return actLocker(state, safeAction);
    if (state.mode === 'pack') return actPack(state, safeAction);
    return actPhoto(state, safeAction);
  }

  const api = { initial, act, ready: isReady, cards, items, windDirections };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.Playground = api;
})(typeof window === 'undefined' ? globalThis : window);
