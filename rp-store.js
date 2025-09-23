// ===== Mini store DEMO — persistenza su localStorage =====
const RP = (() => {
  const DB_KEY  = 'rp_demo_store';
  const CUR_KEY = 'rpCurrentUser';

  // SEED con campi completi
  const SEED = {
    users: {
      landlords: [
        { id:'l1', role:'landlord', name:'Sara Verdi',  email:'sara.verdi@rentpay.demo',  iban:'IT85U0300203280764839234567', props:1 },
        { id:'l2', role:'landlord', name:'Marco Neri',  email:'marco.neri@rentpay.demo',  iban:'IT60X0542811101000000123456', props:3 },
      ],
      tenants: [
        { id:'t1', role:'tenant', name:'Luca Bianchi',  email:'luca.bianchi@rentpay.demo',  address:'Via Roma 12', rent:850 },
        { id:'t2', role:'tenant', name:'Giulia Neri',   email:'giulia.neri@rentpay.demo',   address:'Via Po 8',   rent:720  },
      ]
    },
    contracts: [
      { id:'c1', landlordId:'l1', tenantId:'t1', address:'Via Roma 12', rent:850, start:'2025-06-01', months:12, status:'active' },
      { id:'c2', landlordId:'l1', tenantId:'t2', address:'Via Po 8',   rent:720, start:'2025-07-01', months:12, status:'active' },
      { id:'c3', landlordId:'l2', tenantId:'t2', address:'Via Po 8',   rent:720, start:'2025-09-01', months:12, status:'pending_tenant' }
    ],
    payments: [
      { id:'p1', contractId:'c1', date:'2025-09-01', amount:850, status:'paid' },
      { id:'p2', contractId:'c2', date:'2025-09-01', amount:720, status:'paid' },
      { id:'p3', contractId:'c1', date:'2025-08-01', amount:850, status:'paid' },
    ]
  };

  // --- storage helpers
  function read(){
    const raw = localStorage.getItem(DB_KEY);
    if(!raw){
      localStorage.setItem(DB_KEY, JSON.stringify(SEED));
      return structuredClone(SEED);
    }
    try { return JSON.parse(raw); }
    catch{
      localStorage.setItem(DB_KEY, JSON.stringify(SEED));
      return structuredClone(SEED);
    }
  }
  function write(db){ localStorage.setItem(DB_KEY, JSON.stringify(db)); }

  // --- current user
  function me(){
    try { return JSON.parse(localStorage.getItem(CUR_KEY) || 'null'); }
    catch { return null; }
  }
  function setMe(user){ localStorage.setItem(CUR_KEY, JSON.stringify(user)); }

  // login da login.html
  function loginById(role, id){
    const list = role==='landlord' ? users.landlords() : users.tenants();
    const u = list.find(x=>x.id===id);
    if(!u) return false;
    setMe(u);
    return true;
  }

  // --- users
  const users = {
    landlords: () => read().users.landlords,
    tenants:   () => read().users.tenants,
    byId: (role, id) => {
      const list = role==='landlord' ? read().users.landlords : read().users.tenants;
      return list.find(u=>u.id===id) || null;
    }
  };

  // --- contracts
  const contracts = {
    listByLandlord: (landlordId) => read().contracts.filter(c=>c.landlordId===landlordId),
    listByTenant:   (tenantId)   => read().contracts.filter(c=>c.tenantId===tenantId),
    create: ({landlordId, tenantId, address, rent, start, months}) => {
      const db = read();
      const id = 'c' + Math.random().toString(36).slice(2,8);
      db.contracts.push({ id, landlordId, tenantId, address, rent, start, months, status:'pending_tenant' });
      write(db);
      return id;
    },
    markSignedByTenant: (contractId) => {
      const db = read();
      const c = db.contracts.find(x=>x.id===contractId);
      if(c){ c.status='active'; write(db); return true; }
      return false;
    },
    ymd: (d) => new Date(d).toISOString().slice(0,10),
  };

  // --- payments
  const payments = {
    forLandlord: (landlordId) => {
      const db = read();
      const cids = db.contracts.filter(c=>c.landlordId===landlordId).map(c=>c.id);
      return db.payments.filter(p=>cids.includes(p.contractId));
    }
  };

  // util
  function userName(role, id){
    const u = users.byId(role, id);
    return u ? u.name : '—';
  }

  return { me, setMe, loginById, users, contracts, payments, util:{ userName } };
})();
