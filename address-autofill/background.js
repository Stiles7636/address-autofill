
importScripts('countries.js');
async function fillTab(tabId,d){
 await chrome.storage.local.set({pending:{...d,ts:Date.now()}});
 try{await chrome.scripting.executeScript({target:{tabId,allFrames:true},files:['content.js']});
  const r=await chrome.scripting.executeScript({target:{tabId,allFrames:true},func:d=>window.__aafFill?window.__aafFill(d):null,args:[d]});
  const res=r.map(x=>x.result).filter(x=>x&&x.n).sort((a,b)=>b.n-a.n)[0];
  if(!res)return {ok:false,text:'Address form not found on this page'};
  return {ok:true,text:`Filled ${res.n} fields`+(res.miss.length?` · check: ${res.miss.join(', ')}`:'')};
 }catch(e){return {ok:false,text:'Error: '+e.message};}}
chrome.runtime.onMessage.addListener((m,s,send)=>{if(m.type==='fillActive'){chrome.tabs.query({active:true,currentWindow:true}).then(([t])=>fillTab(t.id,m.data).then(send));return true;}});
chrome.commands.onCommand.addListener(async cmd=>{if(cmd!=='fill-last')return;
 const s=await chrome.storage.local.get(['custom','last','rot','rotate']);const code=s.last||'CR',rot=s.rot||{},i=rot[code]||0;
 const a=getAddr(code,i,s.custom||{});const c=COUNTRIES.find(x=>x.code===code);
 const [t]=await chrome.tabs.query({active:true,currentWindow:true});const r=await fillTab(t.id,{...a,code,dial:c.dial});
 if(r.ok&&s.rotate!==false){rot[code]=(i+1)%VARIANTS;await chrome.storage.local.set({rot});}
 chrome.action.setBadgeBackgroundColor({color:r.ok?'#137333':'#c5221f'});chrome.action.setBadgeText({text:r.ok?'OK':'!'});setTimeout(()=>chrome.action.setBadgeText({text:''}),2500);});
