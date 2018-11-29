//////////////////////////////////////////////////////////////////////////////////
//		Declare global variables
//////////////////////////////////////////////////////////////////////////////////
var camera, scene, renderer, geometry, material, texture;
var Emblem, EmblemGroup;
var tracker;
var onRenderFcts= [];
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

//////////////////////////////////////////////////////////////////////////////////
//		Initialise
//////////////////////////////////////////////////////////////////////////////////
function init() {

  var video = arToolkitSource;

  tracker = new tracking.ColorTracker(['magenta', 'cyan']);

  tracking.track('#video', tracker, { camera: true });

// Initialise AR base scene and rendering preferences

  // Create a scene
  scene = new THREE.Scene();

  // Create a camera
  camera = new THREE.PerspectiveCamera();
  scene.add(camera);

  // Create a WebGL renderer and add prefernces
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

  // Set the size of the renderee to the inner width and inner height of the window
  renderer.setSize( window.innerWidth, window.innerHeight );

  // Add in the created DOM element to the body of the document
  document.body.appendChild( renderer.domElement );

  // Set-up AR.js scene
  var arToolkitSource = new THREEx.ArToolkitSource({
    sourceType : 'webcam',
  })

  arToolkitSource.init(function onReady(){
    onResize()
  })

  window.addEventListener('resize', function(){
    onResize()
  })

  function onResize(){
    arToolkitSource.onResizeElement()
    arToolkitSource.copyElementSizeTo(renderer.domElement)
    if( arToolkitContext.arController !== null ){
      arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
    }
  }

  // Create atToolkitContext
  var arToolkitContext = new THREEx.ArToolkitContext({
    cameraParametersUrl: 'data/camera_para.dat',
    detectionMode: 'mono',
  })

  // Initialize AR scene
  arToolkitContext.init(function onCompleted(){
    // copy projection matrix to camera
    camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
  })

  // Update artoolkit on every frame
  onRenderFcts.push(function(){
    if( arToolkitSource.ready === false )	return
    arToolkitContext.update( arToolkitSource.domElement )
    // update scene.visible if the marker is seen
    scene.visible = camera.visible
  })

  // Initalise controls for camera
  var markerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {
    type : 'pattern',
    patternUrl : 'data/CircleDash.patt',
    changeMatrixMode: 'cameraTransformMatrix'
  })
  scene.visible = false;

// ARDraw scene  //

  //Add a directional light
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.position.set(1,0.5,1);
  scene.add( directionalLight );

  //Add weak ambient light
  var ambientlight = new THREE.AmbientLight( 0x404040, 3); // soft white light
  scene.add( ambientlight );

  //Emblem model
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

  //Brush size button
  var brushSizeGeometry = new THREE.PlaneGeometry( 1, 0.5, 0 );
  var brushSizeMaterial = new THREE.MeshBasicMaterial( {color: 0x0E1E3A} );
  var brushSize = new THREE.Mesh( brushSizeGeometry, brushSizeMaterial );
  brushSize.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, 0 ) );
  brushSize.position.set(1.5,0,0);
  brushSize.rotation.x = - 1.5;
  scene.add( brushSize );

  //Brush colour button
  var brushColourGeometry = new THREE.PlaneGeometry( 1, 0.5, 0 );
  var brushColourMaterial = new THREE.MeshBasicMaterial( {color: 0x0E1E3A} );
  var brushColour = new THREE.Mesh( brushColourGeometry, brushColourMaterial );
  brushColour.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, 0 ) );
  brushColour.position.set(3,0,0);
  brushColour.rotation.x = - 1.5;
  scene.add( brushColour );

  //Pixel Plane for drawing
  var planeW = 55; // pixels
  var planeH = 35; // pixels
  var numW = 0.05; // how many wide (50*50 = 2500 pixels wide)
  var numH = 0.05; // how many tall (50*50 = 2500 pixels tall)
  var planeGeometry = new THREE.PlaneGeometry( planeW*numW, planeH*numH, planeW, planeH );
  var planeMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } );
  var plane = new THREE.Mesh( planeGeometry, planeMaterial );
  plane.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, 0 ) );
  plane.position.set(2,0,1.5);
  plane.rotation.x = - 1.5;
  scene.add(plane);

}

//Find centre coordinate of colour blob for X & Y coordinates
function isInsideRect(x, y, rect) {
        return rect.x <= x && x <= rect.x + rect.width &&
            rect.y <= y && y <= rect.y + rect.height;
} 

//Record and map mouse coordinated on mouse move
function onMouseMove( event ) {

	//calculate mouse position in normalized device coordinates (-1 to +1) for both components
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}


//////////////////////////////////////////////////////////////////////////////////
//		Render
//////////////////////////////////////////////////////////////////////////////////
onRenderFcts.push(function(){

  //Rotate Emblem on spot
  EmblemGroup.rotation.y += 0.02;

  //Tracking.js coorinates
  tracker.on('track', function(event) {
    event.data.forEach(function(rect) {
          if (rect.color === 'green') {
            console.log(rect.x, rect.y)
          }
          else if (rect.color === 'cyan') {
            console.log("Detected")
          }
  })})

  //Update the picking ray with the camera and mouse position
	raycaster.setFromCamera( mouse, camera );

	//Calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObjects( scene.children );

  console.log(intersects.length);

	for ( var i = 0; i < intersects.length; i++ ) {

		intersects[ i ].object.material.color.set( 0xff0000 );
    console.log("colour changed");

	}

  renderer.render( scene, camera );
})

//Run the rendering loop
var lastTimeMsec= null
requestAnimationFrame(function animate(nowMsec){
  //Keep looping
  requestAnimationFrame( animate );
  //Measure time
  lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
  var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
  lastTimeMsec	= nowMsec
  //Call each update function
  onRenderFcts.forEach(function(onRenderFct){
    onRenderFct(deltaMsec/1000, nowMsec/1000)
  })
})

//Call Initalise function
init();
//Listen for mouse location
window.addEventListener( 'mousemove', onMouseMove, false );
