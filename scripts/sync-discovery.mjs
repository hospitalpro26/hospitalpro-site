/* Generate discovery pages from curated registries. Node 22+. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const save=(p,s)=>{const file=path.join(root,p);if(fs.readFileSync(file,'utf8')!==s){fs.writeFileSync(file,s);console.log('Updated '+p)}};
const replaceBetween=(html,start,end,body)=>{
 const a=html.indexOf(start),b=html.indexOf(end,a+start.length);
 if(a<0||b<0)throw new Error('Expected directory markers missing: '+start);
 return html.slice(0,a+start.length)+body+html.slice(b);
};
const jsonld=(html,edit)=>{
 return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/,(_,raw)=>{
  const data=JSON.parse(raw);edit(data);return '<script type="application/ld+json">'+JSON.stringify(data).replace(/</g,'\\u003c')+'</script>';
 });
};
const docs=JSON.parse(read('assets/doctors-registry.json')).doctors;
const hospitals=JSON.parse(read('assets/hospitals-registry.json')).hospitals;
const doctorCard=d=>'<article class="hp-page-card hp-doctor-card" data-city="'+esc(d.city)+'" data-specialty="'+esc(d.specialty)+'" data-text="'+esc([d.name,d.city,d.specialty,d.hospital,d.degree].join(' ').toLowerCase())+'"><small>'+esc(d.city)+' · '+esc(d.specialty)+'</small><h2>'+esc(d.name)+'</h2>'+(d.degree?'<p class="hp-page-meta">'+esc(d.degree)+'</p>':'')+(d.hospital?'<p>'+esc(d.hospital)+'</p>':'')+'<div class="hp-page-actions">'+(d.hospitalpro?'<a class="primary" href="'+esc(d.hospitalpro)+'">HospitalPro profile</a>':'')+'<a class="'+(d.hospitalpro?'':'primary')+'" href="'+esc(d.slashcure)+'" target="_blank" rel="noopener noreferrer">'+(d.slashcure.includes('/doctors?')?'Search on Slashcure':'Slashcure profile')+'</a></div></article>';
let doctorHtml=read('find-doctors/index.html');
doctorHtml=replaceBetween(doctorHtml,'<div class="hp-page-grid">','</div><div class="hp-page-empty"',docs.map(doctorCard).join(''));
const options=(items)=>[...new Set(items)].sort((a,b)=>a.localeCompare(b)).map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join('');
doctorHtml=doctorHtml.replace(/(<select id="hp-city"><option value="">All cities<\/option>)[\s\S]*?(<\/select>)/,'$1'+options(docs.map(x=>x.city))+'$2');
doctorHtml=doctorHtml.replace(/(<select id="hp-specialty"><option value="">All specialties<\/option>)[\s\S]*?(<\/select>)/,'$1'+options(docs.map(x=>x.specialty))+'$2');
doctorHtml=doctorHtml.replace(/\d+ doctor listings/,docs.length+' doctor listings');
doctorHtml=jsonld(doctorHtml,j=>{j.mainEntity.numberOfItems=docs.length;j.mainEntity.itemListElement=docs.map((x,i)=>({'@type':'ListItem',position:i+1,name:x.name,url:x.hospitalpro?'https://hospitalpro.online'+x.hospitalpro:x.slashcure}))});
save('find-doctors/index.html',doctorHtml);
const hospitalCard=h=>'<article class="hp-page-card"><small>'+esc(h.city)+' · '+esc(h.category)+'</small><h2>'+esc(h.name)+'</h2><p>'+esc(h.description)+'</p><div class="hp-page-actions"><a href="'+esc(h.directory)+'">Doctors in '+esc(h.city)+'</a><a class="primary" href="'+esc(h.url)+'"'+(h.url.startsWith('https://')?' target="_blank" rel="noopener noreferrer"':'')+'>'+(h.url.startsWith('https://')?'View on Slashcure':'Hospital profile')+'</a></div></article>';
let hospitalHtml=read('hospitals/index.html');
hospitalHtml=replaceBetween(hospitalHtml,'<div class="hp-page-grid">','</div><div class="hp-page-advice"',hospitals.map(hospitalCard).join(''));
hospitalHtml=jsonld(hospitalHtml,j=>{j.mainEntity.numberOfItems=hospitals.length;j.mainEntity.itemListElement=hospitals.map((x,i)=>({'@type':'ListItem',position:i+1,name:x.name,url:x.url.startsWith('/')?'https://hospitalpro.online'+x.url:x.url}))});
save('hospitals/index.html',hospitalHtml);
