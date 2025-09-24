/* rp-store.js — DEMO store con versione e auto-ripristino */
(function (w) {
  const DB_KEY  = 'rp_demo_store_v2';
  const CUR_KEY = 'rpCurrentUser';

  // SEED compatibile con chiavi IT/EN
  const SEED = {
    utenti: {
      proprietari: [
        { id:'L1', role:'landlord',   ruolo:'proprietario', name:'Sara Verdi',  nome:'Sara Verdi',  email:'sara.verdi@rentpay.demo',  iban:'IT85U0300203280764839234567', props:1 },
        { id:'L2', role:'landlord',   ruolo:'proprietario', name:'Marco Neri',  nome:'Marco Neri',  email:'marco.neri@rentpay.demo',  iban:'IT60X0542811101000000123456', props:3 }
      ],
      inquilini: [
        { id:'T1', role:'tenant',     ruolo:'inquilino',    name:'Luca Bianchi', nome:'Luca Bianchi', email:'luca.bianchi@rentpay.demo',  address:'Via Roma 12', indirizzo:'Via Roma 12', affitto:850, rent:850 },
        { id:'T2', role:'tenant',     ruolo:'inquilino',    name:'Giulia Neri',  nome:'Giulia Neri',  email:'giulia.neri@rentpay.demo',   address:'Via Po 8',   indirizzo:'Via Po 8',   affitto:720, rent:720 }
      ]
    },
    contratti: [
      { id:'C1', landlordId:'L1', tenantId:'T1', address:'Via Roma 12', rent:850, start:'2025-06-01', months:12, status:'active' },
      { id:'C2', landlordId:'L2', tenantId:'T2', address:'Via Po 8',   rent:720, start:'2025-07-01', months:12, status:'active' },
      { id:'C3', landlordId:'L1', tenantId:'T2', address:'Via Po 8',   rent:720, start:'2025-09-01', months:12, status:'pending_tenant' }
    ],
    pagamenti: [
      { id:'P1', contractId:'C1', date:'2025-09-01', data:'2025-09-01', amount:850, importo:850, status:'pagato', stato:'pagato' },
      { id:'P2', contractId:'C2', date:'2025-09-01', data:'2025-09-01', amount:720, importo:720, status:'pagato', stato:'pagato' },
      { id:'P3', contractId:'C1', date:'2025-08-01', data:'2025-08-01', amount:850, importo:850, status:'pagato', stato:'pagato' }
    ]
  };

  function _write(db){ localStorage.setItem(DB_KEY, JSON.stringify(db)); }
  function _valid(db){
    return db && db.utenti && Array.isArray(db.utenti.proprietari) && Array.isArray(db.utenti.inquilini);
  }
  function reset(){ _write(SEED); return structuredClone(SEED); }
  function read(){
    try{
      const raw = localStorage.getItem(DB_KEY);
      if(!raw) return reset();
      const db = JSON.parse(raw);
      if(!_valid(db)) return reset();
      return db;
    }catch(e){
      return reset();
    }
  }
  function write(db){ if(_valid(db)) _write(db); }

  function me(){
    try{ return JSON.parse(localStorage.getItem(CUR_KEY) || 'null'); }catch{ return null; }
  }
  function setMe(u){ localStorage.setItem(CUR_KEY, JSON.stringify(u)); }

  // API
  function landlords(){ return read().utenti.proprietari; }
  function tenants(){ return read().utenti.inquilini; }
  function loginById(role, id){
    const db = read();
    const list = (role === 'landlord') ? db.utenti.proprietari : db.utenti.inquilini;
    const user = list.find(u => u.id === id);
    if(!user) return false;
    setMe(user);
    return true;
  }

  w.RP = { read, write, reset, me, setMe, users: { landlords, tenants }, loginById };
})(window);
