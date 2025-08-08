
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
  Object.entries(attrs).forEach(([k,v])=>{ if(k==='class') n.className=v; else if(k==='html') n.innerHTML=v; else n.setAttribute(k,v);});
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
        el('h1',{class:'h-title'}, document.createTextNode('Gestione Automatica dei Pagamenti degli Affitti')),
        el('p',{class:'h-sub'}, document.createTextNode('Pagamenti ricorrenti sicuri, contratti digitali, KYC e dashboard proprietario/inquilino in un’unica app.')),
        el('div',{class:'row'},
          btn('Inizia Subito',()=>navigate('/app'),'btn'),
          btn('Guarda Funzioni',()=>navigate('/features'),'btn ghost')
        ),
        el('div',{class:'kpis'},
          el('div',{class:'kpi'}, el('div',{},document.createTextNode('Tasso incasso')), el('b',{},document.createTextNode('98.7%'))),
          el('div',{class:'kpi'}, el('div',{},document.createTextNode('Tempo medio setup')), el('b',{},document.createTextNode('3 min'))),
          el('div',{class:'kpi'}, el('div',{},document.createTextNode('Commissione da')), el('b',{},document.createTextNode('1.5%'))),
        )
      ),
      card('Perché RentPay?',
        el('div',{},
          el('p',{}, document.createTextNode('Riduci i ritardi, automatizza i solleciti e incassa in automatico su IBAN.')),
          el('p',{}, document.createTextNode('Integra Stripe (carte) e SEPA SDD. Firma digitale e KYC integrati.'))
        )
      )
    )
  );
  return [c, featuresView(true), howView(true)];
}

function featuresView(embed=false){
  const inner = el('div',{class:'container section'},
    el('div',{class:'title'}, document.createTextNode('Funzioni principali')),
    el('div',{class:'grid3'},
      el('div',{class:'feature'}, el('div',{class:'icon'}, document.createTextNode('💳')), el('h3',{},document.createTextNode('Pagamenti Ricorrenti')), el('p',{class:'muted'},document.createTextNode('Addebito automatico su carta o SEPA SDD con riconciliazione.'))),
      el('div',{class:'feature'}, el('div',{class:'icon'}, document.createTextNode('📝')), el('h3',{},document.createTextNode('Contratti Digitali')), el('p',{class:'muted'},document.createTextNode('Carica il PDF o genera da template. Firma OTP/FEA.'))),
      el('div',{class:'feature'}, el('div',{class:'icon'}, document.createTextNode('🛡️')), el('h3',{},document.createTextNode('KYC & GDPR')), el('p',{class:'muted'},document.createTextNode('Verifica identità con provider esterni e gestione privacy.'))),
    )
  );
  return embed ? [inner] : [inner];
}

function howView(embed=false){
  const inner = el('div',{class:'container section'},
    el('div',{class:'title'}, document.createTextNode('Come funziona')),
    el('div',{class:'steps'},
      el('div',{class:'step'}, el('div',{class:'badge'},document.createTextNode('1')) , el('h3',{},document.createTextNode('Registrazione')), el('p',{class:'muted'},document.createTextNode('Proprietario o Inquilino si registrano e completano il profilo.'))),
      el('div',{class:'step'}, el('div',{class:'badge'},document.createTextNode('2')) , el('h3',{},document.createTextNode('Firma e KYC')), el('p',{class:'muted'},document.createTextNode('Carica documenti e firma digitale del contratto.'))),
      el('div',{class:'step'}, el('div',{class:'badge'},document.createTextNode('3')) , el('h3',{},document.createTextNode('Pagamenti')), el('p',{class:'muted'},document.createTextNode('Programma addebiti mensili automatici su carta/SEPA.'))),
    ),
    el('div',{class:'row',style:'margin-top:16px;'},
      btn('Prova la demo',()=>navigate('/app'),'btn')
    )
  );
  return embed ? [inner] : [inner];
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

  const table = el('table',{class:'table'},
    el('thead',{}, el('tr',{}, el('th',{},document.createTextNode('Data')), el('th',{},document.createTextNode('Inquilino')), el('th',{},document.createTextNode('Importo')), el('th',{},document.createTextNode('Stato')) )),
    el('tbody',{}, 
      el('tr',{}, el('td',{},document.createTextNode('05/09/2025')), el('td',{},document.createTextNode('Mario Rossi')), el('td',{},document.createTextNode('€850,00')), el('td',{}, el('span',{class:'badge'},document.createTextNode('Programmato')) )),
      el('tr',{}, el('td',{},document.createTextNode('05/08/2025')), el('td',{},document.createTextNode('Mario Rossi')), el('td',{},document.createTextNode('€850,00')), el('td',{}, el('span',{class:'badge'},document.createTextNode('Pagato')) ))
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
      name.wrap, iban.wrap, amount.wrap, day.wrap,
      el('div',{class:'row'}, btn('Salva & Programma',()=>{state.l_property=name.input.value;state.l_iban=iban.input.value;state.l_amount=amount.input.value;state.l_day=day.input.value;save();alert('Programmazione aggiornata (demo)');},'btn'))
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
    card('Prossimo addebito', el('p',{class:'muted'}, document.createTextNode('05 del mese — €850,00 → IBAN del proprietario (demo).')))
  );
  return [c];
}

function render(){ app.innerHTML=''; const view = routes[location.pathname] || routes['/']; view().forEach(n=>app.append(n)); }
render();
