// on récupère la zone de sélection du bonus
let bonusSelect = document.getElementById('bonus');

// event sur le select de préselection
bonusSelect.addEventListener('change', () => {
    bonus();
});


//on récupère le bouton pour ajouter les nouveaux points
let ajoutPoint = document.getElementById('ajoutPoint');

// lance la fonction au click sur le bouton submit
ajoutPoint.addEventListener('click', () => {
    ajout();
});


//on récupère le bouton pour afficher les points deja enregistré
let affichePoint = document.getElementById('point');

// lance la fonction au click sur le bouton de choix du point
affichePoint.addEventListener('change', () => {
    afficherPoint();
});


// bouton pour supprimer un point
let supprPoint = document.getElementById('suppressionPoint');
supprPoint.addEventListener('click', () => {
    removePointSelect();
});

// bouton de suppression des points
let suppressionPoints = document.getElementById('suppressionPoints');

// réinitialise le canva au click
suppressionPoints.addEventListener('click', () => {
    initCanva();
});


// check autozoom
let checkAutoZoom = document.getElementById('zoom');

// relance le main avec l'autozoom activé ou désactivé
checkAutoZoom.addEventListener('click', () => {
    clickAutoZoom();
});


// à la modification du vecteur de noeud et du poid
let formNoeuds = document.getElementById('noeud');

// relance le main avec l'autozoom activé ou désactivé
formNoeuds.addEventListener('change', () => {
    modifVecteurNoeudFromHtml();
});

let formPoids = document.getElementById('poids');

// relance le main avec l'autozoom activé ou désactivé
formPoids.addEventListener('change', () => {
    modifPoidsFromHtml();
});


// gère le click sur le bouton dessiner
let dessine = document.getElementById('dessiner');

// relance le main avec l'autozoom activé ou désactivé
dessine.addEventListener('click', () => {
    draw();
});