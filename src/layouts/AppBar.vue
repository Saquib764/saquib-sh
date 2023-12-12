<template>
  <v-app-bar flat color="transparent" :elevation="props.elevation" :height="60" :style="`overflow: visible; backdrop-filter: blur(20px); z-index: 2000`">
    <v-app-bar-title style="padding-left:20px">
      <a href="https://saquib.sh" style="text-decoration: none; font-size: 1.2em; font-weight: bold; color: black;">saquib.sh</a>
    </v-app-bar-title>
  </v-app-bar>
</template>

<script setup>
import { ref, watch, reactive, onMounted, computed } from 'vue'
import {useStore} from 'vuex'


const props = defineProps({
  elevation: {
    type: Number,
    default: 1
  }
})

</script>

