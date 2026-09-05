/* ==========================================================================
   FD Autoservice — gedeelde header en footer
   --------------------------------------------------------------------------
   Er waren drie verschillende headers: de homepage had een volledige
   navigatie met telefoonnummer, /over-ons had een andere set items, en
   /diensten, /apk-afspraak en /onderhoud-prijzen hadden alleen een logo
   met "Terug naar home". Wie via een advertentie op zo'n pagina binnenkwam
   kon nergens heen en zag geen telefoonnummer.

   Dit bestand zet overal dezelfde header neer: logo, navigatie,
   telefoonnummer als kliklink, WhatsApp en de afspraakknop.

   Gebruik: <script src="site-header.js" defer></script>
   en zet op <body> een data-fd-pagina="diensten" om het juiste
   menu-item te markeren.

   Een pagina die al een eigen <header> heeft (de homepage) wordt met rust
   gelaten; daar wordt alleen de footer aangevuld.
   ========================================================================== */
(function () {
  'use strict';

  var TEL      = '+31752013142';
  var TEL_NET  = '075 - 201 3142';
  var WHATSAPP = 'https://wa.me/31629123444';

  var MENU = [
    { label: 'Diensten',  url: '/diensten',          sleutel: 'diensten' },
    { label: 'Prijzen',   url: '/onderhoud-prijzen', sleutel: 'prijzen' },
    { label: "Occasions", url: '/occasions',         sleutel: 'occasions' },
    { label: 'Over ons',  url: '/over-ons',          sleutel: 'over-ons' },
    { label: 'Contact',   url: '/contact',           sleutel: 'contact' }
  ];

  var TEL_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';

  function stijl() {
    if (document.getElementById('fd-header-stijl')) return;
    var s = document.createElement('style');
    s.id = 'fd-header-stijl';
    s.textContent = [
      '.fdh{position:sticky;top:0;z-index:60;background:rgba(255,255,255,.94);',
      '  backdrop-filter:blur(14px);border-bottom:1px solid rgba(16,16,20,.136);',
      '  font-family:Inter,system-ui,-apple-system,sans-serif}',
      '.fdh-in{max-width:1200px;margin:0 auto;padding:12px 24px;',
      '  display:flex;align-items:center;gap:22px}',
      '.fdh-logo{display:flex;flex-direction:column;align-items:flex-start;gap:0;color:#101014;',
      '  text-decoration:none;flex-shrink:0}',
      /* Het echte logo, in plaats van het nagetekende blokje dat hier stond.
         De naam staat al in de afbeelding, dus daarnaast alleen nog de
         plaatsnaam; die hoort erbij en staat niet in het logo. */
      '.fdh-merk{display:block;height:34px;width:auto;flex-shrink:0}',
      '.fdh-logo small{display:block;font-weight:600;font-size:.62rem;color:rgba(16,16,20,.644);',
      '  letter-spacing:.16em;text-transform:uppercase;line-height:1;padding-left:2px;margin-top:3px}',
      '@media(max-width:520px){.fdh-merk{height:28px}.fdh-logo small{display:none}}',
      '.fdh-nav{display:flex;list-style:none;gap:24px;margin:0;padding:0;flex:1;justify-content:center}',
      '.fdh-nav a{color:rgba(16,16,20,.773);font-weight:600;font-size:.76rem;',
      '  text-transform:uppercase;letter-spacing:.13em;text-decoration:none;',
      '  white-space:nowrap;padding:7px 0;position:relative;display:inline-block}',
      '.fdh-nav a:hover{color:#101014}',
      '.fdh-nav a[aria-current="page"]{color:#101014}',
      '.fdh-nav a[aria-current="page"]::after{content:"";position:absolute;left:0;right:0;',
      '  bottom:0;height:2px;background:#D7261E}',
      '.fdh-acties{display:flex;align-items:center;gap:12px;flex-shrink:0}',
      '.fdh-tel{display:inline-flex;align-items:center;gap:8px;color:#101014;font-weight:700;',
      '  font-size:.88rem;text-decoration:none;white-space:nowrap}',
      '.fdh-tel svg{width:16px;height:16px;color:#D7261E;flex-shrink:0}',
      '.fdh-tel:hover{color:#D7261E}',
      /* Maten en tekstbehandeling uit tokens.css, gelijk aan elke andere
         knop op de site. Hoogte staat vast, padding rekent zich daaromheen. */
      '.fdh-cta{display:inline-flex;align-items:center;justify-content:center;',
      '  height:var(--fd-knop-h-s,40px);padding:0 var(--fd-ruimte-5,24px);box-sizing:border-box;',
      '  border-radius:var(--fd-hoek-knop,999px);',
      '  background:#D7261E;color:#fff;font-weight:700;font-size:var(--fd-tekst-s,.875rem);',
      '  line-height:1;letter-spacing:0;text-transform:none;',
      '  text-decoration:none;white-space:nowrap;',
      '  box-shadow:0 8px 22px -8px rgba(215,38,30,.6);transition:background .2s ease}',
      '.fdh-cta:hover{background:#B81B14}',
      /* Onder 1080px verdwijnt het menu, maar het telefoonnummer blijft */
      '@media(max-width:1080px){.fdh-nav{display:none}.fdh-in{justify-content:space-between}}',
      '@media(max-width:620px){',
      '  .fdh-tel span{display:none}',
      '  .fdh-tel{width:var(--fd-knop-h-s,40px);height:var(--fd-knop-h-s,40px);justify-content:center;',
'    padding:0;background:rgba(16,16,20,.043);border-radius:var(--fd-hoek-veld,10px)}',
      '  .fdh-tel svg{width:18px;height:18px}',
      '  .fdh-in{padding:10px 16px;gap:10px}',
      '  .fdh-cta{padding:0 var(--fd-ruimte-4,16px);font-size:var(--fd-tekst-xs,.75rem)}',
      '}'
    ].join('');
    document.head.appendChild(s);
  }

  function bouwHeader() {
    // Pagina heeft al een eigen header (homepage): met rust laten
    if (document.querySelector('header')) return;

    stijl();
    var huidig = document.body.getAttribute('data-fd-pagina') || '';

    var items = MENU.map(function (m) {
      var actief = m.sleutel === huidig ? ' aria-current="page"' : '';
      return '<li><a href="' + m.url + '"' + actief + '>' + m.label + '</a></li>';
    }).join('');

    var h = document.createElement('header');
    h.className = 'fdh';
    h.innerHTML =
      '<div class="fdh-in">' +
        '<a class="fdh-logo" href="/">' +
          '<img class="fdh-merk" src="/logo-fd-autoservice.png" ' +
            'alt="FD Autoservice Zaandam" width="814" height="200">' +
          '<small>Zaandam</small>' +
        '</a>' +
        '<ul class="fdh-nav">' + items + '</ul>' +
        '<div class="fdh-acties">' +
          '<a class="fdh-tel" href="tel:' + TEL + '" aria-label="Bel ' + TEL_NET + '">' +
            TEL_SVG + '<span>' + TEL_NET + '</span>' +
          '</a>' +
          '<a class="fdh-cta" href="/afspraak">Afspraak</a>' +
        '</div>' +
      '</div>';
    document.body.insertBefore(h, document.body.firstChild);
  }

  function jaartal() {
    var jaar = new Date().getFullYear();
    document.querySelectorAll('[data-fd-jaar]').forEach(function (el) {
      el.textContent = jaar;
    });
  }

  function cookieLink() {
    // "Cookievoorkeuren" in de footer wees naar # en deed niets
    document.querySelectorAll('[data-cookie-open]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        if (window.FDCookies && window.FDCookies.open) window.FDCookies.open();
      });
    });
  }

  function start() { bouwHeader(); jaartal(); cookieLink(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
