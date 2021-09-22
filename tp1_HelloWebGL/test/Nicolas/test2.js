function main() {
    // const canvas = document.querySelector("#canvaWebGl");
    // // Initialisation du contexte WebGL
    // const gl = canvas.getContext("webgl");
    //
    // // Continuer seulement si WebGL est disponible et fonctionnel
    // if (!gl) {
    //     alert("Impossible d'initialiser WebGL. Votre navigateur ou votre machine peut ne pas le supporter.");
    //     return;
    // }
    //
    // // Définir la couleur d'effacement comme étant le noir, complètement opaque
    // // gl.clearColor(255.0, 255.0, 255.0, 1.0);
    // gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // // Effacer le tampon de couleur avec la couleur d'effacement spécifiée
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //
    // gl.viewport(0, 0, canvas.width, canvas.height);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
    camera.position.set( 0, 0, 100 );
    camera.lookAt( 0, 0, 0 );

    const scene = new THREE.Scene();

    const material = new THREE.PointsMaterial( {
        color: 0x0000ff,
        size: 0.04
    } );

    const points = addPoint();

    const geometry = new THREE.BufferGeometry().setFromPoints( points );

    const line = new THREE.Points( geometry, material );

    camera.position.z = 5;
    scene.add( line );
    renderer.render( scene, camera );
}

function addPoint() {
    const points = [];
    let x, y;

    for (let i = 0; i < 2 * Math.PI; i+=0.001) {
        x = 2 * Math.cos(i);
        y = 2 * Math.sin(i);
        // x = 2 * Math.pow(Math.sin(i), 3);
        // y = 2 * Math.cos(i) - Math.pow(Math.cos(i), 4);
        points.push( new THREE.Vector3( x, y, 0 ) );
    }

    return points;
}

main();