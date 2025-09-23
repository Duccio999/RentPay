// rp-store.js  —  Mini store DEMO (localStorage)  —  GLOBAL: window.RP
(function () {
  const DB_KEY  = 'rp_demo_store_v2';
  const CUR_KEY = 'rpCurrentUser_v2';

  // ===== SEED iniziale (dati fittizi) =====
  const SEED = {
    utenti: {
      proprietari: [
        { id:'L1', role:'landlord', name:'Sara Verdi',  email:'sara.verdi@rentpay.demo',  iban:'IT85U0300203280764839234567', props:1 },
        { id:'L2', role:'landlord', name:'Marco Neri',  email:'marco.neri@rentpay.demo',  iban:'IT60X0542811101000000123456', props:3 }
      ],
      inquilini: [
        { id:'T1', role:'tenant',   name:'Luca Bianchi', email:'luca.bianchi@rentpay.demo', address:'Via Roma 12', rent:850 },
        { id:'T2', role:'tenant',   name:'Giulia Neri',  email:'giulia.neri@rentpay.demo',  address:'Via Po 8',   rent:720 }
      ]
    },
    contratti: [
      { id:'C1', landlordId:'L1', tenantId:'T1', address:'Via Roma 12', rent:850, start:'2025-06-01', months:12, status:'active' },
      { id:'C2', landlordId:'L2', tenantId:'T2', address:'Via Po 8',   rent:720, start:'2025-07-01', months:12, status:'active' },
      // esempio in attesa firma inquilino
      { id:'C3', landlordId:'L1', tenantId:'T2', address:'Via Po 8',   rent:720, start:'2025-09-01', months:12, status:'pending_tenant' }
    ],
    pagamenti: [
      { id:'P1', contractId:'C1', date:'2025-09-01', amount:850, status:'pagato' },
      { id:'P2', contractId:'C2', date:'2025-09-01', amount:720, status:'pagato' },
      { id:'P3', contractId:'C1', date:'2025-08-01', amount:850, status:'pagato' }
    ]
  };

  // ===== storage helpers =====
  function clone(x){ return JSON.parse(JSON.stringify(x)); }
  function read(){
    try{
      const raw = localStorage.getItem(DB_KEY);
      if(!raw){ localStorage.setItem(DB_KEY, JSON.stringify(SEED)); return clone(SEED); }
      return JSON.parse(raw);
    }catch{ return clone(SEED); }
  }
  function write(db){ localStorage.setItem(DB_KEY, JSON.stringify(db)); }

  // ===== API =====
  const RP = {
    users: {
      landlords(){ return read().utenti.proprietari; },
      tenants(){   return read().utenti.inquilini; }
    },
    me(){
      try{ return JSON.parse(localStorage.getItem(CUR_KEY) || 'null'); }
      catch{ return null; }
    },
    setMe(u){ localStorage.setItem(CUR_KEY, JSON.stringify(u)); },
    logout(){ localStorage.removeItem(CUR_KEY); },
    loginById(role, id){
      const db = read();
      const list = role === 'landlord' ? db.utenti.proprietari : db.utenti.inquilini;
      const u = list.find(x=>x.id===id);
      if(!u) return false;
      localStorage.setItem(CUR_KEY, JSON.stringify(u));
      return true;
    },

    contracts: {
      forLandlord(landlordId){ return read().contratti.filter(c=>c.landlordId===landlordId); },
      forTenant(tenantId){     return read().contratti.filter(c=>c.tenantId===tenantId); },
      add({landlordId, tenantId, address, rent, start, months}){
        const db = read();
        const id = 'C' + Date.now();
        db.contratti.push({
          id, landlordId, tenantId,
          address,
          rent: Number(rent),
          start: start || new Date().toISOString().slice(0,10),
          months: Number(months) || 12,
          status: 'pending_tenant'
        });
        write(db);
        return id;
      },
      signByTenant(contractId){
        const db = read();
        const c = db.contratti.find(x=>x.id===contractId);
        if(!c) return false;
        c.status = 'active';
        write(db);
        return true;
      }
    },

    payments: {
      forLandlord(landlordId){
        const db = read();
        const ids = db.contratti.filter(c=>c.landlordId===landlordId).map(c=>c.id);
        return db.pagamenti.filter(p=>ids.includes(p.contractId));
      }
    }
  };

  // ESPORTA GLOBALE
  window.RP = RP;
})();
