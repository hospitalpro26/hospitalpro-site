/* HospitalPro static publish audit. Run: node scripts/audit-site.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const site='https://hospitalpro.online';
const errors=[],warnings=[];
const sitemap=read('sitemap.xml');
const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
if(new Set(urls).size!==urls.length)errors.push('Duplicate sitemap URLs');
const routeToFile=(u)=>{let p=new URL(u,site).pathname;return p.endsWith('/')?p.slice(1)+'index.html':p.slice(1);};
const sources=new Set();
for(const url of urls){
 if(!url.startsWith(site+'/')){errors.push('Non-HospitalPro sitemap URL: '+url);continue;}
 const f=routeToFile(url);
 if(!fs.existsSync(path.join(root,f))){errors.push('Missing sitemap target '+f);continue;}
 sources.add(f);
 const html=read(f);
 if(!html.includes('<title>'))errors.push('Missing title: '+f);
 if(!/<meta\s+name=["']description["']/i.test(html))warnings.push('No meta description: '+f);
 if(!/rel=["']canonical["']/i.test(html))warnings.push('No canonical: '+f);
 if(!html.includes('site-enhancements.js'))warnings.push('Shared navigation not loaded: '+f);
 if(/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html))errors.push('Noindex page in sitemap: '+f);
 for(const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g)){
  try{JSON.parse(m[1])}catch(e){errors.push('Invalid JSON-LD in '+f+': '+e.message)}
 }
 for(const m of html.matchAll(/(?:href|src)=["'](\/[^"'#?]+)(?:[?#][^"']*)?["']/g)){
  const target=m[1];
  if(target.startsWith('//'))continue;
  let local=routeToFile(target);
  if(!fs.existsSync(path.join(root,local)))warnings.push(f+' references missing local path '+target);
 }
}
for(const file of ['assets/doctors-registry.json','assets/hospitals-registry.json']){
 if(!fs.existsSync(path.join(root,file)))errors.push('Missing registry '+file);
 else try{const d=JSON.parse(read(file));if(!(d.doctors||d.hospitals)?.length)errors.push('Empty registry '+file)}catch(e){errors.push('Invalid registry '+file)}
}
const doctors=JSON.parse(read('assets/doctors-registry.json')).doctors;
const unique=new Set();
for(const d of doctors){
 const key=d.city+'|'+d.name;
 if(unique.has(key))errors.push('Duplicate doctor: '+key);
 unique.add(key);
 if(d.hospitalpro && !fs.existsSync(path.join(root,routeToFile(d.hospitalpro))))warnings.push('Doctor local profile missing: '+key);
 if(!d.slashcure?.startsWith('https://slashcure.com/'))errors.push('Untrusted Slashcure URL: '+key);
}
console.log('HospitalPro audit — '+urls.length+' sitemap URLs, '+doctors.length+' doctor entries');
for(const w of [...new Set(warnings)])console.warn('WARN: '+w);
for(const e of errors)console.error('ERROR: '+e);
if(errors.length)process.exit(1);
console.log('PASS: required pages, JSON-LD and registry data are structurally valid.');
