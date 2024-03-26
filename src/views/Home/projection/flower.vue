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


let balls = []
let N = 100
let n = 0
let start_position = {
  x: 0,
  y: 0,
  z: 0,
}

const COLORS = [
  0xff0000,
  0x00ff00,
  0x0000ff,
  0xffff00,
  0xff00ff,
  0x00ffff,
]

function onFrame() {
  let scene = useScene()
  let t = (Date.now() - start) / 1000.0
  let dt = t - last_time
  
  // console.log('onFrame', t, dt, 1.0/dt)

  if(balls.length < N) {
    for(let i = 0; i < n; i++) {
      let ball = {
        r: 0.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        added_at: t,
        duration: 5 * Math.random() + 1,
        id: `${Date.now()}_${Math.floor(Math.random()*1000)}`,
        acceleration: {
          x: (Math.random() - 0.5) * 3,
          y: Math.random()*3 + 2,
          z: 0
        }
      }
      let ball_model = new THREE.Mesh(
        new THREE.SphereGeometry(ball.r, 32, 32),
        new THREE.MeshBasicMaterial({color: ball.color, transparent: true, opacity: 1})
      )
      ball_model.position.set(
        start_position.x,
        start_position.y,
        start_position.z,
      )
      ball_model.name = ball.id
      balls.push(ball)
      scene.add(ball_model)
    }
  }

  // remove balls
  balls = balls.filter((ball) => {
    let ball_model = scene.getObjectByName(ball.id)
    let age = t - ball.added_at
    ball_model.material.opacity = 0.8 * (1 -  Math.max(0, age - (ball.duration - 1)))
    if(age > ball.duration) {
      scene.remove(ball_model)
      return false
    }
    return true
  })

  // move all objects
  balls.forEach((ball) => {
    let ball_model = scene.getObjectByName(ball.id)
    ball_model.position.x += ball.acceleration.x * dt
    ball_model.position.y += ball.acceleration.y * dt
    ball_model.position.z += ball.acceleration.z * dt
  })

  last_time = t
}

async function init_microphone() {
  // initialise microphone and call cb when ever data is received
  const audioContext = new window.AudioContext()
  const microphone = await navigator.mediaDevices.getUserMedia({ audio: true, video: false})


  const source = audioContext.createMediaStreamSource(microphone)

  const analyser = audioContext.createAnalyser()
  analyser.fftSize = 2048
  source.connect(analyser)

  const data = new Uint8Array(analyser.frequencyBinCount)
  const loop = () => {
    // analyser.getByteFrequencyData(data)
    analyser.getByteTimeDomainData(data)
    
    let max = data.reduce((a, b) => Math.max(a, Math.abs(b-128.0)), 0.0) / data.length
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
  .container {
    margin-top: 20px;
  }
}
</style>
