/* ==========================================================================
   FD Autoservice — zwevende bel- en WhatsApp-balk
   --------------------------------------------------------------------------
   Stond eerst alleen op de homepage. Wie via een advertentie op een
   dienstenpagina binnenkwam, moest vijf schermen scrollen voor een
   telefoonnummer. Deze balk zorgt dat bellen en appen overal binnen
   handbereik zijn.

   De balk schuift automatisch boven de cookiemelding als die in beeld
   staat, via de variabele --fd-cc-h die cookie-consent.js zet.

   Gebruik: <script src="contact-balk.js" defer></script>
   Op een pagina die de balk zelf al in de HTML heeft, doet dit script niets.
   ========================================================================== */
(function () {
  'use strict';

  var TEL      = '+31752013142';
  var TEL_NET  = '075 - 201 3142';
  var WHATSAPP = 'https://wa.me/31629123444';

  function stijl() {
    if (document.getElementById('fd-balk-stijl')) return;
    var s = document.createElement('style');
    s.id = 'fd-balk-stijl';
    s.textContent = [
      '.floats{',
      '  display:none;position:fixed;z-index:60;',
      '  left:18px;right:18px;',
      '  bottom:calc(18px + var(--fd-cc-h, 0px));',
      '  transition:bottom .3s cubic-bezier(.2,.8,.3,1);',
      '  justify-content:space-between;gap:12px;pointer-events:none;',
      '}',
      '.floats a{',
      '  pointer-events:auto;flex:1;',
      '  display:inline-flex;align-items:center;justify-content:center;gap:8px;',
      '  padding:14px 12px;border-radius:12px;',
      '  font-family:Inter,system-ui,-apple-system,sans-serif;',
      '  font-weight:600;font-size:.95rem;color:#101014;text-decoration:none;',
      '  box-shadow:0 12px 32px rgba(16,16,20,.098);',
      '}',
      '.floats .call{background:#FFFFFF;border:1px solid #E4E4EA}',
      '.floats .wa{background:#25D366}',
      '@media(max-width:760px){.floats{display:flex}}',
      /* Onderaan de pagina ruimte houden zodat de balk niets afdekt */
      '@media(max-width:760px){body{padding-bottom:76px}}'
    ].join('');
    document.head.appendChild(s);
  }

  function bouw() {
    if (document.querySelector('.floats')) { stijl(); return; }
    stijl();

    var wrap = document.createElement('div');
    wrap.className = 'floats';
    wrap.innerHTML =
      '<a class="call" href="tel:' + TEL + '" data-fd-bel aria-label="Bel FD Autoservice op ' + TEL_NET + '">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' +
        'Bel ons' +
      '</a>' +
      '<a class="wa" href="' + WHATSAPP + '" target="_blank" rel="noopener" data-fd-whatsapp aria-label="Stuur ons een WhatsApp-bericht">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>' +
        'WhatsApp' +
      '</a>';
    document.body.appendChild(wrap);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bouw);
  } else {
    bouw();
  }
})();
