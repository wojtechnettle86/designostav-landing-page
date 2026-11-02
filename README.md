# Designostav — návrh landing page

Samostatný statický web v češtině, bez buildu. Otevřete `index.html`, případně spusťte `py -m http.server 8080` v této složce. Pro GitHub Pages nahrajte `index.html`, `style.css`, `app.js`, `.nojekyll` a složku `assets/` do repozitáře a v Settings → Pages zvolte nasazení z kořene příslušné větve. Relativní cesty fungují také pod názvem repozitáře.

## Obsah a média

Logo, fotografie, vizualizace, video a kontakty pocházejí ze současné stránky https://www.designostav.com/development/. Projektové odkazy vedou na skutečné detaily. Nejsou doplněny neověřené statistiky ani smyšlené recenze. Vizualizace jsou označené v alternativních textech. Vizuál a copy jsou návrhem ke schválení klientem.

Hero používá 96 snímků z klientem schváleného osmivteřinového Adobe AI videa `Create a 10-second photorealisti 329654 JjN.mp4` (skutečná délka je 8 sekund). Záběr vede od komorní bytové zástavby proskleným vstupem přes obytný prostor a chodbu do ložnice. První čtvrtina filmu dostává 32 % scrollovací dráhy pro delší prezentaci exteriéru. Canvas vykresluje snímek podle scrollování; funguje i bez podpory posouvání MP4. Načítají se nejbližší snímky, maximálně 4 současně, dekódovaná cache má limit 18 snímků. Hlavička zůstává připnutá se scénou. Při omezení animací je statický poster. Jde o ilustrativní architekturu, nikoli doloženou realizaci Designostavu. Distribuční ZIP obsahuje assets/motion-frames a neobsahuje MP4 podklady.

## Formulář

Hero má celkovou výšku 600svh: po odečtení připnuté obrazovky připadá na přehrání přibližně pět výšek viewportu. Delší scrollovací dráha zpomaluje průlet při stejném pohybu kolečkem nebo gestem.

GitHub Pages neposkytují backend. Formulář proto validuje povinné údaje a připraví předvyplněný e-mail v poštovním klientovi. Odeslání dokončuje návštěvník; stránka nepředstírá doručení. Záložní možnost stáhne text poptávky. Pro přímé odesílání je před ostrým spuštěním nutné napojit skutečný formulářový endpoint. Rozpočtové intervaly jsou návrhové kvalifikační kategorie, nikoli deklarované minimum firmy.

## SEO a uvedení do provozu

Návrh na GitHub Pages má záměrně `noindex,follow`, aby nekonkuroval současnému webu duplicitním obsahem. Stávající web ani URL se nemění. Udržení SEO výsledků nelze samotnou novou HTML stránkou garantovat.

Při integraci do produkčního webu:

- Zachovat hlavní URL `/development` a relevantní existující adresy, při nutné změně zavést jednotlivé 301 přesměrování.
- Odstranit `noindex` až při ostrém nasazení a nastavit canonical na skutečnou produkční URL. Zachovat jazykové alternativy a propojení s dalšími službami.
- Porovnat původní indexovaný obsah, title, popisy, interní odkazy a vyhledávací dotazy s finálním obsahem; zachovat důležitá témata i detaily projektů.
- Aktualizovat sitemapu, ověřit mobilní layout, rychlost a funkční formulář. Zaznamenat výchozí stav v Search Console a po nasazení sledovat indexaci, 404 a organickou návštěvnost.
- Ověřit finální marketingové formulace a zásady zpracování údajů. Nepřidávat analytiku bez odpovídajícího řešení souhlasů.

Font Instrument Sans se načítá z Google Fonts; bez připojení funguje systémový fallback Arial. Všechna hlavní média jsou lokální.

Soubor `refinements.css` obsahuje novou typografii, větší menu, formulářová pole a popisky. Musí být nahrán spolu s `style.css`. Obsah dalších sekcí se jednorázově odhaluje při scrollování přes IntersectionObserver, fotografie projektů mají nástup a snímek v sekci služeb jemný parallax. Efekty respektují omezení animací, tisk a klávesnicové ovládání.

Soubor `architecture.css` doplňuje finální kompozici: projekty přes celou výšku obrazovky, velké názvy míst, otevřené služby a stupňovanou sekci spolupráce. Nahrajte všechny tři CSS soubory. Dekorativní ikonky, šipky v kolečkách a dělicí linky byly odstraněny. Projektové fotografie se při scrollování mírně posouvají; animace se vypnou při omezení pohybu.

Hlavní CTA používají jednotnou pískovou barvu a text Probrat můj projekt. Za portfoliem je samostatná výzva s telefonním kontaktem. Po odscrollování hero se zobrazí průběžné tlačítko (na mobilu dole), které se před formulářem skryje. Formulář stále pouze připravuje e-mail; nejde o přímé serverové odeslání.
