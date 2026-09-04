/* ==========================================================================
   FD Autoservice — gestructureerde data en sitemap opbouwen
   --------------------------------------------------------------------------
   WAT DIT DOET
   Schrijft in elke pagina het blok met gestructureerde data dat Google
   uitleest, en maakt sitemap.xml. Alles komt uit site-config.js, dus de
   bedrijfsgegevens staan maar op één plek.

   DRAAIEN
       node bouw-schema.mjs

   Doen na elke wijziging in site-config.js, en voor het uitrollen. Het
   script wijzigt alleen wat tussen de markeringen staat:

       <!-- fd:schema -->  ...  <!-- /fd:schema -->

   De rest van de pagina blijft ongemoeid.

   WAAROM ZO
   Deze site heeft geen bouwstap; het zijn losse HTML-bestanden. Het schema
   met JavaScript in de pagina zetten zou ook kunnen, maar dan hangt het
   ervan af of Google de pagina uitvoert. Zo staat het gewoon in de HTML.
   Dit script ís de bouwstap, alleen draai je hem met de hand.

   DE VRAGEN EN ANTWOORDEN
   De FAQ wordt uit de pagina zelf gelezen (de <details>-blokken). Zo kan
   het schema niet gaan afwijken van wat de bezoeker ziet staan, en is er
   nooit sprake van verborgen FAQ-markup.
   ========================================================================== */

import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HIER = dirname(fileURLToPath(import.meta.url));
const lees = (naam) => readFileSync(join(HIER, naam), 'utf8');

/* ---------------------------------------------------------------- config */
/* site-config.js is gewoon JavaScript. We voeren het uit met een lege
   window, zodat we precies dezelfde waarden krijgen als de site. */
const window = {};
new Function('window', lees('site-config.js'))(window);
const C = window.FD_CONFIG;
if (!C) throw new Error('site-config.js gaf geen FD_CONFIG terug');

const BASIS = C.site.url.replace(/\/$/, '');
const ID_BEDRIJF = BASIS + '/#business';
const ID_SITE = BASIS + '/#website';

const DAGNAMEN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/* --------------------------------------------------------- hulpfuncties */

function ontsnap(s) {
  return String(s)
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* Dagen met dezelfde tijden worden samengevoegd, dat leest prettiger en
   Google accepteert beide vormen. */
function openingstijden() {
  const groepen = new Map();
  for (let dag = 0; dag <= 6; dag++) {
    const t = C.openingstijden[dag];
    if (!t) continue;                            // die dag dicht
    const sleutel = t.open + '-' + t.dicht;
    if (!groepen.has(sleutel)) groepen.set(sleutel, { opens: t.open, closes: t.dicht, dagen: [] });
    groepen.get(sleutel).dagen.push(DAGNAMEN[dag]);
  }
  return [...groepen.values()].map((g) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: g.dagen.length === 1 ? g.dagen[0] : g.dagen,
    opens: g.opens,
    closes: g.closes
  }));
}

/* De beoordeling gaat alleen mee als het aantal en de score kloppen met
   het profiel waar we naar linken. Verzonnen of samengetelde cijfers zijn
   een handmatige maatregel van Google waard, dus bij twijfel weglaten. */
function beoordeling() {
  const mp = C.reviews && C.reviews.marktplaats;
  if (!mp || !mp.aantal || !mp.score) return null;
  return {
    '@type': 'AggregateRating',
    ratingValue: String(mp.score).replace(',', '.'),
    reviewCount: String(mp.aantal),
    bestRating: '5',
    worstRating: '1',
    itemReviewed: { '@id': ID_BEDRIJF }
  };
}

function bedrijf() {
  const knoop = {
    '@type': ['AutoRepair', 'LocalBusiness'],
    '@id': ID_BEDRIJF,
    name: C.site.naam,
    alternateName: C.site.alternatief,
    description: C.site.beschrijving,
    url: BASIS + '/',
    telephone: C.telefoon.link,
    email: C.email,
    image: C.site.afbeelding,
    logo: C.site.afbeelding,
    priceRange: C.site.prijsklasse,
    currenciesAccepted: 'EUR',
    paymentAccepted: C.site.betaalwijzen,
    foundingDate: C.site.opgericht,
    address: {
      '@type': 'PostalAddress',
      streetAddress: C.adres.straat,
      addressLocality: C.adres.plaats,
      postalCode: C.adres.postcode,
      addressRegion: C.site.regio,
      addressCountry: C.site.land
    },
    geo: { '@type': 'GeoCoordinates', latitude: C.site.geo.breedte, longitude: C.site.geo.lengte },
    openingHoursSpecification: openingstijden(),
    areaServed: C.gebied.map((n) => ({ '@type': 'City', name: n })),
    sameAs: C.sameAs,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Diensten',
      itemListElement: C.diensten.map((d) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: d.label, serviceType: d.label },
        ...aanbodPrijs(d)
      }))
    }
  };
  const cijfer = beoordeling();
  if (cijfer) knoop.aggregateRating = cijfer;
  return knoop;
}

/* Prijzen komen uit de dienstenlijst. Staat er geen prijs, dan komt er ook
   geen prijs in het schema; niets is beter dan iets bedachts. */
function aanbodPrijs(dienst) {
  if (!dienst.prijs) return {};
  const getal = (dienst.prijs.match(/[\d.]+/) || [])[0];
  if (!getal) return {};
  const vanaf = /vanaf/i.test(dienst.prijs);
  const exBtw = /ex btw/i.test(dienst.prijs);
  const uit = { priceCurrency: 'EUR', availability: 'https://schema.org/InStock' };
  if (vanaf) {
    uit.priceSpecification = {
      '@type': 'PriceSpecification',
      minPrice: getal,
      priceCurrency: 'EUR',
      valueAddedTaxIncluded: !exBtw
    };
  } else {
    uit.price = getal;
    uit.priceSpecification = {
      '@type': 'PriceSpecification',
      price: getal,
      priceCurrency: 'EUR',
      valueAddedTaxIncluded: !exBtw
    };
  }
  return uit;
}

function website() {
  return {
    '@type': 'WebSite',
    '@id': ID_SITE,
    url: BASIS + '/',
    name: C.site.naam,
    inLanguage: 'nl-NL',
    publisher: { '@id': ID_BEDRIJF }
  };
}

function kruimelpad(route) {
  if (route.pad === '/') return null;             // de homepage is de kruimel
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASIS + '/' },
      { '@type': 'ListItem', position: 2, name: route.naam, item: BASIS + route.pad }
    ]
  };
}

function dienstKnoop(route) {
  const d = C.diensten.find((x) => x.sleutel === route.dienst);
  if (!d) return null;
  const prijs = aanbodPrijs(d);
  const knoop = {
    '@type': 'Service',
    name: `${d.label} ${C.adres.plaats}`,
    serviceType: d.label,
    description: `${d.label} bij ${C.site.naam} in ${C.adres.plaats}.`,
    provider: { '@id': ID_BEDRIJF },
    areaServed: C.gebied.map((n) => ({ '@type': 'City', name: n })),
    url: BASIS + route.pad
  };
  if (Object.keys(prijs).length) {
    knoop.offers = { '@type': 'Offer', url: BASIS + route.pad, ...prijs };
  }
  return knoop;
}

/* De vragen komen uit de pagina zelf:

       <details><summary>vraag</summary><div class="...">antwoord</div></details>

   De antwoordklasse verschilt per pagina (.d-faq-ans op de dienstpagina's,
   .ans op de homepage), dus daar kijken we niet naar; het eerste blok na
   de vraag ís het antwoord. */
function vragen(html) {
  const uit = [];
  const re = /<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>\s*<div[^>]*>([\s\S]*?)<\/div>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const vraag = ontsnap(m[1]);
    const antwoord = ontsnap(m[2]);
    if (vraag && antwoord) {
      uit.push({
        '@type': 'Question',
        name: vraag,
        acceptedAnswer: { '@type': 'Answer', text: antwoord }
      });
    }
  }
  if (!uit.length) return null;
  return { '@type': 'FAQPage', mainEntity: uit };
}

/* ------------------------------------------------------------- schrijven */

const START = '<!-- fd:schema -->';
const EIND = '<!-- /fd:schema -->';

let geschreven = 0;
let overgeslagen = [];

for (const route of C.routes) {
  if (route.schema === false) continue;

  let html;
  try {
    html = lees(route.bestand);
  } catch {
    overgeslagen.push(`${route.bestand} (bestaat niet)`);
    continue;
  }

  const knopen = [bedrijf(), website()];
  const kruimel = kruimelpad(route);
  if (kruimel) knopen.push(kruimel);
  if (route.dienst) {
    const d = dienstKnoop(route);
    if (d) knopen.push(d);
  }
  const faq = vragen(html);
  if (faq) knopen.push(faq);

  const blok =
    START + '\n' +
    '<!-- Niet met de hand wijzigen. Opgebouwd door bouw-schema.mjs uit site-config.js. -->\n' +
    '<script type="application/ld+json">\n' +
    JSON.stringify({ '@context': 'https://schema.org', '@graph': knopen }, null, 2) + '\n' +
    '</script>\n' +
    EIND;

  const i = html.indexOf(START);
  const j = html.indexOf(EIND);

  if (i !== -1 && j !== -1) {
    html = html.slice(0, i) + blok + html.slice(j + EIND.length);
  } else {
    /* Nog geen markeringen. Het bestaande handgeschreven blok vervangen,
       of anders het nieuwe blok vlak voor </head> zetten. */
    const oud = html.match(/[ \t]*<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/);
    if (oud) {
      html = html.replace(oud[0], blok + '\n');
    } else {
      html = html.replace('</head>', blok + '\n</head>');
    }
  }

  writeFileSync(join(HIER, route.bestand), html, 'utf8');
  geschreven++;
}

/* ---------------------------------------------------------------- sitemap */

const vandaag = (bestand) => {
  try {
    return statSync(join(HIER, bestand)).mtime.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
};

const regels = C.routes
  .filter((r) => r.inSitemap !== false)
  .map((r) => [
    '  <url>',
    `    <loc>${BASIS}${r.pad}</loc>`,
    `    <lastmod>${vandaag(r.bestand)}</lastmod>`,
    `    <changefreq>${r.frequentie || 'monthly'}</changefreq>`,
    `    <priority>${r.prioriteit || '0.5'}</priority>`,
    '  </url>'
  ].join('\n'))
  .join('\n');

writeFileSync(
  join(HIER, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<!-- Opgebouwd door bouw-schema.mjs uit de routes in site-config.js.\n' +
  '     Niet met de hand wijzigen: een nieuwe pagina voeg je daar toe. -->\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  regels + '\n</urlset>\n',
  'utf8'
);

console.log(`schema geschreven op ${geschreven} pagina's`);
console.log(`sitemap: ${C.routes.filter((r) => r.inSitemap !== false).length} adressen`);
if (overgeslagen.length) console.log('overgeslagen: ' + overgeslagen.join(', '));
