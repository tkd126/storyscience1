"use strict";

const $ = (selector) => document.querySelector(selector);

const dom = {
  background: $("#background"),
  scanlines: $("#scanlines"),
  glitch: $("#glitch"),
  hud: $("#hud"),
  date: $("#dateChip"),
  time: $("#timeChip"),
  title: $("#titleScreen"),
  story: $("#storyScreen"),
  ending: $("#endingScreen"),
  playerName: $("#playerName"),
  btnStart: $("#btnStart"),
  btnContinue: $("#btnContinue"),
  sceneLabel: $("#sceneLabel"),
  propArea: $("#propArea"),
  characters: $("#characters"),
  choices: $("#choiceArea"),
  dialogue: $("#dialogue"),
  speaker: $("#speaker"),
  line: $("#line"),
  logPanel: $("#logPanel"),
  logList: $("#logList"),
  toast: $("#toast"),
  endingSummary: $("#endingSummary"),
  endingBadges: $("#endingBadges"),
};

const SAVE_KEY = "science1999PracticeSaveV1";

const initialState = () => ({
  playerName: "지우",
  scene: "storage-1",
  suspicion: 0,
  trust: { taeo: 0, somi: 0, eunho: 0 },
  flags: {
    watchedCarefully: false,
    tookTape: false,
    heldHands: false,
    hidPhone: false,
    toldSchoolName: false,
    noticedHana: false,
  },
  log: [],
  sound: true,
});

let state = initialState();
let typingTimer = null;
let currentLineDone = true;
let pendingNext = null;
let audioContext = null;

const cast = {
  taeo: { name: "태오", className: "char-taeo" },
  somi: { name: "소미", className: "char-somi" },
  eunho: { name: "은호", className: "char-eunho" },
  teacher: { name: "1999년 담임", className: "char-teacher" },
};

const scenes = {
  "storage-1": {
    label: "현재 · 과학실 창고",
    mode: "present",
    chars: ["taeo", "somi"], active: "taeo",
    speaker: "태오",
    line: "와, 여기 진짜 보물창고다. 비디오테이프에... 카세트에... 이건 설마 삐삐야?",
    next: "storage-2",
  },
  "storage-2": {
    label: "현재 · 과학실 창고",
    mode: "present",
    chars: ["taeo", "somi"], active: "somi",
    speaker: "소미",
    line: "보물이 아니라 먼지야. 잠깐, 이 상자에 우리 학교 이름이 적혀 있어.",
    prop: "tape",
    next: "tape-choice",
  },
  "tape-choice": {
    prop: "tape",
    label: "낡은 비디오테이프",
    mode: "present",
    chars: ["taeo", "somi"], active: "",
    speaker: "",
    line: "누렇게 바랜 라벨에는 '1999년 5학년 3반 - 2000년이 되기 전에 꼭 볼 것'이라고 적혀 있다.",
    next: "play-tape",
    choices: [
      { text: "라벨과 테이프 상태를 자세히 살펴본다.", branch: "tape-path-observe", feedbackSpeaker: () => state.playerName, feedbackType: "thought", feedback: "'강은호 외 3명'... 은호는 영상 속 아이일까?", effect: () => { state.flags.watchedCarefully = true; state.trust.somi += 1; addLog("단서", "테이프 라벨 아래에 희미하게 '강은호 외 3명'이라고 적혀 있다."); } },
      { text: "일단 재생해 본다. 답은 영상 안에 있을 것이다.", branch: "tape-path-play", feedbackSpeaker: "태오", feedback: "좋아, 재생한다! 답은 영상 안에 있을 거야.", effect: () => { state.trust.taeo += 1; } },
      { text: "선생님께 먼저 보여 드리자고 한다.", branch: "tape-path-teacher", feedbackSpeaker: "소미", feedback: "문이 잠겼어... 결국 우리가 확인해야 하나 봐.", effect: () => { state.trust.somi += 1; addLog("생각", "선생님을 부르러 가려는 순간 과학실 문이 저절로 잠겼다."); } },
    ],
  },
  "tape-path-observe": {
    label: "낡은 테이프의 단서", mode: "present", chars: ["taeo", "somi"], active: "somi", speaker: "소미",
    line: "라벨 뒷면에 연필로 '네 번째 종'이라고 적혀 있어. 이건 기억해 두자.", prop: "tape", next: "play-tape",
  },
  "tape-path-play": {
    label: "멈춘 비디오", mode: "present", chars: ["taeo", "somi"], active: "taeo", speaker: "태오",
    line: "어? 테이프가 한 번 튀어나왔어. 다시 넣으니까... 이제 돌아간다!", prop: "tape", next: "play-tape",
  },
  "tape-path-teacher": {
    label: "잠긴 과학실", mode: "present", chars: ["taeo", "somi"], active: "taeo", speaker: "태오",
    line: "문 너머에는 아무도 없어. 그런데 누가 '재생해'라고 말한 거지?", next: "play-tape",
  },
  "play-tape": {
    label: "재생 중 · 1999.12.31",
    mode: "video",
    scanlines: true,
    chars: [],
    speaker: "화면 속 아이",
    line: "치지직... 들려? 내 이름은 강은호야. 그리고 이 영상을 보고 있는 건...",
    prop: "screen",
    next: "name-reveal",
  },
  "name-reveal": {
    label: "재생 중 · 1999.12.31",
    mode: "video",
    scanlines: true,
    chars: [],
    speaker: "어린 은호",
    line: () => `${state.playerName}, 태오, 소미. 너희 셋이 맞지? 시간이 없어. 잘 들어.`,
    prop: "screen",
    glitch: true,
    next: "reaction-choice",
  },
  "reaction-choice": {
    label: "현재 · 과학실",
    mode: "video",
    scanlines: true,
    chars: ["taeo", "somi"], active: "taeo",
    speaker: "태오",
    line: () => `방금... 화면 속 애가 ${state.playerName} 네 이름을 부른 거 맞지?`,
    next: "warning",
    choices: [
      { text: "영상을 멈추고 화면 속 단서를 확인한다.", feedbackSpeaker: "소미", feedback: "잠깐! 칠판에 1999년 12월 31일이라고 적혀 있어.", effect: () => { state.flags.watchedCarefully = true; state.trust.somi += 1; addLog("단서", "칠판에는 1999년 12월 31일, 책상 위에는 얼굴이 번진 사진이 있다."); } },
      { text: "끝까지 봐야 해. 계속 재생한다.", feedbackSpeaker: "태오", feedback: "그래, 끝까지 보자. 분명 더 할 말이 있을 거야.", effect: () => { state.trust.taeo += 1; } },
      { text: "누가 우리를 놀리는 거라고 말한다.", feedbackSpeaker: () => state.playerName, feedbackType: "thought", feedback: "장난이라기엔 우리 이름을 너무 정확히 알고 있어.", effect: () => { state.suspicion += 1; } },
    ],
  },
  "warning": {
    label: "재생 중 · 1999.12.31",
    mode: "video",
    scanlines: true,
    chars: [],
    speaker: "어린 은호",
    line: "12월 31일 밤 12시. 학교 종이 네 번 울리기 전에 하나를 찾아. 그리고 무슨 일이 있어도 마지막 종은...",
    prop: "screen",
    next: "blackout",
  },
  "blackout": {
    label: "현재 · 오후 4:44",
    mode: "blackout",
    chars: [],
    speaker: "",
    line: "툭. 영상이 끊기고 과학실의 모든 불이 꺼졌다. 어둠 속에서 학교 종이 울린다. 뎅-.",
    glitch: true,
    next: "bell-choice",
  },
  "bell-choice": {
    label: "두 번째 종이 울리기 전",
    mode: "blackout",
    chars: ["taeo", "somi"], active: "somi",
    speaker: "소미",
    line: () => `${state.playerName}! 바닥이 흔들려. 뭔가 해야 해!`,
    next: "bells",
    choices: [
      { text: "비디오테이프를 챙긴다.", feedbackSpeaker: () => state.playerName, feedbackType: "thought", feedback: "이 테이프를 놓치면 안 돼!", effect: () => { state.flags.tookTape = true; addLog("소지품", "1999년 비디오테이프를 챙겼다."); } },
      { text: "태오와 소미의 손을 잡는다.", feedbackSpeaker: "소미", feedback: "절대 손 놓지 마! 같이 있어야 해!", effect: () => { state.flags.heldHands = true; state.trust.taeo += 1; state.trust.somi += 1; } },
      { text: "과학실 문을 힘껏 두드린다.", feedbackSpeaker: "의문의 목소리", feedback: "늦었어...", effect: () => { state.suspicion += 1; addLog("기억", "문 너머에서 누군가 '늦었어'라고 속삭였다."); } },
    ],
  },
  "bells": {
    label: "시간 불명",
    mode: "blackout",
    chars: [],
    speaker: "",
    line: "뎅-. 두 번째 종. 교실 바닥이 나무로 바뀐다. 뎅-. 세 번째 종. 먼지 냄새가 분필 냄새로 변한다. 그리고 네 번째 종이 울렸다.",
    glitch: true,
    next: "past-wake",
  },
  "past-wake": {
    label: "1999년 12월 28일 화요일",
    mode: "past",
    date: "1999년 12월 28일",
    time: "오전 9:10",
    chars: ["teacher", "taeo", "somi"], active: "teacher",
    speaker: "1999년 담임",
    line: () => `자, 조용. 오늘부터 우리 반에서 함께 지낼 전학생들이란다. ${state.playerName}, 태오, 소미. 인사하렴.`,
    next: "intro-choice",
  },
  "intro-choice": {
    label: "1999년 · 5학년 3반",
    mode: "past",
    chars: ["teacher", "taeo", "somi"], active: "",
    speaker: "",
    line: "교실의 모든 학생이 우리를 바라본다. 어떻게 소개할까?",
    next: "eunho-first",
    choices: [
      { text: "“멀리 있는 학교에서 왔습니다. 잘 부탁드립니다.”", branch: "intro-path-safe", feedbackSpeaker: "강은호", feedback: "멀리 있는 학교? 그런데 왜 이렇게 낯이 익지?", effect: () => { state.trust.somi += 1; } },
      { text: "현재 학교 이름을 그대로 말한다.", branch: "intro-path-name", feedbackSpeaker: "1999년 담임", feedback: "그게 바로 이 학교 이름인데? 긴장했나 보구나.", effect: () => { state.flags.toldSchoolName = true; state.suspicion += 2; } },
      { text: "태오에게 먼저 인사하라고 떠민다.", branch: "intro-path-taeo", feedbackSpeaker: "태오", feedback: "저희는 인터넷이 아주 느린 시골에서... 아, 아니에요!", effect: () => { state.trust.taeo += 1; } },
    ],
  },
  "intro-path-safe": {
    label: "1999년 · 5학년 3반", mode: "past", chars: ["eunho", "taeo", "somi"], active: "eunho", speaker: "강은호",
    line: "어느 동네인지는 말 안 하네. 좋아, 내가 직접 알아내주지.", next: "eunho-first",
  },
  "intro-path-name": {
    label: "1999년 · 5학년 3반", mode: "past", chars: ["teacher", "taeo", "somi"], active: "somi", speaker: "소미",
    line: () => `${state.playerName}, 우리 학교가 1999년에도 같은 이름이야. 이상하지 않아?`, next: "eunho-first",
  },
  "intro-path-taeo": {
    label: "1999년 · 웃음바다가 된 교실", mode: "past", chars: ["eunho", "taeo", "somi"], active: "eunho", speaker: "강은호",
    line: "인터넷? 학교 전산실에서만 쓰는 건데. 너희 진짜 어디서 왔어?", next: "eunho-first",
  },
  "school-name": {
    label: "1999년 · 5학년 3반",
    mode: "past",
    chars: ["teacher", "taeo", "somi"], active: "teacher",
    speaker: "1999년 담임",
    line: "그게 바로 이 학교 이름인데? 긴장해서 잘못 말했나 보구나.",
    next: "eunho-first",
  },
  "taeo-intro": {
    label: "1999년 · 5학년 3반",
    mode: "past",
    chars: ["teacher", "taeo", "somi"], active: "taeo",
    speaker: "태오",
    line: "저희는... 인터넷이 아주 느린 시골에서 왔습니다! 아, 인터넷이 아니라... 그게...",
    next: "eunho-first",
  },
  "eunho-first": {
    label: "1999년 · 쉬는 시간",
    mode: "past",
    chars: ["eunho", "taeo", "somi"], active: "eunho",
    speaker: "강은호",
    line: "너희 아까부터 이상해. 급식이 어디 있냐고 묻질 않나, 교실 전화기를 사진 찍으려 하질 않나.",
    next: "phone-choice",
  },
  "phone-choice": {
    label: "1999년 · 쉬는 시간",
    mode: "past",
    chars: ["eunho", "taeo", "somi"], active: "eunho",
    speaker: "강은호",
    line: "그리고 네 주머니에서 아까 빛난 건 뭐야?",
    next: "teacher-slip",
    choices: [
      { text: "고장 난 전자수첩이라고 둘러댄다.", branch: "phone-path-organizer", feedbackSpeaker: "강은호", feedback: "전자수첩치고는 멋진데? 나중에 게임 기능도 보여 줘.", effect: () => { state.flags.hidPhone = true; state.trust.eunho += 1; } },
      { text: "미래에서 온 휴대전화라고 솔직하게 말한다.", branch: "phone-path-future", feedbackSpeaker: "강은호", feedback: "미래? 하하! 너희 거짓말 진짜 못한다. 그런데 방금 왜 흔들렸지?", effect: () => { state.suspicion += 3; triggerGlitch(); addLog("시간 이상", "미래를 말하자 현재 학교 명찰의 글자가 잠깐 사라졌다."); } },
      { text: "정복이라는 아이가 맡긴 물건이라고 거짓말한다.", branch: "phone-path-jeongbok", feedbackSpeaker: "강은호", feedback: "정복이라면 벌써 전교생한테 자랑했을 텐데. 수상한데...", effect: () => { state.suspicion += 1; } },
    ],
  },
  "phone-path-organizer": {
    label: "1999년 · 수상한 전자수첩", mode: "past", chars: ["eunho", "taeo", "somi"], active: "taeo", speaker: "태오",
    line: "게임은 배터리가 없어서 못 보여 줘. 왜 26년이 표시되는지도 묻지 마!", next: "teacher-slip",
  },
  "phone-path-future": {
    label: "1999년 · 흔들린 시간", mode: "past", chars: ["eunho", "taeo", "somi"], active: "somi", speaker: "소미", glitch: true,
    line: () => `${state.playerName}, 휴대전화 날짜가 잠깐 1999년으로 바뀌었어. 미래를 말하면 시간이 반응하나 봐.`, next: "teacher-slip",
  },
  "phone-path-jeongbok": {
    label: "1999년 · 들통난 거짓말", mode: "past", chars: ["eunho", "taeo", "somi"], active: "eunho", speaker: "박정복",
    line: "뭐가 내 물건이야? 난 저런 거 처음 보는데!", next: "teacher-slip",
  },
  "eunho-tease": {
    label: "1999년 · 쉬는 시간",
    mode: "past",
    chars: ["eunho", "taeo", "somi"], active: "eunho",
    speaker: "강은호",
    line: "전자수첩치고는 멋진데? 좋아. 일단 믿어 줄게. 대신 나중에 게임 기능 보여 줘.",
    next: "teacher-slip",
  },
  "eunho-phone": {
    label: "1999년 · 쉬는 시간",
    mode: "past",
    chars: ["eunho", "taeo", "somi"], active: "eunho",
    speaker: "강은호",
    line: "미래? 푸하하! 너희, 거짓말은 잘 못하는구나. 그런데... 방금 왜 교실이 흔들렸지?",
    next: "teacher-slip",
  },
  "jeongbok-lie": {
    label: "1999년 · 쉬는 시간",
    mode: "past",
    chars: ["eunho", "taeo", "somi"], active: "eunho",
    speaker: "강은호",
    line: "박정복이? 걔가 저런 걸 가졌으면 벌써 전교생한테 자랑했을 텐데. 수상한데...",
    next: "teacher-slip",
  },
  "teacher-slip": {
    label: "1999년 · 쉬는 시간",
    mode: "past",
    chars: ["eunho", "somi"], active: "somi",
    speaker: "소미",
    line: "저기... 선생님, 아니 은호야. 혹시 출석부 좀 볼 수 있을까?",
    next: "eunho-reaction",
  },
  "eunho-reaction": {
    label: "1999년 · 쉬는 시간",
    mode: "past",
    chars: ["eunho", "somi"], active: "eunho",
    speaker: "강은호",
    line: "서, 선생님? 내가? 너희 진짜 어디서 왔어?",
    next: "roster",
    choices: [
      { text: "“아무것도 아니야. 잘못 불렀어.”", feedbackSpeaker: "강은호", feedback: "흠... 아직 수상하지만, 일단 출석부부터 보자.", effect: () => { state.trust.eunho += 1; } },
      { text: "“너, 커서 선생님이 돼.”", feedbackSpeaker: "강은호", feedback: "내가 선생님? 그건 미래가 망했다는 뜻 아니야?", effect: () => { state.suspicion += 2; triggerGlitch(); } },
      { text: "출석부 쪽으로 화제를 돌린다.", feedbackSpeaker: "소미", feedback: "그 얘기는 나중에! 우선 출석부부터 보여 줘.", effect: () => { state.trust.somi += 1; } },
    ],
  },
  "future-teacher": {
    label: "1999년 · 쉬는 시간",
    mode: "past",
    chars: ["eunho", "somi"], active: "eunho",
    speaker: "강은호",
    line: "내가 선생님이 된다고? 그건 진짜 미래가 망했다는 뜻 아니야?",
    next: "roster",
  },
  "roster": {
    label: "1999년 · 5학년 3반 출석부",
    mode: "past",
    chars: [],
    speaker: "소미",
    line: () => `${state.playerName}, 이것 봐. 우리 이름이... 오늘 적힌 글씨가 아니야. 오래전부터 여기 있었던 것처럼 바래 있어.`,
    prop: "roster",
    next: "hana-name",
  },
  "hana-name": {
    label: "1999년 · 5학년 3반 출석부",
    mode: "past",
    chars: [],
    speaker: "",
    line: "명단 마지막 줄. '윤하나'라는 이름의 잉크가 눈앞에서 천천히 흐려진다.",
    prop: "roster-hana",
    glitch: true,
    next: "empty-desk",
  },
  "empty-desk": {
    label: "1999년 · 주인 없는 책상", mode: "past", chars: ["eunho", "somi"], active: "somi", speaker: "소미",
    line: "방금 여기 이름이 있었어. 윤하나라고. 그런데 저 빈 책상… 가방은 그대로 있네?", next: "eunho-forgets",
  },
  "eunho-forgets": {
    label: "1999년 · 주인 없는 책상", mode: "past", chars: ["eunho", "taeo"], active: "eunho", speaker: "강은호",
    line: "윤… 누구? 우리 반에 그런 애 없는데. 이상하다. 저 가방은 매일 봤던 것 같은데.", next: "pager-message",
  },
  "pager-message": {
    label: "1999년 · 삐삐에 도착한 문자", mode: "past", chars: [], speaker: "소미",
    line: "가방에 달린 삐삐가 울렸어. ‘방송실로 와. 은호한테는 말하지 마.’ 누가 우리를 보고 있는 거야?", prop: "pager", next: "end",
  },
  "chapter1-start": {
    label: "1편 · 방송실에 없는 방송부원", mode: "past", chars: ["taeo", "somi"], active: "taeo", speaker: "태오",
    line: "은호한테 말하지 말라는데… 은호가 우리 뒤에 있으면 어떡해?", next: "hallway-eunho",
  },
  "hallway-eunho": {
    label: "1999년 · 방송실 앞", mode: "past", chars: ["eunho", "taeo"], active: "eunho", speaker: "강은호",
    line: "나 들었거든? 방송실 구경 가는 거지? 따라와. 근데 문 앞에 선생님이 계시네.", next: "festival-help",
  },
  "festival-help": {
    label: "1999년 · 행사 준비 교실", mode: "past", chars: ["teacher", "somi"], active: "teacher", speaker: "1999년 담임",
    line: "방송부 도우러 왔니? 잘됐다. 그림에는 모래, 테두리에는 작은 자갈, 받침에는 큰 자갈이 필요해. 먼지를 마시지 않게 마스크부터 쓰자.", next: "sand-problem",
  },
  "sand-problem": {
    label: "1999년 · 모래 그림 준비", mode: "past", chars: ["taeo", "somi"], active: "taeo", speaker: "태오",
    line: "구경이 갑자기 봉사로 바뀌었어… 자갈은 내가 하나씩 골라낼게. 하나, 둘… 아니, 이렇게 많아?", next: "sand-plan",
  },
  "sand-plan": {
    label: "1999년 · 모래와 자갈 관찰", mode: "past", chars: ["somi", "eunho"], active: "somi", speaker: "소미",
    line: "이걸 세 종류로 나눠야 해. 체도 여러 개네. 먼저 자세히 보고, 우리끼리 방법을 정해 보자. 한 번에 안 되면 남은 재료를 다시 나누면 되지!", next: "sand-lab",
  },
  "sand-lab": {
    label: "직접 해 보기 · 모래와 자갈 분리", mode: "past", chars: [], speaker: "소미", line: "체 눈 크기를 고르고 흔들어 봐.", experiment: "sieve", next: "sand-result",
  },
  "sand-result": {
    label: "1999년 · 준비가 끝난 모래", mode: "past", chars: ["taeo", "somi"], active: "taeo", speaker: "태오",
    line: "모래만 쏙 내려왔네! 내 손으로 골랐으면 내년까지 했겠다. …잠깐, 지금 내년이 2000년이지?", next: "sand-explain",
  },
  "sand-explain": {
    label: "1999년 · 모래 그림 준비", mode: "past", chars: ["somi", "eunho"], active: "somi", speaker: "소미",
    line: "체 눈보다 작은 알갱이는 통과하고 큰 알갱이는 남았어. 체를 차례로 써서 세 종류를 나눴네! 모래 그림도, 자갈 장식도 준비 끝이야.", next: "hana-credit",
  },
  "hana-credit": {
    label: "1999년 · 배경판 뒷면", mode: "past", chars: ["eunho", "somi"], active: "eunho", speaker: "강은호",
    line: "이 배경판 누가 그렸더라? 뒷면에 이름이… ‘방송부 윤하나’. 아까 너희가 말한 그 이름이잖아.", next: "broadcast-call",
  },
  "broadcast-call": {
    label: "1999년 · 갑자기 켜진 교실 스피커", mode: "past", chars: [], speaker: "스피커 속 목소리",
    line: "내 그림… 버리지 않았구나. 고마워. 방송실에서 기다릴게. 이번에는 꼭 나를 찾아줘.", next: "chapter1-end",
  },
  "chapter1-end": {
    label: "1편 미리보기 · 첫 실험 완료", mode: "past", chars: ["eunho", "taeo", "somi"], active: "eunho", speaker: "강은호",
    line: "저 목소리, 나 알아. 분명 아는데… 왜 얼굴이 생각 안 나지? 같이 가자. 이번엔 나도 알아야겠어.", next: "chapter1-preview-end",
  },
};

function init() {
  const saved = loadSave();
  if (saved) {
    dom.btnContinue.classList.remove("hidden");
    dom.playerName.value = saved.playerName || "";
  }
  bindEvents();
}

function bindEvents() {
  dom.btnStart.addEventListener("click", startNew);
  dom.btnContinue.addEventListener("click", continueGame);
  dom.dialogue.addEventListener("click", advance);
  $("#btnLog").addEventListener("click", openLog);
  $("#btnCloseLog").addEventListener("click", () => dom.logPanel.classList.add("hidden"));
  $("#btnSound").addEventListener("click", toggleSound);
  $("#btnReset").addEventListener("click", resetGame);
  $("#btnReplay").addEventListener("click", resetGame);
  $("#btnChapter1").addEventListener("click", () => { showStory(); renderScene("chapter1-start"); });
  dom.playerName.addEventListener("keydown", (event) => {
    if (event.key === "Enter") startNew();
  });
  document.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && !dom.story.classList.contains("hidden") && !event.target.closest("button, input")) advance();
    if (event.key === "Escape") dom.logPanel.classList.add("hidden");
  });
}

function startNew() {
  initAudio();
  state = initialState();
  state.playerName = dom.playerName.value.trim() || "지우";
  addLog("시작", `${state.playerName}, 태오, 소미가 과학실 창고를 정리하기 시작했다.`);
  showStory();
  renderScene("storage-1");
}

function continueGame() {
  initAudio();
  const saved = loadSave();
  if (!saved) return startNew();
  state = saved;
  showStory();
  renderScene(state.scene || "storage-1");
  toast("저장된 장면에서 이어갑니다.");
}

function showStory() {
  dom.title.classList.add("hidden");
  dom.ending.classList.add("hidden");
  dom.story.classList.remove("hidden");
  dom.hud.classList.remove("hidden");
}

function renderScene(id) {
  $("#experimentPanel").classList.add("hidden");
  $("#experimentPanel").innerHTML = "";
  dom.dialogue.classList.remove("hidden");
  pendingNext = null;
  if (id === "end" || id === "chapter1-preview-end") return showEnding(id);
  const scene = scenes[id];
  if (!scene) return;
  state.scene = id;
  saveGame();

  dom.background.className = `background ${scene.mode || "past"}`;
  dom.scanlines.classList.toggle("on", Boolean(scene.scanlines));
  dom.sceneLabel.textContent = scene.label || "";
  dom.date.textContent = scene.date || (scene.mode === "past" ? "1999년 12월 28일" : "2026년 9월 3일");
  dom.time.textContent = scene.time || (scene.mode === "past" ? "오전 9:10" : "오후 4:44");
  renderCharacters(scene.chars || [], scene.active, id);
  renderProp(scene.prop);
  clearChoices();
  setDialogue(scene.speaker || "", resolve(scene.line), scene.dialogueType || "speech");
  dom.dialogue.disabled = Boolean(scene.choices);
  if (scene.experiment === "sieve") {
    dom.dialogue.classList.add("hidden");
    const panel = $("#experimentPanel");
    panel.classList.remove("hidden");
    window.Sieve.mount(panel, () => {
      state.flags.sandSeparated = true;
      addLog("실험 메모", "혼합물은 각각의 성질을 지닌 물질이 섞인 것. 알갱이 크기와 체 눈 크기를 비교하며 모래·작은 자갈·큰 자갈을 나눴다.");
      renderScene(scene.next);
    });
  }

  if (scene.glitch) triggerGlitch();
  if (scene.choices) window.setTimeout(() => renderChoices(scene.choices), 380);
  addLog(scene.speaker || "장면", resolve(scene.line));
  tone(scene.mode === "video" ? 220 : 420, .035);
}

function resolve(value) {
  return typeof value === "function" ? value() : value;
}

function renderCharacters(ids, active, sceneId) {
  const layout = window.CharacterLayout.planCharacterLayout(ids, active);
  const visibleIds = new Set(ids);

  Array.from(dom.characters.children).forEach((element) => {
    if (!visibleIds.has(element.dataset.character)) element.remove();
  });

  layout.forEach(({ id, position, role, shot }) => {
    const person = cast[id];
    const mood = window.CharacterMoods.getCharacterMood(sceneId, id);
    let element = dom.characters.querySelector(`[data-character="${id}"]`);
    const isNew = !element;
    if (!element) {
      element = document.createElement("div");
      element.dataset.character = id;
      dom.characters.appendChild(element);
    }
    element.dataset.name = person.name;
    element.dataset.mood = mood;
    element.style.backgroundImage = `url("assets/characters/${id}/${mood}.png")`;
    element.className = `character ${person.className} is-${position} is-${role} shot-${shot}${isNew ? ` is-new enter-${position}` : ""}`;
  });
}

function renderProp(type) {
  if (!type) {
    dom.propArea.innerHTML = "";
    return;
  }
  if (type === "pager") {
    dom.propArea.innerHTML = `<div class="pager-clue"><span>수신 메시지</span><p>방송실로 와.<br>은호한테는 말하지 마.</p></div>`;
  } else if (type === "tape") {
    dom.propArea.innerHTML = `<img class="title-tape" src="assets/vhs-tape.png" alt="5-3 / 1999 라벨이 붙은 낡은 VHS 비디오테이프">`;
  } else if (type === "screen") {
    dom.propArea.innerHTML = `<div class="vhs-player"><div><b>1999</b><span>PLAY ▶ 00:04:44</span><small>TRACKING...</small></div></div>`;
  } else if (type === "roster" || type === "roster-hana") {
    const hanaClass = type === "roster-hana" ? "fading" : "";
    dom.propArea.innerHTML = `<article class="evidence-card"><h3>1999학년도 5학년 3반</h3><div class="roster"><span>1 강은호</span><span>2 박정복</span><span>3 김민지</span><span>4 최준호</span><span class="future-name">27 ${state.playerName}</span><span class="future-name">28 김태오</span><span class="future-name">29 박소미</span><span class="${hanaClass}">30 윤하나</span></div></article>`;
  }
}

function setDialogue(speaker, text, type = "speech") {
  clearInterval(typingTimer);
  const resolvedSpeaker = resolve(speaker) || "상황";
  dom.speaker.textContent = resolvedSpeaker;
  dom.dialogue.classList.toggle("thought", type === "thought");
  dom.line.textContent = "";
  dom.line.dataset.fullText = text;
  currentLineDone = false;
  let index = 0;
  const chars = Array.from(text);
  typingTimer = setInterval(() => {
    dom.line.textContent += chars[index] || "";
    index += 1;
    if (index >= chars.length) {
      clearInterval(typingTimer);
      currentLineDone = true;
    }
  }, 18);
}

function advance() {
  if (scenes[state.scene]?.experiment) return;
  if (!currentLineDone) {
    clearInterval(typingTimer);
    dom.line.textContent = dom.line.dataset.fullText || dom.line.textContent;
    currentLineDone = true;
    return;
  }
  if (pendingNext) {
    const destination = pendingNext;
    pendingNext = null;
    renderScene(destination);
    return;
  }
  if (dom.dialogue.disabled) return;
  const scene = scenes[state.scene];
  if (!scene) return;
  tone(560, .025);
  renderScene(scene.next);
}

function renderChoices(choices) {
  dom.choices.innerHTML = choices.map((choice, index) => `<button class="choice-btn" type="button" data-index="${index}"><span class="choice-number">${index + 1}</span><span class="choice-label">${choice.text}</span></button>`).join("");
  dom.choices.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const choice = choices[Number(button.dataset.index)];
      const scene = scenes[state.scene];
      const destination = choice.branch || choice.next || scene.next;
      tone(680, .05);
      addLog("나의 선택", choice.text);
      if (choice.effect) choice.effect();
      if (choice.feedback) {
        const feedbackSpeaker = choice.feedbackSpeaker || (scene.active && cast[scene.active]?.name) || "상황";
        addLog("선택 결과", choice.feedback);
        pendingNext = destination;
        setDialogue(feedbackSpeaker, choice.feedback, choice.feedbackType || "speech");
        saveGame();
      }
      clearChoices();
      dom.dialogue.disabled = false;
      if (!choice.feedback) renderScene(destination);
    });
  });
}

function clearChoices() {
  dom.choices.innerHTML = "";
}

function showEnding(id = "end") {
  clearInterval(typingTimer);
  const preview = id === "chapter1-preview-end";
  state.scene = id;
  saveGame();
  dom.story.classList.add("hidden");
  dom.ending.classList.remove("hidden");
  dom.background.className = "background past";
  dom.scanlines.classList.remove("on");
  dom.date.textContent = "1999년 12월 28일";
  dom.time.textContent = "오전 9:20";
  $("#endingKicker").textContent = preview ? "1편 미리보기 · 첫 실험 완료" : "프롤로그 끝";
  $("#endingTitle").textContent = preview ? "기억나지 않는 목소리" : "아무도 기억하지 않는 아이";
  $("#endingMessage").textContent = preview ? "내 그림, 버리지 않았구나. 방송실에서 기다릴게." : "방송실로 와. 은호한테는 말하지 마.";
  $("#btnChapter1").textContent = preview ? "첫 실험 이야기 다시 하기" : "방송실로 간다";
  $("#endingNote").textContent = preview ? "이번 연습판은 여기까지입니다. 물·기름, 소금·모래 실험은 다음 제작 범위입니다." : "다음: 방송실에 없는 방송부원 · 직접 체를 흔드는 첫 실험";

  const brave = state.flags.tookTape ? "테이프를 놓치지 않았고" : state.flags.heldHands ? "친구들의 손을 놓지 않았고" : "낯선 목소리를 기억했고";
  dom.endingSummary.textContent = `${state.playerName}는 ${brave}, 1999년의 강은호와 처음 만났다. 하지만 출석부에는 설명할 수 없는 이름이 하나 더 남아 있었다.`;
  if (preview) dom.endingSummary.textContent = "모래와 자갈을 분리해 하나가 만들던 배경판을 완성했다. 은호도 마침내 같은 목소리를 들었다. 이제 함께 방송실로 향한다.";
  const badges = [
    state.flags.watchedCarefully ? "관찰이 빠른 전학생" : "결단이 빠른 전학생",
    state.trust.eunho > 0 ? "은호의 관심 +1" : "은호의 의심 +1",
    state.flags.toldSchoolName ? "시간의 비밀을 말할 뻔함" : "정체를 숨김",
  ];
  dom.endingBadges.innerHTML = (preview ? ["알갱이 크기로 분리", "모래 그림 준비 완료", "은호와 함께 방송실로"] : badges).map((badge) => `<span class="badge">${badge}</span>`).join("");
  tone(523, .12); window.setTimeout(() => tone(659, .12), 140); window.setTimeout(() => tone(784, .22), 290);
}

function addLog(speaker, text) {
  state.log.push({ speaker, text });
  if (state.log.length > 80) state.log.shift();
}

function openLog() {
  dom.logList.innerHTML = state.log.slice().reverse().map((item) => `<div class="log-entry"><b>${escapeHtml(item.speaker)}</b><br>${escapeHtml(item.text)}</div>`).join("") || "<p>아직 기록이 없습니다.</p>";
  dom.logPanel.classList.remove("hidden");
}

function escapeHtml(text) {
  return String(text).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
}

function triggerGlitch() {
  dom.glitch.classList.remove("on");
  void dom.glitch.offsetWidth;
  dom.glitch.classList.add("on");
  tone(92, .15, "sawtooth");
}

let toastTimer;
function toast(message) {
  clearTimeout(toastTimer);
  dom.toast.textContent = message;
  dom.toast.classList.add("on");
  toastTimer = setTimeout(() => dom.toast.classList.remove("on"), 1800);
}

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function loadSave() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)); }
  catch { return null; }
}

function resetGame() {
  localStorage.removeItem(SAVE_KEY);
  state = initialState();
  location.reload();
}

function toggleSound() {
  state.sound = !state.sound;
  $("#btnSound").textContent = state.sound ? "소리 켬" : "소리 끔";
  if (state.sound) { initAudio(); tone(620, .07); }
  saveGame();
}

function initAudio() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === "suspended") audioContext.resume();
}

function tone(frequency, duration, type = "sine") {
  if (!state.sound) return;
  try {
    initAudio();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(.045, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch { /* Sound is optional. */ }
}

init();
