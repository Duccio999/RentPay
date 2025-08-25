
// ---- PWA basics ----
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.error));
}
let deferredPrompt;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt',(e)=>{e.preventDefault();deferredPrompt=e;installBtn.hidden=false;});
installBtn?.addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;installBtn.hidden=true;deferredPrompt=null;});
document.getElementById('year').textContent = new Date().getFullYear().toString();

// ---- App setup ----
const app = document.getElementById('app');
const routes = {
  '#/': homeView,
  '#/features': featuresView,
  '#/how': howView,
  '#/pricing': pricingView,
  '#/insurance': insuranceView,
  '#/app': appShellView,
  '#/landlord': landlordView,
  '#/tenant': tenantView,
};
function navigate(hash){location.hash = hash; render();}
window.addEventListener('hashchange', render);

// state
const state = JSON.parse(localStorage.getItem('rentpay_state')||'{}');
function save(){localStorage.setItem('rentpay_state', JSON.stringify(state));}
function money(n){ try{ return new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(parseFloat(n||0)); }catch(e){ return `€${n}`; } }

// helpers
function el(tag, attrs={}, ...children){
  const n=document.createElement(tag);
  Object.entries(attrs).forEach(([k,v])=>{ if(k==='class') n.className=v; else if(k==='html') n.innerHTML=v; else if(k==='style') n.style.cssText=v; else n.setAttribute(k,v);});
  children.forEach(c=>{ if(typeof c==='string') n.append(document.createTextNode(c)); else if(c) n.append(c); });
  return n;
}
function section(cls,...children){ return el('section',{class:cls},...children); }
function card(title, body){ return el('div',{class:'card'}, el('div',{class:'title'},title), body); }
function btn(label, click, cls='btn'){ const b=el('button',{class:cls}, label); b.onclick=click; return b;}
function input(label, id, type='text', ph='', val=''){
  const w=el('div',{class:'row'});
  const l=el('label',{}, label);
  const i=el('input',{class:'input',id,type,placeholder:ph,value:val});
  w.append(l,i); return {wrap:w, input:i};
}

// ---- Views ----
function homeView(){
  const hero = el('div',{class:'container hero'},
    el('div',{class:'hgrid'},
      el('div',{}, 
        el('h1',{class:'h-title'}, 'Gestione Automatica dei Pagamenti degli Affitti'),
        el('p',{class:'h-sub'}, 'Pagamenti ricorrenti sicuri, contratti digitali, KYC e garanzia canone con partner assicurativi.'),
        el('div',{class:'row'},
          btn('Inizia Subito',()=>navigate('#/app'),'btn'),
          btn('Guarda Funzioni',()=>navigate('#/features'),'btn ghost')
        ),
        el('div',{class:'kpis'},
          el('div',{class:'kpi'}, el('div',{},'Tasso incasso'), el('b',{},'98.7%')),
          el('div',{class:'kpi'}, el('div',{},'Tempo setup'), el('b',{},'3 min')),
          el('div',{class:'kpi'}, el('div',{},'Commissione da'), el('b',{},'1.5%'))
        )
      ),
      card('Perché RentPay?',
        el('div',{},
          el('p',{}, 'Riduci i ritardi, automatizza i solleciti e incassa su IBAN.'),
          el('p',{}, 'Integra Stripe (carte) e SEPA SDD. Firma digitale e KYC integrati.')
        )
      )
    )
  );
  return [hero, ...featuresView(true), ...howView(true), ...pricingView(true)];
}

function featuresView(embed=false){
  const inner = el('div',{class:'container section'},
    el('div',{class:'title'}, 'Funzioni principali'),
    el('div',{class:'grid3'},
      el('div',{class:'feature'}, el('div',{class:'icon'}, '💳'), el('h3',{},'Pagamenti Ricorrenti'), el('p',{class:'muted'},'Addebito automatico su carta o SEPA SDD con riconciliazione.')),
      el('div',{class:'feature'}, el('div',{class:'icon'}, '📝'), el('h3',{},'Contratti Digitali'), el('p',{class:'muted'},'Carica il PDF o genera da template. Firma OTP/FEA.')),
      el('div',{class:'feature'}, el('div',{class:'icon'}, '🛡️'), el('h3',{},'Garanzia Canone'), el('p',{class:'muted'},'Partner assicurativi per copertura in caso di morosità.')),
    )
  );
  return embed ? [inner] : [inner];
}

function howView(embed=false){
  const inner = el('div',{class:'container section'},
    el('div',{class:'title'}, 'Come funziona'),
    el('div',{class:'steps'},
      el('div',{class:'step'}, el('div',{class:'badge'},'1') , el('h3',{},'Registrazione'), el('p',{class:'muted'},'Proprietario o Inquilino completano il profilo.')),
      el('div',{class:'step'}, el('div',{class:'badge'},'2') , el('h3',{},'Firma & KYC'), el('p',{class:'muted'},'Carica documenti e firma digitale.')),
      el('div',{class:'step'}, el('div',{class:'badge'},'3') , el('h3',{},'Pagamenti'), el('p',{class:'muted'},'Programma addebiti mensili automatici.')),
    ),
    el('div',{class:'row',style:'margin-top:16px;'}, btn('Prova la demo',()=>navigate('#/app'),'btn'))
  );
  return embed ? [inner] : [inner];
}

function pricingView(embed=false){
  const inner = el('div',{class:'container section'},
    el('div',{class:'title'}, 'Prezzi'),
    el('div',{class:'pricing'},
      el('div',{class:'price-card'}, el('h3',{},'Starter'), el('p',{class:'muted'},'Per singoli proprietari'), el('h2',{},'1.5% + €0,20'), el('p',{class:'muted'},'per transazione')),
      el('div',{class:'price-card'}, el('h3',{},'Pro'), el('p',{class:'muted'},'Per agenzie'), el('h2',{},'1.2% + €0,20'), el('p',{class:'muted'},'sopra 50 unità')),
      el('div',{class:'price-card'}, el('h3',{},'Enterprise'), el('p',{class:'muted'},'Volumi alti'), el('h2',{},'Custom'), el('p',{class:'muted'},'contattaci'))
    )
  );
  return embed ? [inner] : [inner];
}

function insuranceView(){
  const amount = input('Canone mensile (EUR)','i_amount','number','850', state.i_amount||'850');
  const months = input('Mesi copertura','i_months','number','12', state.i_months||'12');
  const excess = input('Franchigia (mesi)','i_excess','number','1', state.i_excess||'1');

  function calc(){
    const a = parseFloat(amount.input.value||0);
    const m = parseInt(months.input.value||0);
    const ex = parseInt(excess.input.value||0);
    const coveredMonths = Math.max(m - ex, 0);
    const premium = a * coveredMonths * 0.025; // 2.5% demo
    return {coveredMonths, premium};
  }
  const res = el('div',{class:'notice'},'—');
  const actions = el('div',{class:'row'},
    btn('Richiedi preventivo',()=>alert('Invio a partner assicurativo (demo)'),'btn'),
    btn('Apri sinistro',()=>alert('Modulo sinistro (demo)'),'btn ghost')
  );

  function renderQuote(){
    const {coveredMonths, premium} = calc();
    res.textContent = `Stima DEMO: copertura ${coveredMonths} mesi • Premio: ${money(premium)}`;
  }
  renderQuote();

  [amount.input, months.input, excess.input].forEach(i=>i.addEventListener('input',()=>{state.i_amount=amount.input.value;state.i_months=months.input.value;state.i_excess=excess.input.value;save();renderQuote();}));

  const c = el('div',{class:'container section'},
    el('div',{class:'title'}, 'Garanzia Canone'),
    el('div',{class:'panel'}, amount.wrap, months.wrap, excess.wrap, res, actions)
  );
  return [c];
}

function appShellView(){
  const c = el('div',{class:'container section'},
    el('div',{class:'title'}, 'Seleziona il tuo ruolo'),
    el('div',{class:'row'},
      btn('Sono Proprietario',()=>navigate('#/landlord'),'btn'),
      btn('Sono Inquilino',()=>navigate('#/tenant'),'btn ghost')
    )
  );
  return [c];
}

function landlordView(){
  const name = input('Immobile','l_property','text','Via Roma 10, Firenze', state.l_property||'');
  const iban = input('IBAN Accredito','l_iban','text','IT60 X054 2811 1010 0000 0123 456', state.l_iban||'');
  const amount = input('Canone Mensile (EUR)','l_amount','number','850.00', state.l_amount||'850.00');
  const day = input('Giorno Addebito','l_day','number','5', state.l_day||'5');
  const months = input('Mesi di Garanzia (demo)','l_gmonths','number','12', state.l_gmonths||'12');
  const premiumBox = el('div',{class:'notice'});

  function updatePremium(){
    const a = parseFloat(amount.input.value||0);
    const m = parseInt(months.input.value||0);
    const prem = a * m * 0.02; // demo 2%
    premiumBox.textContent = `Stima premio garanzia: ${money(prem)} (demo)`;
  }
  updatePremium();
  [amount.input, months.input].forEach(i=>i.addEventListener('input',updatePremium));

  const table = el('table',{class:'table'},
    el('thead',{}, el('tr',{}, el('th',{},'Data'), el('th',{},'Inquilino'), el('th',{},'Importo'), el('th',{},'Stato') )),
    el('tbody',{}, 
      el('tr',{}, el('td',{},'05/09/2025'), el('td',{},'Mario Rossi'), el('td',{},money(850)), el('td',{}, el('span',{class:'badge'},'Programmato') )),
      el('tr',{}, el('td',{},'05/08/2025'), el('td',{},'Mario Rossi'), el('td',{},money(850)), el('td',{}, el('span',{class:'badge'},'Pagato') ))
    )
  );

  const c = el('div',{class:'container section'},
    el('div',{class:'title'}, 'Dashboard Proprietario'),
    el('div',{class:'panel'},
      el('div',{class:'toolbar'},
        btn('Nuovo Contratto',()=>alert('Upload contratto (demo)'),'btn'),
        btn('Invita Inquilino',()=>alert('Link inviato (demo)'),'btn ghost'),
        btn('Esporta Report',()=>alert('CSV generato (demo)'),'btn ghost')
      ),
      name.wrap, iban.wrap, amount.wrap, day.wrap, months.wrap, premiumBox,
      el('div',{class:'row'}, btn('Salva & Programma',()=>{state.l_property=name.input.value;state.l_iban=iban.input.value;state.l_amount=amount.input.value;state.l_day=day.input.value;state.l_gmonths=months.input.value;save();alert('Programmazione aggiornata (demo)');},'btn'))
    ),
    card('Incassi', el('div',{}, table))
  );
  return [c];
}

function tenantView(){
  const tname = input('Nome e Cognome','t_name','text','Mario Rossi', state.t_name||'');
  const email = input('Email','t_email','email','mario@esempio.it', state.t_email||'');
  const pm = input('Metodo di Pagamento (demo)','t_pm','text','Carta **** 4242 o IBAN', state.t_pm||'');
  const c = el('div',{class:'container section'},
    el('div',{class:'title'}, 'Area Inquilino'),
    el('div',{class:'panel'},
      el('div',{class:'toolbar'},
        btn('Carica Documento (KYC)',()=>alert('KYC provider (demo)'),'btn ghost'),
        btn('Collega Contratto',()=>alert('Seleziona contratto (demo)'),'btn ghost')
      ),
      tname.wrap, email.wrap, pm.wrap,
      el('div',{class:'row'}, btn('Salva Metodo Pagamento',()=>{state.t_name=tname.input.value;state.t_email=email.input.value;state.t_pm=pm.input.value;save();alert('Metodo salvato (demo)');},'btn'))
    ),
    card('Prossimo addebito', el('p',{class:'muted'}, '05 del mese — €850,00 → IBAN del proprietario (demo).'))
  );
  return [c];
}

// ---- Render ----
function render(){
  app.innerHTML='';
  const key = location.hash || '#/';
  const view = routes[key] || homeView;
  const out = view();
  out.forEach(n=>app.append(n));
}
if(!location.hash) location.hash = '#/';
render();
