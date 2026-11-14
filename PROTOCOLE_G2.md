# Protocole G2 — GALILÉE retrouve-t-il une loi de demande à partir de comptages ?

**Statut** : protocole écrit **avant** le code du nouveau module. **Suspendu après la mesure de référence (voir la fin).** Le moteur actuel (`src/`, commit `be42b7e`) n'est
pas modifié : G2 ajoute un module à côté, et le moteur gaussien reste la référence. Développement sur les graines
1 à 200 ; gel ; exécution **unique** sur les graines 7001 à 7400.

## La question

Dans l'espace de travail commun (`haynbroit-alt/Tr`), GALILÉE a reçu 26 séries de ventes hebdomadaires
reconstruites par LAVOISIER. Il a rendu une constante 20 fois. Son ajustement suppose un bruit gaussien de même
taille partout ; des ventes sont des comptages, dont le bruit grandit avec la moyenne. G2 teste si une vraisemblance
de comptage lui fait retrouver la loi quand elle est détectable, sans lui faire inventer une loi quand il n'y en a pas.

## Le banc (`bench/comptages.js`)

Un monde = 39 semaines d'un article. Le prix relatif p prend 3 à 9 niveaux dans [0,7 ; 1,4], tenus par blocs. La
vente hebdomadaire est un tirage de Poisson de moyenne λ·f(p), avec λ entre 5 et 80. Quatre classes, par graine mod 4 :

| Classe | f(p) |
|---|---|
| sans effet | 1 |
| puissance | p^(−e), e entre 0,8 et 2,5 |
| exponentielle | exp(−k·(p − 1)), k entre 0,8 et 3 |
| linéaire | max(0,1 ; 1 − b·(p − 1)), b entre 0,6 et 1,8 |

Le système ne reçoit que les couples (p, ventes). La vérité n'est lue que par la notation.

## Mesures

- **constante** : la loi rendue ne varie pas sur les prix observés.
- **bonne loi** : loi non constante dont la courbe explique au moins 80 % de la variation de la vraie moyenne sur
  l'intervalle des prix observés (R² ≥ 0,8 sur une grille de 50 prix).
- **détectable** : dans ce monde, la vraie loi explique les comptages nettement mieux qu'une constante (déviance de
  Poisson, écart ≥ 6,63). C'est un plafond : quand l'effet n'est pas détectable, rendre une constante est juste.

## Hypothèses et critères (fixés d'avance)

| | Critère | Seuil |
|---|---|---|
| **G2-A** | mondes à effet détectable : part de bonnes lois, nouveau module | ≥ 50 %, **et** supérieure au moteur actuel (différence appariée, IC95 > 0) |
| **G2-B** | mondes sans effet : part de lois non constantes, nouveau module | ≤ 10 %, borne haute de Wilson ≤ 15 % |
| **G2-C** | banc historique (`bench/run.js`, 15 lois, bruit 1 %) : le moteur gaussien reste inchangé | résultats identiques à `bench/RESULTS.md` |
| G2-D | part de bonnes lois par classe et par nombre de niveaux de prix | rapporté |

**Critère d'abandon** : si G2-B échoue, le module invente des lois ; il est rejeté sous cette forme, et publié.

## Référence avant tout développement

Le moteur actuel est mesuré sur les graines de développement avant d'écrire le module : `bench/COMPTAGES_BASE.md`.

## Résultat de la référence (graines 1 à 200, moteur actuel, avant tout module)

`bench/COMPTAGES_BASE.md`, `bench/comptages-base.json`.

| | Moteur actuel | Seuil visé pour le nouveau module |
|---|---:|---:|
| bonnes lois parmi les effets détectables | 105/133 = 79 % | ≥ 50 % |
| lois non constantes dans les mondes sans effet | 2/50 = 4 % | ≤ 10 % |

**L'hypothèse de départ est contredite.** Le moteur gaussien atteint déjà, sur des comptages, les seuils fixés pour
le module de comptage. Le bruit de Poisson n'est donc pas ce qui lui fait rendre des constantes sur les ventes
reconstruites par LAVOISIER. L'explication la plus simple est que l'effet du prix n'y est pas détectable : dans ces
entreprises simulées, un prix ne bouge que de −12 % à +15 %, environ tous les deux mois. Elle n'est pas vérifiée.

**Décision** : le module de comptage n'est pas écrit. Le banc reste, comme mesure. Ce qu'il montre de faible :
- avec 3 niveaux de prix seulement, 6 bonnes lois sur 13 ;
- avec moins de 15 ventes par semaine, 29 sur 42 ;
- 24 lois non constantes fausses sur 200, à rapprocher du travail G1 (ne pas se dire convaincu à tort).

Les graines de test 7001 à 7400 ne sont pas utilisées et restent réservées.
