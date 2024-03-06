<template>
  <div style="display: flex; align-items: center; justify-content: center;">
    <connect />
    <div class="menu-container">
      
    </div>
    <div class="menu-container" style="left: unset; right: 10px;">
    </div>
    <div>
      <video
        ref="videoEl" autoplay playsinline
        style="display: block; position: absolute; z-index: -1;"></video>
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
})

const videoEl = ref(null)

const STORAGE_KEY = '2D_TO_3D'
let model;

let mode = 'F32'
let M = Math.pow(2, 32) 
// const mode = 'U8'
// const M = Math.pow(2, 8) - 1

const HEIGHT = 512
const WIDTH = 512

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

console.log('Aruco', Aruco)
const detector = new Aruco.AR.Detector()
const Posit = new Aruco.POS1.Posit(2 * 10, WIDTH)

onMounted(async ()=>{
  const localData = localStorage.getItem(STORAGE_KEY) || '{}'
  const {image_url, depth_url} = JSON.parse(localData)
  console.log('localData', {image_url, depth_url})
  stream = await getWebcamStream()
  states.hasStream = true

  // load glb model
  const camera = useCamera()
  const renderer = useRenderer()

  camera.aspect = WIDTH / HEIGHT

  camera.updateProjectionMatrix()
  renderer.setPixelRatio(window.devicePixelRatio)
  resizeRenderer(WIDTH, HEIGHT)
  model = await loadGlbModel('/models/sravani_glass.glb')

})

async function onFrame() {
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
  // console.log('pose', markers[0].corners, pose.bestTranslation)

  const camera = useCamera()

  // update camera position
  for(let r = 0; r<3; r++) {
    for(let c = 0; c<4; c++) {
      rotationMatrix.elements[r * 4 + c] = pose.bestRotation[r][c]
    }
  }

  // camera.position.x = pose.bestTranslation[0]
  // camera.position.y = pose.bestTranslation[1]
  // camera.position.z = pose.bestTranslation[2]

  // look at center
  // camera.lookAt(0, 0, 0)
  model.setRotationFromMatrix(rotationMatrix)

}

async function getWebcamStream() {
  const constraints = {
    audio: false,
    video: {
      width: { ideal: WIDTH },
      height: { ideal: HEIGHT },
      facingMode: "user"
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

  const camera = useCamera()

  camera.fov = 10
  camera.updateProjectionMatrix();
  camera.position.set(0, 0.0, 50)

  console.log('camera', camera, model)
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
