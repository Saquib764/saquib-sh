<template>
  <v-app-bar flat color="transparent" :elevation="props.elevation" :height="60" :style="`overflow: visible; background: white; backdrop-filter: blur(20px); z-index: 2000`">
    <v-app-bar-title style="padding-left:20px">
      <a v-if="props.elevation==0" href="/" class="font-weight-bold" style="font-family: 'Fredoka One', cursive; color: white; text-decoration: none; font-size: 1.6em;">Photoshift</a>
      <a v-if="props.elevation!=0" href="/" class="font-weight-bold" style="font-family: 'Fredoka One', cursive; color: black; text-decoration: none; font-size: 1.6em;">Photoshift</a>
      <!-- <span class="font-weight-light" style="font-size: 0.5em;">by zust.ai</span> -->
    </v-app-bar-title>

    <v-spacer v-if="!isMobile()"></v-spacer>
  </v-app-bar>
</template>

<script setup>

import { isMobile } from '@/utils/common';
import { ref, watch, reactive, onMounted, computed } from 'vue'
import {useStore} from 'vuex'
import AccountBar from '@/components/Headers/PhotoshiftAccountBar.vue'

const props = defineProps({
  elevation: {
    type: Number,
    default: 1
  }
})


</script>
