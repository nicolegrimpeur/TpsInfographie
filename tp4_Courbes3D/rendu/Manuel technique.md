# Manuel Technique

## Structure du projet

- Le fichier index.html est composé 
  - D'un import CDN de ThreeJs, ainsi que de OrbitControls et GLFTLoader (cf la partie sur les dépendances)
  - Une div dans lequel sera ajouté le canva
  - Un appel JavaScript vers le fichier main.js pour initialiser les variables globales et les fonctions, et importer la map 3D
  - Le lancement du dessin de la clé à molette

- Le fichier index.css comporte les modifications de la page web

- Dans le main.js, vous retrouvez :
  - Des variables globales :
    - tableauPoint : permet de stocker les points de contrôles
    - formeControle, formeLigne, formeBSpline : qui contiennent les formes à afficher
    - camera : permet de modifier dans tous le fichier js la caméra, permet notamment de modifier le zoom
    - renderer : la zone de dessins
    - cameraControls : la variable permetant de se déplacer autour de la clé à molette
    - scene : la scene dans laquelle on ajoute les formes 
    - texture et materialTexture : permet d'importer une texture et d'en faire un material three js
    - hlight : lumière amibiante 
    - echelleCle : échelle de la clé à molette par rapport à la map
    - mine : import de la map 3D


  - De nombreuses fonctions :
    - initCanva : initialise  la liste de point et le canva
    - main : modifie le canva en affichant la clé à molette
    - recupPoints : traite le tableau de points de contrôle pour le convertir pour l'algorithme de De Boor, puis renvoi les points obtenus
    - deBoorReccur : algorithme de De Boor. Renvoi la courbe BSpline
    - autoZoom : modifie le zoom de la figure pour se fixer sur la clé à molette, fixe aussi le point auquel la caméra pourra tourner


## Dépendances

- Importé à l'aide d'un appel CDN au début du fichier index.html
  - ThreeJs, version r136
  - OrbitControls, version r136
  - GLTFLoader, version r136
  