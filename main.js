import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader'
import gsap from 'gsap'

let scene = new THREE.Scene()
let camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100)

let model;
camera.position.z = 4

const loader = new GLTFLoader()
const rgbeLoader = new RGBELoader()

// Load HDRI environment map
rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonless_golf_1k.hdr', (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping
  scene.environment = texture
})

loader.load(
  './DamagedHelmet.gltf',
  (gltf) => {
    model = gltf.scene
    scene.add(model)
  },
  (progress) => {
    console.log(`Loading model... ${(progress.loaded / progress.total * 100)}% loaded`)
  },
  (error) => {
    console.error('An error occurred while loading the model:', error)
  }
)

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#canvas"),
  antialias: true,
  alpha: true
})

function setRendererSize() {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)
}

setRendererSize()
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.outputEncoding = THREE.sRGBEncoding

// Post-processing setup
const composer = new EffectComposer(renderer)
const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)

const rgbShiftPass = new ShaderPass(RGBShiftShader)
rgbShiftPass.uniforms['amount'].value = 0.0005
composer.addPass(rgbShiftPass)

function handleMouseMove(e) {
  if (model) {
    const rotationY = (e.clientX / window.innerWidth - 0.5) * (Math.PI * 0.3)
    const rotationX = (e.clientY / window.innerHeight - 0.5) * (Math.PI * 0.3)
    gsap.to(model.rotation, {
      x: rotationX,
      y: rotationY,
      duration: 0.8,
      ease: "power2.out"
    });
  }
}

function handleTouchMove(e) {
  if (model && e.touches.length === 1) {
    const touch = e.touches[0]
    const rotationY = (touch.clientX / window.innerWidth - 0.5) * (Math.PI * 0.3)
    const rotationX = (touch.clientY / window.innerHeight - 0.5) * (Math.PI * 0.3)
    gsap.to(model.rotation, {
      x: rotationX,
      y: rotationY,
      duration: 0.8,
      ease: "power2.out"
    });
  }
}

window.addEventListener("mousemove", handleMouseMove)
window.addEventListener("touchmove", handleTouchMove)

function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  setRendererSize()
  composer.setSize(window.innerWidth, window.innerHeight)
}

window.addEventListener("resize", handleResize)

function animate() {
  requestAnimationFrame(animate)
  composer.render()
}

animate()
