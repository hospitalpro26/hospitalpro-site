(function(){
"use strict";
if(document.getElementById("hp-chat-toggle"))return;
var style=document.createElement("style");
style.textContent="#hp-chat-toggle{position:fixed;right:18px;bottom:18px;z-index:9000;border:0;border-radius:30px;background:#1456b8;color:white;padding:14px 18px;font:bold 15px system-ui;box-shadow:0 8px 28px #20416a55;cursor:pointer}#hp-chatbox{position:fixed;right:15px;bottom:80px;width:min(390px,calc(100vw - 30px));height:min(575px,calc(100dvh - 105px));z-index:9001;background:white;border:1px solid #cddbed;border-radius:17px;box-shadow:0 12px 45px #112a4b55;display:none;flex-direction:column;overflow:hidden;font:14px/1.5 system-ui;color:#193151}#hp-chatbox.open{display:flex}#hp-chathead{padding:13px;background:#1456b8;color:white;display:flex;justify-content:space-between;align-items:center}#hp-chathead button{font-size:22px;border:0;background:transparent;color:white;cursor:pointer}#hp-chatmessages{flex:1;overflow:auto;padding:12px;background:#f3f7fd}#hp-chatmessages .hp-msg{padding:10px;margin:8px 0;border-radius:12px;background:white;border:1px solid #dce6f4;white-space:pre-wrap;overflow-wrap:anywhere}#hp-chatmessages .hp-me{background:#dcecff;margin-left:15%}#hp-chatmessages a{color:#135ab7;text-decoration:underline;display:block;font-weight:bold;margin-top:7px}#hp-chatquick{padding:8px;display:flex;gap:6px;flex-wrap:wrap}#hp-chatquick button{background:#edf5ff;border:1px solid #c6daf3;border-radius:25px;padding:7px;font-size:12px;cursor:pointer}#hp-chatform{display:flex;gap:6px;padding:9px;border-top:1px solid #dce6f4}#hp-chatinput{flex:1;min-width:0;border:1px solid #c6d6eb;border-radius:9px;padding:11px}#hp-chatform button{border:0;background:#1456b8;color:white;border-radius:9px;padding:0 13px;cursor:pointer}#hp-chatnote{font-size:10px;color:#607087;padding:0 10px 9px}";
document.head.appendChild(style);
var toggle=document.createElement("button");toggle.id="hp-chat-toggle";toggle.type="button";toggle.textContent="💬 Ask HospitalPro";toggle.setAttribute("aria-expanded","false");
var box=document.createElement("section");box.id="hp-chatbox";box.setAttribute("role","dialog");box.setAttribute("aria-label","HospitalPro site information assistant");
box.innerHTML='<div id="hp-chathead"><div><b>💬 HospitalPro Assistant</b><div style="font-size:11px">Search all HospitalPro public pages</div></div><button type="button" id="hp-chatclose" aria-label="Close chatbot">×</button></div><div id="hp-chatmessages" aria-live="polite"></div><div id="hp-chatquick"><button type="button" data-query="Doctors in Sukkur">Sukkur doctors</button><button type="button" data-query="Dr Naveed OPD timings">OPD timings</button><button type="button" data-query="Hospitals in Khairpur">Khairpur hospitals</button></div><form id="hp-chatform"><input id="hp-chatinput" maxlength="220" aria-label="Ask about HospitalPro" placeholder="Ask about any HospitalPro page" required><button type="submit">Send</button></form><div id="hp-chatnote">Answers are from published pages, not live availability or medical advice. Confirm changes with clinics.</div>';
document.body.append(toggle,box);
var log=box.querySelector("#hp-chatmessages"),input=box.querySelector("#hp-chatinput");
function say(t,m,link,label){var d=document.createElement("div");d.className="hp-msg"+(m?" hp-me":"");d.textContent=t;if(link&&/^https:\/\/hospitalpro\.online\/|^https:\/\/slashcure\.com\//.test(link)){var a=document.createElement("a");a.href=link;a.rel="noopener noreferrer";a.target="_blank";a.textContent=label||"Read the full page ↗";d.appendChild(a);}log.appendChild(d);log.scrollTop=log.scrollHeight;}
var db=null,loading=null;
function loadIndex(){
 if(db)return Promise.resolve(db);
 if(loading)return loading;
 loading=Promise.all(Array.from({length:7},function(_,i){return fetch("/assets/hp-knowledge-"+i+".json",{cache:"default"}).then(function(r){if(!r.ok)throw Error("Search index unavailable");return r.json();});})).then(function(parts){db=parts.flat();return db;}).catch(function(e){loading=null;throw e;});
 return loading;
}
function norm(s){return String(s||"").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();}
var ignore=new Set(["who","what","when","where","which","show","tell","please","give","about","information","details","doctor","doctors","dr","the","are","for","and","with","from","this","that","their","can","have","hospitalpro","me","is","in","at","of","a","an","near","on","best","list","all"]);
var timeWords=/timing|schedule|hours|opd|open|closing|monday|tuesday|wednesday|thursday|friday|saturday|sunday|today|tomorrow|available/;
function snippet(page,terms,needTime){
 var s=String(page.text||""),lower=norm(s),best="",bestScore=-1;
 var chunks=s.match(/.{1,240}(?:[.!?]\s|$)/g)||[s];
 chunks=chunks.slice(0,150);
 chunks.forEach(function(chunk){var n=norm(chunk),score=terms.reduce(function(a,t){return a+(n.includes(t)?3:0);},0)+(needTime&&timeWords.test(n)?4:0);
 if(score>bestScore){bestScore=score;best=chunk.trim();}});
 if(needTime&&!timeWords.test(norm(best))){var hit=s.search(/\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|OPD|Timings|Hours)\b/i);if(hit>=0)best=s.slice(Math.max(0,hit-65),Math.min(s.length,hit+260)).trim();}
 return best.length>350?best.slice(0,347)+"…":best;
}
function rank(page,terms,city,needTime){
 var title=norm(page.title),desc=norm(page.description),body=norm(page.text),score=0;
 var slug=norm(page.url);
 terms.forEach(function(t){if(title.includes(t))score+=18;if(slug.includes(t))score+=12;if(desc.includes(t))score+=7;if(body.includes(t))score+=2;});
 if(city&&(title.includes(city)||slug.includes(city)))score+=13;
 if(needTime&&/dr-|doctor/.test(slug))score+=3;
 if(page.url==="https://hospitalpro.online/")score-=18;
 return score;
}
function respond(q,pages){
 var nq=norm(q),cityNames=["sukkur","khairpur","ghotki","larkana","hyderabad","lahore","karachi","shikarpur","pano aqil","quetta","peshawar"];
 var city=cityNames.find(function(n){return nq.includes(n);})||"";
 var terms=nq.split(" ").filter(function(x){return x.length>2&&!ignore.has(x)&&!cityNames.some(function(n){return n.split(" ").includes(x);})&&!timeWords.test(x);});
 var wantsTime=timeWords.test(nq);
 var isHosp=/hospital|medical centre|medical center|diagnostic/.test(nq)&&!/dr |doctor|surgeon|physician|specialist|cardiolog|urolog|neurolog|gastro/.test(nq);
 var isDoctor=/doctor|dr |surgeon|physician|specialist|cardiolog|urolog|neurolog|gastro|gyne|gynae|paediatr|pediatr|pulmon|ortho|dentist/.test(nq);
 if(/chest pain|unconscious|severe bleeding|emergency medical|heart attack/.test(nq)){say("If someone is seriously ill or injured, seek emergency medical care. This information assistant cannot diagnose or triage patients.");return;}
 if(!terms.length&&!city&&!isHosp&&!isDoctor&&!wantsTime){say("I can search doctor profiles, hospital information, city guides, OPD schedules, FAQs and health guides. Try asking a doctor name, specialty or city.");return;}
 var matches=pages.map(function(p){return {p:p,score:rank(p,terms,city,wantsTime)};}).filter(function(x){
 if(terms.length&&x.score<=0)return false;
 if(!terms.length&&city&&!((norm(x.p.title)+" "+norm(x.p.url)+" "+norm(x.p.description)).includes(city)))return false;
 if(isHosp&&!isDoctor&&!/hospital|medical|diagnostic|clinic|khairpur\//.test(norm(x.p.title)+" "+x.p.url))return false;
 return true;
 }).sort(function(a,b){return b.score-a.score;});
 if(!matches.length){say("I couldn't find that information in the currently published HospitalPro pages. Try a doctor's full name, hospital or city. For the latest schedules, check Slashcure.com.","", "https://slashcure.com/doctors","Search on Slashcure ↗");return;}
 say("I found the following on HospitalPro. These are published details, not real-time updates:");
 matches.slice(0,4).forEach(function(x){
 var p=x.p,excerpt=snippet(p,terms,wantsTime);
 say("📄 "+p.title+"\n"+(excerpt||p.description||"Open this page for details."),false,p.url,"Open source page ↗");
 });
 if(matches.length>4)say("Showing the most relevant 4 of "+matches.length+" results. Try a more specific name or specialty.");
}
function ask(q){if(!q.trim())return;say(q.trim(),true);say("Searching published HospitalPro pages…");var working=log.lastChild;loadIndex().then(function(pages){if(working&&working.parentNode)working.remove();respond(q,pages);}).catch(function(){if(working&&working.parentNode)working.remove();say("The website search index could not load. Please try again or use the doctor directory.",false,"https://hospitalpro.online/find-doctors/");});}
toggle.addEventListener("click",function(){var open=box.classList.toggle("open");toggle.setAttribute("aria-expanded",String(open));if(open)input.focus();});
box.querySelector("#hp-chatclose").addEventListener("click",function(){box.classList.remove("open");toggle.setAttribute("aria-expanded","false");toggle.focus();});
box.querySelector("#hp-chatform").addEventListener("submit",function(e){e.preventDefault();var q=input.value;input.value="";ask(q);});
box.querySelectorAll("[data-query]").forEach(function(b){b.addEventListener("click",function(){ask(b.getAttribute("data-query"));});});
say("Welcome! I can search doctor profiles, hospital pages, city guides, FAQs and published OPD timings across HospitalPro. What would you like to know?");
})();