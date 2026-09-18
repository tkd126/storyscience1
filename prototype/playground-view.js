(function(root){
 'use strict';
 const titles={fog:'렌즈 너머의 안개',wind:'순서표와 운동장',locker:'방송석의 녹음',pack:'처마 아래 기록 보관',photo:'사진관의 세 기록'};
 const descriptions={grass:'풀잎 표면에 물방울이 있어. 모습만으로 이슬인지 비인지 확정할 수는 없어. 선생님 기록에는 밤에 비가 안 왔고 아침부터 물방울이 있었다고 적혀 있어.',air:'가까이 있는 하나는 잘 보여. 먼 골대 앞 공기 속 물방울이 시야를 가리는 거야.',sky:'구름은 운동장보다 높은 하늘에 있어. 물방울이 모인 위치가 다르네.',lens:'렌즈 표면에도 물방울이 있어. 옆의 마른 천을 챙겨 닦아 보자.',store:'선생님께 허락받은 열쇠로 여는 창고야.',board:'함께 읽은 경기 순서표: 3번 강은호 → 4번 윤하나. 집게로 게시대에 고정하자.',hedge:'낮은 울타리야. 종이가 걸리면 넘어가지 말고 집게봉으로 꺼내자.',morning:'아침에는 바닥이 말라 있었어. 지금 상태와 달라.',forecast:'새 예보에는 비와 강한 바람이 있어. 선생님이 실내로 이동하자고 하셨어.',ground:'처마 밖에 새 빗방울 자국이 생겼어. 우리는 안에서 기록을 정리하자.',photo:'A는 출발 준비, B는 3번에서 4번으로 바통 전달, C는 빈 트랙과 빗방울 자국. 사진 옆 깃발 스케치도 비교하자.',log:'10:00 서풍·마른 땅 / 10:20 북풍·마른 땅 / 10:40 북풍·첫 비. 선생님은 이 세 관측 시각에 한 장씩 찍으셨어.',voice:'태오가 방송석에서 녹음했어. 은호: “3번 끝! 하나야, 받아!” 하나: “받았어! 4번, 출발!” 경기 전 읽은 순서표도 3번 은호, 4번 하나였어.'};
 const field={store:[10.4,34,6.3,17],board:[80,60,9,8],hedge:[84,42,15,13],flag:[43.6,10.4,3.2,4.4],lens:[11,75,7,8],cloth:[17,81,7,7],grass:[1,59,9,11],air:[63,37,12,10],sky:[34,2,25,14]};
 const labels={store:'창고 문',board:'순서표 게시대',hedge:'낮은 울타리',flag:'깃발',lens:'카메라 렌즈',cloth:'마른 천',grass:'풀잎',air:'먼 골대',sky:'하늘',recorder:'녹음기',chest:'테이프 보관함',box:'기록 상자 안쪽',forecast:'새 예보',ground:'현재 바닥',morning:'아침 기록',photo:'인화 사진',log:'관측 일지',voice:'바통 전달 녹음'};
 const outlines={store:'M10.7 34.4 L16.2 35 V50.5 L10.7 51 Z',lens:'M11.8 78 L12.5 77.5 V76.7 H14.4 L14.8 76.3 H15.7 L16.6 77.5 V81 L13.3 82.2 L11.8 81.6 Z',flag:'M44 10.8 L46.5 12.7 L44 14.3 Z',air:'M63.2 45.5 L64 38 L64.8 37.1 L74.6 37.6 V45.4 M64.8 37.1 V46 L74.6 45.4',grass:'M1 69 Q3 65 2 61 Q4 64 5 68 Q5 62 7 59 Q6 65 9 68',sky:'M35 12 Q35 7 40 7 Q42 2 48 5 Q55 3 57 8 Q60 9 58 13 Q45 16 35 12 Z',cloth:'M17 85 Q18 81 22 82 L24 87 Q21 86 18 88 Z',hedge:'M84 52 Q85 47 87 48 Q87 43 90 45 Q92 42 95 45 Q98 44 99 50 L98 54 L85 55 Z',board:'M80 60 L89 60 L89 66 L85 66 L85 68 M84 66 L80 66 Z',recorder:'M4 59 L9 50 L28 53 L29 73 L24 79 L4 77 Z',chest:'M33 51 L40 45 L66 49 L67 67 L59 73 L33 68 Z',box:'M33 51 L40 45 L66 49 L67 67 L59 73 L33 68 Z'};
 function mount(panel,mode,onDone,saved,onSave=()=>{},onSound=()=>{},options={}){
  let game=Playground.initial(mode,saved&&saved.game),peek=false,bag=false,detail='',reply='',dead=false,disposeEvidence=null;
  let evidenceState=saved&&saved.evidence,replySpeaker='소미';
  const prepare=options.prepare===true,legacyComplete=!!saved?.legacyComplete;
  if(mode==='wind'&&!prepare&&!game.gust){
   if(!game.permission)game=Playground.act(game,{type:'teacher-permission'});
   game.initialFixed=true;game=Playground.act(game,{type:'gust'});game.selected='';
  }
  const timed=(mode==='wind'&&!prepare)||mode==='pack';
  const clock=ActivityClock.create(mode==='wind'?35000:45000,saved?.clock);
  if(!saved?.clock)clock.unlimited();
  const esc=RoomScene.esc;
  const button=(action,label)=>'<button type="button" data-pg="'+action+'">'+esc(label)+'</button>';
  const save=()=>onSave({game,clock:clock.snapshot(),evidence:evidenceState});
  function doAct(type,value){
   const before=game;game=Playground.act(game,{type,value});
   const changed=JSON.stringify({...before,message:'',speaker:''})!==JSON.stringify({...game,message:'',speaker:''});
   reply=!changed&&['use','direction','close','take','wait','play'].includes(type)?'괜찮아. 물건은 그대로 있어. 다시 살피고 다른 방법을 써 보자.':'';
   replySpeaker=game.speaker==='소미'?'태오':'소미';
   if(type==='select')bag=false;
   if(type==='use'&&changed)game.selected='';
   if(type==='play'&&game.heard&&!before.heard)onSound('tape');else if(changed)onSound('paper');
   clock.pause();save();
  }
  function hotspot(id,coords){
   const [x,y,w,h]=coords;
   const path=outlines[id]||'M'+(x+w*.12)+' '+(y+h*.1)+' L'+(x+w*.9)+' '+(y+h*.06)+' L'+(x+w*.96)+' '+(y+h*.92)+' L'+(x+w*.08)+' '+(y+h*.96)+' Z';
   return '<button type="button" class="room-hotspot '+(peek?'revealed':'')+'" data-pg="spot:'+id+'" aria-label="'+labels[id]+' 조사" style="left:'+x+'%;top:'+y+'%;width:'+w+'%;height:'+h+'%"><svg class="room-object-glow" viewBox="'+[x,y,w,h].join(' ')+'" preserveAspectRatio="none" aria-hidden="true"><path d="'+path+'"/></svg><span>'+labels[id]+'</span></button>';
  }
  function modal(title,body,wide=false){return '<section class="room-modal pg-modal '+(wide?'pg-wide':'')+'" role="dialog" aria-modal="true" aria-label="'+esc(title)+'"><div class="room-modal-content">'+button('close','닫기 · 장면으로')+'<h2>'+esc(title)+'</h2>'+body+'</div></section>';}
  function art(){if(mode==='photo')return 'assets/photo-studio-cartoon-v2.png';if(['locker','pack'].includes(mode))return 'assets/playground-desk-cartoon-v3.png';return 'assets/playground-field'+(mode==='wind'&&game.storeOpen?'-open':'')+'-cartoon-v3.png';}
  function render(focus=false){
   if(disposeEvidence){disposeEvidence();disposeEvidence=null;}
   let spots='';
   if(mode==='fog')for(const id of ['lens','cloth','grass','air','sky'])spots+=hotspot(id,field[id]);
   if(mode==='wind')for(const id of ['store','board','hedge','flag'])spots+=hotspot(id,field[id]);
   if(mode==='locker')spots=hotspot('recorder',[3,49,27,32])+hotspot('chest',[32,44,36,30]);
   if(mode==='pack')spots=hotspot('box',[32,44,36,30])+hotspot('forecast',[69,48,17,23])+hotspot('ground',[4,8,70,25])+hotspot('morning',[69,75,17,12]);
   if(mode==='photo')spots=hotspot('voice',[12,68,17,20])+hotspot('photo',[28,68,29,21])+hotspot('log',[68,66,17,23]);
   panel.innerHTML=RoomScene.render({place:mode==='photo'?'1999 · 사진관':mode==='pack'?'1999 · 운동장 처마':mode==='locker'?'1999 · 방송석':'1999 · 운동장',goal:prepare?'09:50 · 장비 준비':titles[mode],art:art(),alt:mode==='photo'?'사진관 카운터 위 녹음기, 사진, 수첩':'겨울 운동장과 방송부 기록',peek,spots,selected:game.selected?'손에 든 물건: '+Playground.items[game.selected]:'',speaker:game.speaker,line:game.message||'그림 속 물건을 살펴보자. 물건을 쓸 때는 가방에서 골라 대상에 사용하면 돼.'});
   const picture=panel.querySelector('.room-picture');
   if(mode==='wind'){
    const end=Playground.windDirections[Math.min(game.windStep,2)];
    if(!prepare)picture.insertAdjacentHTML('beforeend','<div class="pg-flag-signal" aria-label="깃발 끝 '+(end==='east'?'동':'북')+'쪽">북 ↑<br><span>'+(end==='east'?'⚑ → 동':'⚑ ↑ 북')+'</span></div>');
    if(game.initialFixed&&!game.gust||game.fixed)picture.insertAdjacentHTML('beforeend','<span class="pg-fixed-paper" aria-label="게시대에 집게로 고정한 순서표">▤</span>');
    if(game.gust&&!game.paper){const xy=[[43,66],[60,66],[60,43],[89,46]][game.windStep];picture.insertAdjacentHTML('beforeend','<span class="pg-flying-paper" style="left:'+xy[0]+'%;top:'+xy[1]+'%" aria-label="날아간 순서표">▤</span>');}
   }
   if(mode==='fog'&&game.wipedLens)picture.insertAdjacentHTML('beforeend','<span class="pg-clean-lens" aria-label="물방울을 닦은 렌즈"></span>');
   if(mode==='fog')picture.insertAdjacentHTML('beforeend','<img class="pg-hana-nearby" src="assets/hana-first-meeting-v1.png" alt="가까운 일행 곁에 서 있는 윤하나">');
   if(mode==='locker'&&game.lockerOpen)picture.insertAdjacentHTML('beforeend','<div class="pg-open-chest" aria-label="뚜껑이 열린 보관함"><i></i>'+(game.inventory.includes('tape')?'':'<span>▣</span>')+'</div>');
   if(mode==='locker'&&game.loaded)picture.insertAdjacentHTML('beforeend','<span class="pg-loaded-tape" aria-label="녹음기에 삽입한 테이프">▣</span>');
   if(mode==='pack')picture.insertAdjacentHTML('beforeend','<div class="pg-box-state '+(game.clean?'dry ':'')+(game.closed?'closed':'')+'" aria-label="'+(game.closed?'닫은 기록 상자':game.clean?'마른 상자':'젖은 상자')+'">'+(game.closed?'':game.packed.map(id=>'<span>'+(id==='notes'?'▤':'▣')+'</span>').join(''))+'</div>');
   if(mode!=='photo')picture.insertAdjacentHTML('beforeend','<button type="button" class="pg-teacher" data-pg="teacher" aria-label="선생님과 이야기하거나 이동하기"><img src="assets/characters/teacher/normal.png" alt="1999년 담임"><span>선생님</span></button>');
   if(game.selected)panel.querySelector('.room-bag').insertAdjacentHTML('beforeend',button('stow','가방에 넣기'));
   if(reply)panel.querySelector('.room-speech').insertAdjacentHTML('beforeend',button('reply','친구의 말 듣기 ▼'));
   if(timed)panel.querySelector('.room-toolbar').insertAdjacentHTML('beforeend','<small class="pg-clock" aria-live="off"></small>'+button('timer','시간 도전 설정'));
   if(legacyComplete)panel.querySelector('.room-speech').insertAdjacentHTML('beforeend',button('legacy-done','이전 완료 기록으로 계속 →'));
   if(bag)panel.insertAdjacentHTML('beforeend',modal('내 가방','<div class="inventory-items">'+(game.inventory.map(id=>'<article><h3>'+esc(Playground.items[id])+'</h3><p>'+esc({key:'선생님이 허락한 창고 열쇠.',clip:'종이를 고정하는 집게.',reacher:'울타리를 넘지 않고 종이를 꺼내는 집게봉.',cloth:'물기를 닦는 부드러운 천.',notes:'순서표와 관측 일지.',tape:'태오가 응원을 녹음한 테이프.',box:'처마 아래 기록 상자.'}[id]||'탐색 중 챙긴 물건.')+'</p>'+button('select:'+id,'사용하기')+'</article>').join('')||'<p>아직 챙긴 물건이 없어.</p>')+'</div>'));
   else if(detail)renderDetail();
   const overlay=panel.querySelector('.room-modal');
   if(overlay){for(const child of panel.children)if(child!==overlay)child.inert=true;overlay.querySelector('button')?.focus({preventScroll:true});}
   else if(focus)panel.querySelector('[data-room-action="bag"]')?.focus({preventScroll:true});
   updateClock();
  }
  function renderDetail(){
   let title=labels[detail]||'살펴보기',body='<p>'+esc(descriptions[detail]||game.message)+'</p>',wide=false;
   if(detail==='store'&&game.storeOpen){title='열린 창고';body='<img class="pg-detail-art" src="assets/playground-field-open-cartoon-v3.png" alt="열린 도구 창고">'+['clip','reacher','cloth','box'].map(id=>'<article><b>'+Playground.items[id]+'</b><p>'+(id==='reacher'?'울타리를 넘지 않고 종이를 꺼내는 도구.':id==='clip'?'순서표를 게시대에 물리는 도구.':'기록을 보관할 때 쓰는 물건.')+'</p>'+button('take:'+id,game.inventory.includes(id)?'가방에 있음 · 다시 살피기':'챙기기')+'</article>').join('');}
   if(detail==='flag'){title='깃발과 운동장 지도';body='<p>'+esc(game.message)+'</p><p>종이가 갈 곳을 지도에서 눌러 보자. 깃발 표시는 지금 움직임을 확대한 그림이야.</p><div class="pg-map" aria-label="북쪽이 위인 운동장 지도">'+[['north','북쪽 트랙'],['west','서쪽 창고'],['east','동쪽 울타리'],['south','남쪽 방송석']].map(([id,name])=>'<button type="button" class="map-'+id+'" data-pg="direction:'+id+'" '+(!game.gust||game.windStep>=3?'disabled':'')+'>'+name+'</button>').join('')+'<span>현재 종이</span></div>';}
   if(detail==='chest')body='<p>'+(game.lockerOpen?'선생님이 보관하신 오늘의 녹음이야.':'선생님이 잠금을 풀어 두셨어. 뚜껑을 열어 보자.')+'</p>'+(game.lockerOpen?button('take:tape',game.inventory.includes('tape')?'테이프는 가방에 있어':'테이프 챙기기'):button('teacher-open','보관함 뚜껑 열기'));
   if(detail==='recorder')body='<p>'+(game.loaded?'테이프가 들어 있어.':'테이프 넣는 자리가 비어 있어. 가방에서 테이프를 골라 녹음기에 사용하자.')+'</p>'+button('play','재생 ▶');
   if(detail==='box')body='<p>'+(game.closed?'기록 두 가지를 넣고 뚜껑을 닫았어.':game.clean?'상자 안이 말랐어. 가방의 순서표와 테이프를 이 안에 넣자.':'상자 안에 빗물이 들어왔어. 천으로 안쪽을 닦아야 해.')+'</p><p>보관한 기록 '+game.packed.length+'/2</p>'+button('close-box','뚜껑 닫기');
   if(detail==='photo')body+=Playground.ready(game)?button('evidence','세 기록을 작업대에서 연결하기'):'<p>옆의 관측 일지와 녹음기도 살펴보자.</p>';
   if(detail==='timer'){title='선택형 시간 도전';body='<p>기본은 무제한. 설명이나 가방을 읽는 동안 멈추고, 시간이 끝나도 태오가 기록을 붙잡아 줘. 기록은 사라지지 않아.</p><output class="pg-clock"></output>'+button('clock-start','시간 도전 시작 / 계속')+button('clock-reset','시간 다시 받기')+button('clock-unlimited','시간 제한 없이');}
   if(detail==='evidence'){title='사진 · 일지 · 녹음 연결';body='<div class="pg-evidence-host"></div>';wide=true;}
   panel.insertAdjacentHTML('beforeend',modal(title,body,wide));
   if(detail==='evidence')disposeEvidence=EvidenceTask.mount(panel.querySelector('.pg-evidence-host'),onDone,evidenceState,value=>{evidenceState=value;save();},onSound);
   updateClock();
  }
  function spot(id){
   if(game.selected&&['lens','grass','air','sky','store','hedge','board','recorder','box'].includes(id)){doAct('use',id);detail='';return;}
   if(id==='cloth'){doAct('take','cloth');return;}
   doAct('inspect',id);detail=id;
  }
  function teacher(){
   detail='';
   if(mode==='wind'&&prepare){if(game.initialFixed){save();onDone();return;}doAct('teacher-permission');return;}
   if(game.complete){save();onDone();return;}
   if(mode==='fog'){doAct('wait');if(game.complete){save();onDone();}return;}
   game.speaker='1999년 담임';game.message=mode==='pack'?'상자 안을 닦고 순서표와 테이프를 넣은 다음 뚜껑을 닫자.':mode==='wind'?'깃발을 보고 종이를 찾을 곳을 예상하자. 집게봉으로 꺼낸 뒤 집게로 고정하렴.':'녹음테이프를 녹음기에 넣고 들어 보렴.';save();
  }
  function click(e){
   const target=e.target.closest('[data-pg],[data-room-action]');if(!target)return;
   const action=target.dataset.pg||target.dataset.roomAction,[kind,value]=action.split(':');
   if(kind==='peek')peek=!peek;
   else if(kind==='bag'){clock.pause();bag=true;detail='';}
   else if(kind==='close'){bag=false;detail='';}
   else if(kind==='select'){doAct('select',value);detail='';}
   else if(kind==='stow'){game.selected='';save();}
   else if(kind==='spot')spot(value);
   else if(kind==='take')doAct('take',value);
   else if(kind==='teacher')teacher();
   else if(kind==='teacher-open')doAct('teacher-open');
   else if(kind==='play'){doAct('play');detail='';}
   else if(kind==='close-box'){doAct('close');detail='';}
   else if(kind==='direction'){doAct('direction',value);detail='';}
   else if(kind==='reply'){game.speaker=replySpeaker;game.message=reply;reply='';save();}
   else if(kind==='timer'){clock.pause();detail='timer';}
   else if(kind==='clock-start'){if(clock.snapshot().unlimited)clock.reset();clock.start();detail='';}
   else if(kind==='clock-reset')clock.reset();
   else if(kind==='clock-unlimited'){clock.unlimited();detail='';}
   else if(kind==='evidence'){if(Playground.ready(game))detail='evidence';}
   else if(kind==='legacy-done'){onDone();return;}
   else return;
   if(!dead){save();render(true);}
  }
  function keydown(e){const modal=panel.querySelector('.room-modal');if(!modal)return;if(e.key==='Escape'){e.preventDefault();bag=false;detail='';render();}if(e.key==='Tab'){const nodes=[...modal.querySelectorAll('button,input,select,textarea,summary')].filter(n=>!n.disabled&&n.getClientRects().length);const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}}
  function updateClock(){const s=clock.tick(),out=panel.querySelector('.pg-clock');if(out)out.textContent=s.unlimited?'시간 제한 없음':s.expired?'태오: 내가 잡고 있어! 천천히 이어 가자.':Math.ceil(s.remaining/1000)+'초 · '+(s.running?'진행 중':'읽는 동안 멈춤');}
  function hidden(){if(document.hidden){clock.pause();save();}}
  panel.classList.add('room-panel','playground-panel');panel.addEventListener('click',click);panel.addEventListener('keydown',keydown);document.addEventListener('visibilitychange',hidden);
  const interval=setInterval(()=>{if(!dead)updateClock();},500);save();render();
  return ()=>{dead=true;if(disposeEvidence)disposeEvidence();clock.pause();save();clock.dispose();clearInterval(interval);panel.removeEventListener('click',click);panel.removeEventListener('keydown',keydown);document.removeEventListener('visibilitychange',hidden);panel.classList.remove('room-panel','playground-panel');};
 }
 root.PlaygroundView={mount};
})(typeof window==='undefined'?globalThis:window);
