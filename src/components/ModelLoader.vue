<template>
  <animation-loop :onFrame="loop"/>
</template>

<script setup>

import { watch, reactive, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import AnimationLoop from './AnimationLoop.vue'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  position: {
    type: Object,
    default:()=> ({
      x: 0, y: 0, z: 0
    })
  },
  size: {
    type: String,
    default: 'default'
  }
})

let model = null
watch(()=>props.position, ()=> {
  if(!model) return
  model.position.x = props.position.x || 0
  model.position.y = props.position.y || 0
  model.position.z = props.position.z || 0
})

watch(()=>props.src, ()=> {
  if(!props.src) return
  setup_model()
})

function fillViewPort(m) {
  const camera = useCamera()
  let boundingBox = new THREE.Box3().setFromObject(m);

  // Calculate the size of the bounding box
  let size = new THREE.Vector3();
  boundingBox.getSize(size);

  let maxDimension = Math.max(size.x, size.y, size.z);

  // Calculate the distance from the camera to the model based on the maximum dimension
  let distance = maxDimension / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));

  let scale = 1.0

  if(distance < 2) {
    scale = 1.0 / (distance * 2)
    distance = 2
  }
  m.scale.set(scale, scale, scale)

  // Set the camera position and look at the center of the model
  camera.position.set(0, 0, distance);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  refreshScene()
}

async function loadGlbModel(url) {
  const loader = new GLTFLoader()
  const gltf = await loader.loadAsync(url)
  let model = gltf.scene
  // console.log('model', model)
  
  // model.rotation.set(0.5 * Math.PI, 0, 0)
  model.position.set(props.position.x, props.position.y, props.position.z)

  let group = new THREE.Group()
  group.add(model)
  return group
}

async function setup_model() {
  const scene = useScene()
  if(model) {
    // remove and dispose
    scene.remove(model)
    model.traverse((o) => {
      if (o.isMesh) {
        o.geometry.dispose()
        o.material.dispose()
      }
    })
  }
  model = await loadGlbModel(props.src)
  if(props.size === 'fit') {
    fillViewPort(model)
  }
  scene.add(model)
}

onMounted( async() =>{
  if(!props.src) return
  setup_model()
})

onBeforeUnmount( () =>{
  if(!model) return
  const scene = useScene()
  scene.remove(model)
})

function loop() {
  if(!model) return
  // cube.rotation.x += 0.01
}
</script>

<style scoped>
</style>