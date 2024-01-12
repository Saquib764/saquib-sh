<template>
  <div></div>
</template>

<script setup>

import { watch, reactive, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import AnimationLoop from './AnimationLoop.vue'

const props = defineProps({
  size: {
    type: Number,
    default: 500
  },
  divisions: {
    type: Number,
    default: 10
  },
})
// watch(props, ()=> {
//   cube.position.x = props.position.x || 0
//   cube.position.y = props.position.y || 0
//   cube.position.z = props.position.z || 0
// })

onMounted( () =>{
  const scene = useScene()
  const gridHelper = new THREE.GridHelper( props.size, props.divisions );
  // gridHelper.geometry.rotateX( Math.PI / 2 );

  scene.add( gridHelper );
  const axesHelper = new THREE.AxesHelper( 5 );
  scene.add(axesHelper)
})
</script>

<style scoped>
</style>