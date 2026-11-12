/* Format des pages dans FABLE_SITE : un fichier page.md par page, lisible et modifiable à la main.
   Le même code écrit le fichier (depuis les données du site) et le relit (vers les données du site).
   Utilisé par admin.html dans le navigateur et par les scripts de vérification sous Node. */
(function (racine) {
  "use strict";
  const SEP = " | ";
  const AIDE = "<!-- Fichier de référence de cette page du site. Les lignes « ## » et « Mot : » sont des repères : ne pas les renommer.\n     Une ligne vide sépare deux paragraphes. Une image = une ligne « - nom-du-fichier | légende ». -->";

  // ---------- pages du périmètre ----------
  function pages(D) {
    const L = [{ id: "accueil", t: "Page d'accueil", g: "Général", type: "accueil" }, { id: "apropos", t: "À propos", g: "Général", type: "apropos" }];
    D.focus.forEach(f => L.push({ id: f.id, t: f.t, g: "Focus", type: f.recit ? "recit" : "focus" }));
    for (const k of Object.keys(D.rub)) D.rub[k].items.forEach(o => L.push({ id: o.id, t: o.t, g: D.rub[k].label, type: "fiche", rub: k }));
    D.ia.forEach(o => L.push({ id: o.id, t: o.t, g: "IA et automatisation", type: "ia" }));
    [["affiches", "Affiches"], ["voeux", "Cartes de vœux"], ["infotravaux", "Infos travaux"]].forEach(m => L.push({ id: m[0], t: m[1], g: "Édition : murs d'images", type: "mur" }));
    return L;
  }
  function objet(D, id) {
    if (id === "accueil") return D.accueil;
    if (id === "apropos") return D.apropos;
    return D.focus.find(x => x.id === id) || D.ia.find(x => x.id === id) || Object.values(D.rub).flatMap(r => r.items).find(x => x.id === id) || null;
  }
  const mur = (D, id) => ({ affiches: D.affiches, voeux: D.edition.voeux, infotravaux: D.edition.infotravaux })[id];
  function poseMur(D, id, a) { if (id === "affiches") D.affiches = a; else D.edition[id] = a; }

  // ---------- écriture ----------
  const sec = (nom, corps, ...args) => "## " + [nom, ...args].join(SEP) + "\n" + corps.replace(/\s+$/, "") + "\n";
  const paras = a => (a || []).join("\n\n");
  const puces = a => (a || []).map(x => "- " + x).join("\n");
  const paires = a => (a || []).map(x => "- " + x.join(SEP)).join("\n");

  function ecrire(D, id, nom) {            // nom(idImage) → nom du fichier dans le dossier de la page
    const p = pages(D).find(x => x.id === id); if (!p) throw new Error("Page inconnue : " + id);
    const imgs = a => (a || []).map(x => "- " + nom(x[0]) + (x[3] ? SEP + x[3] : "")).join("\n");
    const S = [], meta = [];
    let titre = p.t;
    if (p.type === "accueil") {
      const A = D.accueil;
      S.push(sec("Métiers", puces(A.metiers)), sec("Phrase d'introduction", A.phrase), sec("Trois colonnes", paires(A.trois)));
      D.heroSets.forEach((h, n) => S.push(sec("Images d'ouverture", imgs(h), String(n + 1))));
    } else if (p.type === "apropos") {
      const A = D.apropos, bl = (nomS, L) => L.forEach(e => S.push(sec(nomS, [e.p || "", puces(e.li), e.note ? "Note : " + e.note : ""].filter(Boolean).join("\n\n"), e.d || "", e.t || "")));
      S.push(sec("Chapô", A.chapo)); bl("Expérience", A.exp); bl("Formation", A.formation);
      S.push(sec("Compétences", puces(A.competences)), sec("Et aussi", puces(A.aussi)));
    } else if (p.type === "mur") {
      S.push(sec("Images", imgs(mur(D, id))));
    } else if (p.type === "fiche") {
      const o = objet(D, id); titre = o.t;
      meta.push(["Date", o.d || ""], ["Personnalités", o.w || ""]);
      S.push(sec("Texte", paras(o.x)), sec("Images", imgs(o.p)));
    } else if (p.type === "ia") {
      const o = objet(D, id); titre = o.t;
      meta.push(["Catégorie", o.k || ""], ["Année", o.d || ""]);
      S.push(sec("Texte", paras(o.x)), sec("Liens", paires(o.liens)), sec("Films", paires(o.films)), sec("Images", imgs(o.p)));
    } else {
      const f = objet(D, id); titre = f.t;
      meta.push(["Bandeau", f.k || ""]);
      S.push(sec("Chapô", f.c || ""), sec("Chiffres clés", paires(f.chiffres)), sec("Image d'ouverture", f.hero ? imgs([f.hero]) : ""));
      if (p.type === "recit") f.recit.forEach(b => {
        if (b.img) S.push(sec("Images", (b.leg ? "Légende : " + b.leg + "\n" : "") + imgs(b.img), b.pg ? "pages" : b.mur ? "mosaïque" : "rangée"));
        else if (b.films) S.push(sec("Films", paires(b.films)));
        else if (b.liens_seuls) S.push(sec("Liens", paires(b.liens_seuls)));
        else {
          S.push(sec(b.liste ? "Puces" : "Texte", b.liste ? puces(b.liste) : paras(b.x), b.n || "", b.k || "", b.d || "", b.h || ""));
          if (b.liens) S.push(sec("Liens du texte", paires(b.liens)));
        }
      });
      else {
        if (f.poeme) S.push(sec("Poème", f.poeme.join("\n")));
        (f.sections || []).forEach(s => S.push(sec("Section", paras(s[1]), s[0])));
        if (f.bandeau) S.push(sec("Images : bandeau", imgs(f.bandeau)));
        if (f.diplomes) S.push(sec("Images : diplômes", imgs(f.diplomes)));
        S.push(sec("Images : galerie", imgs(f.galerie)));
      }
    }
    return "# " + titre + "\n" + AIDE + "\n\n" + meta.map(m => m[0] + " : " + m[1] + "\n").join("") + (meta.length ? "\n" : "") + S.join("\n");
  }

  // ---------- lecture ----------
  function decoupe(texte) {
    const lignes = texte.replace(/^﻿/, "").replace(/\r\n?/g, "\n").replace(/<!--[\s\S]*?-->/g, "").split("\n");
    const doc = { titre: "", meta: {}, sections: [] }; let cour = null;
    for (const l of lignes) {
      if (l.startsWith("## ")) { const a = l.slice(3).split(SEP).map(x => x.trim()); cour = { nom: a[0], args: a.slice(1), lignes: [] }; doc.sections.push(cour); }
      else if (cour) cour.lignes.push(l);
      else if (l.startsWith("# ")) doc.titre = l.slice(2).trim();
      else { const m = l.match(/^([^:]{2,30}?) ?: ?(.*)$/); if (m) doc.meta[m[1].trim()] = m[2].trim(); }
    }
    doc.sections.forEach(s => s.corps = s.lignes.join("\n").trim());
    return doc;
  }
  const lParas = c => c.split(/\n\s*\n/).map(x => x.trim()).filter(Boolean);
  const lPuces = c => c.split("\n").filter(l => /^- /.test(l)).map(l => l.slice(2).trim());
  const lPaires = c => lPuces(c).map(l => { const a = l.split(SEP); return [a[0].trim(), a.slice(1).join(SEP).trim()]; });

  /* lire : renvoie { erreurs:[…], neufs:[…] } et modifie D.
     image(fichier) → [id,w,h] si le fichier est connu, sinon null (image nouvelle : une entrée {neuf:fichier, leg} est posée, à traiter par l'appelant). */
  function lire(D, id, texte, image) {
    const p = pages(D).find(x => x.id === id); if (!p) throw new Error("Page inconnue : " + id);
    const doc = decoupe(texte), err = [], neufs = [];
    const lImgs = (c, sansLegende) => lPuces(c.split("\n").filter(l => !/^Légende ?:/.test(l)).join("\n")).map(l => {
      const a = l.split(SEP), f = a[0].trim(), leg = a.slice(1).join(SEP).trim(), k = image(f);
      if (!k) { const e = { neuf: f, leg: sansLegende ? "" : leg }; neufs.push(e); return e; }
      return leg && !sansLegende ? [k[0], k[1], k[2], leg] : [k[0], k[1], k[2]];
    });
    const S = n => doc.sections.filter(s => s.nom === n), un = n => { const a = S(n); if (!a.length) err.push("Section « " + n + " » absente : contenu conservé tel qu'il est sur le site."); return a[0]; };
    const si = (n, f) => { const s = un(n); if (s) f(s.corps, s); };
    if (p.type === "accueil") {
      const A = D.accueil;
      si("Métiers", c => A.metiers = lPuces(c)); si("Phrase d'introduction", c => A.phrase = c.split("\n").map(x => x.trim()).filter(Boolean).join("\n")); si("Trois colonnes", c => A.trois = lPaires(c));
      const h = S("Images d'ouverture"); if (h.length) D.heroSets = h.map(s => lImgs(s.corps, true)); else err.push("Aucun jeu d'images d'ouverture : conservés.");
    } else if (p.type === "apropos") {
      const A = D.apropos, bl = n => S(n).map(s => {
        const L = s.corps.split("\n"), note = L.filter(l => /^Note ?:/.test(l)).map(l => l.replace(/^Note ?: ?/, "")).join(" ");
        const e = { d: s.args[0] || "", t: s.args[1] || "", p: L.filter(l => !/^- /.test(l) && !/^Note ?:/.test(l)).join("\n").trim().replace(/\s*\n\s*/g, " ") };
        const li = lPuces(s.corps); e.li = li; e.note = note; return e;
      });
      si("Chapô", c => A.chapo = c.replace(/\s*\n\s*/g, " "));
      if (S("Expérience").length) A.exp = bl("Expérience"); if (S("Formation").length) A.formation = bl("Formation");
      si("Compétences", c => A.competences = lPuces(c)); si("Et aussi", c => A.aussi = lPuces(c));
    } else if (p.type === "mur") {
      si("Images", c => poseMur(D, id, lImgs(c)));
    } else if (p.type === "fiche" || p.type === "ia") {
      const o = objet(D, id); if (doc.titre) o.t = doc.titre;
      const M = (k, c) => { if (k in doc.meta) o[c] = doc.meta[k]; };
      if (p.type === "fiche") { M("Date", "d"); M("Personnalités", "w"); } else { M("Catégorie", "k"); M("Année", "d"); si("Liens", c => o.liens = lPaires(c)); si("Films", c => o.films = lPaires(c)); }
      si("Texte", c => o.x = lParas(c)); si("Images", c => o.p = lImgs(c));
    } else {
      const f = objet(D, id); if (doc.titre) f.t = doc.titre;
      if ("Bandeau" in doc.meta) f.k = doc.meta.Bandeau;
      si("Chapô", c => f.c = c.replace(/\s*\n\s*/g, " ")); si("Chiffres clés", c => f.chiffres = lPaires(c));
      si("Image d'ouverture", c => { const a = lImgs(c, true); if (a.length) f.hero = a[a.length - 1]; });
      if (p.type === "recit") {
        const R = []; let av = false;
        doc.sections.forEach(s => {
          if (s.nom === "Chapô" || s.nom === "Chiffres clés" || s.nom === "Image d'ouverture") { if (R.length) av = true; return; }
          if (s.nom === "Images") {
            const b = { img: lImgs(s.corps), leg: (s.corps.split("\n").find(l => /^Légende ?:/.test(l)) || "").replace(/^Légende ?: ?/, "") };
            if (/page/i.test(s.args[0] || "")) b.pg = 1; else if (/mosa/i.test(s.args[0] || "")) b.mur = 1; R.push(b);
          } else if (s.nom === "Films") R.push({ films: lPaires(s.corps) });
          else if (s.nom === "Liens") R.push({ liens_seuls: lPaires(s.corps) });
          else if (s.nom === "Liens du texte") { const d = R[R.length - 1]; if (d && "h" in d) d.liens = lPaires(s.corps); else err.push("« Liens du texte » sans texte juste avant : ignoré."); }
          else if (s.nom === "Texte" || s.nom === "Puces") {
            const b = { n: s.args[0] || "", k: s.args[1] || "" }; if (s.args[2]) b.d = s.args[2]; b.h = s.args.slice(3).join(SEP);
            if (s.nom === "Puces") b.liste = lPuces(s.corps); else b.x = lParas(s.corps); R.push(b);
          } else err.push("Section « " + s.nom + " » non reconnue : ignorée.");
        });
        if (av) err.push("Chapô, chiffres clés et image d'ouverture doivent rester avant le récit.");
        if (R.length) f.recit = R; else err.push("Récit vide : conservé tel qu'il est sur le site.");
      } else {
        if (f.poeme && S("Poème").length) f.poeme = S("Poème")[0].corps.split("\n").map(x => x.trim()).filter(Boolean);
        const ss = S("Section"); if (ss.length) f.sections = ss.map(s => [s.args.join(SEP), lParas(s.corps)]);
        if (f.bandeau) si("Images : bandeau", c => f.bandeau = lImgs(c, true));
        if (f.diplomes) si("Images : diplômes", c => f.diplomes = lImgs(c, true));
        si("Images : galerie", c => f.galerie = lImgs(c, true));
      }
    }
    return { erreurs: err, neufs };
  }

  // identifiants des images d'une page, dans l'ordre du fichier (doublons retirés)
  function images(D, id) { const L = []; ecrire(D, id, i => { if (!L.includes(i)) L.push(i); return ""; }); return L; }
  // listes d'images d'une page (pour y ranger une image déposée dans le dossier sans être citée dans page.md)
  function derniereListe(D, id) {
    const p = pages(D).find(x => x.id === id), o = objet(D, id);
    if (p.type === "accueil") return D.heroSets[D.heroSets.length - 1];
    if (p.type === "mur") return mur(D, id);
    if (p.type === "fiche" || p.type === "ia") return o.p;
    if (p.type === "recit") { const b = o.recit.filter(x => x.img); return b.length ? b[b.length - 1].img : null; }
    if (p.type === "focus") return o.galerie;
    return null;
  }
  // texte canonique d'une valeur (clés triées) : pour comparer deux versions sans tenir compte de l'ordre des clés
  const canon = o => JSON.stringify(o, (k, v) => v && typeof v === "object" && !Array.isArray(v) ? Object.keys(v).sort().reduce((r, x) => (r[x] = v[x], r), {}) : v);
  const api = { pages, objet, ecrire, lire, images, derniereListe, decoupe, canon };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else racine.FABLE = api;
})(typeof window !== "undefined" ? window : globalThis);
