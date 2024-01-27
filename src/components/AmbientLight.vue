<template>
</template>

<script setup>
import * as THREE from 'three'
import { ref, watch, reactive, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  intensity: {
    type: Number,
    default: 1
  },
  color: {
    type: String,
    default: '#ffffff'
  },
})

let ambientLight = null

watch(props, ()=> {
  if(!ambientLight) return
  ambientLight.intensity = props.intensity
  ambientLight.color = new THREE.Color(props.color)
}, {deep: true})

onMounted( () =>{
  const scene = useScene()

  ambientLight = new THREE.AmbientLight(props.color, props.intensity)
  scene.add(ambientLight)

})

onBeforeUnmount(()=> {
  const scene = useScene()
  scene.remove(ambientLight)
})
</script>
