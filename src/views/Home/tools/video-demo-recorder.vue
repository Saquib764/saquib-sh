<template>
  <div class="video-demo-recorder">
    <div class="video-demo-recorder__container">
      <video ref="videoEl" class="mirror" autoplay></video>
    </div>
    <v-btn @click="stopCamera()">stop</v-btn>
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

    console.log(_stream.getTracks())

    recordStream(_stream)
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

    // print tracks
    console.log(_stream.getTracks())
    streams.screen = _stream
    recordStream(_stream)
  })
  .catch((err)=>{
    console.log(err)
  })
}
function recordStream(stream) {
  streams.recorder = new MediaRecorder(stream)
  streams.recorder.ondataavailable = (e)=>{
    streams.chunks.push(e.data)
  }
  streams.recorder.onstop = (e)=>{
    const blob = new Blob(streams.chunks, {type: 'video/webm'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'test.webm'
    a.click()
    URL.revokeObjectURL(url)
  }
  streams.recorder.start()
}
function stopCamera() {
  streams.camera?.getTracks().forEach((track)=>{
    track.stop()
  })
}

onMounted(()=>{
  // startScreen()
  // startCamera()
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