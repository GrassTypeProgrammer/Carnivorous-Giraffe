import * as THREE from 'three'
import {  PointerLockControls } from 'three/examples/jsm/Addons.js';


export function fpsControls(camera, canvas, gui){
   
    const controls = new PointerLockControls(camera, canvas);
    canvas.addEventListener( 'click', function () {

        controls.lock();

    } );

    const debugObject = {
        // Allows player to use jump control
        allowJump: false,
        jumpPower: 350,
        mass: 100,
        gravity: 9.8,
        straffeSpeed: 10,
    }

 // tells the code if the controller is on the ground, thus able to jump
    let canJump = false;
    const objects = [];
    let raycaster;
    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;
    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();
    let _target;

    const onKeyDown = function ( event ) {

        switch ( event.code ) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = true;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = true;
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = true;
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = true;
                break;

            case 'Space':
                if ( canJump === true && debugObject.allowJump === true ) 
                    {
                        velocity.y += debugObject.jumpPower;
                    };
                canJump = false;
                break;
        }
    };

    const onKeyUp = function ( event ) {
        switch ( event.code ) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = false;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = false;
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = false;
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = false;
                break;
        }
    };

    document.addEventListener( 'keydown', onKeyDown );
    document.addEventListener( 'keyup', onKeyUp );

    raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 1 );



    function onUpdate(deltaTime){
        raycaster.ray.origin.copy( controls.getObject().position );
        raycaster.ray.origin.y -= 1;

        const intersections = debugObject.allowJump? raycaster.intersectObjects( objects, false ): [];

        const onObject = intersections.length > 0;

        velocity.x -= velocity.x * 10.0 * deltaTime;
        velocity.z -= velocity.z * 10.0 * deltaTime;
    
        velocity.y -= debugObject.allowJump ? debugObject.gravity * debugObject.mass * deltaTime : 0; 
    
        direction.z = Number( moveForward ) - Number( moveBackward );
        direction.normalize(); // this ensures consistent movements in all directions
    
        if ( moveForward || moveBackward ) 
            velocity.z -= direction.z * debugObject.mass * deltaTime;
       
        if ( moveLeft || moveRight ) {
            calculateSideDirection(deltaTime);
        }

        if ( onObject === true && debugObject.allowJump) {
            velocity.y = Math.max( 0, velocity.y );
            canJump = false;
        }
        
        controls.moveRight( - velocity.x * deltaTime );
        controls.moveForward( - velocity.z * deltaTime );

        controls.getObject().position.y += ( velocity.y * deltaTime ); // new behavior
        if ( controls.getObject().position.y < 2 && debugObject.allowJump ) {
            velocity.y = 0;
            controls.getObject().position.y = 2;
            canJump = true;
        }
    }

    function calculateSideDirection(deltaTime){
        const directionModifier = Number( moveLeft ) - Number( moveRight );
        
        // amount of movement that will occur
        const angle = Math.PI / 180 * directionModifier * deltaTime * debugObject.straffeSpeed;
        const cameraPos = controls.getObject().position.clone();
        const targetPos = _target.Body.position.clone();
        const relativePos = new THREE.Vector3().copy(cameraPos).sub(targetPos);
        
        // using standard formula to figure out 2D rotation around an object
        const newPos = new THREE.Vector3(
            relativePos.x * Math.cos(angle) - relativePos.z * Math.sin(angle),
            cameraPos.y,
            relativePos.x * Math.sin(angle) + relativePos.z * Math.cos(angle),
        );

        controls.getObject().position.set(newPos.x, newPos.y, newPos.z);
    }


    // Add debug
    const controlsGui = gui.addFolder('Controls');
    controlsGui.add(debugObject, 'allowJump');
    controlsGui.add(debugObject, 'jumpPower').min(0).max(500).step(1);
    controlsGui.add(debugObject, 'mass').min(0).max(200).step(1);
    controlsGui.add(debugObject, 'gravity').min(0).max(20).step(1);
    controlsGui.add(debugObject, 'straffeSpeed').min(0).max(20).step(1);


     // Getters/Setters
     const getTarget = () => {return _target}
     const setTarget = (value) => {_target = value}

    return{
        controls,
        onUpdate,
        getTarget,
        setTarget
    }
}