# Calendrier Web

Ce projet est une page web simple qui affiche un tableau représentant les mois d'une plage de dates sélectionnée. Chaque colonne correspond à un mois, et chaque cellule dans les colonnes représente les jours de ces mois.

## Structure du Projet

- `index.html` : Contient la structure de la page web, y compris la mise en page du tableau.
- `select-dates.html` : Permet de sélectionner une plage de dates pour afficher le calendrier.
- `css/index.css` : Contient les styles pour la page web, définissant la mise en page et l'apparence du tableau et de ses cellules.
- `css/select-dates.css` : Contient les styles pour la page de sélection des dates.
- `js/index.js` : Contient le code JavaScript pour la fonctionnalité dynamique, comme la génération du tableau et la gestion des interactions utilisateur.
- `js/select-dates.js` : Contient le code JavaScript pour gérer la sélection des dates et rediriger vers la page du calendrier.

## Instructions d'Installation

1. Clonez le dépôt sur votre machine locale.
2. Ouvrez le fichier `select-dates.html` dans un navigateur web pour sélectionner une plage de dates.
3. La page redirigera vers `index.html` pour afficher le calendrier correspondant à la plage de dates sélectionnée.
4. Optionnellement, vous pouvez modifier les fichiers CSS et JavaScript pour personnaliser l'apparence et la fonctionnalité.

## Utilisation

- La page `select-dates.html` permet de sélectionner une date de début et une date de fin pour afficher le calendrier.
- Le tableau affichera les jours de la plage de dates sélectionnée.
- Vous pouvez interagir avec le tableau en mode coloriage :
  - Cochez la case "Entreprise" pour colorier les jours en bleu clair.
  - Cochez la case "Université" pour colorier les jours en orange.
  - Les cases en dehors de la plage de dates sélectionnée apparaîtront légèrement grisées et ne seront pas sélectionnables.
