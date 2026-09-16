(function(root){
  'use strict';
  const names={north:'북',east:'동',south:'남',west:'서'};
  const titles={fog:'뿌연 운동장의 비밀',wind:'날아간 순서표',locker:'목소리가 든 보관함',pack:'비가 오기 전에',photo:'사진 속의 한순간'};
  const observations={grass:'풀잎 표면에 물방울이 붙어 있다. 손으로 만진 곳만 젖는다.',air:'먼 골대가 흐릿하다. 공기 중에 떠 있는 작은 물방울이 시야를 가린다.',sky:'운동장보다 훨씬 높은 하늘에 구름이 모여 있다.',lens:'렌즈 표면에도 작은 물방울이 있다. 벤치 위에 부드러운 마른 천이 놓여 있다.',morning:'아침 기록 · 맑음. 운동장 바닥은 말라 있었다.',forecast:'새 예보 · 비가 다가오고 바람이 강해질 예정이다.',ground:'현재 · 빗방울이 떨어지고 바닥이 미끄러워졌다. 선생님이 야외 활동을 중단했다.',log:'관측 기록 · 10:00 서풍/마른 땅 → 10:20 북풍/마른 땅 → 10:40 북풍/비.',photo:'현상한 결승선 사진 · 깃발 끝은 남쪽. 흙바닥에 빗방울 자국은 없다. 하나가 바통을 건네고 있다.',voice:'녹음 · “결승선 통과! 하나야, 바통 받아!” 이어서 은호가 “아직 비는 안 오네.”라고 말한다.'};
  function mount(panel,mode,onDone,saved,onSave,onSound){
    let game=Playground.initial(mode,saved&&saved.game),detail='',look=false,dead=false,actionsOpen=false;
    let evidenceState=saved&&saved.evidence,disposeEvidence=null;
    const legacyComplete=!!(saved&&saved.legacyComplete);
    const clock=ActivityClock.create(mode==='wind'?35000:45000,saved&&saved.clock);
    const timed=mode==='wind'||mode==='pack';
    const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const button=(label,type,value='',extra='')=>`<button type="button" data-action="${type}" data-value="${esc(value)}" ${extra}>${label}</button>`;
    const save=()=>{if(onSave)onSave({game,clock:clock.snapshot(),evidence:evidenceState});};
    function inspect(id){game=Playground.act(game,{type:'inspect',value:id});detail=observations[id]||'';if(id.startsWith('card-')){const c=Playground.cards.find(c=>c.id===id);detail=`${c.time} 관측 스케치 · 깃발 끝은 ${names[c.end]}쪽. 보관함에는 ‘바람이 불어온 쪽을 시간 순서대로’라고 적혀 있다.`;}clock.pause();}
    function hotspot(label,id,x,y,w,h){return `<button class="pg-spot" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%" data-action="spot" data-value="${id}" aria-label="${label}"><span>${label}</span></button>`;}
    function render(){
      if(disposeEvidence){disposeEvidence();disposeEvidence=null;}
      const desk=mode==='locker'||mode==='pack';
      let spots='';
      if(mode==='fog')spots=hotspot('풀잎','grass',1,59,9,11)+hotspot('먼 골대','air',63,37,12,10)+hotspot('하늘','sky',34,2,25,14)+hotspot('카메라 렌즈','lens',11,75,7,8)+hotspot('마른 천','cloth',16,81,7,7);
      if(mode==='wind')spots=hotspot('도구 보관장','store',3,29,16,26)+hotspot('생울타리','hedge',84,42,15,13)+hotspot('순서표 게시대','board',80,60,9,8);
      if(mode==='locker')spots=hotspot('녹음기','recorder',3,49,27,32)+hotspot('보관함','chest',32,44,36,30);
      let controls='';
      if(mode==='fog')controls=button('렌즈 닦기','use','lens')+button('밖의 안개 닦아 보기','use','air')+button('선생님과 안개가 걷히기를 기다리기','wait');
      if(mode==='wind'){
        if(game.storeOpen)controls+=`<section class="pg-tools"><b>열린 보관장</b>${['clip','reacher','cloth','box'].map(id=>button(Playground.items[id]+(game.inventory.includes(id)?' ✓':''),'take',id)).join('')}</section>`;
        controls+=`<p>바람을 따라 ${game.windStep}/3 · ${game.windStep<3?'관측판: '+names[{east:'west',north:'south'}[Playground.windDirections[game.windStep]]]+'쪽에서 바람이 불어온다. 종이는 어느 쪽으로 이동할까?':'생울타리에 종이가 걸렸다.'}</p><div class="pg-directions">${Object.entries(names).map(([id,n])=>button(n+'쪽으로 따라가기','direction',id)).join('')}</div>`;
      }
      if(mode==='locker')controls+=`<div class="pg-cards">${Playground.cards.map((c,i)=>button(['방송대','깃대 아래','보관장'][i]+' 관측 카드'+(game.seen.includes(c.id)?' ✓':''),'inspect',c.id)).join('')}</div>${game.lockerOpen?'<p class="pg-open">뚜껑을 열었다 · 녹음테이프가 보인다.</p>'+button('테이프 꺼내기','take','tape')+button('녹음기에 넣기','use','recorder')+button('재생 ▶','play'):`<p>바람이 불어온 방향 · 이른 시각부터</p><div class="pg-dials">${game.dials.map((d,i)=>`<label>${Playground.cards[i].time}<select data-dial="${i}" aria-label="${i+1}번째 방향">${Object.entries(names).map(([v,n])=>`<option value="${v}" ${v===d?'selected':''}>${n}</option>`).join('')}</select></label>`).join('')}</div>${button('보관함 열기','unlock')}`}`;
      if(mode==='pack')controls+=`${['morning','forecast','ground'].map(id=>button({morning:'아침 기록',forecast:'새 예보',ground:'지금 운동장'}[id],'inspect',id)).join('')}<p>친구들과 기록을 어디로 옮길까?</p>${button('운동장에 남기','plan','outside')}${button('강당으로 옮기기','plan','inside')}<hr>${button('상자 물기 닦기','use','box')}<p>상자: ${game.clean?'물기를 닦음':'젖어 있음'} · ${game.packed.length}/2 보관</p>${['notes','tape','ball','flag'].map(id=>button(Playground.items[id]+(game.packed.includes(id)?' ✓':''),'pack',id)).join('')}${button('상자 닫기','close')}`;
      if(mode==='photo')controls+=`${['photo','log','voice'].map(id=>button({photo:'현상한 사진',log:'관측 일지',voice:'녹음 내용'}[id],'inspect',id)).join('')}<form class="pg-proof"><label>연결할 장면<select name="photo"><option value="start">출발선</option><option value="finish">결승선</option></select></label><label>바람이 불어온 쪽<select name="wind">${Object.entries(names).map(([v,n])=>`<option value="${v}">${n}</option>`).join('')}</select></label><label>바닥<select name="rain"><option value="wet">비에 젖음</option><option value="dry">말라 있음</option></select></label><label>촬영 시각<input name="time" placeholder="예: 10:00" inputmode="numeric" required></label><button type="submit">세 기록 연결하기</button></form>`;
      if(mode==='locker')controls=game.lockerOpen?'<p>선생님이 보관한 오늘의 녹음</p>'+button('테이프 꺼내기','take','tape')+button('녹음기에 넣기','use','recorder')+button('재생 ▶','play'):button('선생님이 잠금을 풀어 둔 보관함 열기','teacher-open');
      panel.classList.add('playground-panel','room-panel');
      if(mode==='photo')controls='<div class="pg-evidence-host"></div>';
      panel.innerHTML=`<section class="pg-shell"><header><small>1999 · 운동장의 기록</small><h2>${titles[mode]}</h2>${button(look?'표시 숨기기':'둘러보기','look')}</header><div class="pg-layout"><div class="pg-picture ${look?'pg-look':''}"><img src="assets/playground-${desk?'desk':'field'}-cartoon-v3.png" alt="${desk?'운동장 방송 작업대':'학교 운동장'}">${spots}${game.storeOpen&&mode==='wind'?'<span class="pg-state">보관장 열림 ✓</span>':''}${game.lockerOpen&&mode==='locker'?'<span class="pg-state">보관함 열림 ✓</span>':''}</div><aside><div class="pg-inventory"><b>가방 · 선택 후 사용할 곳을 누르세요</b>${game.inventory.map(id=>button(Playground.items[id],'select',id,`aria-pressed="${game.selected===id}"`)).join('')}</div>${timed?`<div class="pg-timer"><output aria-label="남은 시간"></output>${button('시작 / 계속','start')}${button('잠깐 멈춤','pause')}${button('시간 다시 받기','retry')}${button('시간 제한 없이','unlimited')}</div>`:''}${controls}</aside></div><footer aria-live="polite"><b>${esc(game.speaker)}</b><p>${esc(game.message||'그림 속 물건을 눌러 보자. 가진 물건은 가방에서 골라 사용할 수 있어.')}</p>${game.complete?button('친구들에게 돌아가기 →','done'):''}</footer>${detail?`<div class="pg-detail" role="dialog" aria-label="관찰 내용"><article><h3>가까이 살펴보기</h3><p>${esc(detail)}</p>${button('확인 · 탐색으로','dismiss')}</article></div>`:''}</section>`;
      const shell=panel.querySelector('.pg-shell'), layout=panel.querySelector('.pg-layout');
      const picture=panel.querySelector('.pg-picture'), aside=panel.querySelector('aside');
      const surface=document.createElement('div');surface.className='pg-surface';
      layout.replaceWith(surface);surface.append(picture);
      const bag=aside.querySelector('.pg-inventory');shell.append(bag);
      const timer=aside.querySelector('.pg-timer');if(timer)shell.append(timer);
      aside.className='pg-controls';aside.hidden=!actionsOpen||!!detail;
      aside.insertAdjacentHTML('afterbegin',button('탐색으로 돌아가기','actions'));
      shell.append(aside);
      if(mode==='photo'){
        panel.querySelector('.pg-picture img').src='assets/classroom-night-cartoon-v1.png';
        panel.querySelector('.pg-picture img').alt='저녁 기록 확인 장면';
        panel.querySelector('footer p').textContent='소미가 인화 봉투를 펼쳤다. 기록 비교를 눌러 관측 자료와 사진의 시각을 맞춰 보자.';
        disposeEvidence=EvidenceTask.mount(aside.querySelector('.pg-evidence-host'),onDone,evidenceState,value=>{evidenceState=value;save();},onSound);
      }
      panel.querySelector('header').insertAdjacentHTML('beforeend',button(actionsOpen?'행동 접기':{fog:'친구와 이야기',wind:'도구와 바람',locker:'단서와 보관함',pack:'기록 챙기기',photo:'기록 비교'}[mode],'actions'));
      if(detail){
        panel.querySelector('.pg-detail').remove();
        panel.querySelector('footer').innerHTML=`<b>${esc(game.speaker)}</b><p>${esc(detail)}</p>${button('계속 ▼','dismiss')}`;
      }
      if(mode==='wind'&&game.storeOpen)panel.querySelector('.pg-picture img').src='assets/playground-field-open-cartoon-v3.png';
      if(mode==='wind'&&!game.paper){
        const positions=[[43,66],[60,66],[60,43],[89,46]], current=positions[game.windStep];
        picture.insertAdjacentHTML('beforeend',`<span class="pg-flying-paper" role="img" aria-label="날아간 순서표: ${game.windStep===3?'생울타리에 걸림':'운동장 위'}" style="left:${current[0]}%;top:${current[1]}%">▤</span>`);
      }
      if(legacyComplete&&!game.complete)panel.querySelector('footer').insertAdjacentHTML('beforeend',button('이전 완료 기록으로 이야기 계속하기 →','done'));
      updateClock();
    }
    function updateClock(){const s=clock.tick(),out=panel.querySelector('.pg-timer output');if(out)out.textContent=s.unlimited?'시간 제한 없음':s.expired?'태오: 내가 잡고 있을게! 시간을 다시 받거나 천천히 이어 가자.':`${Math.ceil(s.remaining/1000)}초 · ${s.running?'진행 중':'멈춤 (읽는 동안은 줄지 않아요)'}`;}
    function click(e){const b=e.target.closest('[data-action]');if(!b)return;const type=b.dataset.action,value=b.dataset.value;
      const before=game;
      if(type==='done'){onDone();return;}if(type==='look')look=!look;
      else if(type==='actions')actionsOpen=!actionsOpen;
      else if(type==='select'&&game.selected===value){game.selected='';game.message='물건을 가방에 넣었어. 다시 주변을 살펴보자.';}
      else if(type==='dismiss')detail='';
      else if(['start','pause','retry','unlimited'].includes(type)){if(type==='retry')clock.reset();else clock[type]();}
      else if(type==='inspect')inspect(value);
      else if(type==='spot'){
        if(mode==='fog'){if(value==='cloth')game=Playground.act(game,{type:'take',value});else if(game.selected==='cloth')game=Playground.act(game,{type:'use',value});else inspect(value);}
        else if(value==='chest')actionsOpen=true;
        else {game=Playground.act(game,{type:'use',value});if(value==='store'&&game.storeOpen)actionsOpen=true;}
      }else{
        if(timed&&['direction','pack','close'].includes(type)&&!clock.snapshot().unlimited&&!clock.snapshot().running){detail='시간 도전을 시작하거나 ‘시간 제한 없이’를 골라 이어 가자. 지금까지 찾은 물건은 그대로야.';}
        else game=Playground.act(game,{type,value});
      }
      if(onSound){
        if(type==='play'&&game.heard&&!before.heard)onSound('tape');
        else if(type==='take'&&game.inventory.length>before.inventory.length||type==='inspect')onSound('paper');
      }
      if(game.complete||detail||!['start','retry','unlimited'].includes(type))clock.pause();save();render();
      if(mode==='wind'&&game.windStep>before.windStep){
        const paper=panel.querySelector('.pg-flying-paper'),route=[[43,66],[60,66],[60,43],[89,46]];
        if(paper&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
          const from=route[before.windStep],to=route[game.windStep];
          paper.animate([{left:from[0]+'%',top:from[1]+'%',transform:'rotate(-18deg)'},{left:to[0]+'%',top:to[1]+'%',transform:'rotate(14deg)'}],{duration:1300,easing:'ease-in-out'});
        }
        if(onSound)onSound('paper');
      }
    }
    function change(e){if(e.target.dataset.dial!==undefined){game=Playground.act(game,{type:'dial',value:{index:Number(e.target.dataset.dial),direction:e.target.value}});save();}}
    function submit(e){if(!e.target.matches('.pg-proof'))return;e.preventDefault();const v=Object.fromEntries(new FormData(e.target));v.time=v.time.normalize('NFKC').trim();game=Playground.act(game,{type:'connect',value:v});save();render();}
    function hidden(){if(document.hidden){clock.pause();save();updateClock();}}
    panel.addEventListener('click',click);panel.addEventListener('change',change);panel.addEventListener('submit',submit);document.addEventListener('visibilitychange',hidden);
    const interval=setInterval(()=>{if(!dead){updateClock();save();}},500);render();
    return ()=>{dead=true;if(disposeEvidence)disposeEvidence();clock.pause();save();clock.dispose();clearInterval(interval);panel.removeEventListener('click',click);panel.removeEventListener('change',change);panel.removeEventListener('submit',submit);document.removeEventListener('visibilitychange',hidden);panel.classList.remove('playground-panel','room-panel');};
  }
  root.PlaygroundView={mount};
})(window);
