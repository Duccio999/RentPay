
// SW
if('serviceWorker' in navigator){addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));}

// PWA install
let deferredPrompt; const installBtn=document.getElementById('installBtn');
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;installBtn.hidden=false;});
installBtn?.addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;installBtn.hidden=true;deferredPrompt=null;});
document.getElementById('year').textContent = new Date().getFullYear();

// Drawer
const drawer=document.getElementById('drawer');
document.getElementById('menuBtn').onclick=()=>drawer.classList.toggle('open');
drawer.addEventListener('click',e=>{const a=e.target.closest('[data-goto]'); if(a){location.hash=a.getAttribute('data-goto'); drawer.classList.remove('open');}});

const app=document.getElementById('app');
const routes={
  '#/': home,
  '#/features': features,
  '#/how': how,
  '#/insurance': insurance,
  '#/app': appShell,
};
function render(){ (routes[location.hash]||routes['#/'])().forEach(n=>app.replaceChildren(...[n])); }
addEventListener('hashchange',render);

// Helpers
function el(tag, attrs={}, ...children){const n=document.createElement(tag);Object.entries(attrs).forEach(([k,v])=>{if(k==='class')n.className=v;else if(k==='html')n.innerHTML=v;else n.setAttribute(k,v)});children.forEach(c=>n.append(c));return n;}
function btn(label,onclick,cls='btn'){const b=el('button',{class:cls},document.createTextNode(label));b.onclick=onclick;return b;}
function input(label,id,type='text',ph='',val=''){const w=el('div',{class:'list'});const l=el('label',{},document.createTextNode(label));const i=el('input',{class:'input',id,type,placeholder:ph,value:val});w.append(l,i);return{wrap:w,input:i};}
function card(title,body){return el('section',{class:'card'}, el('h2',{class:'h1'},document.createTextNode(title)), body);}

// Views ultra-minimali
function home(){
  const c = el('div',{class:'container'},
    card('Incassi affitti, in automatico.', el('p',{class:'p'}, document.createTextNode('RentPay raccoglie il canone ogni mese e lo gira al proprietario. Firma e KYC inclusi.'))),
    el('div',{class:'row',style:'padding:0 16px;'}, btn('Accedi',()=>{location.hash='#/app'},'btn full'), btn('Scopri di più',()=>{location.hash='#/features'},'btn ghost full'))
  );
  return [c];
}

function features(){
  const list=el('div',{class:'list'},
    el('div',{class:'panel'}, el('b',{},document.createTextNode('Pagamenti ricorrenti')), el('p',{class:'p'},document.createTextNode('Carta o SEPA SDD, con riconciliazione.'))),
    el('div',{class:'panel'}, el('b',{},document.createTextNode('Contratti digitali')), el('p',{class:'p'},document.createTextNode('Carica PDF o firma OTP/FEA.'))),
    el('div',{class:'panel'}, el('b',{},document.createTextNode('KYC & Privacy')), el('p',{class:'p'},document.createTextNode('Verifica identità e gestione GDPR.'))),
  );
  const c=el('div',{class:'container'}, card('Funzioni essenziali', list));
  return [c];
}

function how(){
  const steps=el('div',{class:'list'},
    el('div',{class:'panel'}, el('span',{class:'badge'},document.createTextNode('1')), el('b',{},document.createTextNode(' Registrazione')), el('p',{class:'p'},document.createTextNode('Proprietario o inquilino.'))),
    el('div',{class:'panel'}, el('span',{class:'badge'},document.createTextNode('2')), el('b',{},document.createTextNode(' Firma & KYC')), el('p',{class:'p'},document.createTextNode('Documento + firma digitale.'))),
    el('div',{class:'panel'}, el('span',{class:'badge'},document.createTextNode('3')), el('b',{},document.createTextNode(' Pagamento')), el('p',{class:'p'},document.createTextNode('Addebito mensile automatico.'))),
  );
  const c=el('div',{class:'container'}, card('Come funziona', steps));
  return [c];
}

function insurance(){
  const calc = (()=>{
    const canone=input('Canone mensile (EUR)','i_amount','number','800'); 
    const mesi=input('Mesi di copertura','i_months','number','6'); 
    const out=el('div',{class:'p'},document.createTextNode(''));
    const wrap=el('div',{class:'list'}, canone.wrap, mesi.wrap, out, btn('Stima premio (demo)',()=>{
      const a=parseFloat(canone.input.value||'0'); const m=parseInt(mesi.input.value||'0'); 
      const premio = Math.max(25, (a*m)*0.03); out.textContent='Stima: €'+premio.toFixed(2);
    },'btn'));
    return wrap;
  })();
  const c=el('div',{class:'container'}, card('Garanzia canone', calc));
  return [c];
}

function appShell(){
  // due pannelli minimal proprietario/inquilino
  const l_amount=input('Canone EUR','l_amount','number','850'); 
  const l_day=input('Giorno del mese','l_day','number','5');
  const l = el('div',{class:'panel'}, el('b',{},document.createTextNode('Proprietario')), l_amount.wrap, l_day.wrap, btn('Programma (demo)',()=>alert('Programmazione salvata (demo)')));
  const t_pm=input('Metodo pagamento (demo)','t_pm','text','Carta o IBAN');
  const t = el('div',{class:'panel'}, el('b',{},document.createTextNode('Inquilino')), t_pm.wrap, btn('Salva (demo)',()=>alert('Metodo salvato (demo)')));
  const c=el('div',{class:'container'}, card('Area app', el('div',{class:'list'}, l, t)));
  return [c];
}

render();
if(!location.hash) location.hash = '#/';
