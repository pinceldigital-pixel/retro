/* v10: theme toggle + no bottom */
const minFreq = 95.7;
const maxFreq = 105.7;
const sweepDeg = 240;
const startDeg = -120;

const stations = [
  { name: 'Now',   freq: 97.9,  url: 'https://ipanel.instream.audio:7002/stream' },
  { name: 'Blue',  freq: 100.7, url: 'https://27693.live.streamtheworld.com/BLUE_FM_100_7AAC.aac' },
  { name: 'Aspen', freq: 102.3, url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/ASPEN.mp3' },
  { name: 'LN+',   freq: 104.9, url: 'https://stream.radio.co/s2ed3bec0a/listen' },
];
let index = 1;

const dial = document.getElementById('dialSvg');
const ticksG = document.getElementById('ticks');
const needle = document.getElementById('needle');
const big = document.getElementById('bigFreq');
const mini = document.getElementById('stationMini');

const prev = document.getElementById('prev');
const next = document.getElementById('next');
const btn = document.getElementById('playPause');
const iconPath = document.getElementById('iconPath');
const audio = document.getElementById('audio');

const skinToggle = document.getElementById('skinToggle');
const skinName = document.getElementById('skinName');
const themeColor = document.getElementById('themeColor');

function format(freq){ return freq.toFixed(1); }
function toRad(deg){ return deg * Math.PI/180; }
function angleFor(freq){ const t = (freq - minFreq) / (maxFreq - minFreq); return startDeg + t * sweepDeg; }
function pointOnCircle(cx, cy, r, deg){ const rad = toRad(deg); return { x: cx + r*Math.cos(rad), y: cy + r*Math.sin(rad) }; }

function drawTicks(){
  ticksG.innerHTML = '';
  const minor = 0.2;
  for (let f = minFreq; f <= maxFreq+1e-6; f = +(f+minor).toFixed(1)){
    const deg = angleFor(f);
    const isMajor = Math.abs(f - Math.round(f)) < 1e-6;
    const rOuter = 84, rInner = isMajor ? 70 : 76;
    const a = pointOnCircle(100,100,rInner,deg);
    const b = pointOnCircle(100,100,rOuter,deg);
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', a.x.toFixed(2)); line.setAttribute('y1', a.y.toFixed(2));
    line.setAttribute('x2', b.x.toFixed(2)); line.setAttribute('y2', b.y.toFixed(2));
    line.setAttribute('stroke', isMajor ? 'var(--tick)' : 'var(--line)');
    line.setAttribute('stroke-width', isMajor ? '2' : '1');
    line.setAttribute('stroke-linecap','round');
    ticksG.appendChild(line);
  }
}
function moveNeedle(freq){
  const deg = angleFor(freq);
  const tip = pointOnCircle(100,100,20,deg);
  const outer = pointOnCircle(100,100,84,deg);
  needle.setAttribute('x1', tip.x.toFixed(2));
  needle.setAttribute('y1', tip.y.toFixed(2));
  needle.setAttribute('x2', outer.x.toFixed(2));
  needle.setAttribute('y2', outer.y.toFixed(2));
}
function setIcon(playing){
  iconPath.setAttribute('d', playing ? 'M6 5h5v14H6zm7 0h5v14h-5z' : 'M8 5v14l11-7z');
  btn.setAttribute('aria-label', playing ? 'Pausa' : 'Play');
}

function updateMediaSession(st){
  if (!('mediaSession' in navigator)) return;
  const abs = (p)=> (p.startsWith('http') ? p : new URL(p, location.href).toString());
  navigator.mediaSession.metadata = new MediaMetadata({
    title: st.name + ' ' + format(st.freq), artist: 'AI Pixel Radio', album: 'En vivo',
    artwork: [{src: abs('assets/icon-192.png'), sizes: '192x192', type: 'image/png'}]
  });
  try {
    navigator.mediaSession.setActionHandler('play', async () => { if (audio.paused){ await audio.play(); setIcon(true);} });
    navigator.mediaSession.setActionHandler('pause', () => { if (!audio.paused){ audio.pause(); setIcon(false);} });
    navigator.mediaSession.setActionHandler('previoustrack', () => prevStation());
    navigator.mediaSession.setActionHandler('nexttrack', () => nextStation());
  } catch(e){}
  navigator.mediaSession.playbackState = audio.paused ? 'paused' : 'playing';
}

function loadStation(i, autoplay=false){
  const st = stations[i];
  big.textContent = format(st.freq);
  mini.textContent = st.name;
  moveNeedle(st.freq);
  audio.src = st.url;
  updateMediaSession(st);
  if (autoplay) audio.play().catch(()=>{});
}

function prevStation(){ const wasPlaying = !audio.paused; index = (index - 1 + stations.length) % stations.length; loadStation(index, wasPlaying); setIcon(wasPlaying); }
function nextStation(){ const wasPlaying = !audio.paused; index = (index + 1) % stations.length; loadStation(index, wasPlaying); setIcon(wasPlaying); }

btn.addEventListener('click', ()=>{ if (audio.paused){ audio.play().then(()=>setIcon(true)).catch(()=>{}); } else { audio.pause(); setIcon(false);} });
prev.addEventListener('click', prevStation);
next.addEventListener('click', nextStation);
document.addEventListener('keydown', (e)=>{ if (e.key === 'ArrowLeft') prevStation(); if (e.key === 'ArrowRight') nextStation(); if (e.key === ' ') { e.preventDefault(); btn.click(); }});
audio.addEventListener('play',  ()=>{ setIcon(true); updateMediaSession(stations[index]); });
audio.addEventListener('pause', ()=>{ setIcon(false); updateMediaSession(stations[index]); });

// Theme toggle
function applySkin(name){
  document.body.classList.toggle('theme-classic', name==='Classic');
  skinName.textContent = name;
  const color = (name==='Classic') ? '#eae7e2' : '#0f1618';
  themeColor.setAttribute('content', color);
  localStorage.setItem('skin', name);
}
skinToggle.addEventListener('click', ()=>{
  const next = skinName.textContent === 'Dark' ? 'Classic' : 'Dark';
  applySkin(next);
});
applySkin(localStorage.getItem('skin') || 'Dark');

drawTicks();
setIcon(false);
loadStation(index, false);
