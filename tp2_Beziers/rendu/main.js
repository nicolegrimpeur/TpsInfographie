const camera = new THREE.PerspectiveCamera(45, window.innerWidth * 0.7 / window.innerHeight, 1, 500);
function main(form) {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth * 0.7, window.innerHeight);

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
    if(document.getElementById("zoom").checked == true)
    {
        autoZoom(pointsControle);
    }
    renderer.render(scene, camera);
}

// retourne un tableau de points de controle
function addPointsControle() {
    const points = [];

    let el, elSuivant;
    for (let i = 0; i < form.length; i += 2) {
        el = form[i];
        elSuivant = form[i + 1];
        if (el.name !== 'dezoom' && el.name !== 'bonus')
            if (el.value !== '' && elSuivant.value !== '')
                points.push(new THREE.Vector3(parseInt(el.value), parseInt(elSuivant.value), 0));
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

function autoZoom(tabPoint){
    let Xmin=999, Xmax=-999, Ymin=999, Ymax=-999;
    for(let i=0;i<tabPoint.length;i++){
        if(Xmin>tabPoint[i].x){
            Xmin = tabPoint[i].x;
        }
        if(Xmax<tabPoint[i].x){
            Xmax = tabPoint[i].x;
        }
        if(Ymin>tabPoint[i].y){
            Ymin = tabPoint[i].y;
        }
        if(Ymax<tabPoint[i].y) {
            Ymax = tabPoint[i].y;
        }
    }
    console.log(Xmin);
    console.log(Xmax);
    console.log(Ymin);
    console.log(Ymax);
    let Xmoy=(Xmax-Xmin)/2;
    let Ymoy=(Ymax-Ymin)/2;
    if(Xmoy>Ymoy){
        let dezoom = Xmax-Xmin;
        console.log(dezoom);
        camera.position.set(Xmin+Xmoy, Ymin+Ymoy, dezoom);
        camera.lookAt(Xmin+Xmoy,Ymin+Ymoy , dezoom);

    }
    else{
        let dezoom = (Ymax-Ymin)*1.5;
        camera.position.set(Xmin+Xmoy, Ymin+Ymoy, dezoom);
        camera.lookAt(Xmin+Xmoy,Ymin+Ymoy , dezoom);

    }

}

function binomial(n, k) {
    if ((typeof n !== 'number') || (typeof k !== 'number'))
        return false;
    let coeff = 1;
    for (let x = n - k + 1; x <= n; x++) coeff *= x;
    for (x = 1; x <= k; x++) coeff /= x;
    return coeff;
}

// permet d'afficher les courbes de Béziers en préselection dans le bonus
function bonus(form) {
    switch (form.bonus.value) {
        case 'courbe1':
            break;

        case 'courbe2':
            break;

        case 'courbe3':
            break;

        default:
            break;
    }

    // main(form);
}