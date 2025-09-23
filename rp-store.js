// ====== RentPay Demo Store (localStorage) ======
(function (w){
  const KEY = 'rpStore_v1';
  const SEED = {
    users: {
      landlords: [
        { id:'l1', name:'Mario Rossi', email:'mario.rossi@rentpay.demo',  iban:'IT60X0542811101000000123456' },
        { id:'l2', name:'Sara Verdi',  email:'sara.verdi@rentpay.demo',   iban:'IT85U0300203280764839234567' }
      ],
      tenants: [
        { id:'t1', name:'Luca Bianchi',  email:'luca.bianchi@rentpay.demo', address:'Via Roma 12, Milano',  rent:850 },
        { id:'t2', name:'Giulia Neri',   email:'giulia.neri@rentpay.demo',  address:'Via Po 8, Torino',     rent:720 }
      ]
    },
    // status: pending_tenant | active
    contracts: []
  };

  const RP = {
    _load(){ try{ return JSON.parse(localStorage.getItem(KEY)) || SEED; }catch{ return SEED; } },
    _save(d){ localStorage.setItem(KEY, JSON.stringify(d)); },

    get(){ return this._load(); },
    reset(){ this._save(SEED); },

    me(){ try{ return JSON.parse(localStorage.getItem('rpCurrentUser')) || null; }catch{ return null; } },
    setMe(u){ localStorage.setItem('rpCurrentUser', JSON.stringify(u)); },

    landlords(){ return this.get().users.landlords; },
    tenants(){ return this.get().users.tenants; },
    userById(id){
      const d=this.get();
      return d.users.landlords.find(u=>u.id===id) || d.users.tenants.find(u=>u.id===id) || null;
    },

    listContracts(filter={}){
      const all = this.get().contracts;
      return all.filter(c=>{
        if(filter.landlordId && c.landlordId!==filter.landlordId) return false;
        if(filter.tenantId   && c.tenantId!==filter.tenantId)     return false;
        if(filter.status     && c.status!==filter.status)         return false;
        return true;
      });
    },

    createContract({landlordId, tenantId, address, rent, start, months}){
      const d=this.get();
      const id='c'+Date.now();
      const c = {
        id, landlordId, tenantId,
        address, rent:Number(rent), start, months:Number(months),
        status:'pending_tenant',
        createdAt:new Date().toISOString(),
        signedLandlordAt:new Date().toISOString(),
        signedTenantAt:null
      };
      d.contracts.unshift(c);
      this._save(d);
      return c;
    },

    signAsTenant(id){
      const d=this.get();
      const c=d.contracts.find(x=>x.id===id);
      if(!c) return null;
      c.status='active';
      c.signedTenantAt=new Date().toISOString();
      this._save(d);
      return c;
    },

    contractById(id){ return this.get().contracts.find(c=>c.id===id) || null; }
  };

  w.RP = RP;
})(window);
