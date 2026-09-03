/* ==========================================================================
   FD Autoservice — conversiemeting
   --------------------------------------------------------------------------
   Dit bestand telt de dingen die een klant opleveren en zet ze in de
   dataLayer, waar Tag Manager ze oppikt:

     afspraak_aangevraagd   iemand heeft het afspraakformulier verstuurd
     bel_geklikt            iemand heeft op een telefoonnummer geklikt
     whatsapp_geklikt       iemand heeft op een WhatsApp-knop geklikt
     kenteken_gecheckt      iemand heeft zijn kenteken ingevuld

   Deze events worden ALTIJD in de dataLayer gezet, ook als Tag Manager
   uit staat. Ze blijven daar netjes wachten. Zodra het GTM-nummer in
   cookie-consent.js wordt ingevuld, worden ze alsnog verwerkt.

   BELMETING
   Een klik op een telefoonnummer is geen gesprek. Iemand kan misklikken
   en meteen ophangen. Daarom sturen we bij bel_geklikt de tijd mee die
   de bezoeker op de pagina was. In Tag Manager kun je daarmee de korte
   misklikken eruit filteren, zodat je niet elke misklik als klant telt.

   AANZETTEN
   Er hoeft aan dit bestand niets te veranderen. Zie cookie-consent.js,
   regel met  var GTM_ID = '';  vul daar het containernummer in.
   Let op: laat RBNYDZ eerst de CookieHub-tag uit die container halen,
   anders verschijnt er een tweede cookiebanner over de site heen.
   ========================================================================== */
(function () {
  'use strict';

  window.dataLayer = window.dataLayer || [];
  var start = Date.now();

  function meld(naam, extra) {
    var data = { event: naam, pagina: location.pathname };
    if (extra) for (var k in extra) if (extra.hasOwnProperty(k)) data[k] = extra[k];
    window.dataLayer.push(data);
  }
  // Ook bruikbaar vanuit de pagina zelf
  window.fdMeld = meld;

  function secondenOpPagina() {
    return Math.round((Date.now() - start) / 1000);
  }

  /* ---- Bellen en WhatsApp ---- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a') : null;
    if (!a || !a.getAttribute) return;
    var href = a.getAttribute('href') || '';

    if (href.indexOf('tel:') === 0) {
      meld('bel_geklikt', {
        nummer: href.replace('tel:', ''),
        seconden_op_pagina: secondenOpPagina(),
        // Handig als filter in Tag Manager: onder de 5 seconden is
        // vrijwel altijd een misklik, geen serieuze belpoging.
        waarschijnlijk_misklik: secondenOpPagina() < 5
      });
    } else if (href.indexOf('wa.me') > -1 || href.indexOf('api.whatsapp.com') > -1) {
      meld('whatsapp_geklikt', { seconden_op_pagina: secondenOpPagina() });
    } else if (href.indexOf('mailto:') === 0) {
      meld('mail_geklikt', { seconden_op_pagina: secondenOpPagina() });
    }
  }, true);

  /* ---- Kentekencheck ---- */
  document.addEventListener('fd:kenteken', function (e) {
    meld('kenteken_gecheckt', {
      dienst: (e.detail && e.detail.dienst) || 'onbekend',
      gevonden: !!(e.detail && e.detail.gevonden)
    });
  });

  /* ---- Afspraak verstuurd ----
     Twee routes: de pagina vuurt zelf fd:afspraak af, of de bezoeker
     belandt op de bedanktpagina (bijvoorbeeld zonder JavaScript). */
  document.addEventListener('fd:afspraak', function (e) {
    meld('afspraak_aangevraagd', e.detail || {});
  });

  if (/\/bedankt/.test(location.pathname)) {
    /* Eén keer per aanvraag. Wie de bedanktpagina ververst of via de
       terugknop terugkomt, telt niet opnieuw mee. */
    var alGeteld = false;
    try {
      alGeteld = !!sessionStorage.getItem('fd_afspraak_geteld');
      if (!alGeteld) sessionStorage.setItem('fd_afspraak_geteld', String(Date.now()));
    } catch (e) {
      /* Geen sessieopslag: dan liever één keer te veel tellen dan de
         conversie helemaal missen. */
    }
    if (!alGeteld) meld('afspraak_aangevraagd', { via: 'bedanktpagina' });
  }
})();
