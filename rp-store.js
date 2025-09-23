<script>
/* ========= RP demo store (utenti, contratti, login) ========= */
(function (w){
  const KEY_USERS      = 'rp_users_v1';
  const KEY_CONTRACTS  = 'rp_contracts_v1';
  const KEY_CURRENT    = 'rp_current_user_v1';

  function get(k, d=undefined){ try{ return JSON.parse(localStorage.getItem(k)) ?? d }catch(e){ return d } }
  function set(k, v){ localStorage.setItem(k, JSON.stringify(v)) }

  // Seed iniziale (utenti + 2 contratti attivi)
  function seed(){
    if(!get(KEY_USERS)){
      set(KEY_USERS, {
        landlords: [
          { id:'l1', role:'landlord', name:'Sara Verdi',  email:'sara.verdi@rentpay.demo',  iban:'IT85U0300203280764839234567', props:1 },
          { id:'l2', role:'landlord', name:'Marco Neri',  email:'marco.neri@rentpay.demo',  iban:'IT60X0542811101000000123456', props:3 }
        ],
        tenants: [
          { id:'t1', role:'tenant', name:'Luca Bianchi',  email:'luca.bianchi@rentpay.demo',  address:'Via Roma 12', rent:850 },
          { id:'t2', role:'tenant', name:'Giulia Neri',   email:'giulia.neri@rentpay.demo',   address:'Via Po 8',   rent:720 }
        ]
      });
    }
    if(!get(KEY_CONTRACTS)){
      const users = get(KEY_USERS);
      set(KEY_CONTRACTS, [
        { id:'c1', landlordId:'l2', tenantId:'t2', address:'Via Po 8, Torino',     rent:720, start:'2025-08-01', months:12, status:'active' },
        { id:'c2', landlordId:'l1', tenantId:'t1', address:'Via Roma 12, Milano',  rent:850, start:'2025-09-01', months:12, status:'active' }
      ]);
    }
  }

  function allUsers(){ return get(KEY_USERS) }
  function listContracts(filter={}){
    const arr = get(KEY_CONTRACTS, []);
    return arr.filter(c=>{
      if(filter.landlordId && c.landlordId!==filter.landlordId) return false;
      if(filter.tenantId   && c.tenantId!==filter.tenantId)     return false;
      if(filter.status     && c.status!==filter.status)         return false;
      return true;
    });
  }
  function saveContracts(arr){ set(KEY_CONTRACTS, arr) }

  function me(){ return get(KEY_CURRENT, null) }
  function loginById(role, id){
    const u = (role==='landlord' ? allUsers().landlords : allUsers().tenants).find(x=>x.id===id);
    if(u) set(KEY_CURRENT, u);
    return !!u;
  }
  function logout(){ localStorage.removeItem(KEY_CURRENT) }

  function createContract(data){ // {landlordId,tenantId,address,rent,start,months}
    const arr = get(KEY_CONTRACTS, []);
    const id  = 'c' + Date.now();
    arr.push({ id, status:'pending_tenant', ...data });
    saveContracts(arr);
    return id;
  }
  function setStatus(id, status){
    const arr = get(KEY_CONTRACTS, []);
    const i = arr.findIndex(c=>c.id===id);
    if(i>-1){ arr[i].status = status; saveContracts(arr); return true; }
    return false;
  }

  // Utility
  function userName(id){
    const u = [...allUsers().landlords, ...allUsers().tenants].find(x=>x.id===id);
    return u?.name || '—';
  }
  function euro(n){ return new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n||0) }
  function ymd(d){ return (new Date(d)).toISOString().slice(0,10) }

  // Public
  const RP = {
    seed, me, loginById, logout,
    users: { all: allUsers, landlords: ()=>allUsers().landlords, tenants: ()=>allUsers().tenants },
    contracts: {
      list: listContracts, create: createContract, setStatus,
      name: userName, euro, ymd
    }
  };
  seed();
  w.RP = RP;
})(window);
</script>
