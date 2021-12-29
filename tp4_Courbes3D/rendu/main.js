let tableauPoint = []; // tableau contenant les points de controle
let vecteurNoeud = []; // tableau contenant le vecteur noeud
let poids = [];        // tableau contenant les poids de chaque points (compris entre 0 et 1, si égale à 1, la courbe passera par ce point)


///////// initialisation variable three js
// on crée la caméra de la taille de la fenêtre
const camera = new THREE.PerspectiveCamera(45, window.innerWidth * 0.6 / window.innerHeight, 1, 500);

// création de la zone d'affichage
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth * 0.6, window.innerHeight);
// on ajoute le canva
document.getElementsByClassName('masthead')[0].appendChild(renderer.domElement);

// création de la variable permettant la modification de la vision
let cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
cameraControls.target = new THREE.Vector3(0,0,0);

// création de la scène
const scene = new THREE.Scene();

// modification de la scène en fonction du déplacement sur la page
cameraControls.addEventListener('change', function() {
    renderer.render(scene, camera);
});

const texture = new THREE.TextureLoader().load( './assets/texture.jpg' );
const materialTexture = new THREE.MeshBasicMaterial( { map: texture } );

let formeControle, formeLigne, formeBSpline;

// permet d'initialiser la zone de dessin / supprimer les points
function initCanva() {
    allPointSelect();
    main();
}


// affiche les points et la courbe de béziers
function main() {
    let form = document.querySelector('form');

    if (formeControle) scene.remove(formeControle);
    if (formeLigne) scene.remove(formeLigne);
    if (formeBSpline) scene.remove(formeBSpline);

    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, 0);

    // à faire, permettre à l'utilisateur de gérer le dézoom
    camera.position.z = form.dezoom.value;

    // couleur et taille de chaque point
    const material = new THREE.PointsMaterial({
        color: 0xb1b1b1,
        size: 0.05
    });
    const materialBSpline = new THREE.PointsMaterial({
        color: 0x535355,
        size: 0.01
    });

    const materialLigne = new THREE.LineBasicMaterial({
        color: 0xb1b1b1
    });

    // récupère le degré à utiliser sur le formulaire
    let degre = parseInt(form.degre.value);

    // récupère le vecteur noeud sur le formulaire
    vecteurNoeud = [];

    // récupère le poid sur le formulaire
    poids = [[1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5, 10], [1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5, 10]];
    console.log(tableauPoint);

    // on ajoute tous les points
    const pointsBSpline = recupPoints(degre, vecteurNoeud, poids);
    let geometryControle, geometryBSpline, vecteurControle;
    for (let i = 0; i < pointsBSpline.length; i++) {
        // conversion des points de contrôle à afficher
        vecteurControle = [];
        if (tableauPoint.length !== 0) {
            if (tableauPoint[i] !== undefined) {
                if (tableauPoint[i][0].x === undefined)
                    for (let point of tableauPoint[i])
                        vecteurControle.push(new THREE.Vector3(point[0], point[1], point[2]))
                else vecteurControle = tableauPoint[i];
            }
        }


        // on créé les buffers de points
        geometryControle = new THREE.BufferGeometry().setFromPoints(vecteurControle);
        formeControle = new THREE.Points(geometryControle, material);
        // enregistre tous les points
        formeLigne = new THREE.Line(geometryControle, materialLigne);

        // affiche tous les points
        scene.add(formeControle);
        // scene.add(formeLigne);


        geometryBSpline = new THREE.BufferGeometry().setFromPoints(pointsBSpline[i]);
        formeBSpline = new THREE.Line(geometryBSpline, materialBSpline);
        // formeBSpline = new THREE.Mesh( geometryBSpline, materialTexture );
        scene.add(formeBSpline);
    }

    console.log(pointsBSpline);

    if (pointsBSpline[1] !== undefined) {
        let tmpPoints = [];
        for (let i = 0; i < pointsBSpline[0].length; i++) {
            if (!(pointsBSpline[0][i].x === 0 && pointsBSpline[0][i].y === 0 && pointsBSpline[0][i].z === 0)) {
                tmpPoints.push({x: pointsBSpline[0][i].x, y: pointsBSpline[0][i].y, z: pointsBSpline[0][i].z});
                tmpPoints.push({x: pointsBSpline[1][i].x, y: pointsBSpline[1][i].y, z: pointsBSpline[1][i].z});
            }
        }
        geometryBSpline = new THREE.BufferGeometry().setFromPoints(tmpPoints);
        formeBSpline = new THREE.Line(geometryBSpline, materialBSpline);
        // formeBSpline = new THREE.Mesh( geometryBSpline, materialTexture );
        scene.add(formeBSpline);

        // for (let t = 0; t <= 1; t += 0.1)
        //     for (let i = 0; i < pointsBSpline[0].length; i++)
        //         tmpPoints.push({x: pointsBSpline[1][i].x, y: pointsBSpline[1][i].y, z: pointsBSpline[1][i].z * t});
        // geometryBSpline = new THREE.BufferGeometry().setFromPoints(tmpPoints);
        // // formeBSpline = new THREE.Points(geometryBSpline, materialBSpline);
        // formeBSpline = new THREE.Mesh( geometryBSpline, materialTexture );
        // scene.add(formeBSpline);
    }


    // si l'autozoom est coché
    if (document.getElementById("zoom").checked === true)
        autoZoom(vecteurControle);

    renderer.render(scene, camera);
}


function recupPoints(degre, noeuds, poids) {
    // si l'on a pas de points, pas la peine de tout faire
    if (tableauPoint.length === 0) return [];


    let tmpTableauPoint;
    let tmpPointsBSplines = [];
    let tmpPoint, tmpTaille;
    // for (let j = 0; j < tableauPoint.length; j++) {
    for (let j = 0; j < 2; j++) {
        tmpTableauPoint = [];
        // conversion du tableau de vecteur en tableau de points
        if (tableauPoint[j][0].x !== undefined)
            for (let i = 0; i < tableauPoint[j].length; i++)
                tmpTableauPoint.push([tableauPoint[j][i].x, tableauPoint[j][i].y, tableauPoint[j][i].z]);
        else tmpTableauPoint = tableauPoint[j];

        // récupération des points de la courbe
        tmpPointsBSplines.push([]);
        for (let t = 0; t < 1; t += 0.0001) {
            tmpPoint = deBoorReccur(t, degre, tmpTableauPoint, noeuds, poids[j]);
            tmpPointsBSplines[j].push(new THREE.Vector3(tmpPoint[0], tmpPoint[1], tmpPoint[2]));
            tmpPointsBSplines[j].push(new THREE.Vector3(0, 0, tmpPoint[2]));
        }
    }

    return tmpPointsBSplines;
}

// algorithme de De Boor
function deBoorReccur(t, degre, points, noeuds, poids, result) {
    let n = points.length;    // nombre de points
    let d = points[0].length; // dimension des poids (3d ou 2d)

    // TODO : - Afficher les textes sur la page en cas d'erreur (sur le html ou via une popup erreur)
    //        - Utiliser une fonction template dans laquelle on rentre un texte pour la réutiliser à chaque fois
    if (degre < 1) throw new Error('Le degré doit être au moins égal à 1');
    if (degre > (n - 1)) throw new Error('Le degré doit être inférieur ou égal au nombre de points - 1');

    if (poids.length === 0) {
        // initialise les poids à 1, s'ils n'ont pas déjà été initialisé
        poids = [];
        for (let i = 0; i < n; i++) {
            poids[i] = 1;
        }
    }

    if (noeuds.length === 0) {
        // construit un vecteur de noeud de taille [n + degre + 1]
        noeuds = [];
        for (let i = 0; i < n + degre + 1; i++) {
            noeuds[i] = i;
        }
    } else {
        // TODO : - Afficher les textes sur la page en cas d'erreur (sur le html ou via une popup erreur)
        //        - Utiliser une fonction template dans laquelle on rentre un texte pour la réutiliser à chaque fois
        if (noeuds.length !== n + degre + 1) throw new Error('La taille du vecteur de noeud rentré est incorrect');
    }

    let domaine = [
        degre,
        noeuds.length - 1 - degre
    ];

    // transforme t sur le domaine de définition de la spline
    let min = noeuds[domaine[0]];
    let max = noeuds[domaine[1]];
    t = t * (max - min) + min;

    if (t < min || t > max) throw new Error('Noeud hors limite');

    // on cherche le segment de spline cherché s
    let s;
    for (s = domaine[0]; s < domaine[1]; s++)
        if (t >= noeuds[s] && t <= noeuds[s + 1])
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
            alpha = (t - noeuds[i]) / (noeuds[i + degre + 1 - l] - noeuds[i]);

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



// permet de dézoomer automatiquement
function autoZoom() {
    const tmpTab = (tableauPoint.length === 0) ? tableauPoint : tableauPoint[0];
    if (tableauPoint.length === 1) {
        camera.position.set(tmpTab[0].x, tmpTab[0].y, 1);
        camera.lookAt(tmpTab[0].x, tmpTab[0].y, 1);
    } else {
        let Xmin = 999., Xmax = -999., Ymin = 999., Ymax = -999.;

        for (let i = 0; i < tmpTab.length; i++) {
            if (Xmin > tmpTab[i].x)
                Xmin = tmpTab[i].x;
            if (Xmax < tmpTab[i].x)
                Xmax = tmpTab[i].x;
            if (Ymin > tmpTab[i].y)
                Ymin = tmpTab[i].y;
            if (Ymax < tmpTab[i].y)
                Ymax = tmpTab[i].y;
        }

        let Xmoy = (Xmax - Xmin) / 2;
        let Ymoy = (Ymax - Ymin) / 2;

        let dezoom;
        if (Xmoy > Ymoy) dezoom = (Xmax - Xmin) * 1.25;
        else dezoom = (Ymax - Ymin) * 2;

        camera.position.set(Xmin + Xmoy, Ymin + Ymoy, dezoom);
        camera.lookAt(Xmin + Xmoy, Ymin + Ymoy, dezoom);
        cameraControls.target = new THREE.Vector3(Xmin + Xmoy,Ymin + Ymoy, 0);
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
        tableauPoint.push(new THREE.Vector3(parseInt(form.xPointAjout.value), parseInt(form.yPointAjout.value), parseInt(form.zPointAjout.value)));
    } else {
        tableauPoint[form.pointFigure.value - 1] = new THREE.Vector3(parseInt(form.xPointAjout.value), parseInt(form.yPointAjout.value), parseInt(form.zPointAjout.value))
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
    // let div, option;
    // div = document.getElementsByName('pointFigure')[0];
    //
    // const tmp = div.children.length
    // for (let i = 1; i < tmp; i++)
    //     div.children[1].remove();
    //
    // for (const [index, point] of tableauPoint[0].entries()) {
    //     option = document.createElement('option');
    //     div.appendChild(option);
    //     option.setAttribute('value', String(index + 1));
    //     option.textContent =
    //         'Point ' + (index + 1) + ' (' + point.x + ', ' + point.y + ', ' + point.z + ')';
    // }

    afficherPoint();
}


// affiche le point clické pour le modifier
function afficherPoint() {
    let form = document.querySelector('form');
    let boutonSuppr = document.getElementById('suppressionPoint');

    if (form.pointFigure.value !== "new") {
        form.xPointAjout.value = tableauPoint[form.pointFigure.value - 1].x;
        form.yPointAjout.value = tableauPoint[form.pointFigure.value - 1].y;
        form.zPointAjout.value = tableauPoint[form.pointFigure.value - 1].z;
        boutonSuppr.removeAttribute('disabled');
    } else {
        form.xPointAjout.value = '';
        form.yPointAjout.value = '';
        form.zPointAjout.value = '';
        boutonSuppr.setAttribute('disabled', '');
    }

    changeAjouter();
}


// modifie le texte du bouton ajouter
function changeAjouter() {
    let form = document.querySelector('form');
    let btnAjoute = document.getElementById('ajoutPoint');

    if (form.xPointAjout.value !== "" || form.yPointAjout.value !== "" || form.zPointAjout.value !== "")
        btnAjoute.textContent = 'Modifier';
    else btnAjoute.textContent = 'Ajouter';
}


// permet d'afficher les courbes de Béziers en préselection dans le bonus
function bonus() {
    let form = document.querySelector('form');

    switch (form.bonus.value) {
        case 'courbe1':
            tableauPoint = [[
                {x: 2, y: 1, z: 0},
                {x: 3, y: 2, z: 0},
                {x: 4.5, y: 1.5, z: 0},
                {x: 3, y: 0, z: 0},
                {x: 5, y: -0.75, z: 0},
                {x: 3.5, y: -2, z: 0},
                {x: 2, y: -1, z: 0},
                {x: 0, y: -1, z: 0},
                {x: -2, y: -1, z: 0},
                {x: -3, y: -2, z: 0},
                {x: -4.5, y: -1.5, z: 0},
                {x: -3, y: 0, z: 0},
                {x: -5, y: 1, z: 0},
                {x: -3.5, y: 2, z: 0},
                {x: -2, y: 1, z: 0},
                {x: 0, y: 1, z: 0},
                {x: 2, y: 1, z: 0}
            ]];

            // tableauPoint[0].push({x: 2, y: 1, z: 0.5});
            // ajout d'une deuxième dimension
            const tmpTab = JSON.parse(JSON.stringify(tableauPoint[0]));
            for (let point of tmpTab)
                point.z = 1;
            tableauPoint.push(tmpTab);
            break;

        case 'courbe2':
            tableauPoint = [
                [{x: -10, y: 10, z: 0},
                    {x: 0, y: 7, z: 0},
                    {x: 15, y: 3, z: 0},
                    {x: 30, y: 8, z: 0}],
                [{x: -10, y: 0, z: 10},
                    {x: -5, y: 15, z: 10},
                    {x: 20, y: 10, z: 10},
                    {x: 30, y: 5, z: 10}],
                [{x: -10, y: 5, z: 20},
                    {x: -5, y: -10, z: 20},
                    {x: 10, y: 10, z: 20},
                    {x: 30, y: 0, z: 20}],
                [{x: -10, y: 4, z: 30},
                    {x: -5, y: 8, z: 30},
                    {x: 20, y: 6, z: 30},
                    {x: 30, y: 4, z: 30}]
            ];
            break;

        case 'courbe3':
            tableauPoint = [
                {x: 0, y: 0, z: 0},
                {x: 1, y: 1, z: 0},
                {x: 0, y: 1, z: 0},
                {x: 1, y: 0, z: 0}
            ];
            break;

        default:
            break;
    }

    allPointSelect();

    main();
}

function origin() {
    let tab = [];
    tab.push(new THREE.Vector3(1, 0, 0));
    tab.push(new THREE.Vector3(0, 0, 0));
    tab.push(new THREE.Vector3(0, 1, 0));
    tab.push(new THREE.Vector3(0, 0, 0));
    tab.push(new THREE.Vector3(0, 0, 1));
    return tab;
}