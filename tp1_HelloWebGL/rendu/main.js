function initSelect() {
    // on récupère tous les selects de la page
    const selects = document.querySelectorAll('select');

    // toutes les possibilités de fonction possible implémenté
    const possibilites = [
        {code: '', affichage: ''},
        {code: 'cos', affichage: 'cos(t)'},
        {code: 'sin', affichage: 'sin(t)'},
        {code: 'pi', affichage: 'pi'},
        {code: 't', affichage: 't'},
        {code: 'racine', affichage: 'racine carré'}];

    let option;
    // on parcours tous les selects
    for (const select of selects) {
        // si le select n'est pas le select des fonctions préprogrammés
        // alors on ajoute toutes les possibilités au select
        if (select.id !== 'preload') for (const possibilite of possibilites) {
            option = document.createElement('option');
            option.setAttribute('value', possibilite.code);
            if (possibilite.code === 'cos') option.setAttribute('selected', '');
            option.textContent = possibilite.affichage;
            select.appendChild(option);
        }
    }
}

function main(form) {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight - window.innerHeight * 16 / 100);

    // permet de supprimer le canva s'il existe déjà pour l'actualiser
    if (document.querySelector('canvas') !== null) document.querySelector('canvas').remove();
    document.body.appendChild(renderer.domElement);

    // on créé la caméra de la taille de la fenêtre moins
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / (window.innerHeight - window.innerHeight * 16 / 100), 1, 500);
    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, 0);

    // à faire, permettre à l'utilisateur de gérer le dézoom
    camera.position.z = 7;

    const scene = new THREE.Scene();

    // couleur et taille de chaque point
    const material = new THREE.PointsMaterial({
        color: 0x0000ff,
        size: 0.04
    });

    // on ajoute tous les points
    const points = addPoint(form);

    // créé un buffer de points à partir du tableau de points
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // enregistre tous les points
    const forme = new THREE.Points(geometry, material);

    // affiche tous les points
    scene.add(forme);
    renderer.render(scene, camera);
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

// gère le retour du select pour retourner la valeur nécessaire au calcul de la coordonnée
function manageSelect(value, i) {
    switch (value) {
        case 'cos':
            return Math.cos(i);
        case 'sin':
            return Math.sin(i);
        case 'pi':
            return Math.PI;
        case 'i':
            return i;
        case 'racine':
            return Math.sqrt(i);
        default:
            return 0;
    }
}


// gère les figures pre enregistrer et met les bonnes valeurs dans les cases html
function managePreSelect(form) {

    let selection = form.formepreload.value;
    switch (selection) {
        case 'coeur':
            form.xCte1.value = '1';
            form.x1.value = 'sin';
            form.xPuissance1.value = '3';
            form.xCte2.value = '0';
            form.x2.value = 't';
            form.xPuissance2.value = '0';
            form.xCte3.value = '0';
            form.x3.value = 't';
            form.xPuissance3.value = '0';
            form.xCte4.value = '0';
            form.x4.value = 't';
            form.xPuissance4.value = '0';

            form.yCte1.value = '1';
            form.y1.value = 'cos';
            form.yPuissance1.value = '1';
            form.yCte2.value = '-1';
            form.y2.value = 'cos';
            form.yPuissance2.value = '4';
            form.yCte3.value = '0';
            form.y3.value = 't';
            form.yPuissance3.value = '0';
            form.yCte4.value = '0';
            form.y4.value = 't';
            form.yPuissance4.value = '0';

            form.min.value = '0';
            form.minPi.value = '0';
            form.max.value = '0';
            form.maxPi.value = '2';
            form.precision.value = '0.001';
            return 0;

        case 'rond':
            form.xCte1.value = '2';
            form.x1.value = 'cos';
            form.xPuissance1.value = '1';
            form.xCte2.value = '0';
            form.x2.value = 't';
            form.xPuissance2.value = '0';
            form.xCte3.value = '0';
            form.x3.value = 't';
            form.xPuissance3.value = '0';
            form.xCte4.value = '0';
            form.x4.value = 't';
            form.xPuissance4.value = '0';

            form.yCte1.value = '2';
            form.y1.value = 'sin';
            form.yPuissance1.value = '1';
            form.yCte2.value = '0';
            form.y2.value = 't';
            form.yPuissance2.value = '0';
            form.yCte3.value = '0';
            form.y3.value = 't';
            form.yPuissance3.value = '0';
            form.yCte4.value = '0';
            form.y4.value = 't';
            form.yPuissance4.value = '0';

            form.min.value = '0';
            form.minPi.value = '0';
            form.max.value = '0';
            form.maxPi.value = '2';
            form.precision.value = '0.001';
            return 0;

        case 'astroïde':
            form.xCte1.value = '1';
            form.x1.value = 'cos';
            form.xPuissance1.value = '3';
            form.xCte2.value = '0';
            form.x2.value = 't';
            form.xPuissance2.value = '0';
            form.xCte3.value = '0';
            form.x3.value = 't';
            form.xPuissance3.value = '0';
            form.xCte4.value = '0';
            form.x4.value = 't';
            form.xPuissance4.value = '0';

            form.yCte1.value = '1';
            form.y1.value = 'sin';
            form.yPuissance1.value = '3';
            form.yCte2.value = '0';
            form.y2.value = 't';
            form.yPuissance2.value = '0';
            form.yCte3.value = '0';
            form.y3.value = 't';
            form.yPuissance3.value = '0';
            form.yCte4.value = '0';
            form.y4.value = 't';
            form.yPuissance4.value = '0';

            form.min.value = '0';
            form.minPi.value = '0';
            form.max.value = '0';
            form.maxPi.value = '2';
            form.precision.value = '0.001';
            return 0;

        default:
            return 0;
    }
}

