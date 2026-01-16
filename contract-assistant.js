/* RentPay — Contract & Data Assistant (DEMO)
   Feedback “AI-like” su campi mancanti, incoerenze e correzioni suggerite.
   Rule-based (demo), ma strutturato per essere sostituito con una API reale.
*/

(function(){
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
  const IBAN_RE  = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/i;

  function euro(n){
    const x = Number(n);
    if (!isFinite(x)) return '';
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(x);
  }

  function parseISODate(iso){
    if (!iso || typeof iso !== 'string') return null;
    const d = new Date(iso + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
  }

  function toISODate(d){
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }

  function addMonths(date, months){
    const d = new Date(date.getTime());
    const day = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + months);
    const last = new Date(d.getFullYear(), d.getMonth()+1, 0).getDate();
    d.setDate(Math.min(day, last));
    return d;
  }

  function analyzeContract(payload){
    // payload atteso:
    // {
    //   address, rent, startIso, months, deposit, iban, landlordEmail, tenantEmail,
    //   endIso (opzionale), pdfFileName (opzionale)
    // }

    const missing = [];
    const issues = [];      // {level:'error'|'warn'|'info', text:string}
    const suggestions = []; // string

    const address = (payload.address || '').trim();
    const rent = Number(payload.rent);
    const months = parseInt(payload.months, 10);
    const deposit = payload.deposit === '' || payload.deposit == null ? null : Number(payload.deposit);
    const start = parseISODate(payload.startIso);
    const endUser = parseISODate(payload.endIso);

    if (!address) missing.push('Indirizzo immobile');
    if (!isFinite(rent) || rent <= 0) missing.push('Canone mensile');
    if (!start) missing.push('Data inizio');
    if (!isFinite(months) || months <= 0) missing.push('Durata (mesi)');

    // Formati
    if (payload.landlordEmail && !EMAIL_RE.test(payload.landlordEmail)){
      issues.push({ level:'warn', text:'Email proprietario: formato non valido.' });
      suggestions.push('Verifica l’email del proprietario (es. nome@dominio.it).');
    }
    if (payload.tenantEmail && !EMAIL_RE.test(payload.tenantEmail)){
      issues.push({ level:'warn', text:'Email inquilino: formato non valido.' });
      suggestions.push('Verifica l’email dell’inquilino (es. nome@dominio.it).');
    }
    if (payload.iban && !IBAN_RE.test(String(payload.iban).replace(/\s+/g,''))){
      issues.push({ level:'warn', text:'IBAN: sembra incompleto o con caratteri non validi.' });
      suggestions.push('Controlla l’IBAN (2 lettere + 2 cifre + caratteri alfanumerici).');
    }

    // Coerenza date
    if (start && isFinite(months) && months > 0){
      const endCalc = addMonths(start, months);
      // convenzione: fine contratto = stesso giorno, dopo N mesi (demo)
      const endCalcIso = toISODate(endCalc);

      // start nel futuro troppo lontano
      const now = new Date();
      const fiveYearsAhead = new Date(now.getFullYear()+5, now.getMonth(), now.getDate());
      if (start > fiveYearsAhead){
        issues.push({ level:'warn', text:'Data inizio: è molto lontana nel futuro.' });
        suggestions.push('Se è una demo/pilot, usa una data inizio più realistica per rendere credibile il flusso rate.');
      }

      if (endUser){
        const endUserIso = toISODate(endUser);
        if (endUser < start){
          issues.push({ level:'error', text:'Date incoerenti: la data fine è precedente alla data inizio.' });
          suggestions.push('Correggi la data fine oppure la data inizio.');
        } else if (endUserIso !== endCalcIso){
          issues.push({ level:'warn', text:`Durata/date: con ${months} mesi la fine prevista è ${endCalcIso}, ma hai inserito ${endUserIso}.` });
          suggestions.push('Allinea la durata (mesi) con la data fine (oppure lascia che la demo calcoli la data fine automaticamente).');
        }
      } else {
        // nessuna data fine inserita: ok, ma suggeriamo di mostrarla
        issues.push({ level:'info', text:`Data fine calcolata: ${endCalcIso} (in base a start + durata).` });
      }

      // rate troppo basse / troppo alte per demo
      if (isFinite(rent)){
        if (rent < 200) issues.push({ level:'info', text:'Canone molto basso: per la demo potresti usare importi più realistici (es. 650–1200€).' });
        if (rent > 6000) issues.push({ level:'warn', text:'Canone molto alto: verifica che sia coerente con l’immobile selezionato.' });
      }

      // Deposito
      if (deposit == null || !isFinite(deposit) || deposit <= 0){
        issues.push({ level:'info', text:'Deposito cauzionale mancante: non è obbligatorio, ma migliora la completezza del contratto.' });
        suggestions.push('Suggerimento: inserisci un deposito tipico di 2–3 mensilità (se applicabile).');
      } else if (isFinite(rent) && rent > 0){
        const ratio = deposit / rent;
        if (ratio < 1){
          issues.push({ level:'warn', text:`Deposito basso: ${euro(deposit)} è < 1 mensilità (${euro(rent)}).` });
          suggestions.push('Valuta un deposito di almeno 2 mensilità (se coerente con il contratto).');
        }
        if (ratio >= 4){
          issues.push({ level:'warn', text:`Deposito alto: ${euro(deposit)} è circa ${ratio.toFixed(1)} mensilità.` });
          suggestions.push('Verifica che il deposito non sia eccessivo rispetto al canone.');
        }
      }
    }

    // PDF
    if (!payload.pdfFileName){
      issues.push({ level:'info', text:'Nessun PDF caricato: la demo funziona anche via form.' });
      suggestions.push('Se vuoi impressionare un investitore: carica un PDF (anche finto) e mostra che l’assistente segnala campi mancanti/coerenze.');
    } else {
      issues.push({ level:'info', text:`PDF caricato: ${payload.pdfFileName}` });
    }

    // Score demo: 100 = perfetto, penalità per missing/error/warn
    let score = 100;
    score -= missing.length * 12;
    score -= issues.filter(x=>x.level==='error').length * 25;
    score -= issues.filter(x=>x.level==='warn').length * 10;
    score = Math.max(0, Math.min(100, score));

    return { missing, issues, suggestions: Array.from(new Set(suggestions)), score };
  }

  function renderResult(container, result){
    if (!container) return;

    const scoreClass = result.score >= 85 ? 'ok' : (result.score >= 60 ? 'warn' : 'bad');

    const missingHtml = result.missing.length
      ? `<ul class="ai-list">${result.missing.map(x=>`<li><span class="ai-dot bad"></span><strong>Manca:</strong> ${escapeHtml(x)}</li>`).join('')}</ul>`
      : `<p class="ai-muted">Nessun campo obbligatorio mancante.</p>`;

    const issuesHtml = result.issues.length
      ? `<ul class="ai-list">${result.issues.map(it=>{
          const cls = it.level==='error' ? 'bad' : (it.level==='warn' ? 'warn' : 'info');
          const label = it.level==='error' ? 'Errore' : (it.level==='warn' ? 'Attenzione' : 'Nota');
          return `<li><span class="ai-dot ${cls}"></span><strong>${label}:</strong> ${escapeHtml(it.text)}</li>`;
        }).join('')}</ul>`
      : `<p class="ai-muted">Nessuna incoerenza rilevata.</p>`;

    const sugHtml = result.suggestions.length
      ? `<ul class="ai-list">${result.suggestions.map(s=>`<li><span class="ai-dot ok"></span>${escapeHtml(s)}</li>`).join('')}</ul>`
      : `<p class="ai-muted">Nessun suggerimento aggiuntivo.</p>`;

    container.innerHTML = `
      <div class="ai-header">
        <div>
          <div class="ai-title">Analisi completata</div>
          <div class="ai-sub">Qualità dati (demo): <span class="ai-score ${scoreClass}">${result.score}/100</span></div>
        </div>
      </div>
      <div class="ai-grid">
        <div class="ai-panel">
          <h4>Campi mancanti</h4>
          ${missingHtml}
        </div>
        <div class="ai-panel">
          <h4>Incoerenze & note</h4>
          ${issuesHtml}
        </div>
        <div class="ai-panel">
          <h4>Suggerimenti</h4>
          ${sugHtml}
        </div>
      </div>
    `;
  }

  function escapeHtml(str){
    return String(str)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#039;');
  }

  window.RPContractAssistant = {
    analyze: analyzeContract,
    render: renderResult
  };
})();
