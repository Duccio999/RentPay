/* rp-store.js — DEMO store (localStorage) + pagamenti simulati
   - Demo statica (GitHub Pages friendly)
   - Flusso completo: contratto -> firma -> rate -> esiti -> garanzia
*/
(function (w) {
  const DB_KEY  = 'rp_demo_store_v3';
  const CUR_KEY = 'rpCurrentUser';

  // SEED compatibile con chiavi IT/EN
  const SEED = {
    utenti: {
      proprietari: [
        { id:'L1', role:'landlord', ruolo:'proprietario', name:'Sara Verdi',  nome:'Sara Verdi',  email:'sara.verdi@rentpay.demo',  iban:'IT85U0300203280764839234567', props:1 },
        { id:'L2', role:'landlord', ruolo:'proprietario', name:'Marco Neri',  nome:'Marco Neri',  email:'marco.neri@rentpay.demo',  iban:'IT60X0542811101000000123456', props:3 }
      ],
      inquilini: [
        { id:'T1', role:'tenant', ruolo:'inquilino', name:'Luca Bianchi', nome:'Luca Bianchi', email:'luca.bianchi@rentpay.demo',  address:'Via Roma 12', indirizzo:'Via Roma 12', affitto:850, rent:850, storicoRitardi:0 },
        { id:'T2', role:'tenant', ruolo:'inquilino', name:'Giulia Neri',  nome:'Giulia Neri',  email:'giulia.neri@rentpay.demo',   address:'Via Po 8',    indirizzo:'Via Po 8',   affitto:720, rent:720, storicoRitardi:1 }
      ]
    },
    contratti: [
      { id:'C1', landlordId:'L1', tenantId:'T1', address:'Via Roma 12', rent:850, start:'2025-06-01', months:12, status:'active', pdfUrl:'contratto_locazione.pdf', signed:{ landlord:true, tenant:true } },
      { id:'C2', landlordId:'L2', tenantId:'T2', address:'Via Po 8',   rent:720, start:'2025-07-01', months:12, status:'active', pdfUrl:'contratto_locazione.pdf', signed:{ landlord:true, tenant:true } },
      { id:'C3', landlordId:'L1', tenantId:'T2', address:'Via Po 8',   rent:720, start:'2025-09-01', months:12, status:'pending_tenant', pdfUrl:'contratto_locazione.pdf', signed:{ landlord:true, tenant:false } }
    ],
    // rate future + stati
    rate: [
      { id:'R1', contractId:'C1', dueDate:'2025-10-01', amount:850, status:'scheduled' },
      { id:'R2', contractId:'C1', dueDate:'2025-09-01', amount:850, status:'paid' },
      { id:'R3', contractId:'C2', dueDate:'2025-10-01', amount:720, status:'scheduled' },
      { id:'R4', contractId:'C2', dueDate:'2025-09-01', amount:720, status:'paid' }
    ],
    // storico pagamenti (solo eventi 'paid' / 'failed')
    pagamenti: [
      { id:'P1', contractId:'C1', date:'2025-09-01', amount:850, status:'paid' },
      { id:'P2', contractId:'C2', date:'2025-09-01', amount:720, status:'paid' },
      { id:'P3', contractId:'C1', date:'2025-08-01', amount:850, status:'paid' }
    ],
    // eventi legati a mancati incassi / garanzia
    eventi: [
      // { id:'E1', type:'payment_failed', contractId:'C1', date:'2025-10-01', note:'Addebito fallito (demo)' }
    ]
  };

  // ===== Utils =====
  function clone(x){ return (typeof structuredClone === 'function') ? structuredClone(x) : JSON.parse(JSON.stringify(x)); }
  function _write(db){ localStorage.setItem(DB_KEY, JSON.stringify(db)); }
  function _readRaw(){ return localStorage.getItem(DB_KEY); }

  function _normalize(db){
    // migrazione/compat: assicura chiavi base
    db = db || {};
    db.utenti = db.utenti || { proprietari: [], inquilini: [] };
    db.utenti.proprietari = Array.isArray(db.utenti.proprietari) ? db.utenti.proprietari : [];
    db.utenti.inquilini = Array.isArray(db.utenti.inquilini) ? db.utenti.inquilini : [];
    db.contratti = Array.isArray(db.contratti) ? db.contratti : [];

    // compat vecchie chiavi
    db.pagamenti = Array.isArray(db.pagamenti) ? db.pagamenti : [];
    db.rate = Array.isArray(db.rate) ? db.rate : [];
    db.eventi = Array.isArray(db.eventi) ? db.eventi : [];

    // assicura campi contratti
    db.contratti.forEach(c => {
      c.status = c.status || c.stato;
      c.address = c.address || c.indirizzo;
      c.rent = (c.rent != null) ? c.rent : (c.affitto != null ? c.affitto : 0);
      c.start = c.start || c.dataInizio;
      c.months = (c.months != null) ? c.months : 12;
      c.pdfUrl = c.pdfUrl || 'contratto_locazione.pdf';
      c.signed = c.signed || { landlord: (c.status==='active'), tenant: (c.status==='active') };
    });

    // auto-genera rate future se mancano
    ensureRates(db);

    return db;
  }

  function reset(){ const db = clone(SEED); _write(db); return db; }

  function read(){
    try{
      const raw = _readRaw();
      if(!raw) return reset();
      const parsed = JSON.parse(raw);
      const db = _normalize(parsed);
      _write(db); // salva eventuali migrazioni
      return db;
    }catch(e){
      return reset();
    }
  }

  function write(db){
    const norm = _normalize(db);
    _write(norm);
  }

  function me(){
    try{ return JSON.parse(localStorage.getItem(CUR_KEY) || 'null'); }catch{ return null; }
  }

  function setMe(u){ localStorage.setItem(CUR_KEY, JSON.stringify(u)); }

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

  function userById(id){
    const db = read();
    return db.utenti.proprietari.find(u=>u.id===id) || db.utenti.inquilini.find(u=>u.id===id) || null;
  }

  function contractById(id){
    const db = read();
    return db.contratti.find(c=>c.id===id) || null;
  }

  // ===== Rate generation =====
  function iso(d){
    const y=d.getFullYear();
    const m=String(d.getMonth()+1).padStart(2,'0');
    const dd=String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${dd}`;
  }

  function addMonths(date, n){
    const d = new Date(date.getTime());
    const day = d.getDate();
    d.setMonth(d.getMonth()+n);
    // gestisci mesi più corti
    if(d.getDate() !== day) d.setDate(0);
    return d;
  }

  function ensureRates(db){
    const now = new Date();
    const horizonMonths = 6; // per demo: prossimi 6 mesi

    const existingKey = new Set(db.rate.map(r => `${r.contractId}|${r.dueDate}`));

    db.contratti.forEach(c => {
      if((c.status||c.stato) !== 'active') return;
      if(!c.start) return;

      const start = new Date(c.start);
      const months = Number(c.months||12);
      for(let i=0; i<months; i++){
        const due = addMonths(start, i);
        const dueIso = iso(due);

        // Solo rate recenti/future (per evitare di riempire la demo)
        const monthsFromNow = (due.getFullYear()-now.getFullYear())*12 + (due.getMonth()-now.getMonth());
        if(monthsFromNow < -2) continue; // lascia un po' di storico
        if(monthsFromNow > horizonMonths) continue;

        const k = `${c.id}|${dueIso}`;
        if(existingKey.has(k)) continue;

        // Se è nel passato: di default paid (demo), altrimenti scheduled
        const status = (due < now) ? 'paid' : 'scheduled';

        db.rate.push({
          id: `R${Date.now()}_${Math.random().toString(16).slice(2,8)}`,
          contractId: c.id,
          dueDate: dueIso,
          amount: Number(c.rent||0),
          status
        });
        existingKey.add(k);

        if(status==='paid'){
          // aggiungi nello storico pagamenti se manca
          const already = db.pagamenti.some(p => (p.contractId||p.contrattoId)===c.id && (p.date||p.data)===dueIso && (p.status||p.stato)==='paid');
          if(!already){
            db.pagamenti.push({
              id: `P${Date.now()}_${Math.random().toString(16).slice(2,8)}`,
              contractId: c.id,
              date: dueIso,
              amount: Number(c.rent||0),
              status: 'paid'
            });
          }
        }
      }
    });

    // sort
    db.rate.sort((a,b)=> (a.dueDate||'').localeCompare(b.dueDate||''));
    db.pagamenti.sort((a,b)=> (b.date||'').localeCompare(a.date||''));
  }

  function ratesForContract(contractId){
    const db = read();
    return db.rate.filter(r => r.contractId===contractId);
  }

  function upcomingRatesForLandlord(landlordId, max=8){
    const db = read();
    const mine = db.contratti.filter(c=>c.landlordId===landlordId && c.status==='active').map(c=>c.id);
    const nowIso = iso(new Date());
    return db.rate
      .filter(r=> mine.includes(r.contractId) && r.dueDate >= nowIso)
      .sort((a,b)=>a.dueDate.localeCompare(b.dueDate))
      .slice(0,max);
  }

  function upcomingRatesForTenant(tenantId, max=8){
    const db = read();
    const mine = db.contratti.filter(c=>c.tenantId===tenantId && c.status==='active').map(c=>c.id);
    const nowIso = iso(new Date());
    return db.rate
      .filter(r=> mine.includes(r.contractId) && r.dueDate >= nowIso)
      .sort((a,b)=>a.dueDate.localeCompare(b.dueDate))
      .slice(0,max);
  }

  // ===== Simulazioni esito =====
  function _addEvent(db, ev){
    db.eventi.push({
      id: `E${Date.now()}_${Math.random().toString(16).slice(2,8)}`,
      ...ev
    });
  }

  function setRateStatus(rateId, newStatus){
    const db = read();
    const r = db.rate.find(x=>x.id===rateId);
    if(!r) return false;
    r.status = newStatus;

    // storico pagamenti
    const c = db.contratti.find(x=>x.id===r.contractId);
    const amount = Number(r.amount||0);
    const date = r.dueDate;

    if(newStatus==='paid'){
      db.pagamenti.unshift({
        id: `P${Date.now()}_${Math.random().toString(16).slice(2,8)}`,
        contractId: r.contractId,
        date,
        amount,
        status: 'paid'
      });
      _addEvent(db, { type:'payment_paid', contractId:r.contractId, date, note:'Pagamento completato (demo)' });
    }

    if(newStatus==='failed'){
      _addEvent(db, { type:'payment_failed', contractId:r.contractId, date, note:'Addebito fallito (demo) — avvio sollecito/garanzia' });
    }

    if(newStatus==='late'){
      _addEvent(db, { type:'payment_late', contractId:r.contractId, date, note:'Pagamento in ritardo (demo) — reminder automatico' });
    }

    write(db);
    return true;
  }

  function latestEventsForLandlord(landlordId, max=6){
    const db = read();
    const mineIds = new Set(db.contratti.filter(c=>c.landlordId===landlordId).map(c=>c.id));
    return db.eventi
      .filter(e=> mineIds.has(e.contractId))
      .sort((a,b)=> (b.date||'').localeCompare(a.date||''))
      .slice(0,max);
  }

  // ===== Firma =====
  function signAsTenant(contractId){
    const db = read();
    const c = db.contratti.find(x=>x.id===contractId);
    if(!c) return false;
    c.signed = c.signed || { landlord:false, tenant:false };
    c.signed.tenant = true;
    c.status = 'active';
    // appena attivo, genera rate
    ensureRates(db);
    write(db);
    return true;
  }

  // ===== AI demo: risk score =====
  function riskScoreForTenant(tenantId){
    const db = read();
    const t = db.utenti.inquilini.find(x=>x.id===tenantId);
    const storicoRitardi = Number(t?.storicoRitardi||0);

    const activeContractIds = db.contratti.filter(c=>c.tenantId===tenantId && c.status==='active').map(c=>c.id);
    const rates = db.rate.filter(r=>activeContractIds.includes(r.contractId));

    let score = 35 + (storicoRitardi*12);
    if(rates.some(r=>r.status==='failed')) score += 45;
    if(rates.some(r=>r.status==='late')) score += 20;

    score = Math.max(0, Math.min(100, score));
    let label = 'BASSO';
    if(score >= 70) label = 'ALTO';
    else if(score >= 50) label = 'MEDIO';

    const reasons = [];
    if(storicoRitardi>0) reasons.push(`Storico ritardi: ${storicoRitardi}`);
    if(rates.some(r=>r.status==='failed')) reasons.push('Ultime rate: 1+ fallite');
    else if(rates.some(r=>r.status==='late')) reasons.push('Ultime rate: 1+ in ritardo');
    if(reasons.length===0) reasons.push('Storico regolare');

    return { score, label, reasons };
  }

  // Public API
  w.RP = {
    read, write, reset,
    me, setMe,
    users: { landlords, tenants },
    loginById,
    userById,
    contractById,
    signAsTenant,
    ratesForContract,
    upcomingRatesForLandlord,
    upcomingRatesForTenant,
    setRateStatus,
    latestEventsForLandlord,
    riskScoreForTenant
  };
})(window);
