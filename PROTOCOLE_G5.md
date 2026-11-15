# Protocole G5 — une loi commune à plusieurs petits jeux, des constantes propres à chacun

**Statut** : écrit le 15 novembre 2026, **avant tout code**. Le moteur (`src/`, commit `be42b7e`) n'est pas
modifié : G5 ajoute un module à côté, comme G2. Répond à la demande du propriétaire : « donner à GALILÉE une
capacité de découverte réellement différenciante ».

## Pourquoi celle-ci

Trois mesures faites dans l'espace commun (`haynbroit-alt/Tr`, `programme/sota/`, `programme/t3h/`) :

- Sur 15 jeux du NIST puis 31 jeux réels neufs, GALILÉE n'est pas devant Operon, la référence mondiale ; il n'est
  pas établi qu'il soit derrière sur les 31, avec des formules quatre à dix fois plus courtes.
- **Il échoue sur les petits jeux**, là où les concurrents réussissent.
- Sur 199 entreprises simulées, 26 semaines de ventes chacune : sa loi n'est retenue que 39 fois, et la décision
  qu'elle dicte fait moitié moins bien que celle d'une simple droite ajustée entreprise par entreprise.

Apprendre l'optimisation locale des constantes le ferait rattraper Operon sans rien lui donner de propre. Or son
usage économique a toujours la même forme : **beaucoup de petits jeux de même nature** (un produit, un magasin, un
patient, un arbre), trop courts chacun pour qu'on y lise une forme, assez nombreux ensemble pour qu'elle
apparaisse. Ni Operon ni gplearn ne cherchent « une même formule, des constantes différentes par groupe ». PySR le
propose (expressions paramétriques) ; il ne s'installe pas dans cet environnement et n'est donc pas mesuré ici :
la capacité sera différenciante face à Operon et gplearn, **pas** une première mondiale.

## Ce que G5 construit

Un module `src/commun.js` : à partir de `K` jeux `(x, y)` de même nature, chercher **une forme** (même arbre
d'expression) dont certaines constantes sont **partagées** et d'autres **propres à chaque jeu**, en réutilisant la
recherche et l'ajustement du moteur. Rend : la forme, les constantes par jeu, et le même verdict honnête que la
chaîne de livraison — loi « retenue » seulement si elle bat, sur des mesures mises de côté dans chaque jeu, la
droite et la constante ajustées jeu par jeu.

## Mesure

Erreur sur des mesures mises de côté (un quart de chaque jeu, tirage à graine fixe), comparée à :

1. GALILÉE actuel, jeu par jeu ;
2. GALILÉE actuel, tous les jeux réunis en un seul ;
3. Operon (réglé comme dans SOTA-LOIS-2, plafond 15 nœuds), jeu par jeu ;
4. Operon, tous les jeux réunis ;
5. le meilleur témoin jeu par jeu (droite, constante).

## Terrains

- **Mondes à réponse connue** (mise au point : graines 1 à 100 ; test : graines **9001 à 9200**, exécution unique) :
  `K` de 5 à 60 jeux de 6 à 20 points, forme commune tirée parmi puissance, exponentielle, saturation, logistique,
  droite ; constantes propres tirées par jeu ; bruit 5 à 20 %.
- **Données réelles groupées**, choisies par règle mécanique dans les 1 516 jeux de Rdatasets déjà sur le disque de
  l'espace commun : une réponse numérique, une variable explicative numérique, un facteur de groupe, au moins 5
  groupes d'au moins 5 points. La liste est produite par un script **avant** tout ajustement et figée. Aucun de ces
  jeux n'a servi à SOTA-LOIS ni SOTA-LOIS-2 (jeux à deux colonnes).
- **Le cas d'usage** : les 199 historiques de ventes de `Tr/programme/t3h/dev.json` (forme vraie connue : puissance,
  sensibilité propre à chaque entreprise). Critère : la sensibilité estimée par la loi commune est plus proche de
  la vraie que celle de la droite ajustée entreprise par entreprise.

## Critères (test des signes unilatéral à 5 %, sur les terrains de test)

- **C1** — la loi commune prédit mieux que GALILÉE actuel jeu par jeu **et** réuni.
- **C2** — elle prédit mieux qu'Operon jeu par jeu **et** réuni.
- **C3** — sur les mondes à réponse connue, la forme rendue est la forme vraie dans au moins 60 % des cas où le
  bruit est de 5 %.
- **C4 — honnêteté** : sur des mondes sans loi commune (formes différentes d'un jeu à l'autre), elle est « non
  retenue » dans au moins 90 % des cas.
- **C5 — non-régression** : `bench/run.js` rend les mêmes essais avec et sans le module.

Les seuils ne seront pas retouchés. Un critère manqué est publié comme tel.

## Attendus, écrits avant tout code

1. C1 tenu : c'est là que le moteur actuel est le plus faible.
2. C2 tenu face à Operon jeu par jeu ; **incertain** face à Operon réuni quand les constantes propres comptent peu.
3. C3 autour de 60 %, sans marge. 4. C4 tenu. 5. C5 tenu.
6. Sur le cas d'usage : gain modeste. La droite en log-log est déjà le bon estimateur de la forme vraie ; la loi
   commune ne peut gagner que par le partage d'information entre entreprises.

## Limites écrites d'avance

- Une variable explicative. Le facteur de groupe est donné, pas découvert.
- Les mondes à réponse connue sont tirés par nous : un succès y vaut moins que sur les données réelles groupées.
- Le budget de calcul de GALILÉE dans le GARDIEN (`Tr/gardien.json`) ne couvre pas à la fois ce module et son
  banc : **le code ne commence qu'après décision du propriétaire sur le plafond**.

---

## Code écrit et relu — état avant le test (15 novembre 2026)

Le plafond a été relevé par le propriétaire (`Tr/gardien.json`). Code ajouté, aucun fichier existant modifié :
`src/commun.js`, `bench/commun.js`, `bench/commun-jeux.js`, `test/commun.test.js` (28 tests passent). Mise au point
sur les graines 1 à 100 seulement ; **les graines 9001 à 9200 n'ont jamais été exécutées.**

### Mesures de mise au point (graines 1 à 100, 100 mondes à loi commune, 100 sans)

- C1 : loi commune devant GALILÉE jeu par jeu 100 fois sur 100, devant GALILÉE réuni 98 fois, devant le meilleur
  témoin 98 fois. Erreurs médianes : 0,28 ; 1,47 ; 4,57 ; 0,53.
- C3, forme vraie à 5 % de bruit : 21 sur 22 **avec** la bibliothèque de formes, **7 sur 22 sans** (seuil 60 %).
- C4, mondes sans loi commune déclarés « non retenue » : 98 sur 100 (gardes réglées sur les graines 1 à 40,
  confirmées sur 41 à 100).

### Relecture contradictoire (quatre relecteurs, chaque constat grave attaqué par un cinquième)

Pas de fuite des points mis de côté (vérifié en les remplaçant par du bruit : rien ne change). Comparaisons
équitables : mêmes points, même normalisation, GALILÉE lancé avec ses réglages par défaut. Résultats
reproductibles à l'identique. C5 vérifié : `bench/run.js` rend les mêmes essais avec et sans le module.

Constats confirmés :

1. **Bloquant — la bibliothèque contient exactement les cinq formes qui génèrent les mondes.** C3 mesure alors un
   choix dans une liste qui contient la réponse, pas une découverte : 95 % avec elle, 32 % sans elle. GALILÉE et
   Operon, eux, ne la reçoivent pas.
2. Important — les constantes que la recherche fige sur une valeur simple (2, ½…) ne comptent pas comme partagées
   et ne sont pas réajustées : la recherche est désavantagée face à la bibliothèque.
3. Mineur — la garde « au moins une constante partagée » est satisfaite par un décalage partagé quasi nul : les
   deux fausses rétentions de C4 en viennent.
4. Mineur — la garde des graines de test se contournait par une graine non entière ou supérieure à 2³². **Corrigé** :
   seules 1 à 100 et, avec `G5_TEST`, 9001 à 9200 sont acceptées.
5. Mineur — l'ajustement conjoint ne minimise pas exactement le critère qui le juge.

### À décider avant le test, par écrit, sans toucher aux seuils

- Mesure principale de C3 (et de C1 sur mondes à réponse connue) : **sans la bibliothèque**, celle avec étant
  publiée à côté. C'est ma recommandation : avec elle, C3 ne mesure pas ce que le protocole appelle découvrir.
- Corriger ou non les constats 2 et 3 avant le test (changement de méthode, à remesurer sur 1 à 100).
- Budget d'Operon pour C2 : 20 s et trois graines par ajustement, comme SOTA-LOIS-2, demanderaient plus de 50 heures
  sur les petits jeux ; 2 s et une graine par jeu, 20 s pour les jeux réunis : environ 5 heures. À fixer ici.

## Décisions du propriétaire et corrections — écrites avant le code de correction et avant le test

Décisions du 15 novembre 2026 : plafond global relevé ; les deux défauts de méthode sont corrigés **avant** le test.

### Mesure principale

- **C1, C3 et C4 se calculent sans la bibliothèque de formes** (le module ne part que des formes trouvées par la
  recherche du moteur). La variante avec bibliothèque est calculée dans **la même exécution**, sur les mêmes mondes
  et les mêmes calculs de GALILÉE, et publiée à côté, jamais à la place.
- **C2 (Operon)** : Operon 0.6.2, longueur plafonnée à 15 nœuds, fonctions de SOTA-LOIS-2 ; **2 secondes et une
  graine par petit jeu, 20 secondes et une graine pour les jeux réunis**. Le réglage de SOTA-LOIS-2 (20 s, trois
  graines par ajustement) demanderait plus de 50 heures sur ces milliers de petits jeux ; mesuré sur deux mondes de
  mise au point : 29 s pour 11 jeux, 107 s pour 47. Operon est désavantagé par ce budget réduit : c'est dit.
  Une prédiction non définie compte comme une erreur infinie, pour toutes les méthodes.

### Correction A — constantes simples produites par la recherche

La recherche fige une constante sur une valeur simple (2, ½…) quand elle en est proche. Une telle constante est
commune à tous les jeux par construction. Désormais :

- elle compte comme **constante commune** au même titre qu'une constante libre partagée (correction B ci-dessous
  décide si elle est utile) ;
- pour C3, la forme rendue est réajustée **toutes constantes libérées**, et la condition « pas plus de constantes
  que la forme vraie » compte toutes les constantes de la forme rendue, libres ou figées, sauf celles figées à 0, 1
  ou −1.

### Correction B — une constante commune doit servir

Le verdict exigeait « au moins une constante partagée » ; un décalage partagé quasi nul suffisait (les deux fausses
rétentions de C4 en mise au point). Désormais il exige **au moins une constante commune utile**. Une constante
commune est utile si la **retirer** fait monter le critère :

- retirer = la remplacer par l'élément neutre de son opération (0 pour un terme de `+` ou le terme retranché d'un
  `−` ; 1 pour un facteur de `×`, un diviseur, un exposant), réajuster les autres constantes avec le même partage,
  et retrancher du critère le coût de deux nœuds (la constante et son opération, devenue inutile) ;
- une constante qui ne peut pas se retirer ainsi (sous une fonction, numérateur, base d'une puissance, terme dont on
  retranche) est tenue pour utile ;
- tout se calcule sur les points vus.

### Ce qui ne change pas

Les seuils (60 %, 90 %, 5 %), les mondes, le découpage, les graines. Après correction, la mise au point est refaite
sur les graines 1 à 100 et publiée ici avant le test, que ses chiffres soient meilleurs ou pires.

### Mise au point refaite après les corrections A et B (graines 1 à 100, sans GALILÉE)

`node bench/commun.js --graines a-b --sans-galilee --les-deux`, quatre tranches. Rien n'a été réglé de plus.

| | Sans bibliothèque (mesure principale) | Avec bibliothèque |
|---|---|---|
| C3 — forme vraie à 5 % de bruit (seuil 60 %) | **8 sur 22 (36 %)** | 21 sur 22 (95 %) |
| C3 — tous bruits | 32 sur 100 | 80 sur 100 |
| C4 — mondes sans loi refusés (seuil 90 %) | **100 sur 100** | 100 sur 100 |
| Lois communes retenues | 64 sur 100 | 80 sur 100 |
| Erreur médiane (meilleur témoin : 0,53) | 0,29 | 0,28 |

- Les deux fausses rétentions de C4 ont disparu (graines 5 et 68 : un décalage partagé quasi nul n'est plus compté).
- Sans bibliothèque, C3 passe de 7 à 8 sur 22 : la correction A ne change presque rien. **C3 sera vraisemblablement
  manqué au test** dans sa mesure principale. Ce qui reste fort sans bibliothèque est la **prédiction** (erreur
  médiane 0,29 contre 0,53 pour le meilleur témoin, devant lui dans 92 mondes sur 100), pas la **reconnaissance**
  de la forme.
- Temps du module : 3,2 s par monde (médiane).

### Exécution du test

`G5_TEST=exécution-unique node bench/commun.js --graines a-b --les-deux --sortie bench/g5/test-a-b.json`, en une seule
fois, découpée en quatre tranches lancées ensemble (9001-9050, 9051-9100, 9101-9150, 9151-9200). Puis Operon sur les
mondes à loi commune : `bench/commun-operon.py bench/g5/operon.json bench/g5/test-*.json`. Les jeux réels groupés et
le cas d'usage viennent ensuite, liste figée avant tout ajustement.
