if ( !window.requestAnimationFrame ) {
    window.requestAnimationFrame = ( function() {
        return window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
            window.setTimeout( callback, 1000 / 60 );
        };
    } )();
}

// globals:
var scene, material, mesh, uniforms;
var fShader, vShader;
var guiProperties, gui;

$(document).ready(function() {
    var stats;
    var controls, renderer, camera;

    init();
    animate();

    function init() {
        // init Stats.js
        stats = new Stats();
        stats.setMode(0); // 0: fps, 1: ms
        // Align top-left
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        document.body.appendChild( stats.domElement );

        // build dat.gui
        buildDatGui();

        // initialize THREE.js
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.x = 1000;
        camera.position.z = 1000;
        camera.position.y = 1000;
        scene.add( camera );

        // build uniforms 
        // not all of these uniforms are used by the different shaders,
        // it may be worthwhile if more shaders & uniforms are added to separate them out
        uniforms = {
            // vertex shader:
            vertical:               { type: "i", value: guiProperties.vertical ? 0 : 1 },
            noise:                  { type: "i", value: guiProperties.noise ? 1 : 0 },
            useModelCoordinates:    { type: "i", value: guiProperties.modelCoordinates ? 1 : 0},

            // fragment shader:
            width:          { type: "f", value: guiProperties.width },
            antialias:      { type: "f", value: guiProperties.antialias  },
            frequency:      { type: "f", value: guiProperties.frequency },
            colorOne:       { type: "fv", value: guiProperties.colorOne },
            colorTwo:       { type: "fv", value: guiProperties.colorTwo }
        };

        vShader = $('#shader-vs');
        setFragmentShader( guiProperties.shader );

        createMaterial();
        createMesh( guiProperties.model );

        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );

        controls = new THREE.OrbitControls( camera, renderer.domElement );

        // currently not using derivatives in shader:
        // if ( renderer.domElement ) {
        //     gl = renderer.domElement.getContext( 'experimental-webgl' );
        //     gl.getExtension( 'OES_standard_derivatives' );
        // }

        window.addEventListener('resize', function() {
          renderer.setSize( window.innerWidth, window.innerHeight );
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
        });
    }

    function animate() {
        requestAnimationFrame( animate );
        render();
        stats.update();
    }

    function render() {
        // update dat.gui, mesh scale, and shader uniforms:

        // animate by using mesh.rotation.y (rotated below)
        var animationFactor = Math.sin(mesh.rotation.y);
        if (guiProperties.animateWidth)
            guiProperties.width = Math.abs( animationFactor );
        if (guiProperties.animateFrequency)
            guiProperties.frequency = Math.abs( animationFactor * 50 );

        mesh.scale.x = guiProperties.scaleX;
        mesh.scale.y = guiProperties.scaleY;
        mesh.scale.z = guiProperties.scaleZ;

        updateUniforms();

        controls.update();

        // rotate model and render:
        mesh.rotation.y += 0.01;
        camera.lookAt(mesh.position);
        renderer.render( scene, camera );
    }
});