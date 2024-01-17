<template>
  <div>
    <three-js>
      <ambient-light/>
      <grid-helper/>
      <!-- <basic-cube :position="{x: 0, y: 0, z: 0}"/> -->
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

async function get_image_data(url) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  const image = await getImageFromUrl(url);

  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image.image, 0, 0);

  return ctx.getImageData(0, 0, image.width, image.height)
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

function normalize_depth(depth_data) {
  const [min, max] = get_min_max(depth_data)
  for (let i = 0; i < depth_data.data.length; i++) {
    const depth = depth_data.data[i]
    depth_data.data[i] = (depth - min) * 255.0 / (max - min)
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
      depth.data[i] = (depth_data.data[i] / 255.0) * M
    }
  }
  return depth
}

function get_real_depth_from_depth_map(grascale_image_data) {
  const depth = new jsfeat.matrix_t(grascale_image_data.cols, grascale_image_data.rows, jsfeat.F64_t | jsfeat.C1_t);

  // Get the fourth channel from image data
  for (let i = 0; i < grascale_image_data.data.length; i++) {
    const nd = grascale_image_data.data[i] / M
    depth.data[i] = 255 * 2/(nd + 1)
  }
  return depth
}

function depth_to_3d(depth_data, image_data) {
  const points = []
  const colors = []
  const sizes = []
  let ox = image_data.width / 2
  let oy = image_data.height / 2
  let f = 0.001

  for (let i = 0; i < image_data.width * image_data.height; i++) {
    const depth = 1 - depth_data.data[i] / M
    // const z = 100 * (depth - 255) / 255.0
    const z = -10.0 / (depth + 0.0010)

    const u = i % image_data.width
    const v = Math.floor(i / image_data.width)
    let x =  -(u - ox) * z * f
    let y =  -(v - oy) * z * f
    points.push(new THREE.Vector3(x, 0-y, 10 + z))

    colors.push(image_data.data[i * 4]/255.0, image_data.data[i * 4 + 1]/255.0, image_data.data[i * 4 + 2]/255.0)

    sizes.push(Math.abs(30*f*z))
  }
  return [points, colors, sizes]
}

const vertexShader = `
attribute float size;
varying vec3 vColor;

void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (100.0 / -mvPosition.z);
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


// const mode = 'F32'
// const M = Math.pow(2, 32) - 1
const mode = 'U8'
const M = Math.pow(2, 8) - 1

onMounted(async ()=>{
  const scene = useScene()
  let name = 'car4'
  // let depth_data = await get_image_data(`/images/3d/${name}_depth_32.png`)
  let depth_data = await get_image_data(`/images/3d/${name}_depth_marigold.png`)
  let image_data = await get_image_data(`/images/3d/${name}.png`)

  console.log('depth_data', depth_data)

  let depth_u8 = new jsfeat.matrix_t(depth_data.height, depth_data.width, jsfeat.U8_t | jsfeat.C1_t);
  jsfeat.imgproc.grayscale(depth_data.data, depth_data.height, depth_data.width, depth_u8);


  let depth_u32;
  if(mode == 'F32') {
    depth_u32 = get_depth_32(depth_data)
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

  // let image_u8 = new jsfeat.matrix_t(1024, 1024, jsfeat.U8_t | jsfeat.C1_t);
  // jsfeat.imgproc.grayscale(image_data.data, 1024, 1024, image_u8);

  // const [min, max] = normalize_depth(depth_u8)

  // Sample array of 3D points
  const [points, colors, sizes] = depth_to_3d(depth_u32, image_data);

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

  scene.add(pointCloud);


  orbitController = useOrbitControl()
  const camera = useCamera()

  orbitController.target.set(0, 0, 0)
  // orbitController.attach(camera)
  // const transformController = useTransformControl()

  // transformController.attach(pointCloud)

  // scene.add(transformController)

})

function onFrame(e) {
  // const scene = useScene()
  // const renderer = useRenderer()
  // if(!orbitController) return
  // orbitController.update()
  // // manager.update()
  // renderer.render(scene, camera)
}
</script>
