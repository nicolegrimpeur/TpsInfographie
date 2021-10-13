function main(form) {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth * 0.7, window.innerHeight);

    // permet de supprimer le canva s'il existe déjà pour l'actualiser
    if (document.querySelector('canvas') !== null) document.querySelector('canvas').remove();
    document.getElementsByClassName('masthead')[0].appendChild(renderer.domElement);

    // on créé la caméra de la taille de la fenêtre
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth * 0.7 / window.innerHeight, 1, 500);
    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, 0);

    // à faire, permettre à l'utilisateur de gérer le dézoom
    camera.position.z = form.dezoom.value;

    const scene = new THREE.Scene();

    // couleur et taille de chaque point
    const material = new THREE.PointsMaterial({
        color: 0xb1b1b1,
        size: 0.1
    });

    const materialLigne = new THREE.LineBasicMaterial({
        color: 0xb1b1b1
    });

    // on ajoute tous les points
    const pointsControle = addPointsControle();
    const pointsBezier = addPointsBezier(pointsControle);

    // créé un buffer de points à partir du tableau de points
    const geometryControle = new THREE.BufferGeometry().setFromPoints(pointsControle);
    const geometryBezier = new THREE.BufferGeometry().setFromPoints(pointsBezier);

    // enregistre tous les points
    const formeControle = new THREE.Points(geometryControle, material);
    const formeLigne = new THREE.Line(geometryControle, materialLigne);
    const formeBezier = new THREE.Points(geometryBezier, material);

    // affiche tous les points
    scene.add(formeControle);
    scene.add(formeLigne);
    scene.add(formeBezier);
    renderer.render(scene, camera);
}

// retourne un tableau de points de controle
function addPointsControle() {
    const points = [];

    let el, elSuivant;
    for (let i = 0; i < form.length; i += 2) {
        el = form[i];
        elSuivant = form[i + 1];
        if (el.name !== 'dezoom')
            if (el.value !== '' && elSuivant.value !== '')
                points.push(new THREE.Vector3(parseInt(el.value), parseInt(elSuivant.value), 0))
    }

    return points;
}

// retourne le tableau avec les points de la courbe de Bézier
function addPointsBezier(pointsControle) {
    const points = [];

    let x, y, degre = pointsControle.length - 1;

    for (let t = 0; t < 1; t += 0.001) {
        x = 0; y = 0;
        for (let i = 0; i < pointsControle.length; i++) {
            x += pointsControle[i].x * binomial(degre, i) * Math.pow(1 - t, degre - i) * Math.pow(t, i);
            y += pointsControle[i].y * binomial(degre, i) * Math.pow(1 - t, degre - i) * Math.pow(t, i);
        }

        points.push(new THREE.Vector3(x, y, 0))
    }

    return points;
}

function binomial(n, k) {
    if ((typeof n !== 'number') || (typeof k !== 'number'))
        return false;
    let coeff = 1;
    for (let x = n - k + 1; x <= n; x++) coeff *= x;
    for (x = 1; x <= k; x++) coeff /= x;
    return coeff;
}

// permet d'ajouter tous les points à partir du formulaire
function addPoint(form) {
    const points = [];
    let x, y;

    // en allant du min vers le max avec un pas de precision
    for (let i = parseInt(form.min.value) + parseInt(form.minPi.value) * Math.PI; i < parseInt(form.max.value) + parseInt(form.maxPi.value) * Math.PI; i += parseFloat(form.precision.value)) {
        // coordonnées du point en fonction du formulaire
        x = parseInt(form.xCte1.value) * Math.pow(manageSelect(form.x1.value, i), parseInt(form.xPuissance1.value)) +
            parseInt(form.xCte2.value) * Math.pow(manageSelect(form.x2.value, i), parseInt(form.xPuissance2.value)) +
            parseInt(form.xCte3.value) * Math.pow(manageSelect(form.x3.value, i), parseInt(form.xPuissance3.value)) +
            parseInt(form.xCte4.value) * Math.pow(manageSelect(form.x4.value, i), parseInt(form.xPuissance4.value));
        y = parseInt(form.yCte1.value) * Math.pow(manageSelect(form.y1.value, i), parseInt(form.yPuissance1.value)) +
            parseInt(form.yCte2.value) * Math.pow(manageSelect(form.y2.value, i), parseInt(form.yPuissance2.value)) +
            parseInt(form.yCte3.value) * Math.pow(manageSelect(form.y3.value, i), parseInt(form.yPuissance3.value)) +
            parseInt(form.yCte4.value) * Math.pow(manageSelect(form.y4.value, i), parseInt(form.yPuissance4.value));
        // x = 2 * Math.cos(i); // pour le cercle
        // y = 2 * Math.sin(i);
        // x = 2 * Math.pow(Math.sin(i), 3); // pour le coeur
        // y = 2 * Math.cos(i) - Math.pow(Math.cos(i), 4);

        // s'il n'y a pas d'erreur dans le point, on l'ajoute à la liste de points
        if (!isNaN(x) && !isNaN(y)) points.push(new THREE.Vector3(x, y, 0));
    }

    return points;
}
