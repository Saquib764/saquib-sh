<template>
  <div
    ref="holder" 
    class="scene">
    <slot v-if="isReady"></slot>
  </div>
</template>

<script setup>

import { ref, watch, reactive, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'

const emit = defineEmits(['ready'])
// import { dispose, useCamera, useOrbitControl, useRenderer, useScene } from './hooks'
// import { useEvents } from '@/engine'


// const events = useEvents()
// events.loadController()


const holder  = ref(null)
const isReady = ref(false)

const state = reactive({
  height: 100,
  width: 100
})

// events.attach(renderer.domElement, scene, camera)

let loopId = null
    
onMounted( async() => {
  const scene = useScene()
  const renderer = useRenderer()
  const camera = useCamera()

  
  holder.value.append(renderer.domElement)
  await sleep(30)
  state.height = holder.value.clientHeight
  state.width = holder.value.clientWidth

  camera.aspect = state.width / state.height 

  camera.updateProjectionMatrix()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize( state.width, state.height)

  renderer.render(scene, camera)

  loop()
  isReady.value = true
  emit('ready')
})
onBeforeUnmount(()=> {
  dispose()
  window.cancelAnimationFrame(loopId)
})
function loop() {
  const scene = useScene()
  const renderer = useRenderer()
  const camera = useCamera()

  renderer.render(scene, camera)
  loopId = window.requestAnimationFrame(loop)
}
</script>

<style scoped>
</style>