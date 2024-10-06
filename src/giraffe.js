import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { customGameObject } from './gameObject'

export function createGiraffe(world, scene){
    let _gameObject;

    const bodySize = {x:2.5, y:2.5, z:5};
    const bodyPosition = {x:0, y:4, z:0};

    const neckSize = {x:1, y:5, z:1};
    const neckPosition = {x:0, y:7.5, z:2};

    const headSize = {x:1.5, y:1.5, z:2};
    const headPosition = {x:0, y:10, z:2.5};

    const legSize = {x:1, y:3, z:1};
    const legPositions = [
        {x:0.75, y:1.25, z:2},
        {x:-0.75, y:1.25, z:2},
        {x:0.75, y:1.25, z:-2},
        {x:-0.75, y:1.25, z:-2},
    ];


    const createMesh = () => {
        const mesh = new THREE.Group();
        const meshMaterial = new THREE.MeshStandardMaterial({color: '#c78f5b'});
        
         /** Body */
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(bodySize.x, bodySize.y, bodySize.z),
            meshMaterial,
        );
        mesh.add(body);
        body.position.set(bodyPosition.x, bodyPosition.y, bodyPosition.z);

     
        /** Neck */
        const neckMesh = new THREE.Mesh(
            new THREE.BoxGeometry(neckSize.x, neckSize.y, neckSize.z),
            meshMaterial,
        );
        mesh.add(neckMesh);
        neckMesh.position.set(neckPosition.x, neckPosition.y, neckPosition.z);
     
        /** Head */
        const headMesh = new THREE.Mesh(
            new THREE.BoxGeometry(headSize.x, headSize.y, headSize.z),
            meshMaterial,
        );
        mesh.add(headMesh);
        headMesh.position.set(headPosition.x, headPosition.y, headPosition.z);
     

        /** Legs */
        const legs = [];

        for (let index = 0; index < 4; index++) {
            legs.push(new THREE.Mesh(
                new THREE.BoxGeometry(legSize.x, legSize.y, legSize.z),
                meshMaterial,
            ));

            mesh.add(legs[index]);
        }
        
        legs[0].position.set(legPositions[0].x, legPositions[0].y, legPositions[0].z);
        legs[1].position.set(legPositions[1].x, legPositions[1].y, legPositions[1].z);
        legs[2].position.set(legPositions[2].x, legPositions[2].y, legPositions[2].z);
        legs[3].position.set(legPositions[3].x, legPositions[3].y, legPositions[3].z);

        return mesh;
    }

    const createBody = () => {
        const body = new CANNON.Body({
            mass: 0,
        });

        /** Body */
        // Physics Body
        const bodyShape =  new CANNON.Box(new CANNON.Vec3(bodySize.x/2, bodySize.y/2, bodySize.z/2));
        body.addShape(bodyShape, new CANNON.Vec3(bodyPosition.x, bodyPosition.y, bodyPosition.z));

        /** Neck */
        // Physics Body
        const neckShape =  new CANNON.Box(new CANNON.Vec3(neckSize.x/2, neckSize.y/2, neckSize.z/2));
        body.addShape(neckShape, new CANNON.Vec3(neckPosition.x, neckPosition.y, neckPosition.z));

        /** Head */
        // Physics Body
        const headShape =  new CANNON.Box(new CANNON.Vec3(headSize.x/2, headSize.y/2, headSize.z/2));
        body.addShape(headShape, new CANNON.Vec3(headPosition.x, headPosition.y, headPosition.z));


        /** Legs */
        // Physics Body
        const legsShapes = [];

        for (let index = 0; index < 4; index++) {
            legsShapes.push(new CANNON.Box(new CANNON.Vec3(legSize.x/2, legSize.y/2, legSize.z/2)));
        }

        body.addShape(legsShapes[0], new CANNON.Vec3(legPositions[0].x, legPositions[0].y, legPositions[0].z));
        body.addShape(legsShapes[1], new CANNON.Vec3(legPositions[1].x, legPositions[1].y, legPositions[1].z));
        body.addShape(legsShapes[2], new CANNON.Vec3(legPositions[2].x, legPositions[2].y, legPositions[2].z));
        body.addShape(legsShapes[3], new CANNON.Vec3(legPositions[3].x, legPositions[3].y, legPositions[3].z));

        return body;
    }

    const update = () => {
        _gameObject.update();
    }

    const damage = () => {
        console.log('hit');
    }


    const init = () => {
        
        const properties = {
            mesh: createMesh(),
            body: createBody(),
        }
        
        _gameObject = new customGameObject(world, scene, properties);
        _gameObject.Name = 'Giraffe';
        _gameObject.Body.addEventListener('collide', onCollision)

        // TODO: Make an entity factory function that giraffe will inherit from. That will contain the damage function
        _gameObject.Body.parent = _gameObject;
        _gameObject.damage = damage;
    }


    init();

    return {
        update,
        damage,
    }
}