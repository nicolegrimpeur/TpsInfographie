const camera = new THREE.PerspectiveCamera(45, window.innerWidth * 0.7 / window.innerHeight*0.9, 1, 500);
function main(form) {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth * 0.7, window.innerHeight*0.9);

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
    const pointsBezier = addPointsBezier(tableauPoint);

    // créé un buffer de points à partir du tableau de points
    const geometryControle = new THREE.BufferGeometry().setFromPoints(tableauPoint);
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
        autoZoom(tableauPoint);
    }
    renderer.render(scene, camera);
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
    let Xmoy=(Xmax-Xmin)/2;
    let Ymoy=(Ymax-Ymin)/2;
    if(Xmoy>Ymoy){
        let dezoom = Xmax-Xmin;
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

let tableauPoint = [];

function ajout(form) {
    if (form.pointFigure.value === "new") {
        tableauPoint.push(new THREE.Vector3(parseInt(form.xPointAjout.value), parseInt(form.yPointAjout.value), 0))


        let div = document.getElementsByName('pointFigure');
        let option = document.createElement('option');
        div[0].appendChild(option);
        option.setAttribute('value', tableauPoint.length);
        option.textContent = 'Point ' + tableauPoint.length;

        form.xPointAjout.value = '';
        form.yPointAjout.value = '';
    } else {
        tableauPoint[form.pointFigure.value - 1] = new THREE.Vector3(parseInt(form.xPointAjout.value), parseInt(form.yPointAjout.value), 0)
    }
    main(form);
}

function afficherPoint(form){
    if (form.pointFigure.value !== "new"){
        form.xPointAjout.value = tableauPoint[form.pointFigure.value - 1].x;
        form.yPointAjout.value = tableauPoint[form.pointFigure.value - 1].y;
    }
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