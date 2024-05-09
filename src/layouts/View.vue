<template>
  <v-main style="overflow: hidden; background: transparent;">
    <router-view />
    <v-snackbar
      style="z-index: 999999"
      location="top"
      :timeout="store.state.houseKeeping.snackbar.timeout || 30000"
      :color="store.state.houseKeeping.snackbar.color || 'success'"
      :model-value="store.state.houseKeeping.snackbar.isOpen"
      @update:model-value="onSnackbarChange"
    >
      {{ store.state.houseKeeping.snackbar.message }}
    </v-snackbar>
  </v-main>
</template>

<script setup>
import { useStore } from 'vuex';

const store = useStore();

function onSnackbarChange(val) {
  console.log(val)
  if(!val) {
    store.dispatch('houseKeeping/hideSnackbar')
  }
}


</script>
<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap');
</style>