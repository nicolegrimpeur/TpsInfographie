// const THREE = require(['https://cdn.skypack.dev/pin/three@v0.135.0-pjGUcRG9Xt70OdXl97VF/mode=imports/optimized/three.js']);

const THREE = require(['./three-js/three']);
// const NURBSSurface = require(['./libs/NURBSSurface.js']);


const camera = new THREE.PerspectiveCamera(45, window.innerWidth * 0.6 / window.innerHeight, 0.1, 1000);
// const cameraControls = new THREE.OrbitControls(camera);
let tableauPoint = []; // tableau contenant les points de controle

// permet d'initialiser la zone de dessin / supprimer les points
function initCanva() {
    allPointSelect();
    main();
}


// affiche les points et la courbe de béziers
function main() {
    let form = document.querySelector('form');

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth * 0.6, window.innerHeight);
    renderer.setClearColor(0xEEEEEE);

    let axesHelper = new THREE.AxesHelper(20);

    // permet de supprimer le canva s'il existe déjà pour l'actualiser
    if (document.querySelector('canvas') !== null) document.querySelector('canvas').remove();
    document.getElementsByClassName('masthead')[0].appendChild(renderer.domElement);

    // on créé la caméra de la taille de la fenêtre
    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, 0);

    const cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    // camera.position.x = -60;
    // camera.position.y = 50;
    // camera.position.z = -40;
    // camera.lookAt(new THREE.Vector3(20,0,15));
    // camera.updateProjectionMatrix();
    // cameraControls.target = new THREE.Vector3(20,0,15);

    // à faire, permettre à l'utilisateur de gérer le dézoom
    // camera.position.z = form.dezoom.value;

    const scene = new THREE.Scene();

    // couleur et taille de chaque point
    // const material = new THREE.PointsMaterial({
    //     color: 0xb1b1b1,
    //     size: 0.05
    // });
    // const materialBezier = new THREE.PointsMaterial({
    //     color: 0xb1b1b1,
    //     size: 0.01
    // });
    //
    // const materialLigne = new THREE.LineBasicMaterial({
    //     color: 0xb1b1b1
    // });
    //
    // const materialOrigin = new THREE.LineBasicMaterial({
    //     color: 0xb1b1b1,
    //     linewidth: 1
    // });

    // const texture = new THREE.TextureLoader().load('assets/texture.jpg');

    // immediately use the texture for material creation
    // const materialWithTexture = new THREE.MeshBasicMaterial({color: 0xFF0000});

    // on ajoute tous les points
    // let tmpPointsBezier = [], tmpPointsControles, limite;
    // for (let i = 0; i < tableauPoint.length; i += 2) {
    //     limite = 3;
    //     if (tableauPoint[i + 2] === undefined) limite = 2;
    //     if (tableauPoint[i + 1] === undefined) limite = 1;
    //     tmpPointsControles = tableauPoint.slice().splice(i, limite);
    //     tmpPointsBezier = tmpPointsBezier.concat(addPointsBezier(tmpPointsControles));
    // }
    // const pointsBezier = tmpPointsBezier;
    //
    // const surfaceBeziers = [];
    // console.log(pointsBezier.length);

    // for (let i = 0; i < pointsBezier.length; i++) {
    //     for (let j = 0; j < pointsBezier.length; j++) {
    //         if (i !== j) {
    //             surfaceBeziers.push(pointsBezier[j]);
    //         }
    //     }
    // }
    const tabOrigin = origin();

    // créé un buffer de points à partir du tableau de points
    // const geometryControle = new THREE.BufferGeometry().setFromPoints(tableauPoint);
    // const geometryBezier = new THREE.BufferGeometry().setFromPoints(pointsBezier);
    // const geometrySurfaceBezier = new THREE.BufferGeometry().setFromPoints(surfaceBeziers);
    // const geometryOrigin = new THREE.BufferGeometry().setFromPoints(tabOrigin);

    // enregistre tous les points
    // const formeControle = new THREE.Points(geometryControle, material);
    // const formeLigne = new THREE.Line(geometryControle, materialLigne);
    // const formeBezier = new THREE.Points(geometryBezier, materialBezier)
    // const formeBezierWithTexture = new THREE.Points(geometryBezier, materialWithTexture);
    // const formeOrigin = new THREE.Line(geometryOrigin, materialOrigin);

    // affiche tous les points
    // scene.add(formeControle);
    // scene.add(formeLigne);
    // scene.add(formeBezier);
    // scene.add(formeBezierWithTexture);
    // scene.add(formeOrigin);

    // let bezierSurfaceFaces, bezierSurfaceVertices;
    // [bezierSurfaceVertices, bezierSurfaceFaces] = addSurfaceBezier();
    // let bezierSurfaceGeometry = new THREE.Geometry();
    // bezierSurfaceGeometry.vertices = bezierSurfaceVertices;
    // bezierSurfaceGeometry.faces = bezierSurfaceFaces;
    // bezierSurfaceGeometry.computeFaceNormals();
    // bezierSurfaceGeometry.computeVertexNormals();
    // let bezierSurfaceMaterial = new THREE.MeshLambertMaterial({color: 0x17a6ff, wireframe: false});
    // let bezierSurface = new THREE.Mesh(bezierSurfaceGeometry, bezierSurfaceMaterial);
    // bezierSurface.material.side = THREE.DoubleSide;
    // scene.add(bezierSurface);
    //
    // //affichage des axes
    // // const axesHelper = new THREE.AxesHelper(100);
    //
    // // si l'autozoom est coché
    // if (document.getElementById("zoom").checked === true)
    //     autoZoom(tableauPoint);
    //
    //
    // // scene.add(axisHelper);
    // renderer.render(scene, camera);

    // const controls = new THREE.OrbitControls(camera, renderer.domElement);
    // console.log(controls);

    var nsControlPoints = [
        [
            new THREE.Vector4 ( -150, 0, 150, 1 ),
            new THREE.Vector4 ( 150, 0, 150, 1 ),
            new THREE.Vector4 ( 150, 0, -150, 1 ),
            new THREE.Vector4 ( -150, 0, -150, 1 ),
            new THREE.Vector4 ( -150, 0, 150, 1 )
        ],
        [
            new THREE.Vector4 ( -50, 50, 50, 1 ),
            new THREE.Vector4 ( 50, 50, 50, 1 ),
            new THREE.Vector4 ( 50, 50, -50, 1 ),
            new THREE.Vector4 ( -50, 50, -50, 1 ),
            new THREE.Vector4 ( -50, 50, 50, 1 )
        ],
        [
            new THREE.Vector4 ( -100, -50, 100, 1 ),
            new THREE.Vector4 ( 100, -50, 100, 1 ),
            new THREE.Vector4 ( 100, -50, -100, 1 ),
            new THREE.Vector4 ( -100, -50, -100, 1 ),
            new THREE.Vector4 ( -100, -50, 100, 1 )
        ],
    ];


    var degree1 = 2;
    var degree2 = 3;
    var knots1 = [0, 0, 0, 1, 1, 1];
    var knots2 = [0, 0, 0, 0, 1, 1, 1, 1];
    var nurbsSurface = new NURBSSurface(degree1, degree2, knots1, knots2, nsControlPoints);

    var map = new THREE.TextureLoader().load( 'assets/texture.jpg' );
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.anisotropy = 16;

    let getSurfacePoint = function (u, v) {
        return nurbsSurface.getPoint(u, v);
    };

    var geometry = new THREE.ParametricGeometry( getSurfacePoint, 20, 20 );
    var material = new THREE.MeshLambertMaterial( { map: map, side: THREE.DoubleSide } );
    var object = new THREE.Mesh( geometry, material );
    object.position.set( - 200, 100, 0 );
    object.scale.multiplyScalar( 1 );
    scene.add( object );
}


// retourne le tableau avec les points de la courbe de Bézier
function addPointsBezier(pointsControle) {
    const points = [];

    let x, y, z, compteur = 0, degre = pointsControle.length - 1, limite;

    let precision = 0.01;
    if (pointsControle.length !== 0)
        // for (let compteur = 0; compteur < pointsControle.length; compteur += 1) {
        for (let t = 0; t < 1; t += precision) {
            x = 0;
            y = 0;
            z = 0;

            // limite = 3;
            // if (pointsControle[compteur + 2] === undefined) limite = 2;
            // if (pointsControle[compteur + 1] === undefined) limite = 1;

            // for (let i = compteur; i < compteur + limite; i++) {
            for (let i = 0; i < pointsControle.length; i++) {
                // calcule la coordonnée de ce point en fonction de la formule du polynom de Berstein
                x += pointsControle[i].x * binomial(degre, i) * Math.pow(1 - t, degre - i) * Math.pow(t, i);
                y += pointsControle[i].y * binomial(degre, i) * Math.pow(1 - t, degre - i) * Math.pow(t, i);
                z += pointsControle[i].z * binomial(degre, i) * Math.pow(1 - t, degre - i) * Math.pow(t, i);
            }
            points.push(new THREE.Vector3(x, y, z));
        }

    return points;
}

// retourne le tableau avec les points de la courbe de Bézier
function addSurfaceBezier() {
    if (tableauPoint.length === 0) return [[], []];

    let basicBezierModel = [];  // 4 bezier curves calculated from bezier control points
    let bezier;
    let bezierCurveDivisions = 50;
    // calculating basic bezier model (main 4 bezier curves)
    for (let i = 0; i < tableauPoint.length; i++) {
        bezier = new THREE.CubicBezierCurve3(
            tableauPoint[i][0],
            tableauPoint[i][1],
            tableauPoint[i][2],
            tableauPoint[i][3]
        )
        basicBezierModel.push(bezier.getPoints(bezierCurveDivisions));
    }


    let bezierCurvesVertices = [];

    // calculating full bezier model (50 bezier curves in one direction, each containing 50 vertices)
    for (let i = 0; i <= bezierCurveDivisions; i++) {
        bezier = new THREE.CubicBezierCurve3(
            basicBezierModel[0][i],
            basicBezierModel[1][i],
            basicBezierModel[2][i],
            basicBezierModel[3][i]
        )

        bezierCurvesVertices = bezierCurvesVertices.concat(bezier.getPoints(bezierCurveDivisions));
    }


    // now we've got full bezier model, it's time to create bezier surface and add it to the scene
    let bezierSurfaceVertices = bezierCurvesVertices;
    let bezierSurfaceFaces = [];

    // creating faces from vertices
    let v1, v2, v3;  // vertex indices in bezierSurfaceVertices array
    for (let i = 0; i < bezierCurveDivisions; i++) {
        for (let j = 0; j < bezierCurveDivisions; j++) {
            v1 = i * (bezierCurveDivisions + 1) + j;
            v2 = (i + 1) * (bezierCurveDivisions + 1) + j;
            v3 = i * (bezierCurveDivisions + 1) + (j + 1);
            bezierSurfaceFaces.push(new THREE.Face3(v1, v2, v3));

            v1 = (i + 1) * (bezierCurveDivisions + 1) + j;
            v2 = (i + 1) * (bezierCurveDivisions + 1) + (j + 1);
            v3 = i * (bezierCurveDivisions + 1) + (j + 1);
            bezierSurfaceFaces.push(new THREE.Face3(v1, v2, v3));
        }
    }
    return [bezierSurfaceVertices, bezierSurfaceFaces];
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
            ];

            // ajout d'une deuxième dimension
            // const tmpTab = JSON.parse(JSON.stringify(tableauPoint));
            // for (let point of tmpTab)
            //     point.z = 1;
            // tableauPoint.push({x: 2, y: 1, z: 0.5});
            // tableauPoint = tableauPoint.concat(tmpTab);
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