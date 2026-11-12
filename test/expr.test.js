import test from 'node:test';
import assert from 'node:assert/strict';
import { parse, simplify, toString, evalPoint, evaluate, freeNames, niceForm, C, V, B, U } from '../src/expr.js';
import { rng } from '../src/fit.js';

const names = ['x', 'y', 'z'];
const close = (a, b, tol = 1e-9) => (isNaN(a) && isNaN(b)) || a === b || Math.abs(a - b) <= tol * (1 + Math.abs(a) + Math.abs(b));

function randomExpr(r, depth) {
  if (depth <= 0 || r() < 0.2) return r() < 0.6 ? V(r.int(3)) : C(r.pick([1, 2, 3, 0.5, -1, -2.5, 1.37, Math.PI, 0.25]));
  if (r() < 0.25) return U(r.pick(['sqrt', 'sin', 'cos', 'exp', 'log']), randomExpr(r, depth - 1));
  const op = r.pick(['+', '-', '*', '/', '^']);
  if (op === '^') return B('^', randomExpr(r, depth - 1), C(r.pick([2, 3, 0.5, -1, -2, 1.5, -0.5])));
  return B(op, randomExpr(r, depth - 1), randomExpr(r, depth - 1));
}

test('parse : priorités, fonctions, constantes', () => {
  assert.equal(evalPoint(parse('1+2*3', []), []), 7);
  assert.equal(evalPoint(parse('2^3^2', []), []), 512);
  assert.equal(evalPoint(parse('-2^2', []), []), -4);
  assert.equal(evalPoint(parse('(1+2)*3', []), []), 9);
  assert.ok(close(evalPoint(parse('2*pi*sqrt(L/g)', ['L', 'g']), [1, 9.81]), 2.0060666807));
  assert.ok(close(evalPoint(parse('2π·√(L / g)', ['L', 'g']), [1, 9.81]), 2.0060666807));
  assert.ok(close(evalPoint(parse('tanh(x)', ['x']), [0.7]), Math.tanh(0.7)));
  assert.equal(evalPoint(parse('1e3*x', ['x']), [2]), 2000);
});

test('parse : erreurs explicites', () => {
  assert.throws(() => parse('2*(x+', ['x']), /Formule invalide/);
  assert.throws(() => parse('2*q', ['x']), /variable inconnue/);
  assert.throws(() => parse('x x', ['x']), /inattendu/);
});

test('freeNames détecte les variables', () => {
  assert.deepEqual(freeNames('2*pi*sqrt(L/g)'), ['L', 'g']);
  assert.deepEqual(freeNames('1e3*exp(-t/tau) + e'), ['t', 'tau']);
});

test('simplify conserve la valeur (500 expressions aléatoires)', () => {
  const r = rng(7);
  let checked = 0;
  for (let k = 0; k < 500; k++) {
    const e = randomExpr(r, 4), s = simplify(e);
    for (let p = 0; p < 4; p++) {
      const x = [0.3 + r() * 3, 0.3 + r() * 3, 0.3 + r() * 3];
      const a = evalPoint(e, x), b = evalPoint(s, x);
      if (!isFinite(a)) continue;   // hors domaine : la simplification peut légitimement l'étendre
      assert.ok(close(a, b, 1e-7), `${toString(e, names)}  ≠  ${toString(s, names)} en ${x} : ${a} vs ${b}`);
      checked++;
    }
  }
  assert.ok(checked > 1000);
});

test('toString est fidèle : parse(toString(e)) ≡ e (500 expressions aléatoires)', () => {
  const r = rng(11);
  let checked = 0;
  for (let k = 0; k < 500; k++) {
    const e = simplify(randomExpr(r, 4));
    const text = toString(e, names, 17);
    let back;
    try { back = parse(text, names); } catch (err) { assert.fail(`illisible : « ${text} » — ${err.message}`); }
    for (let p = 0; p < 4; p++) {
      const x = [0.3 + r() * 3, 0.3 + r() * 3, 0.3 + r() * 3];
      const a = evalPoint(e, x), b = evalPoint(back, x);
      if (!isFinite(a)) continue;
      assert.ok(close(a, b, 1e-7), `« ${text} » : ${a} vs ${b} en ${x}`);
      checked++;
    }
  }
  assert.ok(checked > 1000);
});

test('toString : écritures attendues', () => {
  const show = (f, n) => toString(simplify(parse(f, n)), n);
  assert.equal(show('2*pi*sqrt(L/g)', ['L', 'g']), '2π·√(L / g)');
  assert.equal(show('m*v^2/2', ['m', 'v']), 'm·v^2 / 2');
  assert.equal(show('1/sqrt(1-v^2)', ['v']), '1 / √(1 − v^2)');
  assert.equal(show('5*(1-exp(-t/2))', ['t']), '5·(1 − exp(−t / 2))');
  assert.equal(show('x - 3', ['x']), 'x − 3');
});

test('évaluation vectorisée = évaluation ponctuelle', () => {
  const r = rng(3);
  for (let k = 0; k < 100; k++) {
    const e = randomExpr(r, 4);
    const X = Array.from({ length: 5 }, () => [0.3 + r() * 3, 0.3 + r() * 3, 0.3 + r() * 3]);
    const cols = [0, 1, 2].map((j) => Float64Array.from(X, (row) => row[j]));
    const v = evaluate(e, cols, 5);
    X.forEach((x, i) => assert.ok(close(v[i], evalPoint(e, x))));
  }
});

test('niceForm reconnaît les constantes simples', () => {
  assert.deepEqual(niceForm(0.5), { p: 1, q: 2, pi: false });
  assert.deepEqual(niceForm(2 * Math.PI), { p: 2, q: 1, pi: true });
  assert.equal(niceForm(5.67), null);
  assert.equal(niceForm(17 / 3), null);
});
