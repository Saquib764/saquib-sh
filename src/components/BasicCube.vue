<template>
  <animation-loop :onFrame="loop"/>
</template>

<script setup>

import { watch, reactive, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import AnimationLoop from './AnimationLoop.vue'

const props = defineProps({
  position: {
    type: Object,
    default:()=> ({
      x: 0, y: 0, z: 0
    })
  },
})

let cube = null
watch(props, ()=> {
  if(!cube) return
  cube.position.x = props.position.x || 0
  cube.position.y = props.position.y || 0
  cube.position.z = props.position.z || 0
})



onMounted( () =>{
  const scene = useScene()

  // Adding a cube
  let geometry = new THREE.BoxGeometry(4, 4, 4)
  let material = new THREE.MeshPhongMaterial({color: 0xeeffaa})
  cube = new THREE.Mesh(geometry, material)

  cube.position.x = props.position.x || 0
  cube.position.y = props.position.y || 0
  cube.position.z = props.position.z || 0

  cube.rotation.x = 0.5
  cube.rotation.y = 0.5


  scene.add(cube)
})

onBeforeUnmount( () =>{
  scene.remove(cube)
})

function loop() {
  if(!cube) return
  // cube.rotation.x += 0.01
}
</script>

<style scoped>
</style>