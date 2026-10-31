/* HospitalPro shared navigation. No cookies, analytics requests or patient data collection. */
(function(){
  "use strict";
  if(document.getElementById("hp-global-links")) return;
  var css=document.createElement("style");
  css.textContent="#hp-global-links{background:#f2f7fc;border-top:1px solid #dbe8f4;padding:25px 16px;color:#204568;text-align:center;font:13px/1.8 system-ui,-apple-system,Segoe UI,sans-serif}#hp-global-links .hp-links-inner{max-width:1080px;margin:auto}#hp-global-links nav{display:flex;align-items:center;justify-content:center;gap:8px 18px;flex-wrap:wrap}#hp-global-links a{color:#135a9d;font-weight:750;text-decoration:none}#hp-global-links a:hover,#hp-global-links a:focus-visible{text-decoration:underline}#hp-global-links p{font-size:11px;color:#6a7c8c;margin:9px 0 0}#hp-global-links a:focus-visible{outline:2px solid #135a9d;outline-offset:3px}@media print{#hp-global-links{display:none}}";
  document.head.appendChild(css);
  var panel=document.createElement("section"); panel.id="hp-global-links";panel.setAttribute("aria-label","Explore HospitalPro");
  panel.innerHTML='<div class="hp-links-inner"><nav aria-label="HospitalPro sitewide links"><a href="/find-doctors/">Find doctors</a><a href="/hospitals/">Explore hospitals</a><a href="/health-guides/">Health guides</a><a href="/feedback/">Feedback</a><a href="/privacy/">Privacy</a><a href="/editorial-policy/">Editorial policy</a></nav><p>Information is for discovery and education only. Confirm current OPD schedules on Slashcure or with the clinic.</p></div>';
  var footer=document.querySelector("body footer");if(footer&&footer.parentNode)footer.parentNode.insertBefore(panel,footer);else document.body.appendChild(panel);
})();