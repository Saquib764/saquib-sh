<template>
  <div class="video-demo-recorder">
    <div class="video-demo-recorder__container">
      <video ref="video" class="mirror" autoplay></video>
    </div>
  </div>
</template>


<script setup>
import { ref, watch, reactive, onMounted, onBeforeUnmount, onBeforeMount } from 'vue'

// use javascript media recorder api to record video

const states = reactive({
})

const streams = reactive({
  recorder: null,
  camera: null,
  screen: null,
  video: null,
  chunks: [],
})

const videoEl = ref(null)

function startCamera() {
  navigator.mediaDevices.getUserMedia({video: true, audio: true})
  .then((_stream)=>{
    videoEl.value.srcObject = _stream
    streams.camera = _stream
  })
}
function startScreen() {
  // online on browser
  // if(!navigator.mediaDevices.getDisplayMedia) {
  //   alert('getDisplayMedia API is not supported by this browser')
  //   return
  // }
  navigator.mediaDevices.getDisplayMedia({video: true, audio: true})
  .then((_stream)=>{
    videoEl.value.srcObject = _stream
    streams.screen = _stream
  })
  .catch((err)=>{
    console.log(err)
  })
}
function stopCamera() {
  streams.camera?.getTracks().forEach((track)=>{
    track.stop()
  })
}

onMounted(()=>{
  startScreen()
})
onBeforeUnmount(()=>{
  stopCamera()
})

</script>

<style scoped lang="scss">
.video-demo-recorder {
  width: 100vw;
  height: 100vh;
}
.mirror {
  transform: scaleX(-1);
}
</style>