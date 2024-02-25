<template>
  <div style="display: flex; flex-direction: column;">
    <div>
      <input type="range"  min="0" max="255" step="1" v-model="states.r" />
      <input type="range"  min="0" max="255" step="1" v-model="states.g" />
      <input type="range"  min="0" max="255" step="1" v-model="states.b" />
      <button @click="reset">Reset</button>
    </div>
    
    <video ref="video" width="640" height="480" autoplay muted style="transform: scaleX(-100%); display: none;"></video>
    <canvas ref="canvas" width="640" height="480"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const video = ref(null)
const canvas = ref(null)

let context = null

const states = reactive({
  r:200,
  g:200,
  b:200,
})

onMounted(() => {
  const constraints = { video: { facingMode: 'environment' } };
  navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
      video.value.srcObject = stream;
      video.value.onloadedmetadata = () => {
        video.value.play();
        trackBall();
      };
    })
    .catch((error) => {
      console.error('Error accessing webcam:', error);
    });
  
})

function reset() {
  context.clearRect(0, 0, canvas.value.width, canvas.value.height)
}

function processFrame() {
  let can = document.createElement('canvas');
  let width = canvas.value.width;
  let height = canvas.value.height;
  can.width = width;
  can.height = height;
  let ctx = can.getContext('2d');
  ctx.clearRect(0, 0, width, height); // Clear the canvas for each frame
  ctx.drawImage(video.value, 0, 0, width, height)
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const red = data[i]
    const green = data[i + 1]
    const blue = data[i + 2]

    if (isYellow(red, green, blue)) {
      // Mark the yellow ball
      const x = (i / 4) % width
      const y = Math.floor(i / 4 / width)
      context.beginPath()
      context.arc(x, y, 5, 0, 2 * Math.PI)
      context.fillStyle = 'red'
      context.fill()
    }
  }

  requestAnimationFrame(processFrame)
}

function isYellow(red, green, blue) {
  const threshold = states.b
  return red > states.r && green > states.g && blue < threshold
}

function trackBall() {
  context = canvas.value.getContext('2d')
  



  requestAnimationFrame(processFrame)
}
</script>
