/**
 * FD Autoservice — cookie consent + Google Consent Mode v2
 * ==========================================================================
 * Voldoet aan art. 11.7a Telecommunicatiewet + AVG:
 *  - Toestemming vooraf: Google-tags mogen niets opslaan tot de bezoeker ja zegt
 *  - Weigeren is net zo makkelijk als accepteren (gelijkwaardige knoppen)
 *  - Geen cookiewall: de site blijft volledig bruikbaar bij weigeren
 *  - Geen vooraf aangevinkte vakjes
 *  - Keuze altijd intrekbaar via "Cookievoorkeuren" onderaan elke pagina
 *
 * Google Consent Mode v2 (sinds maart 2024 verplicht voor Ads in de EER):
 *  We zetten alle consent-signalen standaard op "denied". Tag Manager laadt
 *  wel, maar Google-tags slaan dan niets op het apparaat op — ze sturen
 *  alleen cookieloze pings. Daardoor kan Google Ads nog wel geschatte
 *  conversies modelleren zonder dat er cookies worden geplaatst.
 *  Zodra de bezoeker toestemming geeft, sturen we een consent-update.
 *
 * Wil je GTM helemaal uitzetten? Zet GTM_ID hieronder op een lege string.
 * ==========================================================================
 */
(function () {
  'use strict';

  /* ---------- Configuratie ----------
   *
   * GTM_ID staat nu LEEG en dat is bewust.
   *
   * De container GTM-TSKBT6GV (beheerd door RBNYDZ) bevat een CookieHub-tag:
   * een eigen, Engelstalige cookiebanner. Zodra we GTM laadden verscheen die
   * banner náást deze banner — twee consent-mechanismen tegelijk. Dat is
   * verwarrend voor bezoekers en juridisch rommelig, want er ontstaan twee
   * losse toestemmingsadministraties die elkaar tegenspreken.
   *
   * ZO ZET JE HET AAN:
   *  1. Laat RBNYDZ de CookieHub-tag uit container GTM-TSKBT6GV verwijderen.
   *     (Deze site regelt consent zelf, inclusief Google Consent Mode v2.)
   *  2. Laat ze de Ads-conversietag koppelen aan de custom event
   *     "afspraak_aangevraagd" en die op "respecteer consent" zetten.
   *  3. Vul hieronder de container-ID in en publiceer opnieuw.
   *
   * Alle Consent Mode-logica hieronder blijft werken zodra de ID er staat.
   */
  // Het containernummer staat in site-config.js, zodat het op één plek
  // te wijzigen is en niet tussen deze code verstopt zit.
  var GTM_ID = (window.FD_CONFIG && window.FD_CONFIG.gtmId) || '';
  var STORAGE_KEY = 'fd_cookie_consent_v2';
  var CONSENT_VERSION = 2;

  /* ======================================================================
     1. CONSENT MODE — moet vóór alles gebeuren
     ====================================================================== */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  function readConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (parsed.version !== CONSENT_VERSION) return null;
      return parsed;
    } catch (e) { return null; }
  }

  var saved = readConsent();

  // Standaard: alles geweigerd. Dit moet gebeuren vóórdat GTM laadt.
  gtag('consent', 'default', {
    ad_storage:             'denied',
    ad_user_data:           'denied',
    ad_personalization:     'denied',
    analytics_storage:      'denied',
    functionality_storage:  'granted', // strikt noodzakelijk, geen toestemming vereist
    security_storage:       'granted', // beveiliging/fraudepreventie
    wait_for_update:        500        // ms wachten op onze update bij terugkerende bezoekers
  });

  // Terugkerende bezoeker met een eerdere keuze? Direct doorgeven.
  if (saved) pushConsentUpdate(saved);

  function pushConsentUpdate(c) {
    gtag('consent', 'update', {
      ad_storage:         c.statistieken ? 'granted' : 'denied',
      ad_user_data:       c.statistieken ? 'granted' : 'denied',
      ad_personalization: c.statistieken ? 'granted' : 'denied',
      analytics_storage:  c.statistieken ? 'granted' : 'denied'
    });
    window.dataLayer.push({
      event: 'fd_consent_update',
      fd_consent_statistieken: !!c.statistieken,
      fd_consent_marketing: !!c.marketing
    });
  }

  /* ======================================================================
     2. TAG MANAGER LADEN
     ====================================================================== */
  function loadGTM() {
    if (!GTM_ID) return;
    if (document.getElementById('fd-gtm')) return;
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.id = 'fd-gtm';
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
    document.head.appendChild(s);
  }
  loadGTM();

  /* ======================================================================
     3. CONSENT OPSLAAN
     ====================================================================== */
  function saveConsent(prefs) {
    var payload = {
      version: CONSENT_VERSION,
      date: new Date().toISOString(),
      functioneel:  true,              // altijd aan
      statistieken: !!prefs.statistieken, // Google Ads / Tag Manager
      marketing:    !!prefs.marketing     // YouTube (de kaart is cookievrij)
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch (e) {}
    return payload;
  }

  /* ======================================================================
     4. EMBEDS ACTIVEREN (YouTube, Maps)
     ====================================================================== */
  function activateEmbeds(consent) {
    document.querySelectorAll('[data-cookie-src]').forEach(function (el) {
      var cat = el.getAttribute('data-cookie-category') || 'marketing';
      if (!consent[cat]) return;
      var src = el.getAttribute('data-cookie-src');
      if (!src || el.getAttribute('src') === src) return;
      el.setAttribute('src', src);
      el.removeAttribute('data-cookie-src');
      var ph = el.closest('[data-cookie-placeholder]');
      if (ph) ph.setAttribute('data-cookie-blocked', 'false');
    });
    document.querySelectorAll('[data-cookie-placeholder]').forEach(function (ph) {
      var cat = ph.getAttribute('data-cookie-category') || 'marketing';
      if (consent[cat]) ph.setAttribute('data-cookie-blocked', 'false');
    });
  }

  /* ======================================================================
     5. BANNER UI
     ====================================================================== */
  function injectStyles() {
    if (document.getElementById('fd-cc-styles')) return;
    var css = document.createElement('style');
    css.id = 'fd-cc-styles';
    css.textContent = [
      '.fd-cc{position:fixed;left:0;right:0;bottom:0;z-index:9999;padding:16px;',
      'display:flex;justify-content:center;pointer-events:none;',
      'animation:fdccIn .35s cubic-bezier(.2,.8,.3,1)}',
      '@keyframes fdccIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}',
      '.fd-cc-card{pointer-events:auto;max-width:760px;width:100%;max-height:88vh;overflow-y:auto;',
      'background:#FFFFFF;',
      'border:1px solid #E4E4EA;border-radius:16px;padding:24px 26px;',
      'box-shadow:0 30px 80px -20px rgba(16,16,20,.16),0 0 0 1px rgba(16,16,20,.009) inset;',
      'font-family:Inter,system-ui,-apple-system,sans-serif;color:rgba(16,16,20,.644)}',
      '@media(max-width:560px){',
      '  .fd-cc{padding:12px}',
      '  .fd-cc-card{padding:18px 18px 16px;border-radius:14px}',
      '  .fd-cc-card h2{font-size:.98rem}',
      '  .fd-cc-card p{font-size:.82rem;line-height:1.5;margin-bottom:13px}',
      '  .fd-cc-btn{min-width:0;width:100%;padding:12px 18px}',
      '  .fd-cc-actions{gap:8px}',
      '}',
      '.fd-cc-card h2{margin:0 0 8px;color:#101014;font-size:1.02rem;font-weight:800;letter-spacing:-.01em}',
      '.fd-cc-card p{margin:0 0 16px;font-size:.88rem;line-height:1.6}',
      '.fd-cc-card a{color:#D7261E;text-decoration:underline;text-underline-offset:2px}',
      '.fd-cc-actions{display:flex;gap:10px;flex-wrap:wrap}',
      '.fd-cc-btn{flex:1 1 auto;min-width:150px;padding:13px 22px;border-radius:999px;border:0;cursor:pointer;',
      'font-family:inherit;font-weight:800;font-size:.78rem;letter-spacing:.09em;text-transform:uppercase;',
      'transition:all .22s ease}',
      '.fd-cc-accept{background:#D7261E;color:#fff;box-shadow:0 12px 28px -8px rgba(215,38,30,.5)}',
      '.fd-cc-accept:hover{background:#B81B14;transform:translateY(-1px)}',
      /* Weigeren visueel gelijkwaardig — ACM-eis */
      '.fd-cc-reject{background:rgba(16,16,20,.043);color:#101014;border:1.5px solid rgba(16,16,20,.18)}',
      '.fd-cc-reject:hover{background:rgba(16,16,20,.07);border-color:rgba(16,16,20,.18);transform:translateY(-1px)}',
      '.fd-cc-settings{background:transparent;color:rgba(16,16,20,.552);flex:0 1 auto;min-width:0;',
      'text-decoration:underline;text-underline-offset:3px;letter-spacing:.04em;text-transform:none;font-weight:600;font-size:.82rem}',
      '.fd-cc-settings:hover{color:#101014}',
      '.fd-cc-detail{margin:4px 0 16px;border-top:1px solid rgba(16,16,20,.119);padding-top:8px}',
      '.fd-cc-row{display:flex;gap:14px;align-items:flex-start;padding:12px 0}',
      '.fd-cc-row + .fd-cc-row{border-top:1px solid rgba(16,16,20,.085)}',
      '.fd-cc-row .info{flex:1}',
      '.fd-cc-row .name{color:#101014;font-size:.9rem;font-weight:700;display:block;margin-bottom:3px}',
      '.fd-cc-row .desc{font-size:.8rem;line-height:1.5;color:rgba(16,16,20,.506)}',
      '.fd-cc-row .locked{font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;',
      'color:#17784A;white-space:nowrap;padding-top:2px}',
      '.fd-cc-toggle{position:relative;width:46px;height:26px;flex-shrink:0;cursor:pointer}',
      '.fd-cc-toggle input{position:absolute;opacity:0;width:0;height:0}',
      '.fd-cc-slider{position:absolute;inset:0;background:rgba(16,16,20,.07);border-radius:999px;transition:background .22s}',
      '.fd-cc-slider::before{content:"";position:absolute;width:20px;height:20px;left:3px;top:3px;',
      'background:#fff;border-radius:50%;transition:transform .22s}',
      '.fd-cc-toggle input:checked + .fd-cc-slider{background:#D7261E}',
      '.fd-cc-toggle input:checked + .fd-cc-slider::before{transform:translateX(20px)}',
      '.fd-cc-toggle input:focus-visible + .fd-cc-slider{outline:2px solid #101014;outline-offset:2px}',
      /* Geblokkeerde embed */
      '[data-cookie-placeholder][data-cookie-blocked="true"]{position:relative;display:grid;place-items:center;',
      'background:#F6F6F8;border:1px dashed #D6D6DE;border-radius:14px;min-height:220px;padding:28px;text-align:center}',
      '[data-cookie-placeholder][data-cookie-blocked="true"] > iframe{display:none}',
      '[data-cookie-placeholder][data-cookie-blocked="false"] .fd-cc-ph{display:none}',
      '.fd-cc-ph{max-width:400px;font-family:Inter,system-ui,sans-serif}',
      '.fd-cc-ph strong{display:block;color:#101014;font-size:.98rem;margin-bottom:8px;font-weight:700}',
      '.fd-cc-ph p{color:rgba(16,16,20,.506);font-size:.85rem;line-height:1.55;margin:0 0 16px}',
      '.fd-cc-ph button{padding:11px 22px;border-radius:999px;border:0;cursor:pointer;background:#D7261E;color:#fff;',
      'font-family:inherit;font-weight:800;font-size:.76rem;letter-spacing:.08em;text-transform:uppercase}',
      '.fd-cc-ph button:hover{background:#B81B14}'
    ].join('');
    document.head.appendChild(css);
  }

  function buildBanner() {
    var el = document.createElement('div');
    el.className = 'fd-cc';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-label', 'Cookie-toestemming');
    el.innerHTML = [
      '<div class="fd-cc-card">',
      '<h2>Wij gebruiken cookies</h2>',
      '<p>Functionele cookies gebruiken we altijd, die zijn nodig om de site te laten werken. ',
      (GTM_ID
        ? 'Voor het meten van bezoek en het tonen van video vragen we je toestemming. '
        : 'Alleen voor het tonen van YouTube-video vragen we je toestemming. De kaart met onze locatie laadt altijd, die plaatst geen cookies. '),
      'Weigeren kan gewoon: de site blijft volledig werken. Meer info in ons ',
      '<a href="/cookiebeleid">cookiebeleid</a> en de <a href="/privacyverklaring">privacyverklaring</a>.</p>',
      '<div class="fd-cc-detail" id="fdCcDetail" hidden>',
      '  <div class="fd-cc-row">',
      '    <div class="info"><span class="name">Functionele cookies</span>',
      '    <span class="desc">Nodig om je voorkeuren te onthouden en formulieren te laten werken. ',
      '    Hiervoor is geen toestemming vereist.</span></div>',
      '    <span class="locked">Altijd aan</span>',
      '  </div>',
      // Deze categorie tonen we alleen als er daadwerkelijk gemeten wordt.
      // Staat GTM_ID leeg, dan is er niets om toestemming voor te vragen.
      (GTM_ID ? [
      '  <div class="fd-cc-row">',
      '    <div class="info"><span class="name">Statistieken &amp; advertenties</span>',
      '    <span class="desc">Google Tag Manager en Google Ads. Hiermee zien we hoeveel mensen de site ',
      '    bezoeken en welke advertenties werken. Zonder toestemming meten we niets dat op jouw ',
      '    apparaat wordt opgeslagen.</span></div>',
      '    <label class="fd-cc-toggle"><input type="checkbox" id="fdCcStats" aria-label="Statistieken en advertenties toestaan">',
      '    <span class="fd-cc-slider"></span></label>',
      '  </div>'].join('') : ''),
      '  <div class="fd-cc-row">',
      '    <div class="info"><span class="name">Video van derden</span>',
      '    <span class="desc">YouTube. Deze partij kan cookies plaatsen en je ',
      '    IP-adres verwerken. Alleen actief als jij dat wil.</span></div>',
      '    <label class="fd-cc-toggle"><input type="checkbox" id="fdCcMarketing" aria-label="Video van derden toestaan">',
      '    <span class="fd-cc-slider"></span></label>',
      '  </div>',
      '</div>',
      '<div class="fd-cc-actions">',
      '  <button class="fd-cc-btn fd-cc-accept" id="fdCcAccept" type="button">Alles accepteren</button>',
      '  <button class="fd-cc-btn fd-cc-reject" id="fdCcReject" type="button">Alleen noodzakelijk</button>',
      '  <button class="fd-cc-btn fd-cc-settings" id="fdCcToggleDetail" type="button">Voorkeuren</button>',
      '</div>',
      '</div>'
    ].join('');
    return el;
  }

  /* De zwevende bel/WhatsApp-balk staat ook onderaan vastgeplakt.
     Bij het eerste bezoek lagen die twee over elkaar heen, juist bij
     de bezoeker die uit een advertentie komt. We meten de hoogte van
     de cookiemelding en schuiven de belbalk daar precies boven. */
  function zetBalkHoogte(banner) {
    var h = banner ? banner.getBoundingClientRect().height : 0;
    document.documentElement.style.setProperty('--fd-cc-h', Math.round(h) + 'px');
    // Op een telefoon is de melding al snel de halve hoogte van het scherm.
    // De belbalk erboven schuiven werkt dan wel, maar hij komt over de kop
    // van de pagina te liggen. Zolang de melding open staat verbergen we
    // hem daarom; bellen kan intussen via de knop in de balk bovenaan.
    document.documentElement.setAttribute('data-fd-cc-open', banner ? 'ja' : 'nee');
  }

  function showBanner() {
    if (document.querySelector('.fd-cc')) return;
    injectStyles();
    var banner = buildBanner();
    document.body.appendChild(banner);

    zetBalkHoogte(banner);
    var hermeet = function () { zetBalkHoogte(banner); };
    window.addEventListener('resize', hermeet);
    banner.__hermeet = hermeet;
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(hermeet);
      ro.observe(banner);
      banner.__ro = ro;
    }

    var detail       = banner.querySelector('#fdCcDetail');
    var toggleBtn    = banner.querySelector('#fdCcToggleDetail');
    var acceptBtn    = banner.querySelector('#fdCcAccept');
    var statsCb      = banner.querySelector('#fdCcStats');
    var marketingCb  = banner.querySelector('#fdCcMarketing');
    var detailIsOpen = false;

    toggleBtn.addEventListener('click', function () {
      detailIsOpen = !detailIsOpen;
      detail.hidden = !detailIsOpen;
      toggleBtn.textContent = detailIsOpen ? 'Verberg voorkeuren' : 'Voorkeuren';
      acceptBtn.textContent = detailIsOpen ? 'Keuze opslaan' : 'Alles accepteren';
    });

    acceptBtn.addEventListener('click', function () {
      var prefs;
      if (detailIsOpen) {
        prefs = {
          // statsCb bestaat alleen als er meting actief is
          statistieken: statsCb ? statsCb.checked : false,
          marketing: marketingCb.checked
        };
      } else {
        prefs = { statistieken: !!GTM_ID, marketing: true };
      }
      finish(prefs, banner);
    });
    banner.querySelector('#fdCcReject').addEventListener('click', function () {
      finish({ statistieken: false, marketing: false }, banner);
    });

    // Bij heropenen: toggles op de huidige keuze zetten
    var cur = readConsent();
    if (cur) {
      if (statsCb) statsCb.checked = !!cur.statistieken;
      marketingCb.checked = !!cur.marketing;
    }
  }

  function finish(prefs, banner) {
    var consent = saveConsent(prefs);
    pushConsentUpdate(consent);
    activateEmbeds(consent);
    if (banner) {
      if (banner.__ro) banner.__ro.disconnect();
      if (banner.__hermeet) window.removeEventListener('resize', banner.__hermeet);
      banner.style.transition = 'opacity .25s ease, transform .25s ease';
      banner.style.opacity = '0';
      banner.style.transform = 'translateY(16px)';
      setTimeout(function () {
        banner.remove();
        // belbalk weer op zijn normale plek
        document.documentElement.style.setProperty('--fd-cc-h', '0px');
        document.documentElement.setAttribute('data-fd-cc-open', 'nee');
      }, 260);
    }
    document.dispatchEvent(new CustomEvent('fd:consent', { detail: consent }));
  }

  /* ======================================================================
     6. PLACEHOLDERS ("Toon video")
     ====================================================================== */
  function wirePlaceholders() {
    document.querySelectorAll('[data-cookie-placeholder]').forEach(function (ph) {
      if (ph.querySelector('.fd-cc-ph')) return;
      var label = ph.getAttribute('data-cookie-label') || 'Deze inhoud';
      var box = document.createElement('div');
      box.className = 'fd-cc-ph';
      box.innerHTML = [
        '<strong>' + label + ' is geblokkeerd</strong>',
        '<p>Om dit te tonen laden we inhoud van een externe partij, die cookies kan plaatsen. ',
        'Geef toestemming om het te bekijken.</p>',
        '<button type="button">Toestaan en tonen</button>'
      ].join('');
      box.querySelector('button').addEventListener('click', function () {
        var cur = readConsent() || {};
        var consent = saveConsent({ statistieken: !!cur.statistieken, marketing: true });
        pushConsentUpdate(consent);
        activateEmbeds(consent);
        var b = document.querySelector('.fd-cc');
        if (b) b.remove();
      });
      ph.appendChild(box);
    });
  }

  /* ======================================================================
     7. PUBLIEKE API
     ====================================================================== */
  window.FDCookies = {
    get: readConsent,
    /** Heropen de banner zodat de bezoeker zijn keuze kan wijzigen. */
    open: function () {
      var existing = document.querySelector('.fd-cc');
      if (existing) existing.remove();
      showBanner();
      var d = document.getElementById('fdCcDetail');
      var t = document.getElementById('fdCcToggleDetail');
      var a = document.getElementById('fdCcAccept');
      if (d && t && a) { d.hidden = false; t.textContent = 'Verberg voorkeuren'; a.textContent = 'Keuze opslaan'; }
    },
    /** Trek toestemming volledig in. */
    revoke: function () {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      location.reload();
    }
  };

  /* ======================================================================
     8. INIT
     ====================================================================== */
  function init() {
    injectStyles();
    wirePlaceholders();
    var consent = readConsent();
    if (consent) {
      activateEmbeds(consent);
    } else {
      document.querySelectorAll('[data-cookie-placeholder]').forEach(function (ph) {
        ph.setAttribute('data-cookie-blocked', 'true');
      });
      showBanner();
    }
    document.querySelectorAll('[data-cookie-settings]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        window.FDCookies.open();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
