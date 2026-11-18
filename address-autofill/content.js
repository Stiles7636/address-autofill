
(()=>{if(window.__aafFill)return;
const P='address-ui-widgets-';
const R={country:[['countryCode-dropdown-nativeId','countryCode'],/country/i,'country'],
 fullName:[['enterAddressFullName'],/full.?name|recipient/i,'name'],
 phone:[['enterAddressPhoneNumber'],/phone|tel|mobile/i,'tel'],
 zip:[['enterAddressPostalCode'],/zip|postal|postcode|pincode/i,'postal-code'],
 line1:[['enterAddressLine1'],/line.?1|address1|street/i,'address-line1'],
 line2:[['enterAddressLine2'],/line.?2|address2|apt|suite/i,'address-line2'],
 city:[['enterAddressCity'],/city|town|locality/i,'address-level2'],
 state:[['enterAddressStateOrRegion-dropdown-nativeId','enterAddressStateOrRegion'],/state|province|region|prefecture/i,'address-level1'],
 district:[['enterAddressDistrictOrCounty'],/district|county|neighbo/i,'address-level3']};
const fields=()=>[...document.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=submit]):not([type=button]),select,textarea')];
function find(k){const[ids,re,ac]=R[k];for(const id of ids){const e=document.getElementById(P+id)||document.querySelector(`[name="${P+id}"]`);if(e)return e;}
 const a=fields();return a.find(e=>(e.autocomplete||'').toLowerCase()===ac)||a.find(e=>re.test(e.name)||re.test(e.id));}
const proto=e=>e instanceof HTMLSelectElement?HTMLSelectElement.prototype:e instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;
function setVal(e,v){Object.getOwnPropertyDescriptor(proto(e),'value').set.call(e,v);
 for(const t of['input','change'])e.dispatchEvent(new Event(t,{bubbles:true}));e.dispatchEvent(new Event('blur',{bubbles:true}));}
function opt(e,v){const l=String(v).toLowerCase().trim(),o=[...e.options].filter(x=>x.value);
 return o.find(x=>x.value.toLowerCase()===l||x.text.trim().toLowerCase()===l)||o.find(x=>x.text.toLowerCase().startsWith(l))||o.find(x=>x.text.toLowerCase().includes(l)||l.includes(x.text.trim().toLowerCase()));}
function apply(k,v){const e=find(k);if(!e||!v)return null;
 if(e.tagName==='SELECT'){const o=opt(e,v);if(!o)return false;if(e.value!==o.value){setVal(e,o.value);if(k==='country'){const b=document.getElementById(P+'countryCode');b?.dispatchEvent(new Event('change',{bubbles:true}));}}return true;}
 if(e.value!==v)setVal(e,v);return e.value===v;}
const KEYS=['fullName','phone','zip','line1','line2','city','state','district'];
function pass(d){const r={};for(const k of KEYS)r[k]=apply(k,d[k]);return r;}
const SP={'ø':'o','Ø':'O','ß':'ss','ł':'l','Ł':'L','đ':'d','Đ':'D','æ':'ae','Æ':'AE','ı':'i','ð':'d','þ':'th','œ':'oe','İ':'I'};
const __aafAscii=t=>String(t||'').replace(/[øØßłŁđĐæÆıðþœİ]/g,m=>SP[m]).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^\x20-\x7E]/g,'');
window.__aafFill=d=>new Promise(res=>{d={...d};for(const k of KEYS)d[k]=__aafAscii(d[k]);
 /*__phoneFix*/{const pe=find('phone');if(pe&&d.phone){const cc=document.querySelector('select[name*="phoneCountry" i],select[id*="phoneCountry" i],select[name*="callingCode" i]');
  const dial=(d.dial||'');if(cc||pe.maxLength>0&&pe.maxLength<d.phone.length){d.phone=d.phone.replace(/^\+/, '');if(dial&&d.phone.startsWith(dial))d.phone=d.phone.slice(dial.length).trim();}}}
 apply('country',d.code);
 let r=pass(d),done=false;
 const finish=()=>{if(done)return;done=true;ob.disconnect();clearTimeout(t1);
  const ok=KEYS.filter(k=>r[k]===true),miss=KEYS.filter(k=>r[k]===false);
  chrome.storage.local.remove('pending');res({n:ok.length,miss});};
 // Re-apply instantly whenever the page re-renders the form (country/zip change)
 let q=0;const ob=new MutationObserver(()=>{if(q)return;q=requestAnimationFrame(()=>{q=0;r=pass(d);});});
 ob.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['value','class','style']});
 const t1=setTimeout(finish,2500);
 const chk=setInterval(()=>{r=pass(d);if(KEYS.every(k=>r[k]!==false)&&KEYS.some(k=>r[k])){setTimeout(()=>{r=pass(d);finish();},400);clearInterval(chk);} if(done)clearInterval(chk);},150);
});
// Resume automatically if the page reloaded after a country change
chrome.storage.local.get('pending',({pending:p})=>{if(!p||Date.now()-p.ts>30000)return;
 let n=0;const iv=setInterval(()=>{if(find('fullName')||++n>40){clearInterval(iv);if(find('fullName'))window.__aafFill(p);}},100);});
})();
