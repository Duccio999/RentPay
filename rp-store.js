<!-- rp-store.js -->
<script>
// ===== Mini store DEMO – persistenza su localStorage =====
const RP = (() => {
  const KEY = 'rp_demo_store';
  const CUR = 'rpCurrentUser';

  // seed iniziale
  const SEED = {
    users: {
      landlords: [
        { id:'l1', role:'landlord', name:'Sara Verdi',  email:'sara.verdi@rentpay.demo' },
        { id:'l2', role:'landlord', name:'Marco Neri',  email:'marco.neri@rentpay.demo' },
      ],
      tenants: [
        { id:'t1', role:'tenant', name:'Luca Bianchi',  email:'luca.bianchi@rentpay.demo',  address:'Via Roma 12', rent:850 },
        { id:'t2', role:'tenant', name:'Giulia Neri',  email:'giulia.neri@rentpay.demo',   address:'Via Po 8',   rent:720 },
      ]
    },
    // alcuni contratti attivi + uno in attesa firma per vedere tutto pieno
    contracts: [
      { id:'c1', landlordId:'l1', tenantId:'t1', address:'Via Roma 12', rent:850, start:'2025-06-01', months:12, status:'active' },
      { id:'c2', landlordId:'l1', tenantId:'t2', address:'Via Po 8',   rent:720, start:'2025-07-01', months:12, status:'active' },
      { id:'c3', landlordId:'l2', tenantId:'t2', address:'Via Po 8',   rent:720, start:'2025-09-01', months:12, status:'pending_tenant' }
    ],
    payments: [
      // ultimi incassi per l1
      { id:'p1', contractId:'c1', date:'2025-09-01', amount:850, status:'paid' },
      { id:'p2', contractId:'c2', date:'2025-09-01', amount:720, status:'paid' },
      { id:'p3', contractId:'c1', date:'2025-08-01', amount:850, status:'paid' },
    ]
  };

  function read(){
    const raw = localStorage.getItem(KEY);
    if(!raw){
      localStorage.setItem(KEY, JSON.stringify(SEED));
      return structuredClone(SEED);
    }
    try { return JSON.parse(raw); }
    catch{ localStorage.setItem(KEY, JSON.stringify(SEED)); return structuredClone(SEED); }
  }
  function write(db){ localStorage.setItem(KEY, JSON.stringify(db)); }

  function ensureCurrentUser(){
    let u = me();
    if(u) return u;
    const db = read();
    // default: primo proprietario (così dashboard prop non è mai vuota)
    u = db.users.landlords[0];
    localStorage.setItem(CUR, JSON.stringify(u));
    return u;
  }

  function me(){
    try { return JSON.parse(localStorage.getItem(CUR) || 'null'); }
    catch { return null; }
  }
  function setMe(user){ localStorage.setItem(CUR, JSON.stringify(user)); }

  function byId(role, id){
    const db = read();
    const list = role==='landlord' ? db.users.landlords : db.users.tenants;
    return list.find(u=>u.id===id) || null;
  }

  function listByLandlord(landlordId){
    const db = read();
    return db.contracts.filter(c=>c.landlordId===landlordId);
  }
  function listByTenant(tenantId){
    const db = read();
    return db.contracts.filter(c=>c.tenantId===tenantId);
  }

  function createContract({ landlordId, tenantId, address, rent, start, months }){
    const db = read();
    const id = 'c' + (Math.random().toString(36).slice(2,8));
    db.contracts.push({ id, landlordId, tenantId, address, rent, start, months, status:'pending_tenant' });
    write(db);
    return id;
  }

  function markSignedByTenant(contractId){
    const db = read();
    const c = db.contracts.find(x=>x.id===contractId);
    if(c){ c.status='active'; write(db); }
    return !!c;
  }

  function paymentsForLandlord(landlordId){
    const db = read();
    const cids = db.contracts.filter(c=>c.landlordId===landlordId).map(c=>c.id);
    return db.payments.filter(p=>cids.includes(p.contractId));
  }

  function userName(role, id){
    const u = byId(role, id);
    return u ? u.name : '—';
  }

  function ymd(d){ return new Date(d).toISOString().slice(0,10); }

  return {
    init: read, write, me:ensureCurrentUser, setMe,
    users:{
      landlords:()=>read().users.landlords,
      tenants:()=>read().users.tenants,
      byId
    },
    contracts:{
      listByLandlord, listByTenant, create:createContract,
      markSignedByTenant, ymd
    },
    payments:{ forLandlord: paymentsForLandlord },
    util:{ userName }
  };
})();
</script>
