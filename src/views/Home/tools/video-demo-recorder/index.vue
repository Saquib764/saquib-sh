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
    <div class="recording-holder">
      <span v-show="states.recordings.length === 0">Your recorded clips will appear here.</span>
      <div v-for="(recording, i) in states.recordings" :key="i" class="recording">
        <img :src="recording.camera" />
      </div>
      <v-spacer />
      <v-btn
        @click="clearRecordings()"
        variant="tonal"
        >Clear</v-btn>
      <v-btn
        href="/tools/video-demo-recorder/editor"
        :disabled="states.recordings.length == 0"
        variant="tonal"
        >Merge</v-btn>
    </div>
  </div>
</template>


<script setup>
import { ref, watch, reactive, onMounted, onBeforeUnmount, onBeforeMount } from 'vue'
import localForage from 'localforage'
import {createVideoThumbnail} from '@/utils/common'

if(process.client) {
  localForage.setDriver(localForage.INDEXEDDB)
}

const db = localForage.createInstance({
  name: 'video-demo-recorder',
  storeName: 'video-demo-recorder',
})

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

  recordings: []
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

let blobs = {
  camera: null,
  screen: null,
}

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
  blobs = {
    camera: null,
    screen: null,
  }

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
async function stopRecord() {
  if(states.isCameraRecordOn) {
    streams.camera.recorder.stop()
  }
  if(states.isScreenRecordOn) {
    streams.screen.recorder.stop()
  }
  // waut for blobs to be saved
  while((states.isCameraRecordOn && !blobs.camera) || (states.isScreenRecordOn && !blobs.screen)) {
    await sleep(100)
  }
  // save blobs to indexeddb
  let recordings = await db.getItem('recordings') || []
  // recordings = []
  console.log('recordings', recordings)
  await db.setItem('recordings', [
    ...recordings,
    {
      camera: blobs.camera,
      screen: blobs.screen,
      timestamp: Date.now(),
      id: Date.now().toString(),
      title: `Rec- ${recordings.length + 1}`,
    }
  ])

  recordings = await db.getItem('recordings') || []
  states.recordings = await Promise.all(recordings.map(async (recording)=>{
    let {camera, screen, ...rest} = recording
    if(camera) {
      rest.camera = await createVideoThumbnail(URL.createObjectURL(camera))
    }
    if(screen) {
      rest.screen = await createVideoThumbnail(URL.createObjectURL(screen))
    }
    return rest
  }))
  // clear streams
  streams.camera.recorder = null
  streams.camera.chunks = []
  streams.microphone.recorder = null
  streams.microphone.chunks = []
  streams.screen.recorder = null
  streams.screen.chunks = []
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
  device.recorder.onstop = (e)=>{
    const blob = new Blob(device.chunks, {type: 'video/webm'})
    blobs[device_name] = blob
    // const url = URL.createObjectURL(blob)
    // const a = document.createElement('a')
    // document.body.appendChild(a)
    // a.style = 'display: none'
    // a.href = url
    // a.download = `${device_name}.webm`
    // a.click()
    // window.URL.revokeObjectURL(url)
  }
}

async function clearRecordings() {
  await db.setItem('recordings', [])
  states.recordings = []
}

onMounted(async ()=>{
  getAudioInputs()
  await toggleCamera()
  await toggleMicrophone()

  let recordings = await db.getItem('recordings') || []
  states.recordings = await Promise.all(recordings.map(async (recording)=>{
    let {camera, screen, ...rest} = recording
    if(camera) {
      rest.camera = await createVideoThumbnail(URL.createObjectURL(camera))
    }
    if(screen) {
      rest.screen = await createVideoThumbnail(URL.createObjectURL(screen))
    }
    return rest
  }))
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
    height: calc(100vh - 60px);
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

  .recording-holder {
    display: flex;
    gap: 10px;
    flex-direction: row;
    height: 60px;
    padding: 5px;
    align-items: center;

    &>div {
      border-radius: 8px;
      width: 100px;
      height: 100%;
      overflow: hidden;
      cursor: pointer;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

.action-holder {
  display: flex;
  gap: 30px;
  position: absolute;
  bottom: 80px;
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