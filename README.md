# Portfolio — Emmanuel Quéau

Site statique. Direction de la communication, graphisme, photographie et vidéo,
Ville d'Épinay-sous-Sénart.

Publié avec GitHub Pages : **Settings → Pages → Branch `main`, dossier `/` (root)**.

## Contenu

| Dossier | Contenu |
|---|---|
| `index.html` | le site entier : structure, textes et données (une seule page, routage par ancre) |
| `i/` | images en pleine définition (1 500 px) et pages de publications (1 300 px) |
| `s/` | vignettes (620 px, 420 px pour les pages) |
| `t.json` | vignettes des films YouTube |

Les sources (textes modifiables, images d'origine) sont dans `F:\WORK\IAZONE\FABLE_SITE`
et `F:\WORK\IAZONE\CLAUDE_SITE`.

`robots.txt` et la balise `noindex` tiennent le site hors des moteurs de recherche :
le dépôt est public, mais le site n'est pas référencé.

## Dossiers Focus en récit

Un dossier Focus qui porte une clé `recit` (aujourd'hui : TZCLD) s'affiche en chapitres,
un temps de texte puis un temps d'images légendées (fonction `recit()` dans `index.html`).
Sa source est `01_Focus\<dossier>\texte.md` et `recit.json` dans `FABLE_SITE`.

## Administration (back office) et FABLE_SITE

- `data.js` contient toutes les données du site (`const D = …`) ; `index.html` ne contient que la mise en page et le code.
- `admin.html` est la page d'administration (elle embarque `fable.js`). Elle ne contient aucun secret : la clé GitHub est saisie par l'utilisateur et conservée chiffrée dans son navigateur.
- **FABLE_SITE** (disque de l'utilisateur) est la référence : un dossier par page (`D.dossiers`), avec `page.md` (textes et liste ordonnée des images) et les images en haute définition. `fable.js` écrit et relit `page.md` ; `_backoffice/etat.json` relie chaque fichier à son numéro d'image.
- Trois circuits, toujours site + FABLE_SITE ensemble : « Enregistrer » dans le back office ; « Publier depuis FABLE_SITE » après une modification à la main dans les dossiers ; une modification faite par Claude, qui régénère `page.md` avec `fable.js` et met à jour `etat.json` dans la même opération.
- Chaque enregistrement est un commit « Administration : … » sur `main`. État d'avant le back office : branche `avant-backoffice`.
- Hors périmètre du back office : documents à feuilleter (`D.docs`) et vidéos.
