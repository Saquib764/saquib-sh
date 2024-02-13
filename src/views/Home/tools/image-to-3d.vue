<template>
  <div style="display: flex; align-items: center; justify-content: center;">
    <connect />
    <div class="menu-container">
      <uploader-simple
        ref="uploadEl"
        label="Upload scene"
        :preview-url="states.image_url || null"
        @on-file-upload="onFileUpload"
        style="width: unset; max-width: 200px; background: rgba(181, 197, 207, 0.3);"
        :is-uploading="states.isUploading"
        :uploadMessage="states.uploadMessage" />
      <img :src="states.depth_url" style="width: 100px; height: 100px; object-fit: contain;"/>
      <div style="width: 200px;" class="mb-3">
        <v-slider
          v-model="states.scale"
          :min="0"
          :max="10"
          step="0.01"
          thumb-label
          label="Scale"/>
        <v-slider
          v-model="states.focus"
          :min="0"
          :max="1000"
          step="0.01"
          thumb-label
          label="Focus"/>
        <v-slider
          v-model="states.aperture"
          :min="0"
          :max="10"
          step="0.01"
          thumb-label
          label="Aperture"/>
        <v-select label="Render" v-model="states.render_mode" :items="['point_cloud', 'surface']"></v-select>
        <v-btn @click="saveRender" color="black">Download image</v-btn>

        <v-card text="Use scroll to move camera forward/backward. Use two finger press to pan." class="mt-3" />
      </div>
    </div>
    <div class="menu-container" style="left: unset; right: 10px;">
      <v-btn v-show="states.isAnimationRunning" @click="previewRender" color="red">Stop</v-btn>
      <v-btn v-show="!states.isAnimationRunning" @click="previewRender" color="black">Preview animation</v-btn>
      <v-btn @click="saveVideoRender" color="black" :disabled="states.isDownloading">Download video</v-btn>
    </div>
    <three-js @mousemove="onMouseMove" use-composer>
      <bokeh :focus="states.focus" :aperture="states.aperture" />
      <!-- <point-light :x="states.x" :y="states.y" :z="states.z"/> -->
      <!-- <ambient-light/> -->
      <!-- <grid-helper/> -->
      <!-- <basic-cube :position="{x: 0, y: 0, z: 4}"/> -->
      <animation-loop :on-frame="onFrame" :autostart="false" ref="animationEl"/>
    </three-js>
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

import {storage} from '@/firebase'
import { ref as Ref, uploadBytes, getDownloadURL, getBlob } from "firebase/storage";

import {  BASE_API, ENV } from '@/constants';
import { downloadImage, isMobile, sleep, getImageDimension } from "@/utils/common"
import Connect from '@/components/Footers/Connect.vue'
import { readAsFile } from '../../../utils/common';

const states = reactive({
  height: 100,
  width: 100,
  isUploading: false,
  uploadMessage: "",
  image_url: '/images/3d/scene7.png',
  depth_url: '/images/3d/scene7_depth.png',
  x:0,
  y:0,
  z:10,
  scale: 3,
  sensitivity: 1,
  focus: 100,
  aperture: 0,
  render_mode: 'surface',
  isAnimationRunning: false,
  isDownloading: false,
})

const uploadEl = ref(null)
const animationEl = ref(null)

const STORAGE_KEY = '2D_TO_3D'
let model;

let mode = 'F32'
let M = Math.pow(2, 32) 
// const mode = 'U8'
// const M = Math.pow(2, 8) - 1

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
  createWorld()
})

async function onFileUpload(files_list) {
  states.isUploading = true
  states.uploadMessage = "Uploading image..."
  const files = [files_list[0]]

  const dim = await getImageDimension(files[0])


  if(dim.width * dim.height > 1920 * 1920) {
    alert('Image size is too large. Please upload image with size less than 1920x1920')
    return
  }

  const instance_id = Math.floor(Math.random() * 89999 + 10000).toString()
  const instance_url = `depth-2d-to-3d/${instance_id}.png`
  const imgRef = Ref(storage, instance_url);
  await uploadBytes(imgRef, files[0])

  states.image_url = toFirestoreUrl(instance_url)
  states.uploadMessage = "Processing image..."
  let res = await getDepth(states.image_url)
  if(res.result.length) {
    // upload depth
    states.uploadMessage = "Uploading depth..."
    const depth_url = `depth-2d-to-3d/${instance_id}_depth.png`
    const depthRef = Ref(storage, depth_url);
    let file = await readAsFile(res.result[0], 'depth.png')
    await uploadBytes(depthRef, file)

    states.depth_url = toFirestoreUrl(depth_url)
  }
  states.uploadMessage = "Rendering scene..."
  states.isUploading = false
  states.uploadMessage = ""
  await createWorld()
}

async function getDepth(url) {
  const res = await fetch(`${BASE_API}/depth`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_url: url
    })
  })
  const data = await res.json()
  return data
}
function onMouseMove(e) {
  if(!model) {
    return
  }

  // compute x and w with respect to window
  let x = e.clientX
  let y = e.clientY

  x = x / window.innerWidth - 0.5
  y = - (y / window.innerHeight - 0.5)

  model.rotation.x = 0.1 * states.sensitivity * y * Math.PI
  model.rotation.y = -0.1 * states.sensitivity * x * Math.PI
}


async function get_image_data(url, width, height) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  const image = await getImageFromUrl(url);
  width = width || image.width
  height = height || image.height

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image.image, 0, 0, width, height);

  return [image, ctx.getImageData(0, 0, width, height)]
}

function get_min_max(depth_data) {
  let min = 255
  let max = 0
  for (let i = 0; i < depth_data.data.length; i++) {
    const depth = depth_data.data[i]
    if (depth < min) {
      min = depth
    }
    if (depth > max) {
      max = depth
    }
  }
  return [min, max]
}



function get_depth_32(depth_data){
  const width = depth_data.width || depth_data.cols
  const height = depth_data.height || depth_data.rows
  let data_u32 = new Uint32Array(depth_data.data.buffer);
  const depth = new jsfeat.matrix_t(width, height, jsfeat.F32_t | jsfeat.C1_t);
  for(let i=0; i<depth_data.data.length; i++) {
    if(mode == 'F32') {
      depth.data[i] = data_u32[i]
    } else {
      depth.data[i] = depth_data.data[i]
    }
  }
  return depth
}


function depth_to_3d(depth_data, image_data) {
  const points = []
  const colors = []
  const sizes = []
  let ox = 1.0 * image_data.width / 2
  let oy = 1.0 * image_data.height / 2
  let f = 0.001

  let corner_min = new THREE.Vector3(0, 0, 0)
  let corner_max = new THREE.Vector3(image_data.width, image_data.height, 0)

  for (let i = 0; i < image_data.width * image_data.height; i++) {
    const depth = depth_data.data[i] / M
    // const z = 100 * (depth - 1) 
    // const z = 1.0 / (depth + .001)
    const z = -300 *(depth + 0.5)

    const u = i % image_data.width
    const v = Math.floor(i / image_data.width)
    let x =  -(u - ox) * z * f
    let y =  (v - oy) * z * f
    points.push(new THREE.Vector3(x, y, z))
    if(i == 0) {
      corner_min.x = x
      corner_min.y = y
      corner_min.z = z
      corner_max.x = x
      corner_max.y = y
      corner_max.z = z
    }
    if(x < corner_min.x) {
      corner_min.x = x
    }
    if(y < corner_min.y) {
      corner_min.y = y
    }
    if(z < corner_min.z) {
      corner_min.z = z
    }
    if(x > corner_max.x) {
      corner_max.x = x
    }
    if(y > corner_max.y) {
      corner_max.y = y
    }
    if(z > corner_max.z) {
      corner_max.z = z
    }

    colors.push(image_data.data[i * 4]/255.0, image_data.data[i * 4 + 1]/255.0, image_data.data[i * 4 + 2]/255.0)
    sizes.push(Math.abs(30*f*z))
  }
  return [points, colors, sizes, corner_min, corner_max]
}

const vertexShader = `
attribute float size;
varying vec3 vColor;

void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (10.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}
`

const fragmentShader = `
varying vec3 vColor;

void main() {
    gl_FragColor = vec4(vColor, 1.0);
}
`

let orbitController = null
let transformController = null



onMounted(async ()=>{
  const localData = localStorage.getItem(STORAGE_KEY) || '{}'
  const {image_url, depth_url} = JSON.parse(localData)
  console.log('localData', {image_url, depth_url})
  if(depth_url) {
    states.depth_url = depth_url
  }
  if(image_url) {
    states.image_url = image_url
    if(!states.depth_url) {
      let res = await getDepth(image_url)
      if(res.result.length) {
        states.depth_url = res.result[0]
      }
    }
  }
  await createWorld()
})

function set_point_cloud(points, colors, sizes) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
        color: { value: new THREE.Color(0xffffff) }
    },
    vertexShader,
    fragmentShader,
    vertexColors: true
  });


  const pointCloud = new THREE.Points(geometry, material);

  console.log('pointCloud', pointCloud)
  return pointCloud
}

async function loadTexture(url) {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(url, resolve, undefined, reject);
  });
}

async function set_surface(image, points) {
  let texture = await loadTexture(image.url);
  texture.format = THREE.RGBAFormat;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;

  let height = image.height
  let width = image.width

  let uvs = [];
  // create mesh surface from grid of points, with depth data
  // These points are vertices of the mesh
  const geometry = new THREE.BufferGeometry();

  let vertices = [];
  for (let h = 0; h < height ; h++) {
    for(let w = 0; w < width ; w++) {
      let i = h * width + w
      let point = points[i];
      vertices.push(point.x, point.y, point.z);

      uvs.push( w / width, 1 - h / height);
    }
  }
  // Add faces
  let faces = [];
  for (let i = 0; i < height - 1; i++) {
    for (let j = 0; j < width - 1; j++) {
      let index = i * width + j;
      faces.push(index, index + width, index + width + 1);
      faces.push(index, index + width + 1, index + 1);
    }
  }


  // Create a Float32Array from the vertices array
  let verticesArray = new Float32Array(vertices);
  let uvsArray = new Float32Array(uvs);
  let facesArray = new Uint32Array(faces);

  geometry.setAttribute('position', new THREE.BufferAttribute(verticesArray, 3));
  geometry.setIndex(new THREE.BufferAttribute(facesArray, 1));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvsArray, 2));
  geometry.computeVertexNormals();
  // let material = new THREE.MeshStandardMaterial({
  //   map: texture,
  //   roughness: 0.0,
  //   metalness: 0.10,
  // });
  let material = new THREE.MeshBasicMaterial({ map: texture});
  material.side = THREE.DoubleSide;
  let mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh
}

async function createWorld() {
  if(!states.image_url || !states.depth_url) {
    return
  }
  const camera = useCamera()
  const scene = useScene()
  const renderer = useRenderer()
  if(model) {
    scene.remove(model)
  }
  // let depth_data = await get_image_data(`/images/3d/${name}_depth_32.png`)
  let [image, image_data] = await get_image_data(states.image_url)
  let [depth, depth_data] = await get_image_data(states.depth_url, image_data.width, image_data.height)
  
  let gray_count = 0
  let gray_sample_n = 5
  for(let i = 0; i < gray_sample_n; i++) {
    let r = Math.floor(Math.random() * depth_data.height * depth_data.width)
    if(depth_data.data[r] == depth_data.data[r+1] && depth_data.data[r] == depth_data.data[r+2]) {
      gray_count += 1
    }
  }
  // if(gray_count / gray_sample_n > 0.6) {
  //   mode = 'U8'
  //   M = Math.pow(2, 8) - 1
  // } else {
  //   mode = 'F32'
  //   M = Math.pow(2, 32) 
  // }

  console.log('depth_data', depth_data)

  let depth_u8 = new jsfeat.matrix_t(depth_data.height, depth_data.width, jsfeat.U8_t | jsfeat.C1_t);
  jsfeat.imgproc.grayscale(depth_data.data, depth_data.height, depth_data.width, depth_u8);


  let depth_u32;
  if(mode == 'F32') {
    depth_u32 = get_depth_32(depth_data)
    let options = {
      radius: 2,
      sigma: 1
    };
    let r = options.radius|0;
    let kernel_size = (r+1) << 1;
    console.log('kernel_size', kernel_size) 
    // jsfeat.imgproc.gaussian_blur(depth_u32, depth_u32, kernel_size, options.sigma);
  } else {
    let options = {
      radius: 1,
      sigma: 1
    };
    let r = options.radius|0;
    let kernel_size = (r+1) << 1;
    console.log('kernel_size', kernel_size) 
    // jsfeat.imgproc.gaussian_blur(depth_u8, depth_u8, kernel_size, options.sigma);
    depth_u32 = get_depth_32(depth_u8)
  }

  // Sample array of 3D points
  const [points, colors, sizes, corner_min, corner_max] = depth_to_3d(depth_u32, image_data);
  // console.log('corner_min', corner_min)
  // console.log('corner_max', corner_max)

  let w = window.innerWidth
  let h = w * image.height / image.width

  if(w > window.innerWidth) {
    w = window.innerWidth
    h = w * image.height / image.width
  }
  if(h > window.innerHeight) {
    h = window.innerHeight
    w = h * image.width / image.height
  }
  camera.aspect = w/h
  camera.fov = 160 / states.scale
  // states.scale = 160 / camera.fov
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);


  let m
  if(states.render_mode == 'point_cloud') {
    m = set_point_cloud(points, colors, sizes)
  } else {
    m = await set_surface(image, points)
  }
  let z = (corner_max.z + corner_min.z) / 2
  m.position.set(0, 0, z)
  model = new THREE.Group()
  model.add(m)
  model.position.set(0, 0, 50 - z)

  scene.add(model);


  // orbitController = useOrbitControl()

  // orbitController.attach(camera)
  // transformController = useTransformControl()

  // transformController.attach(model)

  camera.position.set(0, 0, 50)
}
function singleFrame() {
  const camera = useCamera()
  camera.position.z -= 0.35
  camera.fov += 0.06
  camera.updateProjectionMatrix();
  if(camera.position.z < 0) {
    return true
  }
  return false
}

function onFrame(e) {
  const camera = useCamera()
  let is_done = singleFrame()
  if(is_done && states.isAnimationRunning) {
    // stop animation
    camera.position.z = 50
    camera.fov = 160 / states.scale
    camera.updateProjectionMatrix();
  }
}
onBeforeUnmount(()=> {
  const scene = useScene()
  scene.remove(model)
})
async function saveRender() {
  const renderer = useRenderer()
  const canvas = renderer.domElement
  const dataUrl = canvas.toDataURL('image/png')
  await downloadImage(dataUrl, 'saquib-sh-3d.png')
}
async function saveVideoRender() {
  states.isDownloading = true
  const renderer = useRenderer()
  const canvas = renderer.domElement

  let chunks = [];
  let canvas_stream = canvas.captureStream(30); // fps
  // Create media recorder from canvas stream
  let media_recorder = new MediaRecorder(canvas_stream, { mimeType: "video/webm; codecs=vp9" });
  media_recorder.ondataavailable = (evt) => { chunks.push(evt.data); };

  media_recorder.onstop = async (evt) => {
    let blob = new Blob(chunks, { type: "video/webm" });
    let url = URL.createObjectURL(blob);
    // download blob as webm file
    await downloadImage(url, 'saquib-sh-3d.webm')
  };

  const camera = useCamera()
  camera.position.set(0, 0, 50)
  camera.lookAt(0, 0, 0)

  media_recorder.start();
  animationEl.value.start()

  while(camera.position.z > 0) {
    await sleep(10)
  }
  animationEl.value.stop()
  media_recorder.stop();
  states.isDownloading = false
}
async function previewRender() {
  if(states.isAnimationRunning) {
    console.log('stop animation', animationEl.value)
    animationEl.value.stop()
    states.isAnimationRunning = false
    return
  }
  states.isAnimationRunning = true
  const camera = useCamera()
  camera.position.set(0, 0, 50)
  camera.lookAt(0, 0, 0)
  animationEl.value.start()
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
