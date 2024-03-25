<template>
  <div></div>
</template>

<script setup>
import { ref, watch, reactive, onMounted, onBeforeUnmount, onBeforeMount } from 'vue'
import * as THREE from 'three'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})

watch(()=>props.disabled, (v)=>{
  let control = useOrbitControl()
  control.enabled = !v
}, {immediate: true})

onMounted(() => {
  let control = useOrbitControl()
  control.target = new THREE.Vector3(0, 0, 0)
  control.update()
})

</script>