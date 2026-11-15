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
