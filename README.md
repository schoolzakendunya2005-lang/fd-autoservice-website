# FD Autoservice — website

De website van FD Autoservice, autogarage aan de Westzijde 158C in Zaandam.
Losse HTML-bestanden, geen framework, geen bouwstap. Draait op Netlify.

## Snel starten

Er valt niets te installeren. Een lokale server is wel handig, anders werken
de adressen zonder `.html` niet:

```bash
python3 -m http.server 8000
```

Daarna open je http://localhost:8000. Wil je de nette adressen (`/contact` in
plaats van `/contact.html`) ook lokaal, gebruik dan een server die daarop
terugvalt; op Netlify regelt `netlify.toml` dat.

## Waar wat staat

| Bestand | Waarvoor |
|---|---|
| `site-config.js` | **Begin hier.** Telefoonnummer, adres, openingstijden, reviews, prijzen, diensten, routes en het meetnummer. Alles wat je zonder programmeren wilt kunnen wijzigen. |
| `bouw-schema.mjs` | Schrijft de gestructureerde data in elke pagina en maakt `sitemap.xml`. Draaien na elke wijziging in `site-config.js`. |
| `tokens.css` | Ruimte, hoeken, tekstgroottes en knophoogtes. Eén schaal, geen losse waardes. |
| `knop.css` | De knop als component. Alle knoppen komen hier langs. |
| `site-data.js` | Zet de waarden uit de config in de pagina: openingstijden, status, reviewaantallen, dienstlinks. |
| `site-header.js` | Bouwt de vaste balk bovenaan op elke pagina. |
| `contact-balk.js` | De zwevende bel- en WhatsApp-balk op mobiel. |
| `cookie-consent.js` | Cookiebanner en toestemming. |
| `meting.js` | Telt bellen, WhatsApp, kentekenchecks en afspraken in de dataLayer. |
| `kenteken-check.js` | Haalt de APK-vervaldatum op bij de RDW. |
| `occasions.js` | De auto's die te koop staan. |
| `styleguide.html` | Interne pagina: alle knopvarianten met hun gemeten hoogte. Staat op `noindex`. |
| `schema-uitvoer/` | De gestructureerde data per routetype, om door de Rich Results Test te halen. |

## Iets wijzigen

**Telefoonnummer, openingstijden, adres, prijzen, reviews:** alleen in
`site-config.js`. Daarna:

```bash
node bouw-schema.mjs
```

Dat schrijft de wijziging door naar de gestructureerde data en de sitemap.
Vergeet die stap niet, anders zegt de site iets anders dan wat Google leest.

**Een nieuwe pagina:** maak het HTML-bestand, voeg hem toe aan `routes` in
`site-config.js` en draai `bouw-schema.mjs`. De sitemap en het kruimelpad
volgen vanzelf.

**Een knop:**

```html
<a class="fd-knop" data-variant="primair" data-maat="l" href="/afspraak">
  Maak een afspraak
</a>
```

`variant`: primair, secundair of stil. `maat`: s (40px), m (48px) of l (56px).
Verzin geen eigen knopklasse; de hoogte hoort uit een token te komen.

## Uitrollen

Netlify pakt de hoofdmap. `netlify.toml` regelt de doorverwijzingen van de
oude `.html`-adressen en een paar beveiligingsheaders. Draai
`node bouw-schema.mjs` vóór het uitrollen.

## Nog te doen

- Het containernummer van Google Tag Manager staat leeg in `site-config.js`.
  Laat eerst de CookieHub-tag uit die container halen, anders verschijnt er
  een tweede cookiebanner over de site.
- Het adres van het Google-bedrijfsprofiel ontbreekt in `sameAs`, en het
  aantal Google-reviews is onbekend.
- De vier afbeeldingen `werkplaats-*.jpg` zijn plaatshouders en horen
  vervangen te worden door echte foto's uit de werkplaats.
- `og-fd-autoservice.jpg` is een sobere deelkaart; mag een foto worden.
- De dienstpagina's zijn 457 tot 498 woorden en mogen naar 600 tot 900.
- `/autoreparatie`, `/diagnose` en `/koplampen-polijsten` bestaan niet en
  wijzen voorlopig naar het afspraakformulier.

Zie `OPLEVERING-seo-en-ui.md` voor wat er in de laatste rondes is gewijzigd
en waarom.
