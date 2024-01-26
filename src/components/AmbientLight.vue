<template>
</template>

<script setup>
import * as THREE from 'three'
import { ref, watch, reactive, onMounted, onBeforeUnmount } from 'vue'

let light = null

function setLight(x=1, y=0, z=1) {
  let light = new THREE.PointLight(0xffffff, 1.10, 400, 0.0)
  light.position.set(x, y, z)
  light.castShadow = true
  light.shadow.radius = 100
  light.shadow.mapSize.width = 2048
  light.shadow.mapSize.height = 2048
  return light
}

onMounted( () =>{
  const scene = useScene()

  let ambientLight = new THREE.AmbientLight (0xffffff, 1.0)
  scene.add(ambientLight)


  light = setLight(0, -0, 5)
  // scene.add(light)

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
  scene.remove(ambientLight)
})
</script>
