const R=require('./chapter2-v3-state');
function drain(s){for(let i=0;i<200;i++){if(s.dialogue.length)s=R.act(s,{type:'next'});else if(s.question==='story-choice')s=R.act(s,{type:'story-choice',value:'0'});else return s;}throw Error('dialogue loop');}
const go=(s,type,target,value)=>drain(R.act(s,{type,target,value}));
function work(s,fields){for(const [target,value] of fields){s=go(s,'work-set',target,value);if((s.question==='manuscript'&&target==='error')||(s.question==='weather-evidence'&&target==='direction'&&!s.work['weather-evidence'].directionDone))s=go(s,'work-check');}return go(s,'work-check');}
const wind=[['direction','right'],['reason','ribbon']];
const manuscript=[['error','4'],['repair','condense']];
const weather=[['direction','right'],['claims','1'],['claims','2']];
const editing=[['dayTemp','land'],['nightTemp','sea'],['dayPressure','sea'],['nightPressure','land'],['dayWind','land'],['nightWind','sea'],['order','day-night']];
module.exports={R,drain,go,work,wind,manuscript,weather,editing};
