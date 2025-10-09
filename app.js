const stations=[
 {name:'Now 97.9',freq:97.9,url:'https://ipanel.instream.audio:7002/stream'},
 {name:'Blue 100.7',freq:100.7,url:'https://27693.live.streamtheworld.com/BLUE_FM_100_7AAC.aac'},
 {name:'Aspen 102.3',freq:102.3,url:'https://playerservices.streamtheworld.com/api/livestream-redirect/ASPEN.mp3'},
 {name:'LN+ 104.9',freq:104.9,url:'https://stream.radio.co/s2ed3bec0a/listen'},
];let index=0;
const sub=document.getElementById('subFreq'),big=document.getElementById('bigFreq'),nameEl=document.getElementById('stationName');
const audio=document.getElementById('audio');
const prev=document.getElementById('prev');
const toggleBtn=document.getElementById('toggle');
const next=document.getElementById('next');
const toggleIcon=document.getElementById('toggleIcon');
const canvas=document.getElementById('wave'),ctx=canvas.getContext('2d');let acx,analyser,dataArray,rafId;
function resize(){const dpr=window.devicePixelRatio||1;const w=canvas.clientWidth,h=canvas.clientHeight;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}resize();addEventListener('resize',resize);
function startViz(){if(!acx){acx=new(window.AudioContext||window.webkitAudioContext)();const src=acx.createMediaElementSource(audio);analyser=acx.createAnalyser();analyser.fftSize=256;src.connect(analyser);analyser.connect(acx.destination);dataArray=new Uint8Array(analyser.frequencyBinCount);}draw();}
function stopViz(){cancelAnimationFrame(rafId);ctx.clearRect(0,0,canvas.width,canvas.height);}
function draw(){rafId=requestAnimationFrame(draw);ctx.clearRect(0,0,canvas.width,canvas.height);if(analyser){analyser.getByteFrequencyData(dataArray);}const bars=32;const step=Math.floor((dataArray?dataArray.length:bars)/bars);const w=canvas.clientWidth,h=canvas.clientHeight;const gap=w/(bars*1.5);for(let i=0;i<bars;i++){const v=dataArray?dataArray[i*step]:(Math.sin((Date.now()/120+i)*0.7)*0.5+0.5)*255;const bh=Math.max(10,(v/255)*(h*0.9));const x=(w-bars*gap)/2+i*gap;const y=(h-bh)/2;ctx.fillStyle='#ff9a1f';ctx.fillRect(x,y,gap*0.4,bh);ctx.fillRect(x,y+bh*0.05,gap*0.4,bh*0.9);}}
function updateTexts(){const st=stations[index];sub.textContent = 'Sonando...';big.textContent=st.freq.toFixed(1);nameEl.textContent=st.name.toUpperCase();}
function loadStation(auto=false){const st=stations[index];updateTexts();audio.src=st.url;if(auto)audio.play().catch(()=>{});if('mediaSession'in navigator){navigator.mediaSession.metadata=new MediaMetadata({title:st.name,artist:'AI Pixel Radio',album:'En vivo',artwork:[{src:new URL('assets/icon-192.png', location.href).toString(),sizes:'192x192',type:'image/png'}]});}}
prev.addEventListener('click',()=>{const was=!audio.paused;index=(index-1+stations.length)%stations.length;loadStation(was);});
next.addEventListener('click',()=>{const was=!audio.paused;index=(index+1)%stations.length;loadStation(was);});
toggleBtn.addEventListener('click',async()=>{try{ if(audio.paused){ await audio.play(); startViz(); } else { audio.pause(); stopViz(); } }catch(e){}});
audio.addEventListener('play',()=>{ setToggleIcon(true); startViz(); if('mediaSession'in navigator){navigator.mediaSession.playbackState='playing';}});
audio.addEventListener('pause',()=>{ setToggleIcon(false); stopViz(); if('mediaSession'in navigator){navigator.mediaSession.playbackState='paused';}});
function setToggleIcon(playing){
  // pause icon when playing, play icon when paused
  toggleIcon.setAttribute('d', playing ? 'M6 5h5v14H6zm7 0h5v14h-5z' : 'M8 5v14l11-7z');
  toggleBtn.setAttribute('aria-label', playing ? 'Pausa' : 'Play');
  toggleBtn.classList.toggle('primary', !playing ? true : true);
}

function setupMediaSession(){
  if (!('mediaSession' in navigator)) return;
  navigator.mediaSession.setActionHandler('play', async ()=>{ if(audio.paused){ await audio.play(); setToggleIcon(true);} });
  navigator.mediaSession.setActionHandler('pause', ()=>{ if(!audio.paused){ audio.pause(); setToggleIcon(false);} });
  navigator.mediaSession.setActionHandler('previoustrack', ()=>{ prev.click(); });
  navigator.mediaSession.setActionHandler('nexttrack', ()=>{ next.click(); });
}

setupMediaSession();
loadStation(false);