// ===== Mini store DEMO — persistenza su localStorage =====
const RP = (() => {
  const DB_KEY = 'rp_demo_store';
  const CUR_KEY = 'rpCurrentUser';

  // SEED con campi completi
  const SEED = {
    utenti: {
      proprietari: [
        { id:'L1', ruolo:'proprietario', nome:'Sara Verdi', email:'sara.verdi@rentpay.demo', iban:'IT85U0300203280764839234567', props:1 },
        { id:'L2', ruolo:'proprietario', nome:'Marco Neri', email:'marco.neri@rentpay.demo', iban:'IT60X0542811101000000123456', props:3 }
      ],
      inquilini: [
        { id:'T1', ruolo:'inquilino', nome:'Luca Bianchi', email:'luca.bianchi@rentpay.demo', indirizzo:'Via Roma 12', affitto:850 },
        { id:'T2', ruolo:'inquilino', nome:'Giulia Neri', email:'giulia.neri@rentpay.demo', indirizzo:'Via Po 8', affitto:720 }
      ]
    },
    contratti: [
      { id:'C1', landlordId:'L1', tenantId:'T1', address:'Via Roma 12', rent:850, start:'2025-06-01', months:12, status:'active' },
      { id:'C2', landlordId:'L2', tenantId:'T2', address:'Via Po 8', rent:720, start:'2025-07-01', months:12, status:'active' },
      { id:'C3', landlordId:'L1', tenantId:'T2', address:'Via Po 8', rent:720, start:'2025-09-01', months:12, status:'pending_tenant' }
    ],
    pagamenti: [
      { id:'P1', contractId:'C1', data:'2025-09-01', importo:850, stato:'pagato' },
      { id:'P2', contractId:'C2', data:'2025-09-01', importo:720, stato:'pagato' },
      { id:'P3', contractId:'C1', data:'2025-08-01', importo:850, stato:'pagato' }
    ]
  };

  // helpers di archiviazione
  function read(){
    const raw = localStorage.getItem(DB_KEY);
    if(!raw){
      localStorage.setItem(DB_KEY, JSON.stringify(SEED));
      return structuredClone(SEED);
    }
    return JSON.parse(raw);
  }
  function write(db){ localStorage.setItem(DB_KEY, JSON.stringify(db)); }

  // utente corrente
  function me(){
    try { return JSON.parse(localStorage.getItem(CUR_KEY) || 'null'); }
    catch { return null; }
  }
  function setMe(u){ localStorage.setItem(CUR_KEY, JSON.stringify(u)); }

  // API utenti
  function landlords(){ return read().utenti.proprietari; }
  function tenants(){ return read().utenti.inquilini; }
  function loginById(role, id){
    const db = read();
    const list = role==='landlord' ? db.utenti.proprietari : db.utenti.inquilini;
    const user = list.find(u=>u.id===id);
    if(user){ setMe(user); return true; }
    return false;
  }

  return { users:{landlords, tenants}, loginById, me, setMe, read, write };
})();
