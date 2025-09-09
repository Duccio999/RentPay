
// PWA
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.error));}
let deferredPrompt; const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt',(e)=>{e.preventDefault();deferredPrompt=e;installBtn.hidden=false;});
installBtn?.addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;installBtn.hidden=true;deferredPrompt=null;});
document.getElementById('year').textContent = new Date().getFullYear().toString();

// Nav
const menu = document.getElementById('navMenu');
document.getElementById('navToggle').onclick = ()=> menu.classList.toggle('open');
document.addEventListener('click',(e)=>{const a=e.target.closest('[data-goto]'); if(a){e.preventDefault(); location.hash=a.getAttribute('data-goto'); menu.classList.remove('open');}});

const app = document.getElementById('app');
const state = JSON.parse(localStorage.getItem('rentpay_state')||'{}');
function save(){localStorage.setItem('rentpay_state', JSON.stringify(state));}

function el(tag,attrs={},...kids){const n=document.createElement(tag);Object.entries(attrs).forEach(([k,v])=>k==='class'?n.className=v:k==='html'?n.innerHTML=v:n.setAttribute(k,v));kids.forEach(k=>n.append(k));return n;}
function btn(label,go,cls='btn'){const b=el('button',{class:cls},document.createTextNode(label)); b.onclick=go; return b;}
function section(title, body){return el('div',{class:'section'}, el('div',{class:'title'},document.createTextNode(title)), body);}
function input(label,id,ph='',val=''){return {wrap:el('div',{}, el('div',{class:'small'},document.createTextNode(label)), el('input',{class:'input',id,placeholder:ph,value:val})), input:null};}

const routes={
  '#/': homeView,
  '#/features': featuresView,
  '#/how': howView,
  '#/insurance': insuranceView,
  '#/faq': faqView,
  '#/app': appView,
  '#/landlord': landlordView,
  '#/tenant': tenantView,
};
function render(){app.innerHTML=''; const r=routes[location.hash||"#/"]; r().forEach(n=>app.append(n));}
window.addEventListener('hashchange', render);

function homeView(){
  const hero = el('div',{class:'hero'},
    el('h1',{},document.createTextNode('Affitti automatici, zero pensieri.')),
    el('p',{},document.createTextNode('RentPay incassa il canone in automatico ogni mese, con contratto digitale, verifica identità e garanzia assicurativa opzionale.')),
    el('div',{class:'row'},
      btn('Prova la Demo',()=>location.hash='#/app'),
      btn('Scopri come funziona',()=>location.hash='#/how','btn ghost')
    )
  );
  const cards = el('div',{class:'grid two'},
    el('div',{class:'card'}, el('div',{class:'badge'},document.createTextNode('Pagamenti')), el('p',{},document.createTextNode('Addebito su carta o SEPA SDD, accredito al proprietario.'))),
    el('div',{class:'card'}, el('div',{class:'badge'},document.createTextNode('Contratti & KYC')), el('p',{},document.createTextNode('Firma digitale e verifica documento integrata (demo).')))
  );
  return [hero, cards];
}

function featuresView(){
  const list = el('div',{class:'grid'},
    el('div',{class:'card'}, el('b',{},document.createTextNode('Pagamenti Ricorrenti')), el('p',{class:'small'},document.createTextNode('Programmazione automatica del canone con ricevute.'))),
    el('div',{class:'card'}, el('b',{},document.createTextNode('Dashboard Proprietario')), el('p',{class:'small'},document.createTextNode('IBAN, immobili, incassi e report.'))),
    el('div',{class:'card'}, el('b',{},document.createTextNode('Area Inquilino')), el('p',{class:'small'},document.createTextNode('Metodo di pagamento e storico pagamenti.'))),
    el('div',{class:'card'}, el('b',{},document.createTextNode('Garanzia Canone')), el('p',{class:'small'},document.createTextNode('Assicurazione terza per canoni non pagati (demo).'))),
  );
  return [section('Funzioni', list)];
}

function howView(){
  const steps = el('div',{class:'grid two'},
    el('div',{class:'card'}, el('b',{},document.createTextNode('1. Registrazione')), el('p',{class:'small'},document.createTextNode('Proprietario e inquilino creano l’account.'))),
    el('div',{class:'card'}, el('b',{},document.createTextNode('2. Contratto & KYC')), el('p',{class:'small'},document.createTextNode('Firma digitale del contratto e verifica identità.'))),
    el('div',{class:'card'}, el('b',{},document.createTextNode('3. Pagamento')), el('p',{class:'small'},document.createTextNode('Si imposta il giorno del mese e l’importo.'))),
    el('div',{class:'card'}, el('b',{},document.createTextNode('4. Accredito')), el('p',{class:'small'},document.createTextNode('Il canone arriva sul conto del proprietario.'))),
  );
  return [section('Come funziona', steps)];
}

function insuranceView(){
  function calc(){
    const canone = parseFloat(document.getElementById('prem_canone').value||'0');
    const mesi = parseInt(document.getElementById('prem_mesi').value||'0',10);
    const premio = Math.max(2, (canone*mesi*0.02)).toFixed(2);
    document.getElementById('premio').textContent = 'Stima premio: € ' + premio + ' (demo)';
  }
  const ui = el('div',{class:'grid two'},
    el('div',{class:'card'}, el('b',{},document.createTextNode('Garanzia Canone')), el('p',{class:'small'},document.createTextNode('Copertura dedicata con partner assicurativi per mancato pagamento.'))),
    el('div',{class:'card'},
      el('div',{class:'small'},document.createTextNode('Calcola stima (demo)')),
      el('input',{id:'prem_canone',class:'input',type:'number',placeholder:'Canone mensile (€)',value:'800',oninput:'calc()'}),
      el('input',{id:'prem_mesi',class:'input',type:'number',placeholder:'Mesi coperti',value:'6',oninput:'calc()'}),
      el('p',{id:'premio',class:'small'},document.createTextNode('Stima premio: € 96.00 (demo)'))
    ),
  );
  setTimeout(calc,0);
  return [section('Garanzia', ui)];
}

function faqView(){
  const faq = el('div',{class:'grid'},
    el('div',{class:'card'}, el('b',{},document.createTextNode('È una banca?')), el('p',{class:'small'},document.createTextNode('No, ci appoggiamo a PSP/assicurazioni terze.'))),
    el('div',{class:'card'}, el('b',{},document.createTextNode('Serve un conto?')), el('p',{class:'small'},document.createTextNode('Il proprietario inserisce IBAN per l’accredito.'))),
    el('div',{class:'card'}, el('b',{},document.createTextNode('Posso installarla?')), el('p',{class:'small'},document.createTextNode('Sì, tocca “Installa app”.'))),
  );
  return [section('FAQ', faq)];
}

function appView(){
  const box = el('div',{class:'grid two'},
    el('div',{class:'card'}, el('b',{},document.createTextNode('Proprietario')), el('p',{class:'small'},document.createTextNode('Configura immobile e accredito.')), btn('Entra',()=>location.hash='#/landlord','btn')),
    el('div',{class:'card'}, el('b',{},document.createTextNode('Inquilino')), el('p',{class:'small'},document.createTextNode('Imposta il metodo di pagamento.')), btn('Entra',()=>location.hash='#/tenant','btn ghost')),
  );
  return [section('Seleziona ruolo', box)];
}

function landlordView(){
  const prop = el('input',{class:'input',id:'l_prop',placeholder:'Immobile (es. Via Roma 10)'});
  const iban = el('input',{class:'input',id:'l_iban',placeholder:'IBAN proprietario'});
  const amount = el('input',{class:'input',id:'l_amount',type:'number',placeholder:'Canone €',value:'800'});
  const day = el('input',{class:'input',id:'l_day',type:'number',placeholder:'Giorno',value:'5'});
  const ui = el('div',{class:'grid'},
    el('div',{class:'card'}, el('b',{},document.createTextNode('Impostazioni canone')), prop, iban, amount, day, btn('Salva',()=>{state.l={prop:prop.value,iban:iban.value,amount:amount.value,day:day.value};save();alert('Salvato (demo)');}))
  );
  const table = el('div',{class:'card'}, el('b',{},document.createTextNode('Incassi (demo)')), el('p',{class:'small'},document.createTextNode('05/09 €'+(state.l?.amount||'800')+' — Programmato')));
  return [section('Dashboard Proprietario', el('div',{}, ui, table))];
}

function tenantView(){
  const name = el('input',{class:'input',id:'t_name',placeholder:'Nome e Cognome'});
  const pm = el('input',{class:'input',id:'t_pm',placeholder:'Carta/IBAN (demo)'});
  const ui = el('div',{class:'grid'},
    el('div',{class:'card'}, el('b',{},document.createTextNode('Metodo di pagamento')), name, pm, btn('Salva',()=>{state.t={name:name.value,pm:pm.value};save();alert('Salvato (demo)');}))
  );
  return [section('Area Inquilino', ui)];
}

render();
