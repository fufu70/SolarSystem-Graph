import * as THREE from 'three';
import OrbitControls from './OrbitControls';
import WindowResize from './WindowResize';
import * as Planet from './Planet';

var _container, _planets, _camera, _scene, _renderer, _group, _revolving_planets, _raycaster, _mouse, INTERSECTED, SCREEN_WIDTH, SCREEN_HEIGHT, MAX_RADIUS;
var MAX_SIZE = { x: 20, y: 20, z: 20};
var MAX_RADIUS = 4000;
var MIN_RADIUS = 500;

function init(container, planets) {
    _container = container;
    _planets = planets;
    _scene = new THREE.Scene();
    _camera = createCamera(_scene);
    _renderer = createRenderer(_container);
    WindowResize(_renderer, _camera);
    window.controls = new OrbitControls( _camera, _renderer.domElement );

    renderScene();
    setupRaycasting();

    animate();
}

function createCamera(_scene) {
    SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
    var camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
    _scene.add(camera);
    camera.position.set(0,0,10000);
    camera.lookAt(_scene.position);
    return camera;
}

function createRenderer(container) {
    var renderer = new THREE.WebGLRenderer( {antialias:true} );
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    container.appendChild( renderer.domElement );
    return renderer;
}

function renderScene()
{
    _group = new THREE.Object3D();
    _revolving_planets = [];
    var planet, circle, planet_group;
    for ( var i = 0; i < _planets.length; i++ ) {


        planet = Planet.createRandom(
            _planets[i], 
            ((_planets[i].scale) ? _planets[i].scale : Math.random()) * MAX_SIZE.x, 
            (((_planets[i].importance) ? _planets[i].importance : Math.random()) * MAX_RADIUS) + MIN_RADIUS
        );
        circle = Planet.createPath( planet );
        planet_group = new THREE.Object3D();
        planet_group.add( planet );
        planet_group.add( circle );
        _group.add(planet_group);
        _revolving_planets.push(planet_group);
    }

    // add current item to center
    _group.add( Planet.create({}, 0xffff00, { x: 0, y: 0, z: 0}, MAX_SIZE) );

    _scene.add( _group );
    MAX_RADIUS = undefined;
}

function setupRaycasting() {
    _raycaster = new THREE.Raycaster();
    _mouse = new THREE.Vector2();

    // add Event Listener for _mouse vector
    document.addEventListener('mousemove', function() {
        _mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        _mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }, false);

    // add event listener for handling click events on the particle
    document.addEventListener('mouseup', function(event) {
        event.preventDefault();
        var intersects = getPlanetIntersections();
        if (intersects.length > 0) {
            //get a link from the userData object
            if (typeof(intersects[0].object.userData.item.onClick) == "function") {
                intersects[0].object.userData.item.onClick();
            }
        }
    }, false);
}

function handleMouseHover() {
    
    var intersects = getPlanetIntersections();
    //count and look after all objects in the diamonds _group
    if (intersects.length > 0) {
        if (INTERSECTED != intersects[0].object && intersects[0].object.userData.item !== undefined) {
            if (INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
            INTERSECTED = intersects[0].object;
            INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
            //setting up new material on hover
            INTERSECTED.material.color.setHex(INTERSECTED.userData.hoverColor);
            if (typeof(INTERSECTED.userData.item.onHover) == "function") {
                INTERSECTED.userData.item.onHover();
            }
        }
    } else {
        if (INTERSECTED) INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
        INTERSECTED = null;
    }
}

function getPlanetIntersections() {
    _raycaster.setFromCamera(_mouse, _camera);
    // calculate objects intersecting the picking ray
    var intersects = [];
    for (var i = 0; i < _revolving_planets.length; i ++) {
        var intersections = _raycaster.intersectObjects(_revolving_planets[i].children);
        for (var j = 0; j < intersections.length; j ++) {
            intersects.push(intersections[j]);
        }
    }
    return intersects;
}

function animate() {
    window.controls.update();
    animatePlanets();
    //update _raycaster with _mouse movement  
    handleMouseHover();

    requestAnimationFrame( animate );
    _renderer.render( _scene, _camera );
}

/**
 * Updates the speed of the planets if they are not being hovered on.
 */
function animatePlanets() {
    var speed;
    for (var i = 0; i < _revolving_planets.length; i ++) {
        if (INTERSECTED == null
            || INTERSECTED.userData.item.id !== _revolving_planets[i].children[0].userData.item.id) {
            _revolving_planets[i].rotation.z += calculatePlanetSpeed(_revolving_planets[i].children[1].userData.radius);
        }
    }
}

/**
 * Calculates the planets speed by the current radius of the planet around the center.
 * 
 * @param  {float} radius The radius of the planet.
 * @return {float}        The speed of the planet
 */
function calculatePlanetSpeed(radius) {
    if (MAX_RADIUS == undefined)
        MAX_RADIUS = calculateMaxRadius();
    return ((MAX_RADIUS - radius) / 90000) + 0.001;
}

/**
 * Calculates the current max radius of the revolving planets.
 * 
 * @return {float} The max radius.
 */
function calculateMaxRadius() {
    var maxRadius = 0;
    for (var i = 0; i < _revolving_planets.length; i ++) {
        if (maxRadius < _revolving_planets[i].children[1].userData.radius) {
            maxRadius = _revolving_planets[i].children[1].userData.radius;
        }
    }

    return maxRadius;
}

export default init