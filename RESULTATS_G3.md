# Résultats G3 — terres inconnues mathématiques

Protocole : `PROTOCOLE_G3.md`, poussé avant le code (commit `96742ee`) ; banc et bruit gelés avant le test (commit
`8492f01`). Exécution unique du 14 novembre 2026, 12 minutes de calcul :
`node bench/math.js --lot test --bruit 0.002 --seeds 1-3 --out bench/math-test.json`. Aucun fichier de `src/` modifié.

Le moteur mesure un objet arithmétique exact sur une plage, par ses propres expériences (80 au plus). Sa loi est
ensuite comparée à la valeur exacte 10 fois et 100 fois plus loin.

## Verdict

| | Critère | Seuil | Mesuré | Verdict |
|---|---|---|---|---|
| **M1** | mondes du lot A prédits (2 graines sur 3 à moins de 1 % à 10 fois et 2 % à 100 fois la plage) | au moins 4 sur 6 | 5 sur 6 | **atteint** |
| **M2** | exécutions dites « établie » avec plus de 10 % d'erreur à 100 fois la plage | aucune | 0 sur 12 | **atteint** |
| Lot B | terres inconnues, sans seuil | — | 0 monde prédit sur 6 | aucune loi empirique à consigner |

## Lot A — lois démontrées, que le moteur ne connaissait pas

Erreurs à 10 fois puis à 100 fois la plage, pour les trois graines. La loi de puissance ajustée sur la même plage
sert de témoin : c'est ce qu'on obtient sans chercher la forme.

| Objet | Réussites | Erreurs du moteur (%) | Témoin puissance à 100 fois | Exemple de loi rendue |
|---|---:|---|---:|---|
| somme des nombres de diviseurs | 3/3 | 0,02 / 0,04 · 0,02 / 0,03 · 0,05 / 0,08 | 15,8 % | `0.08584·x·(log(x) + 11.65)` |
| somme de l'indicatrice d'Euler | 3/3 | 0 / 0 partout | 0,04 % | `x^2` |
| nombre de premiers | **1/3** | 0,57 / 2,28 · 0,38 / 1,99 · 0,38 / 2,02 | 15,8 % | `(x^0.8081 + x) / 2` |
| logarithme de n! | 3/3 | 0,06 / 0,73 · 0,18 / 0,80 · 0,06 / 0,10 | 20,1 % | `(0.09543·log(x) + 1)·x` |
| n-ième nombre premier | 3/3 | 0,20 / 0,56 · 0,02 / 0,57 · 0,29 / 1,00 | 26,4 % | `(0.1057·log(x) + 1)·x` |
| somme des nombres de facteurs premiers | 3/3 | 0,12 / 0,61 · 0,08 / 0,24 · 0,69 / 1,77 | 9,1 % | `3·x / 2 − x^0.9324 / 2` |

Ce qui est solide :

- **La forme `n·ln n` est retrouvée sans indication.** Pour la somme des nombres de diviseurs, la loi rendue,
  remise dans la variable `n`, s'écrit `n·(ln n + 0,137)` ; la loi démontrée est `n·(ln n + 0,154)`. Le moteur a donc
  approché la constante `2γ − 1` à 0,02 près, avec 53 à 80 mesures bruitées à 0,2 %.
- Là où une loi de puissance se trompe de 9 à 26 % à 100 fois la plage, le moteur reste sous 2 %, sauf un monde.
- **Le nombre de premiers est manqué**, de très peu (2,28 %, 1,99 %, 2,02 % pour un seuil de 2 %) : le moteur rend
  une somme de deux puissances, pas `n/ln n`. Le seuil n'est pas retouché.

## Lot B — terres inconnues : aucune n'est prédite

| Objet | Erreurs du moteur à 10 / 100 fois (%) | Verdicts du moteur |
|---|---|---|
| suite `a → a + nombre de diviseurs` | 78 / 98 · 16 / 41 · 3,0 / 0,9 | incertaine ×3 |
| suite `a → a + nombre de 1 en binaire` | 7 / 50 · 38 / 676 · échec | incertaine ×3 |
| suite `a → a + somme des chiffres` | 10 / 17 · 100 / 100 · 15 / 35 | incertaine ×3 |
| temps de vol de Syracuse | 0,52 / 2,13 · 0,66 / 2,99 · 0,69 / 3,06 | établie ×2, incertaine |
| premiers jumeaux | 19 / 360 · 112 / 100 · 70 / 82 | incertaine ×3 |
| premiers dont 2 est racine primitive | 15 / 45 · 14 / 0,02 · 62 / 305 | incertaine ×3 |

- Syracuse passe à 10 fois la plage (moins de 0,7 %) et échoue de peu à 100 fois : la loi rendue, `2·x^1.047 − x`,
  imite un `n·ln n` sans l'être. C'est le seul cas où le moteur se dit sûr d'une loi qui dérive.
- Les cinq autres sont des échecs francs, **et le moteur le dit** : quinze verdicts « incertaine » sur quinze.

## Le verdict du moteur, cette fois, vaut quelque chose

En données fournies (G4, RÉEL), son niveau de confiance ne prévenait de rien. Ici, quand il choisit ses mesures :

| Verdict | Exécutions | Réussies | Pire erreur à 100 fois la plage |
|---|---:|---:|---:|
| établie | 12 | 9 | 3,0 % |
| empirique | 1 | 1 | 0,08 % |
| incertaine | 23 | 6 | plus de 100 % |

Constat sur 36 exécutions, à confirmer : interroger le monde rend le moteur franc sur ce qu'il ne sait pas.

## Limites

Douze objets, trois graines. Une loi juste à 100 fois la plage peut être fausse plus loin (c'est ce que montre
Syracuse entre 10 et 100). Le bruit de 0,2 % cache tout terme plus petit. Pour les comptages rares (jumeaux), les
irrégularités arithmétiques dépassent ce bruit sur la plage choisie : le moteur poursuit du bruit, cause probable de
ces échecs, non vérifiée.
