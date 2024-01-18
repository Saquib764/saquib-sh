<template>
  <div class="video-demo-recorder">
    <div class="video-demo-recorder__container">
      <video v-show="states.isCameraRecordOn" ref="cameraVideoEl" class="mirror" autoplay></video>
      <video v-show="states.isScreenRecordOn" ref="screenVideoEl" :class="states.isCameraRecordOn? 'screen-record':''" autoplay></video>
    </div>
    <div class="action-holder">
      <!-- This sections contains buttons to start/stop video recording, screen recording, sound input device selection -->
      <v-menu transition="scale-transition">
        <template v-slot:activator="{ props }">
          <div>
            <v-btn
              variant="text"
              v-show="states.isMicrophoneRecordOn"
              @click="toggleMicrophone()"
              icon="mdi-microphone"
              append-icon="mdi-menu-down" />
            <v-btn
              variant="text"
              v-show="!states.isMicrophoneRecordOn"
              @click="toggleMicrophone()"
              icon="mdi-microphone-off"
              append-icon="mdi-menu-down" />
            <v-btn
              :disabled="!states.isMicrophoneRecordOn"
              variant="text"
              v-bind="props"
              icon="mdi-menu-down" />
          </div>
        </template>

        <v-list>
          <v-list-item
            v-for="(item, i) in states.audioInputs"
            :key="i"
            color="green"
            :active="item.deviceId === states.selectedAudioInput"
            @click="states.selectedAudioInput = item.deviceId"
            :prepend-icon="item.deviceId === states.selectedAudioInput ? 'mdi-check' : ''"
            :title="item.label"/>
        </v-list>
      </v-menu>
      <v-btn
        v-show="states.isCameraRecordOn"
        @click="toggleCamera()"
        icon="mdi-camera"
        variant="text" />
      <v-btn
        v-show="!states.isCameraRecordOn"
        @click="toggleCamera()"
        icon="mdi-camera-off"
        variant="text" />
      <v-btn
        v-show="!states.isRecording"
        prepend-icon="mdi-record"
        variant="text"
        @click="startRecord()">
        <span v-show="states.isPreparingToRecord">Preparing...</span>
        <span v-show="!states.isPreparingToRecord">Record</span>
      </v-btn>
      <v-btn
        v-show="states.isRecording"
        prepend-icon="mdi-stop"
        variant="text"
        @click="stopRecord()">Recording...</v-btn>

      <v-btn
        v-show="states.isScreenRecordOn"
        @click="toggleScreen()"
        icon="mdi-monitor"
        variant="text" />
      <v-btn
        v-show="!states.isScreenRecordOn"
        @click="toggleScreen()"
        icon="mdi-monitor-off"
        variant="text" />
        
    </div>
  </div>
</template>


<script setup>
import { ref, watch, reactive, onMounted, onBeforeUnmount, onBeforeMount } from 'vue'

// use javascript media recorder api to record video
useHead({
  title: "Free video demo recorder - saquib alam",
  meta: [{
    name: "description",
    content: "Record your video and screen using browser for free."
  }]
})

useSeoMeta({
  title: "Free video demo recorder - saquib alam",
  ogTitle: "Free video demo recorder - saquib alam",
  description: "Record your video and screen using browser for free.",
  ogDescription: "Record your video and screen using browser for free.",
  // image: "https://qr.zust.ai/images/qr-code.jpg",
  // ogImage: 'https://qr.zust.ai/images/qr-code.jpg',
  // twitterCard: 'summary_large_image',
})

const states = reactive({
  audioInputs: [],
  selectedAudioInput: null,

  isMicrophoneRecordOn: false,
  isCameraRecordOn: false,
  isScreenRecordOn: false,

  isRecording: false,
  isPreparingToRecord: false,
})

const streams = reactive({
  camera: {
    stream: null,
    recorder: null,
    chunks: [],
  },
  microphone: {
    stream: null,
    recorder: null,
    chunks: [],
  },
  screen: {
    stream: null,
    recorder: null,
    chunks: [],
  }
})

const cameraVideoEl = ref(null)
const screenVideoEl = ref(null)

function getAudioInputs() {
  navigator.mediaDevices.enumerateDevices()
  .then((devices)=>{
    const audioInputs = devices.filter((device)=>{
      return device.kind === 'audioinput'
    })
    states.audioInputs = audioInputs
    states.selectedAudioInput = audioInputs[0].deviceId
  })
}

async function toggleMicrophone() {
  if(states.isMicrophoneRecordOn) {
    streams.microphone.stream.getTracks().forEach((track)=>{
      track.stop()
    })
    states.isMicrophoneRecordOn = false
    return
  }
  const stream = await navigator.mediaDevices.getUserMedia({audio: true})
  streams.microphone.stream = stream
  states.isMicrophoneRecordOn = true
}

async function toggleCamera() {
  if(states.isCameraRecordOn) {
    streams.camera.stream.getTracks().forEach((track)=>{
      track.stop()
    })
    states.isCameraRecordOn = false
    return
  }
  const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false})
  streams.camera.stream = stream
  states.isCameraRecordOn = true
  cameraVideoEl.value.srcObject = stream
}

async function toggleScreen() {
  if(states.isScreenRecordOn) {
    streams.screen.stream.getTracks().forEach((track)=>{
      track.stop()
    })
    states.isScreenRecordOn = false
    return
  }
  const stream = await navigator.mediaDevices.getDisplayMedia({video: true, audio: false})
  // stop on stream end
  stream.getVideoTracks()[0].onended = (e)=>{
    states.isScreenRecordOn = false
  }
  streams.screen.stream = stream
  states.isScreenRecordOn = true
  screenVideoEl.value.srcObject = stream
}

async function startRecord() {
  states.isPreparingToRecord = true

  if(states.isCameraRecordOn) {
    if(!states.isMicrophoneRecordOn) {
      recordStream('camera', streams.camera.stream)
    }else{
      let stream = []
      stream = stream.concat(streams.camera.stream.getVideoTracks())
      stream = stream.concat(streams.microphone.stream.getAudioTracks())
      const stream2 = new MediaStream(stream)
      recordStream('camera', stream2)
    }
  }
  if(states.isScreenRecordOn) {
    if(!states.isMicrophoneRecordOn || states.isCameraRecordOn || (!states.isCameraRecordOn && !states.isMicrophoneRecordOn)) {
      recordStream('screen', streams.screen.stream)
    }else{
      let stream = []
      stream = stream.concat(streams.screen.stream.getVideoTracks())
      stream = stream.concat(streams.microphone.stream.getAudioTracks())
      const stream2 = new MediaStream(stream)
      recordStream('screen', stream2)
    }
  }
  await sleep(1000)
  states.isRecording = true
  states.isPreparingToRecord = false
}
function stopRecord() {
  if(states.isCameraRecordOn) {
    streams.camera.recorder.stop()
  }
  if(states.isScreenRecordOn) {
    streams.screen.recorder.stop()
  }
  states.isRecording = false
}

function recordStream(device_name, stream) {
  if(!device_name || !stream) {
    return
  }
  const device = streams[device_name]
  device.recorder = new MediaRecorder(stream)
  device.recorder.start()
  device.recorder.ondataavailable = (e)=>{
    console.log('data', device_name)
    device.chunks.push(e.data)
  }
  // Download on stop
  if(device_name != 'microphone') {
    device.recorder.onstop = (e)=>{
      const blob = new Blob(device.chunks, {type: 'video/webm'})
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      document.body.appendChild(a)
      a.style = 'display: none'
      a.href = url
      a.download = `${device_name}.webm`
      a.click()
      window.URL.revokeObjectURL(url)
    }
  }else{
    // Device is microphone
    device.recorder.onstop = (e)=>{
      const blob = new Blob(device.chunks, {type: 'audio/mp3'})
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      document.body.appendChild(a)
      a.style = 'display: none'
      a.href = url
      a.download = `${device_name}.mp3`
      a.click()
      window.URL.revokeObjectURL(url)
    }
  }
}

onMounted(async ()=>{
  getAudioInputs()
  await toggleCamera()
  await toggleMicrophone()
})
onBeforeUnmount(()=>{
  stopRecord()
})

</script>

<style scoped lang="scss">
.video-demo-recorder {
  width: 100vw;
  height: 100vh;

  .video-demo-recorder__container {
    position: relative;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;

    video {
      width: 100%;
      height: 100%;
      object-fit: cover;

      &.screen-record {
        position: absolute;
        top: 30px;
        right: 10px;
        width: 30vw;
        max-height: 30vw;
        border-radius: 20px;
        height: unset;
        box-shadow: 0 0 10px 0 rgba(0,0,0,0.5);
        border: solid 4px rgb(40, 40, 40);
      }
      &.mirror {
        transform: scaleX(-1);
      }
    }
  }
}

.action-holder {
  display: flex;
  gap: 30px;
  position: absolute;
  bottom: 30px;
  left: 50vw;
  background: rgb(22, 21, 21);
  color: white;
  padding: 10px 30px;
  border-radius: 10px;
  transform: translateX(-50%);
  align-items: center;
  justify-content: center;
}
</style>