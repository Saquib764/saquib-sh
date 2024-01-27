import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'

let state = {
  scene: null,
  renderer: null,
  camera: null,
  orbitControl: null,
  transformControl: null
}

export function useScene() {
  if(!state.scene) {
    // console.log( "creating new scene" )
    state.scene = new THREE.Scene()
    state.scene.background = new THREE.Color( 0xf0f0f0 );
  }
  return state.scene
}

export function useRenderer() {
  if(!state.renderer) {
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        // powerPreference: "high-performance",
        alpha: true,
        preserveDrawingBuffer: true,
    });
    renderer.setClearColor("#ffffff")
    // renderer.shadowMap.enabled = true
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap
    // renderer.shadowMapSoft = true
    // renderer.shadowMap.autoUpdate = false
    // renderer.shadowMap.needsUpdate = true
    state.renderer = renderer
  }
  return state.renderer
}

export function useCamera() {
  if(!state.camera) {
    const camera = new THREE.PerspectiveCamera(
      160,
      1.0,
      1,
      1000
    )
    camera.up.set(0, 1, 1);
    camera.position.set(0, -0, 20)
    camera.lookAt(0,0,0)
    state.camera = camera
  }
  return state.camera
}

export function dispose() {
  state.renderer && state.renderer.renderLists.dispose()
  state.renderer && state.renderer.dispose() 
  delete state.scene
  delete state.camera
  state.camera = null
  state.scene = null
}

export function useOrbitControl() {
  if(!state.orbitControl) {
    const orbitControl = new OrbitControls(state.camera, state.renderer.domElement)
    // orbitControl.rotateSpeed *= 0.25;
    orbitControl.enableDamping = true
    orbitControl.dampingFactor = 0.25
    // orbitControl.enableZoom = true
    // orbitControl.enablePan = true
    // orbitControl.minDistance = 100
    // orbitControl.maxDistance = 500
    orbitControl.screenSpacePanning = false
    // orbitControl.enableRotate = false

    orbitControl.update()
    state.orbitControl = orbitControl
  }
  return state.orbitControl
}

export function useTransformControl() {
  if(!state.transformControl) {
    const transformControl = new TransformControls(state.camera, state.renderer.domElement)
    state.transformControl = transformControl
  }
  return state.transformControl
}

export function useThree() {
  return {
    scene: useScene(),
    renderer: useRenderer(),
    camera: useCamera(),
  }
}
