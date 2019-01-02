//////////////////////////////////////////////////////////////////////////////////
//		Declare global variables
//////////////////////////////////////////////////////////////////////////////////
var camera, normalCamera, scene, normalScene, controls, orbcontrols, renderer, normalRenderer, geometry, material, texture;
var Emblem, EmblemGroup;
var tracker;
var raycaster = new THREE.Raycaster();
var faces;
var objects=[];
var color = '#ff0000';
var arToolkitContext;
var arToolkitSource;
var lightX = 0, lightY = 0, lightClickX = 0, lightClickY = 0;
var mouse = new THREE.Vector3(0,0,-10);
var sphere;

//////////////////////////////////////////////////////////////////////////////////
//		Initialise
//////////////////////////////////////////////////////////////////////////////////
function init() {

  // Set-up AR.js scene
  var video = arToolkitSource;

  // Define red as tracking colour
  tracking.ColorTracker.registerColor('red', function(r, g, b) {
    if (r > 130 && g < 70 && b < 70) {
      return true;
    }
    return false;
  });

  // Define tracker colours
  tracker = new tracking.ColorTracker(['red', 'cyan']);

  // Active tracking from camera
  tracking.track('#video', tracker, { camera: true });

// Initialise AR base scene and rendering preferences

  // Create the AR scene
  scene = new THREE.Scene();

  // Create a normal scene
  normalScene = new THREE.Scene();

  // Create a camera
  camera = new THREE.PerspectiveCamera();
  normalCamera = new THREE.PerspectiveCamera();
  scene.add(camera);
  normalScene.add(normalCamera);

  // normalCamera.position.set( 0, 0, 0 );

  // controls = new THREE.DeviceOrientationControls( normalCamera );
  // orbcontrols = new THREE.OrbitControls( normalCamera );

  normalCamera.position.set( 0, 0, 0 );
  // controls.update();
  // orbcontrols.update();

  // Create a WebGL renderer and add prefernces
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  normalRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

  // Set the size of the renderer to the inner width and inner height of the window
  renderer.setSize( window.innerWidth, window.innerHeight );
  normalRenderer.setSize( window.innerWidth, window.innerHeight );

  // Add in the created DOM element to the body of the document
  document.body.appendChild( normalRenderer.domElement );
  document.body.appendChild( renderer.domElement );




  arToolkitSource = new THREEx.ArToolkitSource({
    sourceType : 'webcam',
  })

  arToolkitSource.init(function onReady(){
    onResize()
  })

  // Listen for mouse location
  //window.addEventListener( 'mousemove', onMouseMove, false );

  // Listen for resize
  window.addEventListener('resize', function(){
    onResize()
  })

  function onResize(){
    arToolkitSource.onResizeElement()
    arToolkitSource.copyElementSizeTo(renderer.domElement)
    arToolkitSource.copyElementSizeTo( normalRenderer.domElement)
    if( arToolkitContext.arController !== null ){
      arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
    }
  }

  // Create atToolkitContext
  arToolkitContext = new THREEx.ArToolkitContext({
    cameraParametersUrl: 'data/camera_para.dat',
    detectionMode: 'mono',
  })

  // Initialize AR scene
  arToolkitContext.init(function onCompleted(){
    // Copy projection matrix to camera
    camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
    normalCamera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
  })

  // Initalise controls for camera
  var markerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {
    type : 'pattern',
    patternUrl : 'data/CircleDash.patt',
    changeMatrixMode: 'cameraTransformMatrix'
  })
  scene.visible = false;

// ARDraw scene  //

  // Add a directional light
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.position.set(1,0.5,1);
  scene.add( directionalLight );
  normalScene.add( directionalLight );

  // Add weak ambient light
  var ambientlight = new THREE.AmbientLight( 0x404040, 3); // soft white light
  scene.add( ambientlight );
  normalScene.add( ambientlight );

  // Emblem model
  EmblemGroup = new THREE.Object3D();
  scene.add(EmblemGroup);
    var materialLoader = new THREE.MTLLoader()
    materialLoader.load('models/Emblem.mtl', function (material) {
      var objLoader = new THREE.OBJLoader()
      objLoader.setMaterials(material)
      objLoader.load(
        'models/Emblem.obj',
        function (Emblem) {
          Emblem.scale.set(0.5,0.5,0.5);
          Emblem.shadow;
          EmblemGroup.add(Emblem);
        }
      )
    })

  // Brush size button
  var brushSizeGeometry = new THREE.PlaneGeometry( 1, 0.5, 0 );
  var brushSizeMaterial = new THREE.MeshBasicMaterial( {color: 0x0E1E3A} );
  var brushSize = new THREE.Mesh( brushSizeGeometry, brushSizeMaterial );
  brushSize.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, 0 ) );
  brushSize.position.set(1.5,0,0);
  brushSize.rotation.x = - 1.5;
  scene.add( brushSize );

  // Brush colour button
  var brushColourGeometry = new THREE.PlaneGeometry( 1, 0.5, 0 );
  var brushColourMaterial = new THREE.MeshBasicMaterial( {color: 0x0E1E3A} );
  var brushColour = new THREE.Mesh( brushColourGeometry, brushColourMaterial );
  brushColour.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, 0 ) );
  brushColour.position.set(3,0,0);
  brushColour.rotation.x = - 1.5;
  scene.add( brushColour );

  // Pixel Plane for drawing
  var planeW = 25; // pixels
  var planeH = 15; // pixels
  var numW = 0.1; // how many wide (50*50 = 2500 pixels wide)
  var numH = 0.1; // how many tall (50*50 = 2500 pixels tall)
  var planeGeometry = new THREE.PlaneGeometry( planeW*numW, planeH*numH, planeW, planeH );
  var planeMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, side:THREE.DoubleSide, vertexColors: THREE.FaceColors } );
  var plane = new THREE.Mesh( planeGeometry, planeMaterial);
  plane.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, 0 ) );
  plane.position.set(2,0,1.5);
  plane.rotation.x = - 1.5;
  scene.add(plane);
  objects.push(plane);

  //Firefly Sphere
  var fireflyGeometry = new THREE.SphereGeometry( 1, 10, 10);
  var fireflyMaterial = new THREE.MeshLambertMaterial( {color: 0xffff00} );
  sphere = new THREE.Mesh( fireflyGeometry, fireflyMaterial );
  sphere.position = mouse;
  console.log(sphere.position);
  normalScene.add( sphere );

  //console.log(lightClickX, lightClickY);
}

// function onWindowResize(){
//     renderer.setSize( window.innerWidth, window.innerHeight );
// }

// Find centre coordinate of colour blob for X & Y coordinates
function isInsideRect(x, y, rect) {
        return rect.x <= x && x <= rect.x + rect.width &&
            rect.y <= y && y <= rect.y + rect.height;
} 

// Record and map mouse coordinated on mouse move
// function onMouseMove(event ) {
//
// 	// calculate mouse position in normalized device coordinates (-1 to +1) for both components
//
//
//   console.log(mouse.x, mouse.y);
//
// }

function lightTracker(){
  //Tracking.js coorinates
    tracker.on('track', function(event) {
      event.data.forEach(function(rect) {
        rect.x = (rect.x / window.innerWidth ) * 2 - 1;
        rect.y = - (rect.y / window.innerHeight ) * 2 + 1;
            if (rect.color === 'red') {
              lightClickX = 0;
              lightClickY = 0;
              lightX = rect.x;
              lightY = rect.y;
            }
            else if (rect.color === 'cyan') {
              lightClickX = rect.x;
              lightClickY = rect.y;
              wait(100);
            }
    })
    if (event.data.length === 0){
     lightClickX = 0;
     lightClickY = 0;
     // console.log("reset no colour");
   }
  })

    // console.log("light tracker called", lightClickX, lightClickY);

}

function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}

//////////////////////////////////////////////////////////////////////////////////
//		Render
//////////////////////////////////////////////////////////////////////////////////
var render = function () {
  // Keep looping
  requestAnimationFrame( render );

  mouse.x = lightClickX;
  mouse.y = lightClickY;

  if (mouse.x !=0 || mouse.y !=0){
  console.log(mouse.x, mouse.y);
  sphere.position.set(mouse.x,mouse.y,-10);
  //sphere.position.set(window.innerWidth/2,window.innerheight/2,-10);
  }

  //sphere.position.x = mouse.x;
  //sphere.position.y = mouse.y;
  console.log(sphere.position);
  sphere.rotation.x += 2;
  sphere.rotation.z += 2;

  // Update the picking ray with the camera and light position
	raycaster.setFromCamera( mouse, camera );

	// Calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObjects( objects );

	for ( var i = 0; i < intersects.length; i++ ) {

		intersects[i].face.color = color;
    intersects[i].object.geometry.elementsNeedUpdate = true;
	}

  if( arToolkitSource.ready === false )	return
  arToolkitContext.update( arToolkitSource.domElement )
  // Update scene.visible if the marker is seen
  scene.visible = camera.visible

  // controls.update();
  // orbcontrols.update();

  // renderer.render( normalScene, normalCamera );
  normalRenderer.render( normalScene, normalCamera );
  renderer.render( scene, camera );



}

// window.addEventListener( 'resize', onWindowResize, false );

// Call Initalise function
init();
// Call Render function
render();
lightTracker();
