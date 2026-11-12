import test from 'node:test';
import assert from 'node:assert/strict';
import { parse, evalPoint, toString } from '../src/expr.js';
import { rng, fitConstants, makeData, solve, linearFit } from '../src/fit.js';
import { Search, nearestNice } from '../src/search.js';
import { Agent, verify, rank } from '../src/agent.js';
import { getWorld, customWorld, CATALOG, SIMULATORS, PLANETS, parseCsv, makeWorld } from '../src/worlds.js';

test('solve et linearFit', () => {
  assert.deepEqual(solve([[2, 0], [0, 4]], [2, 8]), [1, 2]);
  assert.equal(solve([[1, 2], [2, 4]], [1, 2]), null);
  const x = Float64Array.from([1, 2, 3, 4]), one = new Float64Array(4).fill(1);
  const w = linearFit([one, x], Float64Array.from([5, 7, 9, 11]), 4);
  assert.ok(Math.abs(w[0] - 3) < 1e-6 && Math.abs(w[1] - 2) < 1e-6);
});

test('Levenberg–Marquardt retrouve les constantes', () => {
  const r = rng(1);
  const X = Array.from({ length: 30 }, () => [r() * 5]);
  const y = X.map(([t]) => 3.2 * Math.exp(-0.7 * t) + 1.5);
  const e = parse('2*exp(-0.3*t)+1.1', ['t']);
  const err = fitConstants(e, makeData(X, y), 60);
  assert.ok(err < 1e-12, `mse ${err}`);
  assert.ok(Math.abs(evalPoint(e, [2]) - (3.2 * Math.exp(-1.4) + 1.5)) < 1e-6);
});

test('nearestNice', () => {
  assert.ok(Math.abs(nearestNice(6.28).value - 2 * Math.PI) < 1e-12);
  assert.equal(nearestNice(0.4996).value, 0.5);
});

test('Search trouve une loi simple dans des données sans bruit', () => {
  const r = rng(2);
  const X = Array.from({ length: 30 }, () => [1 + r() * 4, 1 + r() * 4]);
  const y = X.map(([a, b]) => a * a + 3 * b);
  const s = new Search({ d: 2, seed: 1 });
  s.setData(makeData(X, y));
  s.step(6000); s.polish();
  const best = s.front().at(-1);
  assert.ok(best.mse < 1e-10, `mse ${best.mse} pour ${toString(best.e, ['a', 'b'])}`);
});

test('rank préfère la loi simple quand l’ajustement est équivalent', () => {
  const front = [{ e: parse('x', ['x']), cx: 1, mse: 1.0 }, { e: parse('x+0.001*x^3', ['x']), cx: 9, mse: 0.99 }];
  const hs = rank(front, 30, 1, 10, ['x']);
  assert.equal(hs[0].text, 'x');
  assert.ok(Math.abs(hs.reduce((a, h) => a + h.weight, 0) - 1) < 1e-9);
});

test('l’agent retrouve le pendule, en n’utilisant que measure()', () => {
  const real = getWorld('pendule', { seed: 3 });
  let peeked = false;
  const blind = new Proxy(real, { get(t, k) { if (k === 'secret') { peeked = true; throw new Error('triche'); } return t[k]; } });
  const agent = new Agent(blind, { seed: 3, budget: 60 });
  const best = agent.run();
  assert.equal(peeked, false);
  assert.ok(real.experiments <= 60 + 3, 'budget respecté (à une répétition près)');
  assert.equal(agent.y.length, real.experiments);
  const v = verify(real, best.expr);
  assert.ok(v.recovered, `trouvé ${best.text}, erreurs ${v.inDomain} / ${v.extrapolation}`);
  assert.equal(best.text, '2π·√(L / g)');
  assert.equal(agent.bilan.verdict, 'établie');
  assert.ok(agent.bilan.validation.ok && agent.bilan.extrapolation.ok, 'validation et épreuve d’extrapolation passées');
  // les mesures de validation n'ont servi à l'ajustement qu'après le test
  assert.ok(agent.bilan.validation.from >= 21);
});

test('auto-évaluation : pas de certitude sans épreuve hors domaine', () => {
  const w = getWorld('cinetique', { seed: 2 });
  const agent = new Agent(w, { seed: 2, autoApprove: false });
  agent.run();
  assert.equal(agent.status, 'revue');
  agent.approve(false);
  agent.run();
  assert.equal(agent.status, 'terminé');
  assert.equal(agent.bilan.verdict, 'empirique');
  assert.match(agent.bilan.why, /pas été testée hors du domaine/);
  assert.ok(agent.X.every((x) => x.every((v, j) => v <= w.vars[j].max)), 'refus respecté');
});

test('auto-évaluation : budget trop court → verdict « incertaine », jamais « établie »', () => {
  const w = getWorld('gaz', { seed: 1 });
  const agent = new Agent(w, { seed: 1, budget: 28 });
  agent.run();
  assert.equal(agent.bilan.verdict, 'incertaine');
});

test('terra incognita : les simulateurs sont déterministes, lisses et sans formule', () => {
  for (const spec of SIMULATORS) {
    const w = getWorld(spec.id);
    assert.equal(w.secret.formula, null);
    const mid = w.vars.map((v) => (v.min + v.max) / 2);
    const a = w.secret.f(mid), b = w.secret.f(mid), c = w.secret.f(mid.map((v) => v * 1.001));
    assert.ok(isFinite(a) && a === b, spec.id);
    assert.ok(Math.abs(c - a) / Math.abs(a) < 0.01, spec.id + ' : continuité');
  }
  // contrôles physiques : petits angles → 2π ; traînée quasi nulle → v²/g
  assert.ok(Math.abs(getWorld('grand-pendule').secret.f([0.01]) - 2 * Math.PI) < 1e-3);
  assert.ok(Math.abs(SIMULATORS[0].sim([10, 1e-9]) - 100 / 9.81) < 1e-3);
  // période exacte du pendule à 90° : 4·K(sin 45°) = 7.416298709…
  assert.ok(Math.abs(getWorld('grand-pendule').secret.f([Math.PI / 2]) - 7.416298709) < 1e-4);
});

test('l’agent est reproductible à graine fixée', () => {
  const run = () => { const a = new Agent(getWorld('cinetique', { seed: 5 }), { seed: 5 }); a.run(); return [a.best().text, a.y.length, a.log.length]; };
  assert.deepEqual(run(), run());
});

test('l’agent retrouve une formule libre', () => {
  const w = customWorld('3*x^2/(1+y)', { seed: 2 });
  assert.equal(w.target, 'f');
  const agent = new Agent(w, { seed: 2 });
  const v = verify(w, agent.run().expr);
  assert.ok(v.recovered, agent.best().text);
});

test('revue humaine : sans approbation, aucune mesure ; avec approbation, la saturation est démasquée', () => {
  // Une saturation invisible dans le domaine sûr : x/(1+x/40) ressemble à une droite sur [0,2].
  const mk = () => makeWorld({ id: 't', title: 't', formula: 'x/(1+x/40)', vars: [{ name: 'x', min: 0, max: 2 }], noise: 0.01, seed: 1, extend: 8 });
  const w = mk();
  const agent = new Agent(w, { seed: 1, autoApprove: false });
  agent.run();
  assert.equal(agent.status, 'revue');
  assert.equal(agent.pending.ext[0][1], 16);
  const n = w.experiments;
  agent.step(); agent.step();
  assert.equal(w.experiments, n, 'aucune expérience tant que l’humain n’a pas répondu');
  agent.approve(true);
  const best = agent.run();
  assert.equal(agent.status, 'terminé');
  assert.ok(agent.X.some(([x]) => x > 2), 'mesures hors du domaine sûr après accord');
  assert.ok(verify(w, best.expr).sameForm, best.text);
});

test('données réelles : troisième loi de Kepler', () => {
  const data = { names: ['a'], target: 'T', X: PLANETS.rows.map((r) => [r[1]]), y: PLANETS.rows.map((r) => r[2]) };
  const agent = new Agent(null, { seed: 1, data });
  assert.equal(agent.run().text, 'a^(3/2)');
  assert.equal(agent.bilan.verdict, 'empirique', 'sans expérience possible, jamais « établie »');
});

test('catalogue : toutes les lois sont définies sur leur domaine', () => {
  for (const spec of CATALOG) {
    const w = getWorld(spec.id);
    const r = rng(1);
    for (let k = 0; k < 200; k++) assert.ok(isFinite(w.secret.f(w.vars.map((v) => v.min + r() * (v.max - v.min)))), spec.id);
  }
});

test('customWorld refuse les formules indéfinies', () => {
  assert.throws(() => customWorld('log(x-10)'), /pas définie/);
  assert.throws(() => customWorld('42'), /au moins une variable/);
});

test('parseCsv', () => {
  const d = parseCsv('a;T\n1;1\n4;8\n');
  assert.deepEqual(d, { names: ['a'], target: 'T', X: [[1], [4]], y: [1, 8] });
  assert.deepEqual(parseCsv('1,2,3\n4,5,6').names, ['x1', 'x2']);
  assert.throws(() => parseCsv('a,b\n1,zz'), /CSV invalide/);
});
