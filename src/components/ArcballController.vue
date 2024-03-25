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
  let control = useArcballControl()
  control.enabled = !v
  control.setGizmosVisible(false)
}, {immediate: true})

onMounted(() => {
  let control = useArcballControl()
  control.target = new THREE.Vector3(0, 0, 0)
  control.setGizmosVisible(false)
  control.update()
})

</script>