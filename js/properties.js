// "constants" to be used in program.js and elsewhere
var CONSTANTS = {
    // shader types:
    STRIPE:  "Stripe",
    CHECKER: "Checker",
    BRICK:   "Brick",

    // model types:
    CUBE:           "Cube", 
    CYLINDER:       "Cylinder",
    ICOSAHEDRON:    "Icosahedron",
    OCTAHEDRON:     "Octahedron",
    PLANE:          "Plane",
    SPHERE:         "Sphere",
    TETRAHEDRON:    "Tetrahedron",
    TORUS:          "Torus",
    TORUS_KNOT:     "Torus Knot",

    // OTHER:
    SHADER_PROPERTIES:      "Shader Properties",
    GEOMETRY_PROPERTIES:    "Geometry Properties",
    GENERAL_PROPERTIES:     "General Properties",
    MESH_PROPERTIES:        "Mesh Properties"
};

var GUIProperties = function() {
    // shader properties:
    this.shader             = CONSTANTS.STRIPE;
    this.colorOne           = [ 255, 255, 255 ];
    this.colorTwo           = [ 0, 0, 0 ];
    this.antialias          = 0.00;
    this.frequency          = 15.0;
    this.width              = 0.5;
    this.vertical           = false;
    this.coordinates        = true;
    this.noise              = false;
    this.animateWidth       = false;
    this.animateFrequency   = false;

    // mesh properties:
    this.model          = CONSTANTS.CUBE;
    this.scale          = 1;
    this.scaleX         = 1;
    this.scaleY         = 1;
    this.scaleZ         = 1;
};

var geometries = {};
geometries[ CONSTANTS.CUBE ]          = { width: 500, height: 500, depth: 500, segmentsWidth: 1, segmentsHeights: 1, segmentsDepth: 1 };
geometries[ CONSTANTS.CYLINDER ]      = { radiusTop: 200, radiusBottom: 200, height: 400, segmentsRadius: 8, segmentsHeight: 1, openEnded: false };
geometries[ CONSTANTS.ICOSAHEDRON ]   = { radius: 200, detail: 2 };
geometries[ CONSTANTS.OCTAHEDRON ]    = { radius: 200, detail: 2 };
geometries[ CONSTANTS.PLANE ]         = { width: 400, depth: 400, segmentsWidth: 1, segmentsDepth: 1 };
geometries[ CONSTANTS.SPHERE ]        = { radius: 500, segmentsWidth: 30, segmentsHeight: 30, phiStart: 0, phiLength: Math.PI * 2, thetaStart: 0, thetaLength: Math.PI };
geometries[ CONSTANTS.TETRAHEDRON ]   = { radius: 200, detail: 2 };
geometries[ CONSTANTS.TORUS ]         = { radius: 500, tube: 200, segmentsR: 40, segmentsT: 50, arc: Math.PI * 2 };
geometries[ CONSTANTS.TORUS_KNOT ]    = { radius: 500, tube: 150, segmentsR: 90, segmentsT: 90, p: 2, q: 3, heightScale: 1 };