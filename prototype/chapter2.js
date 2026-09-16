(function(root){
 'use strict';
 function build(){
  const s={};
  function line(id,speaker,text,next,extra={}){s[id]={label:'2편 · 운동회에 없는 아이',date:'1999년 12월 29일',time:'오전 9:00',mode:'past',backdrop:'field',chars:['taeo','somi','eunho'],active:({'태오':'taeo','소미':'somi','강은호':'eunho'})[speaker]||'',speaker,line:text,next,...extra};}
  const yesterday={date:'1999년 12월 28일',time:'오전 11:50'};
  line('chapter2-start','태오','골대 옆이야! …저기 앉아 있는 애 보여? 하나야! 우리 목소리 들려?','c2-found',yesterday);
  line('c2-found','윤하나','오지 마. 방금도 은호가 나를 보고 그냥 지나갔어. 또 그러면… 나도 내가 여기 있는지 모르겠어.','c2-anchor',yesterday);
  line('c2-anchor','소미','윤하나. 네가 과학 수업을 소개했지? 네 이름을 여기 적었어. 은호야, 이 종이 보고 천천히 불러 줘.','c2-call',yesterday);
  line('c2-call','강은호','윤하나. …맞아. 어제 원고 읽다가 네가 웃었잖아. 내가 ‘식용유’를 ‘식용우’라고 해서.','c2-answer',yesterday);
  line('c2-answer','윤하나','…그걸 기억해? 맞아. 내가 다시 읽어 보라고 했어. 이제 나 보이는 거지?','c2-teacher',yesterday);
  line('c2-teacher','1999년 담임','하나야, 여기 있었구나. 교무실로 가자. 보호자께 연락하고 몸 상태도 살펴보마. 너희도 같이 가자.','c2-evening',{...yesterday,chars:['teacher','somi'],active:'teacher'});
  line('c2-evening','소미','선생님이 집에도 연락하셨어. 다행히 하나는 가족과 함께 갔어. 그런데… 우리가 쓴 이름은 남아 있는데, 선생님이 잠깐 또 누구냐고 물으셨어.','c2-promise',{...yesterday,time:'오후 4:10',backdrop:'classroom'});
  line('c2-promise','강은호','내일 아침 교실에서 만나기로 했어. 이름을 읽고 목소리를 들으면 잠깐 돌아와. 그 사이에 얼굴도 남기자. 내일 선생님 카메라로.','c2-morning',{...yesterday,time:'오후 4:12',backdrop:'classroom'});
  line('c2-morning','태오','새천년맞이 겨울 운동회… 진짜 하는 거였네? 이 추운 날에?','c2-event');
  line('c2-event','1999년 담임','온종일 뛰는 행사는 아니야. 짧은 학급 경기와 기념 촬영이지. 몸부터 풀고, 날씨나 바닥이 나쁘면 실내로 옮긴다.','c2-fog-intro',{chars:['teacher','taeo'],active:'teacher'});
  line('c2-fog-intro','윤하나','나 여기 있어. 어제처럼 내 이름 불러 줘서 고마워. 그런데 저쪽 골대가 안 보여. 렌즈가 뿌연 건가?','c2-fog');
  line('c2-fog','소미','렌즈만 닦기 전에 주변도 보자. 풀, 운동장 공기, 하늘은 서로 다르게 보여.','c2-fog-after',{experiment:'weather',weather:'fog'});
  line('c2-fog-after','소미','렌즈 문제가 아니었네. 안개가 옅어질 때까지 선생님과 실내에서 준비하자. 하나야, 내 옆으로 와.','c2-partner');
  line('c2-partner','강은호','이제 골대가 보여. 선생님도 바닥 확인 끝내셨대. 순서표 챙길 사람? 하나가 마지막 주자야.','c2-gust',{time:'오전 10:00',choices:[
   {text:'은호와 함께 순서표를 확인한다.',branch:'c2-partner-eunho'},
   {text:'하나와 함께 응원 구호를 맞춘다.',branch:'c2-partner-hana'},
   {text:'정복과 날아갈 물건을 고정한다.',branch:'c2-partner-jeongbok'}]});
  line('c2-partner-eunho','강은호','내가 세 번째, 하나가 네 번째. 오늘은 안 헷갈려. …아니, 헷갈리면 이걸 다시 읽을게.','c2-partner-eunho2');
  line('c2-partner-eunho2','소미','응. 기억한다고 버리지는 말자. 순서표도 사진에 같이 찍어 두면 좋겠어.','c2-gust');
  line('c2-partner-hana','윤하나','내 이름 넣어서 응원하면 좀 쑥스럽긴 한데… 오늘은 그렇게 해 줘. 목소리가 들리면 덜 무서워.','c2-partner-hana2');
  line('c2-partner-hana2','태오','윤! 하! 나! …너무 컸어? 알았어, 경기 시작하면 더 크게 할게.','c2-gust');
  line('c2-partner-jeongbok','박정복','내가 집게를 다 챙겼지. 이런 건 나한테 맡겨! …어라, 마지막 하나 어디 갔지?','c2-partner-jeongbok2');
  line('c2-partner-jeongbok2','소미','네 소매에 붙어 있어. 자랑하기 전에 이것부터 꽂자. 바람이 세졌어.','c2-gust');
  line('c2-gust','태오','앗, 순서표! 사진 찍으려고 집게 뺀 사이에 날아갔어. 아무 데나 뛰어가면 놓치겠는데!','c2-wind',{time:'오전 10:08'});
  line('c2-wind','강은호','마지막으로 본 건 운동장 한가운데야. 깃발이랑 관측판을 보고 찾을 쪽을 정하자.','c2-wind-after',{time:'오전 10:08',experiment:'weather',weather:'wind'});
  line('c2-wind-after','윤하나','찾았다! 동쪽 생울타리에 걸렸네. 마지막 칸에 내 이름 있어. 은호야, 이번엔 꼭 보고 있어.','c2-race',{time:'오전 10:15'});
  line('c2-race','강은호','하나야, 받아! …좋아, 바통 넘겼어! 난 여기서 멈출게. 결승선까지 조금만 더!','c2-erased',{time:'오전 10:20'});
  line('c2-erased','강은호','결승선? 내가 들어왔는데? …잠깐. 난 세 번째 주자였어. 그런데 왜 내가 마지막이었다고 생각했지?','c2-evidence',{time:'오전 10:24'});
  line('c2-evidence','소미','순서표 마지막 칸이 또 비었어. 하지만 녹음에는 태오가 하나를 부르는 소리가 남았어. 이름만으로는 부족해. 얼굴이 나온 사진도 남겨야 해.','c2-weather-change',{time:'오전 10:25'});
  line('c2-weather-change','1999년 담임','다음 경기는 잠깐 중단하자. 바람이 강해지고 먹구름이 들어온다. 방송부는 관측 기록과 바닥 상태를 가져오렴.','c2-schedule',{time:'오전 11:00',chars:['teacher','somi'],active:'teacher'});
  line('c2-schedule','소미','아까 맑았다고 계속 맑은 건 아니야. 오전 기록, 새 예보, 운동장 상태를 함께 보자.','c2-schedule-after',{time:'오전 11:00',experiment:'weather',weather:'schedule'});
  line('c2-schedule-after','1999년 담임','그래. 야외 경기는 끝내고 강당에서 몸을 녹이자. 사진도 비를 피해서 찍겠다. 바깥 물건은 선생님들이 챙길 테니 나가지 마.','c2-confess',{time:'오전 11:10',chars:['teacher','somi'],active:'teacher'});
  line('c2-confess','윤하나','사실 나도 미래 학교가 나오는 영상을 봤어. 졸업앨범에도 방송부 기록에도 내 이름이 없었어. 그런데 어른이 된 은호는 계속 누굴 찾고 있었어.','c2-confess2',{time:'오전 11:20',backdrop:'classroom'});
  line('c2-confess2','윤하나','내가 사라지면 그 사람이 더는 안 찾아도 되는 걸까? 그게… 다들 편해지는 길이라면?','c2-reassure',{time:'오전 11:20',backdrop:'classroom'});
  line('c2-reassure','소미','하나에게 뭐라고 말할까?','c2-photo-intro',{backdrop:'classroom',time:'오전 11:21',choices:[
   {text:'“네가 없는 게 편한지, 우리한테도 물어봐야지.”',branch:'c2-stay'},
   {text:'“영상에 없다고 네 미래까지 정해진 건 아니야.”',branch:'c2-future'}]});
  line('c2-stay','강은호','난 안 편해. 모르는 사람 찾는 기분이 되는 게 제일 무서워. 네가 없어져도 괜찮다고 한 적 없어.','c2-stay2',{backdrop:'classroom'});
  line('c2-stay2','윤하나','…미안. 혼자 결론 내렸네. 나도 남고 싶어. 사진, 나도 같이 찍을래.','c2-photo-intro',{backdrop:'classroom'});
  line('c2-future','소미','그 영상 하나가 전부라는 증거는 없잖아. 어제 못 읽던 이름도 우리가 다시 찾았어. 오늘 남길 수 있는 것부터 남기자.','c2-future2',{backdrop:'classroom'});
  line('c2-future2','윤하나','응. 사라진다는 생각만 하고 있었어. 나도 사진에 남을래. 이번엔 뒤에 숨지 않을게.','c2-photo-intro',{backdrop:'classroom'});
  line('c2-photo-intro','강은호','사진관에 맡길 봉투에 촬영 기록도 넣으래. 경기 사진의 시계가 멈춰 있는데… 날씨 기록으로 언제 찍힌 건지 좁힐 수 있을까?','c2-photo',{time:'오전 11:25',backdrop:'classroom'});
  line('c2-photo','소미','세 장의 기록을 비교해 봐. 시간 하나만 맞추는 게 아니라 하나가 실제로 경기했다는 증거를 연결하는 거야.','c2-shutter',{time:'오전 11:25',backdrop:'classroom',experiment:'weather',weather:'photo'});
  line('c2-shutter','1999년 담임','하나야, 앞줄 가운데로 와. 얼굴 가리는 우산은 접고. 모두 이름을 한 번씩 말해 볼까? …좋아, 찍는다!','c2-face',{time:'오전 11:35',backdrop:'classroom',chars:['teacher','somi'],active:'teacher'});
  line('c2-face','윤하나','윤하나. 내가 여기 있었다고, 잊으면 이 사진을 봐 줘. 나도 너희 이름 잊지 않게 적어 둘게.','c2-night',{time:'오전 11:35',backdrop:'classroom'});
  line('c2-night','강은호','선생님이 맡긴 사진을 같이 찾으러 왔어. …인화된 사진 봐! 하나 얼굴이 선명해. 순서표랑 녹음 기록도 맞아.','c2-theft',{time:'오후 6:10',backdrop:'night'});
  line('c2-theft','태오','잠깐! 검은 우비가 사진관 안으로… 필름 봉투를 가져갔어! 하나야, 내 뒤에 있어!','c2-safe',{time:'오후 6:11',backdrop:'night',glitch:true});
  line('c2-safe','1999년 담임','쫓아가지 마! 모두 안으로 들어와. 주인아저씨, 경찰에 연락해 주세요. 나는 아이들 곁에 있겠습니다.','c2-whistle',{time:'오후 6:12',backdrop:'night',chars:['teacher','somi'],active:'teacher'});
  line('c2-whistle','소미','인화한 사진 한 장은 내가 갖고 있어. 기록도 나눠 뒀고. …그런데 바닥에 이 호루라기. 은호야, 네가 목에 걸던 거 아니야?','c2-deny',{time:'오후 6:13',backdrop:'night'});
  line('c2-deny','강은호','내 거 맞아. 아침까지 분명 걸고 있었는데… 언제 없어진 거지? 나 계속 너희 옆에 있었잖아.','c2-last',{time:'오후 6:13',backdrop:'night'});
  line('c2-last','윤하나','우비 입은 사람이 돌아볼 때… 은호 목소리로 말했어. “그 사진을 믿지 마.”','chapter2-end',{time:'오후 6:14',backdrop:'night'});
  // Branches reconverge without making the visible clock run backwards.
  for(const [id,scene] of Object.entries(s)){
   if(id.startsWith('c2-partner'))scene.time='오전 10:00';
   if(['c2-stay','c2-stay2','c2-future','c2-future2'].includes(id))scene.time='오전 11:21';
   if(['c2-erased','c2-evidence','c2-confess','c2-confess2','c2-theft','c2-whistle','c2-deny','c2-last'].includes(id))scene.music='mystery';
  }
  // Keep existing IDs so chapter-two saves can enter the new exploration safely.
  for(const [id,mode] of Object.entries({'c2-fog':'fog','c2-wind':'wind','c2-schedule':'pack','c2-photo':'photo'})){
   s[id].experiment='playground';s[id].playground=mode;
  }
  s['c2-fog'].line='하나가 또 사라진 걸까? 렌즈와 풀잎, 골대 쪽을 직접 살펴보자.';
  s['c2-wind'].line='순서표를 놓쳤어! 창고에서 쓸 만한 물건을 챙기고 깃발을 보자.';
  s['c2-erased'].next='c2-locker-intro';
  line('c2-locker-intro','소미','선생님이 방금 녹음한 테이프를 보관함에 넣으셨대. 우리가 확인해도 된다고 잠금을 풀어 주셨어. 은호의 기억과 녹음 중에 무엇이 다른지 직접 들어 보자.','c2-locker',{time:'오전 10:24'});
  line('c2-locker','강은호','선생님께 허락받았어. 관측 카드는 방송석, 깃대 밑, 창고에 나눠 뒀대. 내가 마지막으로 뛰었는지 직접 들어 보자.','c2-evidence',{time:'오전 10:24',experiment:'playground',playground:'locker'});
  s['c2-evidence'].line='은호가 “하나야, 받아!”라고 부른 뒤 “난 여기서 멈출게”라고 했어. 은호가 마지막은 아니었어. 사진과 관측 기록까지 맞춰 보자.';
  s['c2-schedule'].line='선생님이 야외 경기를 멈추셨어. 처마 아래에서 새 예보를 확인하고, 우리가 찾은 기록을 비에 젖지 않게 챙기자.';
  s['c2-weather-change'].time='오전 10:40';
  s['c2-weather-change'].line='빗방울이 떨어진다. 여기서 야외 경기를 마치자. 모두 처마 안으로! 방송부 기록도 안쪽 작업대에서 정리하렴.';
  s['c2-schedule'].time='오전 10:40';
  s['c2-schedule-after'].time='오전 10:45';
  s['c2-stay2'].next='c2-photo-intro';s['c2-future2'].next='c2-photo-intro';
  s['c2-photo-intro'].line='선생님이 경기 사진도 찍으셨대. 필름을 맡기면 저녁에 찾을 수 있어. 지금은 하나 얼굴이 잘 보이게 단체 사진을 찍자.';
  s['c2-photo-intro'].next='c2-shutter';
  s['c2-night'].line='인화 사진을 받았어! 선생님이 주인아저씨와 필름을 확인하시는 동안 경기 기록과 맞춰 보자. 하나가 마지막으로 뛰는 순간이 있을 거야.';
  s['c2-night'].next='c2-photo';
  Object.assign(s['c2-photo'],{time:'오후 6:10',backdrop:'night',next:'c2-proof',line:'사진 한 장만으로 짐작하지 말자. 깃발, 동시 녹음, 관측 시각을 연결해 봐.'});
  line('c2-proof','소미','찾았어. 하나가 네 번째로 뛰던 순간이야. 인화 사진은 내가, 이름과 시각을 옮긴 수첩은 네가 갖자. 하나를 기억할 증거를 나눠 지키는 거야.','c2-theft',{time:'오후 6:10',backdrop:'night'});
  return s;
 }
 function restartFlags(flags){return Object.fromEntries(Object.entries(flags).filter(([key])=>!key.startsWith('weather-')&&!key.startsWith('playground-')));}
 const api={build,restartFlags};if(typeof module!=='undefined')module.exports=api;root.Chapter2=api;
})(typeof window==='undefined'?globalThis:window);
