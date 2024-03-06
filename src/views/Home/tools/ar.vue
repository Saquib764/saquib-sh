<template>
  <div style="display: flex; align-items: center; justify-content: center;">
    <!-- <connect /> -->
    <!-- <div class="menu-container">
      
    </div>
    <div class="menu-container" style="left: unset; right: 10px;">
    </div> -->
    <div>
      <video
        ref="videoEl" autoplay playsinline
        style="display: block; position: absolute; z-index: -1; width: 100vw;"></video>
      <three-js use-composer>
        <!-- <bokeh :focus="states.focus" :aperture="states.aperture" /> -->
        <point-light :x="states.x" :y="states.y" :z="states.z"/>
        <ambient-light/>
        <!-- <grid-helper/> -->
        <!-- <basic-cube :position="{x: 0, y: 0, z: 4}"/> -->
        <animation-loop :on-frame="onFrame" :autostart="true"/>
      </three-js>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, reactive, onMounted } from 'vue'
import * as THREE from 'three'
import jsfeat from 'jsfeat'
import ThreeJs from '@/components/ThreeJs.vue';
import Bokeh from '@/components/Bokeh.vue';
import BasicCube from '@/components/BasicCube.vue';
import AnimationLoop from '@/components/AnimationLoop.vue';
import AmbientLight from '@/components/AmbientLight.vue';
import GridHelper from '@/components/GridHelper.vue';
import UploaderSimple from '@/components/Uploaders/Simple.vue';
import PointLight from '@/components/PointLight.vue';

import Aruco from 'js-aruco';

import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import {storage} from '@/firebase'
import { ref as Ref, uploadBytes, getDownloadURL, getBlob } from "firebase/storage";

import {  BASE_API, ENV } from '@/constants';
import { downloadImage, isMobile, sleep, getImageDimension } from "@/utils/common"
import Connect from '@/components/Footers/Connect.vue'

const states = reactive({
  hasStream: false,
  x: 5,
  y: -10,
  z: 20,
})

const videoEl = ref(null)

const STORAGE_KEY = '2D_TO_3D'
let model;
let trolley;

let mode = 'F32'
let M = Math.pow(2, 32) 
// const mode = 'U8'
// const M = Math.pow(2, 8) - 1

let HEIGHT = 512
let WIDTH = 512

watch(()=>[states.image_url, states.depth_url], (url)=> {
  let {image_url, depth_url} = states
  localStorage.setItem(STORAGE_KEY, JSON.stringify({image_url, depth_url}))
}, {deep: true})

watch(()=>states.scale, (val)=> {
  if(!model) {
    return
  }
  const camera = useCamera()
  camera.fov = 160 / states.scale
  camera.updateProjectionMatrix();
})
watch(()=>states.render_mode, (val)=> {
  if(!model) {
    return
  }
  const scene = useScene()
})

let stream = null


let orbitController = null
let transformController = null

const detector = new Aruco.AR.Detector()
const Posit = new Aruco.POS1.Posit(2 * 10, WIDTH)

onMounted(async ()=>{
  const localData = localStorage.getItem(STORAGE_KEY) || '{}'
  const {image_url, depth_url} = JSON.parse(localData)
  console.log('localData', {image_url, depth_url})
  stream = await getWebcamStream()
  states.hasStream = true

  setup_scene()
})

async function setup_scene() {
  // load glb model
  model = await loadGlbModel('/models/sravani_glass.glb')
  const scene = useScene()
  const camera = useCamera()
  const renderer = useRenderer()
  const canvas = renderer.domElement
  trolley = new THREE.Group()
  scene.add(trolley)

  camera.fov = 10
  camera.aspect = WIDTH / HEIGHT
  camera.updateProjectionMatrix()
  renderer.setPixelRatio(window.devicePixelRatio)

  camera.position.set(0, 0.0, 50)
  resizeRenderer(WIDTH, HEIGHT)
  canvas.style.width = '100vw'
  canvas.style.height = `${HEIGHT / WIDTH * 100}vw`
  trolley.add(camera)

  window.addEventListener('deviceorientation', handleOrientation);

}

function handleOrientation(event) {
  let alpha = event.alpha;
  let beta = event.beta;
  let gamma = event.gamma;

  console.log('orientation', alpha, beta, gamma)
  model.rotation.x = -beta * (Math.PI / 180);
  model.rotation.y = -gamma * (Math.PI / 180);
  model.rotation.z = -alpha * (Math.PI / 180);
}


function onFrame() {
  return
  if(!states.hasStream) {
    return
  }

  // detect aruco marker and get pose
  const frame = getVideoFrameData(videoEl.value)
  const markers = detector.detect(frame)

  const rotationMatrix = new THREE.Matrix4();

  if(markers.length === 0) {
    return
  }
  let corners = markers[0].corners;

  for (var i = 0; i < corners.length; ++ i){
    let corner = corners[i];

    corner.x = corner.x - (WIDTH / 2);
    corner.y = (HEIGHT / 2) - corner.y;
  }

  let pose = Posit.pose(markers[0].corners)
  console.log('pose', markers[0].corners, pose.bestTranslation, pose.bestRotation)

  const camera = useCamera()

  // update camera position
  for(let r = 0; r<3; r++) {
    for(let c = 0; c<4; c++) {
      rotationMatrix.elements[r * 4 + c] = rotationMatrix.elements[r * 4 + c]*0.5+ 0.5*pose.bestRotation[r][c]
    }
  }

  camera.position.x = pose.bestTranslation[0]
  camera.position.y = pose.bestTranslation[1]
  camera.position.z = pose.bestTranslation[2]

  // look at center
  camera.lookAt(0, 0, 0)
  model.setRotationFromMatrix(rotationMatrix)

}

async function getWebcamStream() {
  const constraints = {
    audio: false,
    video: {
      width: { ideal: WIDTH },
      height: { ideal: HEIGHT },
      facingMode: "environment"
    }
  }
  const stream = await navigator.mediaDevices.getUserMedia(constraints)
  videoEl.value.srcObject = stream
  return stream
}

async function loadGlbModel(url) {
  const loader = new GLTFLoader()
  const gltf = await loader.loadAsync(url)
  let model = gltf.scene
  console.log('model', model)
  
  model.rotation.set(0.5 * Math.PI, 0, 0)
  model.position.set(0, 0, 0)

  let group = new THREE.Group()
  group.add(model)

  let scene = useScene()
  scene.add(group)

  return group

}

function getVideoFrameData(video) {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}


</script>

<style scoped lang="scss">
.menu-container {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0,0,0,0.1);
  padding: 10px;
  border-radius: 10px;
  gap: 10px;
}
</style>
