(function(){
'use strict';
if(document.getElementById('hp-chat-toggle'))return;
var css='#hp-chat-toggle{position:fixed;right:18px;bottom:18px;z-index:9000;background:#1456b8;color:white;border:0;border-radius:30px;padding:14px 18px;font:bold 15px system-ui;box-shadow:0 8px 28px #20416a55;cursor:pointer}#hp-chatbox{position:fixed;right:15px;bottom:80px;width:min(380px,calc(100vw - 30px));height:min(535px,calc(100dvh - 105px));z-index:9001;background:white;border:1px solid #cddbed;border-radius:17px;box-shadow:0 12px 45px #112a4b55;display:none;flex-direction:column;overflow:hidden;font:14px/1.5 system-ui;color:#193151}#hp-chatbox.open{display:flex}#hp-chathead{padding:13px;background:#1456b8;color:white;display:flex;justify-content:space-between;align-items:center}#hp-chathead button{font-size:22px;border:0;background:transparent;color:white;cursor:pointer}#hp-chatmessages{flex:1;overflow:auto;padding:12px;background:#f3f7fd}#hp-chatmessages .hp-msg{padding:10px;margin:8px 0;border-radius:12px;background:white;border:1px solid #dce6f4;white-space:pre-wrap;overflow-wrap:anywhere}#hp-chatmessages .hp-me{background:#dcecff;margin-left:15%}#hp-chatmessages a{color:#135ab7;text-decoration:underline;display:block;font-weight:bold;margin-top:6px}#hp-chatquick{padding:8px;display:flex;gap:6px;flex-wrap:wrap}#hp-chatquick button{background:#edf5ff;border:1px solid #c6daf3;border-radius:25px;padding:7px;font-size:12px;cursor:pointer}#hp-chatform{display:flex;gap:6px;padding:9px;border-top:1px solid #dce6f4}#hp-chatinput{flex:1;min-width:0;border:1px solid #c6d6eb;border-radius:9px;padding:11px}#hp-chatform button{border:0;background:#1456b8;color:white;border-radius:9px;padding:0 13px;cursor:pointer}#hp-chatnote{font-size:10px;color:#607087;padding:0 10px 9px}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
var toggle=document.createElement('button');toggle.id='hp-chat-toggle';toggle.type='button';toggle.textContent='💬 Ask HospitalPro';toggle.setAttribute('aria-expanded','false');
var box=document.createElement('section');box.id='hp-chatbox';box.setAttribute('role','dialog');box.setAttribute('aria-label','HospitalPro directory assistant');
box.innerHTML='<div id="hp-chathead"><div><b>💬 HospitalPro Assistant</b><div style="font-size:11px">Published doctor & hospital information</div></div><button type="button" id="hp-chatclose" aria-label="Close">×</button></div><div id="hp-chatmessages" aria-live="polite"></div><div id="hp-chatquick"><button data-query="Doctors in Sukkur">Sukkur doctors</button><button data-query="Cardiologist in Sukkur">Cardiologists</button><button data-query="Dr Naveed timing">OPD timings</button></div><form id="hp-chatform"><input id="hp-chatinput" maxlength="180" aria-label="Ask a question" placeholder="Ask about doctors or OPD timings" required><button type="submit">Send</button></form><div id="hp-chatnote">No live availability; verify clinic timings before travelling. Not medical advice.</div>';
document.body.append(toggle,box);
var log=box.querySelector('#hp-chatmessages'),input=box.querySelector('#hp-chatinput');
function norm(s){return String(s||'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();}
function write(t,m,url){var d=document.createElement('div');d.className='hp-msg'+(m?' hp-me':'');d.textContent=t;if(url&&/^https?:\/\//.test(url)){var a=document.createElement('a');a.href=url;a.rel='noopener noreferrer';a.target='_blank';a.textContent='Open full profile / check updates ↗';d.appendChild(a);}log.appendChild(d);log.scrollTop=log.scrollHeight;}
function answer(q){
var ds=Array.isArray(window.DOCTORS)?window.DOCTORS:[],hs=Array.isArray(window.HOSPITALS)?window.HOSPITALS:[];
var s=norm(q),cities=['sukkur','khairpur','ghotki','larkana','hyderabad','lahore','karachi','shikarpur','pano aqil','quetta','peshawar'];
var c=cities.find(x=>s.includes(x))||norm(window.hpSelectedCity||'');
var hospital=/hospital|diagnostic|medical center|medical centre/.test(s)&&!/doctor|dr |surgeon|cardiolog|physician|urolog|gastro|paediatric|pediatric|orthop|neurolog/.test(s);
var names=s.split(' ').filter(x=>x.length>2&&!['doctor','doctors','the','and','what','when','where','please','tell','about','timing','timings','time','hours','clinic','opd','hospital','hospitals','today','tomorrow','schedule','available','open','find','show','are','near'].includes(x)&&!cities.some(t=>t.split(' ').includes(x)));
if(/emergency|chest pain|unconscious|severe bleeding/.test(s)){write('For a medical emergency, seek immediate emergency care. This assistant cannot evaluate symptoms.');return;}
var data=hospital?hs:ds;
if(!data.length){write('Directory information is unavailable on this page. Try the full Slashcure directory.');return;}
var matches=data.map(d=>{var n=norm(d.n),sp=norm((d.sp||'')+' '+(d.cat||'')),loc=norm(d.loc),points=names.reduce((sum,x)=>sum+(n.includes(x)?12:sp.includes(x)?7:loc.includes(x)?3:0),0)+(c&&loc.includes(c)?5:0);return {d:d,points:points};}).filter(x=>names.length?x.points>(c?5:0):!c||norm(x.d.loc).includes(c)).sort((a,b)=>b.points-a.points);
if(!matches.length){write('No matching doctor or hospital in the published homepage list. Try another name or city, or open Slashcure.com/doctors.');return;}
write('Matching published '+(hospital?'hospital':'doctor')+' profiles (not live OPD status):');
matches.slice(0,5).forEach(x=>{var d=x.d;write((hospital?'🏥 ':'👨‍⚕️ ')+d.n+'\n'+(d.sp||'')+'\n📍 '+d.loc+'\n'+(hospital?'Hospital hours not verified.':'🕒 '+(d.tm||'Timings not published'))+'\nConfirm updates before visiting.',false,d.url||d.hospitalpro);});
if(matches.length>5)write('Showing 5 matches. Search a specific name for more detail.');
}
function ask(q){if(!q.trim())return;write(q,true);answer(q);}
toggle.addEventListener('click',()=>{var open=box.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));if(open)input.focus();});
box.querySelector('#hp-chatclose').addEventListener('click',()=>{box.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.focus();});
box.querySelector('#hp-chatform').addEventListener('submit',e=>{e.preventDefault();var q=input.value;input.value='';ask(q);});
box.querySelectorAll('[data-query]').forEach(b=>b.addEventListener('click',()=>ask(b.dataset.query)));
write('Hello! Ask me about a doctor, specialty, city or published OPD schedule. For example, “Dr Naveed timing” or “cardiologists in Sukkur”.');
})();