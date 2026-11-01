/* HospitalPro Studio: client-side GitHub publishing. Credentials are kept in memory only. */
(function () {
  "use strict";
  const REPO = "hospitalpro26/hospitalpro-site";
  const API = "https://api.github.com/repos/" + REPO;
  const DOCTORS = "assets/doctors-registry.json";
  const HOSPITALS = "assets/hospitals-registry.json";
  const MAX_IMAGE = 1536 * 1024;
  const el = id => document.getElementById(id);
  const state = {
    credential: "", account: "", view: "overview", doctors: null, hospitals: null,
    docSha: "", hosSha: "", doctorIndex: null, hospitalIndex: null, paths: [],
    pagePath: "", pageSha: "", pageHtml: "", doctorInitial: "", hospitalInitial: ""
  };
  function notice(message, failed) {
    const n = el("notice");
    n.textContent = message;
    n.classList.toggle("failure", !!failed);
    n.hidden = false;
    clearTimeout(notice.timeoutId);
    notice.timeoutId = setTimeout(() => { n.hidden = true; }, failed ? 9000 : 6000);
  }
  function errorText(error) {
    if (!error) return "Unknown error.";
    const msg = String(error.message || error);
    if (/\b(409|sha mismatch)\b/i.test(msg)) return "Someone changed this file in GitHub. Reload the dashboard and your changes before publishing again.";
    if (/\b(401|Bad credentials)\b/i.test(msg)) return "GitHub rejected the token. Check that it is valid and has not expired.";
    if (/\b(403|resource not accessible)\b/i.test(msg)) return "GitHub denied access. Check the token's repository selection and Contents: Read and write permission.";
    return msg.slice(0, 350);
  }
  function safeUrl(value, allowPath) {
    const s = String(value || "").trim();
    if (allowPath && s === "") return "";
    if (allowPath && /^\/(?!\/)[a-z0-9\-_./]*$/i.test(s) && !s.includes("..")) return s;
    if (/^https:\/\/[a-z0-9.-]+(?::443)?(?:\/|$)/i.test(s)) return s;
    throw new Error("Enter a valid HTTPS URL" + (allowPath ? " or a local path beginning with /" : "") + ".");
  }
  async function request(path, method, body) {
    if (!state.credential) throw new Error("Connect your GitHub account first.");
    const res = await fetch("https://api.github.com" + path, {
      method: method || "GET",
      cache: "no-store",
      referrerPolicy: "no-referrer",
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": "Bearer " + state.credential,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(body === undefined ? {} : { "Content-Type": "application/json" })
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
    let data;
    try { data = await res.json(); } catch (e) { data = {}; }
    if (!res.ok) {
      throw new Error("GitHub " + res.status + ": " + (data.message || res.statusText));
    }
    return data;
  }
  function decodeBase64(base64) {
    const bytes = Uint8Array.from(atob(base64.replace(/\s/g, "")), c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
  function encodeBase64(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 8192) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
    }
    return btoa(binary);
  }
  async function githubFile(path) {
    const data = await request("/repos/" + REPO + "/contents/" + path.split("/").map(encodeURIComponent).join("/") + "?ref=main");
    if (data.type !== "file" || data.encoding !== "base64" || !data.content) {
      throw new Error("This file cannot be edited using the dashboard.");
    }
    return { path, content: decodeBase64(data.content), sha: data.sha };
  }
  async function publish(path, content, sha, message) {
    const payload = { message, content: encodeBase64(content), branch: "main" };
    if (sha) payload.sha = sha;
    return request("/repos/" + REPO + "/contents/" + path.split("/").map(encodeURIComponent).join("/"), "PUT", payload);
  }
  async function withBusy(button, work) {
    if (button.disabled) return;
    button.disabled = true;
    const original = button.textContent;
    button.textContent = "Publishing / loading…";
    try { await work(); } catch (e) { notice(errorText(e), true); }
    finally { button.disabled = false; button.textContent = original; }
  }
  function todayPakistan() {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Karachi", year: "numeric", month: "2-digit", day: "2-digit"
    }).formatToParts(new Date());
    const get = t => parts.find(x => x.type === t).value;
    return get("year") + "-" + get("month") + "-" + get("day");
  }
  function showView(view) {
    if (!["overview", "doctors", "hospitals", "pages", "media"].includes(view)) return;
    state.view = view;
    document.querySelectorAll(".view").forEach(x => { x.hidden = x.id !== "view-" + view; });
    document.querySelectorAll("[data-view]").forEach(x => x.classList.toggle("active", x.dataset.view === view));
    el("current-view").textContent = {overview:"Overview",doctors:"Doctors",hospitals:"Hospitals",pages:"Pages & SEO",media:"Media library"}[view];
    document.querySelector(".sidebar").classList.remove("open");
  }
  function setCount(id, value) { el(id).textContent = String(value); }
  function updateCounts() {
    const doctors = state.doctors?.doctors?.length ?? 0;
    const hospitals = state.hospitals?.hospitals?.length ?? 0;
    setCount("count-doctors", doctors); setCount("side-doctor-count", doctors);
    setCount("count-hospitals", hospitals); setCount("side-hospital-count", hospitals);
    setCount("count-pages", state.paths.length);
  }
  async function connect(evt) {
    evt.preventDefault();
    const btn = el("connect");
    if (btn.disabled) return;
    btn.disabled = true;
    el("login-error").textContent = "";
    state.credential = el("token").value.trim();
    el("token").value = "";
    try {
      if (!state.credential) throw new Error("Please enter a token.");
      const [person, repo] = await Promise.all([
        request("/user"),
        request("/repos/" + REPO)
      ]);
      if (!repo.permissions?.push) throw new Error("The account does not have push permission for this repository.");
      state.account = person.login || "GitHub editor";
      el("account-name").textContent = "@" + state.account;
      await loadAll();
      el("login-screen").hidden = true;
      el("studio").hidden = false;
      showView("overview");
      notice("Connected to GitHub as @" + state.account + ". No token is saved to the device.");
    } catch (e) {
      state.credential = "";
      el("login-error").textContent = errorText(e);
    } finally { btn.disabled = false; }
  }
  async function loadAll() {
    const [df, hf, tree] = await Promise.all([
      githubFile(DOCTORS), githubFile(HOSPITALS),
      request("/repos/" + REPO + "/git/trees/main?recursive=1")
    ]);
    const doctors = JSON.parse(df.content);
    const hospitals = JSON.parse(hf.content);
    if (!Array.isArray(doctors.doctors) || !Array.isArray(hospitals.hospitals)) throw new Error("Unexpected registry format.");
    state.doctors = doctors; state.hospitals = hospitals;
    state.docSha = df.sha; state.hosSha = hf.sha;
    state.paths = (tree.tree || []).filter(x =>
      x.type === "blob" && (x.path.endsWith(".html")) &&
      !x.path.startsWith("admin/") &&
      (x.path === "index.html" || x.path.endsWith("/index.html") || !x.path.includes("/"))
    ).map(x => x.path).sort((a,b) => a.localeCompare(b));
    updateCounts();
    renderDoctors(); renderHospitals(); renderPages();
    if (tree.truncated) notice("The GitHub file tree is truncated; some pages may not appear.", true);
  }
  function listButton(title, subtitle, index, selected, action) {
    const button = document.createElement("button");
    button.type = "button"; button.className = "list-item" + (index === selected ? " active" : "");
    const strong = document.createElement("strong"); strong.textContent = title;
    const span = document.createElement("span"); span.textContent = subtitle;
    button.append(strong, span);
    button.addEventListener("click", () => action(index));
    return button;
  }
  function formData(form, keys) {
    const result = {};
    for (const key of keys) result[key] = String(form.elements.namedItem(key)?.value || "").trim();
    return result;
  }
  function fillForm(form, data, keys) {
    for (const key of keys) form.elements.namedItem(key).value = data?.[key] || "";
  }
  const doctorKeys = ["name", "city", "specialty", "hospital", "degree", "hospitalpro", "slashcure"];
  const hospitalKeys = ["name", "city", "category", "description", "url", "local", "directory"];
  function dirty(form, keys, initial) {
    return !form.hidden && JSON.stringify(formData(form, keys)) !== initial;
  }
  function confirmLeave(form, keys, initial) {
    return !dirty(form, keys, initial) || window.confirm("Discard unsaved edits?");
  }
  function renderDoctors() {
    const q = el("doctor-search").value.trim().toLowerCase();
    const all = state.doctors?.doctors || [];
    const matches = all.map((item, index) => ({item,index})).filter(x =>
      [x.item.name, x.item.city, x.item.specialty, x.item.hospital].join(" ").toLowerCase().includes(q));
    const list = el("doctor-list"); list.replaceChildren();
    for (const x of matches) list.appendChild(listButton(x.item.name, x.item.city + " · " + x.item.specialty, x.index, state.doctorIndex, selectDoctor));
    el("doctor-summary").textContent = matches.length + " of " + all.length + " listings";
  }
  function selectDoctor(index) {
    const form = el("doctor-form");
    if (!confirmLeave(form, doctorKeys, state.doctorInitial)) return;
    state.doctorIndex = index;
    const entry = index === -1 ? Object.fromEntries(doctorKeys.map(k => [k, ""])) : state.doctors.doctors[index];
    el("doctor-form-title").textContent = index === -1 ? "New doctor listing" : "Edit " + entry.name;
    fillForm(form, entry, doctorKeys);
    form.hidden = false; el("doctor-empty").hidden = true;
    state.doctorInitial = JSON.stringify(formData(form, doctorKeys));
    renderDoctors();
  }
  async function saveDoctor(evt) {
    evt.preventDefault();
    const form = el("doctor-form");
    const values = formData(form, doctorKeys);
    if (!values.name || !values.city || !values.specialty) return notice("Name, city and specialty are required.", true);
    try {
      values.slashcure = safeUrl(values.slashcure, false);
      values.hospitalpro = safeUrl(values.hospitalpro, true);
    } catch (e) { return notice(errorText(e), true); }
    if (state.doctorIndex === -1) {
      const existing = state.doctors.doctors.some(x => x.name.toLowerCase() === values.name.toLowerCase() && x.city.toLowerCase() === values.city.toLowerCase());
      if (existing) return notice("A listing with the same name and city already exists. Edit it instead.", true);
    }
    if (!window.confirm("Publish this doctor listing to GitHub? The directory rebuild may take a few minutes.")) return;
    const button = form.querySelector("[type=submit]");
    await withBusy(button, async () => {
      const copy = structuredClone(state.doctors);
      if (state.doctorIndex === -1) copy.doctors.push(values);
      else copy.doctors[state.doctorIndex] = values;
      copy.lastReviewed = todayPakistan();
      const saved = await publish(DOCTORS, JSON.stringify(copy,null,2) + "\n", state.docSha, "Admin: " + (state.doctorIndex === -1 ? "Add " : "Update ") + values.name + " in doctor directory");
      state.doctors = copy;
      state.docSha = saved.content.sha;
      const newIndex = state.doctorIndex === -1 ? copy.doctors.length - 1 : state.doctorIndex;
      state.doctorIndex = null;
      state.doctorInitial = "";
      form.hidden = true; el("doctor-empty").hidden = false;
      renderDoctors(); updateCounts();
      notice("Doctor listing published. GitHub Actions will rebuild Find Doctors. Review city and standalone pages separately.");
      el("doctor-summary").scrollIntoView({block:"nearest"});
      void newIndex;
    });
  }
  function renderHospitals() {
    const q = el("hospital-search").value.trim().toLowerCase();
    const all = state.hospitals?.hospitals || [];
    const matches = all.map((item,index) => ({item,index})).filter(x =>
      [x.item.name,x.item.city,x.item.category].join(" ").toLowerCase().includes(q));
    const list = el("hospital-list"); list.replaceChildren();
    for (const x of matches) list.appendChild(listButton(x.item.name, x.item.city + " · " + x.item.category, x.index, state.hospitalIndex, selectHospital));
    el("hospital-summary").textContent = matches.length + " of " + all.length + " listings";
  }
  function selectHospital(index) {
    const form = el("hospital-form");
    if (!confirmLeave(form, hospitalKeys, state.hospitalInitial)) return;
    state.hospitalIndex = index;
    const entry = index === -1 ? Object.fromEntries(hospitalKeys.map(k=>[k, ""])) : state.hospitals.hospitals[index];
    el("hospital-form-title").textContent = index === -1 ? "New hospital listing" : "Edit " + entry.name;
    fillForm(form,entry,hospitalKeys);
    if (index === -1) form.elements.namedItem("directory").value = "/doctors-in-sukkur/";
    form.hidden = false; el("hospital-empty").hidden = true;
    state.hospitalInitial = JSON.stringify(formData(form,hospitalKeys));
    renderHospitals();
  }
  async function saveHospital(evt) {
    evt.preventDefault();
    const form = el("hospital-form"), values = formData(form,hospitalKeys);
    if (!values.name || !values.city || !values.description || !values.category) return notice("Please fill in all required fields.", true);
    try {
      values.url = safeUrl(values.url,true);
      values.local = safeUrl(values.local,true);
      values.directory = safeUrl(values.directory,true);
      if (!values.directory.startsWith("/")) throw new Error("The city directory should be a local path starting with /.");
      if (!values.url) throw new Error("A Slashcure or official listing URL is required.");
    } catch (e) { return notice(errorText(e),true); }
    if (!window.confirm("Publish hospital information to GitHub?")) return;
    await withBusy(form.querySelector("[type=submit]"), async () => {
      const copy = structuredClone(state.hospitals);
      if (state.hospitalIndex === -1) copy.hospitals.push(values);
      else copy.hospitals[state.hospitalIndex] = values;
      copy.reviewed = todayPakistan();
      const saved = await publish(HOSPITALS, JSON.stringify(copy,null,2) + "\n", state.hosSha, "Admin: " + (state.hospitalIndex === -1 ? "Add " : "Update ") + values.name + " hospital directory");
      state.hospitals=copy; state.hosSha=saved.content.sha; state.hospitalIndex=null;
      state.hospitalInitial=""; form.hidden=true; el("hospital-empty").hidden=false;
      renderHospitals(); updateCounts();
      notice("Hospital listing published. GitHub will regenerate the main hospital directory.");
    });
  }
  function renderPages() {
    const q = el("page-search").value.trim().toLowerCase();
    const items = state.paths.filter(p => p.toLowerCase().includes(q));
    const list=el("page-list"); list.replaceChildren();
    items.forEach(path=>{
      const btn = listButton(path === "index.html" ? "Homepage" : path.replace(/\/index\.html$/,"/").replace(/\.html$/,""),path, path, state.pagePath, selectPage);
      list.appendChild(btn);
    });
    el("page-summary").textContent = items.length + " HTML pages";
  }
  function decodeEntities(value) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = value || "";
    return textarea.value;
  }
  function readMeta(parsed,key) {
    const tags = parsed.querySelectorAll("meta");
    for(const tag of tags) if(tag.getAttribute("name") === key || tag.getAttribute("property") === key) return tag.getAttribute("content") || "";
    return "";
  }
  function readSeo() {
    const parsed = new DOMParser().parseFromString(state.pageHtml, "text/html");
    el("seo-title").value = parsed.title || "";
    el("seo-desc").value = readMeta(parsed,"description");
    const h1 = parsed.querySelector("h1");
    el("seo-h1").value = h1 ? h1.textContent.trim().replace(/\s+/g," ") : "";
    const match=state.pageHtml.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
    const isNested = !!match && /<\s*[a-z][^>]*>/i.test(match[1]);
    el("h1-help").textContent = isNested ? "This H1 has styled HTML inside it. Its text is shown for reference, but can only be changed in the Advanced HTML editor." : "Only simple, unformatted H1 headings can be edited here.";
    el("seo-h1").readOnly = isNested || !match;
  }
  async function selectPage(path) {
    if (state.pagePath && !el("html-panel").hidden && el("page-code").value !== state.pageHtml && !window.confirm("Discard unsaved HTML changes?")) return;
    try {
      el("page-form-title").textContent = "Loading " + path + "…";
      const data = await githubFile(path);
      state.pagePath = path; state.pageSha = data.sha; state.pageHtml = data.content;
      el("page-path").textContent = path;
      el("page-form-title").textContent = path === "index.html" ? "Homepage" : path.replace(/\/index\.html$/,"/");
      el("page-code").value = data.content;
      el("page-controls").hidden=false; el("page-empty").hidden=true; el("preview-box").hidden=true;
      showPageTab("seo"); readSeo(); renderPages();
    } catch(e) { notice(errorText(e),true); el("page-form-title").textContent="Could not load page"; }
  }
  function showPageTab(tab) {
    const seo=tab==="seo"; el("seo-panel").hidden=!seo; el("html-panel").hidden=seo;
    el("tab-seo").classList.toggle("selected",seo); el("tab-html").classList.toggle("selected",!seo);
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function updateMeta(html, key, value) {
    let found=false;
    const result=html.replace(/<meta\b[^>]*>/gi, tag => {
      const attr=tag.match(/\b(?:name|property)\s*=\s*(["'])(.*?)\1/i);
      if (!attr || attr[2].toLowerCase()!==key.toLowerCase()) return tag;
      found=true;
      if (/\bcontent\s*=\s*(["'])[\s\S]*?\1/i.test(tag))
        return tag.replace(/\bcontent\s*=\s*(["'])[\s\S]*?\1/i,'content="'+escapeHtml(value)+'"');
      return tag.replace(/\/?>$/,' content="'+escapeHtml(value)+'">');
    });
    if(found) return result;
    if(key==="description") return result.replace(/<\/head>/i,'<meta name="description" content="'+escapeHtml(value)+'"></head>');
    return result;
  }
  async function publishSeo() {
    if (!state.pagePath) return;
    let html=state.pageHtml;
    const title=el("seo-title").value.trim(), desc=el("seo-desc").value.trim(), h1=el("seo-h1").value.trim();
    if (!title || !desc) return notice("A page title and description are required.", true);
    const oldH1=html.match(/(<h1\b[^>]*>)([\s\S]*?)(<\/h1>)/i);
    const oldTitle=html.match(/<title\b[^>]*>[\s\S]*?<\/title>/i);
    if (!oldTitle) return notice("This HTML page has no title element. Use Advanced HTML.",true);
    html=html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i,'<title>'+escapeHtml(title)+'</title>');
    html=updateMeta(html,"description",desc);
    html=updateMeta(html,"og:title",title);
    html=updateMeta(html,"twitter:title",title);
    html=updateMeta(html,"og:description",desc);
    html=updateMeta(html,"twitter:description",desc);
    if(oldH1 && !el("seo-h1").readOnly && decodeEntities(oldH1[2]).trim()!==h1)
      html=html.replace(oldH1[0],oldH1[1]+escapeHtml(h1)+oldH1[3]);
    if(html===state.pageHtml) return notice("No changes to publish.");
    if(!window.confirm("Publish these SEO changes to "+state.pagePath+"?")) return;
    await withBusy(el("save-seo"),async()=>{
      const saved=await publish(state.pagePath,html,state.pageSha,"Admin: Update SEO for "+state.pagePath);
      state.pageSha=saved.content.sha; state.pageHtml=html;
      el("page-code").value=html; readSeo();
      notice("SEO changes published to GitHub. Check the live page after deployment.");
    });
  }
  function validHtml(html) {
    return /<html\b/i.test(html) && /<head\b/i.test(html) && /<\/html>/i.test(html) && /<body\b/i.test(html);
  }
  async function publishHtml() {
    const html=el("page-code").value;
    if(!validHtml(html)) return notice("The HTML document appears incomplete. Publish cancelled.",true);
    if(html===state.pageHtml) return notice("No changes to publish.");
    if(!window.confirm("Publish the entire updated HTML page? Incorrect HTML can break the live page.")) return;
    await withBusy(el("save-html"),async()=>{
      const saved=await publish(state.pagePath,html,state.pageSha,"Admin: Update HTML for "+state.pagePath);
      state.pageSha=saved.content.sha;state.pageHtml=html; readSeo();
      notice("HTML page published to GitHub. Verify the layout on the live site.");
    });
  }
  function previewHtml() {
    const html=el("page-code").value;
    if(!validHtml(html)) return notice("Preview requires an HTML document.",true);
    el("preview-box").hidden=false;
    el("html-preview").srcdoc=html;
    el("preview-box").scrollIntoView({block:"start",behavior:"smooth"});
  }
  function encodeImage(bytes) {
    let binary="";
    const a=new Uint8Array(bytes);
    for(let i=0;i<a.length;i+=8192) binary+=String.fromCharCode.apply(null,a.subarray(i,i+8192));
    return btoa(binary);
  }
  async function uploadImage(evt) {
    evt.preventDefault();
    const file=el("image-file").files[0];
    if(!file) return notice("Select a file first.",true);
    const extByType={"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/gif":"gif"};
    if(!extByType[file.type]) return notice("Only JPG, PNG, WebP and GIF images are supported.",true);
    if(file.size>MAX_IMAGE) return notice("Maximum size is 1.5 MB. Compress the image before uploading.",true);
    let name=(el("image-name").value.trim()||file.name).toLowerCase()
      .replace(/\s+/g,"-").replace(/[^a-z0-9._-]/g,"").replace(/^\.+/,"");
    if(!name) name="hospitalpro-image."+extByType[file.type];
    const extension=name.split(".").pop();
    if(extension!==extByType[file.type] && !(file.type==="image/jpeg"&&extension==="jpeg")) return notice("The file extension must match the image type.",true);
    const path="assets/uploads/"+name;
    if(!window.confirm("Upload this publicly accessible image to "+path+"?")) return;
    await withBusy(el("upload-form").querySelector("button"), async()=>{
      const content=encodeImage(await file.arrayBuffer());
      const result=await request("/repos/"+REPO+"/contents/"+path,"PUT",{
        message:"Admin: Upload "+name,branch:"main",content
      });
      const publicUrl="https://hospitalpro.online/"+path;
      const link=document.createElement("a");
      link.href=publicUrl;link.target="_blank";link.rel="noopener noreferrer";link.textContent=publicUrl;
      el("upload-result").replaceChildren(document.createTextNode("Image published: "),link);
      el("image-file").value="";el("image-name").value="";
      notice("Image uploaded. Use this URL in your website pages.");
      void result;
    });
  }
  function lock() {
    if(!window.confirm("Lock the dashboard? Unsaved edits will be lost.")) return;
    state.credential="";
    state.account="";state.doctors=null;state.hospitals=null;state.docSha="";state.hosSha="";
    state.paths=[];state.pageHtml="";state.pageSha="";state.pagePath="";
    el("studio").hidden=true;el("login-screen").hidden=false;el("token").value="";
    el("login-error").textContent="";el("account-name").textContent="";
    el("doctor-form").hidden=true;el("hospital-form").hidden=true;
    el("page-code").value="";el("html-preview").removeAttribute("srcdoc");
    el("doctor-list").replaceChildren();el("hospital-list").replaceChildren();el("page-list").replaceChildren();
    notice("Dashboard locked. Your GitHub token was cleared from memory.");
  }
  el("login-form").addEventListener("submit",connect);
  el("lock").addEventListener("click",lock);
  el("menu-toggle").addEventListener("click",()=>document.querySelector(".sidebar").classList.toggle("open"));
  document.querySelectorAll("[data-view]").forEach(button => button.addEventListener("click",()=>showView(button.dataset.view)));
  document.querySelectorAll("[data-go]").forEach(button => button.addEventListener("click",()=>showView(button.dataset.go)));
  el("doctor-search").addEventListener("input",renderDoctors);
  el("hospital-search").addEventListener("input",renderHospitals);
  el("page-search").addEventListener("input",renderPages);
  el("new-doctor").addEventListener("click",()=>selectDoctor(-1));
  el("new-hospital").addEventListener("click",()=>selectHospital(-1));
  el("doctor-form").addEventListener("submit",saveDoctor);
  el("hospital-form").addEventListener("submit",saveHospital);
  el("cancel-doctor").addEventListener("click",()=>{
    if(!confirmLeave(el("doctor-form"),doctorKeys,state.doctorInitial)) return;
    state.doctorIndex=null;el("doctor-form").hidden=true;el("doctor-empty").hidden=false;renderDoctors();
  });
  el("cancel-hospital").addEventListener("click",()=>{
    if(!confirmLeave(el("hospital-form"),hospitalKeys,state.hospitalInitial)) return;
    state.hospitalIndex=null;el("hospital-form").hidden=true;el("hospital-empty").hidden=false;renderHospitals();
  });
  el("tab-seo").addEventListener("click",()=>showPageTab("seo"));
  el("tab-html").addEventListener("click",()=>showPageTab("html"));
  el("save-seo").addEventListener("click",publishSeo);
  el("save-html").addEventListener("click",publishHtml);
  el("preview-html").addEventListener("click",previewHtml);
  el("upload-form").addEventListener("submit",uploadImage);
})();
