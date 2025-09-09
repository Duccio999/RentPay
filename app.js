
// PWA SW
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));}

// Install
let deferredPrompt; const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e)=>{e.preventDefault();deferredPrompt=e;installBtn.hidden=false;});
installBtn?.addEventListener('click', async()=>{if(!deferredPrompt)return; deferredPrompt.prompt(); await deferredPrompt.userChoice; installBtn.hidden=true; deferredPrompt=null;});

// Year
document.getElementById('year').textContent = new Date().getFullYear().toString();

// Elements
const app = document.getElementById('app');
const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('menu');

// Robust mobile menu toggle
function openMenu(){ menu.classList.add('open'); menuBtn.setAttribute('aria-expanded','true'); menu.setAttribute('aria-hidden','false'); }
function closeMenu(){ menu.classList.remove('open'); menuBtn.setAttribute('aria-expanded','false'); menu.setAttribute('aria-hidden','true'); }
menuBtn.addEventListener('click',(e)=>{ e.stopPropagation(); menu.classList.contains('open') ? closeMenu() : openMenu(); });
document.addEventListener('click',(e)=>{ if(menu.classList.contains('open')){ const inside = e.target.closest('#menu,.hamburger'); if(!inside) closeMenu(); }});

// Simple hash router
const routes = {
  '#/': homeView,
  '#/access': accessView,
  '#/landlord': landlordView,
  '#/tenant': tenantView,
  '#/features': featuresView,
  '#/how': howView,
  '#/insurance': insuranceView,
  '#/faq': faqView,
};

function navigate(hash){ if(location.hash!==hash){ location.hash = hash; } else { render(); } }
window.addEventListener('hashchange', render);

// Delegate clicks
document.addEventListener('click', (e)=>{
  const a = e.target.closest('[data-goto]');
  if(a){ e.preventDefault(); navigate(a.getAttribute('data-goto')); }
});

// State (demo)
const state = JSON.parse(localStorage.getItem('rentpay_state')||'{}');
function save(){localStorage.setItem('rentpay_state', JSON.stringify(state));}

// Helpers
const el = (t,a={},...c)=>{const n=document.createElement(t); Object.entries(a).forEach(([k,v])=>{if(k==='class')n.className=v; else if(k==='html')n.innerHTML=v; else n.setAttribute(k,v)}); c.forEach(x=>n.append(x)); return n;};
const input = (label, id, type='text', ph='', val='')=>{
  const w=el('div',{});
  const l=el('div',{class:'label'}, document.createTextNode(label));
  const i=el('input',{id, class:'input', type, placeholder:ph, value:val});
  w.append(l,i); return {wrap:w, input:i};
};
const button = (txt, on, cls='btn')=>{const b=el('button',{class:cls}, document.createTextNode(txt)); b.onclick=on; return b;};

// Views
function homeView(){
  const hero = el('section',{class:'hero card'},
    el('h1',{}, document.createTextNode('Zero pensieri.')),
    el('p',{class:'lead'}, document.createTextNode('RentPay automatizza i pagamenti degli affitti: contratti digitali, KYC e addebiti ricorrenti su carta o SEPA.')),
    el('div',{class:'row'},
      button('Accedi', ()=>navigate('#/access'),'btn'),
      button('Scopri le funzioni', ()=>navigate('#/features'),'btn ghost')
    )
  );
  const highlights = el('div',{class:'highlights'},
    hl('💳','Pagamenti automatici','Programmi il giorno e incassi su IBAN.'),
    hl('📝','Contratti & Firma','Carichi il PDF e firmi in digitale (demo).'),
    hl('🛡️','Garanzia canone','Stima premio (demo) con partner assicurativi.')
  );
  return [ hero, el('section',{class:'section'}, highlights) ];
}
function hl(emoji,title,desc){
  const d = el('div',{class:'highlight'});
  d.append(el('h3',{}, document.createTextNode(`${emoji} ${title}`))), d.append(el('p',{}, document.createTextNode(desc)));
  return d;
}

function accessView(){
  const tiles = el('div',{class:'tiles'},
    el('div',{class:'tile'},
      el('h3',{}, document.createTextNode('Sono Proprietario')),
      el('p',{}, document.createTextNode('Imposta IBAN, canone e giorno. Invita l’inquilino e vedi gli incassi.')),
      button('Vai alla dashboard', ()=>navigate('#/landlord'), 'btn')
    ),
    el('div',{class:'tile'},
      el('h3',{}, document.createTextNode('Sono Inquilino')),
      el('p',{}, document.createTextNode('Carica documento (KYC), collega il contratto e imposta il metodo di pagamento.')),
      button('Entra nell’area inquilino', ()=>navigate('#/tenant'), 'btn ghost')
    )
  );
  return [ el('section',{class:'section'}, tiles) ];
}

function landlordView(){
  const name = input('Immobile','l_property','text','Via Roma 10, Firenze', state.l_property||'');
  const iban = input('IBAN Accredito','l_iban','text','IT60 X054 2811 1010 0000 0123 456', state.l_iban||'');
  const amount = input('Canone Mensile (EUR)','l_amount','number','850.00', state.l_amount||'850.00');
  const day = input('Giorno Addebito','l_day','number','5', state.l_day||'5');
  const months = input('Mesi Garanzia (assicurazione)','l_months','number','6', state.l_months||'6');

  const table = el('table',{class:'table'},
    el('thead',{}, el('tr',{}, el('th',{},document.createTextNode('Data')), el('th',{},document.createTextNode('Inquilino')), el('th',{},document.createTextNode('Importo')), el('th',{},document.createTextNode('Stato')))),
    el('tbody',{},
      el('tr',{}, el('td',{},document.createTextNode('05/09/2025')), el('td',{},document.createTextNode('Mario Rossi')), el('td',{},document.createTextNode('€'+(state.l_amount||'850,00'))), el('td',{}, el('span',{class:'badge'}, document.createTextNode('Programmato')))),
      el('tr',{}, el('td',{},document.createTextNode('05/08/2025')), el('td',{},document.createTextNode('Mario Rossi')), el('td',{},document.createTextNode('€'+(state.l_amount||'850,00'))), el('td',{}, el('span',{class:'badge'}, document.createTextNode('Pagato')))),
    )
  );

  const saveBtn = button('Salva & Programma', ()=>{
    state.l_property=name.input.value; state.l_iban=iban.input.value; state.l_amount=amount.input.value;
    state.l_day=day.input.value; state.l_months=months.input.value; save();
    alert('Programmazione aggiornata (demo)');
  }, 'btn');

  return [
    el('section',{class:'section card'},
      el('h2',{}, document.createTextNode('Dashboard Proprietario')),
      name.wrap, iban.wrap, amount.wrap, day.wrap, months.wrap,
      el('div',{class:'row'}, saveBtn)
    ),
    el('section',{class:'section card'},
      el('h3',{}, document.createTextNode('Incassi')),
      table
    )
  ];
}

function tenantView(){
  const tname = input('Nome e Cognome','t_name','text','Mario Rossi', state.t_name||'');
  const email = input('Email','t_email','email','mario@esempio.it', state.t_email||'');
  const pm = input('Metodo di Pagamento (demo)','t_pm','text','Carta **** 4242 o IBAN', state.t_pm||'');

  const saveBtn = button('Salva metodo di pagamento', ()=>{
    state.t_name=tname.input.value; state.t_email=email.input.value; state.t_pm=pm.input.value; save();
    alert('Dati salvati (demo)');
  }, 'btn');

  return [
    el('section',{class:'section card'},
      el('h2',{}, document.createTextNode('Area Inquilino')),
      tname.wrap, email.wrap, pm.wrap,
      el('div',{class:'row'}, saveBtn)
    ),
    el('section',{class:'section card'},
      el('h3',{}, document.createTextNode('Prossimo addebito')),
      el('p',{}, document.createTextNode('Ogni mese il giorno '+(state.l_day||'5')+' — €'+(state.l_amount||'850,00')+' (demo).'))
    )
  ];
}

function featuresView(){
  return [ el('section',{class:'section card'},
    el('h2',{}, document.createTextNode('Funzioni')),
    el('ul',{},
      el('li',{}, document.createTextNode('Pagamenti ricorrenti su carta/SEPA (demo).')),
      el('li',{}, document.createTextNode('Contratti digitali con firma OTP/FEA (demo).')),
      el('li',{}, document.createTextNode('KYC con provider esterni (demo).'))
    )
  ) ];
}

function howView(){
  return [ el('section',{class:'section card'},
    el('h2',{}, document.createTextNode('Come funziona')),
    el('ol',{},
      el('li',{}, document.createTextNode('Registrazione proprietario/locatario.')),
      el('li',{}, document.createTextNode('Firma del contratto e KYC.')),
      el('li',{}, document.createTextNode('Programmazione addebiti mensili.'))
    )
  ) ];
}

function insuranceView(){
  return [ el('section',{class:'section card'},
    el('h2',{}, document.createTextNode('Garanzia canone')),
    el('p',{}, document.createTextNode('Stima premio (demo) con partner assicurativi esterni.'))
  ) ];
}

function faqView(){
  return [ el('section',{class:'section card'},
    el('h2',{}, document.createTextNode('FAQ')),
    el('p',{}, document.createTextNode('Info rapide su pagamenti, KYC e garanzia (demo).'))
  ) ];
}

// Render
function render(){
  const view = routes[location.hash] || routes['#/'];
  app.innerHTML = ''; view().forEach(n=>app.append(n));
  closeMenu(); // ensure menu closes after navigation
}
if(!location.hash) location.hash = '#/';
render();
