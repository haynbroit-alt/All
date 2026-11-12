# Galilée

Un agent scientifique autonome. On lui cache une loi ; il ne peut que régler des variables et lire une mesure bruitée.
Il choisit lui-même ses expériences, confronte ses hypothèses aux mesures, révise ses croyances et s'arrête quand une
loi s'impose.

```
$ node src/cli.js discover pendule --quiet
Loi proposée :  T = 2π·√(L / g)
Vérité cachée :  T = 2*pi*sqrt(L/g)
Vérification sur 2000 points neufs : erreur 0.000 % dans le domaine, 0.000 % en extrapolation
→ Loi retrouvée.
```

Aucune dépendance, aucun modèle de langage, aucun appel réseau : Node ≥ 20 suffit. La même bibliothèque tourne dans le
navigateur (`dist/galilee.html`, un seul fichier).

## Essayer

```bash
npm test                                   # 21 tests
node src/cli.js list                       # les 15 lois cachées du catalogue
node src/cli.js discover gravitation       # journal complet de l'agent, puis vérification
node src/cli.js formula "3*x^2/(1+y)"      # votre propre loi cachée
node src/cli.js formula "a*exp(-b)" --range a=0:10 --range b=0:3 --noise 0.05
node src/cli.js kepler                     # données réelles des huit planètes → T = a^(3/2)
node src/cli.js data mesures.csv           # vos données (dernière colonne = grandeur à expliquer)
npm run bench                              # banc d'essai complet (≈ 10 min) → bench/RESULTS.md
npm run build                              # régénère dist/galilee.html
```

Options : `--seed N`, `--noise 0.01`, `--budget 60`, `--mode actif|aléatoire`, `--quiet`.
Le code de sortie de `discover` et `formula` vaut 0 si la loi est retrouvée, 2 sinon.

## La boucle

Chaque cycle de l'agent suit les mêmes étapes, toutes visibles dans son journal :

| Étape | Ce que fait l'agent |
|---|---|
| OBSERVER | Plan initial en hypercube latin, puis trois expériences répétées trois fois pour estimer le bruit σ. |
| COMPRENDRE | Recherche d'équations ; classement des hypothèses par vraisemblance pénalisée (χ² + coût de complexité). |
| CONFRONTER | La dernière mesure tombe-t-elle à moins de 3 σ de la prédiction ? Confirmation ou contradiction. |
| HYPOTHÈSES | En cas de contradiction : effort de recherche supplémentaire sur de nouvelles formes. |
| ANTICIPER | Sur 400 expériences candidates, où les hypothèses les mieux classées divergent-elles le plus ? |
| PRIORISER | Choix de l'expérience au plus fort désaccord attendu, pondéré par l'éloignement des points déjà mesurés. |
| DÉCIDER | Arrêt si la même loi tient depuis 3 cycles, que les 3 dernières prédictions sont confirmées et que χ² réduit < 2,2. |
| REVUE HUMAINE | Si plus rien ne distingue les hypothèses dans le domaine sûr mais qu'elles divergent au-delà, l'agent demande l'autorisation d'en sortir. Sans réponse, il ne mesure rien. |
| SIMULER | Prédiction chiffrée de chaque hypothèse pour l'expérience retenue. |
| EXÉCUTER, MESURER | Une mesure bruitée, et son écart à la prédiction. |
| APPRENDRE, RÉVISER | Réajustement des constantes et du classement sur toutes les mesures. |
| DREAMING | Auto-audit : si χ² reste élevé, l'agent doute d'abord de son estimation du bruit (il répète une expérience), puis de sa loi (il élargit la recherche). |

## Résultats mesurés

Le détail, y compris la liste des échecs, est dans [bench/RESULTS.md](bench/RESULTS.md) ; il est régénéré par
`npm run bench` et n'est pas édité à la main.

300 découvertes : 15 lois × 5 tirages × 2 niveaux de bruit × 2 stratégies, budget de 60 expériences.

| Bruit | Stratégie | Bonne forme | Forme et constantes précises | Expériences (moy.) | Convaincu d'une forme fausse |
|---|---|---:|---:|---:|---:|
| 1 % | agent | 99 % | 96 % | 29 | 1 / 75 |
| 1 % | hasard | 87 % | 87 % | 29 | 9 / 75 |
| 5 % | agent | 88 % | 71 % | 31 | 9 / 75 |
| 5 % | hasard | 85 % | 57 % | 33 | 11 / 75 |

Une découverte prend 1,4 s en moyenne sur un cœur.

Ce que ces chiffres disent : à 1 % de bruit, choisir ses expériences fait passer de 87 % à 99 % de bonnes formes.
À 5 % de bruit l'écart sur la forme devient faible (88 % contre 85 %) ; le gain porte surtout sur la précision des
constantes. Dans 9 cas sur 75 l'agent s'arrête alors convaincu d'une forme fausse : sa confiance n'est pas une garantie.

## Limites connues

- Pas de fonctions transcendantes emboîtées (`sin(exp(x))`), pas d'exposants variables (`x^y`), 4 variables au plus.
- Le critère « précise » est numérique : une formule différente mais équivalente à 0,5 % près est comptée comme retrouvée.
- Sous fort bruit, la préférence pour les constantes simples produit de fausses élégances (4,905 rendu comme 5).
- Le facteur de Lorentz, dont la variance est dominée par la divergence près de v = c, échoue dès 5 % de bruit.
- La recherche est stochastique : un autre tirage (`--seed`) peut donner un autre résultat. Les résultats sont
  reproductibles à graine fixée.

## Organisation

```
src/expr.js     expressions : évaluation compilée, simplification, affichage, analyseur
src/fit.js      moindres carrés linéaires, Levenberg–Marquardt, générateur aléatoire reproductible
src/search.js   programmation génétique + amorces (loi de puissance, affine, oscillation, Boltzmann)
src/agent.js    la boucle expérimentale, le classement des hypothèses, la vérification indépendante
src/worlds.js   les lois cachées, les données réelles, la lecture CSV
src/cli.js      ligne de commande
web/            gabarit de la page et script d'assemblage
bench/          banc d'essai et résultats
test/           tests (node --test)
```

L'agent n'a accès qu'à `world.measure(x)`. La vérité (`world.secret`) n'est lue que par `verify()`, après coup ;
un test remplace le monde par un mandataire qui lève une exception si l'agent y touche.
