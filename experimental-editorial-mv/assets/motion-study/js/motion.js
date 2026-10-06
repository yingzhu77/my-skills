// Original, content-neutral 2D study. Geometry is an absolute-time function.
// A seven-band compression hands its identical Path2D seam to an aperture.
export const DURATION=18;
export const WIDTH=1920,HEIGHT=1080;
const TAU=Math.PI*2;
const PAPER='#ede8de',INK='#252a2c',RED='#a82839',TEAL='#566d72';
const clamp=x=>Math.max(0,Math.min(1,x));
const mix=(a,b,u)=>a+(b-a)*u;
const smooth=(a,b,t)=>{const u=clamp((t-a)/(b-a));return u*u*(3-2*u)};
const quint=x=>{const u=clamp(x);return u<.5?16*u**5:1-(-2*u+2)**5/2};
const hash=(i,seed=0)=>{const x=Math.sin(i*127.1+seed*311.7)*43758.5453;return x-Math.floor(x)};

export const PHASES=[
  {start:0,end:1.3,label:'印刷带 / 建立主体'},
  {start:1.3,end:4.4,label:'印刷带 / 弯曲与积聚'},
  {start:4.4,end:8,label:'动作一 / 七条带压成同一道缝'},
  {start:8,end:8.45,label:'接续 / 同一路径保持'},
  {start:8.45,end:11.75,label:'动作二 / 缝张开并扩大'},
  {start:11.75,end:14.35,label:'动作二 / 内部墨形发展'},
  {start:14.35,end:17.65,label:'动作二 / 墨形随边界收束'},
  {start:17.65,end:18,label:'回收 / 同一道缝'},
];

// This descriptor is shared across the exact 8s handoff and the final return.
const SEAM={cx:960,cy:540,w:1430,h:7,warp:0,lean:0};
export function stateAt(time){
  const t=Math.max(0,Math.min(DURATION,Number.isFinite(time)?time:0));
  const compress=quint((t-4.4)/3.6);
  const open=quint((t-8.45)/3.3),release=quint((t-14.35)/3.3);
  const aperture= open*(1-release);
  return {t,actor:t<8?'bands':'aperture',phase:PHASES.find(p=>t>=p.start&&t<p.end)?.label??PHASES.at(-1).label,
    compress,aperture,open,release,
    boundary:{...SEAM,w:mix(SEAM.w,2260,aperture),h:mix(SEAM.h,528,aperture),warp:35*Math.sin((t-8)*.7)*aperture,lean:26*Math.sin((t-8)*.5)*aperture},
    inkProgress:smooth(8.65,13.8,t),inkReturn:release};
}

// Both sides use matched cubic controls. All bands converge onto the exact
// same descriptor; the next action consumes that descriptor as an aperture.
export function boundaryPath({cx,cy,w,h,warp=0,lean=0}){
  const p=new Path2D(),l=cx-w/2,r=cx+w/2;
  p.moveTo(l,cy-lean);
  p.bezierCurveTo(cx-w*.23,cy-h+warp,cx+w*.23,cy-h-warp,r,cy+lean);
  p.bezierCurveTo(cx+w*.23,cy+h-warp,cx-w*.23,cy+h+warp,l,cy-lean);
  p.closePath();return p;
}
function blobPath(cx,cy,r,phase,lobes,stretch,lean=0){
  const p=new Path2D(),points=[];
  for(let i=0;i<100;i++){
    const a=i/100*TAU;
    const radius=r*(1+.20*Math.sin(lobes*a+phase)+.10*Math.sin(2*a-phase*.63));
    points.push([cx+Math.cos(a)*radius*stretch,cy+Math.sin(a)*radius/stretch+lean*Math.cos(a)]);
  }
  // Quadratic midpoint interpolation closes a smooth path without corners.
  const first=[(points[0][0]+points[99][0])/2,(points[0][1]+points[99][1])/2];
  p.moveTo(...first);
  for(let i=0;i<points.length;i++){
    const q=points[i],next=points[(i+1)%points.length];
    p.quadraticCurveTo(q[0],q[1],(q[0]+next[0])/2,(q[1]+next[1])/2);
  }
  p.closePath();return p;
}
function drawPaper(ctx){
  ctx.fillStyle=PAPER;ctx.fillRect(0,0,WIDTH,HEIGHT);
  ctx.fillStyle='rgba(64,46,34,.035)';
  for(let i=0;i<1400;i++){
    const x=hash(i,1)*WIDTH,y=hash(i,2)*HEIGHT;
    ctx.fillRect(x,y,.6+hash(i,3)*1.1,.6+hash(i,4)*1.1);
  }
}
function rules(ctx,state){
  const leave=1-smooth(5.8,7.8,state.t),returning=smooth(16.9,17.85,state.t),alpha=.27*Math.max(leave,returning);
  ctx.strokeStyle=`rgba(40,44,46,${alpha})`;ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(80,90);ctx.lineTo(405,90);ctx.moveTo(1515,990);ctx.lineTo(1840,990);ctx.stroke();
  const circles=[[80,90],[1840,990]];
  for(const [x,y] of circles){ctx.beginPath();ctx.arc(x,y,6,0,TAU);ctx.stroke();}
}
function drawBands(ctx,s){
  const tension=smooth(1.3,4.4,s.t),amount=s.compress;
  const colors=[INK,INK,TEAL,RED,INK,TEAL,INK];
  for(let i=0;i<7;i++){
    const offset=(i-3)*115;
    const curve=(Math.sin(s.t*.85+i*.65)*86+Math.sin(s.t*.40+i)*32)*tension;
    const wave=Math.sin(s.t*.93+i*.85)*47*tension;
    const width=1480+(i%3-1)*75+Math.sin(s.t*.74+i*.55)*120*tension;
    const p=boundaryPath({cx:960,cy:mix(540+offset+wave,540,amount),w:mix(width,SEAM.w,amount),h:mix(35+tension*(8+10*Math.sin(s.t*.8+i)),SEAM.h,amount),warp:curve*(1-amount),lean:(i-3)*18*tension*(1-amount)});
    // Subject, paper grain clipping and outline all reuse this same instance.
    ctx.fillStyle=colors[i];ctx.fill(p);
    ctx.save();ctx.clip(p);ctx.fillStyle='rgba(237,232,222,.16)';
    for(let j=0;j<19;j++)ctx.fillRect(280+j*71+i*3,475+offset,1.3,135);
    ctx.restore();ctx.strokeStyle='rgba(25,29,32,.45)';ctx.lineWidth=.7;ctx.stroke(p);
  }
  // Consolidation removes overlapping ink plates before the handoff, so the
  // exact boundary appearance is identical at 8s on either side.
  const merge=smooth(7.45,7.98,s.t);
  if(merge>0){const p=boundaryPath(SEAM);ctx.globalAlpha=merge;ctx.fillStyle=INK;ctx.fill(p);ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.stroke(p);ctx.globalAlpha=1;}
}
function drawAperture(ctx,s){
  const p=boundaryPath(s.boundary),a=s.aperture;
  ctx.fillStyle=INK;ctx.fill(p);
  ctx.save();ctx.clip(p);
  if(a>.00001){
    // The interior isn't a different scene pasted behind a growing box. One
    // ink body stretches, divides through negative holes, then reforms.
    const stage=s.inkProgress,develop=smooth(11.75,14.35,s.t);
    const radius=mix(55,335,stage)*(.35+.65*a);
    const stretch=mix(1,2.5,s.release);
    const cx=960+Math.sin((s.t-8)*.64)*180*a;
    const cy=540+Math.sin((s.t-8)*.92)*50*a;
    const core=blobPath(cx,cy,radius,(s.t-8)*1.12,3,stretch,34*Math.sin(s.t*.6)*a);
    ctx.fillStyle=RED;ctx.fill(core);
    ctx.strokeStyle='rgba(237,232,222,.42)';ctx.lineWidth=1.6;ctx.stroke(core);
    ctx.save();ctx.clip(core);ctx.fillStyle='rgba(240,228,207,.07)';
    for(let i=0;i<650;i++)ctx.fillRect(hash(i,11)*WIDTH,hash(i,12)*HEIGHT,1.3,1.3);
    ctx.restore();
    // Negative shapes are drawn through the same ink body's contour. Their
    // orbit grows with the body, slows near the crest, then flattens together.
    ctx.save();ctx.clip(core);
    for(let i=0;i<4;i++){
      const angle=(s.t-8)*(.19+i*.031)+i*1.83;
      const orbit=radius*(.44+i*.048)*develop;
      const x=cx+Math.cos(angle)*orbit*stretch,y=cy+Math.sin(angle)*orbit/stretch;
      const hole=blobPath(x,y,(20+(i%3)*12+18*develop)*a,angle,2,1.7+i*.17+.8*s.release,18*Math.sin(angle));
      ctx.fillStyle=PAPER;ctx.fill(hole);
    }
    ctx.restore();
    // Long secondary curves fold into the same slit as the body contracts.
    for(let i=0;i<4;i++){
      const q=boundaryPath({cx:960+Math.sin(s.t*.42+i)*100*a,cy:540+(i-1.5)*116*a,w:1550+develop*460,h:mix(5,14,a),warp:Math.sin(s.t*.70+i*.8)*110*a,lean:(i-1.5)*22*a});
      ctx.strokeStyle=i%2?PAPER:'rgba(190,49,66,.66)';ctx.lineWidth=1.8+i*.3;ctx.stroke(q);
    }
  }
  ctx.restore();
  // An outline belongs to the very same path that is acting as the mask.
  ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.stroke(p);
  if(s.t>17.65){const seam=boundaryPath(SEAM);ctx.fillStyle=INK;ctx.fill(seam);}
}

export function drawFrame(ctx,time){
  const s=stateAt(time);
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,WIDTH,HEIGHT);drawPaper(ctx);
  rules(ctx,s);if(s.actor==='bands')drawBands(ctx,s);else drawAperture(ctx,s);ctx.restore();
  return s;
}
