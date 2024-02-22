<template>
  <div class="reeler-page">
    <h2>Reeler</h2>
    <div style="display: grid; gap: 10px; grid-template-columns: 2fr 1fr;">
      <div style="display: block;">
        <v-textarea v-model="states.instruction" :placeholder="states.instructionGuide" outlined></v-textarea>
        <div>
          <h3>Script</h3>

          <v-list style="gap: 20px; max-height: 50vh; overflow: scroll;" variant="outlined">
            <v-list-item v-for="(item, index) in states.script" :key="index" style="margin-bottom: 5px; border-radius: 8px;">
                <tagsarea class="tagsarea mb-1" v-model="item.voiceover" placeholder="Voiceover" />
                <tagsarea class="tagsarea mb-1" v-model="item.prompt" placeholder="Prompt for image" />
                <div style="display: flex; flex-direction: row;">
                  <audio v-show="item.audio" :src="item.audio" controls></audio>
                  <v-img v-show="item.image" :src="item.image" style="height: 50px"></v-img>
                </div>
                <template v-slot:append>
                  <v-btn
                    icon="mdi-creation"
                    variant="text"
                    :loading="item.isGenerating"
                  ></v-btn>
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    @click="states.script.splice(index, 1)"
                  ></v-btn>
                  <v-btn
                    icon="mdi-plus"
                    variant="text"
                    @click="states.script.splice(index+1, 0, {voiceover: '', prompt: ''})"
                  ></v-btn>
                </template>
            </v-list-item>
          </v-list>
        </div>
        <div style="display: flex; flex-direction: row; gap: 10px">
          <v-btn
            color="black"
            icon="mdi-plus"
            size="small"
            @click="states.script.splice(index+1, 0, {voiceover: '', prompt: ''})"/>
          <v-btn
            :color="states.currentStep > 0?'success':'black'"
            :prepend-icon="states.currentStep > 0?'mdi-check':null"
            :loading="states.isLoading && states.currentStep === 0"
            @click="get_script()"
            :disabled="states.isLoading || states.currentStep < 0"
            >Get script</v-btn>
          <v-btn
            :color="states.currentStep > 1?'success':'black'"
            :prepend-icon="states.currentStep > 1?'mdi-check':null"
            :loading="states.isLoading && states.currentStep === 1"
            append-icon="mdi-creation"
            @click="generate_assets()"
            :disabled="states.isLoading || states.currentStep < 1"
            >Generate assets</v-btn>
          <v-btn
            color="black"
            :color="states.currentStep > 2?'success':'black'"
            :prepend-icon="states.currentStep > 2?'mdi-check':null"
            :loading="states.isLoading && states.currentStep === 2"
            @click="render_movie()"
            :disabled="states.isLoading || states.currentStep < 2"
            >Preview</v-btn>
        </div>
      </div>
      <div style="max-height: 70vh; aspect-ratio: 9/16;">
        <canvas ref="canvasEl" style="border: 1px solid black; height: 100%; max-width: 100%;"></canvas>

        <v-btn
          color="black"
          :loading="states.isLoading && states.currentStep === 3"
          @click="render_movie(true)"
          :disabled="states.isLoading || states.currentStep < 3"
          >Download</v-btn>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, watch, reactive, onMounted, onBeforeUnmount, onBeforeMount } from 'vue'
import { getAudioMeta } from "@/utils/common";
import {useStore} from 'vuex'
const BASE_API = 'https://get-published-nf5wy45qga-uc.a.run.app'

// import localForage from 'localforage'

// if(process.client) {
//   localForage.setDriver(localForage.INDEXEDDB)
// }

// const db = localForage.createInstance({
//   name: 'reeler',
//   storeName: 'reeler',
// })

definePageMeta({
  layout: "default-layout",
});

const canvasEl = ref(null)
const nuxt = useNuxtApp()
const store = useStore()

const states = reactive({
  instruction: ``.trim(),
  instructionGuide: `write the topic and instructions for the script. \nExample: \nRumi poems \nuse quotes where ever possible. Create 3 slides`,
  script: [],
  isLoading: false,
  output: "",
  currentStep: 0
})


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
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const fontSize = 64
  let maxWidth = 0.8


  let captions = layer.caption.split(" ")
  let dx = 0
  let dy = 0
  captions = captions.map((word, i, arr) => {
    const font = `bold ${fontSize}px sans-serif`
    ctx.font = font

    const isHighlighted = layer.highlights.includes(word)

    let color = isHighlighted ? 'yellow' : 'white'
    
    let textWidth = ctx.measureText(word).width
    if(dx + textWidth > dim.width * maxWidth) {
      dx = 0
      dy += fontSize * 1.5
    }
    let c =  {
      word,
      width: textWidth,
      startTime: 0,
      y: dy,
      x: dx,
      font,
      color
    }
    dx += c.width + fontSize * 0.6
    if(dx > dim.width * maxWidth) {
      dx = 0
      dy += fontSize * 1.5
    }
    return c
  })
  let totalWidth = 0
  for(let i=0; i<captions.length; i++) {
    totalWidth += captions[i].width
  }
  let texts = []
  let dt = 0
  for(let i=0; i<captions.length; i++) {
    let caption = captions[i]
    const text = new etro.layer.Text({
      startTime: layer.startTime + dt,
      duration: layer.duration - dt,
      text: caption.word,
      textX: 0.1 * dim.width + caption.x, // default: 0
      textY: layer.y * dim.height + caption.y, // default: 0
      width: dim.width, // default: null (full width)
      height: dim.height, // default: null (full height)
      font: caption.font, // default: '16px sans-serif'
      color: etro.parseColor(caption.color || 'white'), // default: black
      textAlign: 'left', // default: left
      textBaseline: 'middle', // default: top
      opacity: 1, // default: 1
    });
    texts.push(text)
    dt += caption.width * layer.duration / totalWidth
  }
  return texts
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

  const f = 1 + 0.1 * layer.duration
  
  const baseScale = new etro.effect.Transform.Matrix().scale(scale.scaleX, scale.scaleY)
  const baseScale2 = new etro.effect.Transform.Matrix().scale(scale.scaleX*f, scale.scaleY*f)
  baseScale2.translate(-dim.width * 0.5 * (f-1), -dim.height * 0.5 * (f-1))

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

async function render_movie(download = false) {
  states.isLoading = true
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
    background: etro.parseColor('#000'), // background color (dynamic, defaults to black)
    repeat: false // whether to loop forever while playing and streaming (defaults to false)
  });

  const timeline = []
  let currentStartTime = 0
  for(let i=0; i < states.script.length; i++) {
    const segment = states.script[i]
    
    let t = segment.duration
    let voiceover = segment.voiceover.split("*")
    let highlights = voiceover.filter((v, i) => i % 2 === 1)
    voiceover = voiceover.join("")

    timeline.push({
      type: 'audio',
      audio: segment.audio,
      startTime: currentStartTime,
      duration: t,
    })

    timeline.push({
      type: 'image',
      image: segment.image,
      startTime: currentStartTime,
      duration: t,
    })
    timeline.push({
      type: 'caption',
      caption: voiceover,
      highlights,
      startTime: currentStartTime,
      duration: t,
      y: 0.7,
    })
    currentStartTime += t
  }

  for(let i =0; i< timeline.length; i++) {
    if(timeline[i].type === 'audio') {
      const audio = await make_audio(etro, timeline[i])
      movie.addLayer(audio)
      continue
    }
    if(timeline[i].type === 'image') {
      const layer = await make_layer(etro, timeline[i], {width: WIDTH, height: HEIGHT})
      movie.addLayer(layer)
      continue
    }
    if(timeline[i].type === 'caption') {
      const captions = await make_caption(etro, timeline[i])

      captions.map(caption => {
        movie.addLayer(caption)
      })
      continue
    }
  }

  if(!download) {
    await movie.play({
      duration: 3, // how long to play for, in seconds (by default, the movie will play to the end)
      onStart: () => {
        console.log('All resources are loaded, and playback has started.');
      }, // `onStart` is optional
    });
  }else {
    let mediaRecorder;
    let chunks = [];
    let stream = await movie.stream({
      frameRate: 60, // fps for the stream's video tracks
      duration: 5, // how long to stream, in seconds (by default, the movie will stream to the end)
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

async function get_script() {
  states.isLoading = true
  let res = await fetch(`${BASE_API}/openai/generic`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      system: `Topic: ${states.instruction}
      

        Write a  paragraph for Tiktok video. Break the paragraph into smaller sections/slides/segments/parts. Each section has a voiceover and a prompt for image. Voiceovers must have only 3-6 words. Based on the topic, critically think of the words to highlight in some voiceovers, use * to highlight those words. Always return a valid JSON array of sections. Array contains section object with following fields - "voiceover", "prompt". Voiceover is the text to be spoken in the video and also shown as subtitle. Prompt is used to generate image to be shown on the screen. Example: [{"voiceover": "Gandhi was a *great* advocate of", "prompt": "An image of gandhi depicting peace"}]. Return only a valid JSON
        `.trim(),
      instruction: ""
    })
  })
  try{
    let data = await res.json()
    let json = data.result
    console.log(json)
    if(json.indexOf('```json') > -1) {
      json = json.substring(7, json.length-3)
    }
    if(json.indexOf('```javascript') > -1) {
      json = json.substring(13, json.length-3)
    }
    if(json.indexOf('```js') > -1) {
      json = json.substring(5, json.length-3)
    }
    console.log(json)
    let script = JSON.parse(json)
    script = script.segments || script.sections || script.slides || script.parts || script

    states.script = script
    store.dispatch('houseKeeping/showSnackbar', {
      message: 'Script generated successfully. Now generate assets',
      color: 'success',
      timeout: 4000
    })
  }catch(e) {
    console.log(e)
    
    store.dispatch('houseKeeping/showSnackbar', {
      message: 'Something went wrong. Please try again later',
      color: 'error',
      timeout: 4000
    })
  }
  states.isLoading = false
  states.currentStep = 1
}

async function generate_assets() {
  states.isLoading = true
  for(let i=0; i <states.script.length; i++) {
    // Get audio
    let res = await fetch(`${BASE_API}/speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        voice: "alloy",
        text: states.script[i].voiceover
      })
    })
    // reach buffer as mp3 blob
    let blob = await res.blob()
    let audioUrl = URL.createObjectURL(blob)
    states.script[i].audio = audioUrl
    let audioMeta = await getAudioMeta(audioUrl)
    states.script[i].duration = audioMeta.duration

    let res1 = await fetch(`https://stage-zust-ai-be-5ipjkdoeba-uc.a.run.app/image/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: states.script[i].prompt,
        width: 768,
        height: 1024
      })
    })
    res1 = await res1.json()
    states.script[i].image = res1.result[0]
  }
  states.isLoading = false
  states.currentStep = 2
}

onMounted(async ()=>{
  states.output = states.script.map(s=> `${s.voiceover}\n${s.prompt}`).join("\n\n")
})

</script>

<style scoped lang="scss">
.reeler-page {
  display: flex;
  flex-direction: column;
  align-items: left;
  gap: 1em;
  padding: 1em;
  max-width: 100vw;
  textarea {
    width: 100%;
    height: 10em;
  }
}
</style>

