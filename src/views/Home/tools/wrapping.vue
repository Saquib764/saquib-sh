<template>
  <div>
    <div style="display: flex; flex-direction: column; position: absolute; top: 0; left: 10px; background: rgba(0,0,0,0.2);">
      <uploader-simple
        ref="uploadEl"
        label="Upload image"
        :preview-url="states.image_url || null"
        @on-file-upload="onFileUpload"
        style="width: unset; max-width: 200px; background: rgba(181, 197, 207, 0.3);"
        :is-uploading="states.isUploading"
        :uploadMessage="states.uploadMessage" />
      <uploader-simple
        ref="uploadMaskEl"
        label="Upload subject mask"
        :preview-url="states.mask_url || null"
        @on-file-upload="onMaskUpload"
        style="width: unset; max-width: 200px; background: rgba(181, 197, 207, 0.3);"
        :is-uploading="states.isUploadingMask"
        :uploadMessage="states.uploadMessageMask" />
      <img :src="states.depth_url" style="width: 100px; object-fit: contain;"/>
      <div style="width: 200px;">
        <v-checkbox v-model="states.hideLighting" label="Show original" hide-details density="compact"/>
        <v-slider
          v-model="states.smoothness"
          :min="0"
          :max="1"
          step="0.01"
          thumb-label
          label="Smoothness"/>
        <v-slider
          v-model="states.ambience_intensity"
          :min="0"
          :max="15"
          step="0.01"
          thumb-label
          label="Ambience"/>
        <div>
          <span>Ambience color-</span>
          <input type="color" v-model="states.ambience_color" />
        </div>
        <v-slider
          v-model="states.scale"
          :min="0"
          :max="3"
          step="0.01"
          thumb-label
          label="Scale"/>
        <v-btn @click="saveRender">Download</v-btn>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; position: absolute; top: 0; right: 10px; background: rgba(0,0,0,0.2);">
      <v-tabs v-model="states.selectedLight">
        <v-tab :value="i" v-for="l, i in states.lights" :key="i">
          L {{i+1}}
        </v-tab>
      </v-tabs>
      <v-window v-model="states.selectedLight">
        <v-window-item v-for="l, i in states.lights" :key="i" :value="i">
          <div style="width: 200px;">
            <v-checkbox v-model="l.isActive" label="Activate" hide-details density="compact"/>
            <v-checkbox v-model="l.isDiectional" label="Directional" hide-details density="compact"/>
            <v-checkbox v-model="l.hideVisual" label="Hide light source" hide-details density="compact"/>
            <div>
              <span>Light color-</span>
              <input type="color" v-model="l.color" />
            </div>
            <v-slider
              v-model="l.intensity"
              :min="0"
              :max="15"
              step="0.1"
              thumb-label
              label="Intensity"/>
            <v-slider
              v-model="l.x"
              :min="-1"
              :max="1"
              step="0.01"
              thumb-label
              label="X"/>
            <v-slider
              v-model="l.y"
              :min="-1"
              :max="1"
              step="0.01"
              thumb-label
              label="Y"/>
            <v-slider
              v-model="l.z"
              :min="-1"
              :max="1"
              step="0.1"
              thumb-label
              label="Z"/>
          </div>
        </v-window-item>
      </v-window>
    </div>
    <three-js>
      <div v-for="l, i in states.lights.filter(l=> l.isActive)" :key="l.id">
        <directional-light 
          v-if="l.isDiectional"
          :x="l.x * states.scene_width"
          :y="l.y * states.scene_height"
          :z="l.z * states.scene_depth"
          :intensity="l.intensity"
          :color="l.color"/>
        <point-light 
          v-if="!l.isDiectional"
          :x="l.x * states.scene_width"
          :y="l.y * states.scene_height"
          :z="l.z * states.scene_depth"
          :intensity="l.intensity"
          :color="l.color"/>
      </div>

      <basic-sphere v-for="l, i in states.lights.filter(l=> l.isActive&& !l.hideVisual)" :key="l.id"
        :position="{
          x: l.x * states.scene_width,
          y: l.y * states.scene_height,
          z: 0.3*states.scene_depth * l.z
        }"
        :color="l.color"
        />
      <ambient-light :intensity="states.ambience_intensity" :color="states.ambience_color"/>
      <grid-helper/>
      <!-- <basic-cube :position="{x: 0, y: 0, z: 4}"/> -->
      <animation-loop :frame="onFrame"/>
    </three-js>
  </div>
</template>

<script setup>
import { ref, watch, reactive, onMounted } from 'vue'
import * as THREE from 'three'
import jsfeat from 'jsfeat'
import ThreeJs from '@/components/ThreeJs.vue';
import BasicCube from '@/components/BasicCube.vue';
import AnimationLoop from '@/components/AnimationLoop.vue';
import AmbientLight from '@/components/AmbientLight.vue';
import GridHelper from '@/components/GridHelper.vue';
import UploaderSimple from '@/components/Uploaders/Simple.vue';
import PointLight from '@/components/PointLight.vue';
import BasicSphere from '@/components/BasicSphere.vue';
import DirectionalLight from '@/components/DirectionalLight.vue';

import {storage} from '@/firebase'
import { ref as Ref, uploadBytes, getDownloadURL, getBlob } from "firebase/storage";

import {  BASE_API, ENV } from '@/constants';
import { downloadImage, isMobile, sleep, getImageDimension } from "@/utils/common"

const states = reactive({
  height: 100,
  width: 100,
  isUploading: false,
  uploadMessage: "",
  isUploadingMask: false,
  uploadMessageMask: "",
  image_url: "/images/3d/teeshirt.webp",
  mask_url: null,
  depth_url: null,
  selectedLight: 0,
  hideLighting: false,
  scale: 1,

  lights: [{
    id: "1",
    x:0,
    y:0,
    z:0.1,
    intensity: 1,
    isDiectional: true,
    isActive: false,
    hideVisual: false,
    color: '#ffffff',
  }, {
    id: "2",
    x:0,
    y:0,
    z:0.1,
    intensity: 1,
    isDiectional: true,
    isActive: false,
    hideVisual: false,
    color: '#ffffff',
  }, {
    id: "3",
    x:0,
    y:0,
    z:0.1,
    intensity: 1,
    isDiectional: true,
    isActive: false,
    hideVisual: false,
    color: '#ffffff',
  }, {
    id: "4",
    x:0,
    y:0,
    z:0.1,
    intensity: 1,
    isDiectional: true,
    isActive: false,
    hideVisual: false,
    color: '#ffffff',
  }],

  scene_width: 100,
  scene_height: 100,
  scene_depth: 300,
  smoothness: 0.5,
  ambience_intensity: 1,
  ambience_color: '#ffffff'
})

const uploadEl = ref(null)
const uploadMaskEl = ref(null)

const STORAGE_KEY = '2D_TO_3D'

let model = null

// watch(()=>[states.image_url, states.depth_url, states.mask_url], (url)=> {
//   let {image_url, depth_url, mask_url} = states
//   localStorage.setItem(STORAGE_KEY, JSON.stringify({image_url, depth_url, mask_url}))
// }, {deep: true})

// watch(()=>states.smoothness, (val)=> {
//   if(!model) {
//     return
//   }
//   model.children[0].material.roughness = 1 - val
// })

// watch(()=>states.hideLighting, (val)=> {
//   if(!model) {
//     return
//   }
//   model.children[0].visible = !states.hideLighting
// })
// watch(()=>states.scale, (val)=> {
//   if(!model) {
//     return
//   }
//   const camera = useCamera()
//   camera.fov = 160 / states.scale
//   camera.updateProjectionMatrix();
// })

async function onFileUpload(files_list) {
  states.isUploading = true
  states.uploadMessage = "Uploading image..."
  const files = [files_list[0]]

  const instance_id = Math.floor(Math.random() * 89999 + 10000).toString()
  const instance_url = `depth-2d-to-3d/${instance_id}.png`
  const imgRef = Ref(storage, instance_url);
  await uploadBytes(imgRef, files[0])

  states.image_url = toFirestoreUrl(instance_url)
  states.uploadMessage = "Processing image..."
  let res = await getDepth(states.image_url)
  if(res.result.length) {
    states.depth_url = res.result[0]
  }
  states.uploadMessage = "Rendering scene..."
  await createWorld()
  states.isUploading = false
  states.uploadMessage = ""
}

async function onMaskUpload(files_list) {
  states.isUploadingMask = true
  states.uploadMessageMask = "Uploading image..."
  const files = [files_list[0]]

  const instance_id = Math.floor(Math.random() * 89999 + 10000).toString()
  const instance_url = `depth-2d-to-3d/${instance_id}_mask.png`
  const imgRef = Ref(storage, instance_url);
  await uploadBytes(imgRef, files[0])

  states.mask_url = toFirestoreUrl(instance_url)
  states.uploadMessageMask = "Processing image..."
  await createWorld()
  states.isUploadingMask = false
  states.uploadMessageMask = ""
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

async function get_image_data(url, width, height) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  const image = await getImageFromUrl(url);
  console.log('image', image)

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
  let f = 0.01

  let corner_min = new THREE.Vector3(0, 0, 0)
  let corner_max = new THREE.Vector3(image_data.width, image_data.height, 0)

  for (let i = 0; i < image_data.width * image_data.height; i++) {
    const depth = depth_data.data[i] / M
    // const z = 100 * (depth - 1) 
    // const z = 1.0 / (depth + .001)
    const z = -300 *(Math.pow(depth, 3) + 0.5)

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


const mode = 'F32'
const M = Math.pow(2, 32) 
// const mode = 'U8'
// const M = Math.pow(2, 8) - 1

onMounted(async ()=>{
  // const localData = localStorage.getItem(STORAGE_KEY) || '{}'
  // const {image_url, depth_url, mask_url} = JSON.parse(localData)
  // console.log('localData', {image_url, depth_url, mask_url})
  // if(depth_url) {
  //   states.depth_url = depth_url
  // }
  // if(image_url) {
  //   states.image_url = image_url
  //   if(!states.depth_url) {
  //     let res = await getDepth(image_url)
  //     if(res.result.length) {
  //       states.depth_url = res.result[0]
  //     }
  //   }
  // }
  // if(mask_url) {
  //   states.mask_url = mask_url
  // }
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
    new THREE.TextureLoader().load(url, (texture)=>{

      texture.format = THREE.RGBAFormat;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      resolve(texture)
    }, undefined, reject);
  });
}

async function set_surface(image, points, mask) {
  let texture = await loadTexture(image.url);

  console.log('mask', mask) 
  let alphaTexture = await loadTexture(mask.url);

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
  let sub_material = new THREE.MeshStandardMaterial({
    map: texture,
    alphaMap: alphaTexture,
    transparent: true,
    roughness: 1 - states.smoothness,
    metalness: 0.0,
  });
  let sub_mesh = new THREE.Mesh(geometry, sub_material);
  sub_mesh.castShadow = true;
  sub_mesh.receiveShadow = true;
  sub_mesh.position.z += 0.1


  let bg_material = new THREE.MeshBasicMaterial({ map: texture});
  let bg_mesh = new THREE.Mesh(geometry, bg_material);

  // group sub and bg
  let group = new THREE.Group();
  group.add(sub_mesh);
  group.add(bg_mesh);
  return group
}

const dx = 0.50

async function cloth_grid(image) {
  let texture = await loadTexture(image.url);
  // let height = image.height
  // let width = image.width
  let height = 10
  let width = 10

  const geometry = new THREE.BufferGeometry();

  let vertices = new Float32Array(height * width * 3)
  let uvs = new Float32Array(height * width * 2)
  for (let h = 0; h < height ; h++) {
    for(let w = 0; w < width ; w++) {
      let x = -1 + w * dx
      let y = 2
      let z = -1 + h * dx
      let i = h * width + w
      vertices[i * 3] = x
      vertices[i * 3 + 1] = y
      vertices[i * 3 + 2] = z

      uvs[i * 2] = w / width
      uvs[i * 2 + 1] = h / height
    }
  }
  // Simulation
  let h = 5, w = 5;
  let obs_vertices = new Float32Array(h * w * 3)
  
  for(let hh =0; hh < h; hh++) {
    for(let ww =0; ww < w; ww++) {
      let x = ww * dx*1
      let y = 1
      let z = hh * dx * 1
      let i = hh * w + ww
      obs_vertices[i * 3] = x
      obs_vertices[i * 3 + 1] = y
      obs_vertices[i * 3 + 2] = z
    }
  }

  let obs_face = []
  for(let hh =0; hh < h - 1; hh++) {
    for(let ww =0; ww < w - 1; ww++) {
      let i = hh * w + ww
      obs_face.push(i, i + w, i + w + 1)
      obs_face.push(i, i + w + 1, i + 1)
    }
  }
  let obs_faceArray = new Uint32Array(obs_face)

  // if vertices in cloth are not colliding with obstacle face, then move them down
  // if vertices in cloth are colliding with obstacle face, then move them up at distance min_d from the obstacle face
  let min_d = 0.01
  for(let f=0; f<obs_face.length/3; f++) {
    let pts = [
      [obs_vertices[obs_face[f*3]*3], obs_vertices[obs_face[f*3]*3+1], obs_vertices[obs_face[f*3]*3+2]],
      [obs_vertices[obs_face[f*3+1]*3], obs_vertices[obs_face[f*3+1]*3+1], obs_vertices[obs_face[f*3+1]*3+2]],
      [obs_vertices[obs_face[f*3+2]*3], obs_vertices[obs_face[f*3+2]*3+1], obs_vertices[obs_face[f*3+2]*3+2]],
    ]
    let normal = new THREE.Vector3()
    let v1 = new THREE.Vector3()
    let v2 = new THREE.Vector3()
    v1.set(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1], pts[1][2] - pts[0][2])
    v2.set(pts[2][0] - pts[0][0], pts[2][1] - pts[0][1], pts[2][2] - pts[0][2])
    normal.crossVectors(v1, v2)
    normal.normalize()
    let d = normal.dot(new THREE.Vector3(0, 1, 0))
    if(d < 0) {
      normal.multiplyScalar(-1)
    }
    for(let i=0; i<vertices.length/3; i++) {
      let pt = new THREE.Vector3(vertices[i*3], vertices[i*3+1], vertices[i*3+2])
      let v = pt.sub(new THREE.Vector3(pts[0][0], pts[0][1], pts[0][2]))
      let dist = v.dot(normal)
      console.log('dist', dist)
      if(dist > min_d) {
        vertices[i*3] += normal.x * (min_d - dist)
        vertices[i*3+1] += normal.y * (min_d - dist)
        vertices[i*3+2] += normal.z * (min_d - dist)
      }
    }
  }


  let obs_geometry = new THREE.BufferGeometry();
  obs_geometry.setAttribute('position', new THREE.BufferAttribute(obs_vertices, 3));
  obs_geometry.setIndex(new THREE.BufferAttribute(obs_faceArray, 1));
  obs_geometry.computeVertexNormals();
  let obs_material = new THREE.MeshBasicMaterial({ color: 0xff0000});
  obs_material.side = THREE.DoubleSide;
  let obs_mesh = new THREE.Mesh(obs_geometry, obs_material);


  let faces = [];
  for (let i = 0; i < height - 1; i++) {
      for (let j = 0; j < width - 1; j++) {
          let index = i * width + j;
          faces.push(index, index + width, index + width + 1);
          faces.push(index, index + width + 1, index + 1);
      }
  }
  let facesArray = new Uint32Array(faces);

  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(new THREE.BufferAttribute(facesArray, 1));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

  geometry.computeVertexNormals();


  // let material = new THREE.MeshBasicMaterial({ map: texture});
  let material = new THREE.MeshBasicMaterial({ color: 0x00ff00});
  material.side = THREE.DoubleSide;
  let mesh = new THREE.Mesh(geometry, material);

  console.log('mesh', mesh)

  // group cloth and obstacle
  let group = new THREE.Group();
  group.add(mesh);
  group.add(obs_mesh);

  return group
}

async function createWorld() {
  const scene = useScene()
  // let depth_data = await get_image_data(`/images/3d/${name}_depth_32.png`)
  let [image, image_data] = await get_image_data(states.image_url)


  const model = await cloth_grid(image)
  scene.add(model);


  orbitController = useOrbitControl()
  const camera = useCamera()

  // orbitController.attach(camera)
  // const transformController = useTransformControl()

  // transformController.attach(pointCloud)

  // scene.add(transformController)

  camera.position.set(0, 0, 10)

}

function onFrame(e) {
  // const scene = useScene()
  // const renderer = useRenderer()
  // if(!orbitController) return
  // orbitController.update()
  // // manager.update()
  // renderer.render(scene, camera)
}
onBeforeUnmount(()=> {
  const scene = useScene()
  scene.remove(model)
})
async function saveRender() {
  const scene = useScene()
  const renderer = useRenderer()
  const camera = useCamera()
  const canvas = renderer.domElement
  const dataUrl = canvas.toDataURL('image/png')
  const image = await downloadImage(dataUrl)
  const link = document.createElement('a')
  link.download = 'render.png'
  link.href = image
  link.click()
}
</script>
