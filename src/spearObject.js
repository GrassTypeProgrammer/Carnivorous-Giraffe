import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { gameObject } from './gameObject';

/**
 * 
 * @param {'','geometry, meshMaterial, shape, physicsMaterial, radiusTop, radiusBottom, height, radialSegments, castShadow, position, quaternion, mass'} properties 
 * @returns 
 */

export function spearObject(world, scene, properties){
    const _gameObject = new gameObject(world, scene);
    _gameObject.Name = 'spearObject';


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




