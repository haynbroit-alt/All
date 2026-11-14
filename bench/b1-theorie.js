// THEORIE_B1.md : calcul unique des prédictions Q1 à Q5 sur la suite a → a + d(a), de 1 jusqu'au rang 10^7.
import { writeFileSync } from 'node:fs';
const M = 10000000, N0 = 1000000, G = 0.5772156649015329;
const pr = []; { const c = new Uint8Array(40001); for (let i = 2; i <= 40000; i++) if (!c[i]) { pr.push(i); for (let j = i * i; j <= 40000; j += i) c[j] = 1; } }
function d(a) { let r = 1; for (let k = 0; k < pr.length; k++) { const p = pr[k]; if (p * p > a) break; if (a % p === 0) { let e = 0; while (a % p === 0) { a /= p; e++; } r *= e + 1; } } return a > 1 ? r * 2 : r; }
const carre = (a) => { const s = Math.round(Math.sqrt(a)); return s * s === a; };
let a = 1, a0 = null, hors1 = 0, hors2 = 0, c2 = 0, c0 = 0, c1 = 0, somme = 0, retours = 0, sorties2 = 0, impairPrec = true;
const classes = (x) => (x % 2 === 1 ? 1 : x % 4 === 2 ? 2 : 0);
for (let n = 1; n <= M; n++) {
  const pas = d(a), b = a + pas, ca = classes(a), cb = classes(b);
  if ((a % 2) !== (b % 2) && !carre(a)) hors1++;
  if (ca === 2 && cb !== 2) { if (n >= N0) sorties2++; if (!(a % 2 === 0 && (a / 2) % 2 === 1 && carre(a / 2))) hors2++; }
  if (n === N0) a0 = a;
  if (n >= N0) {
    if (ca === 2) { c2++; somme += pas - Math.log(a); } else if (ca === 0) c0++; else c1++;
    if (ca === 1 && !impairPrec) retours++;
  }
  impairPrec = ca === 1;
  if (n < M) a = b;
}
const integre = (c) => { let x = a0; for (let n = N0; n < M; n++) x += Math.log(x) + c; return x; };
const tot = c2 + c0 + c1, naif = integre(2 * G), theo = integre(2 * G + Math.LN2);
const r = { rangs: [N0, M], terme_1e6: a0, terme_1e7: a, part_2_mod_4: c2 / tot, part_0_mod_4: c0 / tot, part_impairs: c1 / tot,
  moyenne_pas_moins_ln: somme / c2, attendu_naif: 2 * G, attendu_theorie: 2 * G + Math.LN2, parite_hors_carre: hors1, sortie_hors_double_carre: hors2,
  sorties_de_la_classe: sorties2, retours_aux_impairs: retours, prediction_naive: naif, erreur_naive: Math.abs(naif - a) / a, prediction_theorie: theo, erreur_theorie: Math.abs(theo - a) / a };
console.log(JSON.stringify(r, null, 1));
writeFileSync(new URL('./b1-theorie.json', import.meta.url), JSON.stringify(r, null, 1) + '\n');
