<template>
  <div class="demo-recorder-editor">

    <v-btn
      style="position: fixed; top: 10px; right: 10px;"
      color="black"
      @click="render_movie()"
      >Render</v-btn>
    <!-- <v-btn
      style="position: fixed; top: 10px; right: 10px;"
      color="black"
      @click="render()"
      >Save</v-btn> -->
    <div class="editor-holder">
      <div class="menu-holder">
        Menu
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
  currentClipIndex: 0
})

const canvasEl = ref(null)

const nuxt = useNuxtApp()
const currentClip = computed(()=>{
  return states.recordings[states.currentClipIndex]
})

async function render_movie() {

  const etro = nuxt.$etro

  let WIDTH = 1920
  let HEIGHT = 1080
  canvasEl.value.willReadFrequently = true
  canvasEl.value.width = WIDTH
  canvasEl.value.height = HEIGHT

  let scale1 = fitOnCanvas({
    width: window.innerWidth - 20,  height: window.innerHeight - 20
  }, {width: WIDTH, height: HEIGHT}, 'contain')

  const movie = new etro.Movie({
    canvas: canvasEl.value, // HTML canvas element to draw on
    // actx: new AudioContext(), // Web Audio context to play through (creates a new context with default settings if omitted)
    background: etro.parseColor('#f0f'), // background color (dynamic, defaults to black)
    repeat: false // whether to loop forever while playing and streaming (defaults to false)
  });

  let bg = await getImageFromUrl(BG)

  const layer = new etro.layer.Image({
    startTime: 0,
    duration: 5,
    source: bg.image,
    sourceX: 0, // default: 0
    sourceY: 0, // default: 0
    sourceWidth: WIDTH, // default: null (full width)
    sourceHeight: HEIGHT, // default: null (full height)
    x: 0, // default: 0
    y: 0, // default: 0
    // destWidth: bg.width,
    // destHeight: bg.height,
    // width: 600, // default: null (full width)
    // height: 400, // default: null (full height)
    opacity: 1, // default: 1
  });
  const scale = fitOnCanvas({width: WIDTH, height: HEIGHT}, bg)
  const effect = new etro.effect.Transform({
    matrix: new etro.effect.Transform.Matrix()
      .scale(scale.scaleX, scale.scaleY),
  })
  layer.addEffect(effect)
  const layer1 = new etro.layer.Text({
    startTime: 0,
    duration: 5,
    text: 'Hello World',
    x: 0, // default: 0
    y: 0, // default: 0
    width: 400, // default: null (full width)
    height: 400, // default: null (full height)
    opacity: 1, // default: 1
    color: etro.parseColor('white'), // default: new etro.Color(0, 0, 0, 1)
    font: '40px sans-serif', // default: '10px sans-serif'
    textX: 40, // default: 0
    textY: 100, // default: 0
    textAlign: 'left', // default: 'left'
    textBaseline: 'alphabetic', // default: 'alphabetic'
    textDirection: 'ltr', // default: 'ltr'
    textStroke: { // default: null (no stroke)
      color: etro.parseColor('black'),
      // position: TextStrokePosition.Outside, // default: TextStrokePosition.Outside
      thickness: 2, // default: 1
    },
  });

  let screen_layer = null
  if(states.recordings[0].screen) {
    let dim = await getVideoMeta(states.recordings[0].screen_video_url)
    console.log(dim)
    screen_layer = new etro.layer.Video({
      startTime: 0,
      duration: 5,
      source: states.recordings[0].screen_video_url,
      sourceX: 0,
      sourceY: 0,
      sourceWidth: dim.width,
      sourceHeight: dim.height,
      x: 100,
      y: 100
    })
    const effect = new etro.effect.Transform({
      matrix: new etro.effect.Transform.Matrix()
        .scale(0.5, 0.5),
    })
    screen_layer.addEffect(effect)
  }

  const video_layer = new etro.layer.Video({
    startTime: 0,
    duration: 5,
    source: states.recordings[0].camera_video_url,
    sourceX: 0, // default: 0
    sourceY: 0, // default: 0
    sourceWidth: WIDTH, // default: null (full width)
    sourceHeight: HEIGHT, // default: null (full height)
    x: 400, // default: 0
    y: 200, // default: 0
    // width: 400, // default: null (full width)
    // height: 400, // default: null (full height)
    opacity: 1, // default: 1
  });
  const effect1 = new etro.effect.Transform({
    matrix: new etro.effect.Transform.Matrix()
      .scale(1.5, 1.5),
  })
  video_layer.addEffect(effect1)
  let r = 300
  const effect2 = new etro.effect.EllipticalMask({
    x: 1.5*r, // the x-coordinate of the center of the ellipse
    y: 1.1*r, // the y-coordinate of the center of the ellipse
    radiusX: r, // the horizontal radius of the ellipse
    radiusY: r, // the vertical radius of the ellipse
    rotation: 0, // rotation angle in radians (default: 0)
    startAngle: 0, // start angle in radians (default: 0)
    endAngle: 2 * Math.PI, // end angle in radians (default: 2 * Math.PI)
    anticlockwise: false, // whether the ellipse is drawn clockwise or anticlockwise (default: false)
  })
  video_layer.addEffect(effect2)

  movie.addLayer(layer)
  movie.addLayer(layer1)
  if(screen_layer) {
    movie.addLayer(screen_layer)
  }
  movie.addLayer(video_layer)

  console.log(new etro.effect.Visual())

  await movie.play({
    duration: 3, // how long to play for, in seconds (by default, the movie will play to the end)
    onStart: () => {
      console.log('All resources are loaded, and playback has started.');
    }, // `onStart` is optional
  });
  console.log('The movie is done playing');
}

onMounted(async ()=>{
  // render_movie()
  let recordings = await db.getItem('recordings') || []
  states.recordings = await Promise.all(recordings.map(async (recording)=>{
    let {camera, screen, ...rest} = recording
    if(camera) {
      rest.camera = camera
      rest.camera_thumbnail = await createVideoThumbnail(URL.createObjectURL(camera))
      rest.camera_video_url = URL.createObjectURL(camera)
    }
    if(screen) {
      rest.screen = screen
      rest.screen_thumbnail = await createVideoThumbnail(URL.createObjectURL(screen))
      rest.screen_video_url = URL.createObjectURL(screen)
    }
    return rest
  }))
  console.log(states.recordings)
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
      background: rgb(207, 225, 185);
      padding: 10px;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
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
