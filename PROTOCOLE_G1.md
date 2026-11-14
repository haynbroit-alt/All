# Protocole G1 — GALILÉE se dit-il encore convaincu d'une forme fausse ?

**Statut** : protocole écrit **avant** l'exécution de confirmation. Le moteur (`src/`) n'est pas modifié.

## Pourquoi ce protocole

Le chantier G1 partait du banc publié : à 5 % de bruit, 9 arrêts « convaincu » sur une forme fausse et 71 % de lois
retrouvées avec précision. Or ce banc avait été généré **avant** le dernier changement du moteur (commit `81df869` :
second avis, validation sur expériences neuves, épreuve hors domaine, verdict gradué). Il ne décrivait plus le code.

Le banc a donc été relancé tel quel sur le moteur actuel le 14 novembre 2026 (`bench/RESULTS.md`, graines 1 à 5) :

| Stratégie « agent » | Banc publié avant | Moteur actuel |
|---|---:|---:|
| Précise, bruit 1 % | 72/75 (96 %) | 74/75 (99 %) |
| Précise, bruit 5 % | 53/75 (71 %) | 62/75 (83 %) |
| Formes fausses, bruit 5 % | 9 | 4 |
| dont verdict « établie » | sans objet | 0 |
| Expériences par découverte, bruit 5 % | 30,7 | 43,6 |

À 5 % de bruit, les 50 verdicts « établie » portent tous sur la bonne forme ; les 4 formes fausses sont dites
« empirique » (2) ou « incertaine » (2). Le prix : environ 40 % d'expériences en plus.

Les objectifs proposés pour G1 sont donc atteints sur ces graines. Mais ce sont les graines sur lesquelles le moteur a
été mis au point : cela ne prouve rien pour des cas neufs. D'où une confirmation, et pas de nouveau code.

## Confirmation (exécution unique)

`node bench/g1-confirmation.js` : le catalogue des 15 lois, les deux stratégies, les bruits 1 % et 5 %, sur les
**graines 6 à 10**, jamais utilisées. Le script reprend la notation de `bench/run.js` sans la changer.

Critères, fixés ici avant l'exécution, pour la stratégie « agent » :

| | Critère | Seuil |
|---|---|---|
| **K1** | verdicts « établie » sur une forme fausse, bruit 5 % | au plus 2 sur 75 |
| **K2** | lois retrouvées avec précision, bruit 5 % | au moins 80 % |
| **K3** | lois retrouvées avec précision, bruit 1 % | au moins 95 % |

Rapportés sans seuil : les formes fausses dites « empirique » ; les mêmes mesures pour la stratégie « hasard » ; le
nombre d'expériences par découverte.

**Lecture prévue** : si K1, K2 et K3 sont atteints, le chantier G1 est clos sans modification du moteur. Si l'un
manque, G1 reste ouvert et fera l'objet d'un protocole de modification, avec d'autres graines de test : les graines
6 à 10 sont consommées par cette exécution, quelle qu'en soit l'issue.

**Limite connue d'avance** : mêmes 15 lois que le banc de mise au point. Seules les graines sont neuves ; une loi
écrite après coup serait une épreuve plus dure, non faite ici.
