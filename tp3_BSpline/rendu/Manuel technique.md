# Manuel Technique

## Structure du projet

- Le fichier index.html est composé 
  - D'un import CDN de ThreeJs et de BootStrap (cf la partie sur les dépendances)
  - Des différents éléments html présent sur la page (boutons, selects, checkBox)
  - Des appels JavaScript vers les fichiers main.js et initListeners.js

- Le fichier index.css comporte les modifications de style liés à l'index.js

- Vous trouvez dans initListeners.js tous les listeners sur la page, notamment concernant les boutons, selects et checkBox

- Dans le main.js, vous retrouvez :
  - Quatre variables globales :
    - camera : permet de modifier dans tous le fichier js la caméra, permet notamment de modifier le zoom
    - tableauPoint : permet de stocker les points de contrôles
    - vecteurNoeud : permet de stocker le vecteur de noeud
    - poids : permet de stocker les poids
    
  - De nombreuses fonctions :
    - initCanva : initialise / remet à 0 la liste de point et le canva
    - main : créé un nouveau canva en affichant :
      - les points de contrôle
      - le polygone de contrôle
      - la courbe de Béziers
    - recupPoints : convertit les points si besoin, puis les envoi à deBoor, puis les convertit pour les afficher
    - deBoor : algorithme de De Boor
    - erreur : affiche l'erreur générée par l'algorithme de De Boor
    - autoZoom : modifie le zoom de la figure pour se fixer sur la zone à afficher
    - clickAutoZoom : gère le click sur le bouton autoZoom et active / désactive l'input permettant de modifier manuellement le zoom
    - ajout : gère l'ajout / la modification de point
    - removePointSelect : permet de supprimer un point
    - allPointSelect : supprime tous les points de la liste de points et recréé la liste à partir du tableau de point
    - afficherPoint : affiche le point à modifier à la modification du select
    - changeAjouter : modifie le texte du bouton ajouter lorsqu'il s'agit de modifier un point plutôt que d'en ajouter un nouveau
    - des fonctions pour modifier dynamiquement l'affichage des vecteurs noeuds et des poids :
      - modifVecteurNoeudFromHtml : modifie le tableau vecteurNoeud depuis l'HTML
      - modifVecteurNoeudFromJs : modifie l'affichage de la partie HTML du vecteurNoeud avec les valeurs actualisés
      - modifPoidsFromHtml : modifie le tableau vecteurNoeud depuis l'HTML
      - modifPoidsFromJs : modifie l'affichage de la partie HTML des poids avec les valeurs actualisés
    - bonus : affiche les courbes bonus en fonction de la sélection

## Dépendances

- ThreeJs, version r128
  - Importé à l'aide d'un appel CDN au début du fichier index.html
- BootStrap, version 5.1.3
  - Importé à l'aide d'un appel CDN au début du fichier index.html