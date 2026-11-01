/* HospitalPro shared navigation. No cookies, analytics requests or patient data collection. */
(function(){
  "use strict";
  if(document.getElementById("hp-global-links")) return;
  var css=document.createElement("style");
  css.textContent="#hp-global-links{background:#f2f7fc;border-top:1px solid #dbe8f4;padding:25px 16px;color:#204568;text-align:center;font:13px/1.8 system-ui,-apple-system,Segoe UI,sans-serif}#hp-global-links .hp-links-inner{max-width:1080px;margin:auto}#hp-global-links nav{display:flex;align-items:center;justify-content:center;gap:8px 18px;flex-wrap:wrap}#hp-global-links a{color:#135a9d;font-weight:750;text-decoration:none}#hp-global-links a:hover,#hp-global-links a:focus-visible{text-decoration:underline}#hp-global-links p{font-size:11px;color:#6a7c8c;margin:9px 0 0}#hp-global-links a:focus-visible{outline:2px solid #135a9d;outline-offset:3px}@media print{#hp-global-links{display:none}}";
  document.head.appendChild(css);
  var panel=document.createElement("section"); panel.id="hp-global-links";panel.setAttribute("aria-label","Explore HospitalPro");
  panel.innerHTML='<div class="hp-links-inner"><nav aria-label="HospitalPro sitewide links"><a href="/find-doctors/">Find doctors</a><a href="/hospitals/">Explore hospitals</a><a href="/specialties/">Medical specialties</a><a href="/health-guides/">Health guides</a><a href="/feedback/">Feedback</a><a href="/privacy/">Privacy Policy</a><a href="/terms/">Terms of Service</a><a href="/cookie-policy/">Cookie Policy</a><a href="/editorial-policy/">Editorial policy</a></nav><p>Information is for discovery and education only. Confirm current OPD schedules on Slashcure or with the clinic.</p></div>';
  var footer=document.querySelector("body footer");if(footer&&footer.parentNode)footer.parentNode.insertBefore(panel,footer);else document.body.appendChild(panel);
})();

/* Sitewide Slashcure text-only promotion (approved style). */
(function(){
"use strict";
function installPromo(){
 if(!document.body||document.getElementById("hp-global-slashcure-promo")||document.querySelector(".hcc-slashcure-promo")||document.querySelector(".hp-static-slashcure-promo"))return;
 if(document.querySelector('meta[name="robots"][content*="noindex"]'))return;
 var style=document.createElement("style");style.id="hp-global-slashcure-promo-css";
 style.textContent='#hp-global-slashcure-promo{box-sizing:border-box;max-width:1120px;width:calc(100% - 32px);margin:32px auto;padding:22px 25px;border:1px solid #c9dff3;border-radius:16px;background:linear-gradient(110deg,#eaf5ff,#fff 60%,#e7f3ff);display:flex;align-items:center;justify-content:space-between;gap:24px;box-shadow:0 8px 25px #0a488211;font-family:system-ui,-apple-system,Segoe UI,sans-serif}#hp-global-slashcure-promo *{box-sizing:border-box}#hp-global-slashcure-promo .hp-promo-copy{flex:1;min-width:0}#hp-global-slashcure-promo .hp-promo-name{font-size:clamp(1.5rem,3vw,2rem);font-weight:850;letter-spacing:-.05em;line-height:1.1;color:#082d69}#hp-global-slashcure-promo .hp-promo-name strong{color:#e31333}#hp-global-slashcure-promo .hp-promo-name small{font-size:.56em;letter-spacing:-.03em}#hp-global-slashcure-promo .hp-promo-title{margin:8px 0 4px;font-size:clamp(1rem,2vw,1.3rem);font-weight:750;color:#12376b;line-height:1.35}#hp-global-slashcure-promo .hp-promo-subtitle{margin:5px 0 0;color:#50677d;line-height:1.5;font-size:.9rem}#hp-global-slashcure-promo .hp-promo-cta{display:inline-block;background:#df112d;color:#fff!important;text-decoration:none;border-radius:30px;padding:13px 20px;font-weight:800;text-align:center;white-space:nowrap}#hp-global-slashcure-promo .hp-promo-cta:hover,#hp-global-slashcure-promo .hp-promo-cta:focus-visible{background:#b30825;text-decoration:none}@media(max-width:660px){#hp-global-slashcure-promo{flex-direction:column;align-items:stretch;text-align:center;padding:20px}#hp-global-slashcure-promo .hp-promo-cta{white-space:normal}}@media print{#hp-global-slashcure-promo{display:none}}';
 document.head.appendChild(style);
 var banner=document.createElement("aside");
 banner.id="hp-global-slashcure-promo";
 banner.setAttribute("aria-label","Explore healthcare with Slashcure");
 banner.innerHTML='<div class="hp-promo-copy"><div class="hp-promo-name">Slash<strong>cure</strong><small>.com</small></div><div class="hp-promo-title">Explore Doctors, Hospitals &amp; Live Schedules in Your City</div><p class="hp-promo-subtitle">Health Care, Connected.</p></div><a class="hp-promo-cta" href="https://slashcure.com/" target="_blank" rel="noopener noreferrer">Visit Slashcure.com ↗</a>';
 // Place the promotion where visitors see it, not at the bottom of long profiles.
 var main=document.querySelector("main");
 var hero=document.querySelector("main > section:first-child, main > .hero:first-child, main > .hp-page-hero:first-child");
 var header=document.querySelector("body > header");
 var footer=document.querySelector("footer");
 if(hero&&hero.parentNode){hero.insertAdjacentElement("afterend",banner)}
 else if(main){main.insertBefore(banner,main.firstChild)}
 else if(header&&header.parentNode){header.insertAdjacentElement("afterend",banner)}
 else if(footer&&footer.parentNode){footer.parentNode.insertBefore(banner,footer)}
 else document.body.appendChild(banner);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",installPromo,{once:true});else installPromo();
})();

/* Slashcure advert CTA: approved sequential letter wave. */
(function(){
"use strict";
function animateSlashcureButtons(){
 var ads=document.querySelectorAll(".hp-static-slashcure-promo, .hcc-slashcure-promo, #hp-global-slashcure-promo");
 if(!ads.length)return;
 if(!document.getElementById("hp-slashcure-wave-style")){
  var style=document.createElement("style");
  style.id="hp-slashcure-wave-style";
  style.textContent=".hp-slashcure-wave-letter{display:inline-block;animation:hp-slashcure-letter-wave 2.65s ease-in-out infinite;animation-delay:calc(var(--hp-wave-index)*.065s);will-change:transform}.hp-slashcure-wave-arrow{display:inline-block;margin-left:7px}@keyframes hp-slashcure-letter-wave{0%,12%,45%,100%{transform:translateY(0)}24%{transform:translateY(-6px)}36%{transform:translateY(3px)}}@media(prefers-reduced-motion:reduce){.hp-slashcure-wave-letter{animation:none}}";
  document.head.appendChild(style);
 }
 ads.forEach(function(ad){
  var links=ad.querySelectorAll("a[href]");
  links.forEach(function(link){
   if(link.dataset.hpWaveReady==="true"||!/Visit\s+Slashcure\.com/i.test(link.textContent))return;
   link.dataset.hpWaveReady="true";
   link.setAttribute("aria-label","Visit Slashcure.com");
   var letters=document.createElement("span");
   letters.setAttribute("aria-hidden","true");
   "Visit Slashcure.com".split("").forEach(function(char,i){
    var span=document.createElement("span");
    span.className="hp-slashcure-wave-letter";
    span.style.setProperty("--hp-wave-index",String(i));
    span.textContent=char===" "?"\u00a0":char;
    letters.appendChild(span);
   });
   var arrow=document.createElement("span");
   arrow.className="hp-slashcure-wave-arrow";
   arrow.setAttribute("aria-hidden","true");
   arrow.textContent="↗";
   link.replaceChildren(letters,arrow);
  });
 });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",animateSlashcureButtons,{once:true});
else animateSlashcureButtons();
})();

/* Shared site-wide directory assistant. The homepage also includes the script directly; the assistant guards duplicate initialization. */
(function(){
  if(document.querySelector('script[src="/assets/hospitalpro-chatbot.js"]'))return;
  var script=document.createElement("script");
  script.src="/assets/hospitalpro-chatbot.js";
  script.defer=true;
  document.head.appendChild(script);
})();
