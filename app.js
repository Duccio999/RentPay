
// SW
if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.error)); }

let deferredPrompt;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e)=>{ e.preventDefault(); deferredPrompt=e; installBtn.hidden=false; });
installBtn?.addEventListener('click', async ()=>{ if(!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; installBtn.hidden=true; deferredPrompt=null; });
document.getElementById('year').textContent = new Date().getFullYear().toString();

// Mobile menu
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
navToggle?.addEventListener('click', ()=> navMenu.classList.toggle('open'));

// Routes (hash-based for GH Pages)
const app = document.getElementById('app');
const routes = {
  '#/': home,
  '#/funzioni': features,
  '#/come-funziona': how,
  '#/garanzia': insurance,
  '#/faq': faq,
  '#/app': appShell,
  '#/landlord': landlord,
  '#/tenant': tenant,
};
function render(){
  const route = location.hash || '#/';
  const view = routes[route] || home;
  app.innerHTML = '';
  view().forEach(n=>app.append(n));
}
window.addEventListener('hashchange', render);

// Helpers
function el(tag, attrs={}, ...children){ const n=document.createElement(tag); Object.entries(attrs).forEach(([k,v])=>{ if(k==='class') n.className=v; else if(k==='html') n.innerHTML=v; else n.setAttribute(k,v); }); children.forEach(c=>n.append(c)); return n; }
function btn(label, click, cls='btn'){ const b=el('button',{class:cls}, document.createTextNode(label)); b.onclick=click; return b; }
function input(label, id, type='text', ph='', val=''){ const w=el('div',{class:'row'}); const l=el('label',{class:'smallcaps'}, document.createTextNode(label)); const i=el('input',{class:'input',id,type,placeholder:ph,value:val}); w.append(l,i); return {wrap:w, input:i}; }
function card(title, body){ return el('div',{class:'card'}, el('div',{class:'h2'}, document.createTextNode(title)), body); }

// Views
function home(){
  const brief = el('div',{class:'container hero'},
    el('div',{class:'hero-grid'},
      el('div',{},
        el('h1',{class:'h1'}, document.createTextNode('Automatizza i pagamenti degli affitti')),
        el('p',{class:'p'}, document.createTextNode('RentPay semplifica la gestione tra proprietari e inquilini: contratti digitali, verifica identità (KYC) e addebiti ricorrenti su carta o SEPA. Tutto in un’unica app, anche da smartphone.')),
        el('div',{class:'row'},
          btn('Apri app', ()=>location.hash='#/app','btn'),
          btn('Scopri come funziona', ()=>location.hash='#/come-funziona','btn ghost')
        ),
        el('div',{class:'kpis'},
          el('div',{class:'kpi'}, el('div',{},document.createTextNode('Setup medio')), el('b',{},document.createTextNode('3 minuti'))),
          el('div',{class:'kpi'}, el('div',{},document.createTextNode('Incassi puntuali')), el('b',{},document.createTextNode('98.7%'))),
          el('div',{class:'kpi'}, el('div',{},document.createTextNode('Commissione da')), el('b',{},document.createTextNode('1.5%'))),
        )
      ),
      card('Cosa fa RentPay', el('p',{class:'p'}, document.createTextNode('Raccoglie i metodi di pagamento, programma addebiti mensili, incassa e invia al proprietario. Gestisce contratti, KYC, notifiche e report, con garanzia canone opzionale tramite partner assicurativi.')))
    )
  );
  return [brief, features(true)[0], how(true)[0]];
}

function features(embed=false){
  const inner = el('div',{class:'container section'},
    el('div',{class:'h2'}, document.createTextNode('Funzioni principali')),
    el('div',{class:'grid3'},
      card('Pagamenti ricorrenti', el('p',{class:'p'}, document.createTextNode('Addebiti automatici su carta o SEPA SDD, riconciliazione e reportistica.'))),
      card('Contratti digitali + Firma', el('p',{class:'p'}, document.createTextNode('Carica PDF o usa template. Firma OTP/FEA tramite provider esterni.'))),
      card('KYC & GDPR', el('p',{class:'p'}, document.createTextNode('Verifica identità con Onfido/Sumsub e gestione privacy conforme.')))
    )
  );
  return embed ? [inner] : [inner];
}

function how(embed=false){
  const inner = el('div',{class:'container section'},
    el('div',{class:'h2'}, document.createTextNode('Come funziona')),
    el('div',{class:'grid3'},
      card('1) Registrazione', el('p',{class:'p'}, document.createTextNode('Proprietario e inquilino creano il profilo.'))),
      card('2) Contratto & KYC', el('p',{class:'p'}, document.createTextNode('Upload contratto e verifica documenti.'))),
      card('3) Pagamenti', el('p',{class:'p'}, document.createTextNode('Si imposta il giorno e l’importo: RentPay addebita ogni mese.')))
    ),
    el('div',{class:'row'}, btn('Vai all’app', ()=>location.hash='#/app','btn'))
  );
  return embed ? [inner] : [inner];
}

function insurance(){
  const canone = input('Canone mensile (EUR)','i_amount','number','800', '');
  const mesi = input('Mesi garantiti','i_months','number','6','');
  const franchigia = input('Franchigia (mesi)','i_deduct','number','1','');
  const out = el('div',{class:'p'});
  function renderQuote(){
    const A = parseFloat(canone.input.value||'0');
    const M = parseInt(mesi.input.value||'0');
    const F = parseInt(franchigia.input.value||'0');
    const base = Math.max(0,(M-F))*A;
    const premio = (base * 0.045).toFixed(2); // demo
    out.textContent = `Stima premio: € ${premio} (demo)`;
  }
  [canone.input, mesi.input, franchigia.input].forEach(i=>i.addEventListener('input', renderQuote));
  setTimeout(renderQuote,0);
  const c = el('div',{class:'container section'},
    el('div',{class:'h2'}, document.createTextNode('Garanzia Canone (partner assicurativi)')),
    el('p',{class:'p'}, document.createTextNode('Copertura facoltativa contro morosità. La polizza è emessa da partner terzi: calcolo dimostrativo.')),
    el('div',{class:'panel'}, canone.wrap, mesi.wrap, franchigia.wrap, out, el('div',{class:'row'}, btn('Richiedi preventivo',()=>alert('Invio richiesta (demo)'),'btn'), btn('Apri sinistro',()=>alert('Apertura sinistro (demo)'),'btn ghost')))
  );
  return [c];
}

function faq(){
  const c = el('div',{class:'container section'},
    el('div',{class:'h2'}, document.createTextNode('Domande frequenti')),
    card('Serve un conto dedicato?', el('p',{class:'p'}, document.createTextNode('No: accrediti direttamente sull’IBAN del proprietario.'))),
    card('I dati carta/IBAN dove finiscono?', el('p',{class:'p'}, document.createTextNode('Sono gestiti da PSP esterni conformi PSD2. Noi non li memorizziamo.'))),
    card('Posso disattivare l’assicurazione?', el('p',{class:'p'}, document.createTextNode('Certo: la garanzia canone è totalmente opzionale.')))
  );
  return [c];
}

// App & dashboards (demo)
function appShell(){
  const c = el('div',{class:'container section'},
    el('div',{class:'h2'}, document.createTextNode('Seleziona il tuo ruolo')),
    el('div',{class:'row'}, btn('Sono Proprietario', ()=>location.hash='#/landlord','btn'), btn('Sono Inquilino', ()=>location.hash='#/tenant','btn ghost'))
  );
  return [c];
}

const state = JSON.parse(localStorage.getItem('rentpay_state')||'{}');
function save(){ localStorage.setItem('rentpay_state', JSON.stringify(state)); }

function landlord(){
  const name = input('Immobile','l_property','text','Via Roma 10, Firenze', state.l_property||'');
  const iban = input('IBAN Accredito','l_iban','text','IT60 X054 2811 1010 0000 0123 456', state.l_iban||'');
  const amount = input('Canone Mensile (EUR)','l_amount','number','850.00', state.l_amount||'850.00');
  const day = input('Giorno Addebito','l_day','number','5', state.l_day||'5');
  const months = input('Mesi garanzia (facoltativo)','l_months','number','6', state.l_months||'6');
  const out = el('div',{class:'p'});
  function calc(){ const A=parseFloat(amount.input.value||'0'); const M=parseInt(months.input.value||'0'); const premio=(A*M*0.045).toFixed(2); out.textContent = `Stima premio garanzia: € ${premio} (demo)`; }
  [amount.input, months.input].forEach(i=>i.addEventListener('input', calc)); setTimeout(calc,0);
  const table = el('table',{class:'table'},
    el('thead',{}, el('tr',{}, el('th',{},document.createTextNode('Data')), el('th',{},document.createTextNode('Inquilino')), el('th',{},document.createTextNode('Importo')), el('th',{},document.createTextNode('Stato')) )),
    el('tbody',{}, 
      el('tr',{}, el('td',{},document.createTextNode('05/09/2025')), el('td',{},document.createTextNode('Mario Rossi')), el('td',{},document.createTextNode('€850,00')), el('td',{}, document.createTextNode('Programmato')) ),
      el('tr',{}, el('td',{},document.createTextNode('05/08/2025')), el('td',{},document.createTextNode('Mario Rossi')), el('td',{},document.createTextNode('€850,00')), el('td',{}, document.createTextNode('Pagato')) )
    )
  );
  const c = el('div',{class:'container section'},
    el('div',{class:'h2'}, document.createTextNode('Dashboard Proprietario')),
    el('div',{class:'panel'}, name.wrap, iban.wrap, amount.wrap, day.wrap, months.wrap, out, el('div',{class:'row'}, btn('Salva & Programma', ()=>{ state.l_property=name.input.value; state.l_iban=iban.input.value; state.l_amount=amount.input.value; state.l_day=day.input.value; state.l_months=months.input.value; save(); alert('Programmazione aggiornata (demo)'); }, 'btn'))),
    card('Incassi', el('div',{}, table))
  );
  return [c];
}

function tenant(){
  const tname = input('Nome e Cognome','t_name','text','Mario Rossi', state.t_name||'');
  const email = input('Email','t_email','email','mario@esempio.it', state.t_email||'');
  const pm = input('Metodo di Pagamento (demo)','t_pm','text','Carta **** 4242 o IBAN', state.t_pm||'');
  const c = el('div',{class:'container section'},
    el('div',{class:'h2'}, document.createTextNode('Area Inquilino')),
    el('div',{class:'panel'}, tname.wrap, email.wrap, pm.wrap, el('div',{class:'row'}, btn('Salva Metodo Pagamento', ()=>{ state.t_name=tname.input.value; state.t_email=email.input.value; state.t_pm=pm.input.value; save(); alert('Metodo salvato (demo)'); }, 'btn'))),
    card('Prossimo addebito', el('p',{class:'p'}, document.createTextNode('05 del mese — €850,00 → IBAN del proprietario (demo).')))
  );
  return [c];
}

render();
