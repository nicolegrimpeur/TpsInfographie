const camera = new THREE.PerspectiveCamera(45, window.innerWidth * 0.6 / window.innerHeight, 1, 500);
let tableauPoint = []; // tableau contenant les points de controle
let vecteurNoeud = [];

// permet d'initialiser la zone de dessin / supprimer les points
function initCanva() {
    tableauPoint = [];
    vecteurNoeud = abSort(tableauPoint);
    allPointSelect();
    main();
}


// affiche les points et la courbe de béziers
function main() {
    let form = document.querySelector('form');

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth * 0.6, window.innerHeight);

    // permet de supprimer le canva s'il existe déjà pour l'actualiser
    if (document.querySelector('canvas') !== null) document.querySelector('canvas').remove();
    document.getElementsByClassName('masthead')[0].appendChild(renderer.domElement);

    // on créé la caméra de la taille de la fenêtre

    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, 0);

    // à faire, permettre à l'utilisateur de gérer le dézoom
    camera.position.z = form.dezoom.value;

    const scene = new THREE.Scene();

    // couleur et taille de chaque point
    const material = new THREE.PointsMaterial({
        color: 0xb1b1b1,
        size: 0.05
    });
    const materialBezier = new THREE.PointsMaterial({
        color: 0xb1b1b1,
        size: 0.01
    });

    const materialLigne = new THREE.LineBasicMaterial({
        color: 0xb1b1b1
    });

    vecteurNoeud = abSort(tableauPoint);

    // on ajoute tous les points
    const pointsBezier = addPointsBSpline(tableauPoint);

    // créé un buffer de points à partir du tableau de points
    const geometryControle = new THREE.BufferGeometry().setFromPoints(tableauPoint);
    const geometryBezier = new THREE.BufferGeometry().setFromPoints(pointsBezier);

    // enregistre tous les points
    const formeControle = new THREE.Points(geometryControle, material);
    const formeLigne = new THREE.Line(geometryControle, materialLigne);
    const formeBezier = new THREE.Points(geometryBezier, materialBezier);

    // affiche tous les points
    scene.add(formeControle);
    scene.add(formeLigne);
    scene.add(formeBezier);

    // si l'autozoom est coché
    if (document.getElementById("zoom").checked === true)
        autoZoom(tableauPoint);

    renderer.render(scene, camera);
}

function abSort(pointsControle) {
    let tabAbscisse = [];
    for (let i = 0; i < pointsControle.length; i++) {
        tabAbscisse.push(pointsControle[i].x);

    }
    tabAbscisse.sort();
    return tabAbscisse;
}

async function addPointsDeBoor(pointsControle) {
    const points = [];

    let x, y, degre = pointsControle.length - 1, ordre = degre++, alpha;
    // let x, y, degre = 2, ordre = degre++;

    let precision = 0.1;
    if (pointsControle.length !== 0) {
        for (let t = 0; t < 1; t += precision) {
            // let t = 0;
            x = 0;
            y = 0;
            for (let i = 0; i < pointsControle.length; i++) {
                x += await deBoor(pointsControle, ordre, degre, pointsControle[i].x);
                y += await deBoor(pointsControle, ordre, degre, pointsControle[i].y);
            }
            console.log(x, y);
            points.push(new THREE.Vector3(x, y, 0))
        }
    }

    return points;
}

async function deBoor(pointsControle, ordre, degre, pos) {
    let d = [], alpha;

    for (let i = 0; i <= degre; i++) {
        d.push(pointsControle[i + ordre - degre]);
    }
    console.log(d);
    for (let r = 1; r <= degre; r++) {
        for (let j = degre; j >= r - 1; j--) {
            alpha = (pos - vecteurNoeud[j + ordre - degre]) / (vecteurNoeud[j + 1 + ordre - r] - vecteurNoeud[j + ordre - degre]);
            d[j] = (1 - alpha) * d[j - 1] + alpha * d[j];
        }
    }

    return d[degre];
}

async function addPointsBSpline(pointsControle) {
    const points = [];

    // let x, y, degre = pointsControle.length - 1;
    let x, y, degre = 2;

    console.log(pointsControle, vecteurNoeud);

    let precision = 0.1;
    if (pointsControle.length !== 0) {
        // for (let t = 0; t < 1; t += precision) {
        let t = 0;
        x = 0;
        y = 0;
        for (let i = 0; i < pointsControle.length - degre; i++) {
            // calcule la coordonnée de ce point en fonction de la formule du polynome de Berstein
            // console.log('debut');
            console.log(bSplineRecur(degre, i, t));
            x += pointsControle[i].x * await bSplineRecur(degre, i, t);
            y += pointsControle[i].y * await bSplineRecur(degre, i, t);
        }
        console.log(x, y);
        points.push(new THREE.Vector3(x, y, 0))
        // }
    }

    return points;
}

async function bSplineRecur(m, i, t) {
    // console.log(m, i, t);
    if (m === 0) {
        // console.log(t, i, vecteurNoeud[i], vecteurNoeud[i + 1]);
        // if (vecteurNoeud[i] <= t && (t < vecteurNoeud[i + 1] || vecteurNoeud[i + 1] === undefined)) {
        if (vecteurNoeud[i] <= t && t < vecteurNoeud[i + 1]) {
            // console.log('sortie' + 1);
            return 1;
        } else {
            // console.log('sorti 0');
            return 0;
        }
    } else {
        if (
            !(0 <= m && m <= vecteurNoeud.length - 1) ||
            !(0 <= i && i <= vecteurNoeud.length - m - 1)
        ) {
            // console.log('erreur 0')
            return 0;
        } else {
            // console.log('_')
            // console.log(m, i);
            // console.log(await bSplineRecur(m - 1, i, t));
            // console.log('else');
            // console.log('i + m : ', vecteurNoeud[i + m + 1 - 1], i, m, i + m + 1);
            // console.log('i - 1 : ', vecteurNoeud[i - 1], i - 1);
            let premierTerme = ((t - vecteurNoeud[i]) / (vecteurNoeud[i + m] - vecteurNoeud[i])) * await bSplineRecur(m - 1, i, t);
            // console.log(m, i, t, await bSplineRecur(m - 1, i, t));
            let deuxiemeTerme = ((vecteurNoeud[i + m + 1] - t) / (vecteurNoeud[i + m + 1] - vecteurNoeud[i + 1])) * await bSplineRecur(m - 1, i + 1, t);
            // return (isNaN(premierTerme) ? 0 : premierTerme) + (isNaN(deuxiemeTerme) ? 0 : deuxiemeTerme);
            return ((t - vecteurNoeud[i]) / (vecteurNoeud[i + m] - vecteurNoeud[i])) * await bSplineRecur(m - 1, i, t) +
                ((vecteurNoeud[i + m + 1] - t) / (vecteurNoeud[i + m + 1] - vecteurNoeud[i + 1])) * await bSplineRecur(m - 1, i + 1, t)
        }
    }
}

// retourne le tableau avec les points de la courbe de Bézier
function addPointsBezier(pointsControle) {
    const points = [];

    let x, y, degre = pointsControle.length - 1;

    let precision = 0.001;
    if (pointsControle.length !== 0)
        for (let t = 0; t < 1; t += precision) {
            x = 0;
            y = 0;
            for (let i = 0; i < pointsControle.length; i++) {
                // calcule la coordonnée de ce point en fonction de la formule du polynom de Berstein
                x += pointsControle[i].x * binomial(degre, i) * Math.pow(1 - t, degre - i) * Math.pow(t, i);
                y += pointsControle[i].y * binomial(degre, i) * Math.pow(1 - t, degre - i) * Math.pow(t, i);
            }

            points.push(new THREE.Vector3(x, y, 0))
        }

    return points;
}


// permet de calculer un coefficient binomial
function binomial(n, k) {
    if ((typeof n !== 'number') || (typeof k !== 'number'))
        return false;
    let coeff = 1;
    for (let x = n - k + 1; x <= n; x++) coeff *= x;
    for (let x = 1; x <= k; x++) coeff /= x;
    return coeff;
}


// permet de dézoomer automatiquement
function autoZoom() {
    if (tableauPoint.length === 1) {
        camera.position.set(tableauPoint[0].x, tableauPoint[0].y, 1);
        camera.lookAt(tableauPoint[0].x, tableauPoint[0].y, 1);
    } else {
        let Xmin = 999., Xmax = -999., Ymin = 999., Ymax = -999.;
        for (let i = 0; i < tableauPoint.length; i++) {
            if (Xmin > tableauPoint[i].x)
                Xmin = tableauPoint[i].x;
            if (Xmax < tableauPoint[i].x)
                Xmax = tableauPoint[i].x;
            if (Ymin > tableauPoint[i].y)
                Ymin = tableauPoint[i].y;
            if (Ymax < tableauPoint[i].y)
                Ymax = tableauPoint[i].y;
        }

        let Xmoy = (Xmax - Xmin) / 2;
        let Ymoy = (Ymax - Ymin) / 2;

        if (Xmoy > Ymoy) {
            let dezoom = Xmax - Xmin;
            camera.position.set(Xmin + Xmoy, Ymin + Ymoy, dezoom);
            camera.lookAt(Xmin + Xmoy, Ymin + Ymoy, dezoom);

        } else {
            let dezoom = (Ymax - Ymin) * 1.5;
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


// permet d'afficher les courbes de Béziers en préselection dans le bonus
function bonus() {
    let form = document.querySelector('form');

    switch (form.bonus.value) {
        case 'courbe1':
            tableauPoint = [
                {x: 0, y: 0},
                {x: 0, y: 1},
                {x: 1, y: 1},
                {x: 1, y: 0}
            ];
            break;

        case 'courbe2':
            tableauPoint = [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 0, y: 1},
                {x: 1, y: 1}
            ];
            break;

        case 'courbe3':
            tableauPoint = [
                {x: 0, y: 0},
                {x: 1, y: 1},
                {x: 0, y: 1},
                {x: 1, y: 0}
            ];
            break;

        default:
            break;
    }

    allPointSelect();

    main();
}