(function(root){
 'use strict';
 const sizes={sand:2,small:7,large:12}, names={sand:'고운 모래',small:'작은 자갈',large:'큰 자갈'}, holes={fine:1,medium:4,wide:9};
 const predictionOptions=[['','예상해 보기'],['none','아무것도 안 내려온다'],['sand','모래만'],['sand,small','모래와 작은 자갈'],['small','작은 자갈만'],['all','전부']];
 function predictions(){return predictionOptions.map(option=>[...option]);}
 function storedMessage(kind){return `${names[kind]}${kind==='sand'?'를':'을'} 보관했어!`;}
 function finalExplanation(){return {text:'맞아! 알갱이보다 작은 체 눈은 통과할 수 없지. 크기가 다른 체를 차례로 써서 세 재료를 나눴어.',feedback:''};}
 function create(){return {groups:[Array(20).fill('sand').concat(Array(10).fill('small'),Array(6).fill('large'))],bins:{sand:[],small:[],large:[]},top:[],bottom:[],tool:null,steps:0,loaded:false};}
 function load(s,i){if(s.loaded||!s.groups[i]?.length)return s;return {...s,groups:s.groups.filter((_,n)=>n!==i),top:[...s.groups[i]],bottom:[],steps:0,tool:null,loaded:true};}
 function select(s,tool){if(!s.loaded||s.steps||!Object.hasOwn(holes,tool))return s;return {...s,tool};}
 function shake(s){
  if(!s.loaded||!s.tool||s.steps>=4)return s;
  const steps=s.steps+1, movable=s.top.filter(k=>sizes[k]<holes[s.tool]);
  const count=Math.ceil(movable.length/(5-steps));let moved=0;
  const top=[],bottom=[...s.bottom];
  s.top.forEach(k=>{if(sizes[k]<holes[s.tool]&&moved<count){bottom.push(k);moved++;}else top.push(k);});
  return {...s,steps,top,bottom};
 }
 function unload(s){if(!s.loaded||s.steps<4)return s;return {...s,groups:s.groups.concat([s.top,s.bottom].filter(g=>g.length)),top:[],bottom:[],loaded:false,tool:null,steps:0};}
 function store(s,i,kind){const g=s.groups[i];if(!Object.hasOwn(names,kind)||!g?.length||g.some(k=>k!==kind))return s;return {...s,groups:s.groups.filter((_,n)=>i!==n),bins:{...s.bins,[kind]:s.bins[kind].concat(g)}};}
 function complete(s){return !s.loaded&&!s.groups.length&&s.bins.sand.length===20&&s.bins.small.length===10&&s.bins.large.length===6;}
 function check(kind,answer){const value=String(answer).normalize('NFC').replace(/[\s.!。]/g,'');const accepted={mixture:['혼합물','혼합물입니다','혼합물이야'],property:['크기','알갱이크기','크기차이','알갱이의크기','알갱이크기차이','알갱이의크기차이'],reason:['크기']};return (accepted[kind]||[]).includes(value);}
 function describe(g){return Object.keys(names).filter(k=>g.includes(k)).map(k=>`${names[k]} ${g.filter(v=>v===k).length}개`).join(' + ')||'비어 있음';}
 function mount(host,onComplete){
  let s=create(),phase='mixture',message='',lastX=null,predicted=false;
  host.innerHTML=`<div class="lab-heading"><span>행사 준비 · 모래 그림과 테두리 장식</span><h2>세 가지 재료를 되찾자</h2><p>모래는 그림에, 작은 자갈은 테두리에, 큰 자갈은 받침에 써야 해.</p></div>
   <section class="lab-conversation"><strong class="lab-speaker"></strong><p class="lab-question"></p><form class="lab-answer-form"><label for="labAnswer">내 대답</label><input id="labAnswer" maxlength="30" autocomplete="off" placeholder="짧은 낱말로 답해 줘"><button type="submit" class="primary-btn">대답하기</button></form><div class="lab-reason" hidden><button type="button" data-reason="크기">체 눈보다 크기 때문</button><button type="button" data-reason="작기">체 눈보다 작기 때문</button></div><p class="lab-answer-feedback" role="status"></p><button type="button" class="icon-btn lab-hint">힌트 보기</button></section>
   <div class="lab-workbench" hidden><details class="lab-observe"><summary>돋보기로 알갱이 관찰하기</summary><p>모형 속 알갱이 크기: 모래 2 · 작은 자갈 7 · 큰 자갈 12<br>섞어도 각각의 모양과 크기는 그대로예요. 숫자는 실제 mm가 아닌 비교용 모형 값입니다.</p></details>
   <div class="lab-bins"></div><div class="lab-groups"></div>
   <div class="sieve-tools" role="group" aria-label="체 선택"><button type="button" data-tool="fine">체 눈 1<br><small>촘촘한 체</small></button><button type="button" data-tool="medium">체 눈 4<br><small>중간 체</small></button><button type="button" data-tool="wide">체 눈 9<br><small>성긴 체</small></button></div>
   <div class="lab-predict"><label for="labPrediction">은호: 아래로 무엇이 내려올 것 같아?</label><select id="labPrediction">${predictionOptions.map(([value,label])=>`<option value="${value}">${label}</option>`).join('')}</select><button type="button" class="icon-btn" data-action="predict">예상 남기기</button></div>
   <canvas width="640" height="270" aria-label="체 위와 받침의 알갱이 모형"></canvas><p class="lab-status" role="status"></p>
   <div class="lab-actions"><button type="button" data-action="shake" class="primary-btn">체 흔들기</button><button type="button" data-action="unload" class="icon-btn">위·아래 재료를 각각 꺼내기</button><button type="button" data-action="finish" class="primary-btn" hidden>친구들에게 설명하기</button></div>
   <small>체 위를 좌우로 드래그하거나 흔들기 버튼을 누르세요. 분리 순서는 자유예요.<br>실제 활동에서는 마스크를 착용하고 먼지가 날리지 않게 조심해요.</small></div>
   <button type="button" class="primary-btn lab-done" hidden>재료를 들고 돌아가기</button>`;
  const q=sel=>host.querySelector(sel), canvas=q('canvas'),ctx=canvas.getContext('2d');
  const conversation=q('.lab-conversation'),bench=q('.lab-workbench'),form=q('form'),input=q('input');
  function lesson(){
   q('.lab-answer-feedback').textContent='';
   q('.lab-reason').hidden=phase!=='reason';form.hidden=phase==='reason';
   q('.lab-speaker').textContent=phase==='mixture'?'태오':phase==='property'?'은호':'소미';
   q('.lab-question').textContent=phase==='mixture'?'섞였는데 모래랑 자갈은 그대로네. 두 가지 이상의 물질이 각각의 성질을 지닌 채 섞인 것을 뭐라고 하지?':phase==='property'?'색은 비슷한데… 체로 나눌 때는 알갱이의 어떤 성질 차이를 이용하는 거야? 한 낱말로 알려 줘.':'기록을 남겨 두자. 체에 남은 작은 자갈은 사용했던 체 눈보다 왜 통과하기 어려웠을까?';
   input.value='';
  }
  function answer(value){
   if(!check(phase,value)){q('.lab-answer-feedback').textContent=phase==='mixture'?'소미: 두 가지 이상이 섞여 있지만 각 물질의 성질은 남아 있어. ‘혼○물’을 생각해 봐.':phase==='property'?'은호: 색이 아니라, 알갱이가 구멍을 통과할 수 있는지 생각해 봐.':'소미: 알갱이가 구멍보다 작다면 아래로 내려갈 수 있겠지?';return;}
   if(phase==='mixture'){phase='property';lesson();q('.lab-answer-feedback').textContent='태오: 맞아, 혼합물! 이제 나눌 방법을 생각해 보자.';}
   else if(phase==='property'){phase='experiment';conversation.hidden=true;bench.hidden=false;message='소미: 크기 차이를 이용하자. 먼저 재료를 체에 넣어 봐.';draw();}
   else if(phase==='reason'){const final=finalExplanation();phase='done';q('.lab-question').textContent=final.text;q('.lab-answer-feedback').textContent=final.feedback;q('.lab-reason').hidden=true;q('.lab-hint').hidden=true;q('.lab-done').hidden=false;}
  }
  form.onsubmit=e=>{e.preventDefault();if(!e.isComposing)answer(input.value);};
  host.querySelectorAll('[data-reason]').forEach(b=>b.onclick=()=>answer(b.dataset.reason));
  q('.lab-hint').onclick=()=>{q('.lab-answer-feedback').textContent=phase==='mixture'?'소미: 정리하면 ‘혼합물’이야. 이제 직접 적어 보자.':phase==='property'?'태오: 알갱이의 ‘크기’가 다르잖아.':'소미: 체 눈보다 큰 알갱이는 체 위에 남아.';};
  q('.lab-done').onclick=()=>{if(phase==='done'){phase='closed';onComplete();}};
  function draw(){
   q('.lab-bins').textContent=Object.keys(names).map(k=>`${names[k]} 통 ${s.bins[k].length}/${k==='sand'?20:k==='small'?10:6}`).join('　');
   q('.lab-groups').innerHTML=s.groups.map((g,i)=>`<div class="lab-group"><b>재료 접시 ${i+1}</b><span>${describe(g)}</span><div><button type="button" data-load="${i}" ${s.loaded?'disabled':''}>체에 넣기</button>${Object.keys(names).map(k=>`<button type="button" data-store="${i}" data-kind="${k}">${names[k]} 통으로</button>`).join('')}</div></div>`).join('');
   host.querySelectorAll('[data-load]').forEach(b=>b.onclick=()=>{s=load(s,Number(b.dataset.load));predicted=false;message='은호: 체를 고르고 아래로 내려올 재료를 예상해 보자.';draw();});
   host.querySelectorAll('[data-store]').forEach(b=>b.onclick=()=>{const next=store(s,Number(b.dataset.store),b.dataset.kind);message=next===s?'소미: 이 통에 담을 재료만 있는지 봐. 섞여 있다면 다시 체에 넣어 나눠 보자.':storedMessage(b.dataset.kind);s=next;draw();});
   ctx.clearRect(0,0,640,270);ctx.fillStyle='#142238';ctx.fillRect(0,0,640,270);
   ctx.font='16px sans-serif';ctx.fillStyle='#ffe5a6';ctx.fillText('체 위',16,56);ctx.fillText('받침',16,202);
   ctx.strokeStyle='#d7c08f';ctx.lineWidth=3;
   for(const y of [125,250]){ctx.beginPath();ctx.moveTo(100,y-50);ctx.lineTo(100,y);ctx.lineTo(600,y);ctx.lineTo(600,y-50);ctx.stroke();}
   const gap=s.tool?holes[s.tool]*4:16;ctx.lineWidth=1;
   for(let x=105;x<598;x+=gap){ctx.beginPath();ctx.moveTo(x,116);ctx.lineTo(x,135);ctx.stroke();}
   function grains(g,y){g.forEach((k,i)=>{ctx.fillStyle=k==='sand'?'#efd69c':k==='small'?'#a6c3cf':'#778d9e';ctx.beginPath();ctx.ellipse(125+(i*37)%444,y+(i%3)*10,sizes[k],Math.max(3,sizes[k]*.7),.2,0,Math.PI*2);ctx.fill();});}
   grains(s.top,81);grains(s.bottom,199);
   q('.lab-status').textContent=message+ (s.loaded?`\n흔들기 ${s.steps}/4 · 체 위: ${describe(s.top)} / 아래: ${describe(s.bottom)}`:'');
   host.querySelectorAll('[data-tool]').forEach(b=>{b.disabled=!s.loaded||s.steps>0;b.setAttribute('aria-pressed',String(s.tool===b.dataset.tool));});
   q('[data-action="shake"]').disabled=!s.loaded||!s.tool||!predicted||s.steps===4;
   q('[data-action="unload"]').disabled=!s.loaded||s.steps!==4;
   q('[data-action="finish"]').hidden=!complete(s);
   q('[data-action="predict"]').disabled=!s.tool||s.steps>0;
   q('select').disabled=!s.tool||s.steps>0;
  }
  host.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{s=select(s,b.dataset.tool);predicted=false;q('select').value='';message='소미: 체 눈과 알갱이 크기를 비교해 봐.';draw();});
  let prediction='';
  q('[data-action="predict"]').onclick=()=>{if(!q('select').value){message='은호: 먼저 예상 하나를 골라 줘.';draw();return;}prediction=q('select').value;predicted=true;message='은호: 좋아, 직접 확인해 보자. 예상이 달라도 괜찮아.';draw();};
  function step(){if(!predicted)return;s=shake(s);message=s.steps<4?'조금씩 알갱이가 내려오고 있어.':`결과: ${describe(s.bottom)}. ${prediction==='none'&&!s.bottom.length?'예상대로 아무것도 통과하지 않았네.':'처음 예상과 비교해 보자.'} 위·아래 재료를 각각 꺼낸 뒤 필요한 쪽을 다시 분리해.`;draw();}
  q('[data-action="shake"]').onclick=step;
  q('[data-action="unload"]').onclick=()=>{s=unload(s);predicted=false;message='각 접시를 살펴보고, 다시 체에 넣거나 알맞은 통에 담아 줘.';draw();};
  q('[data-action="finish"]').onclick=()=>{if(complete(s)){phase='reason';bench.hidden=true;conversation.hidden=false;lesson();}};
  canvas.onpointerdown=e=>{lastX=e.clientX;canvas.setPointerCapture(e.pointerId);};
  canvas.onpointermove=e=>{if(lastX!==null&&Math.abs(e.clientX-lastX)>35){lastX=e.clientX;step();}};
  canvas.onpointerup=canvas.onpointercancel=()=>{lastX=null;};
  lesson();draw();
 }
 const api={create,load,select,shake,unload,store,complete,check,predictions,storedMessage,finalExplanation,mount};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Sieve=api;
})(typeof window==='undefined'?globalThis:window);
