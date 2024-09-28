import * as THREE from 'three'
import * as CANNON from 'cannon-es'

// TODO Create a gameObjectManager that you can pass the world and scene into. That can handle all of the adding/updating.
//      you would also create objects via that.

// TODO have a base 'class' that these can inherit from, so that you have base game object, then sphere and cube game objects, 
//      rather than having them as one factory function 
export function createGameObject(world, scene){
    let _mesh;
    let _body;
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

    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const boxMaterial = new THREE.MeshStandardMaterial({
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5,
    })
    

    function createBox(width, height, depth, position){
         // Mesh
        this._mesh = new THREE.Mesh(boxGeometry, boxMaterial);
        this._mesh.scale.set(width, height, depth);
        this._mesh.castShadow = true;
        this._mesh.position.copy(position);
        scene.add(this._mesh);
        
        this._mesh.position.copy(position);
        scene.add(this._mesh);
     
         // Body
         const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5));
         this._body = new CANNON.Body({
             mass: 1,
             position: new CANNON.Vec3(0, 3, 0),
             shape: shape,
            //  material: defaultMaterial,
         });
         this._body.position.copy(position);
        //  this._body.addEventListener('collide', playHitSound)
         world.addBody(this._body);
     
    }
  
    function createSpear(){
         // Mesh
         //  this._mesh = new THREE.Mesh(boxGeometry, boxMaterial);
         //  this._mesh.scale.set(width, height, depth);
         //  this._mesh.castShadow = true;
         //  this._mesh.position.copy(position);
         //  scene.add(this._mesh);
         
         
         this._mesh = new THREE.Group();
         const mesh = new THREE.Mesh(boxGeometry, boxMaterial);
         mesh.scale.set(width, height, depth);
         mesh.castShadow = true;
         this._mesh.add(mesh);
         
         const mesh2 = new THREE.Mesh(boxGeometry, boxMaterial);
         mesh2.scale.set(width, height, depth);
         mesh2.castShadow = true;
         this._mesh.add(mesh2);
         mesh2.position.set(0, 1, -2);
         // const mesh2 = new THREE.Mesh(boxGeometry, boxMaterial);
         // this._mesh.add(mesh2);
         // mesh2.position.set(new THREE.Vector3(0, 1, 0));
         
         this._mesh.position.copy(position);
         scene.add(this._mesh);
      
          // Body
          const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5));
          this._body = new CANNON.Body({
              mass: 1,
              position: new CANNON.Vec3(0, 3, 0),
              shape: shape,
             //  material: defaultMaterial,
          });
          this._body.addShape(shape, new CANNON.Vec3(0, 1, -2))
          this._body.position.copy(position);
         //  this._body.addEventListener('collide', playHitSound)
          world.addBody(this._body);
      
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

    function destroy(){
        // TODO: Remove all listeners

        console.log('Destroyed GameObject')
        // Remove mesh
        scene.remove(this._mesh);

        // Remove Body
        world.removeBody(this._body);
    }

    function update(){
        this._mesh.position.copy(this._body.position);
        this._mesh.quaternion.copy(this._body.quaternion);
    }

    function setQuaternion(quaternion){
        this._body.quaternion.copy(quaternion);
        this._mesh.quaternion.copy(quaternion);
    }

    return{
        _mesh, 
        _body, 
        update,
        createSphere,
        createBox,
        destroy,
        setQuaternion,
    }
}