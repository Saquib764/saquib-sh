<template>

</template>
<script setup>
import { ref, defineExpose, reactive, onMounted, onBeforeUnmount } from 'vue'
const props = defineProps({
  onFrame: {
    type: Function,
    default: () => {
    }
  },
  autostart: {
    type: Boolean,
    default: true
  }
})

const states = reactive({
  is_playing: false
})

let loopId = null

function start() {
  states.is_playing = true
  loop()
}
function stop() {
  window.cancelAnimationFrame(loopId)
  states.is_playing = false
}


function loop() {
  states.is_playing = true
  props.onFrame()
  loopId = window.requestAnimationFrame(loop)
}
function isPlaying() {
  return states.is_playing
}

onMounted( () =>{
  if(!props.autostart) return
  loop()
})

onBeforeUnmount( () =>{
  stop()
})

// expose public methods
defineExpose({
  start,
  stop,
  isPlaying
})
</script>