#!/usr/bin/env node
// G5 — liste mécanique des données réelles groupées (PROTOCOLE_G5.md, « Terrains »), AVANT tout ajustement.
// Aucune loi n'est ajustée ici : le script lit des CSV, applique la règle et écrit la liste, rien d'autre.
//
// Usage : node bench/commun-jeux.js <dossier des CSV Rdatasets> [--sortie liste.json]
//
// Règle (proposée, à figer par le propriétaire avant usage) :
//  - colonnes : la première colonne est ignorée si son nom est vide ou « rownames » (numéros de ligne de R) ;
//  - numérique : toute valeur non manquante (« NA », vide) se lit comme un nombre fini ; au moins 2 colonnes ;
//  - facteur : colonne non numérique ;
//  - choix, dans l'ordre des colonnes : réponse = DERNIÈRE colonne numérique (convention de `galilee data`),
//    variable explicative = PREMIÈRE colonne numérique, facteur = PREMIER facteur qui donne au moins 5 groupes
//    d'au moins 5 lignes complètes (réponse, explicative, facteur non manquants) dont l'explicative prend au moins
//    2 valeurs distinctes ;
//  - on ne garde dans le jeu que ces groupes-là ; le jeu est retenu s'il en reste au moins 5.
// La sortie liste, par jeu : fichier, colonnes choisies, nombre de groupes et de lignes. Elle se fige telle quelle.
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

function lireCsv(texte) {
  const lignes = [];
  let champ = '', ligne = [], guillemets = false;
  for (let i = 0; i < texte.length; i++) {
    const c = texte[i];
    if (guillemets) {
      if (c === '"' && texte[i + 1] === '"') { champ += '"'; i++; } else if (c === '"') guillemets = false; else champ += c;
    } else if (c === '"') guillemets = true;
    else if (c === ',') { ligne.push(champ); champ = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && texte[i + 1] === '\n') i++;
      ligne.push(champ); champ = '';
      if (ligne.length > 1 || ligne[0] !== '') lignes.push(ligne);
      ligne = [];
    } else champ += c;
  }
  if (champ !== '' || ligne.length) { ligne.push(champ); lignes.push(ligne); }
  return lignes;
}

const manquant = (v) => v === '' || v === 'NA';
const nombre = (v) => { const x = Number(v); return v.trim() !== '' && isFinite(x) ? x : null; };

export function examiner(texte) {
  const [tete, ...corps] = lireCsv(texte);
  if (!tete || corps.length < 25) return null;
  const debut = tete[0] === '' || tete[0] === 'rownames' ? 1 : 0;
  const cols = tete.map((_, j) => j).slice(debut).filter((j) => corps.every((r) => r.length === tete.length));
  if (cols.length < 3 || corps.some((r) => r.length !== tete.length)) return null;
  const num = cols.filter((j) => corps.every((r) => manquant(r[j]) || nombre(r[j]) !== null) && corps.some((r) => !manquant(r[j])));
  const fac = cols.filter((j) => !num.includes(j));
  if (num.length < 2 || !fac.length) return null;
  const rep = num[num.length - 1], expl = num[0];
  for (const f of fac) {
    const groupes = new Map();
    for (const r of corps) {
      if (manquant(r[rep]) || manquant(r[expl]) || manquant(r[f])) continue;
      if (!groupes.has(r[f])) groupes.set(r[f], []);
      groupes.get(r[f]).push(nombre(r[expl]));
    }
    const ok = [...groupes].filter(([, xs]) => xs.length >= 5 && new Set(xs).size >= 2);
    if (ok.length >= 5) {
      return { reponse: tete[rep], explicative: tete[expl], facteur: tete[f], groupes: ok.length,
        lignes: ok.reduce((a, [, xs]) => a + xs.length, 0) };
    }
  }
  return null;
}

function* csvs(dossier) {
  for (const nom of readdirSync(dossier).sort()) {
    const p = join(dossier, nom);
    if (statSync(p).isDirectory()) yield* csvs(p);
    else if (nom.toLowerCase().endsWith('.csv')) yield p;
  }
}

if (process.argv[1] && process.argv[1].endsWith('commun-jeux.js')) {
  const dossier = process.argv[2];
  if (!dossier) { console.error('Usage : node bench/commun-jeux.js <dossier> [--sortie liste.json]'); process.exit(1); }
  const i = process.argv.indexOf('--sortie'), sortie = i > 0 ? process.argv[i + 1] : null;
  const liste = [];
  let vus = 0;
  for (const p of csvs(dossier)) {
    vus++;
    let r = null;
    try { r = examiner(readFileSync(p, 'utf8')); } catch { r = null; }
    if (r) liste.push({ fichier: relative(dossier, p), ...r });
  }
  console.log(`${vus} fichiers CSV lus, ${liste.length} jeux groupés retenus par la règle.`);
  const out = { protocole: 'G5', regle: 'bench/commun-jeux.js (en tête)', date: new Date().toISOString(), fichiersLus: vus, jeux: liste };
  if (sortie) writeFileSync(sortie, JSON.stringify(out, null, 1));
  else console.log(JSON.stringify(liste, null, 1));
}
