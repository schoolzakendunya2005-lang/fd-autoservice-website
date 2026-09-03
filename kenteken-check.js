/* ==========================================================================
   FD Autoservice — kentekencheck
   --------------------------------------------------------------------------
   Vul je kenteken in en je ziet hoelang je nog hebt tot je APK verloopt.
   De gegevens komen rechtstreeks uit de open data van de RDW. Er gaat niets
   naar onze eigen server en we slaan niets op.

   Dit bestand wordt gebruikt door de vier dienstpagina's en door de
   homepage. Het zoekt zelf de juiste velden op de pagina, dus je hoeft
   het alleen maar in te laden.

   Verwachte HTML:
     #plateForm  #plateInput  #plateLoading  #plateError
     #plateResult  #resAuto  #resDays  #resLabel  #resAdvice
   ========================================================================== */
(function () {
  'use strict';

  var form = document.getElementById('plateForm');
  if (!form) return;

  var input   = document.getElementById('plateInput');
  var laden   = document.getElementById('plateLoading');
  var fout    = document.getElementById('plateError');
  var uitslag = document.getElementById('plateResult');
  var elAuto  = document.getElementById('resAuto');
  var elDagen = document.getElementById('resDays');
  var elLabel = document.getElementById('resLabel');
  var elAdvies= document.getElementById('resAdvice');
  var knop    = form.querySelector('button[type="submit"]');

  var DAG_MS = 24 * 60 * 60 * 1000;

  function toon(el, aan) { if (el) el.style.display = aan ? 'block' : 'none'; }

  function schoon(k) {
    return (k || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  }

  function netKenteken(k) {
    // Nederlandse kentekens worden in drie groepen weergegeven
    if (k.length !== 6) return k;
    return k.replace(/(.{2})(.{2})(.{2})/, '$1-$2-$3');
  }

  function combineerMerkModel(merk, model) {
    // De RDW geeft merk en handelsbenaming apart terug, maar bij sommige
    // merken zit de merknaam al in de handelsbenaming. Zonder deze check
    // krijg je "Fiat Fiat 500".
    var m = (merk || '').trim(), mo = (model || '').trim();
    if (!m) return mo;
    if (!mo) return m;
    if (mo.toLowerCase().indexOf(m.toLowerCase()) === 0) return mo;
    return m + ' ' + mo;
  }

  function toonFout(tekst) {
    if (fout) { fout.textContent = tekst; toon(fout, true); }
    toon(uitslag, false);
  }

  function meld(gevonden) {
    // Voor de conversiemeting: hoeveel mensen gebruiken de check echt
    document.dispatchEvent(new CustomEvent('fd:kenteken', {
      detail: { dienst: window.FD_DIENST || 'onbekend', gevonden: !!gevonden }
    }));
  }

  input.addEventListener('input', function () {
    var c = schoon(input.value);
    if (c !== input.value.toUpperCase()) input.value = c;
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var kenteken = schoon(input.value);

    if (kenteken.length < 4) {
      toonFout('Vul een geldig kenteken in.');
      return;
    }

    toon(uitslag, false);
    toon(fout, false);
    toon(laden, true);
    if (knop) knop.disabled = true;

    fetch('https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=' + encodeURIComponent(kenteken))
      .then(function (r) {
        if (!r.ok) throw new Error('RDW ' + r.status);
        return r.json();
      })
      .then(function (data) {
        if (!data.length) {
          toonFout('Geen auto gevonden met dit kenteken. Controleer of je het goed hebt getypt.');
          meld(false);
          return;
        }
        toonUitslag(kenteken, data[0]);
        meld(true);
      })
      .catch(function (err) {
        console.error(err);
        toonFout('Kon de RDW even niet bereiken. Probeer het opnieuw, of bel ons op 075 - 201 3142.');
        meld(false);
      })
      .then(function () {
        toon(laden, false);
        if (knop) knop.disabled = false;
      });
  });

  function toonUitslag(kenteken, auto) {
    var naam = combineerMerkModel(auto.merk, auto.handelsbenaming) || 'Je auto';
    var bouwjaar = auto.datum_eerste_toelating
      ? auto.datum_eerste_toelating.substring(0, 4) : '';

    var verval = auto.vervaldatum_apk;   // formaat JJJJMMDD
    if (!verval || verval.length < 8) {
      elAuto.innerHTML = naam + (bouwjaar ? '<small>Bouwjaar ' + bouwjaar + '</small>' : '');
      elDagen.textContent = '';
      elLabel.textContent = 'Geen APK-datum bekend';
      elAdvies.textContent = 'De RDW heeft voor dit kenteken geen vervaldatum staan. Bel ons even, dan zoeken we het samen uit.';
      toon(uitslag, true);
      return;
    }

    var jaar = +verval.substring(0, 4),
        maand = +verval.substring(4, 6),
        dag = +verval.substring(6, 8);
    var vervalDatum = new Date(jaar, maand - 1, dag);
    var nu = new Date(); nu.setHours(0, 0, 0, 0);
    var dagen = Math.round((vervalDatum - nu) / DAG_MS);

    var dd = String(dag).padStart(2, '0'), mm = String(maand).padStart(2, '0');
    elAuto.innerHTML = naam +
      '<small>' + (bouwjaar ? bouwjaar + ' · ' : '') +
      'APK verloopt ' + dd + '-' + mm + '-' + jaar + '</small>';

    var abs = Math.abs(dagen);
    elDagen.textContent = abs.toLocaleString('nl-NL');

    if (dagen < 0) {
      elLabel.textContent = (abs === 1 ? 'dag' : 'dagen') + ' geleden verlopen';
      elAdvies.textContent = 'Je APK is verlopen. Je mag nu niet legaal de weg op en je verzekering kan bij schade moeilijk gaan doen. Bel ons, we proberen je vandaag of morgen nog te helpen.';
    } else if (dagen === 0) {
      elLabel.textContent = 'verloopt vandaag';
      elAdvies.textContent = 'Je APK verloopt vandaag. Bel ons even, dan kijken we of het vandaag nog lukt.';
    } else if (dagen <= 30) {
      elLabel.textContent = (abs === 1 ? 'dag' : 'dagen') + ' tot je APK verloopt';
      elAdvies.textContent = 'Niet te lang wachten. Plan deze week je APK, dan zit je ruim op tijd. Wij hebben doordeweeks vrijwel altijd nog plek.';
    } else if (dagen <= 60) {
      elLabel.textContent = 'dagen tot je APK verloopt';
      elAdvies.textContent = 'Goed moment om te plannen. Je mag je APK tot twee maanden van tevoren laten doen, en de nieuwe APK gaat gewoon in op je oude vervaldatum. Je raakt dus niets kwijt.';
    } else {
      var maanden = Math.round(dagen / 30);
      elLabel.textContent = 'dagen tot je APK verloopt';
      elAdvies.textContent = 'Geen haast, je hebt nog ongeveer ' + maanden + ' maanden. Vanaf twee maanden voor je vervaldatum kun je bij ons terecht zonder dat je die tijd kwijtraakt.';
    }

    toon(uitslag, true);
  }
})();
