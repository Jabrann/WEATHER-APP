
const API_KEY = 'YOUR_API_KEY_HERE';
const OWM = 'https://api.openweathermap.org';

let useCelsius = true;
let cur = null, fcast = null, aqi = null;
let map = null, marker = null, owmLayer = null;
let hChart = null;

const $ = id => document.getElementById(id);
const toF = c => c * 9/5 + 32;
const dispT = c => useCelsius ? Math.round(c)+'°' : Math.round(toF(c))+'°';
const WDIRS = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
const windDir = deg => WDIRS[Math.round(deg/22.5)%16];
const dewPoint = (t,rh) => { const a=17.27,b=237.7,al=(a*t)/(b+t)+Math.log(rh/100); return (b*al)/(a-al); };
const WICONS = {Thunderstorm:'⛈',Drizzle:'🌦',Rain:'🌧',Snow:'❄️',Mist:'🌫',Smoke:'🌫',Haze:'🌫',Fog:'🌫',Dust:'🌪',Sand:'🌪',Ash:'🌋',Squall:'💨',Tornado:'🌪',Clear:'☀️',Clouds:'☁️'};
const WBGS = {Clear:'linear-gradient(135deg,#f6d6db 0%,#e9c5cb 50%,#d1d6f0 100%)',Clouds:'linear-gradient(135deg,#e9dbe7 0%,#d4bfce 50%,#b8c0e0 100%)',Rain:'linear-gradient(135deg,#d9d6ed 0%,#afb0cf 100%)',Drizzle:'linear-gradient(135deg,#e3d7e6 0%,#c5cbe5 100%)',Thunderstorm:'linear-gradient(135deg,#c9b8d0 0%,#a3aed3 100%)',Snow:'linear-gradient(135deg,#f0e6ee 0%,#d8e2f5 100%)',Mist:'linear-gradient(135deg,#f2e9f0 0%,#d7d9ec 100%)'};
const wIcon = m => WICONS[m]||'🌤';
const wBg   = m => WBGS[m]||WBGS.Clouds;
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function fmt12(d){
  let h=d.getHours(),m=d.getMinutes(),ap=h>=12?'PM':'AM';
  h=h%12||12; return `${h}:${m.toString().padStart(2,'0')} ${ap}`;
}

function showToast(msg,ms=3200){
  const t=$('toast'); t.textContent=msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),ms);
}

function hideLoader(){ $('loader').classList.add('hidden'); }

setInterval(()=>{ $('curClock').textContent=fmt12(new Date()); },1000);
$('curClock').textContent=fmt12(new Date());

async function fetchAll(city){
  $('loader').classList.remove('hidden');
  try {
    const r1 = await fetch(`${OWM}/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`);
    if(!r1.ok){ showToast('❌ City not found: '+city); hideLoader(); return; }
    cur = await r1.json();

    const [r2,r3] = await Promise.all([
      fetch(`${OWM}/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&cnt=56&appid=${API_KEY}`),
      fetch(`${OWM}/data/2.5/air_pollution?lat=${cur.coord.lat}&lon=${cur.coord.lon}&appid=${API_KEY}`)
    ]);
    fcast = await r2.json();
    aqi   = await r3.json();

    renderAll();
    showToast(`📍 Loaded: ${cur.name}, ${cur.sys.country}`);
  } catch(e){
    showToast('⚠️ Network error'); console.error(e);
  } finally { hideLoader(); }
}

async function fetchByCoords(lat,lon){
  $('loader').classList.remove('hidden');
  try {
    const r1 = await fetch(`${OWM}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
    if(!r1.ok){ fetchAll('Mamuju'); return; }
    cur = await r1.json();

    const [r2,r3] = await Promise.all([
      fetch(`${OWM}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&cnt=56&appid=${API_KEY}`),
      fetch(`${OWM}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
    ]);
    fcast = await r2.json();
    aqi   = await r3.json();

    renderAll();
    showToast(`📍 ${cur.name}, ${cur.sys.country}`);
  } catch(e){
    fetchAll('Mamuju');
  } finally { hideLoader(); }
}

function renderAll(){
  renderCurrent();
  renderDayTabs();
  renderHourly();
  renderMap();
  renderPrecip();
  renderStats();
  renderWeekly();
  renderAQI();
  $('locLabel').textContent = cur.name+', '+cur.sys.country;
}

function renderCurrent(){
  const d=cur;
  $('curTemp').textContent  = dispT(d.main.temp);
  $('curCity').textContent  = d.name+', '+d.sys.country;
  $('curIcon').textContent  = wIcon(d.weather[0].main);
  $('curDesc').textContent  = d.weather[0].description.replace(/\b\w/g,c=>c.toUpperCase());
  $('curFeels').textContent = 'Feels like '+dispT(d.main.feels_like);
  $('heroBg').style.background = wBg(d.weather[0].main);
  $('mWind').textContent  = d.wind.speed.toFixed(1)+' m/s '+windDir(d.wind.deg);
  $('mHum').textContent   = d.main.humidity+'%';
  $('mVis').textContent   = (d.visibility/1000).toFixed(1)+' km';
  $('mPres').textContent  = d.main.pressure+' hPa';
  $('mCloud').textContent = d.clouds.all+'%';
  $('mDew').textContent   = dispT(dewPoint(d.main.temp,d.main.humidity));
}

function renderDayTabs(){
  const tabs=$('dayTabs'); tabs.innerHTML='';
  const byDay={};
  fcast.list.forEach(item=>{
    const k=new Date(item.dt*1000).toDateString();
    if(!byDay[k]) byDay[k]={items:[],date:new Date(item.dt*1000)};
    byDay[k].items.push(item);
  });
  const today=new Date().toDateString();
  let idx=0;
  for(const [key,day] of Object.entries(byDay)){
    if(idx>=7) break;
    const temps=day.items.map(i=>i.main.temp);
    const hi=Math.max(...temps), lo=Math.min(...temps);
    const icon=wIcon(day.items[Math.floor(day.items.length/2)].weather[0].main);
    const label=key===today?'Today':DAYS[day.date.getDay()];
    const tab=document.createElement('div');
    tab.className='day-tab'+(idx===0?' active':'');
    tab.innerHTML=`<span class="dt-icon">${icon}</span><span>${label}</span><span class="dt-temp">${dispT(hi)}</span><span class="dt-lo">${dispT(lo)}</span>`;
    tab.addEventListener('click',()=>{
      document.querySelectorAll('.day-tab').forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
    });
    tabs.appendChild(tab); idx++;
  }
}

function renderHourly(){
  const items=fcast.list.slice(0,9);
  const scroll=$('hourlyScroll');
  scroll.innerHTML=items.map(item=>{
    const d=new Date(item.dt*1000);
    let h=d.getHours(),ap=h>=12?'p.m.':'a.m.'; h=h%12||12;
    return `<div class="h-item">
      <div class="h-time">${h} ${ap}</div>
      <div class="h-icon">${wIcon(item.weather[0].main)}</div>
      <div class="h-pct">${Math.round(item.pop*100)}%</div>
      <div class="h-temp">${dispT(item.main.temp)}</div>
      <div class="h-wind">${item.wind.speed.toFixed(1)} m/s</div>
    </div>`;
  }).join('');

  const labels=items.map(i=>{
    const d=new Date(i.dt*1000); let h=d.getHours(),ap=h>=12?'p.':'a.'; h=h%12||12;
    return h+ap;
  });
  const temps  = items.map(i=> useCelsius?i.main.temp:toF(i.main.temp));
  const precip = items.map(i=> i.pop*100);

  if(hChart) hChart.destroy();
  const ctx=$('hourlyChart').getContext('2d');
  const grad=ctx.createLinearGradient(0,0,0,105);
  grad.addColorStop(0,'rgba(233,197,203,0.35)');
  grad.addColorStop(1,'rgba(233,197,203,0)');

  hChart=new Chart(ctx,{
    data:{
      labels,
      datasets:[
        {type:'bar',label:'Rain %',data:precip,backgroundColor:'rgba(175,176,207,0.22)',borderRadius:4,yAxisID:'yP',order:2},
        {type:'line',label:'Temp',data:temps,borderColor:'#e9b8c2',backgroundColor:grad,borderWidth:2.5,
         pointBackgroundColor:'#e9b8c2',pointBorderColor:'#ffffff',pointBorderWidth:1.5,pointRadius:4,
         tension:.4,fill:true,yAxisID:'yT',order:1}
      ]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      interaction:{mode:'index',intersect:false},
      plugins:{
        legend:{display:false},
        tooltip:{
          backgroundColor:'rgba(255,255,255,0.96)',titleColor:'#8a8196',bodyColor:'#3b3447',
          borderColor:'rgba(175,176,207,0.3)',borderWidth:1,padding:10,
          callbacks:{label:ctx=>ctx.datasetIndex===1?` Temp: ${Math.round(ctx.raw)}${useCelsius?'°C':'°F'}`:` Rain: ${Math.round(ctx.raw)}%`}
        }
      },
      scales:{
        x:{grid:{color:'rgba(175,176,207,0.12)'},ticks:{color:'#b5aebc',font:{family:'JetBrains Mono',size:9}}},
        yT:{position:'left',grid:{color:'rgba(175,176,207,0.1)'},ticks:{color:'#e9b8c2',font:{family:'JetBrains Mono',size:9},callback:v=>Math.round(v)+(useCelsius?'°':'°F')}},
        yP:{position:'right',min:0,max:100,grid:{display:false},ticks:{color:'#a3aed3',font:{family:'JetBrains Mono',size:9},callback:v=>v+'%'}}
      }
    }
  });
}

function renderMap(){
  const {lat,lon}=cur.coord;
  if(!map){
    map=L.map('leaflet-map',{center:[lat,lon],zoom:8,attributionControl:false});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);
  }
  if(marker) map.removeLayer(marker);
  const icon=L.divIcon({
    html:`<div style="width:14px;height:14px;background:#e9b8c2;border-radius:50%;border:3px solid white;box-shadow:0 0 12px rgba(233,184,194,.8),0 0 24px rgba(175,176,207,.4);"></div>`,
    iconSize:[14,14],iconAnchor:[7,7],className:''
  });
  marker=L.marker([lat,lon],{icon}).addTo(map)
    .bindPopup(`<div style="font-family:Syne,sans-serif;font-size:12px;min-width:110px;color:#3b3447">
      <strong>${cur.name}</strong><br>
      ${wIcon(cur.weather[0].main)} ${Math.round(cur.main.temp)}°C<br>
      <span style="color:#8a8196">${cur.weather[0].description}</span>
    </div>`,{className:'leaflet-dark-popup'}).openPopup();
  map.setView([lat,lon],8);

  // Layer buttons
  document.querySelectorAll('.map-btn').forEach(btn=>{
    btn.onclick=()=>{
      document.querySelectorAll('.map-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      if(owmLayer) map.removeLayer(owmLayer);
      const l=btn.dataset.layer;
      if(l==='none') return;
      owmLayer=L.tileLayer(`https://tile.openweathermap.org/map/${l}/{z}/{x}/{y}.png?appid=${API_KEY}`,{opacity:.7,maxZoom:19}).addTo(map);
    };
  });
}

function renderPrecip(){
  const bars=$('precipBars'), times=$('precipTimes');
  const now=new Date();
  const base=fcast.list[0]?.pop||0;
  const slots=Array.from({length:30},(_,i)=>({
    t:new Date(now.getTime()+i*2*60000),
    p:Math.max(0,Math.min(1,base+(Math.random()-.5)*.25))
  }));
  bars.innerHTML=slots.map(s=>{
    const h=Math.max(3,s.p*46);
    const col=s.p<.1?'rgba(52,211,153,.55)':s.p<.3?'rgba(56,189,248,.55)':s.p<.6?'rgba(251,191,36,.6)':'rgba(248,113,113,.65)';
    return `<div class="p-bar" style="height:${h}px;background:${col}"></div>`;
  }).join('');
  times.innerHTML=[0,6,12,18,24,29].map(i=>`<span>${fmt12(slots[i].t)}</span>`).join('');
}

function renderStats(){
  const d=cur;
  // UV estimate
  const h=new Date().getHours(), cl=d.clouds.all;
  let uv=0;
  if(h>=6&&h<=18){ const s=1-Math.abs(h-12)/6; uv=Math.round(s*10*(1-cl/100*.75)); }
  $('uvVal').textContent=uv;
  const uvLbls=['Low','Low','Moderate','Moderate','High','High','High','Very High','Very High','Extreme','Extreme','Extreme'];
  const uvCols=['#7bc8b8','#7bc8b8','#e6c07a','#e6c07a','#f2a490','#f2a490','#f2a490','#e78a9a','#e78a9a','#a3aed3','#a3aed3','#a3aed3'];
  $('uvLabel').textContent=uvLbls[Math.min(uv,11)];
  $('uvVal').style.color=uvCols[Math.min(uv,11)];
  $('uvFill').style.width=Math.min(uv/11*100,100)+'%';

  // Wind
  const kmh=(d.wind.speed*3.6).toFixed(1);
  $('windVal').textContent=kmh+' km/h';
  $('windDirLabel').textContent='Direction: '+windDir(d.wind.deg)+' ('+d.wind.deg+'°)';
  $('gustLabel').textContent='Gust: '+((d.wind.gust||d.wind.speed)*3.6).toFixed(1)+' km/h';
  $('compassNeedle').style.transform=`translateX(-50%) rotate(${d.wind.deg}deg)`;

  // Pressure
  $('presVal').textContent=d.main.pressure;
  $('presTrend').textContent='Sea Level · '+(d.main.pressure>1013?'High Pressure ↑':'Low Pressure ↓');

  // Sun
  const rise=new Date(d.sys.sunrise*1000), set=new Date(d.sys.sunset*1000);
  $('sunriseVal').textContent=fmt12(rise);
  $('sunsetVal').textContent=fmt12(set);
  const now=Date.now(), rMs=d.sys.sunrise*1000, sMs=d.sys.sunset*1000;
  const prog=Math.max(0,Math.min(1,(now-rMs)/(sMs-rMs)));
  $('sunArcFill').style.strokeDashoffset=220-(220*prog);
  const x=10+(190-10)*prog, yy=55+Math.sin(Math.PI*prog)*(-50);
  $('sunDot').setAttribute('cx',x); $('sunDot').setAttribute('cy',yy);
}

function renderWeekly(){
  const byDay={};
  fcast.list.forEach(item=>{
    const d=new Date(item.dt*1000);
    const k=`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if(!byDay[k]) byDay[k]={items:[],date:d};
    byDay[k].items.push(item);
  });
  const list=$('weekList'); list.innerHTML='';
  let idx=0;
  for(const [,day] of Object.entries(byDay)){
    if(idx>=7) break;
    const temps=day.items.map(i=>i.main.temp);
    const hi=Math.max(...temps), lo=Math.min(...temps);
    const mid=day.items[Math.floor(day.items.length/2)];
    const row=document.createElement('div'); row.className='week-item';
    row.innerHTML=`
      <div class="wk-day">${idx===0?'Today':DAYS[day.date.getDay()]}</div>
      <div class="wk-icon">${wIcon(mid.weather[0].main)}</div>
      <div class="wk-desc" style="flex:1;font-size:.68rem;color:var(--muted2)">${mid.weather[0].description.replace(/\b\w/g,c=>c.toUpperCase())} · ${Math.round(mid.pop*100)}% 🌧</div>
      <div class="wk-lo">${dispT(lo)}</div>
      <div class="wk-hi">${dispT(hi)}</div>`;
    list.appendChild(row); idx++;
  }
}

function renderAQI(){
  if(!aqi?.list?.[0]) return;
  const a=aqi.list[0];
  const i=a.main.aqi;
  const lbls=['','Good','Fair','Moderate','Poor','Very Poor'];
  const cols=['','#34d399','#fbbf24','#fb923c','#f87171','#a78bfa'];
  const bgs =['','rgba(52,211,153,.15)','rgba(251,191,36,.15)','rgba(251,146,60,.15)','rgba(248,113,113,.15)','rgba(167,139,250,.15)'];
  const score=[0,25,75,150,200,300][i]||0;
  $('aqiVal').textContent=score; $('aqiVal').style.color=cols[i];
  $('aqiBadge').textContent=lbls[i]; $('aqiBadge').style.background=bgs[i]; $('aqiBadge').style.color=cols[i];
  const c=a.components;
  $('pm25').textContent=c.pm2_5.toFixed(1);
  $('pm10').textContent=c.pm10.toFixed(1);
  $('o3').textContent  =c.o3.toFixed(1);
  $('no2').textContent =c.no2.toFixed(1);
  $('so2').textContent =c.so2.toFixed(1);
  $('co').textContent  =(c.co/1000).toFixed(2);
}

$('btnC').onclick=()=>{ if(useCelsius)return; useCelsius=true; $('btnC').classList.add('active'); $('btnF').classList.remove('active'); renderAll(); };
$('btnF').onclick=()=>{ if(!useCelsius)return; useCelsius=false; $('btnF').classList.add('active'); $('btnC').classList.remove('active'); renderAll(); };

function doSearch(){ const c=$('searchInput').value.trim(); if(c) fetchAll(c); }
$('searchBtn').onclick=doSearch;
$('searchInput').onkeydown=e=>{ if(e.key==='Enter') doSearch(); };

if(navigator.geolocation){
  navigator.geolocation.getCurrentPosition(
    pos=>fetchByCoords(pos.coords.latitude,pos.coords.longitude),
    ()=>fetchAll('Mamuju')
  );
} else { fetchAll('Mamuju'); }
