const camera = new THREE.PerspectiveCamera(45, window.innerWidth * 0.6 / window.innerHeight, 1, 500);
let tableauPoint = []; // tableau contenant les points de controle
let vecteurNoeud = []; // tableau contenant le vecteur noeud

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

    let degre = parseInt(form.degre.value);
    // let degre = 2;

    // on ajoute tous les points
    let tmpPointsBeziers = [];
    let tmpPoint;
    for (let t = 0; t < 1; t += 0.001) {
        tmpPoint = deBoorReccur(t, degre, tableauPoint);
        tmpPointsBeziers.push(new THREE.Vector3(tmpPoint[0], tmpPoint[1], 0));
    }

    const pointsBezier = tmpPointsBeziers;
    console.log(pointsBezier);

    // créé un buffer de points à partir du tableau de points
    let vecteurControle = [];
    for (let point of tableauPoint) vecteurControle.push(new THREE.Vector3(point[0], point[1], 0))
    const geometryControle = new THREE.BufferGeometry().setFromPoints(vecteurControle);
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
        autoZoom(vecteurControle);

    renderer.render(scene, camera);
}

// tri les abscisses des points pour en ressortir un vecteur noeud
function abSort(pointsControle) {
    let tabAbscisse = [];
    for (let i = 0; i < pointsControle.length; i++) {
        tabAbscisse.push(pointsControle[i].x);
    }
    tabAbscisse.sort();
    return tabAbscisse;
}

function recupPoints(degre) {
    let tmpPointsBezier = [], tmpPointsControles, limite;
    for (let i = 0; i < tableauPoint.length; i += 1) {
        limite = degre + 1;
        for (let j = degre; j > 0; j--)
            if (tableauPoint[i + j] === undefined) limite = j;
        tmpPointsControles = tableauPoint.slice().splice(i, limite);
        tmpPointsBezier = tmpPointsBezier.concat(addPointsBezier(tmpPointsControles));
    }
    // for (let i = tableauPoint.length; i > 0; i -= 1) {
    //     limite = degre + 1;
    //     for (let j = degre; j > 0; j--)
    //         if (tableauPoint[i + j] === undefined) limite = j;
    //     tmpPointsControles = tableauPoint.slice().splice(i, -limite);
    //     tmpPointsBezier = tmpPointsBezier.concat(addPointsBezier(tmpPointsControles));
    //     console.log(i);
    // }

    let curve = [];


    return tmpPointsBezier;
}

// retourne le tableau avec les points de la courbe de Bézier
function addPointsBezier(pointsControle) {
    const points = [];

    let x, y, Bi, degre = pointsControle.length - 1;

    let precision = 0.001;
    if (pointsControle.length !== 0)
        for (let t = 0; t < 1; t += precision) {
            x = 0; y = 0;

            for (let i = 0; i < pointsControle.length; i++) {
                // calcule la coordonnée de ce point en fonction de la formule du polynom de Berstein
                Bi = binomial(degre, i) * Math.pow(1 - t, degre - i) * Math.pow(t, i);
                x += pointsControle[i].x * Bi;
                y += pointsControle[i].y * Bi;
            }
            points.push(new THREE.Vector3(x, y, 0));
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

function deBoorReccur(t, degree, points, knots, weights, result) {
    if (points.length === 0) return [];
    let i,j,s,l;              // function-scoped iteration variables
    let n = points.length;    // points count
    let d = points[0].length; // point dimensionality

    if(degree < 1) throw new Error('degree must be at least 1 (linear)');
    if(degree > (n-1)) throw new Error('degree must be less than or equal to point count - 1');

    if(!weights) {
        // build weight vector of length [n]
        weights = [];
        for(i=0; i<n; i++) {
            weights[i] = 1;
        }
    }

    if(!knots) {
        // build knot vector of length [n + degree + 1]
        knots = [];
        for(i=0; i<n+degree+1; i++) {
            knots[i] = i;
        }
    } else {
        if(knots.length !== n+degree+1) throw new Error('bad knot vector length');
    }

    let domain = [
        degree,
        knots.length-1 - degree
    ];

    // remap t to the domain where the spline is defined
    let low  = knots[domain[0]];
    let high = knots[domain[1]];
    t = t * (high - low) + low;

    if(t < low || t > high) throw new Error('out of bounds');

    // find s (the spline segment) for the [t] value provided
    for(s=domain[0]; s<domain[1]; s++) {
        if(t >= knots[s] && t <= knots[s+1]) {
            break;
        }
    }

    // convert points to homogeneous coordinates
    let v = [];
    for(i=0; i<n; i++) {
        v[i] = [];
        for(j=0; j<d; j++) {
            v[i][j] = points[i][j] * weights[i];
        }
        v[i][d] = weights[i];
    }

    // l (level) goes from 1 to the curve degree + 1
    let alpha;
    for(l=1; l<=degree+1; l++) {
        // build level l of the pyramid
        for(i=s; i>s-degree-1+l; i--) {
            alpha = (t - knots[i]) / (knots[i+degree+1-l] - knots[i]);

            // interpolate each component
            for(j=0; j<d+1; j++) {
                v[i][j] = (1 - alpha) * v[i-1][j] + alpha * v[i][j];
            }
        }
    }

    // convert back to cartesian and return
    result = result || [];
    for(i=0; i<d; i++) {
        result[i] = v[s][i] / v[s][d];
    }

    return result;
}

// début implémentation de la méthode de de boor
async function addPointsDeBoor(pointsControle) {
    const points = [];

    let x, y, degre = pointsControle.length - 1, ordre = degre++, alpha;

    if (pointsControle.length !== 0) {
        for (let t of vecteurNoeud) {
            x = 0;
            y = 0;
            for (let i = 0; i < pointsControle.length - degre; i++) {
                x += await deBoor(pointsControle, ordre, degre, pointsControle[i].x);
                y += await deBoor(pointsControle, ordre, degre, pointsControle[i].y);
            }
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

    let precision = 0.1;
    if (pointsControle.length !== 0) {
        // for (let t = 0; t < 1; t += precision) {
        for (let t of vecteurNoeud) {
            let t = 0;
            x = 0;
            y = 0;
            for (let i = 0; i < pointsControle.length - degre; i++) {
                // calcule la coordonnée de ce point en fonction de la fonction bSpline
                x += pointsControle[i].x * await bSplineRecur(degre, i, t);
                y += pointsControle[i].y * await bSplineRecur(degre, i, t);
            }
            points.push(new THREE.Vector3(x, y, 0))
        }

        return points;
    }
}

// test autre implémentation s(t)
async function s(t) {
    let x = 0, y = 0, degre = 1;
    for (let i = 0; i < vecteurNoeud.length; i++) {
        x += tableauPoint[i].x * await bSplineRecur(degre, i, t);
        y += tableauPoint[i].y * await bSplineRecur(degre, i, t);
    }
    // console.log(x, y);
}
vecteurNoeud = [0, 1, 2, 3];
tableauPoint.push(new THREE.Vector3(0, 0));
tableauPoint.push(new THREE.Vector3(1, 1));
tableauPoint.push(new THREE.Vector3(2, 3));
tableauPoint.push(new THREE.Vector3(3, 0));
s(0).then();

// fonction récursive de bSpline
async function bSplineRecur(m, i, t) {
    if (m === 0) {
        if (vecteurNoeud[i] <= t && t < vecteurNoeud[i + 1]) {
            return 1;
        } else {
            return 0;
        }
    } else {
        if (
            // au lieu d'effectuer la vérification du cours qui causent de nombreux problèmes
            // (liés au dépassement du tableau vecteur noeud)
            // on effectue un test sur le dépassement de vecteur noeud
            // !(0 <= m && m <= vecteurNoeud.length - 1) ||
            // !(0 <= i && i <= vecteurNoeud.length - m - 1)
            vecteurNoeud[i + m + 1] === undefined
        ) {
            return 0;
        } else {
            // fonction du cours page 82
            return ((t - vecteurNoeud[i]) / (vecteurNoeud[i + m] - vecteurNoeud[i])) * await bSplineRecur(m - 1, i, t) +
                ((vecteurNoeud[i + m + 1] - t) / (vecteurNoeud[i + m + 1] - vecteurNoeud[i + 1])) * await bSplineRecur(m - 1, i + 1, t)
        }
    }
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
            tableauPoint = [
                [0, 0],
                [1, 4],
                [3, 5],
                [4, 4],
                [3, 1],
                [6, 1],
                [5, 5],
                [6.5, 6],
                [8, 5],
                [7.5, 2]
            ];
            break;

        default:
            break;
    }

    form.degre.value = tableauPoint.length - 1;

    allPointSelect();

    main();
}