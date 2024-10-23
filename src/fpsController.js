import * as THREE from 'three'


export const MovementMode = Object.freeze({
    NORMAL:   Symbol('normal'),
    ORBITAL:  Symbol('orbital'),
});

export function fpsController(camera, canvas, gui){
    camera.position.set(0, 0, 0);
    const _player = new THREE.Group();
   _player.add(camera);

// TODO: use these in lil-gui
    const _tweakables = {
        allowJump: false,
        jumpPower: 350,
        mass: 100,
        gravity: 9.8,
        straffeSpeed: 30,
        pointerSpeed: 1,
        movementSpeed: 10,
    }

    let canJump = false;
    let _moveForward = false;
    let _moveBackward = false;
    let _moveLeft = false;
    let _moveRight = false;
    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();
    let _target;
    let _prevPosition;
    let _enabled = true;
    let _locked = false;
    const _minPolarAngle = 0; // radians
    const _maxPolarAngle = Math.PI; // radians
    const _halfPI = Math.PI / 2;
    let _movementMode = MovementMode.NORMAL;

    const onKeyDown = function ( event ) {
        switch ( event.code ) {
            case 'ArrowUp':
            case 'KeyW':
                _moveForward = true;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                _moveLeft = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                _moveBackward = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                _moveRight = true;
                break;
            case 'Space':
                if ( canJump === true && _tweakables.allowJump === true ) 
                    {
                        velocity.y += _tweakables.jumpPower;
                    };
                canJump = false;
                break;
        }
    };

    const onKeyUp = function ( event ) {
        switch ( event.code ) {
            case 'ArrowUp':
            case 'KeyW':
                _moveForward = false;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                _moveLeft = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                _moveBackward = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                _moveRight = false;
                break;
        }
    };


    canvas.addEventListener( 'click', function () {
        lock();
    } );

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousemove', onMouseMove);




   

    const getForwardBackwardDirection = () => {
        let direction = new THREE.Vector3();

        if(_moveForward){
            const forward = getForward();
            forward.y = 0;
            direction.copy(forward);
        }
        else if(_moveBackward){
            const forward = getForward();
            forward.y = 0;
            direction.copy(forward.multiplyScalar(-1));
        }

        return direction;
    }

    const getSidewayDirection = () => {
        let direction = new THREE.Vector3();

        if(_moveRight){
            const right = getRight();
            right.y = 0;
            direction.copy(right);
        }
        else if(_moveLeft){
            const right = getRight();
            right.y = 0;
            direction.copy(right.multiplyScalar(-1));
        }

        return direction;
    }


    const NormalMovementControls = (deltaTime) => {
        const direction = new THREE.Vector3();

        direction.add(getForwardBackwardDirection());
        direction.add(getSidewayDirection());
        direction.normalize();

        const velocity = new THREE.Vector3().copy(direction).multiplyScalar(_tweakables.movementSpeed * deltaTime);
        
        _player.position.set(
            _prevPosition.x + velocity.x,
            _prevPosition.y,
            _prevPosition.z + velocity.z,
        )
    }

    const orbitalMovementControls = (deltaTime) => {
        const direction = new THREE.Vector3();

        direction.add(getForwardBackwardDirection());
        direction.add(getOrbitalSideDirection(deltaTime))

        direction.normalize();

        const velocity = new THREE.Vector3().copy(direction).multiplyScalar(_tweakables.movementSpeed * deltaTime);
        
        _player.position.set(
            _prevPosition.x + velocity.x,
            _prevPosition.y,
            _prevPosition.z + velocity.z,
        )

        orbitalCameraCorrection();
    }

    const getOrbitalSideDirection = (deltaTime) => {
        const directionModifier = Number( _moveLeft ) - Number( _moveRight );
        
        if(directionModifier == 0){
            return new THREE.Vector3();
        }

        // amount of movement that will occur
        const angle = Math.PI / 180 * directionModifier * deltaTime * _tweakables.straffeSpeed;
        const playerPos = _player.position.clone();
        const targetPos = _target.Body.position.clone();
        const relativePos = new THREE.Vector3().copy(playerPos).sub(targetPos);

        // using standard formula to figure out 2D rotation around an object.
        const newPos = new THREE.Vector3(
            relativePos.x * Math.cos(angle) - relativePos.z * Math.sin(angle) + targetPos.x,
            playerPos.y,
            relativePos.x * Math.sin(angle) + relativePos.z * Math.cos(angle) + targetPos.z,
        );

        // get the direction based on the new position and current position
        const direction = new THREE.Vector3().subVectors(newPos, playerPos).normalize();

        return direction;
    }

    const orbitalCameraCorrection = () => {
        const directionModifier = Number( _moveLeft ) - Number( _moveRight );
        
        const playerPos = _player.position.clone();
        const targetPos = _target.Body.position.clone();

        if(playerPos.equals(_prevPosition)){
            return;
        }

        // Maintain Y rotation
        const A = new THREE.Vector3(_prevPosition.x, 0, _prevPosition.z).sub(new THREE.Vector3(targetPos.x, 0, targetPos.z));
        const B = new THREE.Vector3(playerPos.x, 0, playerPos.z).sub(new THREE.Vector3(targetPos.x, 0, targetPos.z));
        let omega = Math.acos(A.dot(B)/(A.length() * B.length()));
        
        _player.rotation.set(
            // controls.getObject().rotation.x,
            0, 
            _player.rotation.y -= omega * directionModifier, 
            // controls.getObject().rotation.z,
            0,
        )
    }

    function onMouseMove( event ) {

        if ( _enabled === false || _locked === false ) return;
    
        const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
    
        const playerEuler = new THREE.Euler().setFromQuaternion(_player.quaternion);
        playerEuler.reorder('YXZ')
        playerEuler.y -= movementX * 0.002 * _tweakables.pointerSpeed;
     
        if(_movementMode == MovementMode.ORBITAL){
            playerEuler.y = Math.max( _halfPI - _maxPolarAngle, Math.min( _halfPI - _minPolarAngle, playerEuler.y ))
        }
     
        _player.quaternion.setFromEuler(playerEuler);
       

        const cameraEuler = new THREE.Euler().setFromQuaternion(camera.quaternion);
        cameraEuler.x -= movementY * 0.002 * _tweakables.pointerSpeed;
        cameraEuler.x = Math.max( _halfPI - _maxPolarAngle, Math.min( _halfPI - _minPolarAngle, cameraEuler.x ))
        camera.quaternion.setFromEuler(cameraEuler);
    }



    const update = (deltaTime) => {
        _prevPosition = _player.position.clone();

        if(_movementMode == MovementMode.NORMAL){
            NormalMovementControls(deltaTime);
        }
        else if(_movementMode == MovementMode.ORBITAL){
            orbitalMovementControls(deltaTime);
        }


        // _prevPosition = _player.position;

        // // raycaster.ray.origin.copy( controls.getObject().position );
        // // raycaster.ray.origin.y -= 1;

        // // const intersections = _tweakables.allowJump? raycaster.intersectObjects( objects, false ): [];

        // // const onObject = intersections.length > 0;

        // velocity.x += velocity.x * 10 * deltaTime;
        // velocity.z += velocity.z * 10 * deltaTime;
    
        // // velocity.y -= _tweakables.allowJump ? _tweakables.gravity * _tweakables.mass * deltaTime : 0; 
    
        // direction.z = Number( _moveBackward ) - Number( _moveForward);
        // direction.normalize(); 
    
        // if ( _moveForward || _moveBackward ) 
        // {
        //     velocity.z -= direction.z * _tweakables.mass * deltaTime;
        // }
       
        // if ( _moveLeft || _moveRight ) {
        //     // calculateSideDirection(deltaTime);
        // }

        // // if ( onObject === true && _tweakables.allowJump) {
        // //     velocity.y = Math.max( 0, velocity.y );
        // //     canJump = false;
        // // }
        // _player.position.set(
        //     _prevPosition.x - direction.x * 10,
        //     _prevPosition.y,
        //     _prevPosition.z - direction.z * 10,
        // )
        // // controls._moveRight( - velocity.x * deltaTime );
        // // controls._moveForward( - velocity.z * deltaTime );

        // // controls.getObject().position.y += ( velocity.y * deltaTime ); // new behavior
        
        // // if ( controls.getObject().position.y < 2 && _tweakables.allowJump ) {
        // //     velocity.y = 0;
        // //     controls.getObject().position.y = 2;
        // //     canJump = true;
        // // }


    }





    // Add debug
    const controlsGui = gui.addFolder('Controls');
    controlsGui.add(_tweakables, 'allowJump');
    controlsGui.add(_tweakables, 'jumpPower').min(0).max(500).step(1);
    controlsGui.add(_tweakables, 'mass').min(0).max(200).step(1);
    controlsGui.add(_tweakables, 'gravity').min(0).max(20).step(1);
    controlsGui.add(_tweakables, 'straffeSpeed').min(0).max(30).step(1);
    controlsGui.add(_tweakables, 'pointerSpeed').min(0).max(100).step(1);
    controlsGui.add(_tweakables, 'movementSpeed').min(0).max(100).step(1);




    const lock = () => {
		canvas.requestPointerLock();
        _locked = true;
	}

	const unlock = () => {
		canvas.ownerDocument.exitPointerLock();
        _locked = false;
	}

    // Getters/Setters
    const getTarget = () => {return _target}
    const setTarget = (value) => {_target = value}
    const getPlayer = () => {return _player}
    const setPosition = (position) => {_player.position.copy(position)}
    const getForward = () => {
        const forward = new THREE.Vector3(); 
        camera.getWorldDirection(forward); 
        return forward;
    }
    const getRight = () => {
        const forward = getForward(); 
        const up = new THREE.Vector3(0, 1, 0);
        const right = new THREE.Vector3().crossVectors(forward, up);
        return right;
    }

    return{
        update,

        // Getters/Setters
        getTarget,
        setTarget,
        getPlayer,
        setPosition,
        getForward,
    }
}