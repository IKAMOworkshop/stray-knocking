import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import CANNON from 'cannon'


/**
 * Base
 */
// Debug
const gui = new GUI()
const debugObject = {}
debugObject.progress = 0
gui.add(debugObject, 'progress').min(0).max(1).step(.1)

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

// Physics
const world = new CANNON.World()
world.gravity.set(0, 0, 0)

const concreteMaterial = new CANNON.Material('concrete')
const plasticMaterial = new CANNON.Material('plastic')

const concretePlasticContactMaterial = new CANNON.ContactMaterial(
    concreteMaterial,
    plasticMaterial,
    {
        friction: 0.1,
        restitution: 0.7
    }
)
world.addContactMaterial(concretePlasticContactMaterial)

// Mesh
// Geometry
const geometry = new THREE.BoxGeometry(.5, .5, .5)

// Material
const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
})

const range = 1.5
const bodyNumber = 10
const bodies = []

for(let i = 0 ; i < bodyNumber ; i++){
    let x = Math.random() * range - range * 0.5
    let y = Math.random() * range - range * 0.5 + 0
    let z = Math.random() * range - range * 0.5

    let position = new THREE.Vector3(x, y, z)

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(position)
    mesh.position.copy(position)

    // Rigid Body
    const boxShape = new CANNON.Box(new CANNON.Vec3(.25, .25, .25))

    const boxBody = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 0, 0),
        shape: boxShape,
        material: concreteMaterial,
    })
    boxBody.position.copy(position)
    world.addBody(boxBody)

    bodies.push({mesh, boxBody})
    scene.add(mesh)
}

// Mouse ball
const ballGeometry = new THREE.SphereGeometry(.2)
const ballMaterial = new THREE.MeshBasicMaterial({color: 0xffffff,})
const ballLight = new THREE.PointLight(0xffffff, 2)
const ball = new THREE.Mesh(ballGeometry, ballMaterial)
// Rigid Body
const sphereShape = new CANNON.Sphere(1)
const sphereBody = new CANNON.Body({
    mass: 10,
    position: new CANNON.Vec3(0, 0, 0),
    shape: sphereShape,
    material: concreteMaterial
})
world.addBody(sphereBody)

ball.add(ballLight)

scene.add(ball)

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff ,1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff)
directionalLight.position.set(1, 1, 1).normalize()
scene.add(directionalLight)

/**
 * Utils
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const cursor = new THREE.Vector2()

window.addEventListener('mousemove', e => {
    cursor.x = (e.clientX / sizes.width - .5) * 6
    cursor.y = -(e.clientY / sizes.height - .5) * 3
})

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, .01, 1000)
camera.position.set(0, 0, 2)
scene.add(camera)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime

    // Update controls
    // controls.update()

    // Update Physics
    world.step(1 / 60, deltaTime, 3)
    world.allowSleep = true

    // Update Mouseball
    ball.position.x = cursor.x
    ball.position.y = cursor.y

    sphereBody.position.x = ball.position.x
    sphereBody.position.y = ball.position.y

    for(const object of bodies){
        object.boxBody.applyForce(new THREE.Vector3(0, 0, 0), object.boxBody.position)

        object.mesh.position.copy(object.boxBody.position)
        object.mesh.quaternion.copy(object.boxBody.quaternion)

        const sceneMiddle = new THREE.Vector3(0, 0, 0)
        let {x, y, z} = object.boxBody.position
        let pos = new THREE.Vector3(x, y, z)
        let dir = pos.clone().sub(sceneMiddle).normalize()
        object.boxBody.applyForce(dir.multiplyScalar(-6.0), object.boxBody.position)
        object.mesh.position.set(x, y, z)
    }
    
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()