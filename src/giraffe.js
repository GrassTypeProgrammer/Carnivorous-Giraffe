import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { customGameObject } from './gameObject'
import { createEntity } from './entity';
import { ObjectTag } from './objectConfig';

export function createGiraffe(world, scene){
    const _tag = ObjectTag.GIRAFFE;
    let _gameObject;
    let _entity;
    const _spears = [];

    // AI variables
    let _target;
    const _speed = 0.01;

    // Body/Mesh variables
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
            type: CANNON.BODY_TYPES.KINEMATIC
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
        movement();
        rotate();
        _gameObject.update();
    }

    const movement = () =>{
        if(_target){
            // TODO make this take the current position of the target, the lerp towards that position. You can add in the 
            //      ease in/out functions or whatever to make it feel more like a lurch/charge.
            //      You may end up using the greensock libary.
            let direction = new THREE.Vector3().copy(_target.position).sub(_gameObject.Body.position).normalize();
            direction.y = 0;
            const velocity = new THREE.Vector3().copy(direction).multiplyScalar(_speed);
            const newPos = new THREE.Vector3().copy(_gameObject.Body.position).add(velocity);
            _gameObject.Body.position.set(newPos.x, newPos.y, newPos.z);
        }
    }

    const rotate = () =>{
        if(_target){
            const angle = (Math.PI / 180) * 0.1;
            const current = _gameObject.Body.quaternion;
            const rot = new CANNON.Quaternion();
            rot.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), angle);
            current.mult(rot, current);
            _gameObject.Body.quaternion.copy(current);
        }
    }

    const addSpearToGiraffe = (spearMesh, position, quaternion) => {
        _spears.push(spearMesh);
        _gameObject.Mesh.add(spearMesh);
        
        // position
        const localPosition = _gameObject.Mesh.worldToLocal(position);
        spearMesh.position.set(localPosition.x, localPosition.y, localPosition.z);

        // rotation 
        // (converting a world quaternion to local space)
        // The world quaternion that we want in local space
        const worldQuaternion = quaternion;
        // Get the inverse of the parent's quaternion
        const inverseLocalQuaternion = new THREE.Quaternion().copy(_gameObject.Mesh.quaternion).invert();

        /**  
         * Multiplying two quaternions has the same effect that adding two vectors together has. 
         * By multiplying the target quaternion by the parent's inverse quaternion, you're removing the parent's rotation 
         *      from the equation. This allows the child's local rotation to be the same as the target (world) quaternion.
         */
        const localQuaternion = new THREE.Quaternion().multiplyQuaternions(inverseLocalQuaternion, worldQuaternion);
        spearMesh.quaternion.copy(localQuaternion);
    }

    const init = () => {
        
        const properties = {
            mesh: createMesh(),
            body: createBody(),
        }
        
        _gameObject = new customGameObject(world, scene, properties);
        _gameObject.Name = 'Giraffe';

        // TODO: Make an entity factory function that giraffe will inherit from. That will contain the damage function
        _gameObject.Body.parent = _gameObject;
        _entity = new createEntity();
        _entity.init();
        _gameObject.damage = _entity.damage;
        _gameObject.addSpearToGiraffe = addSpearToGiraffe;

        _gameObject.Tag = _tag;
        _entity.Tag = _tag;
    }

    // Getters/Setters
    const getTarget = () => {return _target}
    const setTarget = (value) => {_target = value}


    init();
    
    return Object.assign({}, _entity, {
        update,
        get Tag() {return _tag},
        set Tag(value) {_tag = value},
        getTarget, 
        setTarget,
        addSpearToGiraffe,
    })
}