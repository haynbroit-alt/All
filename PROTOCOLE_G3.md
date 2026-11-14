# Protocole G3 — terres inconnues mathématiques

Écrit le 14 novembre 2026, **avant le code et avant toute exécution**. Aucun fichier du moteur n'est modifié :
des mondes nouveaux et un banc (`bench/math.js`), rien d'autre.

## Idée

Jusqu'ici GALILÉE n'a interrogé que des mondes simulés à partir d'une formule cachée, ou reçu des données figées.
Un objet mathématique est un monde **réel et interrogeable à volonté** : le moteur choisit un entier `n`, on calcule
la valeur exacte. Et une loi s'y vérifie sans appel : on calcule l'objet bien plus loin que tout ce que le moteur a
vu, et on compare. Question : les lois que GALILÉE tire d'une plage de mesures prédisent-elles l'objet 10 fois et
100 fois plus loin ?

## Mondes

Le moteur mesure `y = f(n)/f(N)` pour `x = n/N` dans `[0,01 ; 1]` (il peut pousser seul jusqu'à `x = 2`, c'est son
épreuve interne). `N` vaut 100 000 pour les sommes, 10 000 pour les suites. Vérification à `x = 10` et `x = 100`.

**Lot de réglage** (lois connues, hors critères) : somme des inverses jusqu'à `n` ; nombre d'entiers sans facteur
carré ; somme des sommes de diviseurs. Sert à fixer le bruit et la mise à l'échelle, puis plus rien ne bouge.

**Lot A — témoins, loi démontrée** :

| | Objet | Loi connue |
|---|---|---|
| A1 | somme du nombre de diviseurs des entiers jusqu'à `n` | `n·ln n + (2γ − 1)·n` |
| A2 | somme de l'indicatrice d'Euler jusqu'à `n` | `3n²/π²` |
| A3 | nombre de nombres premiers jusqu'à `n` | `n/ln n` au premier ordre |
| A4 | logarithme de `n!` | `n·ln n − n + ½·ln(2πn)` |
| A5 | `n`-ième nombre premier | `n·(ln n + ln ln n − 1)` |
| A6 | somme du nombre de facteurs premiers distincts jusqu'à `n` | `n·ln ln n + 0,2615·n` |

**Lot B — terres inconnues** :

| | Objet | Ce qu'on en sait |
|---|---|---|
| B1 | `n`-ième terme de la suite `a → a + (nombre de diviseurs de a)`, depuis 1 | loi inconnue de moi ; l'estimation naïve suppose que la suite voit des entiers « moyens » |
| B2 | `n`-ième terme de `a → a + (nombre de 1 dans l'écriture binaire de a)`, depuis 1 | idem |
| B3 | `n`-ième terme de `a → a + (somme des chiffres décimaux de a)`, depuis 1 | idem |
| B4 | somme des temps de vol de Syracuse des entiers jusqu'à `n` | estimation probabiliste connue, non démontrée |
| B5 | nombre de couples de premiers jumeaux jusqu'à `n` | conjecture de Hardy et Littlewood, non démontrée |
| B6 | nombre de premiers `p ≤ n` dont 2 est racine primitive | conjecture d'Artin, non démontrée |

## Dispositif

- `Agent` de `src/agent.js` au commit de `main` (option `doute` absente, donc comportement du moteur gelé), réglages
  par défaut (80 expériences, mode actif), graines 1, 2 et 3. Le moteur ne reçoit rien d'autre que ses mesures.
- Par exécution : loi rendue, verdict, erreur relative à `x = 10` et à `x = 100`.
- Témoins simples, ajustés sur 50 points de la plage `[0,01 ; 1]` : une droite, et une loi de puissance.
- Une exécution **réussit** si l'erreur relative est au plus 1 % à `x = 10` et au plus 2 % à `x = 100`.
  Un monde est **prédit** si au moins 2 graines sur 3 réussissent.

## Critères, fixés avant le test

- **M1 (principal)** : au moins 4 mondes du lot A sur 6 sont prédits.
- **M2 (franchise)** : aucune exécution, lots A et B, n'est dite « établie » avec plus de 10 % d'erreur à `x = 100`.
- **Lot B, sans seuil** : c'est une exploration. Une loi qui réussit est consignée comme *loi empirique vérifiée
  jusqu'à 100 fois la plage mesurée* — ni théorème, ni découverte tant qu'elle n'est pas confrontée à ce qui est
  déjà publié. Les échecs sont consignés de la même façon.

Exécution **unique** des lots A et B. Aucun critère n'est rattrapé par un second essai.

## Limites connues d'avance

- Une loi juste à 100 fois la plage peut être fausse à l'infini : en arithmétique, des termes en `ln ln n` ne se
  voient pas à cette échelle.
- Douze objets, trois graines : des constats, pas des statistiques.
- Je connais les lois du lot A ; le moteur, non. Pour le lot B, « inconnue de moi » ne veut pas dire inconnue de tous.

## Journal de réglage

14 novembre 2026, avant le test. Banc : `bench/math.js`. Lot de réglage seul, graines 1 et 2.
Sorties : `bench/math-reglage-bruit0.json`, `bench/math-reglage-bruit002.json`.

| Bruit de mesure | Réussites (6 exécutions) | Lois rendues | Temps par exécution |
|---|---:|---|---:|
| aucun | 4 | chargées de termes parasites : le moteur modélise les irrégularités arithmétiques | 25 à 43 s |
| 0,2 % de l'amplitude | 6 | `0.0827·log(x) + 1`, `x`, `x^2`, toutes dites « établie » | moins de 2 s |

**Choix fixé** : bruit de mesure de 0,2 %. Sans bruit, le moteur poursuit des écarts de l'ordre de 10⁻⁵ qui ne sont
pas la loi cherchée. Conséquence assumée : un terme secondaire plus petit que 0,2 % sur la plage est invisible.
Le banc n'est plus modifié avant le test.

Commande du test, une seule fois :
`node bench/math.js --lot test --bruit 0.002 --seeds 1-3 --out bench/math-test.json`
