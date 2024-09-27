import * as THREE from 'three'
import * as CANNON from 'cannon-es'

// TODO Create a gameObjectManager that you can pass the world and scene into. That can handle all of the adding/updating.
//      you would also create objects via that.

export function createGameObject(world, scene){
    let _mesh;
    let _body;
    let _test = 'test'
    // const textureLoader = new THREE.TextureLoader()
    const cubeTextureLoader = new THREE.CubeTextureLoader()
    
    const environmentMapTexture = cubeTextureLoader.load([
        '/textures/environmentMaps/0/px.png',
        '/textures/environmentMaps/0/nx.png',
        '/textures/environmentMaps/0/py.png',
        '/textures/environmentMaps/0/ny.png',
        '/textures/environmentMaps/0/pz.png',
        '/textures/environmentMaps/0/nz.png'
    ])

    const sphereGeometry = new THREE.SphereGeometry(0.5, 20, 20); 
    const sphereMaterial = new THREE.MeshStandardMaterial({
        metalness: 0.3, 
        roughness: 0.4, 
        envMap: environmentMapTexture,
    });

    function createBox(){
        this._test = 'success'
    }


    // TODO: add an object with all the options, such as cast shadows, etc
    function createSphere(radius, position, material = undefined){
          // threejs sphere
        this._mesh = new THREE.Mesh(sphereGeometry, material? material : sphereMaterial);
        
        this._mesh.castShadow = true;
        this._mesh.position.copy(position);
        scene.add(this._mesh);

        //cannon sphere
        const shape = new CANNON.Sphere(radius);
        this._body = new CANNON.Body({
            mass: 1, 
            position: new CANNON.Vec3(0, 0, 0),
            shape, 
            // material: defaultMaterial,
        });
        
        this._body.position.copy(position);
        world.addBody(this._body);

        // objectsToUpdate.push({mesh, body});
    }

    function onDestroy(){

    }

    function update(){
        this._mesh.position.copy(this._body.position);
        this._mesh.quaternion.copy(this._body.quaternion);
    }

    return{
        _mesh, 
        _body, 
        _test,
        update,
        createSphere,
        createBox,
    }
}