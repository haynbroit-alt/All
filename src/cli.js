#!/usr/bin/env node
// Galilée en ligne de commande.
import { readFileSync } from 'node:fs';
import { CATALOG, getWorld, customWorld, PLANETS, parseCsv } from './worlds.js';
import { Agent, verify } from './agent.js';

const HELP = `Galilée — un agent qui redécouvre des lois par l'expérience.

  galilee list                          liste les lois cachées disponibles
  galilee discover <id> [options]       lance l'agent sur une loi du catalogue
  galilee formula "<formule>" [options] lance l'agent sur votre propre loi cachée, ex. "3*x^2/(1+y)"
  galilee data <fichier.csv>            cherche une loi dans vos données (dernière colonne = grandeur à expliquer)
  galilee kepler                        données réelles des huit planètes

Options : --seed N   --noise 0.01   --budget 60   --mode actif|aléatoire   --quiet
          --range x=1:5 (répétable, pour « formula »)`;

const args = process.argv.slice(2);
const cmd = args[0];
const opt = (name, def) => { const i = args.indexOf('--' + name); return i > 0 ? args[i + 1] : def; };
const flag = (name) => args.includes('--' + name);
const seed = Number(opt('seed', 1));

function report(agent, world) {
  if (!flag('quiet')) for (const l of agent.log) console.log(`[${String(l.cycle).padStart(2)}] ${l.phase.padEnd(13)} ${l.msg}`);
  const best = agent.best();
  console.log(`\nLoi proposée :  ${agent.target} = ${best.text}`);
  console.log(`Confiance ${(best.weight * 100).toFixed(0)} % · complexité ${best.cx} · ${agent.y.length} mesures · ${agent.cycle} cycles`);
  console.log('\nHypothèses concurrentes :');
  for (const h of agent.hyps.slice(0, 6)) console.log(`  ${(h.weight * 100).toFixed(1).padStart(5)} %  ${agent.target} = ${h.text}`);
  if (world) {
    const v = verify(world, best.expr);
    console.log(`\nVérité cachée :  ${agent.target} = ${world.secret.formula}`);
    console.log(`Vérification sur 2000 points neufs : erreur ${(v.inDomain * 100).toFixed(3)} % dans le domaine, ${(v.extrapolation * 100).toFixed(3)} % en extrapolation`);
    console.log(v.recovered ? '→ Loi retrouvée.' : '→ Loi NON retrouvée (approximation seulement).');
    process.exitCode = v.recovered ? 0 : 2;
  }
}

try {
  if (cmd === 'list') {
    for (const w of CATALOG) console.log(`${w.id.padEnd(15)} ${w.title.padEnd(28)} ${w.target} = f(${w.vars.map((v) => v.name).join(', ')})`);
  } else if (cmd === 'discover' || cmd === 'formula') {
    const o = { seed, noise: Number(opt('noise', 0.01)) };
    let world;
    if (cmd === 'discover') world = getWorld(args[1], o);
    else {
      const ranges = {};
      args.forEach((a, i) => { if (a === '--range') { const [n, r] = args[i + 1].split('='); ranges[n] = r.split(':').map(Number); } });
      world = customWorld(args[1], { ...o, ranges });
    }
    console.log(`Monde : ${world.title}. L'agent peut régler ${world.vars.map((v) => `${v.name} ∈ [${v.min}, ${v.max}]`).join(', ')} et mesurer ${world.target}.\n`);
    const agent = new Agent(world, { seed, budget: Number(opt('budget', 60)), mode: opt('mode', 'actif') });
    agent.run();
    report(agent, world);
  } else if (cmd === 'data' || cmd === 'kepler') {
    const data = cmd === 'kepler'
      ? { names: PLANETS.names, target: PLANETS.target, X: PLANETS.rows.map((r) => [r[1]]), y: PLANETS.rows.map((r) => r[2]) }
      : parseCsv(readFileSync(args[1], 'utf8'));
    const agent = new Agent(null, { seed, data });
    agent.run();
    report(agent, null);
  } else console.log(HELP);
} catch (err) {
  console.error('Erreur : ' + err.message);
  process.exitCode = 1;
}
