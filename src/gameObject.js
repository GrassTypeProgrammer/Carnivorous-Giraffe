import * as THREE from 'three'
import * as CANNON from 'cannon-es'

// TODO Create a gameObjectManager that you can pass the world and scene into. That can handle all of the adding/updating.
//      you would also create objects via that.



export function gameObject(world, scene){
    const _isGameObject = true;
    let _name = 'gameObject';
    let _mesh;
    let _body;

    const print = () => {
        console.log(_name);    
    }

    const update = () => {
        if(_mesh && _body){
            _mesh.position.copy(_body.position);
            _mesh.quaternion.copy(_body.quaternion);
        }
    }

    const destroy = () => {
        // TODO: Remove all listeners

        // Remove mesh
        scene.remove(_mesh);

        // Remove Body
        world.removeBody(_body);
    }

    const init = () => {
        console.log('init');
    }

    // TODO: Add an init function here to be inherited/used.

    return {
        print,
        update,
        destroy,

        get Name() { return _name},
        set Name(name){ _name = name},
        get Mesh() { return _mesh},
        set Mesh(mesh){ _mesh = mesh},
        get Body() { return _body},
        set Body(body){ _body = body},
        get IsGameObject(){return _isGameObject},
    };
    
}


export function customGameObject(world, scene, properties){
    const _gameObject = gameObject(world, scene);
    _gameObject.Name = properties.Name ?? 'customObject';


    const init = () => {
        // Mesh
        if(properties.mesh != undefined){
            _gameObject.Mesh = properties.mesh;
        }
        else{
            // If no mesh provided, fallback on sphere mesh.
            // Make material/geomtery
            const geometry = properties.geometry ?? new THREE.SphereGeometry(0.5, 20, 20); 
            const meshMaterial = properties.meshMaterial ?? new THREE.MeshStandardMaterial({
                metalness: 0.3, 
                roughness: 0.4, 
                // TODO: Set color to bright pink so it's clear this shouldn't be here.
            });
    
            // Create Mesh
            _gameObject.Mesh = new THREE.Mesh(geometry, meshMaterial);
            _gameObject.Mesh.castShadow = properties.castShadow ?? false;
            _gameObject.Mesh.position.copy(properties.position ?? new THREE.Vector3(0, 0, 0));

            console.warn('No mesh provided for customGameObject');
        }

        scene.add(_gameObject.Mesh);

        // Body
        if(properties.body != undefined){
            _gameObject.Body = properties.body;
        }
        else{
            // If no body is provided, fall back on sphere
            const shape = properties.shape ?? new CANNON.Sphere(properties.radius);
            _gameObject.Body = new CANNON.Body({
                shape, 
                mass: properties.mass ?? 1, 
                position: properties.position,
                quaternion: properties.quaternion,
                material: properties.physicsMaterial,
            });

            console.warn('No body provided for customGameObject');
        }
        
        world.addBody(_gameObject.Body);
    }

    init();

    return Object.assign({}, _gameObject, {

    });
}


/**
 * 
 * @param {'','geometry, meshMaterial, shape, physicsMaterial, radius, castShadow, position, quaternion, mass'} properties 
 * @returns 
 */

export function sphereObject(world, scene, properties){
    const _gameObject = gameObject(world, scene);
    _gameObject.Name = 'sphereObject';

    const init = () => {
        // Make material/geomtery
        const sphereGeometry = properties.geometry ?? new THREE.SphereGeometry(0.5, 20, 20); 
        const sphereMaterial = properties.meshMaterial ?? new THREE.MeshStandardMaterial({
            metalness: 0.3, 
            roughness: 0.4, 
        });


        // Create Mesh
        _gameObject.Mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        _gameObject.Mesh.castShadow = properties.castShadow ?? false;
        _gameObject.Mesh.position.copy(properties.position ?? new THREE.Vector3(0, 0, 0));
        scene.add(_gameObject.Mesh);

        // Create Body
        const shape = properties.shape ?? new CANNON.Sphere(properties.radius);
        _gameObject.Body = new CANNON.Body({
            shape, 
            mass: properties.mass ?? 1, 
            position: properties.position,
            quaternion: properties.quaternion,
            material: properties.physicsMaterial,
        });
        
        world.addBody(_gameObject.Body);
    }

    init();

    return Object.assign({}, _gameObject, {

    });
}









/**
 * 
 * @param {'','geometry, meshMaterial, shape, physicsMaterial, width, height, depth, castShadow, position, quaternion, mass'} properties 
 * @returns 
 */

export function boxObject(world, scene, properties){
    const _gameObject = gameObject(world, scene);
    _gameObject.Name = 'cubeObject';


    const init = () => {
        // Make material/geomtery
        const boxGeometry = properties.geometry ?? new THREE.BoxGeometry(
            properties.width ?? 1,
            properties.height ?? 1,
            properties.depth ?? 1
        );
        const boxMaterial = properties. meshMaterial ?? new THREE.MeshStandardMaterial({
            metalness: 0.3,
            roughness: 0.4,
        });
        console.log('init override')

        // Mesh 
        _gameObject.Mesh = new THREE.Mesh(boxGeometry, boxMaterial);
        _gameObject.Mesh.castShadow = properties.castShadow ?? false;
        _gameObject.Mesh.position.copy(properties.position ?? new THREE.Vector3(0, 0, 0));
        scene.add(_gameObject.Mesh);
        
         // Body
        const shape = new CANNON.Box(new CANNON.Vec3(
            (properties.width ?? 1) * 0.5, 
            (properties.height ?? 1) * 0.5, 
            (properties.depth ?? 1) * 0.5
        ));

        _gameObject.Body = new CANNON.Body({
            shape, 
            mass: properties.mass ?? 1, 
            position: properties.position,
            quaternion: properties.quaternion,
            material: properties.physicsMaterial,
        });
        //  this._body.addEventListener('collide', playHitSound)
         world.addBody(_gameObject.Body);
    }

    init();

    return Object.assign({}, _gameObject, {
    });
}






/**
 * 
 * @param {'','geometry, meshMaterial, shape, physicsMaterial, radiusTop, radiusBottom, height, radialSegments, castShadow, position, quaternion, mass'} properties 
 * @returns 
 */

export function cylinderObject(world, scene, properties){
    const _gameObject = gameObject(world, scene);
    _gameObject.Name = 'cubeObject';


    const init = () => {
         // Make material
        const cylinderGeometry = properties.geometry ?? new THREE.CylinderGeometry(
            properties.radiusTop ?? 1,
            properties.radiusBottom ?? 1,
            properties.height ?? 1,
            properties.radialSegments ?? 1,
        );
        const material = properties. meshMaterial ?? new THREE.MeshStandardMaterial({
            metalness: 0.3,
            roughness: 0.4,
        });

        // Mesh 
        _gameObject.Mesh = new THREE.Mesh(cylinderGeometry, material);
        _gameObject.Mesh.castShadow = properties.castShadow ?? false;
        _gameObject.Mesh.position.copy(properties.position ?? new THREE.Vector3(0, 0, 0));
        scene.add(_gameObject.Mesh);
        
         // Body
        const shape = new CANNON.Cylinder(
            properties.radiusTop ?? 1,
            properties.radiusBottom ?? 1,
            properties.height ?? 1,
            properties.radialSegments ?? 1,
        );

        _gameObject.Body = new CANNON.Body({
            shape, 
            mass: properties.mass ?? 1, 
            position: properties.position,
            quaternion: properties.quaternion,
            material: properties.physicsMaterial,
        });
        //  this._body.addEventListener('collide', playHitSound)
        world.addBody(_gameObject.Body);
    }

    init();

    return Object.assign({}, _gameObject, {
    });
}




