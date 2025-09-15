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
const navToggle = document.getElementById('navToggle');

// Close drawer when clicking a link
document.addEventListener('click',(e)=>{
  const link = e.target.closest('.drawer a, .menu-desktop a, .brand');
  if(link){ navToggle.checked = false; }
});

// Hash router
const routes = {
  '#/': homeView,
  '#/vision': visionView,
  '#/features': featuresView,
  '#/how': howView,
  '#/insurance': insuranceView,
  '#/access': accessView,
  '#/landlord': landlordView,
  '#/tenant': tenantView,
  '#/terms': termsView,
  '#/privacy': privacyView,
};
function navigate(hash){ if(location.hash!==hash){ location.hash = hash; } else { render(); } }
window.addEventListener('hashchange', render);

// Delegate data-goto clicks
document.addEventListener('click',(e)=>{
  const a = e.target.closest('[data-goto]');
  if(a){ e.preventDefault(); navigate(a.getAttribute('data-goto')); }
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
    el('h1',{}, document.createTextNode('Affitti automatici, zero pensieri')),
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
function termsView(){
  const c = el('section',{class:'section card'},
    el('h2',{}, document.createTextNode('Termini di servizio (Demo)')),
    el('p',{}, document.createTextNode(
      'Questa applicazione è un prototipo dimostrativo (“Demo”) e non gestisce pagamenti reali. ' +
      'L’uso è consentito al solo scopo di test e valutazione. Non vengono stipulati contratti vincolanti ' +
      'attraverso la Demo e le funzionalità possono essere rimosse o modificate senza preavviso.'
    )),
    el('h3',{}, document.createTextNode('Limitazione di responsabilità')),
    el('p',{}, document.createTextNode(
      'RentPay non è responsabile per danni diretti o indiretti derivanti dall’uso della Demo, ' +
      'compresi perdita di dati, malfunzionamenti o indisponibilità del servizio.'
    )),
    el('h3',{}, document.createTextNode('Proprietà intellettuale')),
    el('p',{}, document.createTextNode(
      'Il marchio, la grafica e i contenuti della Demo sono di proprietà dei rispettivi titolari e ' +
      'non possono essere riutilizzati senza autorizzazione.'
    )),
    el('p',{}, document.createTextNode(
      'Per informazioni: demo@rentpay.it'
    ))
  );
  return [c];
}

function privacyView(){
  const c = el('section',{class:'section card'},
    el('h2',{}, document.createTextNode('Privacy Policy (Demo)')),
    el('p',{}, document.createTextNode(
      'Durante la Demo possiamo raccogliere dati minimi (es. nome, email) tramite form, ' +
      'al solo fine di contattarti e misurare l’interesse. I dati possono essere elaborati con ' +
      'strumenti terzi (es. Google Analytics, Microsoft Clarity, moduli Google) e non vengono ' +
      'venduti a terzi.'
    )),
    el('h3',{}, document.createTextNode('Base giuridica e conservazione')),
    el('p',{}, document.createTextNode(
      'Il trattamento si basa sul consenso prestato dall’utente. I dati sono conservati fino a 12 mesi ' +
      'e poi cancellati o anonimizzati.'
    )),
    el('h3',{}, document.createTextNode('Diritti')),
    el('p',{}, document.createTextNode(
      'Puoi chiedere accesso, rettifica o cancellazione scrivendo a demo@rentpay.it.'
    )),
    el('p',{}, document.createTextNode(
      'Versione semplificata per finalità dimostrative. Per la versione produttiva saranno pubblicati documenti completi.'
    ))
  );
  return [c];
}

function visionView(){
  const h = el('section',{class:'section card'},
    el('h2',{}, document.createTextNode('La nostra visione')),
    el('p',{}, document.createTextNode(
      'RentPay nasce per togliere l’ansia dei mancati pagamenti dalla locazione. ' +
      'Vogliamo che qualsiasi persona – dal piccolo proprietario allo studente fuori sede – ' +
      'possa vivere l’affitto come un’esperienza semplice, digitale e sicura.'
    )),
    el('h3',{}, document.createTextNode('Cosa risolviamo')),
    el('ul',{},
      li('Pagamenti automatici','Niente bonifici manuali o solleciti: l’addebito è ricorrente e puntuale.'),
      li('Contratti digitali','Gestiamo firma e KYC con provider esterni conformi, riducendo tempi e carta.'),
      li('Trasparenza','Dashboard con storico incassi e ricevute, visibile a proprietario e inquilino.'),
      li('Protezione','Su richiesta attiviamo una garanzia canone tramite assicurazioni partner.')
    ),
    el('h3',{}, document.createTextNode('Come lo facciamo')),
    el('p',{}, document.createTextNode(
      'Un’unica app installabile (PWA), pensata mobile-first: crei il contratto, verifichi l’identità, ' +
      'imposti importo e giorno di incasso, e monitori tutto in tempo reale. ' +
      'La nostra priorità è l’affidabilità dei pagamenti e la semplicità d’uso.'
    )),
    el('p',{}, document.createTextNode(
      'Il percorso è progressivo: partiamo con una demo che mostra il flusso completo, ' +
      'poi integriamo i pagamenti reali con un PSP regolamentato e attiviamo la garanzia con partner assicurativi.'
    ))
  );
  return [h];
}
function li(title,desc){
  const x=el('li',{}); x.append(el('b',{},document.createTextNode(title)), document.createTextNode(' — '+desc));
  return x;
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
function render(){ const view = routes[location.hash] || routes['#/']; app.innerHTML = ''; view().forEach(n=>app.append(n)); }
if(!location.hash) location.hash = '#/'; render();
