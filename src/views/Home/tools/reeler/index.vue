<template>
  <div class="reeler-page">
    <h2>Reeler</h2>
    <v-btn
      style="position: fixed; top: 10px; right: 10px;"
      color="black"
      @click="render_movie()"
      >Render</v-btn>
    <div style="max-height: 90vh; aspect-ratio: 9/16;">
      <canvas ref="canvasEl" style="border: 1px solid black; height: 100%;"></canvas>
    </div>
  </div>

</template>

<script setup>
import { ref, watch, reactive, onMounted, onBeforeUnmount, onBeforeMount } from 'vue'


const canvasEl = ref(null)
const nuxt = useNuxtApp()

const resources = [{
  type: 'image',
  image: '/reeler/000.png',
  startTime: 0,
  duration: 5,
}, {
  type: 'image',
  image: '/reeler/001.png',
  startTime: 5,
  duration: 8,
}, {
  type: 'caption',
  caption: "Ever wondered why millions find peace in Osho's words?",
  startTime: 0,
  duration: 5,
  x: 0.5,
  y: 0.5,
}, {
  type: 'caption',
  caption: "Osho, a mystic guru, challenged society's norms, advocating for a life of mindfulness, love, and courage.",
  startTime: 5,
  duration: 8,
  x: 0.5,
  y: 0.5,
}, {
  type: 'audio',
  audio: '/reeler/001.mp3',
  startTime: 0,
  duration: 5,
}, {
  type: 'audio',
  audio: '/reeler/002.mp3',
  startTime: 5,
  duration: 8,
}]

function val (element, path, time) { // eslint-disable-line @typescript-eslint/no-explicit-any
  // if (hasCachedValue(element, path)) {
  //   return getCachedValue(element, path)
  // }
  // Get property of element at path
  const pathParts = path.split('.')
  let property = element[pathParts.shift()]
  while (pathParts.length > 0) {
    property = property[pathParts.shift()]
  }

  // Property filter function
  const process = element.propertyFilters[path]

  let value
  if (property.evaluate) {
    value = property.evaluate(time)
  } else if (typeof property === 'function') {
    value = property(element, time)
  } else {
    // Simple value
    value = property
  }
  return value
  // return cacheValue(element, path, process ? process.call(element, value) : value)
}

async function make_audio(etro, layer) {
  const audio = new etro.layer.Audio({
    startTime: layer.startTime,
    duration: layer.duration,
    source: layer.audio,
    sourceStartTime: 0, // default: 0
    muted: false, // default: false
    volume: 1, // default: 1
    playbackRate: 1, // default: 1
  });
  return audio
}

async function make_caption(etro, layer, dim = {width: 1080, height: 1920}) {
  const text = new etro.layer.Text({
    startTime: layer.startTime,
    duration: layer.duration,
    text: layer.caption,
    textX: layer.x * dim.width, // default: 0
    textY: layer.y * dim.height, // default: 0
    width: dim.width, // default: null (full width)
    height: dim.height, // default: null (full height)
    font: 'bold 48px sans-serif', // default: '16px sans-serif'
    color: etro.parseColor('black'), // default: black
    textAlign: 'center', // default: left
    textBaseline: 'middle', // default: top
    opacity: 1, // default: 1
  });
  return text
}

async function make_layer(etro, layer, dim = {width: 1080, height: 1920}) {

  let img = await getImageFromUrl(layer.image)

  const l = new etro.layer.Image({
    startTime: layer.startTime,
    duration: layer.duration,
    source: img.image,
    sourceX: 0, // default: 0
    sourceY: 0, // default: 0
    sourceWidth: dim.width, // default: null (full width)
    sourceHeight: dim.height, // default: null (full height)
    x: 0, // default: 0
    y: 0, // default: 0
    // destWidth: bg.width,
    // destHeight: bg.height,
    // width: 600, // default: null (full width)
    // height: 400, // default: null (full height)
    opacity: 1, // default: 1
  });
  const scale = fitOnCanvas({width: dim.width, height: dim.height}, img)
  
  const baseScale = new etro.effect.Transform.Matrix().scale(scale.scaleX, scale.scaleY)
  const baseScale2 = new etro.effect.Transform.Matrix().scale(scale.scaleX*1.5, scale.scaleY*1.5)

  const keyframe = new etro.KeyFrame(
    [0, baseScale],
    [layer.duration, baseScale2]
  )
  const effect = new etro.effect.Transform({
    matrix: keyframe
  })
  effect.apply = function(target, reltime) {
          if (target.canvas.width !== this._tmpCanvas.width) {
            this._tmpCanvas.width = target.canvas.width;
          }
          if (target.canvas.height !== this._tmpCanvas.height) {
            this._tmpCanvas.height = target.canvas.height;
          }
          // console.log(this._tmpMatrix)
          this._tmpMatrix = val(this, "matrix", reltime);
          this._tmpCtx.setTransform(this._tmpMatrix.a, this._tmpMatrix.b, this._tmpMatrix.c, this._tmpMatrix.d, this._tmpMatrix.e, this._tmpMatrix.f);
          this._tmpCtx.drawImage(target.canvas, 0, 0);
          this._tmpCtx.setTransform(1, 0, 0, 0, 1, 0);
          target.cctx.clearRect(0, 0, target.canvas.width, target.canvas.height);
          target.cctx.drawImage(this._tmpCanvas, 0, 0);
  };
  effect.apply.bind(effect)
  
  l.addEffect(effect)

  return l
}

async function render_movie() {
  const etro = nuxt.$etro

  let WIDTH = 1080
  let HEIGHT = 1920
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

  for(let i =0; i< resources.length; i++) {
    if(resources[i].type === 'audio') {
      const audio = await make_audio(etro, resources[i])
      movie.addLayer(audio)
      continue
    }
    if(resources[i].type === 'image') {
      const layer = await make_layer(etro, resources[i], {width: WIDTH, height: HEIGHT})
      movie.addLayer(layer)
      continue
    }
    if(resources[i].type === 'caption') {
      const caption = await make_caption(etro, resources[i])
      movie.addLayer(caption)
      continue
    }
  }


  await movie.play({
    duration: 3, // how long to play for, in seconds (by default, the movie will play to the end)
    onStart: () => {
      console.log('All resources are loaded, and playback has started.');
    }, // `onStart` is optional
  });
  console.log('The movie is done playing');
}


</script>
