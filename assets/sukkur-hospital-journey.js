/* Interactive Sukkur hospital walk — no external packages or tracking. */
(function () {
  "use strict";
  const hospitals = [
    {name:"Dr. Ziauddin Hospital Sukkur",sign:"Dr. Ziauddin Hospital",type:"blue",url:"/hospitals/dr-ziauddin-hospital-sukkur/"},
    {name:"Sindh Rangers Hospital Sukkur",sign:"Sindh Rangers Hospital",type:"red",url:null},
    {name:"River City Hospital Sukkur",sign:"River City Hospital",type:"green",url:"/hospitals/river-city-hospital-sukkur/"},
    {name:"SICVD Hospital Sukkur",sign:"SICVD Sukkur",type:"heart",url:null,photo:"/assets/sicvd-sukkur-journey.jpg"},
    {name:"Alkhidmat Mother & Child Health Care Center",sign:"Alkhidmat Mother & Child",type:"pink",url:"/hospitals/alkhidmat-mother-child-health-care-center/"},
    {name:"Hira Medical Center Sukkur",sign:"Hira Medical Center",type:"blue",url:"/hospitals/hira-medical-centre-sukkur/"},
    {name:"Dr. Shahid Mirani Hospital",sign:"Dr. Shahid Mirani Hospital",type:"gold",url:null},
    {name:"Red Crescent Hospital Sukkur",sign:"Red Crescent Hospital",type:"red",url:null},
    {name:"SIUT Hospital Sukkur",sign:"SIUT Sukkur",type:"heart",url:null},
    {name:"GMC Teaching Hospital Sukkur",sign:"GMC Teaching Hospital",type:"green",url:null},
    {name:"Sukkur Blood Bank Hospital",sign:"Sukkur Blood Bank Hospital",type:"red",url:null},
    {name:"Halar Memon Hospital Sukkur",sign:"Halar Memon Hospital",type:"gold",url:null},
    {name:"Mustafai General Hospital Sukkur",sign:"Mustafai General Hospital",type:"pink",url:null}
  ];
  const escapeHtml = s => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const character = `<svg viewBox="0 0 90 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="47" cy="144" rx="27" ry="5" fill="#355777" opacity=".2"/>
    <g class="hp-hj-leg2"><path d="M46 91L59 126" stroke="#223d5d" stroke-width="12" stroke-linecap="round"/><path d="M58 127l12 7" stroke="#fff" stroke-width="10" stroke-linecap="round"/><path d="M57 134h15" stroke="#438dcc" stroke-width="4" stroke-linecap="round"/></g>
    <g class="hp-hj-leg1"><path d="M40 91L31 126" stroke="#304b70" stroke-width="12" stroke-linecap="round"/><path d="M29 128l-8 6" stroke="#fff" stroke-width="10" stroke-linecap="round"/><path d="M18 134h16" stroke="#438dcc" stroke-width="4" stroke-linecap="round"/></g>
    <rect x="21" y="57" width="45" height="43" rx="12" fill="#f7fcff" stroke="#79a9cf" stroke-width="2"/>
    <rect x="17" y="65" width="17" height="30" rx="8" fill="#2187c4" stroke="#1a5e94" stroke-width="2"/>
    <rect x="21" y="74" width="10" height="10" rx="2" fill="#fff"/><path d="M26 76v6m-3-3h6" stroke="#2195cb" stroke-width="2"/>
    <g class="hp-hj-arm2"><path d="M61 67l13 20" stroke="#ffca9c" stroke-width="10" stroke-linecap="round"/><circle cx="74" cy="87" r="6" fill="#ffca9c"/></g>
    <g class="hp-hj-arm1"><path d="M26 67L11 84" stroke="#ffca9c" stroke-width="10" stroke-linecap="round"/><circle cx="11" cy="85" r="6" fill="#ffca9c"/></g>
    <path d="M42 58l7 12 7-12" fill="#e0effe" stroke="#6f9dbc" stroke-width="2"/>
    <path d="M52 71q12 6 4 15" fill="none" stroke="#375b72" stroke-width="2"/><circle cx="56" cy="85" r="4" fill="#5485a9"/>
    <rect x="39" y="48" width="12" height="14" rx="6" fill="#ffbd90"/>
    <ellipse cx="45" cy="30" rx="24" ry="27" fill="#ffd0a5" stroke="#e5a77b" stroke-width="1.5"/>
    <path d="M21 32Q13 9 35 4Q56 -1 65 14Q71 19 66 34Q60 23 57 15Q43 24 26 20Z" fill="#47322e"/>
    <path d="M22 24q16-22 32-12" fill="none" stroke="#5b4036" stroke-width="6" stroke-linecap="round"/>
    <circle cx="36" cy="32" r="2.5" fill="#2b3b4a"/><circle cx="55" cy="32" r="2.5" fill="#2b3b4a"/>
    <path d="M40 43q7 7 13-1" fill="none" stroke="#ad685f" stroke-width="2.5" stroke-linecap="round"/>
    <ellipse cx="25" cy="37" rx="4" ry="7" fill="#ffbf98"/>
  </svg>`;
  const bridge = `<svg class="hp-hj-bridge" viewBox="0 0 220 100" fill="none" aria-hidden="true"><path d="M0 70H220M10 70Q110-55 210 70M10 70L35 47L54 28L78 13L110 5L145 16L170 33L190 51L210 70" stroke="#ad5a5f" stroke-width="5"/><path d="M15 68V80M38 44V75M62 26V77M88 10V78M110 5V80M135 10V77M163 25V80M186 47V78M209 68V80" stroke="#9a5664" stroke-width="2"/><path d="M0 81H220" stroke="#739fbe" stroke-width="6"/></svg>`;
  const windowGrid = "<span class='hp-hj-window-grid'>" + "<i></i>".repeat(9) + "</span>";
  function render(root, ordinal) {
    const headingId = "hp-hj-heading-"+ordinal;
    root.innerHTML = `<section class="hp-hj" aria-labelledby="${headingId}">
      <div class="hp-hj-intro">
        <div class="hp-hj-identity"><span class="hp-hj-identity-mark" aria-hidden="true">✚</span><span>HospitalPro<em>.online</em></span></div>
        <span class="hp-hj-kicker">FIND <b>•</b> EXPLORE <b>•</b> COMPARE HOSPITALS</span>
        <div class="hp-hj-title-wrap">
          <span class="hp-hj-ecg" aria-hidden="true">♡ ━╱╲━</span>
          <h2 id="${headingId}">Discover <span>Sukkur City Hospitals</span></h2>
          <span class="hp-hj-ecg" aria-hidden="true">━╱╲━ ♡</span>
        </div>
        <p>Join our little healthcare explorer as he jumps across <strong>${hospitals.length} hospitals and healthcare centers in Sukkur.</strong> Select a rooftop or follow the glowing trail.</p>
      </div>
      <div class="hp-hj-scene" aria-label="Illustrated jumping journey past ${hospitals.length} Sukkur hospitals">
        <span class="hp-hj-cloud"></span><span class="hp-hj-cloud"></span><span class="hp-hj-cloud"></span>
        <div class="hp-hj-river" aria-hidden="true"></div>
        <div class="hp-hj-skyline" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
        ${bridge}
        <div class="hp-hj-garden" aria-hidden="true"></div>
        <div class="hp-hj-rail" tabindex="0" role="group" aria-label="Hospital stops. Swipe or use previous and next buttons.">
          ${hospitals.map((h,i)=>`<button type="button" class="hp-hj-stop" data-hj-stop="${i}" aria-label="Stop ${i+1}: ${escapeHtml(h.name)}" aria-current="${i===0?"step":"false"}">
            <span class="hp-hj-building${h.photo?" hp-hj-building--sicvd":""}" data-kind="${h.type}" aria-hidden="true">${h.photo?`<img class="hp-hj-building-photo" src="${h.photo}" alt="" loading="lazy" decoding="async"><span class="hp-hj-cardiac" aria-hidden="true">♥</span>`:windowGrid}<span class="hp-hj-sign">${escapeHtml(h.sign)}</span></span>
            <span class="hp-hj-station">${escapeHtml(h.name)}</span>
            ${i<hospitals.length-1?'<span class="hp-hj-hop-arc" aria-hidden="true"></span>':""}
          </button>`).join("")}
        </div>
        <div class="hp-hj-traveler" aria-hidden="true">${character}</div>
      </div>
      <div class="hp-hj-bottom">
        <div class="hp-hj-current" aria-live="polite" aria-atomic="true">
          <span class="hp-hj-count">Stop 1 of ${hospitals.length}</span>
          <span class="hp-hj-selected">${escapeHtml(hospitals[0].name)}</span>
        </div>
        <div class="hp-hj-actions">
          <button type="button" class="hp-hj-action" data-hj-prev aria-label="Previous hospital">← Previous</button>
          <button type="button" class="hp-hj-action" data-hj-pause aria-pressed="false">⏸ Pause</button>
          <button type="button" class="hp-hj-action" data-hj-next aria-label="Next hospital">Jump next →</button>
          <a class="hp-hj-action hp-hj-action--link" data-hj-open href="${hospitals[0].url}">View hospital →</a>
        </div>
      </div>
      <div class="hp-hj-guide" aria-label="Explore HospitalPro"><span>📍 Explore hospitals</span><span>🏥 View hospital profiles</span><span>🩺 Find specialist care</span></div>
      <p class="hp-hj-footnote">A playful rooftop-jumping discovery trail, not a geographic route or hospital ranking. For stops without a dedicated page, the link opens Sukkur's doctors directory. <a href="/sukkur-hospital-journey/">Open full journey ↗</a></p>
    </section>`;

    const section=root.querySelector(".hp-hj"), scene=root.querySelector(".hp-hj-scene"), rail=root.querySelector(".hp-hj-rail");
    const avatar=root.querySelector(".hp-hj-traveler"), stops=[...root.querySelectorAll("[data-hj-stop]")];
    const count=root.querySelector(".hp-hj-count"), selected=root.querySelector(".hp-hj-selected");
    const open=root.querySelector("[data-hj-open]"), toggle=root.querySelector("[data-hj-pause]");
    let current=0, jumping=false, manualPause=false, hover=false, inView=false, scrollTimeout;
    const reduce=window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(reduce) manualPause=true;
    const clamp=(v,low,high)=>Math.max(low,Math.min(high,v));
    function scrollFor(index) {
      const max=Math.max(0,rail.scrollWidth-rail.clientWidth);
      return clamp(stops[index].offsetLeft-rail.clientWidth*.20,0,max);
    }
    function roofY(index) {
      const roof=stops[index].querySelector(".hp-hj-building");
      return roof.getBoundingClientRect().top-scene.getBoundingClientRect().top-avatar.offsetHeight+8;
    }
    function worldX(index) {
      return stops[index].offsetLeft+stops[index].offsetWidth/2;
    }
    function placeAt(x,y,rotation) {
      avatar.style.transform="translate3d("+Math.round(x)+"px,"+Math.round(y)+"px,0) rotate("+(rotation||0)+"deg)";
    }
    function setAvatar(index) {
      placeAt(worldX(index)-rail.scrollLeft-avatar.offsetWidth/2,roofY(index),0);
    }
    function activate(index) {
      current=(index+hospitals.length)%hospitals.length;
      const hospital=hospitals[current];
      stops.forEach((s,j)=>s.setAttribute("aria-current",j===current?"step":"false"));
      count.textContent="Stop "+(current+1)+" of "+hospitals.length;
      selected.textContent=hospital.name;
      open.href=hospital.url||"/doctors-in-sukkur/";
      open.textContent=hospital.url?"View hospital →":"Find Sukkur doctors →";
      open.setAttribute("aria-label",hospital.url?"View "+hospital.name:"Browse doctors in Sukkur");
    }
    function syncPause() {
      section.classList.toggle("is-paused",manualPause||hover||!inView||document.hidden);
      toggle.textContent=manualPause?"▶ Play":"⏸ Pause";
      toggle.setAttribute("aria-pressed",String(manualPause));
    }
    function goTo(index) {
      const target=(index+hospitals.length)%hospitals.length;
      if(jumping || target===current)return;
      if(reduce){
        rail.scrollLeft=scrollFor(target);
        activate(target);
        setAvatar(target);
        return;
      }
      jumping=true;
      section.classList.add("is-hopping");
      avatar.classList.remove("is-landing");
      const from=current, startScroll=rail.scrollLeft, endScroll=scrollFor(target);
      const startX=worldX(from), endX=worldX(target), startY=roofY(from), endY=roofY(target);
      const sign=Math.sign(endX-startX)||1;
      const jumpHeight=clamp(Math.min(startY,endY)-12,24,90);
      const duration=Math.min(1900,1200+Math.abs(target-from)*75);
      let elapsed=0, lastStamp=0;
      function step(stamp) {
        if(!lastStamp)lastStamp=stamp;
        const dt=Math.min(55,Math.max(0,stamp-lastStamp));
        lastStamp=stamp;
        if(manualPause||!inView||document.hidden){
          window.requestAnimationFrame(step);
          return;
        }
        elapsed=Math.min(duration,elapsed+dt);
        const p=elapsed/duration;
        const eased=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
        const scroll=startScroll+(endScroll-startScroll)*eased;
        rail.scrollLeft=scroll;
        const leap=Math.sin(Math.PI*p);
        const x=startX+(endX-startX)*eased-scroll-avatar.offsetWidth/2+sign*48*leap;
        const y=startY+(endY-startY)*eased-jumpHeight*leap;
        placeAt(x,y,-sign*11*leap);
        if(p<1){
          window.requestAnimationFrame(step);
        } else {
          rail.scrollLeft=endScroll;
          jumping=false;
          section.classList.remove("is-hopping");
          avatar.classList.add("is-landing");
          activate(target);
          setAvatar(target);
          window.setTimeout(()=>avatar.classList.remove("is-landing"),430);
        }
      }
      window.requestAnimationFrame(step);
    }
    root.querySelector("[data-hj-prev]").addEventListener("click",()=>goTo(current-1));
    root.querySelector("[data-hj-next]").addEventListener("click",()=>goTo(current+1));
    toggle.addEventListener("click",()=>{manualPause=!manualPause;syncPause()});
    stops.forEach((stop,i)=>stop.addEventListener("click",()=>goTo(i)));
    section.addEventListener("mouseenter",()=>{hover=true;syncPause()});
    section.addEventListener("mouseleave",()=>{hover=false;syncPause()});
    section.addEventListener("focusin",()=>{hover=true;syncPause()});
    section.addEventListener("focusout",e=>{if(!section.contains(e.relatedTarget)){hover=false;syncPause()}});
    document.addEventListener("visibilitychange",syncPause);
    if("IntersectionObserver" in window){
      const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;syncPause()},{threshold:.12});
      observer.observe(section);
    } else inView=true;
    rail.addEventListener("scroll",()=>{
      if(jumping)return;
      window.clearTimeout(scrollTimeout);
      scrollTimeout=window.setTimeout(()=>{
        if(jumping)return;
        let best=current, distance=Infinity;
        stops.forEach((stop,i)=>{
          const d=Math.abs(stop.offsetLeft-rail.scrollLeft-rail.clientWidth*.2);
          if(d<distance){best=i;distance=d}
        });
        if(best!==current)activate(best);
        setAvatar(current);
      },140);
    },{passive:true});
    window.addEventListener("resize",()=>{if(!jumping)setAvatar(current)},{passive:true});
    setAvatar(0);
    syncPause();
    if(!reduce) window.setInterval(()=>{
      if(!manualPause&&!hover&&inView&&!document.hidden&&!jumping)goTo(current+1);
    },4500);
  }
  function start(){document.querySelectorAll("[data-hp-hospital-journey]").forEach((el,i)=>render(el,i+1))}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();