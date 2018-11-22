var camera, scene, renderer, geometry, material, mesh;
var texture;
var onRenderFcts= [];

function init() {
  // Intial Setup //
    	// Create a scene
    	scene = new THREE.Scene();
    	// Create a camera
      camera = new THREE.Camera();
	    scene.add(camera);
    	// Create a WebGL Rendered
    	renderer = new THREE.WebGLRenderer({
  		antialias: true,
  		alpha: true
    	});
    	// Set the size of the rendered to the inner width and inner height of the window
    	renderer.setSize( window.innerWidth, window.innerHeight );
    	// Add in the created DOM element to the body of the document
    	document.body.appendChild( renderer.domElement );

  // AR Setup //
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
        arToolkitSource.onResize()
        arToolkitSource.copyElementSizeTo(renderer.domElement)
        if( arToolkitContext.arController !== null ){
          arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
        }
      }
      // create atToolkitContext
      var arToolkitContext = new THREEx.ArToolkitContext({
        cameraParametersUrl: THREEx.ArToolkitContext.baseURL + 'data/camera_para.dat',
        detectionMode: 'mono',
      })
      // initialize it
      arToolkitContext.init(function onCompleted(){
        // copy projection matrix to camera
        camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
      })
      // update artoolkit on every frame
      onRenderFcts.push(function(){
        if( arToolkitSource.ready === false )	return

        arToolkitContext.update( arToolkitSource.domElement )

        // update scene.visible if the marker is seen
        scene.visible = camera.visible
      })
      // init controls for camera
      var markerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {
        type : 'pattern',
        patternUrl : THREEx.ArToolkitContext.baseURL + 'data/CircleDash.patt',
        // patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/patt.kanji',
        // as we controls the camera, set changeMatrixMode: 'cameraTransformMatrix'
        changeMatrixMode: 'cameraTransformMatrix'
      })
      // as we do changeMatrixMode: 'cameraTransformMatrix', start with invisible scene
      scene.visible = false;

    document.body.appendChild( WEBVR.createButton( renderer ) );
    renderer.vr.enabled = true;


  // Dash Stuff //

  // add a torus knot
	var geometry	= new THREE.CubeGeometry(1,1,1);
	var material	= new THREE.MeshNormalMaterial({
		transparent : true,
		opacity: 0.5,
		side: THREE.DoubleSide
	});
	var mesh	= new THREE.Mesh( geometry, material );
	mesh.position.y	= geometry.parameters.height/2
	scene.add( mesh );

	var geometry	= new THREE.TorusKnotGeometry(0.3,0.1,64,16);
	var material	= new THREE.MeshNormalMaterial();
	var mesh	= new THREE.Mesh( geometry, material );
	mesh.position.y	= 0.5
	scene.add( mesh );


}

// render the scene
onRenderFcts.push(function(){
  renderer.setAnimationLoop( function () { renderer.render( scene, camera ); } );
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
