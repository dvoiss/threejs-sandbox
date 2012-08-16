/**
 * Addition to remove a folder from dat.gui
 * (currently dat.gui doesn't have functionality for this)
 */
function removeFolder(gui, name) {
    gui.__folders[name].close();
    gui.__ul.removeChild(gui.__folders[name].domElement.parentNode);
    gui.__folders[name] = undefined;
    gui.onResize();
}

/**
 * create the geometry folder,
 * called on initialization or when needing to recreate it
 */
function createGeometryFolder() {
    var folder = gui.addFolder( CONSTANTS.GEOMETRY_PROPERTIES );
    folder.open();

    var properties = geometries[ guiProperties.model ];
    for (var property in properties) {
        var geometryController;
        var condition = property == 'detail' && (guiProperties.model == CONSTANTS.ICOSAHEDRON || 
            guiProperties.model == CONSTANTS.OCTAHEDRON || guiProperties.model == CONSTANTS.TETRAHEDRON);
        if ( condition ) {
            geometryController = folder.add( properties, property).min(0).max(5).step(1);
        } else {
            geometryController = folder.add( properties, property );
        }
        geometryController.onChange(function(value) {
            createMesh( guiProperties.model );
        });
    }
}

/**
 * create the geometry folder,
 * called on initialization or when needing to recreate it
 */
function createShaderFolder() {
    var folder = gui.addFolder( CONSTANTS.SHADER_PROPERTIES );
    folder.open();

    folder.addColor(guiProperties, 'colorOne').name("color one");
    folder.addColor(guiProperties, 'colorTwo').name("color two");

    if ( guiProperties.shader != CONSTANTS.CHECKER ) {
        folder.add(guiProperties, 'width', 0, 1).listen();
        folder.add(guiProperties, 'animateWidth').name("animate width");
    }

    folder.add(guiProperties, 'frequency', 0, 50).listen();
    folder.add(guiProperties, 'animateFrequency').name("animate frequency");
    folder.add(guiProperties, 'coordinates').name("use model coordinates");
    folder.add(guiProperties, 'noise')

    if ( guiProperties.shader == CONSTANTS.STRIPE ) {
        folder.add(guiProperties, 'vertical');
        folder.add(guiProperties, 'antialias', 0, 1);
    }
}

/**
 * Sets the fragment shader according to type (fShader is global)
 */
function setFragmentShader( type ) {
    if ( type == CONSTANTS.STRIPE )
        fShader = $('#shader-fs-stripes');
    else if ( type == CONSTANTS.BRICK )
        fShader = $('#shader-fs-bricks');
    else
        fShader = $('#shader-fs-checkers');
}

/**
 * create a material of the given type from the properties in the materials object in properties.js
 */
function createMaterial() {
    material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader:   vShader.text(),
        fragmentShader: fShader.text()
    });
}

/**
 * Update the uniforms based on the values in guiProperties
 */
function updateUniforms() {
    material.uniforms.useModelCoordinates.value    = guiProperties.coordinates ? 1 : 0;
    material.uniforms.noise.value       = guiProperties.noise ? 1 : 0;
    material.uniforms.vertical.value    = guiProperties.vertical ? 0 : 1;
    material.uniforms.width.value       = guiProperties.width;
    material.uniforms.antialias.value   = guiProperties.antialias;

    // checker problems
    if ( guiProperties.coordinates && guiProperties.shader == CONSTANTS.CHECKER )
        material.uniforms.frequency.value   = Math.round( guiProperties.frequency );
    else
        material.uniforms.frequency.value   = guiProperties.frequency;

    material.uniforms.colorOne.value    = guiProperties.colorOne.map( function( value ) { return value / 255; });
    material.uniforms.colorTwo.value    = guiProperties.colorTwo.map( function( value ) { return value / 255; });
}

/**
 * create a mesh of the given type from the properties in the geometries object in properties.js
 */
function createMesh( type ) {
    var geometry;
    var properties = geometries[type];

    switch( type ) {
        case CONSTANTS.CUBE:
            geometry = new THREE.CubeGeometry(  properties.width, 
                                                properties.height, 
                                                properties.depth, 
                                                properties.segmentsWidth, 
                                                properties.segmentsHeights, 
                                                properties.segmentsDepth );
            break;
        case CONSTANTS.CYLINDER:
            geometry = new THREE.CylinderGeometry(  properties.radiusTop, 
                                                    properties.radiusBottom, 
                                                    properties.height, 
                                                    properties.segmentsRadius, 
                                                    properties.segmentsHeight, 
                                                    properties.openEnded );
            break;
        case CONSTANTS.ICOSAHEDRON:
            geometry = new THREE.IcosahedronGeometry(   properties.radius, 
                                                        properties.detail );
            break;
        case CONSTANTS.OCTAHEDRON:
            geometry = new THREE.OctahedronGeometry(    properties.radius, 
                                                        properties.detail );
            break;
        case CONSTANTS.PLANE:
            geometry = new THREE.PlaneGeometry( properties.width, 
                                                properties.depth,
                                                properties.segmentsWidth, 
                                                properties.segmentsDepth );
            break;
        case CONSTANTS.SPHERE:
            geometry = new THREE.SphereGeometry(    properties.radius, 
                                                    properties.segmentsWidth, 
                                                    properties.segmentsHeight, 
                                                    properties.phiStart, 
                                                    properties.phiLength, 
                                                    properties.thetaStart, 
                                                    properties.thetaLength );
            break;
        case CONSTANTS.TETRAHEDRON:
            geometry = new THREE.TetrahedronGeometry(   properties.radius, 
                                                        properties.detail );
            break;
        case CONSTANTS.TORUS:
            geometry = new THREE.TorusGeometry( properties.radius,
                                                properties.tube, 
                                                properties.segmentsR, 
                                                properties.segmentsT, 
                                                properties.arc );
            break;
        case CONSTANTS.TORUS_KNOT:
            geometry = new THREE.TorusKnotGeometry( properties.radius,
                                                    properties.tube, 
                                                    properties.segmentsR, 
                                                    properties.segmentsT, 
                                                    properties.p, 
                                                    properties.q,
                                                    properties.heightScale );
            break;
    }

    scene.remove(mesh);
    mesh = new THREE.Mesh( geometry, material );
    scene.add(mesh);
}

/**
 * Build the dat.gui menu:
 */
function buildDatGui() {
    // dat.gui:
    guiProperties = new GUIProperties();
    gui = new dat.GUI();
    gui.width += 150;

    // assemble geometry types to build the geometry drop-down
    var geometryTypes = [];
    for (var type in geometries)
        geometryTypes.push( type );

    var generalFolder = gui.addFolder( CONSTANTS.GENERAL_PROPERTIES );
    var modelController = generalFolder.add(guiProperties, 'model', geometryTypes);
    modelController.onChange(function( type ) {
        // remove mesh, create new and add to scene
        createMesh( type );

        // re-build geometry folder with new properties
        removeFolder( gui, CONSTANTS.GEOMETRY_PROPERTIES );
        createGeometryFolder();
    });

    // assemble shader types to build the shader drop-down
    var shaderTypes = [ CONSTANTS.STRIPE, CONSTANTS.CHECKER, CONSTANTS.BRICK ];
    var shaderController = generalFolder.add(guiProperties, 'shader', shaderTypes);
    shaderController.onChange(function( type ) {
        // set the new material (global):
        setFragmentShader( type )
        createMaterial( type );

        // remove mesh, create new and add to scene
        createMesh( guiProperties.model );

        // re-build geometry folder with new properties
        removeFolder( gui, CONSTANTS.SHADER_PROPERTIES );
        createShaderFolder();

        removeFolder( gui, CONSTANTS.GEOMETRY_PROPERTIES );
        createGeometryFolder();
    });

    var meshFolder = gui.addFolder( CONSTANTS.MESH_PROPERTIES );
        meshFolder.add(guiProperties, 'scaleX', 0, 100).listen();
        meshFolder.add(guiProperties, 'scaleY', 0, 100).listen();
        meshFolder.add(guiProperties, 'scaleZ', 0, 100).listen();
    var scaleController = meshFolder.add(guiProperties, 'scale', 0, 100);
    scaleController.onChange(function(value) {
        guiProperties.scaleX = guiProperties.scaleY = guiProperties.scaleZ = value;
    });

    generalFolder.open();
    meshFolder.open();

    createShaderFolder();
    createGeometryFolder();
}