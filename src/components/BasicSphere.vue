<template>
  <animation-loop />
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
  color: {
    type: String,
    default: '0xeeffaa'
  }
})

let model = null
watch(props, ()=> {
  if(!model) return
  model.position.x = props.position.x || 0
  model.position.y = props.position.y || 0
  model.position.z = props.position.z || 0
})



onMounted( () =>{
  const scene = useScene()

  let geometry = new THREE.SphereGeometry( 10, 32, 32 )
  let material = new THREE.MeshBasicMaterial({color: props.color})
  model = new THREE.Mesh(geometry, material)

  model.position.x = props.position.x || 0
  model.position.y = props.position.y || 0
  model.position.z = props.position.z || 0

  model.rotation.x = 0.5
  model.rotation.y = 0.5

  scene.add(model)
})

onBeforeUnmount( () =>{
  const scene = useScene()
  scene.remove(model)
})

</script>

<style scoped>
</style>