import test from 'node:test';
import assert from 'node:assert/strict';
import { rng } from '../src/fit.js';
import { mettreDeCote, chercherLoiCommune, verdict, loiCommune, cleForme, marquer, libres, copier, predire } from '../src/commun.js';
import { B, C, V } from '../src/expr.js';

// K jeux y = a_g · x^b, b partagé, a propre à chaque jeu, bruit multiplicatif.
function jeuxPuissance(K, b, bruit, graine) {
  const r = rng(graine);
  return Array.from({ length: K }, () => {
    const a = 0.5 + 4 * r(), lo = 0.5 + 2 * r(), n = 10 + r.int(6);
    const x = Array.from({ length: n }, () => lo + 5 * r());
    return { x, y: x.map((v) => a * v ** b * (1 + bruit * r.normal())) };
  });
}

test('mise de côté : un quart de chaque jeu, reproductible, sans perte de point', () => {
  const jeux = jeuxPuissance(6, 0.7, 0.05, 3);
  const a = mettreDeCote(jeux, 7), b = mettreDeCote(jeux, 7);
  assert.deepEqual(a, b);
  jeux.forEach((j, g) => {
    assert.equal(a.vus[g].x.length + a.cotes[g].x.length, j.x.length);
    assert.equal(a.cotes[g].x.length, Math.max(1, Math.round(j.x.length / 4)));
    assert.deepEqual([...a.vus[g].x, ...a.cotes[g].x].sort(), [...j.x].sort());
  });
});

test('marques des constantes libres : conservées par la copie, ignorées par la clé de forme', () => {
  const e = marquer(B('*', C(1.37), B('^', V(0), C(2))));
  assert.equal(libres(e).length, 1);               // 2 est « simple » : constante fixe
  const c = copier(e);
  libres(c)[0].v = 9.9;
  assert.equal(libres(c).length, 1);
  assert.equal(cleForme(c), cleForme(e));
  assert.deepEqual(predire(c, [2]), [9.9 * 4]);
});

test('loi commune : forme puissance retrouvée, exposant partagé, retenue', () => {
  const jeux = jeuxPuissance(12, 0.7, 0.05, 11);
  const { vus, cotes } = mettreDeCote(jeux, 1);
  const loi = chercherLoiCommune(vus, { graine: 1 });
  assert.ok(loi);
  assert.equal(loi.partage.filter(Boolean).length, 1, 'une constante partagée');
  const exps = loi.copies.map((e) => libres(e)[loi.partage.indexOf(true)].v);
  assert.ok(exps.every((v) => v === exps[0]), 'même valeur dans tous les jeux');
  assert.ok(Math.abs(exps[0] - 0.7) < 0.05, `exposant partagé ≈ 0.7 (obtenu ${exps[0]})`);
  const v = verdict(loi, vus, cotes);
  assert.equal(v.retenue, true);
  const E = v.erreurs;
  assert.ok(E.loi.moyenne < E.droite.moyenne && E.loi.moyenne < E.constante.moyenne);
});

test('loi commune : y sans lien avec x, non retenue', () => {
  for (const graine of [5, 6]) {
    const r = rng(graine);
    const jeux = Array.from({ length: 8 }, () => {
      const m = 1 + 5 * r(), x = Array.from({ length: 10 }, () => 1 + 5 * r());
      return { x, y: x.map(() => m * (1 + 0.2 * r.normal())) };
    });
    assert.equal(loiCommune(jeux, { graine }).retenue, false);
  }
});
