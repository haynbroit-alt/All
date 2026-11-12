// L'agent scientifique : il choisit ses expériences, confronte ses hypothèses aux mesures,
// révise ses croyances et s'arrête quand une loi s'impose.
//
// Boucle : OBSERVER → COMPRENDRE → CONFRONTER → (HYPOTHÈSES) → ANTICIPER → PRIORISER → DÉCIDER
//          → SIMULER → EXÉCUTER | REVUE HUMAINE → MESURER → APPRENDRE → RÉVISER → DREAMING → ↺
import { toString, evalPoint, shapeKey } from './expr.js';
import { rng, makeData } from './fit.js';
import { Search } from './search.js';

export const PHASES = ['OBSERVER', 'COMPRENDRE', 'CONFRONTER', 'HYPOTHÈSES', 'ANTICIPER', 'PRIORISER', 'DÉCIDER',
  'SIMULER', 'EXÉCUTER', 'REVUE HUMAINE', 'MESURER', 'APPRENDRE', 'RÉVISER', 'DREAMING'];

/**
 * Classe les hypothèses du front de Pareto par vraisemblance pénalisée (type BIC, corrigé pour petits échantillons).
 * sigma connu  : score = χ² + pénalité ;  sinon : score = N·ln(MSE) + pénalité.
 * Renvoie les hypothèses triées, avec un poids a posteriori normalisé.
 */
export function rank(front, n, sigma, varY, names) {
  const hs = front.map((m) => {
    const pen = m.cx * Math.log(Math.max(n, 2)) * (n / Math.max(n - m.cx - 1, 1));
    const fitTerm = sigma > 0 ? (n * m.mse) / (sigma * sigma) : n * Math.log(Math.max(m.mse, 1e-12 * varY) / varY);
    return { expr: m.e, cx: m.cx, mse: m.mse, score: fitTerm + pen, chi2red: sigma > 0 ? m.mse / (sigma * sigma) : null };
  });
  hs.sort((a, b) => a.score - b.score);
  if (!hs.length) return hs;
  const s0 = hs[0].score;
  let z = 0;
  for (const h of hs) { h.weight = Math.exp(-(h.score - s0) / 2); z += h.weight; }
  for (const h of hs) { h.weight /= z; h.text = toString(h.expr, names); }
  // deux écritures identiques à l'affichage : on ne garde que la mieux classée
  const seen = new Set();
  return hs.filter((h) => (seen.has(h.text) ? false : seen.add(h.text)));
}

export class Agent {
  /**
   * @param world  monde à explorer (voir worlds.js) ; null en mode « données fournies ».
   * @param o      budget : nombre max d'expériences ; mode : 'actif' | 'aléatoire' ;
   *               effort : mutations explorées par cycle ; autoApprove : accepte seul les extensions de domaine.
   */
  constructor(world, { seed = 1, budget = 60, mode = 'actif', effort = 1500, autoApprove = true, data = null, maxCycles = 40 } = {}) {
    this.world = world;
    this.mode = mode;
    this.budget = budget;
    this.effort = effort;
    this.autoApprove = autoApprove;
    this.maxCycles = maxCycles;
    this.r = rng(seed * 104729 + 7);
    this.names = world ? world.names : data.names;
    this.target = world ? world.target : data.target || 'y';
    this.d = this.names.length;
    this.domain = world ? world.domain.map((b) => [...b]) : null;
    this.X = data ? data.X.map((r) => [...r]) : [];
    this.y = data ? [...data.y] : [];
    this.sigma = 0;
    this.noiseSS = 0; this.noiseDF = 0;
    this.sigmaKnown = false;
    this.search = new Search({ d: this.d, seed: seed * 31 + 5 });
    this.hyps = [];
    this.log = [];
    this.history = [];      // { cycle, n, top, weight }
    this.predictions = [];  // { x, pred, y, z }
    this.cycle = 0;
    this.status = 'prêt';
    this.phase = null;
    this.pending = null;    // proposition en attente de validation humaine
    this.decision = null;
    this.next = null;       // prochaine expérience choisie
    this.extended = false;
    this.holdUntil = 0;
    this.stable = 0;
    this._gen = this._loop();
  }

  /** Avance d'une phase. Renvoie { phase, status }. */
  step() {
    if (this.status === 'terminé') return { phase: this.phase, status: this.status };
    if (this.status === 'revue' && this.decision === null) return { phase: this.phase, status: this.status };
    const r = this._gen.next();
    if (r.done) this.status = 'terminé';
    return { phase: this.phase, status: this.status };
  }
  /** Exécute jusqu'à la fin (ou jusqu'à une demande de revue humaine). */
  run() { while (this.status !== 'terminé' && !(this.status === 'revue' && this.decision === null)) this.step(); return this.best(); }
  approve(ok) { this.decision = !!ok; }
  best() { return this.hyps[0] || null; }

  _say(phase, msg) { this.phase = phase; this.log.push({ cycle: this.cycle, phase, msg }); }
  _fmtX(x) { return x.map((v, j) => `${this.names[j]}=${Number(v.toPrecision(3))}`).join(', '); }
  _data() { return makeData(this.X, this.y); }
  _varY() { const n = this.y.length; const m = this.y.reduce((a, b) => a + b, 0) / n; return this.y.reduce((a, b) => a + (b - m) ** 2, 0) / n || 1; }
  _rand(dom = this.domain) { return dom.map(([a, b]) => a + this.r() * (b - a)); }
  _measure(x) {
    const y = this.world.measure(x);
    if (isFinite(y)) { this.X.push([...x]); this.y.push(y); }
    return y;
  }
  /** Répète k fois la même expérience en un point neuf et affine l'estimation du bruit. */
  _replicate(k) {
    const x = this._rand();
    const vals = [];
    for (let i = 0; i < k; i++) { const v = this._measure(x); if (isFinite(v)) vals.push(v); }
    if (vals.length >= 2) {
      const m = vals.reduce((a, b) => a + b, 0) / vals.length;
      this.noiseSS += vals.reduce((a, b) => a + (b - m) ** 2, 0); this.noiseDF += vals.length - 1;
    }
    this.sigma = Math.max(this.noiseDF ? Math.sqrt(this.noiseSS / this.noiseDF) : 0, 1e-7 * Math.sqrt(this._varY()));
  }
  _believe() {
    this.search.polish();
    this.hyps = rank(this.search.front(), this.y.length, this.sigmaKnown ? this.sigma : 0, this._varY(), this.names);
  }
  _minDist(x) {
    let best = Infinity;
    for (const p of this.X) {
      let s = 0;
      for (let j = 0; j < this.d; j++) { const w = this.domain[j][1] - this.domain[j][0]; const dd = (x[j] - p[j]) / w; s += dd * dd; }
      if (s < best) best = s;
    }
    return Math.sqrt(best);
  }
  /** Désaccord attendu (en σ²) entre la meilleure hypothèse et ses rivales en un point x. */
  _utility(x) {
    const hs = this.hyps;
    if (hs.length < 2) return 0;
    const top = evalPoint(hs[0].expr, x);
    if (!isFinite(top)) return 0;
    const s1 = hs[1].score;
    let u = 0, z = 0;
    for (let i = 1; i < Math.min(hs.length, 9); i++) {
      const w = Math.exp(-(hs[i].score - s1) / 6);
      const f = evalPoint(hs[i].expr, x);
      if (!isFinite(f)) continue;
      u += w * (f - top) ** 2; z += w;
    }
    return z ? u / z / (this.sigma * this.sigma) : 0;
  }

  *_loop() {
    const passive = !this.world;
    this.status = 'en cours';

    // ------------------------------------------------------------------ OBSERVER
    if (!passive) {
      const n0 = Math.max(8, 5 * this.d + 2);
      // plan initial : hypercube latin
      const perms = this.domain.map(() => Array.from({ length: n0 }, (_, i) => i).sort(() => this.r() - 0.5));
      for (let i = 0; i < n0; i++) this._measure(this.domain.map(([a, b], j) => a + ((perms[j][i] + this.r()) / n0) * (b - a)));
      // répétitions : la même expérience plusieurs fois, pour estimer le bruit de mesure
      for (let g = 0; g < 3; g++) this._replicate(3);
      this.sigmaKnown = true;
      this._say('OBSERVER', `${this.y.length} mesures initiales, dont 3 expériences répétées 3 fois : bruit de mesure estimé σ ≈ ${Number(this.sigma.toPrecision(2))}.`);
    } else {
      this._say('OBSERVER', `${this.y.length} observations fournies ; aucune expérience possible, le bruit est inconnu.`);
    }
    this.search.setData(this._data());
    if (this.sigmaKnown) this.search.setNoise(this.sigma);
    yield;

    let extraEffort = 1, contradiction = false, prevShape = null, calibrated = 0;
    for (this.cycle = 1; this.cycle <= this.maxCycles; this.cycle++) {
      // ---------------------------------------------------------------- COMPRENDRE
      const chunks = 4;
      for (let c = 0; c < chunks; c++) {
        this.search.step(Math.round((this.effort * extraEffort) / chunks));
        this.phase = 'COMPRENDRE';
        yield;
      }
      this._believe();
      const top = this.hyps[0];
      this._say('COMPRENDRE', `Meilleure explication : ${this.target} = ${top.text}  (confiance ${(top.weight * 100).toFixed(0)} %, ${this.hyps.length} hypothèses en lice).`);
      yield;

      // ---------------------------------------------------------------- CONFRONTER
      const last = this.predictions[this.predictions.length - 1];
      if (last && last.cycle === this.cycle - 1) {
        contradiction = Math.abs(last.z) > 3;
        this._say('CONFRONTER', contradiction
          ? `Contradiction : la mesure s'écarte de ${Math.abs(last.z).toFixed(1)} σ de ma prédiction. Ma théorie était fausse à cet endroit.`
          : `Confirmation : la mesure tombe à ${Math.abs(last.z).toFixed(1)} σ de ma prédiction.`);
        yield;
      } else contradiction = false;

      // ---------------------------------------------------------------- HYPOTHÈSES
      if (contradiction) {
        this.search.step(this.effort);
        this._believe();
        this._say('HYPOTHÈSES', `Je cherche de nouvelles formes de loi. Candidate actuelle : ${this.target} = ${this.hyps[0].text}.`);
        yield;
      }
      const shape = shapeKey(this.hyps[0].expr);
      this.stable = shape === prevShape ? this.stable + 1 : 0;
      prevShape = shape;
      this.history.push({ cycle: this.cycle, n: this.y.length, top: this.hyps[0].text, weight: this.hyps[0].weight });

      if (passive) {
        this._say('DREAMING', `Auto-audit : forme ${this.stable ? `stable depuis ${this.stable} cycle(s)` : 'encore changeante'}.`);
        yield;
        if (this.stable >= 4 && this.cycle >= 6) break;
        continue;
      }

      // ---------------------------------------------------------------- ANTICIPER
      const cands = [];
      for (let k = 0; k < 400; k++) { const x = this._rand(); cands.push({ x, u: this._utility(x), dmin: this._minDist(x) }); }
      const spacing = Math.pow(this.y.length, -1 / this.d);
      let maxU = 0;
      for (const c of cands) { c.gain = c.u * (0.4 + Math.min(c.dmin / spacing, 1.5)); if (c.u > maxU) maxU = c.u; }
      this.candidates = cands;
      this._say('ANTICIPER', maxU >= 1
        ? `Mes hypothèses se contredisent jusqu'à ${Math.sqrt(maxU).toFixed(1)} σ dans le domaine : une expérience peut les départager.`
        : `Mes hypothèses sont indiscernables dans le domaine (écart max ${Math.sqrt(maxU).toFixed(2)} σ).`);
      yield;

      // ---------------------------------------------------------------- PRIORISER
      let choice;
      if (this.mode === 'aléatoire') choice = { x: this._rand(), why: 'tirage au hasard (mode témoin)' };
      else if (maxU >= 1) {
        const c = cands.reduce((a, b) => (b.gain > a.gain ? b : a));
        choice = { x: c.x, why: `désaccord attendu ${Math.sqrt(c.u).toFixed(1)} σ` };
      } else {
        const c = cands.reduce((a, b) => (b.dmin > a.dmin ? b : a));
        choice = { x: c.x, why: 'zone la moins explorée' };
      }
      this.next = choice;
      this._say('PRIORISER', `Expérience la plus utile : ${this._fmtX(choice.x)} (${choice.why}).`);
      yield;

      // ---------------------------------------------------------------- DÉCIDER
      const topH = this.hyps[0];
      const recent = this.predictions.slice(-3);
      const confirmed = recent.length >= 3 && recent.every((p) => Math.abs(p.z) < 3);
      const adequate = topH.chi2red !== null && topH.chi2red < 2.2;
      const settled = topH.weight >= 0.9 && this.stable >= 3 && confirmed && adequate;
      const left = this.budget - this.world.experiments;
      if (settled && this.mode === 'actif' && maxU < 1 && !this.extended && this.world.extend > 1) {
        // Risque : sortir du domaine sûr pour tester la loi en extrapolation.
        const ext = this.domain.map(([a, b]) => [a, a + (b - a) * this.world.extend]);
        let bestExt = null;
        for (let k = 0; k < 300; k++) { const x = this._rand(ext); const u = this._utility(x); if (!bestExt || u > bestExt.u) bestExt = { x, u }; }
        if (bestExt && bestExt.u > 9) {
          this.pending = { ext, x: bestExt.x, u: bestExt.u };
          this.status = 'revue'; this.decision = this.autoApprove ? true : null;
          this._say('REVUE HUMAINE', `Dans le domaine sûr, plus rien ne distingue mes hypothèses ; hors domaine (${this._fmtX(bestExt.x)}) elles divergent de ${Math.sqrt(bestExt.u).toFixed(0)} σ. Je demande l'autorisation d'élargir le domaine d'expérience.`);
          yield;
          while (this.decision === null) yield;
          this.status = 'en cours';
          if (this.decision) {
            this.domain = ext; this.extended = true; this.next = { x: bestExt.x, why: 'extrapolation autorisée' };
            this.holdUntil = this.world.experiments + 3;   // au moins 3 mesures hors de l'ancien domaine avant de conclure
            this._say('DÉCIDER', this.autoApprove ? 'Extension approuvée automatiquement (mode sans supervision).' : 'Extension approuvée par l’humain.');
          } else {
            this.extended = true;
            this._say('DÉCIDER', 'Extension refusée : je reste dans le domaine sûr.');
          }
          this.pending = null; this.decision = null;
          yield;
        }
      }
      if (settled && this.world.experiments >= this.holdUntil && (maxU < 1 || this.stable >= 6)) {
        this._say('DÉCIDER', `J'arrête : la même loi tient depuis ${this.stable} cycles, mes 3 dernières prédictions ont été confirmées et χ² réduit = ${topH.chi2red.toFixed(2)}.`);
        yield;
        break;
      }
      if (left <= 0) {
        this._say('DÉCIDER', `Budget d'expériences épuisé (${this.budget}). Je rends ma meilleure hypothèse sans certitude.`);
        this.exhausted = true;
        yield;
        break;
      }
      this._say('DÉCIDER', `Je continue (${left} expérience(s) restante(s)).`);
      yield;

      // ---------------------------------------------------------------- SIMULER
      const x = this.next.x;
      const pred = evalPoint(topH.expr, x);
      const rivals = this.hyps.slice(1, 4).map((h) => evalPoint(h.expr, x)).filter(isFinite);
      this._say('SIMULER', `Si ma loi est juste, je mesurerai ${this.target} ≈ ${Number(pred.toPrecision(4))}` +
        (rivals.length ? ` ; mes rivales prédisent ${rivals.map((v) => Number(v.toPrecision(4))).join(', ')}.` : '.'));
      yield;

      // ---------------------------------------------------------------- EXÉCUTER + MESURER
      this.phase = 'EXÉCUTER';
      const y = this._measure(x);
      if (!isFinite(y)) {
        this._say('MESURER', `L'expérience ${this._fmtX(x)} est impossible (résultat non défini). Je l'écarte.`);
        yield;
        continue;
      }
      const z = (y - pred) / this.sigma;
      this.predictions.push({ cycle: this.cycle, x, pred, y, z });
      this._say('MESURER', `Mesuré ${this.target} = ${Number(y.toPrecision(4))} en ${this._fmtX(x)}.`);
      yield;

      // ---------------------------------------------------------------- APPRENDRE + RÉVISER
      this.search.setData(this._data());
      this._believe();
      this._say('RÉVISER', `Croyances mises à jour sur ${this.y.length} mesures. En tête : ${this.target} = ${this.hyps[0].text} (${(this.hyps[0].weight * 100).toFixed(0)} %).`);
      yield;

      // ---------------------------------------------------------------- DREAMING (auto-audit)
      const zs = this.predictions.slice(-8).map((p) => Math.abs(p.z));
      calibrated = zs.filter((v) => v < 2).length / zs.length;
      const chi = this.hyps[0].chi2red;
      const left2 = this.budget - this.world.experiments;
      if (chi > 1.6 && this.noiseDF < 16 && left2 >= 3 && this.stable >= 1) {
        // Avant d'accuser la loi, je doute de ma propre estimation du bruit.
        const before = this.sigma;
        this._replicate(3);
        this.search.setNoise(this.sigma);
        this.search.setData(this._data());
        this._believe();
        this._say('DREAMING', `Auto-audit : χ² réduit = ${chi.toFixed(1)}. Soit ma loi est fausse, soit j'ai sous-estimé le bruit : je répète une expérience 3 fois. σ : ${Number(before.toPrecision(2))} → ${Number(this.sigma.toPrecision(2))}.`);
      } else if (chi > 2.2 && this.cycle >= 3) {
        extraEffort = Math.min(extraEffort * 1.5, 4);
        this._say('DREAMING', `Auto-audit : χ² réduit = ${chi.toFixed(1)} — ma meilleure loi n'explique pas les données. J'augmente l'effort de recherche (×${extraEffort.toFixed(1)}).`);
      } else {
        extraEffort = Math.max(1, extraEffort / 1.5);
        this._say('DREAMING', `Auto-audit : ${(calibrated * 100).toFixed(0)} % de mes dernières prédictions à moins de 2 σ ; χ² réduit = ${chi.toFixed(2)}.`);
      }
      yield;
    }
    this._believe();
    this.phase = null;
    this.status = 'terminé';
  }
}

/**
 * Vérification indépendante : compare une loi trouvée à la vérité sur des points neufs,
 * dans le domaine puis en extrapolation (domaine élargi de 50 %). Erreurs normalisées par l'écart-type de la vérité.
 */
export function verify(world, expr, seed = 12345) {
  const r = rng(seed);
  const nrmse = (dom) => {
    let se = 0, n = 0; const ys = [];
    for (let k = 0; k < 2000; k++) {
      const x = dom.map(([a, b]) => a + r() * (b - a));
      const t = world.secret.f(x);
      if (!isFinite(t)) continue;
      const p = evalPoint(expr, x);
      se += isFinite(p) ? (p - t) ** 2 : Infinity; n++; ys.push(t);
    }
    const m = ys.reduce((a, b) => a + b, 0) / n;
    const v = ys.reduce((a, b) => a + (b - m) ** 2, 0) / n;
    return Math.sqrt(se / n / v);
  };
  const base = world.vars.map((v) => [v.min, v.max]);
  const k = world.extend > 1 ? 1.5 : 1;
  const inDomain = nrmse(base);
  const extrapolation = nrmse(base.map(([a, b]) => [a, a + (b - a) * k]));
  return { inDomain, extrapolation, recovered: inDomain < 0.005 && extrapolation < 0.01 };
}
