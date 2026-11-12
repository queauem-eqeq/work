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

## Administration (back office)

- `data.js` contient toutes les données du site (`const D = …`) ; `index.html` ne contient plus que la mise en page et le code.
- `admin.html` est la page d'administration : textes et images des Focus, visites, spectacles, séries, fiches IA, murs d'images d'Édition, page d'accueil et À propos. Elle ne contient aucun secret : la clé GitHub est saisie par l'utilisateur et conservée chiffrée dans son navigateur.
- Chaque enregistrement est un commit « Administration : … » sur `main`. Retour à l'état d'avant le back office : étiquette `avant-backoffice`.
