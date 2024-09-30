import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { customGameObject } from './gameObject'

export function createGiraffe(world, scene){
    let _gameObject;


    /**
     * TODO: 
     *      - The mesh and body aren't aligned. It's something to do with using the customGameObject, because they seemed 
     *             to be aligned before using that. Maybe it's the mesh group and body objects? maybe they're not aligned?
     *              Maybe the body is just a quarter turn out of sync? Maybe cannon x is threejs z?
     *      - Take all the size and position values and make them constant variables so they're not duplicated for both mesh 
     *          and body.
     *  
     * 
     */




    const createMesh = () => {
        const mesh = new THREE.Group();
        const meshMaterial = new THREE.MeshStandardMaterial({color: '#c78f5b'});
        
         /** Body */
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 2.5, 5),
            meshMaterial,
        );
        mesh.add(body);
        body.position.set(0, 3, 0);

     
        /** Neck */
        const neckMesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 4, 1),
            meshMaterial,
        );
        mesh.add(neckMesh);
        neckMesh.position.set(0, 6, 2);
     
        /** Head */
        const headMesh = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 1.5, 2),
            meshMaterial,
        );
        mesh.add(headMesh);
        headMesh.position.set(0, 8, 2.5);
     

        /** Legs */
        const legs = [];

        for (let index = 0; index < 4; index++) {
            legs.push(new THREE.Mesh(
                new THREE.BoxGeometry(1, 3, 1),
                meshMaterial,
            ));

            mesh.add(legs[index]);
        }
        
        legs[0].position.set(0.75, 0.25, 2);
        legs[1].position.set(-0.75, 0.25, 2);
        legs[2].position.set(0.75, 0.25, -2);
        legs[3].position.set(-0.75, 0.25, -2);

        return mesh;
    }

    const createBody = () => {
        const body = new CANNON.Body({
            mass: 100,
        });

        /** Body */
        // Physics Body
        const bodyShape =  new CANNON.Box(new CANNON.Vec3(2.5, 2.5, 5));
        body.addShape(bodyShape, new CANNON.Vec3(0, 3, 0));

        /** Neck */
        // Physics Body
        const neckShape =  new CANNON.Box(new CANNON.Vec3(1, 4, 1));
        body.addShape(neckShape, new CANNON.Vec3(0, 6, 2));

        /** Head */
        // Physics Body
        const headShape =  new CANNON.Box(new CANNON.Vec3(1.5, 1.5, 2));
        body.addShape(headShape, new CANNON.Vec3(0, 8, 2.5));


        /** Legs */
        // Physics Body
        const legsShapes = [];

        for (let index = 0; index < 4; index++) {
            legsShapes.push(new CANNON.Box(new CANNON.Vec3(1.5, 1.5, 2)));
        }

        body.addShape(legsShapes[0], new CANNON.Vec3(0.75, 0.25, 2));
        body.addShape(legsShapes[1], new CANNON.Vec3(-0.75, 0.25, 2));
        body.addShape(legsShapes[2], new CANNON.Vec3(0.75, 0.25, -2));
        body.addShape(legsShapes[3], new CANNON.Vec3(-0.75, 0.25, -2));

        return body;
    }




    const init = () => {
        console.log('giraffe');

        const properties = {
            mesh: createMesh(),
            body: createBody(),
        }

        _gameObject = new customGameObject(world, scene, properties);
    }

    init();

    return {

    }
}