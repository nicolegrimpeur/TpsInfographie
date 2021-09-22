let vertexShaderSource =
    " attribute vec3 vertexPos;\n" +
    " uniform mat4 modelViewMatrix;\n" +
    " uniform mat4 projectionMatrix;\n" +
    " void main(void) {\n" +
    " // Return the transformed and projected vertex value\n" +
    " gl_Position = projectionMatrix * modelViewMatrix * \n" +
    " vec4(vertexPos, 1.0);\n" +
    " }\n";

let fragmentShaderSource =
    " void main(void) {\n" +
    " // Return the pixel color: always output white\n" +
    " gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n" +
    "}\n";


let shaderProgram;
let shaderVertexPositionAttribute;
let shaderProjectionMatrixUniform;
let shaderModelViewMatrixUniform;

function createShader(gl, str, type) {
    let shader;
    if (type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == "vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShader(gl) {
    // load and compile the fragment and vertex shader
    let fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
    let vertexShader = createShader(gl, vertexShaderSource, "vertex");

    // link them together into a new program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
}


function main() {
    const canvas = document.querySelector("#canvaWebGl");
    // Initialisation du contexte WebGL
    const gl = canvas.getContext("webgl");

    // Continuer seulement si WebGL est disponible et fonctionnel
    if (!gl) {
        alert("Impossible d'initialiser WebGL. Votre navigateur ou votre machine peut ne pas le supporter.");
        return;
    }

    // Définir la couleur d'effacement comme étant le noir, complètement opaque
    // gl.clearColor(255.0, 255.0, 255.0, 1.0);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Effacer le tampon de couleur avec la couleur d'effacement spécifiée
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.viewport(0, 0, canvas.width, canvas.height);

    // ajout des letiables
    let equaxt = "2*Math.cos(t)"; // Equation 1 letiable t
    let equayt = "2*Math.sin(t)"; // Equation 2 letiable t

    initShader(gl);

    let modelViewMatrix = new Float32Array(
        [1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, -5, 1]);

    let projectionMatrix = new Float32Array(
        [1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, -1,
            0, 0, 0, 0]);

    // creation d'un buffer
    let vertexBuffer = gl.createBuffer();
    // definition en tant que buffer courant
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // on definit un tableau de points
    let vertices = new Float32Array([ 1,1,1,-1,-1,-1 ]);
    // on met ces valeurs dans le buffer courant
    gl.bufferData(gl.ARRAY_BUFFER, vertices,
        gl.STATIC_DRAW);

    // on place le buffer a dessiner dans le buffer courant
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // set the shader to use
    gl.useProgram(shaderProgram);

    // connect up the shader parameters: vertex position and projection/model matrices
    gl.vertexAttribPointer(shaderVertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
    gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, modelViewMatrix);

    gl.drawArrays(gl.LINES, 0, 2);
}

main();