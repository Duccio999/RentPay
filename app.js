// PWA SW
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));}

// Install prompt
let deferredPrompt; const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e)=>{e.preventDefault();deferredPrompt=e;installBtn.hidden=false;});
installBtn?.addEventListener('click', async()=>{if(!deferredPrompt)return; deferredPrompt.prompt(); await deferredPrompt.userChoice; installBtn.hidden=true; deferredPrompt=null;});

// Year
document.getElementById('year').textContent = new Date().getFullYear().toString();

// Elements
const app = document.getElementById('app');
const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('menu');
const backdrop = document.getElementById('backdrop');

// Drawer menu logic
function openMenu(){ menu.classList.add('open'); menuBtn.setAttribute('aria-expanded','true'); menu.setAttribute('aria-hidden','false'); backdrop.hidden=false; }
function closeMenu(){ menu.classList.remove('open'); menuBtn.setAttribute('aria-expanded','false'); menu.setAttribute('aria-hidden','true'); backdrop.hidden=true; }
menuBtn.addEventListener('click',(e)=>{ e.stopPropagation(); menu.classList.contains('open') ? closeMenu() : openMenu(); });
backdrop.addEventListener('click', closeMenu);

// Hash router
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
  const a = e.target.closest('[data-goto]'); if(a){ e.preventDefault(); navigate(a.getAttribute('data-goto')); }
  if(e.target.closest('#menu a')) closeMenu();
});

// State (demo)
const state = JSON.parse(localStorage.getItem('rentpay_state')||'{}');
function save(){localStorage.setItem('rentpay_state', JSON.stringify(state));}

// Helpers
const el = (t,a={},...c)=>{const n=document.createElement(t); Object.entries(a).forEach(([k,v])=>{if(k==='class')n.className=v; else if(k==='html')n.innerHTML=v; else n.setAttribute(k,v)}); c.forEach(x=>n.append(x)); return n;};
const input = (label, id, type='text', ph='', val='')=>{ const w=el('div',{}), l=el('div',{class:'label'}, document.createTextNode(label)), i=el('input',{id, class:'input', type, placeholder:ph, value:val}); w.append(l,i); return {wrap:w, input:i}; };
const button = (txt, on, cls='btn')=>{const b=el('button',{class:cls}, document.createTextNode(txt)); b.onclick=on; return b;};

// Views
function homeView(){
  const hero = el('section',{class:'hero card'},
    el('h1',{}, document.createTextNode('Affitti automatici, pagati puntuali.')),
    el('p',{class:'lead'}, document.createTextNode('Contratti digitali, KYC e addebiti ricorrenti in un’unica app.')),
    el('div',{class:'row'}, button('Accedi', ()=>navigate('#/access'),'btn'), button('Scopri le funzioni', ()=>navigate('#/features'),'btn ghost'))
  );
  const highlights = el('div',{class:'highlights'},
    hl('💳','Pagamenti automatici','Programmi il giorno, incassi su IBAN.'),
    hl('📝','Contratti & Firma','Upload PDF e firma digitale (demo).'),
    hl('🛡️','Garanzia canone','Stima premio (demo) con partner.')
  );
  return [ hero, el('section',{class:'section'}, highlights) ];
}
function hl(emoji,title,desc){ const d=el('div',{class:'highlight'}); d.append(el('h3',{}, document.createTextNode(`${emoji} ${title}`))); d.append(el('p',{}, document.createTextNode(desc))); return d; }

function accessView(){
  const tiles = el('div',{class:'tiles'},
    el('div',{class:'tile'}, el('h3',{}, document.createTextNode('Sono Proprietario')), el('p',{}, document.createTextNode('IBAN, canone, giorno, invito inquilino. Monitoraggio incassi.')), button('Vai alla dashboard', ()=>navigate('#/landlord'), 'btn')),
    el('div',{class:'tile'}, el('h3',{}, document.createTextNode('Sono Inquilino')), el('p',{}, document.createTextNode('KYC, collegamento contratto e metodo di pagamento.')), button('Entra nell’area inquilino', ()=>navigate('#/tenant'), 'btn ghost'))
  );
  return [ el('section',{class:'section'}, tiles) ];
}

function landlordView(){
  const left = el('div',{},
    el('h2',{}, document.createTextNode('Dashboard Proprietario')),
    input('Immobile','l_property','text','Via Roma 10, Firenze', state.l_property||'').wrap,
    input('IBAN Accredito','l_iban','text','IT60 X054 2811 1010 0000 0123 456', state.l_iban||'').wrap,
    input('Canone Mensile (EUR)','l_amount','number','850.00', state.l_amount||'850.00').wrap,
    input('Giorno Addebito','l_day','number','5', state.l_day||'5').wrap,
    input('Mesi Garanzia (assicurazione)','l_months','number','6', state.l_months||'6').wrap,
    button('Salva & Programma', ()=>{ const g=(id)=>document.getElementById(id).value; state.l_property=g('l_property'); state.l_iban=g('l_iban'); state.l_amount=g('l_amount'); state.l_day=g('l_day'); state.l_months=g('l_months'); save(); alert('Programmazione aggiornata (demo)'); }, 'btn')
  );
  const table = el('table',{class:'table'},
    el('thead',{}, el('tr',{}, el('th',{},document.createTextNode('Data')), el('th',{},document.createTextNode('Inquilino')), el('th',{},document.createTextNode('Importo')), el('th',{},document.createTextNode('Stato')))),
    el('tbody',{},
      el('tr',{}, el('td',{},document.createTextNode('05/09/2025')), el('td',{},document.createTextNode('Mario Rossi')), el('td',{},document.createTextNode('€'+(state.l_amount||'850,00'))), el('td',{}, el('span',{class:'badge'}, document.createTextNode('Programmato')))),
      el('tr',{}, el('td',{},document.createTextNode('05/08/2025')), el('td',{},document.createTextNode('Mario Rossi')), el('td',{},document.createTextNode('€'+(state.l_amount||'850,00'))), el('td',{}, el('span',{class:'badge'}, document.createTextNode('Pagato')))),
    )
  );
  const right = el('div',{}, el('h3',{}, document.createTextNode('Incassi')), table);
  return [ el('section',{class:'section card grid2'}, left, right) ];
}

function tenantView(){
  const left = el('div',{},
    el('h2',{}, document.createTextNode('Area Inquilino')),
    input('Nome e Cognome','t_name','text','Mario Rossi', state.t_name||'').wrap,
    input('Email','t_email','email','mario@esempio.it', state.t_email||'').wrap,
    input('Metodo di Pagamento (demo)','t_pm','text','Carta **** 4242 o IBAN', state.t_pm||'').wrap,
    button('Salva metodo di pagamento', ()=>{ const g=(id)=>document.getElementById(id).value; state.t_name=g('t_name'); state.t_email=g('t_email'); state.t_pm=g('t_pm'); save(); alert('Dati salvati (demo)'); }, 'btn')
  );
  const right = el('div',{}, el('h3',{}, document.createTextNode('Prossimo addebito')), el('p',{}, document.createTextNode('Ogni mese il giorno '+(state.l_day||'5')+' — €'+(state.l_amount||'850,00')+' (demo).')));
  return [ el('section',{class:'section card grid2'}, left, right) ];
}

function featuresView(){
  const blocks = el('div',{class:'grid2'},
    feature('💳 Pagamenti ricorrenti','Addebiti mensili automatici su carta e SEPA (demo).'),
    feature('🧾 Ricevute & report','Storico incassi, esport CSV (demo).'),
    feature('📝 Contratti digitali','Upload PDF, firma OTP/FEA (demo).'),
    feature('👤 KYC & AML','Verifica identità con provider esterni (demo).')
  );
  return [ el('section',{class:'section card'}, el('h2',{}, document.createTextNode('Funzioni')), blocks) ];
}
function feature(icon,title,desc){ const b = el('div',{class:'tile'}); b.append(el('h3',{}, document.createTextNode(`${icon} ${title}`))); b.append(el('p',{}, document.createTextNode(desc))); return b; }

function howView(){
  const steps = el('ol',{}, li('Registrazione','Proprietario o inquilino creano l’account.'), li('Firma & KYC','Carica documento e firma digitale del contratto.'), li('Addebiti automatici','Imposti giorno e importo: incasso puntuale.'));
  return [ el('section',{class:'section card'}, el('h2',{}, document.createTextNode('Come funziona')), steps) ];
}
function li(title,desc){ const li=el('li',{}); li.append(el('b',{},document.createTextNode(title)), document.createTextNode(' — '+desc)); return li; }

function insuranceView(){
  const calc = el('div',{}, input('Canone mensile (€)','ins_amount','number','800','').wrap, input('Mesi coperti','ins_months','number','6','').wrap, input('Franchigia (%)','ins_fr','number','10','').wrap, button('Stima premio (demo)', ()=>{ const a=parseFloat(document.getElementById('ins_amount').value||'0'); const m=parseInt(document.getElementById('ins_months').value||'0'); const f=parseFloat(document.getElementById('ins_fr').value||'0')/100; const base=Math.max(0,a*m*(0.04 - f*0.01)); alert('Stima premio indicativa: € '+base.toFixed(2)); }, 'btn'));
  const copy = el('div',{}, el('p',{}, document.createTextNode('La Garanzia Canone è fornita da partner assicurativi esterni. La stima è puramente dimostrativa.')));
  return [ el('section',{class:'section card grid2'}, calc, copy) ];
}

function faqView(){
  const list = el('div',{class:'tiles'}, qa('Serve un conto speciale?','No, accreditiamo sull’IBAN indicato dal proprietario.'), qa('Come aggiungo il metodo di pagamento?','Dalla tua area inquilino (demo). In produzione integreremo Stripe/SEPA.'), qa('È legale la firma digitale?','Sì: FEA/OTP con provider accreditati.'));
  return [ el('section',{class:'section card'}, el('h2',{}, document.createTextNode('FAQ')), list) ];
}
function qa(q,a){ const d=el('div',{class:'tile'}); d.append(el('h3',{},document.createTextNode(q))); d.append(el('p',{},document.createTextNode(a))); return d; }

// Render
function render(){ const view = routes[location.hash] || routes['#/']; app.innerHTML = ''; view().forEach(n=>app.append(n)); closeMenu(); }
if(!location.hash) location.hash = '#/'; render();
