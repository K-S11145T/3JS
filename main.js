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
    model= gltf.scene
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

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)
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

window.addEventListener("mousemove" , (e)=>{
  if(model){
    const rotationY= (e.clientX / window.innerWidth - 0.5)*(Math.PI*0.3)
    const rotationX= (e.clientY / window.innerHeight - 0.5)*(Math.PI*0.3)
    gsap.to(model.rotation, {
      x: rotationX,
      y: rotationY,
      duration: 0.8,
      ease: "power2.out"
    });
  }
})

window.addEventListener("resize" , ()=>{
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  composer.setSize(window.innerWidth, window.innerHeight)
}) 

function animate() {
  requestAnimationFrame(animate)
  
 
  // Render using the composer instead of the renderer
  composer.render()
}

animate()

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  composer.setSize(window.innerWidth, window.innerHeight)
})
