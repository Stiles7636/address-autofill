
const __root=document.documentElement;
chrome.storage.local.get('theme',({theme})=>{const t=theme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');__root.classList.toggle('dark',t==='dark');});
const F=[['fullName','Full name',1],['phone','Phone',0],['zip','Postal code',0],['line1','Address line 1',1],['line2','Address line 2',1],['city','City',0],['state','State / Region',0],['district','District',1]];
COUNTRIES.sort((a,b)=>a.name.localeCompare(b.name));
const $=id=>document.getElementById(id),flag=c=>FLAGS[c.toUpperCase()]||'';
let custom={},rot={},rotate=true,code='CR',vi=0,act=0,view=[];
$('fields').innerHTML=F.map(([k,l,w])=>`<div class="f${w?' w':''}"><label>${l}</label><input id="f_${k}"></div>`).join('');
const norm=t=>String(t).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const arr=c=>{let x=custom[c];if(x&&!Array.isArray(x))x=custom[c]=[x];return x||[]};
const edited=c=>arr(c).some(o=>o&&Object.keys(o).length);
function score(c,q){const n=norm(c.name),k=c.code.toLowerCase();if(k===q)return 0;if(n===q)return 1;if(n.startsWith(q))return 2;
 if(n.split(/[\s\-,().&']+/).some(w=>w.startsWith(q)))return 3;if(n.includes(q))return 4;if(q.length<=2&&k.startsWith(q))return 5;return -1;}
function draw(q=''){q=norm(q.trim());
 view=!q?COUNTRIES:COUNTRIES.map(c=>[score(c,q),c]).filter(x=>x[0]>=0).sort((a,b)=>a[0]-b[0]||a[1].name.localeCompare(b[1].name)).map(x=>x[1]);act=0;
 $('list').innerHTML=view.map((c,i)=>`<li data-c="${c.code}" class="${i?'':'act'}"><img loading="lazy" src="${flag(c.code)}"><span>${c.name}</span>${edited(c.code)?'<span class="dot" title="Edited"></span>':''}<span class="c">${c.code}</span></li>`).join('');$('list').scrollTop=0;}
function drawVariants(){$('variants').innerHTML=Array.from({length:VARIANTS},(_,i)=>`<button data-i="${i}" class="${i===vi?'on':''} ${arr(code)[i]&&Object.keys(arr(code)[i]).length?'ed':''}" title="Address ${i+1}">${i+1}</button>`).join('');}
function show(){const d=getAddr(code,vi,custom);F.forEach(([k])=>$('f_'+k).value=d[k]||'');drawVariants();}
function select(c){code=c;vi=rot[c]||0;const d=COUNTRIES.find(x=>x.code===c);$('curFlag').src=flag(c);$('curName').textContent=`${d.name}  ·  ${c}`;
 show();chrome.storage.local.set({last:c});close();}
$('variants').onclick=e=>{const b=e.target.closest('button');if(!b)return;vi=+b.dataset.i;rot[code]=vi;chrome.storage.local.set({rot});show();};
function open_(){$('panel').classList.remove('hidden');$('search').value='';draw();$('search').focus();}
function close(){$('panel').classList.add('hidden');}
$('current').onclick=()=>$('panel').classList.contains('hidden')?open_():close();
$('search').oninput=e=>draw(e.target.value);
$('search').onkeydown=e=>{const li=[...$('list').children];
 if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();act=Math.max(0,Math.min(li.length-1,act+(e.key==='ArrowDown'?1:-1)));li.forEach((x,i)=>x.classList.toggle('act',i===act));li[act]?.scrollIntoView({block:'nearest'});}
 if(e.key==='Enter'&&view[act])select(view[act].code);if(e.key==='Escape')close();};
$('list').onclick=e=>{const li=e.target.closest('li');if(li)select(li.dataset.c);};
document.addEventListener('click',e=>{if(!e.target.closest('.picker'))close();});
const msg=(t,c='')=>{$('msg').textContent=t;$('msg').className='msg '+c;};
// Auto-save edits for the current country + address number
let __t;F.forEach(([k])=>$('f_'+k).addEventListener('input',()=>{
 const base=getAddr(code,vi,{}),o={};F.forEach(([kk])=>{const v=$('f_'+kk).value;if(v!==(base[kk]||''))o[kk]=v;});
 const a=arr(code);a[vi]=o;custom[code]=a;clearTimeout(__t);__t=setTimeout(()=>{chrome.storage.local.set({custom});drawVariants();msg('Saved','ok');},200);}));
$('reset').onclick=()=>{const a=arr(code);a[vi]={};custom[code]=a;chrome.storage.local.set({custom});show();msg(`Address ${vi+1} restored`);};
$('rotate').onchange=e=>{rotate=e.target.checked;chrome.storage.local.set({rotate});};
$('theme').onclick=()=>{const dk=__root.classList.toggle('dark');chrome.storage.local.set({theme:dk?'dark':'light'});};
$('fill').onclick=async()=>{
 $('fill').disabled=true;msg('Filling...');
 const vals={};F.forEach(([k])=>vals[k]=$('f_'+k).value.trim());
 const c=COUNTRIES.find(x=>x.code===code);
 const r=await chrome.runtime.sendMessage({type:'fillActive',data:{code,dial:c.dial,...vals}});
 msg(r?.text||'Address form not found on this page',r?.ok?'ok':'err');
 if(r?.ok&&rotate){vi=(vi+1)%VARIANTS;rot[code]=vi;chrome.storage.local.set({rot});show();}
 $('fill').disabled=false;};
$('scan').onclick=async()=>{const [t]=await chrome.tabs.query({active:true,currentWindow:true});
 const r=await chrome.scripting.executeScript({target:{tabId:t.id,allFrames:true},func:()=>[...document.querySelectorAll('input,select,textarea')].filter(e=>e.type!=='hidden').map(e=>`${e.tagName.toLowerCase()} #${e.id} [${e.name}]`).join('\n')});
 const out=r.map(x=>x.result).filter(Boolean).join('\n');navigator.clipboard?.writeText(out);msg(out?'Field list copied to clipboard':'No fields found',out?'ok':'err');};
chrome.commands?.getAll(cs=>{const c=cs.find(x=>x.name==='fill-last');$('kbd').textContent=(c&&c.shortcut)||'not set';});
chrome.storage.local.get(['custom','last','rot','rotate'],s=>{custom=s.custom||{};rot=s.rot||{};rotate=s.rotate!==false;$('rotate').checked=rotate;
 select(s.last&&COUNTRIES.some(c=>c.code===s.last)?s.last:'CR');});

$('setkey').onclick=e=>{e.preventDefault();chrome.tabs.create({url:'chrome://extensions/shortcuts'});};
