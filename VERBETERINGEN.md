# FD Autoservice — doorgevoerde verbeteringen

Uitgevoerd op 3 september 2026, op basis van de feedbackpagina in Notion.
Basis: de live site op `fdautoservice-zaandam.netlify.app`.

Uploaden: sleep de **inhoud** van deze map (dus niet de map zelf) naar
Netlify, of koppel hem aan de bestaande deploy. `netlify.toml` hoort in de
hoofdmap te staan, naast `index.html`.

---

## 1. Adressen zonder `.html`

`/contact.html` en `/contact` waren allebei bereikbaar. Voor Google zijn dat
twee adressen met dezelfde inhoud, en het staat rommelig in de adresbalk.

- Alle interne links wijzen nu naar `/contact`, `/occasions`, `/diensten`,
  `/afspraak` enzovoort. Dat geldt ook voor het menu dat `site-header.js`
  opbouwt en voor de links in de cookiebanner.
- Nieuw bestand `netlify.toml` stuurt elk `.html`-adres permanent (301) door
  naar de nette variant, zodat oude links en zoekresultaten blijven werken.
- Twee extra doorverwijzingen voor adressen die in advertenties kunnen staan:
  `/apk` → `/apk-keuring` en `/auto-s-te-koop` → `/occasions`.
- In `netlify.toml` staan ook een paar standaard beveiligingsheaders.

## 2. De kaart laadt nu altijd

De kaart zat achter de cookiemuur. Wie cookies weigerde, kreeg een leeg vlak
te zien in plaats van waar de garage zit — precies bij de bezoeker die de weg
zoekt.

- Google Maps is vervangen door een kaart van **OpenStreetMap**, opgebouwd uit
  vaste kaartbeelden (`kaart.css`). Geen iframe, geen JavaScript, geen cookies
  en geen WebGL: hij laadt dus altijd, op elk toestel en ongeacht wat iemand in
  de cookiebanner kiest. Aangepast op de homepage, `/contact` en `/over-ons`.
- Een speld markeert Westzijde 158C, met het adres in beeld en de verplichte
  bronvermelding naar OpenStreetMap.
- De knop "Routebeschrijving openen" gaat nog steeds naar Google Maps, want
  daar is de navigatie beter. Dat is een klik van de bezoeker zelf, dus
  daarvoor is geen toestemming nodig.
- Cookiebanner, cookiebeleid en privacyverklaring zijn hierop aangepast: er
  wordt nu alleen nog toestemming gevraagd voor YouTube-video.

## 3. Telefoonnummer als CTA op /diensten

In de hero van `/diensten` staat nu naast "Afspraak maken" een tweede knop met
het telefoonnummer, plus een regel met de actuele open/gesloten-status en het
adres. Bellen kon eerder pas onderaan de pagina.

## 4. Occasions: foto's en uitlijning

Twee losse problemen, allebei opgelost:

- **De pagina bleef leeg.** `occasions.js` was ooit uit de homepage geknipt,
  maar `SELLER_URL` en `HAND_NOTES` bleven daar achter. Bij de eerste auto sloeg
  het script stuk op een ReferenceError, waardoor er niets werd getekend.
  Daarnaast werd `loadListings()` twee keer aangeroepen.
  De code staat nu één keer, in `occasions.js`, en wordt door zowel de homepage
  als `/occasions` gebruikt. Dat kan niet meer uit elkaar lopen.
- **De foto's laadden niet.** De foto-URL's wezen naar afbeeldingen die
  Marktplaats inmiddels heeft opgeruimd; die gaven een 404. Een foto verschijnt
  nu pas als hij ook echt geladen is. Lukt dat niet, dan blijft de getekende
  auto staan in plaats van een grijs gat.
- **Alles op één lijn.** Prijs en knoppen worden naar de onderkant van de kaart
  geduwd, titels zijn afgekapt op twee regels en omschrijvingen op drie. Alle
  kaarten in een rij zijn daardoor even hoog en de knoppen staan gelijk.

> Let op: `/api/marktplaats-cars` bestaat nog niet op deze hosting. Zolang die
> koppeling er niet is toont de site de vaste lijst uit `occasions.js`. Nieuwe
> auto's voeg je daar toe, bovenin het bestand.

## 5. Grotere hero op /diensten

"Alles voor je auto, onder één dak" vult nu het hele eerste scherm, met de
knoppen eronder. Wat daarna komt (de APK-check) zie je pas als je scrolt. Een
pijl onderin laat zien dat daar nog iets is. Op mobiel is de pijl weggelaten,
daar staat de vaste bel/WhatsApp-balk al onderaan.

## 6. Wit kleurpalet met rood accent

De hele site is omgezet van het donkere thema naar wit met zwarte letters en
rood als accentkleur, in de lijn van het voorbeeld uit de feedback.

- Alle 14 pagina's, plus `dienst.css`, `legal.css` en de CSS die vanuit
  JavaScript wordt geschreven (header, cookiebanner, contactbalk).
- De kleuren stonden op honderden plekken hardgecodeerd, ook in inline
  `style`-attributen. Die zijn allemaal per eigenschap omgezet: `color:#fff`
  werd zwart, `background:#fff` bleef wit.
- Rode knoppen houden witte letters. Schaduwen zijn zachter gemaakt, want de
  oude waarden waren afgestemd op een zwarte achtergrond.
- Het laadscherm, de mobiele menu-overlay en de vaste bovenbalk zijn meegegaan.
- Op `/over-ons` zijn de verlopen over de foto's bewust donker gebleven, want
  daar ligt witte tekst overheen.
- De sterren bij de reviews zijn iets donkerder goud, anders waren ze op wit
  nauwelijks te zien.

Elke pagina is nagelopen op tekst die door de omzetting onleesbaar zou worden
(contrast onder 2,2:1). Daar kwam niets meer uit.

---

## Overgebleven punt

Op `/over-ons` staat nog "132 reviews", terwijl `site-data.js` 148 aanhoudt.
Dat getal stond niet in de feedback en is daarom niet aangepast; wil je het
gelijktrekken, dan is `over-ons.html` de plek.
