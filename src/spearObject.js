import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { gameObject } from './gameObject';
import { ObjectTag } from './objectConfig';

/**
 * 
 * @param {'','geometry, meshMaterial, shape, physicsMaterial, radiusTop, radiusBottom, height, radialSegments, castShadow, position, quaternion, mass'} properties 
 * @returns 
 */

export function spearObject(world, scene, properties){
    const _tag = ObjectTag.SPEAR;
    const _gameObject = new gameObject(world, scene);
    _gameObject.Tag = _tag
    _gameObject.Name = 'Spear';
    let _collided = false;

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
        _gameObject.Body.addEventListener('collide', onCollision);
        _gameObject.Body.parent = _gameObject;
         world.addBody(_gameObject.Body);
    }

    const onCollision = (collision) => {
        if(_collided){
            return;
        }
        
        _collided = true;
        const object = collision.body.parent ? collision.body.parent: collision.body;
        if(object != undefined && object.Tag != ObjectTag.SPEAR){
            _gameObject.Body.mass = 0;
            _gameObject.Body.type = CANNON.BODY_TYPES.STATIC;
           
            //TODO: try to get the spear to hang here with a constraint
            if(object.Tag == ObjectTag.GIRAFFE){
                // _gameObject.Body.velocity.copy(new THREE.Vector3(0, 0, 0));
                // _gameObject.Body.angularVelocity.copy(new THREE.Vector3(0, 0, 0));
                object.damage(10);
            }
        }
    }

    init();

    return Object.assign({}, _gameObject, {
        get Tag() {return _tag},
        set Tag(value) {_tag = value},
    });
}




