# Une théorie pour la suite `a → a + d(a)` — prédictions écrites avant le calcul

Écrit le 14 novembre 2026, après le test G3 et **avant tout calcul sur la parité ou les résidus de cette suite**.
Dans G3, seul le terme de rang `n` a été calculé et donné au moteur ; je n'ai regardé ni sa parité ni ses pas.
`d(a)` est le nombre de diviseurs de `a` ; la suite part de 1 : 1, 2, 4, 7, 9, 12, 18, 24, 32, 38, 42, 50, 56, 64, 71…

Le moteur a échoué sur cette suite et s'est dit incertain. En cherchant pourquoi, j'arrive à une explication dont une
partie se démontre et dont le reste se teste. Je ne l'ai confrontée à aucune publication : elle peut être connue.

## Ce qui se démontre

**Lemme 1.** `d(a)` est impair si et seulement si `a` est un carré. *Preuve :* `d(a)` est le produit des `e + 1`
pour les exposants `e` de la décomposition de `a` ; il est impair si et seulement si tous les `e` sont pairs.
Conséquence : la suite ne change de parité qu'en passant par un carré.

**Lemme 2.** Si `a = 2m` avec `m` impair, alors `d(a) = 2·d(m)` et le terme suivant est `2·(m + d(m))`. Tant que `m`
n'est pas un carré, `d(m)` est pair, `m + d(m)` est impair, et le terme suivant est encore de la forme `2 × impair`.
Conséquence : dans la classe « 2 modulo 4 », la suite est exactement le double de la même suite partie d'un impair,
et elle ne quitte cette classe qu'aux termes égaux au double d'un carré impair.

**Lemme 3.** Depuis un multiple de 4 qui n'est pas un carré, `a = 2^v·m` (`v ≥ 2`, `m` impair), le pas vaut
`(v + 1)·d(m)` et le terme suivant est pair ; il retombe dans la classe « 2 modulo 4 » dès que ce pas vaut 2 modulo 4.

## Ce qui est conjecturé (raisonnement, pas preuve)

- La classe « 2 modulo 4 » est un **piège** : on n'en sort qu'aux doubles de carrés impairs, de plus en plus rares
  (environ un sur `√a`), et l'on y retombe en quelques pas, car un pas valant 2 modulo 4 est fréquent (de l'ordre
  d'une fois sur `ln a`). Revenir aux impairs exige de tomber sur un carré pair pendant ce bref passage : rarissime.
- Donc, à la longue, **presque tous les termes sont de la forme `2 × impair`**, alors qu'un entier pris au hasard ne
  l'est qu'une fois sur quatre.
- Ces entiers-là ont, en moyenne, plus de diviseurs qu'un entier ordinaire de même taille : `ln a + 2γ + ln 2` au
  lieu de `ln a + 2γ` (`γ` = constante d'Euler). La suite avance donc plus vite que ne le dit l'estimation naïve,
  d'un excès constant de `ln 2` par pas.

## Prédictions chiffrées, pour les termes de rang 10⁶ à 10⁷

| | Mesure | Estimation naïve (entiers « moyens ») | Ma prédiction | Réfutée si |
|---|---|---|---|---|
| **Q1** | part des termes valant 2 modulo 4 | 0,25 | au moins 0,90 | moins de 0,90 |
| **Q2** | moyenne de `d(a) − ln a` sur ces termes | `2γ` = 1,154 | `2γ + ln 2` = 1,848 | hors de [1,70 ; 2,00] |
| **Q3** | changements de parité hors d'un carré ; sorties de la classe 2 modulo 4 hors d'un double de carré impair | — | 0 et 0 (lemmes) | un seul cas |
| **Q4** | terme de rang 10⁷ prédit depuis celui de rang 10⁶ en intégrant un pas moyen `ln a + c` | `c = 2γ` | `c = 2γ + ln 2`, erreur d'au plus 1 % | erreur de plus de 1 %, ou pas meilleure que la naïve |
| **Q5** | retours à un terme impair entre les rangs 10⁶ et 10⁷ | la moitié des termes impairs | au plus 5 retours | plus de 5 |

Si Q2 tombe dans l'intervalle mais loin de 1,848, cela signalera un biais plus fin (modulo 3, 5…) que je ne sais pas
calculer. Calcul unique, par `bench/b1-theorie.js` ; résultat publié tel quel dans ce fichier.

## Résultat

(complété après le calcul)
