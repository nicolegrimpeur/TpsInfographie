const camera = new THREE.PerspectiveCamera(45, window.innerWidth * 0.6 / window.innerHeight, 1, 500);
let tableauPoint = []; // tableau contenant les points de controle

// permet d'initialiser la zone de dessin / supprimer les points
function initCanva() {
    tableauPoint = [];
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

    const materialOrigin = new THREE.LineBasicMaterial({
        color: 0xb1b1b1,
        linewidth: 1
    });

    // on ajoute tous les points
    const pointsBezier = addPointsBezier(tableauPoint);
    const tabOrigin = origin();

    // créé un buffer de points à partir du tableau de points
    const geometryControle = new THREE.BufferGeometry().setFromPoints(tableauPoint);
    const geometryBezier = new THREE.BufferGeometry().setFromPoints(pointsBezier);
    const geometryOrigin = new THREE.BufferGeometry().setFromPoints(tabOrigin);

    // enregistre tous les points
    const formeControle = new THREE.Points(geometryControle, material);
    const formeLigne = new THREE.Line(geometryControle, materialLigne);
    const formeBezier = new THREE.Points(geometryBezier, materialBezier);
    const formeOrigin = new THREE.Line(geometryOrigin, materialOrigin);

    // affiche tous les points
    scene.add(formeControle);
    scene.add(formeLigne);
    scene.add(formeBezier);
    // scene.add(formeOrigin);

    //affichage des axes
    const axesHelper = new THREE.AxesHelper(100);
    scene.add(axesHelper);

    // si l'autozoom est coché
    if (document.getElementById("zoom").checked === true)
        autoZoom(tableauPoint);

    renderer.render(scene, camera);
}


// retourne le tableau avec les points de la courbe de Bézier
function addPointsBezier(pointsControle) {
    const points = [];

    let x, y, z, compteur = 0, degre = pointsControle.length - 1;

    let precision = 0.001;
    if (pointsControle.length !== 0)
        for (let compteur = 0; compteur < pointsControle.length; compteur += 3) {
            for (let t = 0; t < 1; t += precision) {
                x = 0;
                y = 0;
                z = 0;
                for (let i = compteur; i < compteur + 3; i++) {
                    // calcule la coordonnée de ce point en fonction de la formule du polynom de Berstein
                    x += pointsControle[i].x * binomial(degre, i) * Math.pow(1 - t, degre - i) * Math.pow(t, i);
                    y += pointsControle[i].y * binomial(degre, i) * Math.pow(1 - t, degre - i) * Math.pow(t, i);
                    z += pointsControle[i].z * binomial(degre, i) * Math.pow(1 - t, degre - i) * Math.pow(t, i);
                }

                points.push(new THREE.Vector3(x, y, z));
            }
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
            'Point ' + (index + 1) + ' (' + point.x + ', ' + point.y + ', ' + point.z + ')';
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
            tableauPoint = [
                {x: 2, y: 1, z: 0},
                {x: 3, y: 2, z: 0},
                {x: 4.5, y: 1.5, z: 0},
                {x: 3, y: 0, z: 0},
                {x: 5, y: -0.75, z: 0},
                {x: 3.5, y: -2, z: 0},
                {x: 2, y: -1, z: 0},
                {x: -2, y: -1, z: 0},
                {x: -3, y: -2, z: 0},
                {x: -4.5, y: -1.5, z: 0},
                {x: -3, y: 0, z: 0},
                {x: -5, y: 1, z: 0},
                {x: -3.5, y: 2, z: 0},
                {x: -2, y: 1, z: 0},
                {x: 2, y: 1, z: 0}
            ];
            break;

        case 'courbe2':
            tableauPoint = [
                {x: 0, y: 0, z: 0},
                {x: 1, y: 0, z: 0},
                {x: 0, y: 1, z: 0},
                {x: 1, y: 1, z: 0}
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