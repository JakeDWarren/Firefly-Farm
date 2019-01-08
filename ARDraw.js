//////////////////////////////////////////////////////////////////////////////////
//		Declare global variables
//////////////////////////////////////////////////////////////////////////////////
var camera, normalCamera, scene, normalScene, controls, orbcontrols, renderer, normalRenderer, geometry, material, texture;
var Emblem, EmblemGroup;
var tracker;
var normalRaycaster = new THREE.Raycaster(), raycaster = new THREE.Raycaster();
var faces;
var objects=[];
var color = '#ff0000';
var arToolkitContext;
var arToolkitSource;
var lightX = 0, lightY = 0, lightClickX = 0, lightClickY = 0;
var mouse = new THREE.Vector2();
// var sphere;
var arraySize = 1;
var initfly;
var fly = [];
var flies = 10;
var w = window.innerWidth, h = window.innerHeight;
var SPs=1;
var fireflies = new THREE.Group();
var ARfireflies = new THREE.Group();
var t;
var canvas;
var flyGroup;
var flyAttributes;
var clock = new THREE.Clock();
// var tracker;
var r = 0;
var cameraPosition = new THREE.Vector2();
var fire = false;
cameraPosition.x = 0;
cameraPosition.y = 0;



//////////////////////////////////////////////////////////////////////////////////
//		Initialise
//////////////////////////////////////////////////////////////////////////////////
function init() {


  // Set-up AR.js scene
  var video = arToolkitSource;

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

  controls = new THREE.DeviceOrientationControls( normalCamera );

  // normalCamera.position.set( 0, 0, 0 );
  // camera.lookAt(scene.position);

  controls.update();

  // Create a WebGL renderer and add prefernces
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  normalRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

  // Set the size of the renderer to the inner width and inner height of the window
  renderer.setSize( window.innerWidth, window.innerHeight );
  normalRenderer.setSize( window.innerWidth, window.innerHeight );

  // Add in the created DOM element to the body of the document
  document.body.appendChild( normalRenderer.domElement );
  document.body.appendChild( renderer.domElement );

  //Store info about drawing canvas
  // canvas = document.getElementsByTagName('canvas')[1];

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

    document.getElementById("fire").addEventListener("click", function(){
      fire = true;
      console.log(fire)
      event.stopImmediatePropagation();
    });

  //   document.getElementById("fire").addEventListener("mouseup", function(){
  //   wait(5000);
  //   fire = false;
  //   console.log(fire)
  //   // event.stopImmediatePropagation();
  // });

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
  // normalScene.add( directionalLight );

  // Add weak ambient light
  var ambientlight = new THREE.AmbientLight( 0x404040, 3); // soft white light
  scene.add( ambientlight );
  // normalScene.add( ambientlight );

  // LIGHT
	var light = new THREE.PointLight(0xffffff);
	light.position.set(0,10,0);
	normalScene.add(light);

  // Emblem model
  EmblemGroup = new THREE.Object3D();
  scene.add(EmblemGroup);
    var materialLoader = new THREE.MTLLoader()
    materialLoader.load('models/FireJar.mtl', function (material) {
      var objLoader = new THREE.OBJLoader()
      objLoader.setMaterials(material)
      objLoader.load(
        'models/FireJar.obj',
        function (Emblem) {
          Emblem.scale.set(1,1,1);
          Emblem.position.set(0,0,0);
          Emblem.shadow;
          EmblemGroup.add(Emblem);
        }
      )
    })



  // Brush size button
  // var brushSizeGeometry = new THREE.PlaneGeometry( 1, 0.5, 0 );
  // var brushSizeMaterial = new THREE.MeshBasicMaterial( {color: 0x0E1E3A} );
  // var brushSize = new THREE.Mesh( brushSizeGeometry, brushSizeMaterial );
  // brushSize.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, 0 ) );
  // brushSize.position.set(1.5,0,0);
  // brushSize.rotation.x = - 1.5;
  // scene.add( brushSize );
  //
  // // Brush colour button
  // var brushColourGeometry = new THREE.PlaneGeometry( 1, 0.5, 0 );
  // var brushColourMaterial = new THREE.MeshBasicMaterial( {color: 0x0E1E3A} );
  // var brushColour = new THREE.Mesh( brushColourGeometry, brushColourMaterial );
  // brushColour.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, 0 ) );
  // brushColour.position.set(3,0,0);
  // brushColour.rotation.x = - 1.5;
  // scene.add( brushColour );
  //
  // // Pixel Plane for drawing
  // var planeW = 25; // pixels
  // var planeH = 15; // pixels
  // var numW = 0.1; // how many wide (50*50 = 2500 pixels wide)
  // var numH = 0.1; // how many tall (50*50 = 2500 pixels tall)
  // var planeGeometry = new THREE.PlaneGeometry( planeW*numW, planeH*numH, planeW, planeH );
  // var planeMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, side:THREE.DoubleSide, vertexColors: THREE.FaceColors } );
  // var plane = new THREE.Mesh( planeGeometry, planeMaterial);
  // plane.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, 0 ) );
  // plane.position.set(2,0,1.5);
  // plane.rotation.x = - 1.5;
  // scene.add(plane);
  // objects.push(plane);

  // // Firefly particles
  // flyGroup = new THREE.Object3D();
  // flyAttributes = { startSize: [], startPosition: [], randomness: [] };
  // var totalFlies = 50;
  // var radiusRange = 25;
  //
  // var flyTexture = THREE.ImageUtils.loadTexture( 'Fly.png' );
  // for (let i=0; i<totalFlies; i++){
  //
    var flyGeometry = new THREE.SphereGeometry( 0.5, 14, 8 );
    var flyMaterial = new THREE.ShaderMaterial(
      {
        uniforms: { },
          vertexShader:   document.getElementById( 'vertexShader'   ).textContent,
          fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          transparent: true
        });
  //
  //   var flyMaterial = new THREE.SpriteMaterial( { map: flyTexture, color: 0xffffff } );
  //
   initfly = new THREE.Mesh( flyGeometry, flyMaterial );

    fireflies[0] = initfly;
  //   var fly = new THREE.Sprite( flyMaterial );
    // fly.scale.set( 1.0, 1.0, 1.0 );
    fireflies[0].position.set(0.5,0.5,-10);
    console.log(fly[0]);
  //   // fly.material.color.setHSL( Math.random(), 0.9, 0.7 );
  //   flyGroup.add( fly );
  //   flyAttributes.startPosition.push( fly.position.clone() );
	// 	flyAttributes.randomness.push( Math.random() );
  //   console.log(fly);
  // }
  // flyGroup.position.z = -10;
  fireflies.add( fireflies[0] )
	normalScene.add( fireflies );
  // scene.add( ARfireflies );
  // console.log(flyGroup);

  // // Define red as tracking colour
  //   tracking.ColorTracker.registerColor('red', function(r, g, b) {
  //     if (r > 130 && g < 70 && b < 70) {
  //       return true;
  //     }
  //     return false;
  //   });
  //
  // // Create the color tracking object
  // tracker = new tracking.ColorTracker(['red', 'cyan']);
  fireflyStart();

}

function fireflyStart(){

  for (var i=flies;i--;){
    fireflies[i] = initfly.clone();
    var Div = fireflies[i];
    console.log(Div);
      fireflies.children.push(fireflies[i]);
      console.log(Div);
    TweenLite.set(Div.position,x:R(w),y:R(h));
    Anim(Div);
    fireflies.children.push(Div);
};

function Anim(elm){
    elm.Tween=TweenLite.to(elm,R(20)+10,{bezier:{values:[{x:R(w),y:R(h)},{x:R(w),y:R(h)}]},scale:R(1)+0.5,delay:R(2),onComplete:Anim,onCompleteParams:[elm]})
};

for(var i=flies;i--;){
  Tweens[i].Tween.play()};


function R(max){return Math.random()*max};
}

function onMouseMove( event ) {
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	mouse.x = ( event.clientX / n ) * 2 - 1;
	mouse.y = - ( event.clientY  ) * 2 + 1;

}

// Register X and Y of touch or click
document.addEventListener('touchstart', function(e) {
  // Cache the client X/Y coordinates
  console.log(normalRenderer);
  mouse.x = (e.touches[0].clientX / normalRenderer.domElement.width )*5 -2.429 ;
  mouse.y = -(e.touches[0].clientY / normalRenderer.domElement.height )*10 -1;

  console.log("Touched at ", mouse.x, mouse.y);

  // fly.position.set(mouse.x,mouse.y, -10);
}, false);

// window.addEventListener("click", function(e) {
// console.log(mouse.x, mouse.y);
// });

// function onWindowResize(){
//     renderer.setSize( window.innerWidth, window.innerHeight );
// }

// Find centre coordinate of colour blob for X & Y coordinates
// function isInsideRect(x, y, rect) {
//         return rect.x <= x && x <= rect.x + rect.width &&
//             rect.y <= y && y <= rect.y + rect.height;
// } 

function random(min,max) // min and max included
{
    return Math.random()*(max-min+1)+min;
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

function arCheck() {

}

// function lightTracker() {
//   // arCheck();
//   // Update scene.visible if the marker is seen
//
//   var cam = document.getElementsByTagName('video');
//   var video = cam[0];
//
//
//   console.log(video);
//
//   // Start tracking
//   tracking.track(video, tracker, { camera: true } );
//
//   var constraints = {
//   video: true
// };
//
// function handleSuccess(stream) {
//   window.stream = stream; // only to make stream available to console
//   video.srcObject = stream;
// }
//
// function handleError(error) {
//   console.log('getUserMedia error: ', error);
// }
//
// navigator.mediaDevices.getUserMedia(constraints).
//   then(handleSuccess).catch(handleError);
//   // Add callback for the "track" event
//   tracker.on('track', function(e) {
//
//     if (e.data.length !== 0) {
//
//       e.data.forEach(function(rect) {
//         if (rect.color === 'red') {
//               lightX = rect.x;
//               lightY = rect.y;
//               console.log("Red is ", rect.x, rect.y);
//             }
//             else if (rect.color === 'cyan') {
//               lightClickX = rect.x;
//               lightClickY = rect.y;
//               console.log("Cyan is ", rect.x, rect.y);
//               // wait(100);
//             }
//       });
//
//     }
//
//   });
//   };

function launchFirefly() {
  var p = fireflies.children.length + 1;
  console.log(p);
  for (var i = p; i>fireflies.children.length; i--) {
    fireflies[p] = initfly.clone();
      fireflies.children.push(fireflies[p]);
      // fireflies[p].position.set(0,0,0);
      // ARfireflies.push( ARfireflies[i]);
      // // scene.add(ARfireflies);
      // // scene.updateMatrix();
      // // scene.matrixWorldNeedsUpdate = true;
      console.log("new firefly", fireflies, fireflies.children.length);
      // i = i n 1;
  }

  var launchfly = initfly.clone();
  launchfly.position.set(0,2,1);
  scene.add(launchfly);

  for (var i=flies;i--;){
    var Div=document.createElement('div');
    TweenLite.set(Div,{attr:{class:'dot'},x:R(w),y:R(h),opacity:0});
    container.appendChild(Div); Anim(Div);  Tweens.push(Div);
};

function Anim(elm){
    elm.Tween=TweenLite.to(elm,R(20)+10,{bezier:{values:[{x:R(w),y:R(h)},{x:R(w),y:R(h)}]},opacity:R(1),scale:R(1)+0.5,delay:R(2),onComplete:Anim,onCompleteParams:[elm]})
};

for(var i=total;i--;){
  Tweens[i].Tween.play()};


function R(max){return Math.random()*max};
  // i++;
  // var flies = [];
  // var i = 1;
  // count
  // for (i; i<(count+1); i++){
  //   flies[i] = fly;
  // fireflies.add(fly);
  // console.log(fireflies);
  //   console.log(fireflies.children);
  // }
  // count++;


  // fireflies.add(fly);
  // console.log(fireflies);
  // fireflies[1].position.set(0,6,1);
  // scene.updateMatrixWorld();
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

  if( arToolkitSource.ready === false )	return
  arToolkitContext.update( arToolkitSource.domElement )

  scene.visible = camera.visible

  normalScene.updateMatrixWorld();
  scene.updateMatrixWorld();

  raycaster.setFromCamera( cameraPosition, camera );

  normalRaycaster.setFromCamera( cameraPosition, normalCamera);

  var intersects = raycaster.intersectObjects( scene.children );

	var normalIntersects = normalRaycaster.intersectObjects( normalScene.children[2].children );

 	if(fire == true && normalIntersects[0] != undefined){
    // document.getElementById("fire").addEventListener("click", function(event){
      // event.stopImmediatePropagation();
      console.log(normalIntersects[0].point.x.toFixed(0.1)+" "+normalIntersects[0].point.y.toFixed(0.1));
      normalIntersects[0].object.visible = false;
      console.log(normalIntersects[0]);
      // normalScene.updateMatrixWorld();
      fire = false;
    // });
  } else if (fire == true && normalIntersects[0] == undefined) {
    fire = false;
    launchFirefly();
    // console.log(normalScene.children[2].children);
  }

  document.getElementById("level").innerHTML = "Level: " + fireflies.children.length;

  document.getElementById("reset").addEventListener("click", function(event){
    event.stopPropagation();

    normalIntersects[0].object.visible = true;

    for (var i = fireflies.children.length - 1; i > 0; i--) {
      i = i+1;
    fireflies.remove(fireflies[i]);
      i = i-1;
}
    // normalIntersects[0].object.position = normalIntersects[0].object.position

    // normalIntersects[0].updateMatrixWorld();

  });

  // console.log(scene.children);

  mouse.x;
  mouse.y;

  if (mouse.x !=0 || mouse.y !=0){
  // console.log(mouse.x, mouse.y);
  for (let i=0; i<arraySize; i++){
  // fly.position.set(mouse.x,mouse.y,-10);
  // fly.position.set(-3,-3,-10);
}
  // sphere.position.set(window.innerWidth/2,window.innerheight/2,-10);
  }

  // var time = 0.5 * clock.getElapsedTime();
  //
	// for ( var c = 0; c < flyGroup.children.length; c ++ )
	// {
	// 	var fly = flyGroup.children[ c ];
	// 	// particle wiggle
	// 	// var wiggleScale = 2;
	// 	// sprite.position.x += wiggleScale * (Math.random() - 0.5);
	// 	// sprite.position.y += wiggleScale * (Math.random() - 0.5);
	// 	// sprite.position.z += wiggleScale * (Math.random() - 0.5);
  //
	// 	// pulse away/towards center
	// 	// individual rates of movement
	// 	var a = flyAttributes.randomness[c] + 1;
	// 	var pulseFactor = Math.sin(a * time) * 0.1 + 0.9;
	// 	fly.position.x = flyAttributes.startPosition[c].x * pulseFactor;
	// 	fly.position.y = flyAttributes.startPosition[c].y * pulseFactor;
	// 	fly.position.z = flyAttributes.startPosition[c].z * pulseFactor;
	// }
	// // rotate the entire group
	// // particleGroup.rotation.x = time * 0.5;
	// flyGroup.rotation.y = time * 0.75;
	// particleGroup.rotation.z = time * 1.0;

  //Store height and width of canvas


  //sphere.position.x = mouse.x;
  //sphere.position.y = mouse.y;

  // spheres.children[i].rotation.x += 0.4;
  // spheres.children[i].rotation.y += 0.4;

  // Update the picking ray with the camera and light position
	// raycaster.setFromCamera( mouse, camera );
  //
	// // Calculate objects intersecting the picking ray
	// var intersects = raycaster.intersectObjects( objects );
  //
	// for ( var i = 0; i < intersects.length; i++ ) {
  //
	// 	intersects[i].face.color = color;
  //   intersects[i].object.geometry.elementsNeedUpdate = true;
	// }



  controls.update();

  // renderer.render( normalScene, normalCamera );
  normalRenderer.render( normalScene, normalCamera );
  renderer.render( scene, camera );
}

// window.addEventListener( 'resize', onWindowResize, false );


// Call Initalise function
init();

// Call Render function
render();
