(function(root){
  'use strict';
  const talks={
    arrival:[['태오','골대 옆에서 기다린다며. 앞쪽에는 아무도 없는데?'],['소미','방송실에서 찾은 촬영 메모에는 분명 여기라고 적혀 있었어. 선생님도 오고 계셔. 조금만 더 살펴보자.']],
    sound:[['태오','하나야! 여기 있어?'],['윤하나','……은호도 왔어?'],['소미','골대 뒤에서 들렸어. 돌아가 보자.']],
    found:[['강은호','여기 있었구나. 그런데…… 미안, 우리가 아는 사이야?'],['윤하나','아까도 그렇게 물었어. 그래서 다시 부르기가 무서웠어.'],['소미','은호야, 아까 네가 잊지 않으려고 적어 둔 이름이 있어. 우리 가방에 넣었잖아.']],
    uncertain:[['강은호','목소리는 낯설지 않은데…… 이름이 생각 안 나.'],['윤하나','억지로 아는 척 안 해도 돼. 그래도, 그냥 가지는 말아 줘.']],
    hana:[['윤하나','카메라를 챙겨서 교실로 가려다가…… 은호가 날 못 알아봐서 여기 앉아 있었어.'],['소미','우린 네 이름을 찾아서 온 거야. 은호도 다시 떠올릴 수 있는지 같이 해 보자.']],
    hanaNote:[['윤하나','내가 카메라 끈에 끼워 둔 쪽지야. 기다리다가 벤치에 두고 왔어. 챙겨 줘서 고마워.'],['소미','카메라는 선생님과 같이 가져가자. 쪽지는 우리가 보관하고 있을게.']],
    memory:[['강은호','윤하나…… 윤하나.'],['윤하나','촬영할 때 네가 식용유를 ‘식용우’라고 읽었잖아. 내가 웃어서 다시 찍었고.'],['강은호','……음머! 내가 소 흉내까지 냈지. 너 웃느라 원고 못 읽었잖아.'],['윤하나','맞아. 그 얘기, 나 말고 기억하는 사람이 생겼네.'],['소미','이름만 읽었을 때는 망설였는데, 그때 이야기를 들으니까 기억났구나. 종이는 버리지 말자.']],
    teacher:[['1999년 담임','하나야, 많이 놀랐겠다. 나와 교무실로 가자. 보호자께 연락하고 오늘 일을 함께 적어 두겠다.'],['윤하나','은호도 같이 가면 안 돼요? 또 못 알아볼까 봐…….'],['강은호','같이 갈게. 내가 또 멈칫하면 이 종이부터 보여 줘.']],
    earlyTeacher:[['1999년 담임','선생님은 골대 반대쪽을 확인하마. 너희는 서로 보이는 곳에서 같이 찾아보렴.'],['소미','네. 누가 대답하면 바로 말씀드릴게요.']],
    wrong:[['태오','종이를 여기 대는 건 아닌 것 같아. 구겨지겠어.'],['소미','그대로 갖고 있어. 이 이름을 잊어버린 친구에게 보여 주면 어떨까?']],
    ball:[['태오','공이 여기 있었네. 은호야, 네 거야?'],['강은호','응. 지금은 두자. 사람부터 찾아야지.']],
    shed:[['소미','창고 문은 닫혀 있어. 안에서는 아무 소리도 안 나.'],['태오','여기서 열쇠 찾고 있을 때는 아니겠다. 약속한 곳부터 더 보자.']],
    flag:[['태오','깃발만 펄럭여. 운동장이 조용하니까 소리가 더 크게 들린다.'],['소미','잠깐 조용히 있어 보자. 누가 대답하는지 들을 수 있게.']]
  };
  function initial(saved){
    const s={version:1,note:false,heard:false,found:false,remembered:false,escorted:false,complete:false,selected:'',talk:'arrival',beat:0,detail:'',speaker:'소미',message:''};
    if(!saved||saved.version!==1)return s;
    for(const key of ['note','heard','found','remembered','escorted','complete'])s[key]=saved[key]===true;
    s.found=s.found&&s.heard;s.remembered=s.remembered&&s.found;s.escorted=s.escorted&&s.remembered;s.complete=s.complete&&s.escorted;
    s.selected=['name','note'].includes(saved.selected)&&(saved.selected!=='note'||s.note)?saved.selected:'';
    s.talk=Object.hasOwn(talks,saved.talk)?saved.talk:'';
    s.beat=s.talk&&Number.isInteger(saved.beat)?Math.max(0,Math.min(saved.beat,talks[s.talk].length-1)):0;
    s.detail=saved.detail==='camera'?'camera':'';
    // Rebuild visible speech from authored content, never arbitrary save text.
    s.message=s.remembered?'선생님이 우리 쪽으로 오셨어. 하나와 같이 가자.':s.found?'이름을 적은 종이가 가방에 있어.':s.heard?'골대 뒤쪽에서 목소리가 들렸어.': '약속한 골대 옆을 조금 더 살펴보자.';
    return s;
  }
  function act(state,action){
    const s={...state};
    function talk(id){s.talk=id;s.beat=0;s.detail='';return s;}
    if(action==='next'&&s.talk){
      if(s.beat+1<talks[s.talk].length)s.beat++;
      else {const done=s.talk;s.talk='';s.beat=0;
        if(done==='sound')s.heard=true;
        if(done==='memory')s.remembered=true;
        if(done==='teacher')s.escorted=true;
        s.speaker='소미';s.message=s.escorted?'하나도 일어났어. 함께 교무실로 가자.':s.remembered?'선생님이 우리 쪽으로 오셨어. 하나와 같이 가자.':s.found?'이름을 적은 종이가 가방에 있어.':s.heard?'골대 뒤쪽에서 목소리가 들렸어.':'방송실에서 찾은 촬영 약속은 골대 옆이었어.';
      }return s;
    }
    if(s.talk)return s;
    if(action==='stow'){s.selected='';return s;}
    if(action==='select-name'){s.selected='name';s.detail='';return s;}
    if(action==='select-note'&&s.note){s.selected='note';s.detail='';return s;}
    if(action==='close'){s.detail='';return s;}
    if(action==='take-note'&&s.detail==='camera'){s.note=true;s.detail='';s.speaker='소미';s.message='쪽지는 따로 챙겼어. 카메라는 주인에게 물어보고 가져가자.';return s;}
    if(action==='finish'){if(s.escorted)s.complete=true;return s;}
    if(action==='eunho'&&s.found){
      if(s.selected==='name'){s.selected='';return talk('memory');}
      if(s.selected==='note'){s.selected='';s.speaker='강은호';s.message='이 촬영 메모는 봤어. 그런데 이름이…… 아까 따로 적은 종이도 있지?';return s;}
      return talk(s.remembered?'memory':'uncertain');
    }
    if(action==='hana'&&s.found){const id=s.selected==='note'?'hanaNote':'hana';s.selected='';return talk(id);}
    if(s.selected&&['goal','camera','ball','shed','flag','approach'].includes(action))return talk('wrong');
    if(action==='camera'){s.detail='camera';return s;}
    if(action==='goal')return talk(s.found?'uncertain':'sound');
    if(action==='approach'&&s.heard){s.found=true;return talk('found');}
    if(action==='teacher')return talk(s.remembered?'teacher':'earlyTeacher');
    if(['ball','shed','flag'].includes(action))return talk(action);
    return s;
  }
  function speech(s){return s.talk?talks[s.talk][s.beat]:[s.speaker,s.message];}
  const api={initial,act,speech,talks};if(typeof module!=='undefined')module.exports=api;root.HanaSearch=api;
})(typeof window==='undefined'?globalThis:window);
