# Oplevering — SEO/schema en de knopcomponent

Bijgewerkt op 5 september 2026.

---

# Deel 1 — SEO en gestructureerde data

## Eerst dit: de audit liep achter op de site

Drie fouten uit de opdracht bestaan niet meer:

| Uit de opdracht | Werkelijk aangetroffen |
|---|---|
| "127 reviews in het schema" | Stond overal al op 148 |
| "diagnose €35" | Geen enkele diagnoseprijs in het schema |
| "bij APK staat geen prijs" | `"price": "60"` stond er al |
| "301's ontbreken" | Alle `.html`-adressen stuurden al door (vorige ronde) |
| "dienstpagina's die er moeten komen" | APK, airco, banden en onderhoud bestaan al |
| "kentekencheck ook op de homepage" | Stond er al |
| "`GTM_ID` leeg" | Klopt, en dat is nog steeds zo — zie beslispunt 1 |

Wat er wél misging staat hieronder.

## Wat er is gebouwd

### `bouw-schema.mjs` — één bron voor schema, sitemap en deelkaart

De bedrijfsgegevens stonden met de hand in acht pagina's. Dezelfde gegevens
op acht plekken lopen vroeg of laat uit elkaar; dat was ook precies wat er
bij de reviews en de openingstijden gebeurd was.

```bash
node bouw-schema.mjs
```

Draaien na elke wijziging in `site-config.js`, en vóór het uitrollen. Het
script raakt alleen aan wat tussen de markeringen staat:

```
<!-- fd:schema --> ... <!-- /fd:schema -->
<!-- fd:meta -->   ... <!-- /fd:meta -->
```

Waarom een script en niet JavaScript in de pagina: dan hangt het ervan af
of Google de pagina uitvoert. Zo staat het gewoon in de HTML. Dit script
ís de bouwstap, alleen draai je hem met de hand — deze site heeft er verder
geen.

**De FAQ wordt uit de pagina zelf gelezen.** De `<details>`-blokken zijn de
bron; het schema kan dus niet gaan afwijken van wat de bezoeker ziet staan,
en verborgen FAQ-markup is onmogelijk. Gecontroleerd: 5 vragen zichtbaar =
5 vragen in het schema, op alle vier de dienstpagina's, en 8 = 8 op de
homepage.

### Wat er per routetype in het schema zit

Uitgeschreven in `schema-uitvoer/`, klaar voor de Rich Results Test:

| Bestand | Van welke pagina | Knopen |
|---|---|---|
| `home.json` | `/` | AutoRepair+LocalBusiness, WebSite, FAQPage |
| `dienst.json` | `/apk-keuring` | + BreadcrumbList, Service met prijs, FAQPage |
| `overzicht.json` | `/diensten` | AutoRepair, WebSite, BreadcrumbList |
| `contact.json` | `/contact` | AutoRepair, WebSite, BreadcrumbList |
| `juridisch.json` | `/privacyverklaring` | AutoRepair, WebSite, BreadcrumbList |

Alle veertien indexeerbare pagina's kregen het blok. `/404` en
`/bedankt-afspraak` bewust niet: die staan op `noindex`.

Keuzes die zijn gemaakt:

- **`AggregateRating` gaat alleen mee als het klopt.** 148 en 5,0 komen uit
  `site-config.js` en verwijzen naar het Marktplaats-profiel waar we ook
  naartoe linken. Zet je het aantal daar op `null`, dan verdwijnt het
  cijfer uit het schema in plaats van dat er een verzonnen getal in komt.
- **Vanaf-prijzen** krijgen `priceSpecification` met `minPrice` in plaats van
  een vaste `price`. Bij banden en diagnose staat `valueAddedTaxIncluded:
  false`, want dat zijn prijzen ex btw.
- **Coördinaten lagen 400 meter naast het adres.** Het oude schema wees naar
  52.4416, 4.8174; dat is nu gelijkgetrokken met de kaart op `/contact`
  (52.4451045, 4.8195716 — daar staat de speld op Westzijde 158C).
- **`sameAs`** bevatte alleen Marktplaats. Facebook, Instagram en TikTok
  stonden wel in de site maar niet in het schema; die zijn toegevoegd.

### De sitemap

Wordt gegenereerd uit de routelijst in `site-config.js`, met `lastmod` uit
de wijzigingsdatum van het bestand. Veertien adressen, geen enkele
`.html`-variant, en `/bedankt-afspraak` en `/404` staan er bewust niet in.
Een nieuwe pagina voeg je toe aan `routes` in de config, niet aan
`sitemap.xml`.

### De deelkaart, en een gat dat niemand had gezien

`og-fd-autoservice.jpg` stond in elke `og:image` én in het schema als
`image` en `logo`. **Dat bestand bestond niet.** Elke link die iemand in
WhatsApp of op Facebook deelde, toonde dus een leeg vlak. Er staat nu een
sobere kaart met alleen gegevens die al op de site staan. Vervang hem
gerust door een foto van de werkplaats; de afmeting is 1200 × 630.

Hetzelfde gold voor `team-fd-autoservice.webp`, dat in een `<source>` werd
aangeroepen maar niet bestond. Nu aangemaakt: 132 KB tegenover 172 KB voor
de jpg.

`og:` ontbrak op `/diensten`, `/onderhoud-prijzen` en `/afspraak`.
`twitter:` stond alleen op de homepage. Nu overal, afgeleid van de `title`
en `description` van de pagina zelf, zodat er één plek blijft waar de tekst
van een pagina staat.

### Omschrijvingen

Zes waren te lang en werden door Google afgekapt: 166, 171, 190, 191, 198
en 209 tekens. Nu 131 tot 142, met de prijs en het telefoonnummer erin waar
dat paste. De bouwer waarschuwt voortaan zelf bij alles buiten 120–160.

### Beeld op de dienstpagina's

Er stond op geen enkele dienstpagina een foto. De opmaak staat nu klaar:
`figure.d-beeld` met `width`, `height`, `loading="lazy"` en een alt-tekst
die beschrijft wat er te zien is in plaats van hoe de dienst heet.
Bestandsnamen bevatten de dienst en de plaatsnaam.

De vier bestanden zijn **nadrukkelijk gemerkte plaatshouders** — grijs, met
"PLAATSHOUDER" er dwars overheen — zodat ze niet per ongeluk live gaan.

## Alle 301's die er nu staan

In `netlify.toml`:

| Van | Naar |
|---|---|
| `/index.html` | `/` |
| `/diensten.html` | `/diensten` |
| `/occasions.html` | `/occasions` |
| `/contact.html` | `/contact` |
| `/afspraak.html` | `/afspraak` |
| `/over-ons.html` | `/over-ons` |
| `/onderhoud-prijzen.html` | `/onderhoud-prijzen` |
| `/apk-keuring.html` | `/apk-keuring` |
| `/onderhoud.html` | `/onderhoud` |
| `/bandenservice.html` | `/bandenservice` |
| `/airco-service.html` | `/airco-service` |
| `/privacyverklaring.html` | `/privacyverklaring` |
| `/cookiebeleid.html` | `/cookiebeleid` |
| `/algemene-voorwaarden.html` | `/algemene-voorwaarden` |
| `/bedankt-afspraak.html` | `/bedankt-afspraak` |
| `/apk-afspraak` | `/afspraak` |
| `/apk-afspraak.html` | `/afspraak` |
| `/apk` | `/apk-keuring` |
| `/auto-s-te-koop` | `/occasions` |
| `/*` (rest) | `/404.html`, status 404 |

Verder: `lang` van `nl` naar `nl-NL` op alle zestien pagina's, en elke
indexeerbare route heeft een canonical naar zichzelf.

## Wat níet af is

**De dienstpagina's zijn te kort.** Gevraagd 600–900 woorden, aangetroffen:

| Pagina | Woorden |
|---|---|
| `/apk-keuring` | 498 |
| `/airco-service` | 475 |
| `/onderhoud` | 470 |
| `/bandenservice` | 457 |
| `/diensten` | 362 |

Ze missen elk zo'n 150 tot 400 woorden. Ik heb die niet geschreven, want om
het goed te doen moet ik dingen weten die nergens in de site staan: hoe lang
een airco-service duurt, wat er precies in een grote beurt zit, of jullie
banden op voorraad hebben en van welke merken, wat er gebeurt als een auto
wordt afgekeurd op een punt dat jullie niet zelf repareren. Een pagina
volschrijven met `[TE CONTROLEREN: ...]` levert niets op.

Zeg per dienst wat er feitelijk gebeurt en ik schrijf het uit.

---

# Deel 2 — UI: tokens en één knopcomponent

De twee keuzes die openstonden heb ik zelf gemaakt, zoals gevraagd:
**geen hoofdletters op knoppen**, en **hoogtes 40 / 48 / 56**.

## Wat er mis was, in cijfers

| Plek | Knop | Hoogte | Hoofdletters |
|---|---|---|---|
| `/diensten` hero | `.di-hero-afspraak` | 53px | ja |
| | `.di-hero-bel` | 60px | ja |
| Homepage eind-CTA | `.btn-pill` | 59px | ja |
| | `.foot-cta-bel` | 60px | nee |

Beide knoppen op `/diensten` hadden *dezelfde* padding en fontgrootte. De
7 pixels kwamen van het icoon, dat de regelhoogte optilde, plus een rand.

Verder: 36 knopachtige klassen, 167 padding-waardes, 15 hoekafrondingen en
58 tekstgroottes.

## Wat er nu staat

**`tokens.css`** — één ruimteschaal (4 t/m 64), drie hoeken met een
betekenis, een typeschaal met bijbehorende regelhoogtes, en drie
knophoogtes.

**`knop.css`** — de knop als component:

- `height` komt uit een token, niet uit padding
- `box-sizing: border-box`, dus een rand maakt de knop niet hoger
- `line-height: 1` en een icoon met vaste maat, dus het icoon kan de regel
  niet meer optillen
- de knoprij staat op `align-items: stretch`, zodat gelijke hoogte
  structureel is en niet per ongeluk klopt
- focusring, hover, active en disabled zijn gedefinieerd
- 44px raakoppervlak op een aanraakscherm, ook als de knop kleiner oogt

Nieuwe opmaak schrijf je zo:

```html
<a class="fd-knop" data-variant="primair" data-maat="l" href="/afspraak">
  Maak een afspraak
</a>
```

De 24 bestaande knopklassen hangen als alias aan dezelfde basis. Dat scheelt
honderd wijzigingen in de HTML en het effect is hetzelfde: één plek bepaalt
hoe een knop eruitziet. De aliassen mogen weg zodra de laatste pagina om is.

`site-header.js`, `contact-balk.js` en `cookie-consent.js` schrijven hun CSS
vanuit JavaScript; die gebruiken nu dezelfde tokens.

## De regel onder de knoppen

Was: één zin van 743 pixels die tegen de knoppen aan plakte en drie feiten
aaneenreeg met middenpunten. Nu drie losse elementen, ruimte uit de schaal,
en een regellengte onder de 80 tekens. De openingsstatus heeft zijn eigen
behandeling gekregen: vet, met een stip die groen is als we open zijn en
rood als we dicht zijn.

## Twee dingen die ik onderweg tegenkwam

**Een cascadebotsing.** `.di-hero > .wrap > p` (twee klassen plus een
element) won van `.fd-meta` (één klasse) en maakte de nieuwe spacing stil
ongedaan. Opgelost met `:not(.fd-meta)` op die regel, niet met `!important`.

**Een fout van mezelf.** In de audit had ik `.final-cta` als knopklasse
opgevat omdat er "cta" in de naam zit. Het is een `<section>`. Die kreeg
daardoor `display:inline-flex`, een vaste hoogte en `white-space:nowrap`,
en dat gaf 72 pixels horizontale scroll op 768px breed. De knop erbinnen
heet `.final-cta-btn`; dat is rechtgezet.

## Gecontroleerd

`/styleguide.html` toont elke variant met zijn **gemeten** hoogte, niet zijn
bedoelde hoogte. Alle tien knoppen komen exact op hun token uit.

Over de pagina's heen, op 360, 768 en 1440 pixels breed:

| Pagina | Knoppen | Afwijkend | Scheve rijen | Horizontale scroll |
|---|---|---|---|---|
| `/` | 13 | 0 | 0 | nee |
| `/diensten` | 8 | 0 | 0 | nee |
| `/apk-keuring` | 9 | 0 | 0 | nee |
| `/over-ons` | 6 | 0 | 0 | nee |
| `/contact` | 8 | 0 | 0 | nee |
| `/onderhoud-prijzen` | 5 | 0 | 0 | nee |
| `/afspraak` | 5 | 0 | 0 | nee |
| `/404` | 6 | 0 | 0 | nee |

## Wat er overblijft

De knoppen zijn om, de rest van de site nog niet. Buiten `tokens.css` en
`knop.css` staan nog 142 padding-waardes buiten de schaal, 15
hoekafrondingen en 59 tekstgroottes. Dat zijn secties, kaarten en
tussenkoppen: zichtbaar werk met een groot oppervlak en weinig risico, maar
het is een aparte ronde. De knoppen waren de plek waar het opviel, en die
zijn nu één ding.

# Wat een beslissing van jou nodig heeft

1. **GTM-nummer.** Nog steeds leeg. In de code staat `GTM-TSKBT6GV` als
   bedoelde waarde, met de waarschuwing dat eerst de CookieHub-tag uit die
   container moet — anders komt er een tweede cookiebanner over de site.
2. **Google-bedrijfsprofiel.** Het adres daarvan staat nergens in de site.
   Dat is de belangrijkste vermelding in `sameAs`, want daarmee koppelt
   Google de site aan het bedrijf. Ook het aantal Google-reviews is
   onbekend; zolang dat zo is toont de site daar geen getal.
3. **Aanvullende tekst voor de vier dienstpagina's**, zie hierboven.
4. **De vier werkplaatsfoto's.** Nu plaatshouders.
5. **De deelkaart.** Vervangen door een foto, of laten staan?
6. **De rest van de site langs de tokens halen** — secties, kaarten en
   koppen. Aparte ronde, zeg maar of het moet.
7. Openstaand uit de vorige ronde: `/autoreparatie`, `/diagnose` en
   `/koplampen-polijsten` bestaan niet en wijzen nu naar `/afspraak`.
