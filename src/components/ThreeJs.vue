<template>
  <div
    ref="holder" 
    class="three-js">
    <slot v-if="isReady"></slot>
  </div>
</template>

<script setup>

import { ref, watch, reactive, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'

const emit = defineEmits(['ready'])
// import { dispose, useCamera, useOrbitControl, useRenderer, useScene } from './hooks'
// import { useEvents } from '@/engine'


const holder  = ref(null)
const isReady = ref(false)

const props = defineProps({
  useComposer: {
    type: Boolean,
    default: false
  }
})

const states = reactive({
  height: 100,
  width: 100
})

let loopId = null
let resize = null

function onResize(e) {
  states.height = holder.value.clientHeight
  states.width = holder.value.clientWidth
}

watch(()=>[states.height, states.width], ()=>{
  resizeRenderer( states.width, states.height)
}, {deep: true})
    
onMounted( async() => {
  const scene = useScene()
  const renderer = useRenderer()
  const camera = useCamera()

  
  holder.value.append(renderer.domElement)
  await sleep(30)
  states.height = holder.value.clientHeight
  states.width = holder.value.clientWidth

  camera.aspect = states.width / states.height 

  camera.updateProjectionMatrix()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize( states.width, states.height)

  console.log(states.width, states.height)

  if(props.useComposer) {
    const composer = useComposer()
    // composer.setSize(states.width, states.height)
  }


  applyRender()
  loop()
  isReady.value = true
  emit('ready')
  
  resize = new ResizeObserver(onResize).observe(holder.value)
})
onBeforeUnmount(()=> {
  dispose()
  resize.disconnect()
  window.cancelAnimationFrame(loopId)
})
function loop() {
  applyRender()
  loopId = window.requestAnimationFrame(loop)
}
</script>

<style scoped>
</style>