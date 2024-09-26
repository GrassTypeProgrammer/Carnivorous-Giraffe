import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import * as CANNON from 'cannon-es'

/**
 * Debug
 */
const gui = new GUI()
const debugObject = {};

debugObject.createSphere = () =>{
    createSphere(0.5, 
        {
            x: (Math.random() -0.5) * 3,
            y: 3,
            z: (Math.random() -0.5) * 3,
        });
}


debugObject.createBox = () => {
    createBox(
        Math.random(),
        Math.random(), 
        Math.random(),
        {
            x: (Math.random() - 0.5) * 3,
            y: 3,
            z: (Math.random() - 0.5) * 3,
        }
    )
}

debugObject.reset = () =>{
    for (let index = 0; index < objectsToUpdate.length; index++) {
        const object = objectsToUpdate[index];
        
        // Remove body
        object.body.removeEventListener('collide', playHitSound);
        world.removeBody(object.body);

        // Remove mesh
        scene.remove(object.mesh);
    }

    // Empty array
    objectsToUpdate.splice(0, objectsToUpdate.length)
}


gui.add(debugObject, 'createSphere');
gui.add(debugObject, 'createBox');
gui.add(debugObject, 'reset');
/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
])

/**
 * Sound
 */

// js way of getting a sound
const hitSound = new Audio('/sounds/hit.mp3');
const playHitSound = (collision) =>{
    // check strength of collision
    if(collision.contact.getImpactVelocityAlongNormal() > 1.5){
        // random is 0-1 and volume is 0-1
        hitSound.volume = Math.random();
        hitSound.currentTime = 0;
        hitSound.play();

        // TODO If you want:
        //  - scale volume to impact
        //  - change pitch/something similar
        //  - Add very short delay before allowing another sound.
        //         eg: sometimes a box hitting the floor might trigger 4 sound plays.
    }
}



/**
 * Utils
 */
const objectsToUpdate = [];
const sphereGeometry = new THREE.SphereGeometry(0.5, 20, 20); 
const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3, 
    roughness: 0.4, 
    envMap: environmentMapTexture,
});

const createSphere = (radius, position) =>{
    // threejs sphere
    const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    
    mesh.castShadow = true;
    mesh.position.copy(position);
    scene.add(mesh);

    //cannon sphere
    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body({
        mass: 1, 
        position: new CANNON.Vec3(0, 0, 0),
        shape, 
        material: defaultMaterial,
    });
    
    body.position.copy(position);
    body.addEventListener('collide', playHitSound)
    world.addBody(body);

    objectsToUpdate.push({mesh, body});
}

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5,
})

const createBox = (width, height, depth, position) =>{
    // Mesh
    const mesh = new THREE.Mesh(boxGeometry, boxMaterial);
    mesh.scale.set(width, height, depth);
    mesh.castShadow = true;
    mesh.position.copy(position);
    scene.add(mesh);

    // Body
    const shape = new CANNON.Box(new CANNON.Vec3(width*0.5, height*0.5, depth*0.5));
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape: shape,
        material: defaultMaterial,
    });
    
    body.position.copy(position);
    body.addEventListener('collide', playHitSound)
    world.addBody(body);

    objectsToUpdate.push({mesh, body});
}




/**
 * Physics
 */

// World
const world = new CANNON.World();
// need to set gravity. Uses Vec3 (not Vector 3. Vec3 is CANNON's version).
world.gravity.set(0, -9.82, 0);

// Optimisations:
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;

// Physics material
// NOTE: We're using one material to simplify things. I've left the commented version with 2 materials so you can see how it's done.
// const concreteMaterial = new CANNON.Material('concrete'); 
// const plasticMaterial = new CANNON.Material('plastic'); 
const defaultMaterial = new CANNON.Material('default'); 

// this is what happens if two materials meet. things like if it bounces, friction, etc
// const concretePlasticContactMaterial = new CANNON.ContactMaterial(
const defaultContactMaterial = new CANNON.ContactMaterial(
    // provide two material that will have contact. The order does not matter
    // concreteMaterial,
    // plasticMaterial,
    defaultMaterial, 
    defaultMaterial,
    {
        friction: 0.1,
        // will bounce?
        restitution: 0.7,
    }
)

// world.addContactMaterial(concretePlasticContactMaterial);
world.addContactMaterial(defaultContactMaterial);
// This means that any object without a material will use this.
world.defaultContactMaterial = defaultContactMaterial;




// Floor
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
// floorBody.material = concreteMaterial;

// if mass is 0, it means it is static. Mass is 0 by default, so you don't have to specify this.
floorBody.mass = 0;
// you can add multplie shapes to a body. Think of the shape as a collider. If you wanted a snowman, you could add three spheres.
floorBody.addShape(floorShape);
/**
 * In CANNON, rotation has to happen via quaternion.
 * new CANNON.Vec3(-1, 0, 0) is the axis + direction you want to rotate.
 * Math.PI * 0.5 is what we're rotating the visible floor by (this would ideally be a variable.)
 */
floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1, 0, 0), 
    Math.PI * 0.5)

world.addBody(floorBody);



createSphere(0.5,{x: 0, y: 2, z: 0});
createBox(1, 1.5, 2, {x: 0, y: 3, z: 0});


/**
 * Physics end
 */




/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(- 3, 3, 3)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let prevTime = 0;

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - prevTime;
    prevTime = elapsedTime;

  
    for (let index = 0; index < objectsToUpdate.length; index++) {
        const element = objectsToUpdate[index];
        element.mesh.position.copy(element.body.position);
        element.mesh.quaternion.copy(element.body.quaternion);
    }

    // Update physics world. if applying any forces, do it before this
    // fixed time step, how much time passed since the last step, how many iterations can be applied to catch up with potential delay
    const fixedTimeStep = 1/60; // 60fps
    world.step(fixedTimeStep, deltaTime, 3)


    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

}

tick()