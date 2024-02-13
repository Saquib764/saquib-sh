<template>
  <div class="bokeh-holder"></div>
</template>

<script setup>
import { ref, watch, reactive, onMounted } from 'vue'
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';

const props = defineProps({
  focus: {
    type: Number,
    default: 10,
  },
  aperture: {
    type: Number,
    default: 0
  }
})

const F = 0.00005

let bokehPass = null

watch(()=>[props.focus, props.aperture], ()=>{
  if(!bokehPass) return

  bokehPass.uniforms[ 'focus' ].value = props.focus
  bokehPass.uniforms[ 'aperture' ].value = props.aperture * F
}, {deep: true})

onMounted(()=>{
  const scene = useScene()
  const camera = useCamera()
  const composer = useComposer()
  
  bokehPass = new BokehPass( scene, camera, {
    focus: props.focus,
    aperture: props.aperture * F,
    maxblur: 0.01,
    width: window.innerWidth,
    height: window.innerHeight
  });
  composer.addPass(bokehPass);
})
</script>

