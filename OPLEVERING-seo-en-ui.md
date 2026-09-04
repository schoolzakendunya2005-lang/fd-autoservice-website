# Oplevering — SEO/schema, en de UI-audit

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

# Deel 2 — UI-audit (stap 1: gemeten, niets gewijzigd)

## Het gemeten probleem

Drie plekken waar twee knoppen naast elkaar staan, gemeten op 1440px:

| Plek | Knop | Hoogte | Hoofdletters | Fontgrootte | Gewicht |
|---|---|---|---|---|---|
| `/diensten` hero | `.di-hero-btn.di-hero-afspraak` | **53px** | ja | 13,12px | 800 |
| | `.di-hero-btn.di-hero-bel` | **60px** | ja | 13,12px | 800 |
| Homepage eind-CTA | `.btn-pill` | **59px** | ja | 14,08px | 700 |
| | `.foot-cta-bel` | **60px** | nee | 15,2px | 700 |
| Homepage hero | `.btn-pill` | 59px | ja | 14,08px | 700 |
| | `.hero-textlink` | 26px | nee | 14,08px | 500 |

De 7px op `/diensten` is het duidelijkst: beide knoppen hebben *dezelfde*
padding (`16px 28px`) en dezelfde fontgrootte. Het verschil komt van het
icoon in de belknop, dat de regelhoogte optilt, plus 1px rand. Precies het
patroon uit de opdracht: hoogte is een uitkomst van padding in plaats van
een eigenschap van de knop. De rij staat bovendien op `align-items: center`,
dus het verschil is zichtbaar in plaats van weggepoetst.

**Twee daarvan zijn van mijn hand.** `.foot-cta-bel` heb ik eerder deze week
zelf toegevoegd, en ik heb daarbij exact dezelfde fout gemaakt: een nieuwe
one-off klasse in plaats van een bestaande hergebruiken.

## De regel eronder

Op `/diensten`:

> Nu gesloten · opent om 10:00 · Westzijde 158C, Zaandam · vaak deze week terecht

- `margin-top: 0px` — plakt tegen de knoppen aan.
- 743px breed, ruim boven de 80 tekens.
- Drie losse feiten aan elkaar geregen met middenpunten: openingsstatus,
  adres en beschikbaarheid.

## Wat de audit opleverde

**36 verschillende knopachtige klassen**, waarvan de belangrijkste:

| Klasse | Aantal | Voorbeeld |
|---|---|---|
| `d-btn-bel` | 14 | `airco-service.html:394` |
| `d-btn-vol` | 5 | `airco-service.html:411` |
| `d-btn-primair` | 4 | `bedankt-afspraak.html:96` |
| `plate-btn` | 4 | `index.html:2049` |
| `qty-btn` | 4 | `afspraak.html:1347` |
| `btn-primary` / `btn-secondary` | 4 | `index.html:2331` |
| `social-pill` / `social-cta` | 8 | `over-ons.html:939` |
| `ap-btn-next` / `-back` / `-submit` | 6 | `afspraak.html:746` |
| `btn-pill` | 2 | `index.html:2481` |
| `di-hero-btn` / `di-hero-bel` | 3 | `diensten.html:620` |
| `fd-cc-btn` | 3 | `cookie-consent.js:259` |
| `nf-bel`, `bd-bel`, `ct-map-cta`, `final-cta`, `mobile-menu-cta`, `kenteken-btn` | 1 elk | verspreid |

Verder gemeten over alle HTML, CSS en JS:

- **167 verschillende padding-waardes.** Onder andere `5px 10px`,
  `9px 0`, `17px 26px`, `22px 20px` — geen van drieën uit een schaal.
- **15 verschillende radiuswaardes**: 2, 5, 6, 8, 9, 10, 12, 14, 16, 18, 20,
  22, 24px, 50% en 999px.
- **58 verschillende fontgroottes**, waarvan 22 vaker dan tien keer
  voorkomen. `.86rem` staat 39 keer, `.78rem` 28 keer, maar er staan ook
  `.94rem`, `.96rem` en `.98rem` naast elkaar.

## Waarom ik hier gestopt ben

De opdracht vraagt om een `Button`-component met `variant`, `size`, `icon`
en `href`. Dat is de taal van React of Vue. **Deze site heeft geen
bouwstap** — het zijn zestien losse HTML-bestanden. De vertaling is een
CSS-component (`.fd-knop` met `--variant` en `--maat`) plus het vervangen
van 36 klassen op ruim honderd plekken, verspreid over HTML én de drie
JavaScript-bestanden die hun eigen CSS injecteren.

Dat is te doen en het is de goede oplossing, maar het raakt vrijwel elke
pagina en dat wil ik niet doen zonder dat jij eerst twee dingen kiest:

1. **Hoofdletters of niet.** Nu staan beide vormen door elkaar: de primaire
   knop schreeuwt, de belknop niet. De opdracht zegt terecht: kies er één.
   Mijn voorstel is *geen* hoofdletters — een telefoonnummer in kapitalen
   leest slechter, en het is de belangrijkste knop van de site.
2. **Drie knophoogtes: 40 / 48 / 56.** Dat betekent dat de huidige knoppen
   van 53, 59 en 60px allemaal iets van formaat veranderen. Ze worden
   consistent, maar niet identiek aan nu.

Zeg wat je kiest, dan bouw ik de tokenset, de knopcomponent en een
`/styleguide`-pagina waarop de varianten naast elkaar staan met hun gemeten
hoogtes erbij.

---

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
6. **Hoofdletters op knoppen: wel of niet.**
7. **Knophoogtes 40 / 48 / 56 akkoord?**
8. Openstaand uit de vorige ronde: `/autoreparatie`, `/diagnose` en
   `/koplampen-polijsten` bestaan niet en wijzen nu naar `/afspraak`.
