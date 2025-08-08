
// Register SW
if('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(console.error);
  });
}

// Install prompt
let deferredPrompt;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});
installBtn?.addEventListener('click', async () => {
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  installBtn.hidden = true;
  deferredPrompt = null;
});

document.getElementById('year').textContent = new Date().getFullYear().toString();

// Simple SPA router
const app = document.getElementById('app');
const routes = {
  '/': welcomeView,
  '/role': roleView,
  '/landlord': landlordView,
  '/tenant': tenantOnboardingView,
  '/contract': contractUploadView,
  '/kyc': kycView,
  '/paymethod': paymentMethodView,
  '/schedule': scheduleView,
  '/success': successView,
};
function navigate(path){ history.pushState({}, '', path); render(); }
window.addEventListener('popstate', render);

const state = JSON.parse(localStorage.getItem('rentpay_state') || '{}');
function save(){ localStorage.setItem('rentpay_state', JSON.stringify(state)); }

function button(label, onclick, cls='btn'){
  const b = document.createElement('button'); b.textContent = label; b.className = cls; b.onclick = onclick; return b;
}
function inputField(id,labelTxt,type='text',placeholder='',value=''){
  const wrap = document.createElement('div'); wrap.className='grid';
  const label = document.createElement('label'); label.htmlFor=id; label.textContent=labelTxt;
  const inp = document.createElement('input'); Object.assign(inp,{id,type,placeholder,value});
  wrap.append(label, inp);
  return {wrap, inp};
}
function card(title, bodyNodes=[]){
  const c = document.createElement('section'); c.className='card';
  const h = document.createElement('h2'); h.textContent = title;
  c.append(h, ...bodyNodes);
  return c;
}

function welcomeView(){
  const c = card('Benvenuto su RentPay',[
    p('Gestione automatica dei pagamenti degli affitti con firma digitale e KYC.'),
    div(button('Inizia',()=>navigate('/role'),'btn full'))
  ]);
  return [c];
}
function roleView(){
  const c = card('Seleziona il tuo ruolo',[
    div(button('Proprietario',()=>navigate('/landlord'),'btn full')),
    div(button('Inquilino',()=>navigate('/tenant'),'btn full')),
  ]);
  return [c];
}
function landlordView(){
  const c = card('Dashboard Proprietario',[
    p('Crea/Invia contratto e monitora incassi.'),
    div(button('Crea/Carica Contratto',()=>navigate('/contract'),'btn full')),
    div(button('Imposta Pagamenti',()=>navigate('/schedule'),'btn ghost full')),
  ]);
  return [c];
}
function tenantOnboardingView(){
  const name = inputField('tname','Nome e Cognome','text','Mario Rossi',state.tname||'');
  const email = inputField('temail','Email','email','mario@esempio.it',state.temail||'');
  const c = card('Onboarding Inquilino',[
    name.wrap, email.wrap,
    p('Collega il contratto ricevuto o attendi l’invito del proprietario.'),
    div(button('Procedi a KYC',()=>{
      state.tname = name.inp.value; state.temail = email.inp.value; save();
      navigate('/kyc');
    },'btn full'))
  ]);
  return [c];
}
function contractUploadView(){
  const file = document.createElement('input'); file.type='file'; file.accept='.pdf';
  const note = p('Carica il PDF del contratto (demo: file non inviato a server).');
  const c = card('Carica Contratto',[note,file,div(button('Continua',()=>navigate('/kyc'),'btn full'))]);
  return [c];
}
function kycView(){
  const idType = inputField('idtype','Documento','text','Carta d’identità',state.idtype||'');
  const idNum = inputField('idnum','Numero Documento','text','XXXXXXX',state.idnum||'');
  const c = card('Verifica Identità (KYC)',[
    p('Placeholder KYC. In produzione: integrazione Onfido/Sumsub con selfie e controllo documento.'),
    idType.wrap, idNum.wrap,
    div(button('Documento verificato (demo)',()=>{
      state.idtype=idType.inp.value; state.idnum=idNum.inp.value; save();
      navigate('/paymethod');
    },'btn full'))
  ]);
  return [c];
}
function paymentMethodView(){
  const pm = inputField('pm','Metodo di pagamento (demo)','text','Carta o IBAN',state.pm||'');
  const c = card('Metodo di Pagamento',[
    p('In produzione: Stripe Payment Element (carte) + SEPA Direct Debit (mandato).'),
    pm.wrap,
    div(button('Metodo impostato',()=>{ state.pm=pm.inp.value; save(); navigate('/schedule'); },'btn full'))
  ]);
  return [c];
}
function scheduleView(){
  const day = inputField('day','Giorno addebito','number','5',state.day||'5');
  const amount = inputField('amount','Importo EUR','number','800.00',state.amount||'800.00');
  const c = card('Programma Pagamenti Mensili',[
    day.wrap, amount.wrap,
    div(button('Conferma programmazione',()=>{ state.day=day.inp.value; state.amount=amount.inp.value; save(); navigate('/success'); },'btn full'))
  ]);
  return [c];
}
function successView(){
  const c = card('Tutto pronto!',[
    p('Gli addebiti mensili verranno creati automaticamente (demo).'),
    p('Questa è una PWA installabile. Per i pagamenti reali serve collegare Stripe/PSP sul backend.'),
    div(button('Torna alla Home',()=>navigate('/'),'btn secondary full'))
  ]);
  return [c];
}

// Helpers
function p(t){ const el=document.createElement('p'); el.textContent=t; el.className='muted'; return el; }
function div(...children){ const el=document.createElement('div'); children.forEach(c=>el.append(c)); return el; }
function render(){
  app.innerHTML='';
  const view = routes[location.pathname] || routes['/'];
  const nodes = view();
  nodes.forEach(n=>app.append(n));
}
render();
