/* ==========================================================================
   FD Autoservice — occasions van Marktplaats
   --------------------------------------------------------------------------
   Haalt de actuele advertenties op via /api/marktplaats-cars. Verdwijnt een
   auto van Marktplaats, dan verdwijnt hij vanzelf van de site; komt er een
   bij, dan verschijnt hij hier. Antwoordt die API niet, dan blijft de vaste
   lijst hieronder staan zodat de sectie nooit leeg is.

   WAT HIER MIS WAS
   1. Dit bestand is ooit uit de homepage geknipt, maar SELLER_URL en
      HAND_NOTES bleven daar achter. Bij de eerste auto sloeg normalizeCar
      daardoor stuk op een ReferenceError en bleef /occasions helemaal leeg.
   2. loadListings() werd twee keer aangeroepen, dus alles werd dubbel
      opgehaald en dubbel getekend.
   3. De foto-URL's in de vaste lijst wezen naar afbeeldingen die Marktplaats
      inmiddels heeft opgeruimd. Die gaven een 404 en dus een leeg grijs vlak.
      Foto's worden nu pas getoond als ze echt geladen zijn; lukt dat niet,
      dan blijft de getekende auto staan in plaats van een gat.

   AANPASSEN
   Nieuwe auto erbij of eentje verkocht: pas FALLBACK_LISTINGS aan. Zodra de
   Marktplaats-koppeling draait is dat niet meer nodig.
   ========================================================================== */
(function () {
  'use strict';

  var SELLER_URL = 'https://www.marktplaats.nl/u/fd-autoservice/44270263/';


  /* Eigen omschrijving per auto, gekoppeld aan het Marktplaats-nummer uit de
     URL. Staat een auto hier niet bij, dan gebruiken we de tekst van de
     advertentie zelf. */
  var HAND_NOTES = {
    '2393015241': "Dak open, espresso in de hand, terrasje aan de Zaan, deze parelmoerwitte Fiat 500 doet zo'n soort zomer terugkomen. Klein, schattig, ideaal in de stad en met die wonderbaarlijke gave dat 'ie áltijd een parkeerplek vindt.",
    '2393015064': "Sportief, scherp en serieus afgesteld, deze ST-Line trapt op je heupzenuw wanneer 'ie passeert. Wij hebben recent distributieriem én turbo vervangen, plus groot onderhoud uitgevoerd. Klaar om er nog jaren tegenaan te gaan.",
    '2385758571': 'De werkpaard waar je op kunt rekenen. 130 pk, netjes afgelegde kilometers, compleet met onderhoudsboekje. L1H2, past in de meeste parkeergarages én op de meeste bouwlocaties.',
    '2396557374': 'De werkpaard waar je op kunt rekenen. 130 pk, netjes afgelegde kilometers, compleet met onderhoudsboekje. L1H2, past in de meeste parkeergarages én op de meeste bouwlocaties.'
  };

  /* Vaste lijst, gebruikt zolang de Marktplaats-koppeling niet antwoordt.

     LEEG OP 5 SEPTEMBER 2026. Hier stonden een Ford Transit, een Fiat 500
     en een Ford Fiesta. Alle drie de advertenties gaven 410 Gone: verkocht
     of verlopen. Ze stonden dus als te koop op de site terwijl ze er niet
     meer waren, en daar bellen mensen over.

     AUTO TOEVOEGEN
     Zet er een blok bij in deze vorm. Alleen titel, prijs en url zijn
     nodig; de rest maakt de kaart completer.

       {
         id: '2385758571',                    // het nummer uit de Marktplaats-URL
         title: 'Ford Transit Custom 280',
         year: 2020, km: 199568, fuel: 'Diesel', transmission: 'Handgeschakeld',
         price: 11500, priceType: 'FIXED',
         image: 'occasion-transit.jpg',       // in deze map; leeg laten mag ook
         url: 'https://www.marktplaats.nl/v/...'
       }

     Laat je image leeg, dan komt er een nette tekening in plaats van een
     kapot plaatje. Een eigen foto in deze map is beter dan een link naar
     Marktplaats: die adressen verdwijnen zodra de advertentie weg is. */
  var FALLBACK_LISTINGS = [];

  function tekst(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function normalizeCar(c) {
    var id = String(c.id || (c.url && (c.url.match(/m(\d+)-/) || [])[1]) || '');
    var isVan = /bestelauto|transit|van|vito|sprinter/i.test((c.title || '') + ' ' + (c.url || ''));
    return {
      id: id,
      title: c.title || 'Auto',
      year: c.year || '',
      km: c.km || 0,
      fuel: c.fuel || 'Benzine',
      transmission: c.transmission || 'Handgeschakeld',
      price: c.price || 0,
      priceType: c.priceType || 'FIXED',
      note: HAND_NOTES[id] || c.description || '',
      image: c.image || '',
      url: c.url || SELLER_URL,
      color: isVan ? '#E8E8ED' : '#DEDEE5',
      windowColor: '#B9B9C4',
      type: isVan ? 'van' : 'car'
    };
  }

  function fmtNum(n) { return Number(n).toLocaleString('nl-NL'); }

  function carSvg(color, windowColor) {
    return '' +
      '<svg viewBox="0 0 320 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<ellipse cx="160" cy="138" rx="140" ry="6" fill="#101014" opacity=".10"/>' +
      '<path d="M30 110 L60 70 Q80 52 110 50 L160 44 Q210 50 230 50 Q260 52 280 70 L300 110 Z" fill="' + color + '"/>' +
      '<path d="M85 70 L110 50 Q140 44 160 44 L200 44 Q220 50 235 70 L240 90 L80 90 Z" fill="' + windowColor + '"/>' +
      '<line x1="160" y1="44" x2="160" y2="90" stroke="#FFFFFF" stroke-width="1.5" opacity=".5"/>' +
      '<rect x="30" y="108" width="270" height="4" fill="#101014" opacity=".18"/>' +
      '<circle cx="90" cy="115" r="20" fill="#2B2B33"/><circle cx="90" cy="115" r="11" fill="#8A8A96"/>' +
      '<circle cx="240" cy="115" r="20" fill="#2B2B33"/><circle cx="240" cy="115" r="11" fill="#8A8A96"/>' +
      '</svg>';
  }

  function vanSvg(color, windowColor) {
    return '' +
      '<svg viewBox="0 0 320 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<ellipse cx="160" cy="138" rx="140" ry="6" fill="#101014" opacity=".10"/>' +
      '<path d="M30 112 L30 60 Q30 42 60 42 L210 42 Q230 42 248 56 L290 78 L298 112 Z" fill="' + color + '"/>' +
      '<rect x="60" y="58" width="46" height="32" rx="3" fill="' + windowColor + '"/>' +
      '<path d="M118 58 L118 90 L210 90 L210 58 Z" fill="' + windowColor + '" opacity=".75"/>' +
      '<path d="M218 58 L260 58 L275 78 L218 78 Z" fill="' + windowColor + '" opacity=".55"/>' +
      '<rect x="30" y="110" width="270" height="4" fill="#101014" opacity=".18"/>' +
      '<circle cx="90" cy="115" r="20" fill="#2B2B33"/><circle cx="90" cy="115" r="11" fill="#8A8A96"/>' +
      '<circle cx="240" cy="115" r="20" fill="#2B2B33"/><circle cx="240" cy="115" r="11" fill="#8A8A96"/>' +
      '</svg>';
  }

  /* Een foto vervangt de tekening pas als hij ook echt geladen is. Zo staat
     er nooit een leeg vlak waar een auto hoort te staan. */
  function fotosKoppelen(container) {
    container.querySelectorAll('img.listing-photo').forEach(function (img) {
      if (img.complete && img.naturalWidth > 0) {
        img.dataset.geladen = 'ja';
        return;
      }
      img.addEventListener('load', function () {
        if (img.naturalWidth > 0) img.dataset.geladen = 'ja';
        else img.remove();
      });
      img.addEventListener('error', function () { img.remove(); });
    });
  }

  function renderListings(cars) {
    var container = document.getElementById('listings');
    if (!container) return;

    if (!cars || !cars.length) {
      /* Geen auto's: dan ook geen kader met een melding. De pagina zelf
         vertelt al waar het aanbod staat, en onderaan staan de bel- en
         WhatsApp-knoppen. Een leeg vak met "er is niets" voegt daar niets
         aan toe. */
      container.innerHTML = '';
      return;
    }

    container.innerHTML = cars.map(function (c) {
      var tekening = c.type === 'van' ? vanSvg(c.color, c.windowColor) : carSvg(c.color, c.windowColor);
      var foto = c.image
        ? '<img class="listing-photo" src="' + tekst(c.image) + '" alt="' + tekst(c.title) + '" loading="lazy">'
        : '';
      var waMsg = encodeURIComponent('Hoi, ik heb een vraag over de ' + c.title);
      var prijs = (c.priceType === 'MIN_BID' || c.priceType === 'SEE_DESCRIPTION' || !c.price)
        ? 'Bieden'
        : '€ ' + fmtNum(c.price) + ',-';
      var meta = [c.year, c.km ? fmtNum(c.km) + ' km' : null, c.fuel, c.transmission].filter(Boolean);

      return '' +
        '<article class="listing reveal">' +
          '<div class="listing-img">' +
            '<span class="listing-badge"><span class="mp-dot"></span> Marktplaats</span>' +
            tekening + foto +
          '</div>' +
          '<div class="listing-body">' +
            '<h3>' + tekst(c.title) + '</h3>' +
            '<div class="listing-meta">' + meta.map(function (b) { return '<span>' + tekst(b) + '</span>'; }).join('') + '</div>' +
            (c.note ? '<p class="listing-note">' + tekst(c.note) + '</p>' : '') +
            '<div class="listing-price">' + prijs + '</div>' +
            '<div class="listing-actions">' +
              '<a class="btn-mp" href="' + tekst(c.url) + '" target="_blank" rel="noopener">Bekijk op Marktplaats</a>' +
              '<a class="btn-info" href="https://wa.me/31629123444?text=' + waMsg + '" target="_blank" rel="noopener">Vraag info</a>' +
            '</div>' +
          '</div>' +
        '</article>';
    }).join('');

    fotosKoppelen(container);

    /* De homepage laat kaarten invaren zodra ze in beeld komen. Is die
       observer er niet (zoals op /occasions), dan meteen zichtbaar maken —
       anders blijven de kaarten op opacity 0 staan. */
    container.querySelectorAll('.reveal').forEach(function (el) {
      if (window._listingObserver) window._listingObserver.observe(el);
      else el.classList.add('in');
    });
  }

  /* Eerst de vaste lijst tekenen zodat er meteen iets staat, daarna proberen
     te vervangen door de live voorraad. */
  function loadListings() {
    renderListings(FALLBACK_LISTINGS.map(normalizeCar));

    if (!window.fetch) return;
    fetch('/api/marktplaats-cars', { cache: 'default' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        if (data && Array.isArray(data.listings) && data.listings.length) {
          renderListings(data.listings.map(normalizeCar));
        }
      })
      .catch(function () {
        /* Geen live voorraad beschikbaar; de vaste lijst staat er al. */
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadListings);
  } else {
    loadListings();
  }
})();
