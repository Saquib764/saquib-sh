<template>
  <div>
  </div>
</template>

<script setup>
import { ref, watch, reactive, onMounted, onBeforeUnmount, onBeforeMount } from 'vue'

const props = defineProps({
  width: {
    type: Number,
    default: 512
  },
  height: {
    type: Number,
    default: 512
  }
})

const three = useThreeState()

watch(()=>three.isReady, (val)=> {
  if(val) {
    resizeViewer()
  }
}, {immediate: true})

function resizeViewer() {
  const camera = useCamera()
  const renderer = useRenderer()
  const canvas = renderer.domElement

  const WIDTH = props.width
  const HEIGHT = props.height
  
  camera.aspect = WIDTH / HEIGHT
  camera.updateProjectionMatrix()
  renderer.setPixelRatio(window.devicePixelRatio)

  camera.position.set(0, 0.0, 50)
  resizeRenderer(WIDTH, HEIGHT)
  canvas.style.width = '100vw'
  canvas.style.height = `${HEIGHT / WIDTH * 100}vw`
}

</script>

