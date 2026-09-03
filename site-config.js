/* ==========================================================================
   FD Autoservice — instellingen
   --------------------------------------------------------------------------
   Alles wat je zonder programmeren wilt kunnen wijzigen staat hier, en
   nergens anders. De rest van de site leest hieruit.

   Dit bestand moet als EERSTE geladen worden, vóór cookie-consent.js,
   want daar wordt het meetnummer hieruit gehaald.

       <script src="site-config.js"></script>
       <script src="cookie-consent.js"></script>

   Waarom geen .env-bestand: dit is een site van losse HTML-bestanden zonder
   bouwstap, dus er is geen moment waarop een omgevingsvariabele in de code
   terecht kan komen. Dit bestand is het dichtstbijzijnde equivalent: één
   plek, één regel wijzigen. Wil je het toch echt via de omgeving regelen,
   dan kan dat met snippet-injectie in Netlify; zie de notitie onderaan.
   ========================================================================== */
(function () {
  'use strict';

  window.FD_CONFIG = {

    /* ------------------------------------------------------------------
       METING
       Vul hier het containernummer van Google Tag Manager in, bijvoorbeeld
       'GTM-XXXXXXX'. Zolang dit leeg is wordt Tag Manager niet geladen en
       vraagt de cookiebanner ook geen toestemming voor statistieken.

       LET OP, in deze volgorde:
       1. Laat eerst de CookieHub-tag uit de GTM-container halen. Staat die
          er nog in, dan verschijnt er een tweede cookiebanner over de site.
       2. Vul daarna pas het nummer hieronder in.
       ------------------------------------------------------------------ */
    gtmId: '',

    /* ------------------------------------------------------------------
       REVIEWS
       Twee losse bronnen, bewust niet bij elkaar opgeteld. Eén getal per
       bron, overal op de site hergebruikt, ook in de gegevens die Google
       uitleest. Klopt een aantal niet meer? Alleen hier wijzigen.
       ------------------------------------------------------------------ */
    reviews: {
      marktplaats: {
        naam: 'Marktplaats',
        score: '5,0',
        aantal: 148,
        url: 'https://www.marktplaats.nl/u/fd-autoservice/44270263/'
      },
      google: {
        naam: 'Google',
        score: '5,0',
        // NOG INVULLEN. Het echte aantal staat in het Google-bedrijfsprofiel.
        // Zolang dit null is toont de site wel de score en de link, maar geen
        // aantal. Liever geen getal dan een getal dat niet klopt.
        aantal: null,
        url: 'https://www.google.com/maps/search/?api=1&query=FD+Autoservice+Westzijde+158C+Zaandam'
      }
    },

    /* ------------------------------------------------------------------
       OPENINGSTIJDEN
       0 = zondag. null = die dag dicht. Hieruit volgt de open/dicht-status
       in de header, het contactblok, de footer en het schema van Google.
       ------------------------------------------------------------------ */
    openingstijden: {
      0: null,
      1: { open: '09:00', dicht: '18:00' },
      2: { open: '09:00', dicht: '18:00' },
      3: { open: '09:00', dicht: '18:00' },
      4: { open: '09:00', dicht: '18:00' },
      5: { open: '09:00', dicht: '18:00' },
      6: { open: '10:00', dicht: '17:00' }
    },

    telefoon: { link: '+31752013142', net: '075 - 201 3142' },
    whatsapp: 'https://wa.me/31629123444',
    email: 'contact@fdautoservice.nl',
    adres: { straat: 'Westzijde 158C', postcode: '1506 EK', plaats: 'Zaandam' },
    kvk: '94702551',

    /* ------------------------------------------------------------------
       DIENSTEN
       Eén lijst, gebruikt door het dienstenblok op de homepage, de pagina
       /diensten en de footer. Voeg je een dienst toe of verandert er een
       prijs, dan verandert hij op alle drie de plekken mee.

       url  : waar de dienst naartoe linkt
       prijs: wat er bij de dienst getoond wordt, leeg laten als er geen
              vaste prijs is. Nooit zelf een prijs verzinnen.
       eigenPagina: false betekent dat er nog geen eigen pagina bestaat en
              de link voorlopig naar het afspraakformulier gaat.
       ------------------------------------------------------------------ */
    diensten: [
      { sleutel: 'apk',        label: 'APK keuring',          url: '/apk-keuring',   prijs: '€ 60',              eigenPagina: true },
      { sleutel: 'onderhoud',  label: 'Onderhoud & beurt',    url: '/onderhoud',     prijs: 'vanaf € 219',       eigenPagina: true },
      { sleutel: 'banden',     label: 'Banden vervangen',     url: '/bandenservice', prijs: '€ 30 ex btw p/st',  eigenPagina: true },
      { sleutel: 'airco',      label: 'Airco service',        url: '/airco-service', prijs: '€ 150',             eigenPagina: true },
      // Deze drie hebben nog geen eigen pagina. Ze wijzen daarom naar het
      // afspraakformulier: dat is het enige wat een bezoeker er nu mee kan.
      // Komen /diagnose, /autoreparatie en /koplampen-polijsten er wel, zet
      // dan hier de nieuwe adressen en eigenPagina op true. De homepage,
      // /diensten en de footer volgen vanzelf.
      { sleutel: 'diagnose',   label: 'Diagnose & uitlezen',  url: '/afspraak',      prijs: '€ 30 ex btw',       eigenPagina: false },
      { sleutel: 'reparatie',  label: 'Autoreparatie',        url: '/afspraak',      prijs: '',                  eigenPagina: false },
      { sleutel: 'koplampen',  label: 'Koplampen polijsten',  url: '/afspraak',      prijs: '',                  eigenPagina: false }
    ]
  };

  /* --------------------------------------------------------------------
     Wil je het meetnummer toch buiten de code houden, dan kan dat via
     Netlify: Site configuration → Build & deploy → Post processing →
     Snippet injection. Zet daar in de <head> één regel:

         <script>window.FD_GTM_ID = 'GTM-XXXXXXX';</script>

     Die wint dan van de lege waarde hierboven, en het nummer staat
     nergens in de broncode.
     -------------------------------------------------------------------- */
  if (window.FD_GTM_ID) window.FD_CONFIG.gtmId = window.FD_GTM_ID;
})();
