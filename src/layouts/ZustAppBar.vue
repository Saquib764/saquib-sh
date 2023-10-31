<template>
  <v-app-bar flat color="transparent" :elevation="props.elevation" :height="60" :style="`overflow: visible; background: ${device.isMobile?'white': 'rgba(245, 245, 245, 0.8)'}; backdrop-filter: blur(20px); z-index: 2000`">
    <v-app-bar-title style="padding-left:20px">
    </v-app-bar-title>
  </v-app-bar>
</template>

<script setup>
import { ref, watch, reactive, onMounted, computed } from 'vue'
import {useStore} from 'vuex'

const device = useDevice()

const props = defineProps({
  elevation: {
    type: Number,
    default: 1
  }
})

</script>

