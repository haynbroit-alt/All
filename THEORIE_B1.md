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

Calcul unique du 14 novembre 2026 (`node bench/b1-theorie.js`, 5 secondes, sortie `bench/b1-theorie.json`).
Terme de rang 10⁶ : 18 483 162. Terme de rang 10⁷ : 211 222 318.

| | Prédiction | Mesuré | Verdict |
|---|---|---|---|
| **Q1** | au moins 0,90 des termes valent 2 modulo 4 (naïf : 0,25) | **0,9985** | **confirmée**, bien au-delà |
| **Q2** | moyenne de `d(a) − ln a` dans [1,70 ; 2,00] (théorie 1,848 ; naïf 1,154) | **3,000** | **réfutée** |
| **Q3** | aucune exception aux lemmes 1 et 2 | 0 et 0, sur 10⁷ termes | confirmée (c'étaient des lemmes) |
| **Q4** | terme de rang 10⁷ prédit à 1 % près | erreur de 5,2 % (naïf : 8,3 %) | **réfutée** |
| **Q5** | au plus 5 retours à un terme impair | 0 retour ; 582 sorties brèves vers les multiples de 4 | confirmée |

**Ce qui tient.** Le piège existe : entre les rangs 10⁶ et 10⁷, 99,85 % des termes sont de la forme `2 × impair`,
aucun n'est impair, et le reste (0,15 %) correspond aux 582 brefs passages par les multiples de 4.

**Ce qui tombe.** La suite avance encore plus vite que je ne le disais. L'excès sur l'estimation naïve n'est pas
`ln 2 ≈ 0,69` mais environ 1,85 par pas. Ma théorie n'explique donc qu'une partie du biais.

## Exploration après coup (sans valeur de preuve)

Regardé après le résultat, pour comprendre l'écart ; `m` désigne la moitié du terme, dans la classe piège :

| Rangs | `ln a` moyen | excès `d(a) − ln a` | part des `m` multiples de 3 (hasard : 0,3333) | de 9 (0,1111) | de 5 (0,2) | de 7 (0,1429) |
|---|---:|---:|---:|---:|---:|---:|
| 10⁴ à 10⁵ | 13,49 | 2,767 | 0,3911 | 0,1218 | 0,2022 | 0,1460 |
| 10⁵ à 10⁶ | 15,94 | 2,892 | 0,3898 | 0,1204 | 0,2024 | 0,1456 |
| 10⁶ à 3·10⁶ | 17,42 | 2,946 | 0,3895 | 0,1188 | 0,2024 | 0,1457 |
| 3·10⁶ à 10⁷ | 18,66 | 3,016 | 0,3889 | 0,1186 | 0,2019 | 0,1457 |

- Contrôle de ma référence : sur 400 000 entiers `2 × impair` pris régulièrement entre 10⁸ et 1,7·10⁹, la moyenne
  de `d(a) − ln a` vaut 1,840 (attendu 1,848). La formule était juste ; c'est la suite qui ne voit pas des
  entiers ordinaires de cette classe.
- **Second biais** : la suite passe par trop de multiples de 3 — 38,9 % au lieu de 33,3 %. Les multiples de 5 et de
  7 sont presque à leur fréquence ordinaire.
- Raison probable, à démontrer : si 9 divise `m` exactement à la puissance 2, alors `d(m)` est multiple de 3 et le
  terme suivant reste multiple de 3 ; quitter les multiples de 3 est donc plus difficile qu'y entrer. Pour 5 et 7,
  la même mécanique demanderait une puissance 4 ou 6, trop rare pour compter.
- L'excès grandit avec `ln a` : le pas moyen ressemble à `κ·ln a + c` avec `κ` un peu supérieur à 1, et non à
  `ln a + c`. C'est ce qu'on attend si les multiples de 3 sont sur-représentés d'une part constante.

## Deuxième tour — prédictions écrites avant le calcul

Loi révisée, **empirique** : pas moyen `κ·ln a + c`, où `κ` et `c` sont ajustés par moindres carrés sur les seuls
termes de rang 10⁴ à 10⁷ de la classe piège. Épreuve sur un territoire que personne n'a regardé ici : les rangs 10⁷
à 3·10⁷, et d'autres points de départ.

| | Mesure | Prédiction | Réfutée si |
|---|---|---|---|
| **R1** | terme de rang 3·10⁷, prédit depuis celui de rang 10⁷ par la loi révisée | erreur d'au plus 0,5 % | plus de 0,5 %, ou pas meilleure que `ln a + 2γ + ln 2` |
| **R2** | part des `m` multiples de 3, rangs 10⁷ à 3·10⁷ | entre 0,383 et 0,391 | hors de cet intervalle |
| **R3** | part des termes valant 2 modulo 4, mêmes rangs | au moins 0,998, aucun terme impair | sinon |
| **R4** | suites parties de 3, 5, 6, 10, 11, 13, 100 et 1001 : part des termes valant 2 modulo 4, rangs 10⁵ à 10⁶ | au moins 0,99 pour chacune | une seule en dessous |
| **R5** | ces huit suites rejoignent-elles la suite partie de 1 (un terme commun, donc tous les suivants) ? | au moins 7 sur 8 avant le rang 10⁶ | 6 ou moins |

R5 est une conjecture de **confluence** : toutes les suites finiraient par se confondre en une seule. Calcul unique,
par `bench/b1-tour2.js`.

## Résultat du deuxième tour

Calcul unique du 14 novembre 2026 (`node bench/b1-tour2.js`, 26 secondes, sortie `bench/b1-tour2.json`).
Ajustement sur 9 958 837 termes : `κ = 1,0499`, `c = 2,083`. Terme de rang 3·10⁷ : 669 922 886.

| | Prédiction | Mesuré | Verdict |
|---|---|---|---|
| **R1** | terme de rang 3·10⁷ à 0,5 % près | erreur de **0,033 %** (ancienne loi : 3,8 %) | **confirmée** |
| **R2** | part des `m` multiples de 3 entre 0,383 et 0,391 | 0,3887 | **confirmée** |
| **R3** | au moins 0,998 des termes valent 2 modulo 4, aucun terme impair | 0,9987 ; mais **8 914 termes impairs** | **réfutée** sur le second point |
| **R4** | au moins 0,99 pour chacune des huit suites, rangs 10⁵ à 10⁶ | 0,9817 pour toutes | **réfutée** |
| **R5** | au moins 7 suites sur 8 rejoignent la suite partie de 1 | **8 sur 8**, en 2 à 35 pas | **confirmée** |

- **La loi révisée tient hors de la plage où elle a été ajustée** : pas moyen `1,05·ln a + 2,08`, vérifié sur vingt
  millions de termes neufs. Elle reste empirique : je n'ai pas de démonstration de `κ`.
- **Il y a bien des retours aux impairs.** Entre les rangs 10⁷ et 3·10⁷, la suite repasse une fois par les impairs,
  pendant 8 914 pas. Le raisonnement du premier tour les annonçait rarissimes, pas absents ; en écrivant « aucun »
  j'ai durci ma propre conjecture à tort.
- **R4 est manquée parce que R5 est vraie** : les huit suites se confondent avec la suite principale dès leurs
  premiers pas, elles ont donc toutes la même part (0,9817), et la suite principale connaît une excursion hors du
  piège entre les rangs 10⁵ et 10⁶. Mon seuil de 0,99 était trop serré pour cette plage.
- R5 est peu probante telle quelle : près de zéro, la suite principale est dense et tout départ la rencontre vite.

## Troisième tour — la confluence, depuis de grands nombres (écrit avant le calcul)

**R6.** Seize suites partent de 10⁸ + 1, 10⁸ + 2, …, 10⁸ + 16, loin de l'origine, où les termes sont espacés d'une
vingtaine d'unités. Prédiction : **au moins 14 des 16 se sont confondues en une seule suite avant 500 000 pas**.
Réfutée s'il reste trois suites distinctes ou plus. Calcul unique, par `bench/b1-tour3.js`.

## Résultat du troisième tour

Calcul unique du 14 novembre 2026 (`node bench/b1-tour3.js`, sortie `bench/b1-tour3.json`).

**R6 confirmée : les 16 suites se confondent en une seule.** Quatorze fusions ont lieu en 42 pas au plus ; la
dernière demande 16 049 pas et se fait à la valeur 100 180 126, dans la classe piège. Avant elle, il restait deux
suites qui avançaient côte à côte sans se toucher.

## Bilan

| Énoncé | Statut |
|---|---|
| La parité ne change qu'en passant par un carré ; la classe « 2 modulo 4 » ne se quitte qu'aux doubles de carrés impairs | **démontré** (lemmes 1 et 2), vérifié sur 10⁷ termes |
| Presque tous les termes sont de la forme `2 × impair` | conjecture, **vérifiée** : 99,85 % puis 99,87 % sur trente millions de termes |
| Excès de vitesse égal à `ln 2` | **réfuté** |
| Les moitiés des termes sont trop souvent multiples de 3 (38,9 % au lieu de 33,3 %) | constat après coup, **confirmé** sur termes neufs |
| Pas moyen `1,05·ln a + 2,08` | loi empirique, **confirmée** à 0,033 % près sur vingt millions de termes neufs ; constantes non expliquées |
| Aucun retour aux impairs | **réfuté** : un retour de 8 914 pas |
| Toutes les suites finissent par se confondre | conjecture de confluence, **vérifiée** sur 8 départs près de 0 et 16 départs près de 10⁸ |

Rien de tout cela n'a été confronté à ce qui est publié sur cette suite. Tant que ce n'est pas fait, ce sont des
résultats vérifiés par le calcul, pas des découvertes.

## Quatrième tour — pourquoi 38,9 % de multiples de 3 : un modèle sans paramètre

Écrit le 14 novembre 2026. La partie « modèle » a été mise au point sur la suite déjà calculée (donc après coup) ;
la partie « prédictions » porte sur des suites que je n'ai jamais calculées.

**Le modèle.** Dans la classe piège, la moitié `m` du terme suit `m → m + d(m)`. On ne retient de `m` que son résidu
modulo `3^j` ; tout le reste est supposé quelconque. Pour chaque résidu, on prend des entiers impairs ordinaires de
ce résidu, on leur applique un pas, et on note le résidu d'arrivée : cela donne une chaîne de Markov, dont on calcule
la répartition d'équilibre. Aucun nombre n'est ajusté sur la suite (`bench/b1-tour4.js`, fonction `predire`).

| Mémoire du modèle | Part des multiples de 3 prédite |
|---|---:|
| aucune (entiers ordinaires) | 0,3333 |
| résidu modulo 3 | 0,3939 |
| résidu modulo 9 | 0,3880 |
| résidu modulo 27 | 0,3883 |
| résidu modulo 81 | 0,3887 |
| **mesuré sur la suite** | **0,3891** (rangs 10⁶ à 10⁷) ; **0,3887** (rangs 10⁷ à 3·10⁷) |

Dès qu'il se souvient du résidu modulo 9, le modèle retombe sur la valeur mesurée, à un millième près (son bruit
d'échantillonnage est du même ordre). Le second biais de la suite n'a donc rien de mystérieux : c'est la mémoire
3-adique d'un pas `m + d(m)`, et rien d'autre de mesurable.

**Suites sœurs.** Pour `k` impair, la suite `a → a + k·d(a)` garde les lemmes 1 et 2 (le pas `k·d(a)` a la parité
de `d(a)`, et `a = 2m` donne `2(m + k·d(m))`). Remarque immédiate : `a + k·d(a)` a le même reste que `a` modulo `k`,
donc pour `k ≥ 2` des départs de restes différents ne se rejoignent jamais — la confluence observée pour `k = 1`
est propre à ce cas.

**Prédictions, écrites avant de calculer ces suites.** Le même modèle, appliqué au pas `m + k·d(m)`, donne modulo 9
puis modulo 27 : `k = 5` → 0,3880 et 0,3877 ; `k = 7` → 0,3882 et 0,3885 ; `k = 11` → 0,3878 et 0,3874 ;
`k = 13` → 0,3882 et 0,3886. Il annonce donc **la même part, environ 0,388, pour toutes ces suites**.

| | Mesure, départ 1, rangs 10⁶ à 10⁷ | Prédiction | Réfutée si |
|---|---|---|---|
| **S1** | part des `m` multiples de 3, pour `k` = 5, 7, 11, 13 | entre 0,384 et 0,392 pour chacune | une seule hors de l'intervalle |
| **S2** | part des termes dans la classe « 2 modulo 4 », mêmes suites | au moins 0,98 pour chacune | une seule en dessous |

Calcul unique : `node bench/b1-tour4.js test`.

## Résultat du quatrième tour

Calcul unique du 14 novembre 2026 (`node bench/b1-tour4.js test`, 100 secondes, sortie `bench/b1-tour4.json`).

| Suite | Prédit (modulo 27) | Mesuré | Part dans la classe piège |
|---|---:|---:|---:|
| `a → a + 5·d(a)` | 0,3877 | **0,3879** | 1,0000 |
| `a → a + 7·d(a)` | 0,3885 | **0,3885** | 0,9989 |
| `a → a + 11·d(a)` | 0,3874 | **0,3885** | 1,0000 |
| `a → a + 13·d(a)` | 0,3886 | **0,3887** | 1,0000 |

**S1 et S2 confirmées.** Les quatre parts tombent dans l'intervalle annoncé, à un millième au plus de la valeur
prédite, sur neuf millions de termes chacune. Pour trois des quatre suites, pas un seul terme ne sort du piège
entre les rangs 10⁶ et 10⁷.

Ce que cela établit, par le calcul : dans toute cette famille, les moitiés des termes sont multiples de 3 environ
38,85 fois sur cent, au lieu de 33,33, et un modèle sans paramètre le prédit. La valeur exacte de cette constante
— la répartition d'équilibre d'une chaîne 3-adique — n'est pas calculée ici en forme close.

Ajouts au bilan :

| Énoncé | Statut |
|---|---|
| La sur-représentation des multiples de 3 vient de la mémoire 3-adique d'un pas | modèle sans paramètre, **confirmé** sur quatre suites jamais calculées auparavant |
| `a → a + k·d(a)` conserve le reste modulo `k` : pas de confluence générale pour `k ≥ 2` | **démontré** (immédiat) |
| Valeur exacte de la constante 0,3885… | **ouvert** |
| Explication du coefficient 1,05 de la loi de vitesse | **ouvert** (la sur-représentation des multiples de 3 en explique une partie, non chiffrée proprement) |

## Confrontation à ce qui est publié (14 novembre 2026)

L'encyclopédie des suites d'entiers (oeis.org) a été lue une fois l'accès réseau ouvert : fiches A064491, A165494,
A165495, A165496, A165930, A062249. Rien d'autre n'a été consulté.

**Déjà connu — je ne l'ai pas découvert :**

- La suite est recensée (A064491). Les deux questions que je croyais poser sont un **problème de Claudia Spiro,
  1977** : une suite partie d'un autre terme rejoint-elle toujours celle-ci ? La parité change-t-elle une infinité de
  fois ? La fiche les donne comme questions, sans réponse.
- Le mécanisme du piège est connu depuis 2009 : trois fiches de Hugo van der Sanden étudient ce qui se passe quand la
  suite atteint le double d'un carré impair, passe par des multiples de 4, puis retombe ou entame une série de termes
  impairs. Mes lemmes 1 et 2 sont donc, au mieux, une redécouverte.
- La croissance en `n·ln n` est conjecturée sur la fiche (Adams-Watters, 2008), sans constantes.

**Non trouvé sur ces fiches — ce qui pourrait être nouveau, sans garantie :**

- les mesures : 99,85 % des termes dans la classe piège, un seul retour aux impairs entre les rangs 10⁷ et 3·10⁷ ;
- la loi de vitesse empirique (pas moyen `1,05·ln a + 2,08`), vérifiée hors de sa plage d'ajustement ;
- la sur-représentation des multiples de 3 (0,3885), son modèle sans paramètre et sa vérification sur les suites
  sœurs `a → a + k·d(a)` ;
- la confluence vérifiée depuis 10⁸ (16 départs).

« Non trouvé sur six fiches » ne veut pas dire inédit : je n'ai lu ni articles ni actes de colloques. Les deux
questions de 1977 restent ouvertes ; mes calculs vont dans le sens « oui » pour la confluence, et mon raisonnement
dans le sens « oui, mais de plus en plus rarement » pour la parité. Ni l'un ni l'autre n'est une preuve.

## Cinquième tour — 0,3885 n'est pas une constante

Écrit le 14 novembre 2026. Exploration, puis une prédiction écrite avant le calcul (`bench/b1-limite.js`).

**La limite, calculée exactement dans le modèle.** Si le reste de `m` (ce qui n'est pas sa puissance de 3) était
parfaitement mélangé — son résidu et celui de son nombre de diviseurs indépendants et uniformes — le modèle se
réduirait à une chaîne sur la seule valuation 3-adique `e`. Avec `m = 3^e·u` et `g` la puissance de 3 dans `d(u)` :
si `v₃(e+1) + g > e` la valuation reste `e` ; si elle est plus petite, elle devient `v₃(e+1) + g` ; en cas d'égalité
elle reste `e` une fois sur deux, sinon monte de `j` avec probabilité `(1/2)(2/3)(1/3)^(j−1)`. La loi de `g` est un
produit sur les nombres premiers `p ≥ 5` : 0,923603 ; 0,074098 ; 0,002262 ; 0,000036… L'équilibre de cette chaîne
donne **une part de multiples de 3 égale à 0,384077**.

**Pourquoi on mesure 0,3885 et non 0,3841.** Le mélange supposé n'a pas lieu aux tailles accessibles. Parmi les `u`
dont `d(u)` n'est pas multiple de 3, `d(u)` modulo 9 devrait valoir 1, 2, 4, 5, 7, 8 une fois sur six chacun ; on
mesure :

| `u` voisin de | 1 | 2 | 4 | 5 | 7 | 8 |
|---|---:|---:|---:|---:|---:|---:|
| 2·10⁵ | 0,001 | 0,259 | 0,456 | 0,001 | 0,041 | 0,241 |
| 10⁸ | 0,002 | 0,175 | 0,387 | 0,018 | 0,111 | 0,308 |
| 10¹⁰ | 0,005 | 0,139 | 0,345 | 0,035 | 0,150 | 0,325 |
| mélange parfait | 0,167 | 0,167 | 0,167 | 0,167 | 0,167 | 0,167 |

La raison est simple : un entier ordinaire a deux, trois ou quatre facteurs premiers, donc 4, 8 ou 16 diviseurs,
et ces valeurs ne se répartissent sur les six résidus que lorsque le nombre de facteurs premiers devient grand —
ce qui croît comme `ln ln` de la taille. La valeur 0,3885 est donc un **régime intermédiaire** qui dérive très
lentement vers 0,3841. Raisonnement, pas preuve : ni la vitesse du mélange ni l'égalité entre la suite et son
modèle ne sont démontrées.

**Le modèle évalué par taille** (tirage au hasard de `m` dans `[X, 2X]`, mémoire modulo 9 puis 27 ; bruit
d'environ 0,001) : 0,3884 et 0,3893 vers `X` = 2·10⁵ ; 0,3884 et 0,3886 vers 3·10⁷ ; 0,3876 et 0,3884 vers 10⁹ ;
0,3878 et 0,3868 vers 10¹⁰. Sur la suite elle-même, les tranches successives donnaient 0,3911 ; 0,3898 ; 0,3895 ;
0,3889 ; 0,3887 : même sens, même ordre de grandeur.

**Prédiction, écrite avant le calcul.** La suite `a → a + 1001·d(a)`, partie de 1, atteint en dix millions de pas
des termes mille fois plus grands que la suite d'origine. Pour ces tailles (`m` entre 3·10¹⁰ et 2·10¹¹) le modèle
donne 0,3868 à 0,3881.

| | Mesure, rangs 10⁶ à 10⁷ | Prédiction | Réfutée si |
|---|---|---|---|
| **S3** | part des `m` multiples de 3 pour `k` = 1001 | entre 0,3860 et 0,3885 — donc **plus basse** que les 0,3889 de la suite d'origine | hors de cet intervalle |

Calcul unique : `node bench/b1-limite.js suite 1001`.

## Résultat du cinquième tour

(complété après le calcul)
