import {DURATION,drawFrame,stateAt,PHASES} from './motion.js';
const canvas=document.querySelector('#canvas'),ctx=canvas.getContext('2d',{alpha:false});
const playButton=document.querySelector('#play'),restart=document.querySelector('#restart');
const seek=document.querySelector('#seek'),timeOutput=document.querySelector('#time'),phase=document.querySelector('#phase');
let playing=false,offset=0,started=0,animation=0;
const current=()=>playing?Math.min(DURATION,offset+(performance.now()-started)/1000):offset;
function render(t){const s=drawFrame(ctx,t);seek.value=t;timeOutput.value=`${t.toFixed(2).padStart(5,'0')} / ${DURATION.toFixed(2)}`;phase.textContent=s.phase;return s;}
function pause(){offset=current();playing=false;cancelAnimationFrame(animation);playButton.textContent='播放';render(offset);}
function tick(){const t=current();render(t);if(t>=DURATION){offset=DURATION;playing=false;playButton.textContent='重播';return;}animation=requestAnimationFrame(tick);}
function play(){if(playing)return;if(offset>=DURATION)offset=0;started=performance.now();playing=true;playButton.textContent='暂停';tick();}
function renderAt(t){pause();offset=Math.max(0,Math.min(DURATION,Number(t)||0));return render(offset);}
playButton.addEventListener('click',()=>playing?pause():play());
restart.addEventListener('click',()=>{renderAt(0);play();});
seek.addEventListener('input',()=>renderAt(seek.value));
document.addEventListener('keydown',e=>{if(e.target===seek)return;if(e.code==='Space'){e.preventDefault();playing?pause():play();}else if(e.code==='ArrowLeft'||e.code==='ArrowRight'){e.preventDefault();renderAt(current()+(e.code==='ArrowLeft'?-.1:.1));}});
window.__motionStudy={renderAt,play,pause,state:()=>({playing,time:current(),...stateAt(current())}),phases:PHASES,duration:DURATION};
render(0);
