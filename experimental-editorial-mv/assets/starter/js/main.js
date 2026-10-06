// New reusable director around the upstream MIT rendering engines.
import {createGL} from './gl.js';
import {Press, defaults} from './print.js';
import {Sea, seaDefaults, seaHeightJS} from './sea.js';
import {AudioEngine} from './audio.js';
import {cam, floatCard, look} from './camera.js';
import {IMG, FONT, photo, text, vtext, ink, K, A, line, cropMarks} from './draw.js';
import {clamp, hash} from './util.js';
import {makeDemoImage} from './placeholders.js';

FONT.min = '"Yu Mincho", "Noto Serif CJK JP", serif';
FONT.goth = '"Yu Gothic", "Microsoft YaHei", sans-serif';
FONT.mono = 'Consolas, monospace';
FONT.serif = 'Georgia, serif';
const $ = id => document.getElementById(id);
const view = $('view');
const audio = new AudioEngine();
const sizes = [[1280,720],[1600,900],[1920,1080]];
let quality = 0, W = 1280, H = 720;
let gl, press, sea, config, assets, currentMode = 'paper', ready = false;
let duration = 20, lastTime = -1, recorder = null;
const photoCanvas = document.createElement('canvas');
const inkCanvas = document.createElement('canvas');
const P = photoCanvas.getContext('2d');
const I = inkCanvas.getContext('2d');

async function getJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

function destroyTarget(target) {
  if (!target) return;
  gl.deleteFramebuffer(target.fb);
  gl.deleteTexture(target.tex);
}

function resize(index) {
  quality = index;
  [W,H] = sizes[index];
  if (press) {
    for (const rt of [press.paperRT,press.printRT,...press.fb,press.pageRT]) destroyTarget(rt);
    press.pageRT = null;
    destroyTarget(sea.rt);
    sea.rt = null;
  }
  for (const canvas of [view,photoCanvas,inkCanvas]) { canvas.width = W; canvas.height = H; }
  if (press) press.resize(W,H);
  $('quality').textContent = `${H}p`;
  lastTime = -1;
}

function syntheticTrack() {
  audio.ensureCtx();
  const rate = audio.ctx.sampleRate;
  const buffer = audio.ctx.createBuffer(1, Math.ceil(duration * rate), rate);
  const samples = buffer.getChannelData(0);
  const eighth = 60 / config.bpm / 2;
  // Original, deterministic percussion and sustained notes; no source-song samples.
  for (let n = 0; n < samples.length; n++) {
    const t = n / rate, beat = t * config.bpm / 60;
    const kickAge = (beat % 1) * 60 / config.bpm;
    const eighthIndex = Math.floor(t / eighth);
    const hatAge = t - eighthIndex * eighth;
    const snareAge = ((beat + 1) % 2) * 60 / config.bpm;
    const noise = hash(n, 61) * 2 - 1;
    const kick = Math.sin(2*Math.PI*(48*kickAge + 45*(1-Math.exp(-kickAge*22))/22))*Math.exp(-kickAge*22);
    const hat = noise*Math.exp(-hatAge*180);
    const snare = noise*Math.exp(-snareAge*38);
    const tone = Math.sin(2*Math.PI*110*t)*0.12 + Math.sin(2*Math.PI*164.81*t)*0.055;
    const fade = clamp(t / 0.15) * clamp((duration-t) / 0.5);
    samples[n] = fade*(kick*0.25 + hat*0.04 + snare*0.085 + tone);
  }
  audio.buf = buffer;
}

function setupTextures() {
  const moon = document.createElement('canvas');
  moon.width = moon.height = 256;
  const mx = moon.getContext('2d');
  mx.fillStyle = '#000'; mx.fillRect(0,0,256,256);
  const image = IMG.m_redmoon, r = image.naturalWidth*0.1162*1.015;
  mx.drawImage(image,image.naturalWidth*.4961-r,image.naturalHeight*.5439-r,2*r,2*r,0,0,256,256);
  sea.moonTex = sea.imageTexture(moon);
  sea.cityTex = sea.imageTexture(IMG.m_tokyo_skyline,true);
  // Respect hardware capacity before calling the original uploader.
  if (assets.length > gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS)) throw new Error('纹理层数超出设备限制');
  sea.loadCards(IMG,Math.min(512,gl.getParameter(gl.MAX_TEXTURE_SIZE)));
}

function rhythm(t) {
  const beat = t * config.bpm / 60;
  const seconds = 60 / config.bpm;
  return {beat, sixteenth:Math.floor(beat*4),
    kick:Math.exp(-(beat%1)*seconds/0.11),
    snare:Math.exp(-((beat+1)%2)*seconds/0.09),
    hat:Math.exp(-(beat*2%1)*seconds/2/0.04)};
}

function sceneAt(t) {
  return config.timeline.find(scene => t >= scene.start && t < scene.end) || config.timeline.at(-1);
}

function resetCanvas(context, isInk) {
  context.setTransform(1,0,0,1,0,0);
  context.globalAlpha = 1;
  context.filter = 'none';
  context.globalCompositeOperation = 'source-over';
  context.clearRect(0,0,W,H);
  if (isInk) { context.fillStyle = '#000'; context.fillRect(0,0,W,H); }
  context.setTransform(W/1920,0,0,W/1920,0,0);
  if (isInk) context.globalCompositeOperation = 'lighter';
}

function furniture(t, label, light = false) {
  text(I,'AFTERIMAGE / 余像',72,82,{font:`500 22px ${FONT.mono}`,color:ink(K)});
  text(I,label,1848,82,{font:`500 22px ${FONT.mono}`,color:ink(A),align:'right'});
  line(I,72,108,1848,108,1,ink(K));
  text(I,`${t.toFixed(2).padStart(5,'0')} SEC  /  ${config.bpm} BPM`,72,1020,{font:`20px ${FONT.mono}`,color:ink(K)});
  text(I,light?'記憶は、光になる。':'像は、紙に残る。',1848,1020,{font:`24px ${FONT.min}`,color:ink(K),align:'right'});
}

function paperPage(t, label = '01 / PRINT') {
  P.fillStyle = '#fff'; P.fillRect(0,0,1920,1080);
  photo(P,'m_hand_shell',100,180,990,620,{filter:'grayscale(1) contrast(1.2)'});
  photo(P,'m_iris',1160,180,480,270,{filter:'grayscale(1)'});
  photo(P,'m_float_white',1160,475,480,325,{filter:'grayscale(1)'});
  vtext(I,'余像',1740,186,102,{color:ink(A)});
  text(I,'AFTER',130,948,{font:`italic 104px ${FONT.serif}`,color:ink(K)});
  text(I,'IMAGE',650,948,{font:`italic 104px ${FONT.serif}`,color:ink(A)});
  text(I,'fig.01 — 触れたもの / a fragment returns',100,836,{font:`20px ${FONT.mono}`,color:ink(K)});
  line(I,1088,180,1088,940,1,ink(K));
  cropMarks(I,100,180,990,620,18,10,ink(K));
  furniture(t,label);
}

function compose(t) {
  resetCanvas(P,false); resetCanvas(I,true);
  const F = defaults(), S = seaDefaults(), X = rhythm(t), scene = sceneAt(t);
  currentMode = scene.mode;
  const progress = clamp((t-scene.start)/(scene.end-scene.start));
  F.cell = 7; F.trail = 0; F.vig = 0.15; F.grainAmt = 0.025 + X.hat*0.01;
  F.offA = [X.snare*3,-X.snare*1.5]; F.offB = [-X.snare*2,X.snare];
  look(S,'calm'); S.scale = 0.6; S.city = 0.45;
  S.cam = cam([0,2.4,0],0,-0.04,0,56);
  const seaT = t*0.72;
  if (scene.mode === 'paper') {
    paperPage(t);
  } else if (scene.mode === 'window') {
    paperPage(t,'02 / WINDOW');
    P.save(); P.globalCompositeOperation = 'destination-out';
    P.beginPath(); P.arc(690,480,140+260*progress,0,Math.PI*2); P.fill(); P.restore();
    S.on = true; F.backMode = 1;
    S.cam.pos[1] = 1.8 + Math.sin(progress*Math.PI*2)*0.5;
    S.wave = [0.55,4,0.16,0.7];
  } else if (scene.mode === 'printed-space') {
    S.on = true; F.backMode = 2; F.inkLight = 1; F.tone = [1.15,0.65,0,0.78];
    S.views = [
      {rect:[0,0,960,540],cam:cam([0,3,0],0,-0.12,0,58)},
      {rect:[960,0,960,540],cam:cam([0,8,0],0,-1.4,0,60)},
      {rect:[0,540,960,540],cam:cam([0,-1.8,0],0,0.6,0,64)},
      {rect:[960,540,960,540],cam:cam([0,2,0],0.7,-0.08,0,38)}
    ];
    line(I,960,108,960,950,3,ink(A)); line(I,72,540,1848,540,3,ink(A));
    text(I,'同じ世界、四つの視点。',100,940,{font:`56px ${FONT.min}`,color:ink(A)});
    furniture(t,'03 / CONTACT SHEET');
  } else {
    paperPage(t,'04 / OBJECT');
    S.on = true; S.pageIn3D = true; F.backMode = 1;
    S.cam = cam([0,6.0+progress*3,4],0,-0.62,progress*0.06,58);
    const height = (x,z) => seaHeightJS(x,z,S,seaT);
    S.cards = [{page:true,...floatCard(height,0,-5,2.9,2.9*9/16,t*.03)}];
    for (const [index,id] of ['m_float_white','m_hand_shell','m_iris'].entries()) {
      const asset = assets.find(item => item.id === id);
      S.cards.push({img:id,...floatCard(height,(index-1)*4.2,-8-index*2,1.1,1.1*asset.height/asset.width,index*.2),alpha:.9});
    }
  }
  // At the end of every second bar, one sixteenth foreshadows a later motif.
  if (scene.mode === 'paper' && X.sixteenth%32 === 31) {
    P.clearRect(0,0,1920,1080);
    photo(P,'m_iris',0,0,1920,1080,{filter:'grayscale(1) contrast(1.3)'});
    F.neg = 1;
  }
  if (S.pageIn3D) {
    const page = press.printPage(photoCanvas,inkCanvas,F,t);
    const background = sea.render(S,W,H,t,seaT,page.tex);
    press.render(photoCanvas,inkCanvas,F,t,background.tex,{backOnly:true});
  } else if (S.on) {
    const background = sea.render(S,W,H,t,seaT,null);
    press.render(photoCanvas,inkCanvas,F,t,background.tex);
  } else press.render(photoCanvas,inkCanvas,F,t);
  lastTime = t;
}

function paint(t) {
  t = clamp(t,0,duration);
  if (Math.abs(t-lastTime)>0.000001) compose(t);
  $('seek').value = String(t);
  $('time').textContent = `${t.toFixed(2)} / ${duration.toFixed(2)}`;
  $('play').textContent = audio.playing ? '暂停' : '播放';
}

function seek(t) {
  audio.seek(t); press.clearHistory = true; lastTime = -1; paint(t);
}

function toggle() {
  if (!ready) return;
  audio.playing ? audio.pause() : audio.play();
  $('play').textContent = audio.playing ? '暂停' : '播放';
}

function stopRecording() {
  if (recorder && recorder.state !== 'inactive') recorder.stop();
}

function startRecording() {
  if (!ready) return;
  if (recorder) { stopRecording(); return; }
  if (typeof MediaRecorder === 'undefined' || !view.captureStream) throw new Error('此浏览器不支持画布录制');
  const mime = ['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm']
    .find(type => MediaRecorder.isTypeSupported(type));
  if (!mime) throw new Error('此浏览器没有可用的 WebM 编码器');
  const video = view.captureStream(30);
  const stream = new MediaStream([...video.getVideoTracks(),...audio.recDest.stream.getAudioTracks()]);
  const active = new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:8e6});
  recorder = active;
  const chunks = [];
  active.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
  active.onstop = () => {
    const blob = new Blob(chunks,{type:mime});
    window.__editorial.lastRecording = {bytes:blob.size,type:mime,blob};
    if (blob.size) {
      const url = URL.createObjectURL(blob), link = document.createElement('a');
      link.href = url; link.download = 'afterimage.webm'; link.click();
      setTimeout(() => URL.revokeObjectURL(url),10000);
    } else $('status').textContent = '录制未生成有效数据，请在播放时重试。';
    video.getVideoTracks().forEach(track => track.stop());
    if (recorder === active) { recorder = null; $('record').textContent = '录制'; }
  };
  active.onerror = event => { $('status').textContent = event.error?.message || '录制失败'; };
  audio.pause(); seek(0); audio.play(); active.start(250);
  $('record').textContent = '停止录制';
}

async function boot() {
  try {
    [config,assets] = await Promise.all([getJSON('data/project.json'),getJSON('data/assets.json')]);
    duration = config.duration;
    if (!Number.isFinite(duration) || duration<=0 || !Number.isFinite(config.bpm) || config.bpm<=0)
      throw new Error('时长与 BPM 必须为正数');
    if (!config.timeline.length || config.timeline[0].start!==0 || config.timeline.at(-1).end!==duration
      || config.timeline.some((scene,i)=>scene.end<=scene.start || (i>0 && scene.start!==config.timeline[i-1].end)))
      throw new Error('分镜必须连续覆盖完整时长');
    resize(0); gl = createGL(view); press = new Press(gl,W,H); sea = new Sea(gl);
    await Promise.all(assets.map(async asset => {
      const image = new Image();
      image.src = asset.procedural ? makeDemoImage(asset) : asset.file;
      await image.decode(); IMG[asset.id] = image;
    }));
    setupTextures(); syntheticTrack();
    const deadline = performance.now()+60000;
    while (!sea.prog.ready()) {
      if (performance.now()>deadline) throw new Error('画面编译超时，请检查 WebGL2 环境');
      await new Promise(resolve => setTimeout(resolve,50));
    }
    ready = true; $('seek').max = String(duration);
    for (const id of ['play','seek','quality','record','audio-file']) $(id).disabled = false;
    $('status').textContent = '准备完毕 · 纸面 → 窗 → 四个视点 → 空间中的纸';
    paint(0);
    function loop() { if (ready) paint(audio.time()); requestAnimationFrame(loop); }
    requestAnimationFrame(loop);
  } catch (error) { $('status').textContent = `加载失败：${error.message}`; console.error(error); }
}

$('play').addEventListener('click',toggle);
$('seek').addEventListener('input',event => seek(Number(event.target.value)));
$('quality').addEventListener('click',() => { resize((quality+1)%sizes.length); paint(audio.time()); });
$('record').addEventListener('click',() => { try { startRecording(); } catch (error) { $('status').textContent = error.message; } });
$('audio-file').addEventListener('change',async event => {
  const file = event.target.files[0]; if (!file) return;
  stopRecording(); audio.pause();
  try {
    await audio.loadFile(file); duration = audio.duration;
    const count = config.timeline.length;
    config.timeline.forEach((scene,i) => { scene.start=duration*i/count; scene.end=duration*(i+1)/count; });
    $('seek').max = String(duration); seek(0);
    $('status').textContent = `${file.name} · 演示仍按 ${config.bpm} BPM，正式制作需重新标注节奏。`;
  } catch (error) { $('status').textContent = `音频加载失败：${error.message}`; }
});
audio.onEnded = () => { stopRecording(); $('play').textContent = '播放'; };
window.addEventListener('keydown',event => {
  if (event.target instanceof HTMLInputElement || !ready) return;
  if (event.code==='Space') { event.preventDefault(); toggle(); }
  if (event.key.toLowerCase()==='q') $('quality').click();
  if (event.key.toLowerCase()==='r') $('record').click();
});
window.__editorial = {
  get ready() { return ready; }, audio,
  renderAt(t) { audio.pause(); seek(t); return currentMode; },
  state() { return {ready,time:audio.time(),mode:currentMode,width:W,height:H,duration}; },
  startRecording, stopRecording, lastRecording:null,
};
boot();
