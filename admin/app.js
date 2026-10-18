/* HospitalPro Admin — staging-only browser draft editor.
   IMPORTANT: No publishing, secrets, OAuth or login are implemented here.
   The live GitHub Pages site must not read this draft data until reviewed. */
(() => {
  "use strict";
  const STORAGE_KEY = "hospitalpro-admin-drafts-v1";
  const sections = ["overview","doctors","hospitals","promotions","content","faqs","publishing"];
  const recordTypes = ["doctors","hospitals","promotions","faqs"];
  const schemas = {
    doctors: {
      singular: "doctor", icon:"♧", heading:"Doctor",
      fields: [
        {key:"name",label:"Doctor's name",required:true,maxlength:160},
        {key:"specialty",label:"Specialty / designation",required:true,maxlength:180},
        {key:"location",label:"Clinic / city",maxlength:230},
        {key:"schedule",label:"Advertised OPD schedule",maxlength:300},
        {key:"profileUrl",label:"Slashcure profile URL",type:"url",maxlength:900},
        {key:"notes",label:"Advertising notes",type:"textarea",maxlength:1600}
      ]
    },
    hospitals: {
      singular:"hospital",icon:"✚",heading:"Hospital / clinic",
      fields:[
        {key:"name",label:"Hospital / clinic name",required:true,maxlength:200},
        {key:"city",label:"City",required:true,maxlength:120},
        {key:"summary",label:"Services / short summary",type:"textarea",maxlength:1000},
        {key:"profileUrl",label:"Slashcure hospital link",type:"url",maxlength:900},
        {key:"notes",label:"Advertising notes",type:"textarea",maxlength:1200}
      ]
    },
    promotions: {
      singular:"advertisement",icon:"✦",heading:"Advertisement",
      fields:[
        {key:"name",label:"Advertisement title",required:true,maxlength:200},
        {key:"placement",label:"Planned placement",type:"select",options:["Homepage banner","Featured doctors","Featured hospitals","Healthcare partners","Other"]},
        {key:"summary",label:"Advertisement text",type:"textarea",maxlength:1000},
        {key:"profileUrl",label:"Destination URL",type:"url",maxlength:900}
      ]
    },
    faqs: {
      singular:"FAQ",icon:"?",heading:"FAQ",
      fields:[
        {key:"question",label:"Question",required:true,maxlength:260},
        {key:"answer",label:"Answer",required:true,type:"textarea",maxlength:2200}
      ]
    }
  };
  const fresh = () => ({schemaVersion:1,site:{
    quote:"Through innovation and technology, we bring people together on one platform, because healthcare is our duty and guiding people to the right care is our prime responsibility.",
    tagline:"Better Healthcare. For a Healthier Pakistan.",
    about:"HospitalPro helps people discover hospitals and doctors, with fuller profiles and OPD updates available on Slashcure."
  }, doctors:[],hospitals:[],promotions:[],faqs:[]});
  let state=fresh(), active="overview", currentType=null, currentId=null;
  const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
  const findRecord=(type,id)=>(state[type]||[]).find(x=>x.id===id);
  function id(){return typeof crypto!=="undefined" && crypto.randomUUID ? crypto.randomUUID() : "draft-"+Date.now()+"-"+Math.random().toString(36).slice(2);}
  function text(el,s){el.textContent=String(s??"");return el;}
  function toast(message){
    const t=$("#toast");text(t,message);t.hidden=false;
    clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.hidden=true,3500);
  }
  function safeGet(){try{return localStorage.getItem(STORAGE_KEY)}catch{return null}}
  function safeStore(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));return true}catch{toast("Browser storage unavailable; export your drafts to keep them.");return false}}
  function normalize(input){
    if(!input||typeof input!=="object"||Array.isArray(input)||input.schemaVersion!==1)throw Error("Expected a HospitalPro draft JSON file (schemaVersion 1).");
    const clean=fresh();
    if(input.site && typeof input.site==="object"){
      ["quote","tagline","about"].forEach(k=>{if(typeof input.site[k]==="string")clean.site[k]=input.site[k].slice(0,5000)});
    }
    for(const type of recordTypes){
      if(input[type]!==undefined&&!Array.isArray(input[type]))throw Error(type+" must be an array.");
      clean[type]=(input[type]||[]).slice(0,1000).filter(x=>x&&typeof x==="object"&&!Array.isArray(x)).map(x=>{
        const item={id:typeof x.id==="string" && x.id.length<120?x.id:id()};
        for(const f of schemas[type].fields)item[f.key]=typeof x[f.key]==="string"?x[f.key].slice(0,f.maxlength||1200):"";
        return item;
      });
    }
    return clean;
  }
  function refreshMetrics(){recordTypes.forEach(type=>{const el=$('[data-count="'+type+'"]');if(el)el.textContent=state[type].length})}
  function setView(view){
    if(!sections.includes(view))return;
    active=view;
    $$("[data-panel]").forEach(el=>el.hidden=el.dataset.panel!==view);
    $$(".navitem[data-view]").forEach(el=>{
      const selected=el.dataset.view===view;el.classList.toggle("active",selected);
      if(selected)el.setAttribute("aria-current","page");else el.removeAttribute("aria-current");
    });
    $("#sidebar").classList.remove("open");$("#menuToggle").setAttribute("aria-expanded","false");
    if(recordTypes.includes(view))renderRecords(view);
    if(view==="content")fillContent();
    window.scrollTo({top:0,behavior:"instant"});
  }
  function button(label,cls,onClick){
    const b=document.createElement("button");
    b.type="button";b.className="btn "+cls;b.textContent=label;b.addEventListener("click",onClick);return b;
  }
  function subtitle(type,item){
    if(type==="doctors")return [item.specialty,item.location,item.schedule].filter(Boolean).join(" · ");
    if(type==="hospitals")return [item.city,item.summary].filter(Boolean).join(" · ");
    if(type==="promotions")return [item.placement,item.summary].filter(Boolean).join(" · ");
    return item.answer;
  }
  function renderRecords(type){
    const root=$('[data-list="'+type+'"]');
    if(!root)return;
    root.replaceChildren();
    const input=$('[data-search="'+type+'"]');
    const q=(input?.value||"").trim().toLowerCase();
    const items=(state[type]||[]).filter(x=>Object.values(x).some(v=>typeof v==="string"&&v.toLowerCase().includes(q)));
    if(!items.length){
      const empty=document.createElement("div");empty.className="empty";
      const h=document.createElement("strong");h.textContent=q?"No matching draft records":"No "+type+" drafts yet";
      const p=document.createElement("p");p.textContent=q?"Try another search term.":"Create your first draft record, or import a HospitalPro JSON draft. Existing live website listings have not yet been migrated.";
      empty.append(h,p);root.append(empty);return;
    }
    items.forEach(item=>{
      const row=document.createElement("article");row.className="record";
      const avatar=document.createElement("span");avatar.className="record-avatar";avatar.textContent=schemas[type].icon;
      const details=document.createElement("div");details.className="record-details";
      const title=document.createElement("strong");title.className="record-title";title.textContent=item.name||item.question||"Untitled";
      const sub=document.createElement("p");sub.className="record-sub";sub.textContent=subtitle(type,item)||"No additional details";
      details.append(title,sub);
      const controls=document.createElement("div");controls.className="record-buttons";
      controls.append(button("Edit","outline",()=>openForm(type,item.id)),button("Delete","danger",()=>{
        if(confirm("Delete this local "+schemas[type].singular+" draft? This does not affect the live website.")){
          state[type]=state[type].filter(x=>x.id!==item.id);commitDraft();renderRecords(type);toast("Draft removed.");
        }
      }));
      row.append(avatar,details,controls);root.append(row);
    });
  }
  function openForm(type,recordId=null){
    if(!schemas[type])return;
    currentType=type;currentId=recordId;
    const existing=recordId?findRecord(type,recordId):null;
    $("#dialogTitle").textContent=(existing?"Edit ":"Add ")+schemas[type].heading+" draft";
    const fields=$("#dialogFields");fields.replaceChildren();
    for(const f of schemas[type].fields){
      const wrapper=document.createElement("div");wrapper.className="field";
      const label=document.createElement("label");label.htmlFor="edit-"+f.key;label.textContent=f.label+(f.required?" *":"");
      let input;
      if(f.type==="textarea"){input=document.createElement("textarea");input.rows=4}
      else if(f.type==="select"){
        input=document.createElement("select");
        for(const option of f.options){
          const opt=document.createElement("option");opt.value=option;opt.textContent=option;input.append(opt);
        }
      }else{input=document.createElement("input");input.type=f.type||"text"}
      input.name=f.key;input.id="edit-"+f.key;input.required=Boolean(f.required);
      input.maxLength=f.maxlength||1200;
      input.value=existing?.[f.key]||"";
      wrapper.append(label,input);fields.append(wrapper);
    }
    const dialog=$("#recordDialog");dialog.showModal();
  }
  function saveForm(e){
    e.preventDefault();
    if(!$("#recordForm").reportValidity())return;
    const type=currentType;
    if(!schemas[type])return;
    const data={id:currentId||id()};
    for(const f of schemas[type].fields){
      const el=$("#recordForm").elements.namedItem(f.key);
      data[f.key]=String(el.value||"").trim();
      if(f.type==="url"&&data[f.key]){
        try{const u=new URL(data[f.key]);if(u.protocol!=="https:")throw Error("invalid");
        }catch{el.setCustomValidity("Use a secure https:// URL.");el.reportValidity();el.addEventListener("input",()=>el.setCustomValidity(""),{once:true});return;}
      }
    }
    if(currentId){
      const idx=state[type].findIndex(x=>x.id===currentId);
      if(idx<0)return;
      state[type][idx]=data;
    }else state[type].push(data);
    commitDraft();$("#recordDialog").close();renderRecords(type);toast("Saved locally — not published.");
  }
  function fillContent(){
    $("#quoteInput").value=state.site.quote||"";
    $("#taglineInput").value=state.site.tagline||"";
    $("#aboutInput").value=state.site.about||"";
  }
  function commitDraft(){safeStore();refreshMetrics()}
  function exportDraft(){
    const data=JSON.stringify(state,null,2);
    const blob=new Blob([data],{type:"application/json;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download="hospitalpro-admin-drafts.json";
    document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),2000);
    toast("Draft JSON file prepared. Nothing was published.");
  }
  async function importDraft(file){
    if(!file)return;
    if(file.size>2000000){toast("Import is too large (maximum 2 MB).");return}
    try{
      const parsed=JSON.parse(await file.text());
      const clean=normalize(parsed);
      if(!confirm("Replace your browser's current drafts with records from this JSON file? The public website will not change."))return;
      state=clean;commitDraft();fillContent();
      if(recordTypes.includes(active))renderRecords(active);
      toast("Imported to local drafts only.");
    }catch(err){toast("Import failed: "+err.message)}
    finally{$("#importFile").value=""}
  }
  async function initialize(){
    const cached=safeGet();
    if(cached){
      try{state=normalize(JSON.parse(cached))}
      catch{state=fresh();toast("Old local draft data could not be loaded.")}
    }else{
      try{
        const response=await fetch("../cms/site-content.json",{cache:"no-store"});
        if(response.ok)state=normalize(await response.json());
      }catch{ /* Offline preview: fallback to approved quote and empty lists. */ }
    }
    refreshMetrics();fillContent();
    $$(".navitem[data-view]").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.view)));
    $$("[data-goto]").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.goto)));
    $$("[data-add]").forEach(b=>b.addEventListener("click",()=>openForm(b.dataset.add)));
    $$("[data-search]").forEach(el=>el.addEventListener("input",()=>renderRecords(el.dataset.search)));
    $("#recordForm").addEventListener("submit",saveForm);
    $("#dialogClose").addEventListener("click",()=>$("#recordDialog").close());
    $("#dialogCancel").addEventListener("click",()=>$("#recordDialog").close());
    $("#contentForm").addEventListener("submit",e=>{
      e.preventDefault();
      state.site.quote=$("#quoteInput").value.trim();
      state.site.tagline=$("#taglineInput").value.trim();
      state.site.about=$("#aboutInput").value.trim();
      commitDraft();toast("Homepage wording saved to browser drafts only.");
    });
    ["exportTop","exportHere"].forEach(key=>$("#"+key).addEventListener("click",exportDraft));
    ["importTop","importHere"].forEach(key=>$("#"+key).addEventListener("click",()=>$("#importFile").click()));
    $("#importFile").addEventListener("change",e=>importDraft(e.target.files[0]));
    $("#resetDrafts").addEventListener("click",()=>{
      if(!confirm("Reset the browser's draft workspace? Export a backup first if you need your draft edits."))return;
      try{localStorage.removeItem(STORAGE_KEY)}catch{}
      state=fresh();commitDraft();fillContent();if(recordTypes.includes(active))renderRecords(active);toast("Local drafts reset.");
    });
    $("#menuToggle").addEventListener("click",()=>{
      const open=$("#sidebar").classList.toggle("open");
      $("#menuToggle").setAttribute("aria-expanded",String(open));
    });
    setView("overview");
  }
  initialize().catch(err=>{const notice=$(".notice p");if(notice)notice.textContent="Dashboard could not initialize: "+err.message;});
})();