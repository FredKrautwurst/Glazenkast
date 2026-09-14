# De Glazenkast — statische site

Eén pagina, geen build-stap, geen dependencies. Upload de inhoud van deze map
naar een willekeurige webserver en het werkt.

## Bestanden

| Bestand      | Wat erin staat                                                        |
|--------------|-----------------------------------------------------------------------|
| `index.html` | De hele pagina: alle tekst, prijzen en foto's staan hier              |
| `style.css`  | De vormgeving. Kleuren en lettertypen staan bovenaan onder `:root`    |
| `script.js`  | Scroll-animaties, parallax, de navigatiebalk en de lightbox           |
| `images/`    | De foto's                                                              |
| `favicon.ico`, `robots.txt` | |

## Lokaal bekijken

Dubbelklik `index.html`, of draai een servertje in deze map:

```bash
python3 -m http.server 5175
```

## Tekst of prijzen aanpassen

Alles staat in `index.html`. Zoek op de tekst die je wilt wijzigen en pas hem
aan. Let op: een prijs staat op twee plekken — bij de woning zelf en in de
prijzentabel onder `#prijzen`. De prijs per m² staat er los bij en rekent zich
niet vanzelf uit.

## Een foto vervangen

Zet de nieuwe foto in `images/` en pas het `src` en het `alt` in `index.html`
aan. De `alt`-tekst is ook het bijschrift in de lightbox, dus schrijf hem als
een zin.

## Kleuren en lettertypen

Bovenaan `style.css`, onder `:root`. De kleuren staan in `oklch` met de
hex-waarde ernaast als commentaar.

## Wat zonder JavaScript gebeurt

De pagina blijft volledig leesbaar: het `<noscript>`-blok bovenin `index.html`
zet alle scroll-animaties meteen op zichtbaar en slaat het intro-gordijn over.
Alleen de lightbox en de parallax vervallen.
