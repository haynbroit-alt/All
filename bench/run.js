#!/usr/bin/env node
// Banc d'essai : chaque loi du catalogue × plusieurs graines × deux stratégies d'expérience.
// Usage : node bench/run.js [--seeds 5] [--noise 0.01] [--quick]
import { writeFileSync } from 'node:fs';
import { CATALOG, SIMULATORS, getWorld } from '../src/worlds.js';
import { Agent, verify } from '../src/agent.js';

const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : def; };
const quick = process.argv.includes('--quick');
const seeds = Number(arg('seeds', quick ? 2 : 5));
const noises = arg('noise', quick ? '0.01' : '0.01,0.05').split(',').map(Number);
const modes = ['actif', 'aléatoire'];
const out = { date: new Date().toISOString(), node: process.version, seeds, noises, runs: [] };

for (const noise of noises) for (const spec of CATALOG) for (const mode of modes) for (let seed = 1; seed <= seeds; seed++) {
  const world = getWorld(spec.id, { seed, noise });
  const t0 = Date.now();
  const agent = new Agent(world, { seed, mode });
  const best = agent.run();
  const v = verify(world, best.expr);
  out.runs.push({ world: spec.id, truth: spec.formula, noise, mode, seed, found: best.text, experiments: world.experiments,
    cycles: agent.cycle, ms: Date.now() - t0, inDomain: v.inDomain, extrapolation: v.extrapolation, recovered: v.recovered, sameForm: v.sameForm, verdict: agent.bilan.verdict,
    stopped: agent.exhausted ? 'budget' : 'convaincu' });
}

const pct = (a) => (a.length ? Math.round((100 * a.filter((r) => r.recovered).length) / a.length) : 0);
const mean = (a, f) => (a.length ? a.reduce((s, r) => s + f(r), 0) / a.length : 0);
let md = `# Résultats du banc d'essai\n\nGénéré par \`node bench/run.js\` le ${out.date.slice(0, 10)} (Node ${out.node}), ${seeds} graines par configuration.\n\n`;
md += `Deux critères, tous deux jugés sans que l'agent y ait accès. **Précise** : sur 2000 points neufs, erreur normalisée < 0,5 % dans le domaine et < 1 % en extrapolation. **Bonne forme** : après réajustement des constantes sur la vérité sans bruit, l'erreur tombe sous 0,1 % (la structure est la bonne, même si le bruit a faussé une constante).\n\n`;
out.summary = [];
for (const noise of noises) {
  md += `## Bruit de mesure : ${noise * 100} % de l'amplitude\n\n| Loi cachée | Vérité | Agent : précise | bonne forme | exp. | Hasard : précise | bonne forme | exp. |\n|---|---|---:|---:|---:|---:|---:|---:|\n`;
  for (const spec of CATALOG) {
    const sel = (mode) => out.runs.filter((r) => r.world === spec.id && r.noise === noise && r.mode === mode);
    const a = sel('actif'), b = sel('aléatoire');
    md += `| ${spec.title} | \`${spec.formula}\` | ${a.filter((r) => r.recovered).length}/${a.length} | ${a.filter((r) => r.sameForm).length}/${a.length} | ${mean(a, (r) => r.experiments).toFixed(0)} | ${b.filter((r) => r.recovered).length}/${b.length} | ${b.filter((r) => r.sameForm).length}/${b.length} | ${mean(b, (r) => r.experiments).toFixed(0)} |\n`;
  }
  for (const mode of modes) {
    const all = out.runs.filter((r) => r.noise === noise && r.mode === mode);
    const s = { noise, mode, recovered: pct(all), sameForm: Math.round((100 * all.filter((r) => r.sameForm).length) / all.length), runs: all.length, experiments: mean(all, (r) => r.experiments), seconds: mean(all, (r) => r.ms) / 1000,
      falseCertainty: all.filter((r) => !r.sameForm && r.verdict === 'établie').length };
    out.summary.push(s);
  }
  const [sa, sb] = out.summary.slice(-2);
  md += `| **Total** | | **${sa.recovered} %** | **${sa.sameForm} %** | ${sa.experiments.toFixed(0)} | **${sb.recovered} %** | **${sb.sameForm} %** | ${sb.experiments.toFixed(0)} |\n\n`;
  md += `Durée moyenne par découverte : ${sa.seconds.toFixed(1)} s. Verdicts « établie » sur une forme fausse : ${sa.falseCertainty} (actif), ${sb.falseCertainty} (aléatoire).\n\n`;
  md += `**L'agent sait-il quand il se trompe ?** Son verdict, comparé à la vérité qu'il ne voit pas (stratégie « agent ») :\n\n| Verdict de l'agent | Nombre | Forme réellement bonne | Forme fausse |\n|---|---:|---:|---:|\n`;
  for (const vd of ['établie', 'empirique', 'incertaine']) {
    const g = out.runs.filter((r) => r.noise === noise && r.mode === 'actif' && r.verdict === vd);
    md += `| ${vd} | ${g.length} | ${g.filter((r) => r.sameForm).length} | ${g.filter((r) => !r.sameForm).length} |\n`;
    out.summary.push({ noise, verdict: vd, n: g.length, right: g.filter((r) => r.sameForm).length });
  }
  md += '\n';
  const fails = out.runs.filter((r) => r.noise === noise && !r.sameForm);
  if (fails.length) {
    md += `<details><summary>Formes fausses (${fails.length})</summary>\n\n| Loi | Mode | Graine | Trouvé | Erreur domaine | Erreur extrapolation | Verdict de l'agent |\n|---|---|---:|---|---:|---:|---|\n`;
    for (const r of fails) md += `| ${r.world} | ${r.mode} | ${r.seed} | \`${r.found}\` | ${(r.inDomain * 100).toFixed(2)} % | ${(r.extrapolation * 100).toFixed(2)} % | ${r.verdict} |\n`;
    md += `\n</details>\n\n`;
  }
}
// ---- terra incognita : simulateurs sans formule exacte
md += `## Terra incognita : systèmes sans formule exacte\n\nSeul le micro-mécanisme est codé (une équation différentielle intégrée pas à pas). Il n'y a pas de « bonne forme » à retrouver : on juge la loi proposée sur 400 simulations neuves. Bruit de mesure 1 %.\n\n| Système | Graine | Loi proposée par l'agent | Erreur domaine | Erreur extrapolation | Verdict de l'agent | Exp. |\n|---|---:|---|---:|---:|---|---:|\n`;
out.sims = [];
for (const spec of SIMULATORS) for (let seed = 1; seed <= (quick ? 1 : 3); seed++) {
  const world = getWorld(spec.id, { seed, noise: 0.01 });
  const agent = new Agent(world, { seed });
  const best = agent.run();
  const v = verify(world, best.expr);
  const r = { world: spec.id, title: spec.title, target: spec.target, seed, found: best.text, inDomain: v.inDomain, extrapolation: v.extrapolation, verdict: agent.bilan.verdict, experiments: world.experiments };
  out.sims.push(r);
  md += `| ${spec.title} | ${seed} | \`${spec.target} = ${r.found}\` | ${(r.inDomain * 100).toFixed(2)} % | ${(r.extrapolation * 100).toFixed(2)} % | ${r.verdict} | ${r.experiments} |\n`;
}
md += '\n';
if (!quick) { writeFileSync(new URL('./results.json', import.meta.url), JSON.stringify(out, null, 1)); writeFileSync(new URL('./RESULTS.md', import.meta.url), md); }
console.log(md);
