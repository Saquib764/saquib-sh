<template>
</template>

<script setup>
import * as THREE from 'three'
import { ref, watch, reactive, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  intensity: {
    type: Number,
    default: 3
  },
  x: {
    type: Number,
    default: 1
  },
  y: {
    type: Number,
    default: 1
  },
  z: {
    type: Number,
    default: 10
  },
  color: {
    type: String,
    default: '#ffffff'
  },
})
let light = null

watch(props, ()=> {
  if(!light) return
  // console.log('props', props.x, props.y, props.z)
  light.intensity = props.intensity
  light.color = new THREE.Color(props.color)
  light.position.set(props.x, props.y, props.z)
  
}, {deep: true})

function setLight(x=1, y=0, z=1) {
  let light = new THREE.PointLight(props.color, props.intensity, 1000, 0.0)
  light.position.set(x, y, z)
  // light.castShadow = true
  // light.shadow.radius = 500
  // light.shadow.mapSize.width = 2048
  // light.shadow.mapSize.height = 2048
  // light.shadow.camera.near = 0.5; // default
  // light.shadow.camera.far = 1500; // default
  return light
}

onMounted( () =>{
  const scene = useScene()
  const {x, y, z} = props
  light = setLight(x, y, z)
  scene.add(light)

  // const light2 = setLight(-15, -30, 15)
  // scene.add(light2)

  // const light3 = setLight(-15, 30, 15)
  // scene.add(light3)
})

onBeforeUnmount(()=> {
  const scene = useScene()
  scene.remove(light)
  // scene.remove(light2)
  // scene.remove(light3)
})
</script>
