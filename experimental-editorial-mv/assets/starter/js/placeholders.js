// Original, deterministic illustration placeholders. No bundled bitmap assets.
export function makeDemoImage(asset) {
  const canvas = document.createElement('canvas');
  canvas.width = asset.width; canvas.height = asset.height;
  const c = canvas.getContext('2d'), w = canvas.width, h = canvas.height;
  const index = ['m_hand_shell','m_iris','m_float_white','m_redmoon','m_tokyo_skyline','m_wave_close'].indexOf(asset.id);
  c.fillStyle = '#182832'; c.fillRect(0,0,w,h);
  c.strokeStyle = '#cbd5cd'; c.lineWidth = 2;
  if (asset.id === 'm_redmoon') {
    const x=w*.4961,y=h*.5439,r=w*.1162;
    c.fillStyle='#a8444d'; c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill();
    for(let i=0;i<12;i++) { c.beginPath(); c.arc(x,y,r*(i+1)/13,0,Math.PI*2); c.stroke(); }
  } else if (asset.id === 'm_tokyo_skyline') {
    c.fillStyle='#cbd5cd';
    for(let i=0;i<18;i++) { const bh=h*(.15+((i*7)%13)/38); c.fillRect(i*w/18,h*.82-bh,w/26,bh); }
    c.fillStyle='#a8444d'; c.fillRect(0,h*.82,w,3);
  } else {
    for(let j=0;j<24;j++) {
      c.beginPath();
      for(let i=0;i<=100;i++) {
        const a=i/100*Math.PI*2,r=w*(.09+j*.014);
        const x=w*.5+Math.cos(a)*r*(1+.18*Math.sin(a*(index+2)));
        const y=h*.5+Math.sin(a)*r*.61+18*Math.sin(a*3+j*.1);
        i?c.lineTo(x,y):c.moveTo(x,y);
      }
      c.closePath(); c.strokeStyle=j%5?'#cbd5cd':'#a8444d'; c.stroke();
    }
  }
  c.fillStyle='#cbd5cd'; c.font=`${Math.round(h*.023)}px monospace`;
  c.fillText(`PROCEDURAL / ${String(index+1).padStart(2,'0')}`,w*.04,h*.94);
  return canvas.toDataURL('image/png');
}
