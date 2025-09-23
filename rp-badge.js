// rp-badge.js — Mostra badge conteggio "da firmare" per inquilino
(function () {
  if (!window.RP || !RP.me) return;
  const me = RP.me();
  if (!me || !/^t/.test(me.id)) return; // solo inquilino

  const count = (RP.listContracts({ tenantId: me.id, status: 'pending_tenant' }) || []).length;
  if (!count) return;

  // Trova i link "Firma (demo)" sia in desktop che nel drawer mobile
  const links = Array.from(document.querySelectorAll('.rp-menu-desktop a, #rpDrawer a'))
    .filter(a => {
      const href = (a.getAttribute('href') || '').replace('./', '');
      return href === 'firma.html';
    });

  // Crea badge e appendi
  links.forEach(a => {
    if (a.querySelector('.rp-badge')) return;
    const b = document.createElement('span');
    b.className = 'rp-badge';
    b.textContent = String(count);
    b.setAttribute('aria-label', `${count} contratti da firmare`);
    a.appendChild(b);
  });
})();
