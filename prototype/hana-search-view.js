(function(root){
  'use strict';
  const spots=[
    ['camera','벤치 위 카메라',11.5,76,5.5,6.3,'M11.8 78 L12.5 77.5 V76.7 H14.4 L14.8 76.3 H15.7 L16.6 77.5 V81 L13.3 82.2 L11.8 81.6 Z'],
    ['goal','골대 옆',63,36.5,12,9.5,'M63.2 45.5 L64 38 L64.8 37.1 L74.6 37.6 V45.4 M64.8 37.1 V46 L74.6 45.4 M64.8 46 L63.2 45.5'],
    ['ball','축구공',70.5,49.5,2.2,4.1,'M72.4 51.6 C72.4 53.5 70.7 53.5 70.7 51.6 C70.7 49.7 72.4 49.7 72.4 51.6 Z'],
    ['shed','창고 문',10.4,34,6.3,17,'M10.7 34.4 L16.2 35 V50.5 L10.7 51 Z'],
    ['flag','깃발',43.6,10.4,3.2,4.4,'M44 10.8 L46.5 12.7 L44 14.3 Z']
  ];
  function mount(host,onDone,saved,onSave=()=>{},onSound=()=>{}){
    let s=HanaSearch.initial(saved),peek=false,bag=false,finished=false,wide=false;
    const {button}=RoomScene;
    function dispatch(action){
      if(action==='peek')peek=!peek;
      else if(action==='field'&&!s.talk)wide=true;
      else if(action==='goal'&&s.found&&!s.talk)wide=false;
      else if(action==='bag'&&!s.talk)bag=true;
      else if(action==='bag-close')bag=false;
      else {
        const previous=s;s=HanaSearch.act(s,action);
        if(action.startsWith('select-'))bag=false;
        if(s.note&&!previous.note||action==='select-name')onSound('paper');
        onSave(s);
      }
      if(s.complete&&!finished){finished=true;onDone();return;}
      render(action);
    }
    function modal(label,body){return `<section class="room-modal" role="dialog" aria-modal="true" aria-label="${label}"><div class="room-modal-content" tabindex="-1">${body}</div></section>`;}
    function render(lastAction){
      const [speaker,line]=HanaSearch.speech(s);
      const hotspot=([id,name,x,y,w,h,path])=>`<button type="button" class="room-hotspot ${peek?'revealed':''}" data-room-action="${id}" aria-label="${name} 조사" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%"><svg class="room-object-glow" viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path d="${path}"/></svg><span>${name}</span></button>`;
      host.innerHTML=RoomScene.render({place:'1999 · 운동장 골대 옆',goal:s.found?'다시 이름을 부르다':'약속한 자리에 남은 흔적',art:'assets/playground-field-cartoon-v3.png',alt:'흐린 겨울 운동장. 벤치 위 카메라, 골대와 창고가 보인다.',peek,speaker,line,
        selected:s.selected?`손에 든 물건: ${s.selected==='name'?'이름을 적은 종이':'촬영 쪽지'}`:'',spots:s.found&&!wide?'':spots.map(hotspot).join('')});
      const picture=host.querySelector('.room-picture');
      if(s.found&&!wide){
        picture.insertAdjacentHTML('beforeend',`<div class="hana-meeting"><button type="button" class="hana-person hana-eunho" data-room-action="eunho" aria-label="은호에게 말하거나 물건 보여 주기"><img src="assets/characters/eunho/${s.remembered?'happy':'worried'}.png" alt="하나와 마주 선 은호"><span>강은호</span></button><button type="button" class="hana-person hana-girl" data-room-action="hana" aria-label="하나에게 말하거나 물건 보여 주기"><img src="assets/hana-first-meeting-v1.png" alt="겨울 외투를 입고 캠코더를 든 윤하나"><span>윤하나</span></button></div>`);
        if(!s.talk)host.querySelector('.room-toolbar').insertAdjacentHTML('beforeend',button('field','주변 다시 살피기'));
      }
      if(s.heard&&!s.found&&!s.talk)picture.insertAdjacentHTML('beforeend',`<div class="hana-goal-link">${button('approach','골대 뒤로 돌아가기 →')}</div>`);
      if(!s.talk)picture.insertAdjacentHTML('beforeend',`<div class="hana-teacher-link">${button(s.escorted?'finish':'teacher',s.escorted?'함께 교무실로 →':'선생님께 말하기')}</div>`);
      if(s.selected)host.querySelector('.room-bag').insertAdjacentHTML('beforeend',button('stow','다시 넣기'));
      if(s.talk){
        host.querySelector('.room-speech').insertAdjacentHTML('beforeend',button('next','계속 ▼'));
        host.querySelector('.room-stage').inert=true;
        host.querySelector('.room-bag').inert=true;
      }
      if(bag){host.insertAdjacentHTML('beforeend',modal('내 가방',`${button('bag-close','가방 닫기')}<h2>내 가방</h2><div class="inventory-items"><article><div class="hana-name-paper">윤하나</div><h3>이름을 적은 종이</h3><p>방송실을 나오기 전, 잊지 않으려고 옮겨 적은 이름.</p>${button('select-name','이름 종이 사용하기')}</article>${s.note?`<article><h3>촬영 쪽지</h3><p>골대 옆에서 은호 기다리기. 촬영이 끝나면 카메라를 선생님께.</p>${button('select-note','촬영 쪽지 사용하기')}</article>`:''}</div>`));}
      if(s.detail==='camera'){host.insertAdjacentHTML('beforeend',modal('벤치 위 카메라',`${button('close','운동장으로 돌아가기')}<h2>벤치 위 카메라</h2><div class="hana-camera-closeup" role="img" aria-label="벤치 위 필름 카메라 확대"></div><p>카메라 끈에 접힌 쪽지가 끼워져 있다.</p><blockquote>골대 옆에서 은호 기다리기.<br>촬영이 끝나면 카메라를 선생님께.</blockquote>${s.note?'<p>쪽지는 가방에 챙겨 두었다.</p>':button('take-note','쪽지 챙기기')}`));}
      const overlay=host.querySelector('.room-modal');
      if(overlay){for(const child of host.children)if(child!==overlay)child.inert=true;overlay.querySelector('button').focus();}
      else if(s.talk)host.querySelector('[data-room-action="next"]').focus({preventScroll:true});
      else if(lastAction){const nextAction=lastAction==='take-note'?'camera':lastAction.startsWith('select-')?(s.found?'eunho':'bag'):lastAction==='next'?(s.found?'eunho':s.heard?'approach':'bag'):lastAction;host.querySelector(`[data-room-action="${nextAction}"]`)?.focus({preventScroll:true});}
    }
    function click(e){const b=e.target.closest('[data-room-action]');if(b&&host.contains(b))dispatch(b.dataset.roomAction);}
    function keydown(e){
      const modal=host.querySelector('.room-modal');
      if(e.key==='Escape'&&modal){e.preventDefault();dispatch(bag?'bag-close':'close');}
      if(e.key==='Tab'&&modal){const nodes=[...modal.querySelectorAll('button')];const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
    }
    host.classList.add('room-panel','hana-search-panel');host.addEventListener('click',click);host.addEventListener('keydown',keydown);render();
    return ()=>{finished=true;host.removeEventListener('click',click);host.removeEventListener('keydown',keydown);host.classList.remove('room-panel','hana-search-panel');};
  }
  root.HanaSearchView={mount};
})(typeof window==='undefined'?globalThis:window);
