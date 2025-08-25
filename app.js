
// Service worker
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.error));}

let deferredPrompt;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt',(e)=>{e.preventDefault();deferredPrompt=e;installBtn.hidden=false;});
installBtn?.addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;installBtn.hidden=true;deferredPrompt=null;});
document.getElementById('year').textContent = new Date().getFullYear().toString();

const app = document.getElementById('app');
const routes = {
  '/': homeView,
  '/features': featuresView,
  '/how': howView,
  '/insurance': insuranceView,
  '/pricing': pricingView,
  '/app': appShellView,
  '/landlord': landlordView,
  '/tenant': tenantView,
};
function navigate(path){history.pushState({},'',path);render();}
window.addEventListener('popstate',render);
document.addEventListener('click',(e)=>{
  const a = e.target.closest('[data-goto]');
  if(a){e.preventDefault();navigate(a.getAttribute('data-goto'));}
});

const state = JSON.parse(localStorage.getItem('rentpay_state')||'{}');
function save(){localStorage.setItem('rentpay_state', JSON.stringify(state));}

function el(tag, attrs={}, ...children){
  const n=document.createElement(tag);
  Object.entries(attrs).forEach(([k,v])=>{ if(k==='class') n.className=v; else if(k==='html') n.innerHTML=v; else if(k==='style') n.style.cssText=v; else n.setAttribute(k,v);});
  children.forEach(c=>n.append(c));
  return n;
}
function section(cls,...children){ return el('section',{class:cls},...children); }
function card(title, body){ return el('div',{class:'card'}, el('div',{class:'title',html:title}), body); }
function btn(label, click, cls='btn'){ const b=el('button',{class:cls}, document.createTextNode(label)); b.onclick=click; return b;}
function input(label, id, type='text', ph='', val=''){
  const w=el('div',{class:'row'});
  const l=el('label',{}, document.createTextNode(label));
  const i=el('input',{class:'input',id,type,placeholder:ph,value:val});
  w.append(l,i); return {wrap:w, input:i};
}

function homeView(){
  const c = el('div',{class:'container hero'},
    el('div',{class:'hgrid'},
      el('div',{}, 
        el('h1',{class:'h-title'}, document.createTextNode('Affitti automatici + Garanzia del Canone')),
        el('p',{class:'h-sub'}, document.createTextNode('Pagamenti ricorrenti, contratti digitali, KYC e copertura assicurativa contro la morosità tramite partner terzi.')),
        el('div',{class:'row'},
          btn('Inizia Subito',()=>navigate('/app'),'btn'),
          btn('Scopri la Garanzia',()=>navigate('/insurance'),'btn ghost')
        ),
        el('div',{class:'kpis'},
          el('div',{class:'kpi'}, el('div',{},document.createTextNode('Tasso incasso')), el('b',{},document.createTextNode('98.7%'))),
          el('div',{class:'kpi'}, el('div',{},document.createTextNode('Canone garantito fino a')), el('b',{},document.createTextNode('12 mesi'))),
          el('div',{class:'kpi'}, el('div',{},document.createTextNode('Attivazione')), el('b',{},document.createTextNode('100% online'))),
        )
      ),
      card('Come funziona la Garanzia', el('div',{},
        el('p',{}, document.createTextNode('Il proprietario può attivare una copertura assicurativa che rimborsa i canoni non pagati secondo condizioni ed esclusioni del partner assicurativo.')),
        el('p',{}, document.createTextNode('La polizza è erogata da assicurazioni terze. L’attivazione è soggetta a valutazione e documentazione del contratto di locazione.'))
      ))
    )
  );
  return [c, featuresView(true), howView(true)];
}

function featuresView(embed=false){
  const inner = el('div',{class:'container section'},
    el('div',{class:'title'}, document.createTextNode('Funzioni principali')),
    el('div',{class:'grid3'},
      el('div',{class:'feature'}, el('div',{class:'icon'}, document.createTextNode('💳')), el('h3',{},document.createTextNode('Pagamenti Ricorrenti')), el('p',{class:'muted'},document.createTextNode('Carta/SEPA con riconciliazione e solleciti automatici.'))),
      el('div',{class:'feature'}, el('div',{class:'icon'}, document.createTextNode('📝')), el('h3',{},document.createTextNode('Contratti Digitali')), el('p',{class:'muted'},document.createTextNode('Firmati con OTP/FEA e archiviati.'))),
      el('div',{class:'feature'}, el('div',{class:'icon'}, document.createTextNode('🛡️')), el('h3',{},document.createTextNode('Garanzia Canone')), el('p',{class:'muted'},document.createTextNode('Copertura morosità tramite assicurazioni partner.'))),
    )
  );
  return [inner];
}

function howView(embed=false){
  const inner = el('div',{class:'container section'},
    el('div',{class:'title'}, document.createTextNode('Come funziona')),
    el('div',{class:'steps'},
      el('div',{class:'step'}, el('div',{class:'badge'},document.createTextNode('1')) , el('h3',{},document.createTextNode('Registrazione')), el('p',{class:'muted'},document.createTextNode('Proprietario e Inquilino creano l’account.'))),
      el('div',{class:'step'}, el('div',{class:'badge'},document.createTextNode('2')) , el('h3',{},document.createTextNode('Firma & KYC')), el('p',{class:'muted'},document.createTextNode('Verifica identità e contratto digitale.'))),
      el('div',{class:'step'}, el('div',{class:'badge'},document.createTextNode('3')) , el('h3',{},document.createTextNode('Pagamenti & Garanzia')), el('p',{class:'muted'},document.createTextNode('Addebiti automatici + polizza canone opzionale.'))),
    ),
    el('div',{class:'row',style:'margin-top:16px;'},
      btn('Prova la demo',()=>navigate('/app'),'btn')
    )
  );
  return [inner];
}

function insuranceView(){
  const premium = input('Canone Mensile (EUR)','ins_amount','number','850.00', state.ins_amount||'850.00');
  const months = input('Mesi garantiti (3–12)','ins_months','number','12', state.ins_months||'12');
  const deductible = input('Franchigia (EUR, opzionale)','ins_ded','number','0', state.ins_ded||'0');
  const info = el('p',{class:'muted'}, document.createTextNode('Stima premium indicativa: calcolo demo non vincolante. Le condizioni reali dipendono dal partner assicurativo.'));

  function calc(){
    const A = parseFloat(premium.input.value||'0');
    const M = Math.max(3, Math.min(12, parseInt(months.input.value||'12')));
    const D = Math.max(0, parseFloat(deductible.input.value||'0'));
    const baseRate = 0.022;
    const discount = Math.min(0.4, D / (A*1.0) * 0.2);
    const monthly = A * baseRate * (1-discount);
    const total = monthly * M;
    return {M, monthly: Math.round(monthly*100)/100, total: Math.round(total*100)/100, discount: Math.round(discount*1000)/10};
  }
  const resultEl = el('div',{});
  function renderQuote(){
    const q = calc();
    resultEl.innerHTML = `<div class="card"><div class="title">Preventivo demo</div>
      <p class="muted">Durata: <b>${q.M} mesi</b> — Stima premio mensile: <b>€ ${q.monthly.toFixed(2)}</b></p>
      <p class="muted">Premio totale stimato: <b>€ ${q.total.toFixed(2)}</b> • Sconto franchigia ~ <b>${q.discount}%</b></p>
      <div class="row"><button class="btn" id="reqQuote">Richiedi preventivo partner</button>
      <button class="btn ghost" id="seeTos">Condizioni & esclusioni</button></div>
      </div>`;
    resultEl.querySelector('#reqQuote').onclick = ()=>alert('Invio dati al partner assicurativo (demo). Verrai contattato per underwriting.');
    resultEl.querySelector('#seeTos').onclick = ()=>alert('Esempio: massimali, scoperti, esclusioni, requisiti documentali. (demo)');
  }

  const partners = el('div',{class:'row'},
    el('div',{class:'badge'}, document.createTextNode('Partner A')),
    el('div',{class:'badge'}, document.createTextNode('Partner B')),
    el('div',{class:'badge'}, document.createTextNode('Partner C'))
  );

  const c = el('div',{class:'container section'},
    el('div',{class:'title'}, document.createTextNode('Garanzia Canone (Assicurazione)')),
    el('div',{class:'panel'},
      partners,
      premium.wrap, months.wrap, deductible.wrap, info, resultEl,
      el('small',{class:'muted'}, document.createTextNode('Disclaimer: demo informativa. La copertura è emessa da compagnie terze e richiede approvazione.'))
    ),
    card('Sinistri & Reclami', el('div',{}, 
      el('p',{class:'muted'}, document.createTextNode('Se l’inquilino non paga, apri una richiesta di rimborso:')),
      el('div',{class:'row'}, btn('Apri pratica sinistro',()=>alert('Apertura pratica (demo)'),'btn'), btn('Scarica modulo (demo)',()=>alert('Download (demo)'),'btn ghost'))
    ))
  );

  [premium.input, months.input, deductible.input].forEach(i=>i.addEventListener('input',()=>{state.ins_amount=premium.input.value;state.ins_months=months.input.value;state.ins_ded=deductible.input.value;save();renderQuote();}));
  renderQuote();
  return [c];
}

function pricingView(){
  const c = el('div',{class:'container section'},
    el('div',{class:'title'}, document.createTextNode('Prezzi')),
    el('div',{class:'pricing'},
      el('div',{class:'price-card'},
        el('h3',{},document.createTextNode('Starter')),
        el('div',{class:'price'}, document.createTextNode('Gratis')),
        el('ul',{}, el('li',{},document.createTextNode('1 proprietà')), el('li',{},document.createTextNode('Pagamenti demo')), el('li',{},document.createTextNode('Supporto email')) ),
        el('div',{class:'row'}, btn('Attiva',()=>navigate('/app'),'btn full'))
      ),
      el('div',{class:'price-card'},
        el('h3',{},document.createTextNode('Proprietario')),
        el('div',{class:'price'}, document.createTextNode('1.5% + €0,30')),
        el('ul',{}, el('li',{},document.createTextNode('Pagamenti ricorrenti')), el('li',{},document.createTextNode('Contratti digitali')), el('li',{},document.createTextNode('KYC incluso')) ),
        el('div',{class:'row'}, btn('Attiva',()=>navigate('/app'),'btn full'))
      ),
      el('div',{class:'price-card'},
        el('h3',{},document.createTextNode('Pro + Garanzia')),
        el('div',{class:'price'}, document.createTextNode('su preventivo')),
        el('ul',{}, el('li',{},document.createTextNode('Tutto del piano Proprietario')), el('li',{},document.createTextNode('Garanzia canone (partner)')), el('li',{},document.createTextNode('Gestione sinistri')) ),
        el('div',{class:'row'}, btn('Richiedi preventivo',()=>navigate('/insurance'),'btn full'))
      )
    ),
    el('small',{class:'muted'}, document.createTextNode('I prezzi sono indicativi. Commissioni PSP e premio assicurativo variano per profilo e partner.'))
  );
  return [c];
}

function appShellView(){
  const c = el('div',{class:'container section'},
    el('div',{class:'title'}, document.createTextNode('Seleziona il tuo ruolo')),
    el('div',{class:'row'},
      btn('Sono Proprietario',()=>navigate('/landlord'),'btn'),
      btn('Sono Inquilino',()=>navigate('/tenant'),'btn ghost')
    )
  );
  return [c];
}

function landlordView(){
  const name = input('Immobile','l_property','text','Via Roma 10, Firenze', state.l_property||'');
  const iban = input('IBAN Accredito','l_iban','text','IT60 X054 2811 1010 0000 0123 456', state.l_iban||'');
  const amount = input('Canone Mensile (EUR)','l_amount','number','850.00', state.l_amount||'850.00');
  const day = input('Giorno Addebito','l_day','number','5', state.l_day||'5');
  const insure = input('Garanzia (mesi, 0=off)','l_insure','number','12', state.l_insure||'12');

  function estPremium(){
    const A = parseFloat(amount.input.value||'0'); const M = Math.max(0, parseInt(insure.input.value||'0'));
    const r = 0.018;
    const monthly = M>0 ? A*r : 0; const total = monthly*M;
    return {monthly: Math.round(monthly*100)/100, total: Math.round(total*100)/100};
  }

  const estEl = el('p',{class:'muted'});
  function renderEst(){ const q=estPremium(); estEl.textContent = (q.total>0)?`Stima premio garanzia: € ${q.monthly.toFixed(2)}/mese — Totale € ${q.total.toFixed(2)} (demo)`:'Garanzia disattivata'; }
  [amount.input, insure.input].forEach(i=>i.addEventListener('input',renderEst)); renderEst();

  const table = el('table',{class:'table'},
    el('thead',{}, el('tr',{}, el('th',{},document.createTextNode('Data')), el('th',{},document.createTextNode('Inquilino')), el('th',{},document.createTextNode('Importo')), el('th',{},document.createTextNode('Stato')) )),
    el('tbody',{}, 
      el('tr',{}, el('td',{},document.createTextNode('05/09/2025')), el('td',{},document.createTextNode('Mario Rossi')), el('td',{},document.createTextNode('€'+(state.l_amount||'850.00'))), el('td',{}, el('span',{class:'badge'},document.createTextNode('Programmato')) )),
      el('tr',{}, el('td',{},document.createTextNode('05/08/2025')), el('td',{},document.createTextNode('Mario Rossi')), el('td',{},document.createTextNode('€'+(state.l_amount||'850.00'))), el('td',{}, el('span',{class:'badge'},document.createTextNode('Pagato')) ))
    )
  );

  const c = el('div',{class:'container section'},
    el('div',{class:'title'}, document.createTextNode('Dashboard Proprietario')),
    el('div',{class:'panel'},
      el('div',{class:'toolbar'},
        btn('Nuovo Contratto',()=>alert('Upload contratto (demo)'),'btn'),
        btn('Invita Inquilino',()=>alert('Link inviato (demo)'),'btn ghost'),
        btn('Esporta Report',()=>alert('CSV generato (demo)'),'btn ghost')
      ),
      name.wrap, iban.wrap, amount.wrap, day.wrap, insure.wrap, estEl,
      el('div',{class:'row'}, btn('Salva & Programma',()=>{state.l_property=name.input.value;state.l_iban=iban.input.value;state.l_amount=amount.input.value;state.l_day=day.input.value;state.l_insure=insure.input.value;save();alert('Programmazione aggiornata (demo)');},'btn')),
      el('div',{class:'row'}, btn('Attiva Garanzia con partner',()=>navigate('/insurance'),'btn ghost'))
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
    el('div',{class:'title'}, document.createTextNode('Area Inquilino')),
    el('div',{class:'panel'},
      el('div',{class:'toolbar'},
        btn('Carica Documento (KYC)',()=>alert('KYC provider (demo)'),'btn ghost'),
        btn('Collega Contratto',()=>alert('Seleziona contratto (demo)'),'btn ghost')
      ),
      tname.wrap, email.wrap, pm.wrap,
      el('div',{class:'row'}, btn('Salva Metodo Pagamento',()=>{state.t_name=tname.input.value;state.t_email=email.input.value;state.t_pm=pm.input.value;save();alert('Metodo salvato (demo)');},'btn'))
    ),
    card('Prossimo addebito', el('p',{class:'muted'}, document.createTextNode((state.l_day||'05')+' del mese — €'+(state.l_amount||'850,00')+' → IBAN del proprietario (demo).')))
  );
  return [c];
}

function render(){ app.innerHTML=''; const view = routes[location.pathname] || routes['/']; view().forEach(n=>app.append(n)); }
render();
