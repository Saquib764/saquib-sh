<template>
  <div class="projection">
    <div class="container">
      <div class="row">
        <v-btn @click="init_microphone">Start</v-btn>
      </div>
      <div class="row">
        <div style="display: grid;">
          <three-js>
            <viewer :width="512" :height="512"/>
            <ambient-light/>
            <arcball-controller :disabled="false"/>
            <!-- <basic-cube :position="{x: 0, y: 0, z: 4}"/> -->
            <point-light :x="states.x" :y="states.y" :z="states.z"/>
            <animation-loop :on-frame="onFrame" :autostart="true"/>
          </three-js>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, reactive, onMounted, onBeforeUnmount, onBeforeMount } from 'vue'
import ThreeJs from '@/components/ThreeJs.vue';
import ModelLoader from '@/components/ModelLoader.vue';
import AmbientLight from '@/components/AmbientLight.vue';
import Viewer from '@/components/Viewer.vue';
import OrbitController from '@/components/OrbitController.vue';
import ArcballController from '@/components/ArcballController.vue';
import BasicCube from '@/components/BasicCube.vue';
import PointLight from '@/components/PointLight.vue';
import { useRoute } from 'vue-router'
import * as THREE from 'three'

const route = useRoute()

const states = reactive({
  model: null,
  x: 5,
  y: -10,
  z: 20,
})
let start = Date.now()
let last_time = 0


let shapes = []
let N = 1000
let n = 0
let f = 70
let last_color_change_at = 0
let last_generated_at = 0
let start_position = {
  x: 0,
  y: 0,
  z: 0,
}

let PATHS = [
  [{
    x: 0,
    y: -9*9 / (2 * 10) - 3,
    z: 0,
    duration: 2*10 / 9 - 2
  }, {
    x: -10,
    y: 1,
    z: 0,
    duration: 0.6
  }, {
    x: 20,
    y: -15,
    z: 1,
    duration: 0.8
  }, {
    x: -15,
    y: 15,
    z: -5,
    duration: 0.8
  }, {
    x: 15,
    y: -10,
    z: 0,
    duration: 0.5
  }, {
    x: -10,
    y: 1,
    z: 0,
    duration: 0.6
  }, {
    x: -5,
    y: -5,
    z: 0,
    duration: 0.9
  }],
  [{
    x: 0,
    y: -9*9 / (2 * 10) + 2,
    z: 0,
    duration: 2*10 / 9
  }, {
    x: -10,
    y: 1,
    z: 0,
    duration: 0.6
  }, {
    x: 20,
    y: -15,
    z: 1,
    duration: 0.8
  }, {
    x: -15,
    y: 15,
    z: -5,
    duration: 0.8
  }, {
    x: 15,
    y: -2,
    z: 0,
    duration: 0.5
  }, {
    x: -1,
    y: 1,
    z: 0,
    duration: 0.6
  }, {
    x: -5,
    y: -5,
    z: 0,
    duration: 0.9
  }],
  [{
    x: 0,
    y: -9*9 / (2 * 10),
    z: 0,
    duration: 2*10 / 9 - 0.5
  }, {
    x: -15,
    y: 0,
    z: 20,
    duration: 0.6
  }, {
    x: 20,
    y: -15,
    z: 1,
    duration: 0.8
  }, {
    x: -15,
    y: 15,
    z: -5,
    duration: 0.8
  }, {
    x: 15,
    y: -2,
    z: 0,
    duration: 0.5
  }, {
    x: -1,
    y: 1,
    z: 0,
    duration: 0.6
  }, {
    x: -5,
    y: -5,
    z: 0,
    duration: 0.9
  }],
  [{
    x: 0,
    y: -9*9 / (2 * 10),
    z: 0,
    duration: 2*10 / 9 - 1
  }, {
    x: 5,
    y: 0,
    z: 10,
    duration: 0.5
  }, {
    x: 2,
    y: -15,
    z: 0,
    duration: 0.8
  }, {
    x: -20,
    y: 10,
    z: -5,
    duration: 0.8
  }, {
    x: 15,
    y: 0,
    z: 0,
    duration: 0.5
  }, {
    x: -5,
    y: 1,
    z: 0,
    duration: 0.6
  }, {
    x: 15,
    y: 4,
    z: 0,
    duration: 0.9
  }],
  [{
    x: 0,
    y: -9*9 / (2 * 10),
    z: 0,
    duration: 2*10 / 9 - 1
  }, {
    x: -30,
    y: -20,
    z: 0,
    duration: 0.5
  }, {
    x: 20,
    y: 16,
    z: 10,
    duration: 0.9
  }, {
    x: 2,
    y: -20,
    z: -10,
    duration: 0.6
  }, {
    x: 10,
    y: 10,
    z: 0,
    duration: 0.5
  }, {
    x: -5,
    y: 1,
    z: 0,
    duration: 0.6
  }],
]

const COLORS = [
  '#ffff66',
  '#3366ff',
  '#ff5c33',
  '#ffe6ff'
]

let color = COLORS[Math.floor(Math.random() * COLORS.length)]
let path = 0

function leaf_spine(t) {
  return 1.0 * (t-1) * (t-0) *( t-0.2)
}

function get_leaf(option) {
  // Create leaf shape vertices
  let leafVertices = [];
  let dn = 15;
  let ys = []
  let xs = []
  let p = 15
  let l = 1

  for(let i=0; i<dn; i++) {
    let theta = i * Math.PI / (dn - 1)
    let r = l / Math.pow(Math.cos(theta/4) + Math.sin(theta/4), p)
    xs.push(r * Math.cos(theta))
    ys.push(r * Math.sin(theta))
  }
  // console.log('xs', xs)
  // console.log('ys', ys)
  for(let i=0; i<dn; i++) {
    let t = i / (dn - 1)
    let s = leaf_spine(t)
    leafVertices.push(xs[i], ys[i] + s, 0)
  }
  for(let i=dn-2; i>=0; i--) {
    let t = i / (dn - 1)
    let s = leaf_spine(t)
    leafVertices.push(xs[i], -ys[i] + s, 0)
  }
  leafVertices.push(xs[0], ys[0], 0)

  // console.log('leafVertices', leafVertices.length/3)

  // Create indices to define faces
  let leafIndices = [];

  for(let i=0; i<leafVertices.length/3-2; i++) {
    leafIndices.push(0, i+1, i+2)
  }

  // Create leaf shape geometry
  let leafGeometry = new THREE.BufferGeometry();
  leafGeometry.setAttribute('position', new THREE.Float32BufferAttribute(leafVertices, 3));
  leafGeometry.setIndex(leafIndices);

  // Material and mesh (Red material)
  let material = new THREE.MeshPhongMaterial({ color: option.color, side: THREE.DoubleSide, transparent: true, opacity: 0.8});
  let mesh = new THREE.Mesh(leafGeometry, material);
  return mesh
}

function onFrame() {
  let scene = useScene()
  let t = (Date.now() - start) / 1000.0
  let dt = t - last_time
  
  // console.log('onFrame', t, dt, 1.0/dt)

  if(shapes.length < N && n > 0 & t - last_generated_at > 1.0/f) {
    if(t-last_color_change_at > 10.0/f) {
      last_color_change_at = t
      color = COLORS[Math.floor(Math.random() * COLORS.length)]
      path = Math.floor(Math.random() * PATHS.length)
    }
    for(let i = 0; i < 7; i++) {
      let shape = {
        r: 0.5,
        color,
        added_at: t,
        duration: 1 * Math.random() + 5,
        id: `${Date.now()}_${Math.floor(Math.random()*1000)}`,
        path: path,
        linear: {
          acceleration: {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 0,
            z: 0
          },
          velocity: {
            x: 0,
            y: 9.1,
            z: 0
          },
          position: {
            x: start_position.x + (Math.random() - 0.5) * 0.2,
            y: start_position.y,
            z: start_position.z
          }
        },
        angular: {
          acceleration: {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2,
            z: (Math.random() - 0.5) * 2
          },
          velocity: {
            x: 0,
            y: 0,
            z: 0
          },
          position: {
            x: Math.random() * Math.PI * 0.,
            y: Math.random() * Math.PI * 0,
            z: (0.5 + (Math.random() - 0.5)*0.8) * Math.PI
          }
        }
      }
      shape.linear.position.x += (Math.random() - 0.5) * 2
      let leaf_model = get_leaf(shape)
      leaf_model.position.set(
        shape.linear.position.x,
        shape.linear.position.y,
        shape.linear.position.z,
      )
      leaf_model.rotation.set(
        shape.angular.position.x,
        shape.angular.position.y,
        shape.angular.position.z,
      )
      leaf_model.name = shape.id
      shapes.push(shape)
      scene.add(leaf_model)

      last_generated_at = t
    }
  }

  // remove shapes
  shapes = shapes.filter((shape) => {
    let shape_model = scene.getObjectByName(shape.id)
    let age = t - shape.added_at
    shape_model.material.opacity = 0.8 * (1 -  Math.max(0, age - (shape.duration - 1)))
    if(age > shape.duration) {
      scene.remove(shape_model)
      return false
    }
    return true
  })
  
  // move all objects
  shapes.forEach((shape) => {
    let shape_model = scene.getObjectByName(shape.id)
    let age = t - shape.added_at

    let path = PATHS[shape.path]
    let acc = path.reduce((acc, p) => {
      acc[0] += p.duration
      if(acc[0] < age) {
        acc[1]++
      }
      return acc
    }, [0, 0])
    let acc_path = path[acc[1]] || {x: 0, y: 0, z: 0}
    shape.linear.velocity.x += (acc_path.x + (Math.random() - 0.5) * 6) * dt
    shape.linear.velocity.y += (acc_path.y + (Math.random() - 0.5) * 6) * dt
    shape.linear.velocity.z += (acc_path.z + (Math.random() - 0.5) * 0.2 ) * dt

    shape.linear.position.x += shape.linear.velocity.x * dt
    shape.linear.position.y += shape.linear.velocity.y * dt
    shape.linear.position.z += shape.linear.velocity.z * dt
    
    shape_model.position.set(
      shape.linear.position.x,
      shape.linear.position.y,
      shape.linear.position.z,
    )

    shape.angular.velocity.x += shape.angular.acceleration.x * dt
    shape.angular.velocity.y += shape.angular.acceleration.y * dt
    shape.angular.velocity.z += shape.angular.acceleration.z * dt

    shape.angular.position.x += shape.angular.velocity.x * dt
    shape.angular.position.y += shape.angular.velocity.y * dt
    shape.angular.position.z += shape.angular.velocity.z * dt
  })

  last_time = t
}

async function init_microphone() {
  // initialise microphone and call cb when ever data is received
  const audioContext = new window.AudioContext()
  const microphone = await navigator.mediaDevices.getUserMedia({ audio: true, video: false})

  const source = audioContext.createMediaStreamSource(microphone)

  const analyser = audioContext.createAnalyser()
  analyser.fftSize = 1024
  source.connect(analyser)

  const amp = new Uint8Array(analyser.frequencyBinCount)
  const freq = new Uint8Array(analyser.frequencyBinCount)
  const loop = () => {
    analyser.getByteFrequencyData(freq)
    analyser.getByteTimeDomainData(amp)

    let freqs = [0, 0, 0]
    let max_freq = 70
    let offset = 0
    for(let i=0; i<3; i++) {
      freqs[i] = freq.slice(i * max_freq + offset, (i+1) * max_freq + offset).reduce((a, b) => a + b / 128, 0) / max_freq
    }
    // console.log('freqs', freqs)
    let max = amp.reduce((a, b) => Math.max(a, Math.abs(b-128.0)), 0.0) / amp.length
    n = Math.floor(100 * max)

    requestAnimationFrame(loop)
  }
  loop()
}

onMounted(() => {
  // init_microphone()
})

</script>

<style lang="scss" scoped>
.projection {
  background: black;
  .container {
    margin-top: 20px;
  }
}
</style>
