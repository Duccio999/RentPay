window.RP = (function(){

  // Database iniziale demo
  let db = {
    utenti: {
      proprietari: [
        {
          id: "prop1",
          ruolo: "proprietario",
          nome: "Mario Rossi",
          email: "mario.rossi@rentpay.demo"
        }
      ],
      inquilini: [
        {
          id: "inq1",
          ruolo: "inquilino",
          nome: "Giulia Neri",
          email: "giulia.neri@rentpay.demo",
          indirizzo: "Via Po 8, Torino",
          affitto: 720
        },
        {
          id: "inq2",
          ruolo: "inquilino",
          nome: "Luca Bianchi",
          email: "luca.bianchi@rentpay.demo",
          indirizzo: "Via Roma 12, Milano",
          affitto: 850
        }
      ]
    },
    contratti: []
  };

  // Persistenza locale (localStorage)
  function load(){
    try{
      const raw = localStorage.getItem("rentpay-db");
      if(raw){ db = JSON.parse(raw); }
    }catch(e){ console.warn("Errore load store",e); }
    return db;
  }
  function save(newDb){
    db = newDb;
    localStorage.setItem("rentpay-db", JSON.stringify(db));
  }

  // Funzioni demo
  function read(){ return load(); }
  function write(newDb){ save(newDb); }

  function me(){
    // Restituisce sempre il primo proprietario (login semplificato)
    return db.utenti.proprietari[0];
  }

  function loginById(role,id){
    if(role==="landlord"){
      return db.utenti.proprietari.find(u=>u.id===id);
    }else{
      return db.utenti.inquilini.find(u=>u.id===id);
    }
  }

  // inizializza db se vuoto
  load();

  return { read, write, me, loginById };
})();
