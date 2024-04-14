import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

import raymarchingVertex from './shader/distortion/vertex.glsl'
import raymarchingFragment from './shader/distortion/fragment.glsl'


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
const matcapTextureOne = textureLoader.load('./textures/matcaps/7.png')
const matcapTextureTwo = textureLoader.load('./textures/matcaps/2.png')

/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.PlaneGeometry(1, 1, 1, 1)

// Material
const material = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms:{
        uTime: new THREE.Uniform(0),
        uResolution: new THREE.Uniform(new THREE.Vector4()),
    },
    vertexShader: raymarchingVertex,
    fragmentShader: raymarchingFragment
})

// Mesh
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const imageAspect = 1;

let a1
let a2

if(sizes.height/sizes.width > imageAspect){
    a1 = (sizes.width/sizes.height) * imageAspect
    a2 = 1
} else {
    a1 = 1
    a2 = (sizes.height/sizes.width) * imageAspect
}

material.uniforms.uResolution.value.x = sizes.width
material.uniforms.uResolution.value.y = sizes.height
material.uniforms.uResolution.value.z = a1
material.uniforms.uResolution.value.w = a2

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    const imageAspect = 1;

    let a1
    let a2

    if(sizes.height/sizes.width > imageAspect){
        a1 = (sizes.width/sizes.height) * imageAspect
        a2 = 1
    } else {
        a1 = 1
        a2 = (sizes.height/sizes.width) * imageAspect
    }

    material.uniforms.uResolution.value.x = sizes.width
    material.uniforms.uResolution.value.y = sizes.height
    material.uniforms.uResolution.value.z = a1
    material.uniforms.uResolution.value.w = a2

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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 1, 1000)
camera.position.set(0, 0, 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()