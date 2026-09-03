/* ==========================================================================
   FD Autoservice — één bron van waarheid
   --------------------------------------------------------------------------
   Reviewaantallen en openingstijden stonden op zes plekken los in de HTML.
   Daardoor kon de ene sectie 132 zeggen en de andere 148, en zei de
   headerbalk "Gesloten" terwijl het contactblok "Nu open" toonde.

   Hier staat het één keer. Alles op de site leest hieruit.

   AANPASSEN
   Nieuwe reviewaantallen of gewijzigde openingstijden: alleen hieronder
   wijzigen. De rest van de site volgt vanzelf, inclusief de gegevens die
   Google uitleest.
   ========================================================================== */
(function () {
  'use strict';

  var DATA = {
    reviews: {
      // Twee losse bronnen, bewust niet bij elkaar opgeteld
      marktplaats: {
        score: '5,0',
        aantal: 148,
        url: 'https://www.marktplaats.nl/u/fd-autoservice/44270263/'
      },
      google: {
        score: '5,0',
        // NOG INVULLEN. Het echte aantal Google-beoordelingen staat in
        // het Google-bedrijfsprofiel. Zolang dit null is toont de site
        // wel de score en de link, maar geen aantal. Liever geen getal
        // dan een getal dat niet klopt.
        aantal: null,
        url: 'https://www.google.com/maps/search/?api=1&query=FD+Autoservice+Westzijde+158C+Zaandam'
      }
    },

    // 0 = zondag. null = die dag dicht.
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
    adres: { straat: 'Westzijde 158C', postcode: '1506 EK', plaats: 'Zaandam' }
  };

  var DAGEN = ['Zondag','Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag'];

  function minuten(tijd) {
    var d = tijd.split(':');
    return (+d[0]) * 60 + (+d[1]);
  }

  /* Altijd in Nederlandse tijd rekenen, ook als de bezoeker
     zijn telefoon op een andere tijdzone heeft staan. */
  function nuInNederland() {
    var nu = new Date();
    try {
      return new Date(nu.toLocaleString('en-US', { timeZone: 'Europe/Amsterdam' }));
    } catch (e) {
      return nu;
    }
  }

  function status() {
    var nu = nuInNederland();
    var dag = nu.getDay();
    var nuMin = nu.getHours() * 60 + nu.getMinutes();
    var vandaag = DATA.openingstijden[dag];

    if (vandaag) {
      var o = minuten(vandaag.open), d = minuten(vandaag.dicht);
      if (nuMin >= o && nuMin < d) {
        return {
          open: true, dag: dag, dagnaam: DAGEN[dag],
          sluit: vandaag.dicht, opent: vandaag.open,
          bijnaDicht: (d - nuMin) <= 60,
          label: 'Nu open · sluit om ' + vandaag.dicht
        };
      }
      if (nuMin < o) {
        return { open: false, dag: dag, dagnaam: DAGEN[dag], opent: vandaag.open,
                 label: 'Nu gesloten · opent om ' + vandaag.open };
      }
    }

    // Dicht: zoek de eerstvolgende dag dat we open zijn
    for (var i = 1; i <= 7; i++) {
      var v = (dag + i) % 7, t = DATA.openingstijden[v];
      if (t) {
        return {
          open: false, dag: dag, dagnaam: DAGEN[dag],
          volgendeDag: DAGEN[v], volgendeOpen: t.open,
          label: 'Nu gesloten · ' + (i === 1 ? 'morgen' : DAGEN[v].toLowerCase()) + ' vanaf ' + t.open
        };
      }
    }
    return { open: false, dag: dag, dagnaam: DAGEN[dag], label: 'Nu gesloten' };
  }

  /* Openingstijden netjes gegroepeerd, bijvoorbeeld
     "Ma t/m vr 09:00 tot 18:00" en "Zaterdag 10:00 tot 17:00" */
  function tijdenRegels() {
    var kort = ['Zo','Ma','Di','Wo','Do','Vr','Za'];
    var regels = [], reeks = null;
    for (var d = 1; d <= 7; d++) {
      var dag = d % 7, t = DATA.openingstijden[dag];
      var sleutel = t ? t.open + '-' + t.dicht : 'dicht';
      if (reeks && reeks.sleutel === sleutel) {
        reeks.tot = dag;
      } else {
        if (reeks) regels.push(reeks);
        reeks = { sleutel: sleutel, van: dag, tot: dag, tijd: t };
      }
    }
    if (reeks) regels.push(reeks);

    return regels.map(function (r) {
      var naam = r.van === r.tot
        ? DAGEN[r.van]
        : kort[r.van] + ' t/m ' + kort[r.tot].toLowerCase();
      return {
        dagen: naam,
        tijd: r.tijd ? r.tijd.open + ' tot ' + r.tijd.dicht : 'gesloten',
        open: !!r.tijd
      };
    });
  }

  /* schema.org-notatie, voor de gegevens die Google uitleest */
  function schemaTijden() {
    var kort = ['Su','Mo','Tu','We','Th','Fr','Sa'];
    var uit = [];
    for (var d = 0; d < 7; d++) {
      var t = DATA.openingstijden[d];
      if (t) uit.push(kort[d] + ' ' + t.open + '-' + t.dicht);
    }
    return uit;
  }

  /* ---- Toepassen op de pagina ----
     Elementen met data-fd="..." worden hier gevuld. De HTML bevat al
     de juiste waarde, dit houdt hem alleen actueel. */
  function toepassen() {
    var st = status();

    document.querySelectorAll('[data-fd]').forEach(function (el) {
      var sleutel = el.getAttribute('data-fd');
      var v = {
        'mp-aantal':      DATA.reviews.marktplaats.aantal,
        'mp-score':       DATA.reviews.marktplaats.score,
        'google-aantal':  DATA.reviews.google.aantal,
        'google-score':   DATA.reviews.google.score,
        'tel':            DATA.telefoon.net,
        'status-label':   st.label,
        'status-kort':    st.open ? 'Open' : 'Gesloten',
        'status-dag':     st.open ? 'Vandaag' : st.dagnaam
      }[sleutel];
      if (v !== undefined) el.textContent = v;
    });

    // open/dicht-styling
    document.querySelectorAll('[data-fd-status]').forEach(function (el) {
      el.dataset.state = st.open ? 'open' : 'closed';
    });

    // Google-aantal alleen tonen als het echt bekend is
    document.querySelectorAll('[data-fd-google-aantal]').forEach(function (el) {
      el.hidden = !DATA.reviews.google.aantal;
    });

    // losse noot onder de hero-badge
    document.querySelectorAll('[data-fd="status-note"]').forEach(function (el) {
      el.innerHTML = st.open
        ? 'tot <strong>' + st.sluit + '</strong> · ' + DATA.adres.straat
        : (st.opent
            ? 'opent <strong>' + st.opent + '</strong> · ' + DATA.adres.straat
            : (st.volgendeDag || '') + ' vanaf <strong>' + (st.volgendeOpen || '') + '</strong>');
    });
  }

  window.FD = {
    data: DATA,
    status: status,
    tijdenRegels: tijdenRegels,
    schemaTijden: schemaTijden,
    toepassen: toepassen
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', toepassen);
  } else {
    toepassen();
  }
  // elke minuut bijwerken zodat de status niet verloopt op een open tabblad
  setInterval(toepassen, 60000);
})();
