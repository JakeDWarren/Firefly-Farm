//////////////////////////////////////////////////////////////////////////////////
//		Declare global variables
//////////////////////////////////////////////////////////////////////////////////
var camera, scene, renderer, geometry, material, texture;
var Emblem, EmblemGroup;
var onRenderFcts= [];

//////////////////////////////////////////////////////////////////////////////////
//		Initialise
//////////////////////////////////////////////////////////////////////////////////
function init() {

// Initialise AR base scene and rendering preferences

  // Create a scene
  scene = new THREE.Scene();

  // Create a camera
  camera = new THREE.Camera();
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

  //Drawing plane
  var drawGeometry = new THREE.PlaneGeometry( 5, 3, 0 );
  var drawMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff} );
  var drawplane = new THREE.Mesh( drawGeometry, drawMaterial );
  drawplane.position.set(3,0,2);
  drawplane.rotation.x = - 1.5;
  scene.add( drawplane );

  //Brush size button
  var brushSizeGeometry = new THREE.PlaneGeometry( 1, 0.5, 0 );
  var brushSizeMaterial = new THREE.MeshBasicMaterial( {color: 0x0E1E3A} );
  var brushsize = new THREE.Mesh( brushSizeGeometry, brushSizeMaterial );
  brushsize.position.set(1,0,0);
  brushsize.rotation.x = - 1.5;
  scene.add( brushsize );

  //Brush colour button
  var brushColourGeometry = new THREE.PlaneGeometry( 1, 0.5, 0 );
  var brushColourMaterial = new THREE.MeshBasicMaterial( {color: 0x0E1E3A} );
  var brushColour = new THREE.Mesh( brushColourGeometry, brushColourMaterial );
  brushColour.position.set(2.5,0,0);
  brushColour.rotation.x = - 1.5;
  scene.add( brushColour );

}


//////////////////////////////////////////////////////////////////////////////////
//		Render
//////////////////////////////////////////////////////////////////////////////////
onRenderFcts.push(function(){

  //Rotate Emblem on spot
  EmblemGroup.rotation.y += 0.02;

  renderer.render( scene, camera );
})

// run the rendering loop
var lastTimeMsec= null
requestAnimationFrame(function animate(nowMsec){
  // keep looping
  requestAnimationFrame( animate );
  // measure time
  lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
  var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
  lastTimeMsec	= nowMsec
  // call each update function
  onRenderFcts.forEach(function(onRenderFct){
    onRenderFct(deltaMsec/1000, nowMsec/1000)
  })
})

init();
