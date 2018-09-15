import * as THREE from 'three';

/**
 * Creates a path for the planet.
 *
 * Applies a radius around the path of the planet in segments. 
 * 
 * @param  {Planet} planet A planet already created.
 * @return {Path}          A LineLoop placed on the path of the planet.
 */
export function createPath(planet) {
    var radius = Math.sqrt(Math.pow(planet.position.x, 2) + Math.pow(planet.position.y, 2)),
    segments = 64,
    material = new THREE.LineBasicMaterial( { color: 0xffffff } ),
    geometry = new THREE.CircleGeometry( radius, segments );
    // Remove center vertex
    geometry.vertices.shift();
    // To get a closed path use LineLoop instead (see also @jackrugile his comment):
    var path = new THREE.LineLoop( geometry, material );
    path.userData = {
        radius: radius
    };
    return path;
}

/**
 * Creates a random Planet based with a desired scale and importance.
 * 
 * @param  {Object}   item       General userData to help define actions associated with the planet.
 * @param  {Vector3d} scale      The scale of the planet
 * @param  {Vector3d} importance The level of importance of the planet.
 * @return {Planet}              A random planet
 */
export function createRandom(item, scale, importance) {
    var color = Math.random() * 0x808008 + 0x808080;
    var position = {
        x: importance,
        y: importance,
        z: 0,
    };
    var scale = {
        x: scale,
        y: scale,
        z: scale,
    };
    return create(
        item,
        Math.random() * 0x808008 + 0x808080,
        position,
        scale
    );
}

/**
 * Creates a Planet.
 * 
 * @param  {Object}   item     General userData to help define actions associated with the planet.
 * @param  {hex}      color    The color of the planet as a hexadecimal.
 * @param  {Vector3d} scale    The scale of the planet.
 * @param  {Vector3d} position The position of the planet.
 * @return {Planet}            A new planet.
 */
export function create(item, color, position, scale) {
    var geometry =new THREE.SphereGeometry( 10, 10, 10 );
    geometry.mergeVertices();
    var material = new THREE.MeshBasicMaterial({
        color: color,
    });
    var planet = new THREE.Mesh(geometry, material);
    planet.position.x = position.x;
    planet.position.y = position.y;
    planet.position.z = position.z;
    planet.scale.x = scale.x;
    planet.scale.y = scale.y;
    planet.scale.z = scale.z;
    planet.userData = {
        item: item,
        hoverColor: Math.random() * 0x808008 + 0x808080
    };

    return planet;
}