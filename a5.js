/////////////////////////////////////////////////////////////////////////////////////////
//  UBC CPSC 314,  Vsep2018
//  Assignment 5 Template;   compatible with three.js  r96
/////////////////////////////////////////////////////////////////////////////////////////

console.log('hello world');

//  another print example
myvector = new THREE.Vector3(0,1,2);
console.log('myvector =',myvector);

// SETUP RENDERER & SCENE
var canvas = document.getElementById('canvas');
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xd0f0d0); // set background colour
canvas.appendChild(renderer.domElement);


// SETUP CAMERA
var camera = new THREE.PerspectiveCamera(30,1,0.1,10000); // view angle, aspect ratio, near, far
camera.position.set(0,12,20);
camera.lookAt(0,0,0);
scene.add(camera);

// SETUP ORBIT CONTROLS OF THE CAMERA
var controls = new THREE.OrbitControls(camera);
controls.damping = 0.2;
controls.autoRotate = false;

// ADAPT TO WINDOW RESIZE
function resize() {
  renderer.setSize(window.innerWidth,window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
}

// EVENT LISTENER RESIZE
window.addEventListener('resize',resize);
resize();

//SCROLLBAR FUNCTION DISABLE
window.onscroll = function () {
     window.scrollTo(0,0);
}

var start = start = Date.now();

/////////////////////////////////////
// ADD LIGHTS  and define a simple material that uses lighting
/////////////////////////////////////

light = new THREE.PointLight(0xffffff);
light.position.set(0,4,4);

var vcsLight = new THREE.Vector3(light.position);
scene.add(light);
ambientLight = new THREE.AmbientLight(0x606060);
scene.add(ambientLight);

var diffuseMaterial = new THREE.MeshLambertMaterial( {color: 0xffffff} );
var diffuseMaterial2 = new THREE.MeshLambertMaterial( {color: 0xffffff, side: THREE.DoubleSide } );
var basicMaterial = new THREE.MeshBasicMaterial( {color: 0xff0000} );

///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////  SHADERS /////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

var textureLoader = new THREE.TextureLoader();

////////////////////// ENVMAP SHADER (and SkyBox textures)  /////////////////////////////

//posyTexture = textureLoader.load( "images/ABCD.jpg" );   // useful for debugging
posxTexture = textureLoader.load( "images/posx.jpg" );
posyTexture = textureLoader.load( "images/posy.jpg" );
poszTexture = textureLoader.load( "images/posz.jpg" );
negxTexture = textureLoader.load( "images/negx.jpg" );
negyTexture = textureLoader.load( "images/negy.jpg" );
negzTexture = textureLoader.load( "images/negz.jpg" );

minFilter = THREE.NearestFilter;
// minFilter = THREE.LinearMipMapLinearFilter;
magFilter = THREE.LinearFilter;

posxTexture.magFilter = magFilter;
posxTexture.minFilter = minFilter;
posyTexture.magFilter = magFilter;
posyTexture.minFilter = minFilter;
poszTexture.magFilter = magFilter;
poszTexture.minFilter = minFilter;
negxTexture.magFilter = magFilter;
negxTexture.minFilter = minFilter;
negyTexture.magFilter = magFilter;
negyTexture.minFilter = minFilter;
negzTexture.magFilter = magFilter;
negzTexture.minFilter = minFilter;

var envmapMaterial = new THREE.ShaderMaterial( {
        uniforms: {
           lightPosition: {value: new THREE.Vector3(0.0,0.0,-1.0) },
	   matrixWorld: {value: new THREE.Matrix4()},
           uNegxTexture: {type: 't', value: negxTexture},
           uNegyTexture: {type: 't', value: negyTexture},
           uNegzTexture: {type: 't', value: negzTexture},
           uPosxTexture: {type: 't', value: posxTexture},
           uPosyTexture: {type: 't', value: posyTexture},
           uPoszTexture: {type: 't', value: poszTexture},
           myColor: { value: new THREE.Vector4(0.8,0.8,0.6,1.0) }
        },
	vertexShader: document.getElementById( 'myVertShader' ).textContent,
	fragmentShader: document.getElementById( 'envmapFragShader' ).textContent
} );

////////////////////// HOLEY SHADER /////////////////////////////

var holeyMaterial = new THREE.ShaderMaterial( {
        uniforms: {
           lightPosition: {value: new THREE.Vector3(0.0,0.0,-1.0) },
           myColor: { value: new THREE.Vector4(0.5,1.0,1.0,1.0) }
        },
	vertexShader: document.getElementById( 'myVertShader' ).textContent,
	fragmentShader: document.getElementById( 'holeyFragShader' ).textContent
} );

////////////////////// TOON SHADER /////////////////////////////

var toonMaterial = new THREE.ShaderMaterial( {
        uniforms: {
           lightPosition: {value: new THREE.Vector3(0.0,0.0,-1.0) },
           myColor: { value: new THREE.Vector4(1.0,0.5,0.8,1.0) }
        },
	vertexShader: document.getElementById( 'myVertShader' ).textContent,
	fragmentShader: document.getElementById( 'toonFragShader' ).textContent
} );

////////////////////// FLOOR SHADER /////////////////////////////

floorNormalTexture = textureLoader.load( "images/stone-map.png" );
floorTexture = textureLoader.load( "images/floor.jpg" );
floorTexture.magFilter = THREE.NearestFilter;
//floorTexture.minFilter = THREE.NearestFilter;
//floorNormalTexture.minFilter = THREE.NearestFilter;
floorNormalTexture.magFilter = THREE.NearestFilter;

// 1(a) LinearMipMapLinear: linearly interpolate across levels (smoother transition) and within levels
// Linear interpolation is slower than using nearest filters
floorTexture.minFilter = THREE.LinearMipMapLinearFilter;
floorNormalTexture.minFilter = THREE.LinearMipMapLinearFilter;

var floorMaterial = new THREE.ShaderMaterial( {
        uniforms: {
           lightPosition: {value: new THREE.Vector3(0.0,0.0,-1.0) },
           myColor: { value: new THREE.Vector4(0.0,1.0,0.0,1.0) },
           normalMap: { type: 't', value: floorNormalTexture},
           textureMap: { type: 't', value: floorTexture}
        },
        side: THREE.DoubleSide,
	vertexShader: document.getElementById( 'floorVertShader' ).textContent,
	fragmentShader: document.getElementById( 'floorFragShader' ).textContent
} );
floorMaterial.uniforms.lightPosition.value.needsUpdate = true;

///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////  OBJECTS /////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////
// WORLD COORDINATE FRAME
/////////////////////////////////////

var worldFrame = new THREE.AxesHelper(5) ;
scene.add(worldFrame);

/////////////////////////////////////
// Skybox
/////////////////////////////////////

// TO DO:
//  - add the other skybox faces:  negx, negy, posy, negz, posz
//  - after debugging, change size to 1000

var size = 1000;
wallGeometry = new THREE.PlaneBufferGeometry(2*size, 2*size);

posxMaterial = new THREE.MeshBasicMaterial( {map: posxTexture, side:THREE.DoubleSide });
posxWall = new THREE.Mesh(wallGeometry, posxMaterial);
posxWall.position.x = size;
posxWall.rotation.y = -Math.PI / 2;
scene.add(posxWall);

posyMaterial = new THREE.MeshBasicMaterial( {map: posyTexture, side:THREE.DoubleSide });
posyWall = new THREE.Mesh(wallGeometry, posyMaterial);
posyWall.rotation.x = -Math.PI / 2;
posyWall.rotation.y = -Math.PI;
posyWall.position.y = size;
scene.add(posyWall);

poszMaterial = new THREE.MeshBasicMaterial( {map: poszTexture, side:THREE.DoubleSide });
poszWall = new THREE.Mesh(wallGeometry, poszMaterial);
poszWall.rotation.y = -Math.PI;
poszWall.position.z = size;
scene.add(poszWall);

negxMaterial = new THREE.MeshBasicMaterial( {map: negxTexture, side:THREE.DoubleSide });
negxWall = new THREE.Mesh(wallGeometry, negxMaterial);
negxWall.position.x = -size;
negxWall.rotation.y = Math.PI / 2;
scene.add(negxWall);

negyMaterial = new THREE.MeshBasicMaterial( {map: negyTexture, side:THREE.DoubleSide });
negyWall = new THREE.Mesh(wallGeometry, negyMaterial);
negyWall.rotation.x = Math.PI / 2;
negyWall.rotation.y = Math.PI;
negyWall.position.y = -size;
scene.add(negyWall);

negzMaterial = new THREE.MeshBasicMaterial( {map: negzTexture, side:THREE.DoubleSide });
negzWall = new THREE.Mesh(wallGeometry, negzMaterial);
negzWall.position.z = -size;
scene.add(negzWall);

/////////////////////////////////////
// FLOOR:  texture-map  &  normal-map
/////////////////////////////////////

floorGeometry = new THREE.PlaneBufferGeometry(15, 15);
floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = -1.1;
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

///////////////////////////////////////////////////////////////////////
//   sphere, representing the light
///////////////////////////////////////////////////////////////////////

sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);    // radius, segments, segments
lightSphere = new THREE.Mesh(sphereGeometry, basicMaterial);
lightSphere.position.set(0,4,5);
lightSphere.position.set(light.position.x, light.position.y, light.position.z);
scene.add(lightSphere);

/////////////////////////////////////////////////////////////////////////
// holey-shaded torus
/////////////////////////////////////////////////////////////////////////

// parameters:   radius of torus, diameter of tube, segments around radius, segments around torus
torusGeometry = new THREE.TorusGeometry( 1.2, 0.4, 10, 20 );
torus = new THREE.Mesh( torusGeometry, holeyMaterial);
torus.position.set(6, 0, 0.3);   // translation
torus.rotation.set(0,0,0);     // rotation about x,y,z axes
scene.add( torus );

/////////////////////////////////////////////////////////////////////////
// toon-shaded torus
/////////////////////////////////////////////////////////////////////////

// parameters:   radius of torus, diameter of tube, segments around radius, segments around torus
torusGeometry = new THREE.TorusGeometry( 1.2, 0.4, 10, 20 );
torus = new THREE.Mesh( torusGeometry, toonMaterial);
torus.position.set(3, 0, 0.3);   // translation
torus.rotation.set(0,0,0);     // rotation about x,y,z axes
scene.add( torus );

/////////////////////////////////////
// MIRROR:  square patch on the ground
/////////////////////////////////////

mirrorGeometry = new THREE.PlaneBufferGeometry(4,4);
mirror = new THREE.Mesh(mirrorGeometry, envmapMaterial);
mirror.position.x = 2.0;
mirror.position.z = 4.0;
mirror.position.y = -1.0;
mirror.rotation.x = -Math.PI / 2;
scene.add(mirror);

/////////////////////////////////////
// MARBLE:  square patch on the ground
/////////////////////////////////////

var marbleMaterial = new THREE.ShaderMaterial( {
	vertexShader: document.getElementById( 'myVertShader' ).textContent,
	fragmentShader: document.getElementById( 'pnoiseFragShader' ).textContent,
        side: THREE.DoubleSide
} );

marbleGeometry = new THREE.PlaneBufferGeometry(4,4);
marble = new THREE.Mesh(marbleGeometry, marbleMaterial);
marble.position.x = 6.0;
marble.position.z = 4.0;
marble.position.y = -1.0;
marble.rotation.x = -Math.PI / 2;
scene.add(marble);

/////////////////////////////////////
// MAGMA
/////////////////////////////////////

var magmaMaterial = new THREE.ShaderMaterial( {
  uniforms: {
    time: {
      type: "f",
      value: 0.0
    },
    weight: { type: "f", value: 0 }
  },
	vertexShader: document.getElementById( 'magmaVertShader' ).textContent,
  fragmentShader: document.getElementById( 'pnoiseMagFragShader' ).textContent,
  side: THREE.DoubleSide
} );

magmaGeometry = new THREE.IcosahedronGeometry( 4.0,5);
var magma = new THREE.Mesh(magmaGeometry, magmaMaterial);
magma.doubleSided = true;
magma.position.x = -6.0;
magma.position.z = 4.0;
magma.position.y = 10.0;
magma.rotation.x = -Math.PI / 2;
scene.add(magma);


/////////////////////////////////////////////////////////////////////////
// sphere
/////////////////////////////////////////////////////////////////////////

sphereA = new THREE.Mesh( new THREE.SphereGeometry( 2, 20, 10 ), envmapMaterial );
sphereA.position.set(0,5,0);
scene.add( sphereA );

/////////////////////////////////////////////////////////////////////////////////////
//  ARMADILLO
/////////////////////////////////////////////////////////////////////////////////////

var manager = new THREE.LoadingManager();
        manager.onProgress = function ( item, loaded, total ) {
	console.log( item, loaded, total );
};
var armadilloTexture = envmapMaterial;
//var armadilloTexture = diffuseMaterial;
var onProgress = function ( xhr ) {
	if ( xhr.lengthComputable ) {
		var percentComplete = xhr.loaded / xhr.total * 100;
		console.log( Math.round(percentComplete, 2) + '% downloaded' );
	}
};
var onError = function ( xhr ) {
};
var loader = new THREE.OBJLoader( manager );
loader.load( 'obj/armadillo.obj', function ( object ) {
	object.traverse( function ( child ) {
		if ( child instanceof THREE.Mesh ) {
			child.material = armadilloTexture;
		}
	} );
	scene.add( object );
        object.scale.set(2,2,2);
        object.position.x = -5;
        object.position.y = 1;
}, onProgress, onError );

///////////////////////////////////////////////////////////////////////////////////////
// LISTEN TO KEYBOARD
///////////////////////////////////////////////////////////////////////////////////////

var keyboard = new THREEx.KeyboardState();
function checkKeyboard() {
  if (keyboard.pressed("W")) {
    console.log('W pressed');
    light.position.y += 0.1;
  } else if (keyboard.pressed("S"))
    light.position.y -= 0.1;
  if (keyboard.pressed("A"))
    light.position.x -= 0.1;
  else if (keyboard.pressed("D"))
    light.position.x += 0.1;
  lightSphere.position.set(light.position.x, light.position.y, light.position.z);

    // compute light position in VCS coords,  supply this to the shaders
 vcsLight.set(light.position.x, light.position.y, light.position.z);
 vcsLight.applyMatrix4(camera.matrixWorldInverse);

  floorMaterial.uniforms.lightPosition.value = vcsLight;
  floorMaterial.uniforms.lightPosition.value.needsUpdate = true;
  toonMaterial.uniforms.lightPosition.value = vcsLight;
  toonMaterial.uniforms.lightPosition.value.needsUpdate = true;
  holeyMaterial.uniforms.lightPosition.value = vcsLight;
  holeyMaterial.uniforms.lightPosition.value.needsUpdate = true;
  envmapMaterial.uniforms.lightPosition.value = vcsLight;
  envmapMaterial.uniforms.lightPosition.value.needsUpdate = true;
}

///////////////////////////////////////////////////////////////////////////////////////
// UPDATE CALLBACK
///////////////////////////////////////////////////////////////////////////////////////

var start = Date.now();

function animate() {
  requestAnimationFrame(update);
  render();
}


function render() {
  magmaMaterial.uniforms[ 'time' ].value = .00035 * ( Date.now() - start );
  magmaMaterial.uniforms[ 'weight' ].value = 1.75 * ( .5 + .5 * Math.sin( .00025 * ( Date.now() - start ) ) );
  renderer.render(scene, camera);

}


function update() {
  checkKeyboard();

  animate();
  envmapMaterial.uniforms.matrixWorld.value = camera.matrixWorld;
  envmapMaterial.uniforms.matrixWorld.update = true;

}

update();
