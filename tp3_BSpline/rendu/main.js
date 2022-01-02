// on crée la caméra de la taille de la fenêtre
const camera = new THREE.PerspectiveCamera(45, window.innerWidth * 0.6 / window.innerHeight, 1, 500);
let tableauPoint = []; // tableau contenant les points de controle
let vecteurNoeud = []; // tableau contenant le vecteur noeud
let poids = [];        // tableau contenant les poids de chaque points (compris entre 0 et 1, si égale à 1, la courbe passera par ce point)

// permet d'initialiser la zone de dessin / supprimer les points
function initCanva() {
    tableauPoint = [];
    vecteurNoeud = [];
    poids = [];
    modifVecteurNoeudFromJs();
    modifPoidsFromJs();

    allPointSelect();
    main();
}


// affiche les points et la courbe de béziers
function main() {
    let form = document.querySelector('form');

    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth * 0.6, window.innerHeight);

    // permet de supprimer le canva s'il existe déjà pour l'actualiser
    if (document.querySelector('canvas') !== null) document.querySelector('canvas').remove();
    document.getElementsByClassName('masthead')[0].appendChild(renderer.domElement);

    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, 0);

    const scene = new THREE.Scene();

    // couleur et taille de chaque point
    const material = new THREE.PointsMaterial({
        color: 0xb1b1b1,
        size: 0.05
    });
    const materialBSpline = new THREE.PointsMaterial({
        color: 0xb1b1b1,
        size: 0.01
    });

    const materialLigne = new THREE.LineBasicMaterial({
        color: 0xb1b1b1
    });

    // récupère le degré à utiliser sur le formulaire
    let degre = parseInt(form.degre.value);

    // on ajoute tous les points
    const pointsBSpline = recupPoints(degre);

    // conversion des points de contrôle à afficher
    let vecteurControle = [];
    if (tableauPoint.length !== 0) {
        if (tableauPoint[0].x === undefined)
            for (let point of tableauPoint)
                vecteurControle.push(new THREE.Vector3(point[0], point[1], 0))
        else vecteurControle = tableauPoint;
    }

    // on créé les buffers de points
    const geometryControle = new THREE.BufferGeometry().setFromPoints(vecteurControle);
    const geometryBSpline = new THREE.BufferGeometry().setFromPoints(pointsBSpline);

    // enregistre tous les points
    const formeControle = new THREE.Points(geometryControle, material);
    const formeLigne = new THREE.Line(geometryControle, materialLigne);
    const formeBSpline = new THREE.Points(geometryBSpline, materialBSpline);

    // affiche tous les points
    scene.add(formeControle);
    scene.add(formeLigne);
    scene.add(formeBSpline);

    // si l'autozoom est coché
    if (document.getElementById("zoom").checked === true)
        autoZoom(vecteurControle);

    renderer.render(scene, camera);
}

function recupPoints(degre) {
    // si l'on a pas de points, pas la peine de tout faire
    if (tableauPoint.length === 0) return [];

    // conversion du tableau de vecteur en tableau de points
    let tmpTableauPoint = [];
    if (tableauPoint[0].x !== undefined)
        for (let i = 0; i < tableauPoint.length; i++)
            tmpTableauPoint.push([tableauPoint[i].x, tableauPoint[i].y]);
    else tmpTableauPoint = tableauPoint;

    // récupération des points de la courbe
    const tmpPointsBSplines = [];
    let tmpPoint;
    for (let t = 0; t < 1; t += 0.001) {
        tmpPoint = deBoor(t, degre, tmpTableauPoint);
        tmpPointsBSplines.push(new THREE.Vector3(tmpPoint[0], tmpPoint[1], 0));
    }

    return tmpPointsBSplines
}

// algorithme de De Boor
function deBoor(t, degre, points, result) {
    let n = points.length;    // nombre de points
    let d = points[0].length; // dimension des poids (3d ou 2d)

    if (degre < 1)
        erreur('Le degré doit être au moins égal à 1');
    if (degre > (n - 1))
        erreur('Le degré doit être inférieur ou égal au nombre de points - 1');

    if (poids.length === 0) {
        // initialise les poids à 1, s'ils n'ont pas déjà été initialisé
        poids = [];
        for (let i = 0; i < n; i++) {
            poids[i] = 1;
        }
        modifPoidsFromJs();
    }

    if (vecteurNoeud.length === 0) {
        // construit un vecteur de noeud de taille [n + degre + 1]
        vecteurNoeud = [];
        for (let i = 0; i < n + degre + 1; i++) {
            vecteurNoeud[i] = i;
        }
        modifVecteurNoeudFromJs();
    } else {
        if (vecteurNoeud.length !== n + degre + 1)
            erreur("La taille du vecteur de noeud rentré est incorrect. \n" +
                "Elle doit être égal à nombre de point + degre + 1");
    }

    let domaine = [
        degre,
        vecteurNoeud.length - 1 - degre
    ];

    // transforme t sur le domaine de définition de la spline
    let min = vecteurNoeud[domaine[0]];
    let max = vecteurNoeud[domaine[1]];
    t = t * (max - min) + min;

    if (t < min || t > max) erreur('Noeud hors limite');

    // on cherche le segment de spline cherché s
    let s;
    for (s = domaine[0]; s < domaine[1]; s++)
        if (t >= vecteurNoeud[s] && t <= vecteurNoeud[s + 1])
            break;

    // on convertit les points pour qu'ils aient chacun des coordonnées homogènes
    let v = [];
    for (let i = 0; i < n; i++) {
        v[i] = [];
        for (let j = 0; j < d; j++)
            v[i][j] = points[i][j] * poids[i];

        v[i][d] = poids[i];
    }

    let alpha;
    for (let l = 1; l <= degre + 1; l++) {
        for (let i = s; i > s - degre - 1 + l; i--) {
            alpha = (t - vecteurNoeud[i]) / (vecteurNoeud[i + degre + 1 - l] - vecteurNoeud[i]);

            // on créé la courbe à partir de chaque composant
            for (let j = 0; j < d + 1; j++)
                v[i][j] = (1 - alpha) * v[i - 1][j] + alpha * v[i][j];
        }
    }

    // on reconvertit les coordonnées calculées en coordonnées cartésiennes pour affichage
    result = result || [];
    for (let i = 0; i < d; i++) {
        result[i] = v[s][i] / v[s][d];
    }

    return result;
}

// affiche un message d'erreur en cas d'erreur
function erreur(message) {
    alert(message);
    throw new Error(message);
}

// permet de dézoomer automatiquement
function autoZoom(pointsControle) {
    if (pointsControle.length === 1) {
        camera.position.set(pointsControle[0].x, pointsControle[0].y, 1);
        camera.lookAt(pointsControle[0].x, pointsControle[0].y, 1);
    } else {
        let Xmin = 999., Xmax = -999., Ymin = 999., Ymax = -999.;
        for (let i = 0; i < pointsControle.length; i++) {
            if (Xmin > pointsControle[i].x)
                Xmin = pointsControle[i].x;
            if (Xmax < pointsControle[i].x)
                Xmax = pointsControle[i].x;
            if (Ymin > pointsControle[i].y)
                Ymin = pointsControle[i].y;
            if (Ymax < pointsControle[i].y)
                Ymax = pointsControle[i].y;
        }

        let Xmoy = (Xmax - Xmin) / 2;
        let Ymoy = (Ymax - Ymin) / 2;

        if (Xmoy > Ymoy) {
            let dezoom = (Xmax - Xmin) * 1.25;
            camera.position.set(Xmin + Xmoy, Ymin + Ymoy, dezoom);
            camera.lookAt(Xmin + Xmoy, Ymin + Ymoy, dezoom);

        } else {
            let dezoom = (Ymax - Ymin) * 2;
            camera.position.set(Xmin + Xmoy, Ymin + Ymoy, dezoom);
            camera.lookAt(Xmin + Xmoy, Ymin + Ymoy, dezoom);
        }
    }
}


// gère le click sur l'autozoom
function clickAutoZoom() {
    let checkAutoZoom = document.getElementById('zoom');
    let inputDezoom = document.getElementById('dezoom');

    if (checkAutoZoom.checked) inputDezoom.setAttribute('disabled', '');
    else inputDezoom.removeAttribute('disabled');

    main();
}


//ajoute un nouveau point au tablau de point
function ajout() {
    let form = document.querySelector('form');

    if (form.xPointAjout.value === "" || form.yPointAjout.value === "") {
    } else if (form.pointFigure.value === "new") {
        tableauPoint.push(new THREE.Vector3(parseInt(form.xPointAjout.value), parseInt(form.yPointAjout.value), 0));
    } else {
        tableauPoint[form.pointFigure.value - 1] = new THREE.Vector3(parseInt(form.xPointAjout.value), parseInt(form.yPointAjout.value), 0)
    }

    allPointSelect();

    main();
}


// supprime le point affiché
function removePointSelect() {
    let div = document.getElementsByName('pointFigure')[0];
    if (div.value !== 'new') {
        tableauPoint = tableauPoint.slice(0, div.value - 1).concat(tableauPoint.slice(div.value, tableauPoint.length));
        div.children[div.value].remove();
    }

    allPointSelect();

    main();
}


// remet tous les points dans le select
function allPointSelect() {
    let div, option;
    div = document.getElementsByName('pointFigure')[0];

    const tmp = div.children.length
    for (let i = 1; i < tmp; i++)
        div.children[1].remove();

    for (const [index, point] of tableauPoint.entries()) {
        option = document.createElement('option');
        div.appendChild(option);
        option.setAttribute('value', String(index + 1));
        option.textContent =
            'Point ' + (index + 1) + ' (' + point.x + ', ' + point.y + ')';
    }

    afficherPoint();
}


// affiche le point clické pour le modifier
function afficherPoint() {
    let form = document.querySelector('form');
    let boutonSuppr = document.getElementById('suppressionPoint');

    if (form.pointFigure.value !== "new") {
        form.xPointAjout.value = tableauPoint[form.pointFigure.value - 1].x;
        form.yPointAjout.value = tableauPoint[form.pointFigure.value - 1].y;
        boutonSuppr.removeAttribute('disabled');
    } else {
        form.xPointAjout.value = '';
        form.yPointAjout.value = '';
        boutonSuppr.setAttribute('disabled', '');
    }

    changeAjouter();
}


// modifie le texte du bouton ajouter
function changeAjouter() {
    let form = document.querySelector('form');
    let btnAjouter = document.getElementById('ajoutPoint');

    if (form.xPointAjout.value !== "" || form.yPointAjout.value !== "")
        btnAjouter.textContent = 'Modifier';
    else btnAjouter.textContent = 'Ajouter';
}

// modifie le vecteur noeud JS à partir de l'HTML
function modifVecteurNoeudFromHtml() {
    let noeud = document.getElementById('noeud').value;
    let tmpNoeud = "[" + noeud + "]";
    vecteurNoeud = eval(tmpNoeud);
    main();
}

// modifie le vecteur noeud HTML à partir du JS
function modifVecteurNoeudFromJs() {
    document.getElementById('noeud').value = String(vecteurNoeud);
}

// modifie le vecteur poid JS à partir de l'HTML
function modifPoidsFromHtml() {
    let formPoids = document.getElementById('poids').value;
    let tmpPoids = "[" + formPoids + "]";
    poids = eval(tmpPoids);
    main();
}

// modifie le vecteur poid HTML à partir du JS
function modifPoidsFromJs() {
    document.getElementById('poids').value = String(poids);
}

// permet d'afficher les courbes de Béziers en préselection dans le bonus
function bonus() {
    let form = document.querySelector('form');

    switch (form.bonus.value) {
        // courbe de test avec vecteur noeud [0, 1, 2, 3]
        case 'courbe1':
            tableauPoint = [
                {x: 0, y: 0},
                {x: 1, y: 1},
                {x: 2, y: 1},
                {x: 3, y: 0}
            ];
            break;

        // courbe utilisé pour Béziers pour comparer le résultat
        case 'courbe2':
            // possibilité de l'écrire sous forme de tableau
            // tableauPoint = [
            //     [0, 0],
            //     [1, 4],
            //     [3, 5],
            //     [4, 4],
            //     [3, 1],
            //     [6, 1],
            //     [5, 5],
            //     [6.5, 6],
            //     [8, 5],
            //     [7.5, 2]
            // ];
            tableauPoint = [
                {x: 0, y: 0},
                {x: 1, y: 4},
                {x: 3, y: 5},
                {x: 4, y: 4},
                {x: 3, y: 1},
                {x: 6, y: 1},
                {x: 5, y: 5},
                {x: 6.5, y: 6},
                {x: 8, y: 5},
                {x: 7.5, y: 2}
            ];
            break;

        default:
            break;
    }

    form.degre.value = tableauPoint.length - 1;
    vecteurNoeud = [];
    poids = [];

    allPointSelect();

    main();
}