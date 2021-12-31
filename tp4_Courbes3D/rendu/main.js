let tableauPoint = []; // tableau contenant les points de controle
let formeControle, formeLigne, formeBSpline; // formes dans lesquelles seront stockés les différentes parties de la clé à molette

///////// initialisation variables three js
// on crée la caméra de la taille de la fenêtre
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);

// création de la zone d'affichage
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
// on ajoute le canva
document.getElementsByClassName('masthead')[0].appendChild(renderer.domElement);

// création de la variable permettant la modification de la vision
let cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
cameraControls.target = new THREE.Vector3(0,0,0);

// création de la scène
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdddddd);

// modification de la scène en fonction du déplacement sur la page
cameraControls.addEventListener('change', function() {
    renderer.render(scene, camera);
});

// appel de la texture (non utilisé)
const texture = new THREE.TextureLoader().load( './assets/texture.jpg' );
const materialTexture = new THREE.MeshBasicMaterial( { map: texture } );

// création de la lumière
const hlight = new THREE.AmbientLight (0x404040, 9);
scene.add(hlight);

// echelle de la clé par rapport à la map
const echelleCle = 0.02;

// import de la map
const mine = new THREE.GLTFLoader();
mine.load('./scene/scene.gltf', function ( gltf ) {
    // modification de la position de la map pour qu'elle s'affiche bien sous la clé
    let mineOptions = gltf.scene.children[0];
    mineOptions.position.set(0, -3.68, 0);
    scene.add( gltf.scene );
}, undefined, function ( error ) {
    console.error( error );
} );


// permet d'initialiser la zone de dessin / supprimer les points
function initCanva() {
    tableauPoint = [[
        {x: 0, y: 1, z: 0},
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

    // ajout d'une deuxième dimension
    const tmpTab = JSON.parse(JSON.stringify(tableauPoint[0]));
    for (let point of tmpTab)
        point.z = 1;
    tableauPoint.push(tmpTab);


    main();
}


// affiche les points et la courbe de béziers
function main() {
    if (formeControle) scene.remove(formeControle);
    if (formeLigne) scene.remove(formeLigne);
    if (formeBSpline) scene.remove(formeBSpline);

    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, 0);

    // couleur et taille de chaque point
    const material = new THREE.PointsMaterial({
        color: 0xb1b1b1,
        size: 0.05
    });
    const materialBSplineFaces = new THREE.PointsMaterial({
        color: 0x7d7c7f,
        size: 0.01
    });
    const materialBSplineProfondeur = new THREE.PointsMaterial({
        color: 0x535355,
        size: 0.01
    });

    const materialLigne = new THREE.LineBasicMaterial({
        color: 0xb1b1b1
    });

    // degré de la courbe
    let degre = 2;

    // vecteur noeud de la courbe
    let vecteurNoeud = [];

    // poids de chaques points
    let poids = [0.5, 1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5, 1];

    // on récupère les points tous les points
    const pointsBSpline = recupPoints(degre, vecteurNoeud, poids);
    let geometryControle, geometryBSpline, vecteurControle;

    // pour chaque face
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


        // on créé les buffers des points de controle
        geometryControle = new THREE.BufferGeometry().setFromPoints(vecteurControle);
        formeControle = new THREE.Points(geometryControle, material);
        formeLigne = new THREE.Line(geometryControle, materialLigne);

        // affiche les points de contrôle
        // scene.add(formeControle);
        // affiche le polygone de contrôle
        // scene.add(formeLigne);

        // ajoute la courbe BSpline sous forme de lignes vers l'origine
        geometryBSpline = new THREE.BufferGeometry().setFromPoints(pointsBSpline[i]);
        formeBSpline = new THREE.Line(geometryBSpline, materialBSplineFaces);
        scene.add(formeBSpline);
    }

    if (pointsBSpline[1] !== undefined) {
        let tmpPoints = []; // liste de point pour le contour, tracé sous forme de lignes
        for (let i = 0; i < pointsBSpline[0].length; i++) {
            if (!(pointsBSpline[0][i].x === 0 && pointsBSpline[0][i].y === 0 && pointsBSpline[0][i].z === 0)) {
                tmpPoints.push({x: pointsBSpline[0][i].x, y: pointsBSpline[0][i].y, z: pointsBSpline[0][i].z});
                tmpPoints.push({x: pointsBSpline[1][i].x, y: pointsBSpline[1][i].y, z: pointsBSpline[1][i].z});
            }
        }
        geometryBSpline = new THREE.BufferGeometry().setFromPoints(tmpPoints);
        formeBSpline = new THREE.Line(geometryBSpline, materialBSplineProfondeur);
        scene.add(formeBSpline);
    }


    // centre le canva sur la figure en cours
    autoZoom(vecteurControle);

    renderer.render(scene, camera);
}

// récupère et convertit les points pour récupérer la courbe de Béziers
function recupPoints(degre, noeuds, poids) {
    // si l'on a pas de points, pas la peine de tout faire
    if (tableauPoint.length === 0) return [];


    let tmpTableauPoint;
    let tmpPointsBSplines = [];
    let tmpPoint;
    for (let j = 0; j < tableauPoint.length; j++) {
        tmpTableauPoint = [];
        // conversion du tableau de vecteur en tableau de points
        if (tableauPoint[j][0].x !== undefined)
            for (let i = 0; i < tableauPoint[j].length; i++)
                tmpTableauPoint.push([tableauPoint[j][i].x, tableauPoint[j][i].y, tableauPoint[j][i].z]);
        else tmpTableauPoint = tableauPoint[j];

        // récupération des points de la courbe
        tmpPointsBSplines.push([]);
        // for (let t = 0; t < 1; t += 0.0001) {
        for (let t = 0; t < 1; t += 0.001) {
            tmpPoint = deBoorReccur(t, degre, tmpTableauPoint, noeuds, poids);

            // ajout du point de la courbe
            tmpPointsBSplines[j].push(new THREE.Vector3(tmpPoint[0] * echelleCle, tmpPoint[1] * echelleCle, tmpPoint[2] * echelleCle));

            // ajout d'un point à l'origine -> permet de tracer la surface à l'aide d'une ligne vers l'origine
            tmpPointsBSplines[j].push(new THREE.Vector3(0, 0, tmpPoint[2] * echelleCle));
        }
    }

    return tmpPointsBSplines;
}

// algorithme de De Boor
function deBoorReccur(t, degre, points, noeuds, poids, result) {
    let n = points.length;    // nombre de points
    let d = points[0].length; // dimension des points (3d ou 2d)

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