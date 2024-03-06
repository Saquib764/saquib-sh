<template>
  <div class="demo-recorder-editor">

    <v-btn
      style="position: fixed; top: 10px; right: 10px;"
      color="black"
      @click="render_movie(states.resources)"
      >Render</v-btn>
    <!-- <v-btn
      style="position: fixed; top: 10px; right: 10px;"
      color="black"
      @click="render()"
      >Save</v-btn> -->
    <div class="editor-holder">
      <div class="menu-holder">
        <v-menu transition="scale-transition" location="end">
          <template v-slot:activator="{ props }">
            <div v-bind="props">Background
            </div>
          </template>

          <!-- <v-list>
            <v-list-item>Test</v-list-item>
          </v-list> -->
          <v-card>
            <v-card-title>Background</v-card-title>
            <div style="padding: 10px; width: 200px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; cursor: pointer;">
              <div>1</div>
              <div>2</div>
              <div>3</div>
              <div>4</div>
            </div>
          </v-card>
        </v-menu>
        <div>Layout</div>
        <div>Zoom</div>
      </div>
      <div>
        <canvas ref="canvasEl" style="border: 1px solid black; width: 100%;"></canvas>
        <!-- <img :src="BG" /> -->
        <!-- <video :src="currentClip?.camera_video_url" controls></video> -->
        <!-- <video v-show="currentClip?.screen_video_url" :src="currentClip?.screen_video_url" controls></video> -->
      </div>

    </div>


    <div class="recording-holder">
      <span v-show="states.recordings.length === 0">Your recorded clips will appear here.</span>
      <div
        v-for="(recording, i) in states.recordings" :key="i"
        :class="{recording: true, active: states.currentClipIndex == i}" @click="states.currentClipIndex = i">
        <img :src="recording.camera_thumbnail" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch, reactive, onMounted, onBeforeUnmount } from 'vue'

import localForage from 'localforage'
import {createVideoThumbnail, getVideoMeta, getImageFromUrl} from '@/utils/common'
import { Muxer, ArrayBufferTarget } from 'webm-muxer';


// const BG = 'https://static.vecteezy.com/system/resources/previews/026/307/268/non_2x/cool-plain-blue-abstract-background-hd-wallpaper-design-free-vector.jpg'
const BG = '/001.png'


if(process.client) {
  localForage.setDriver(localForage.INDEXEDDB)
}

const db = localForage.createInstance({
  name: 'video-demo-recorder',
  storeName: 'video-demo-recorder',
})

// use javascript media recorder api to record video
useHead({
  title: "Free video demo recording editor - saquib alam",
  meta: [{
    name: "description",
    content: "Record your video and screen using browser for free. Edit your recording"
  }]
})

useSeoMeta({
  title: "Free video demo recording editor - saquib alam",
  ogTitle: "Free video demo recording editor - saquib alam",
  description: "Record your video and screen using browser for free. Edit your recording",
  ogDescription: "Record your video and screen using browser for free. Edit your recording",
  // image: "https://qr.zust.ai/images/qr-code.jpg",
  // ogImage: 'https://qr.zust.ai/images/qr-code.jpg',
  // twitterCard: 'summary_large_image',
})

const states = reactive({
  recordings: [],
  currentClipIndex: 0,
  resources: []
})

let WIDTH = 1920
let HEIGHT = 1080

const canvasEl = ref(null)

const nuxt = useNuxtApp()
const currentClip = computed(()=>{
  return states.recordings[states.currentClipIndex]
})

async function render_movie(layers, download = false) {
  states.isLoading = true
  await load_data()
  const etro = nuxt.$etro

  canvasEl.value.willReadFrequently = true
  canvasEl.value.width = WIDTH
  canvasEl.value.height = HEIGHT

  let scale1 = fitOnCanvas({
    width: window.innerWidth - 20,  height: window.innerHeight - 20
  }, {width: WIDTH, height: HEIGHT}, 'contain')

  const movie = new etro.Movie({
    canvas: canvasEl.value, // HTML canvas element to draw on
    // actx: new AudioContext(), // Web Audio context to play through (creates a new context with default settings if omitted)
    background: etro.parseColor('#000'), // background color (dynamic, defaults to black)
    repeat: false // whether to loop forever while playing and streaming (defaults to false)
  });

  for(let i =0; i< layers.length; i++) {
    if(layers[i].type === 'audio') {
      const audio = await make_audio(etro, layers[i])
      movie.addLayer(audio)
      continue
    }
    if(layers[i].type === 'image') {
      const layer = await make_image(etro, layers[i], {width: WIDTH, height: HEIGHT})
      movie.addLayer(layer)
      continue
    }
    if(layers[i].type === 'video') {
      const layer = await make_video(etro, layers[i], {width: WIDTH, height: HEIGHT})
      movie.addLayer(layer)
      continue
    }
    if(layers[i].type === 'caption') {
      const captions = await make_caption(etro, layers[i])

      captions.map(caption => {
        movie.addLayer(caption)
      })
      continue
    }
  }

  if(!download) {
    await movie.play({
      onStart: () => {
        console.log('All resources are loaded, and playback has started.');
      }, // `onStart` is optional
    });
  }else {
    let mediaRecorder;
    let chunks = [];
    let stream = await movie.stream({
      frameRate: 60, // fps for the stream's video tracks
      video: true, // whether to render visual layers (defaults to true)
      audio: true, // whether to render layers with audio (defaults to true)
      onStart: (stream) => {
        console.log('All resources are loaded, and streaming has begun.');
        // Process stream
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();

        mediaRecorder.ondataavailable = (e) => {
          console.log('data available')
          chunks.push(e.data);
        };
      },
    });
    console.log(stream)

    console.log('The movie is done playing all');
    mediaRecorder.onstop = () => {
      console.log('recording stoped')
      let blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'movie.webm';
      a.click();
      URL.revokeObjectURL(url);
    };
    mediaRecorder.stop();
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = 'movie.webm';
    // a.click();
    // URL.revokeObjectURL(url);
  }
  console.log('The movie is done playing');
  states.isLoading = false
  states.currentStep = 3
}
async function load_data() {
  let recordings = await db.getItem('recordings') || []
  let t = 0
  for(let i=0; i<recordings.length; i++) {
    let recording = recordings[i]
    let duration = recording.duration
    let {camera, screen, ...rest} = recording
    if(camera) {
      rest.camera = camera
      rest.camera_thumbnail = await createVideoThumbnail(URL.createObjectURL(camera))
      rest.camera_video_url = URL.createObjectURL(camera)

      let meta = await getVideoMeta(rest.camera_video_url)
      duration = meta.duration
      
      states.resources.push({
        type: 'video',
        index: 100,
        src: rest.camera_video_url,
        duration: meta.duration,
        startTime: t,
        originalWidth: meta.width,
        originalHeight: meta.height,
        scale: 0.18,
        x: WIDTH * 0.9,
        y: HEIGHT * 0.85,
        effects: [{type: 'round'}]
      })
    }

    if(screen) {
      rest.screen = screen
      rest.screen_thumbnail = await createVideoThumbnail(URL.createObjectURL(screen))
      rest.screen_video_url = URL.createObjectURL(screen)
      let meta = await getVideoMeta(rest.screen_video_url)
      console.log(meta)

      duration = meta.duration
      
      states.resources.push({
        type: 'video',
        index: 50,
        src: rest.screen_video_url,
        duration: meta.duration,
        startTime: t,
        originalWidth: meta.width,
        originalHeight: meta.height,
        scale: 0.75
      })
    }
    t += duration
    states.recordings.push(rest)
  }
  console.log(t)
  states.resources.push({
    type: 'image',
    image: BG,
    index: 0,
    duration: t,
    startTime: 0,
  })
  console.log(states.recordings)
  states.resources.sort((a, b)=> a.index - b.index)
}
onMounted(async ()=>{
  // render_movie()
})

const _chunks = []
let muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: {
        codec: 'V_VP8',
        width: 1280,
        height: 720,
        bitrate: 2_000_000, // 2 Mbps
        framerate: 25,
    },
    audio: {
        codec: 'A_OPUS',
        sampleRate: 48000,
        numberOfChannels: 2,
        bitrate: 128000,
    },
    fastStart: 'in-memory'
});

function save_to_file() {
  muxer.finalize();
  console.log(muxer)
  let { buffer } = muxer.target;
  console.log(buffer)

  const blob = new Blob([buffer], {
    type: 'video/webm'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.download = 'output.webm'
  a.href = url
  a.textContent = 'Download ready'
  a.click()
  URL.revokeObjectURL(url)
}

async function render() {
  const init = {
    output: muxer.addVideoChunk.bind(muxer),
    error: (e) => {
      console.log(e.message);
    },
  };

  const frame_rate = 25
  const config = {
    codec: "vp8",
    width: 1280,
    height: 720,
    bitrate: 2_000_000, // 2 Mbps
    framerate: frame_rate,
  };

  let encoder;

  const audio_init = {
    output: muxer.addAudioChunk.bind(muxer),
    error: (e) => {
      console.log(e.message);
    },
  };
  const audio_config = {
    codec: "opus",
    sampleRate: 48000,
    numberOfChannels: 2,
    bitrate: 128000,
  };
  let audio_encoder = new AudioEncoder(audio_init);
  audio_encoder.configure(audio_config);
  
  const { supported } = await VideoEncoder.isConfigSupported(config);
  if (supported) {
    encoder = new VideoEncoder(init);
    encoder.configure(config);
  } else {
    // Try another config.
  }

  let chunks = []
  // Use canvas to draw images and capture it as video
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = 1280
  canvas.height = 720
  ctx.drawImage(await createImageBitmap(await (await fetch(BG)).blob()), 0, 0, canvas.width, canvas.height)

  const video = document.createElement('video');
  video.src = currentClip.value.camera_video_url
  video.crossOrigin = "anonymous";
  video.muted = true
  video.autoplay = true
  video.loop = true
  video.playsinline = true
  video.controls = true
  video.style.position = 'absolute'
  video.style.top = '0px'
  video.style.left = '0px'
  video.style.width = '100%'
  video.style.height = '100%'
  video.style.objectFit = 'cover'
  video.style.zIndex = '1'
  video.style.opacity = '0'
  video.style.pointerEvents = 'none'
  video.style.visibility = 'hidden'
  video.style.display = 'none'
  document.body.appendChild(video)
  await new Promise((resolve, reject)=>{
    video.onloadeddata = () => {
      resolve()
    }
  })
  video.play()
  const dt = 1.0/frame_rate

  console.log("audio", video.audioTracks)

  let audioContext = new AudioContext();
  let mediaSource = audioContext.createMediaElementSource(video);

  var destination = audioContext.createMediaStreamDestination();
  mediaSource.connect(destination);

  // get audio buffer from video

  let buffer = await video.captureStream()
  console.log('buffer', buffer)

  var audioBuffer = audioContext.createBuffer(2, dt * audioContext.sampleRate, audioContext.sampleRate);

  console.log('buffer', audioBuffer)

  let audioTrack = destination.stream.getAudioTracks()[0];

  const processor = new MediaStreamTrackProcessor({track: audioTrack});
  const reader = processor.readable.getReader();

  ctx.drawImage(video, 0, 0, canvas.width - 100, canvas.height-100)


  for(let i=0; i<152; i++) {
    video.currentTime = i * dt
    await new Promise((resolve, reject)=>{
      video.onseeked = () => {
        resolve()
      }
    })
    const readResult = await reader.read();
    console.log(readResult.value)

    const value = readResult.value;

    
    // get audio buffer from readResult.value
    const updatedTimestamp = value.timestamp + audioContext.sampleRate; // Adjust the timestamp as needed

    // Create a new AudioBuffer with the updated timestamp
    const updatedBuffer = audioContext.createBuffer(value.numberOfChannels, value.numberOfFrames, audioContext.sampleRate);
    value.copyTo(updatedBuffer, {
      planeIndex: 0,
      bufferOffset: 0,
    });

    // Set the new timestamp
    updatedBuffer.timestamp = updatedTimestamp;

    console.log(updatedBuffer, value)

    
    ctx.drawImage(video, 0, 0, canvas.width - 100, canvas.height-100)
    let frame = new VideoFrame(canvas, {
      format:"RGBA",
      codedWidth:1280,
      codedHeight:720,
      timestamp:Math.round(i * dt * 1000000),
      duration:Math.round(dt * 1000000)
    })
    
    audio_encoder.encode(audioData);
    
    const keyFrame = i % 150 == 0;
    encoder.encode(frame, { keyFrame });
    frame.close();
  }
  await encoder.flush()
  save_to_file()
}

</script>

<style lang="scss" scoped>
.editor-holder {
  display: flex;
  height: calc(100vh - 60px);
  padding: 10px;
  gap: 10px;

  &>div {
    &.menu-holder {
      width: 200px;
      overflow: hidden;
      cursor: pointer;
      font-size: 12px;
      gap: 10px;
      display: flex;
      flex-direction: column;
      aspect-ratio: unset;


      &>div {
        background: rgb(207, 225, 185);
        padding: 10px;
        border-radius: 8px;
      }
    }
    border-radius: 8px;
    width: 100%;
    overflow: hidden;
    cursor: pointer;
    aspect-ratio: 16/9;
    margin: auto;
    position: relative;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    video {
      position: absolute;
      border-radius: 10px;
      object-fit: cover;
      top: 0;
      left: 0;
      width: 70%;
      max-height: calc(100vh - 60px);

      left: 50%;
      top: 50%;
      transform: translateY(-50%) translateX(-50%);
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

    &.active {
      border: solid 3px rgb(30, 151, 32);
    }
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>
