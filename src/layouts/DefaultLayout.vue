<template>
  <v-app style="background: white">
    <!-- <app-bar :elevation="0"/> -->
    <default-view />

    <footer :class="`font-weight-medium ${isMobile()?'mobile':''} text-subtitle`">
      <!-- <div>Made with <span>❤️</span> in India </div> -->
      <div>Saquib</div>
    </footer>
  </v-app>
</template>

<script setup>
import { ref, watch, reactive, onMounted, computed } from 'vue'
import {useStore} from 'vuex'
import AppBar from './AppBar.vue'
import DefaultView from './View.vue'

const store = useStore()



// watch(user, (val) => {
//   clearInterval(loop)
//   if(val) {
//     loop = setInterval(()=>{
//       store.dispatch('userManager/refreshToken', true)
//     }, 1000 * 60 * 5)
//   }
// }, {deep: true, immediate: true})
</script>

<style lang="scss" scoped>
footer {
  display: flex;
  flex-direction: row;
  background: black;
  color: white;
  padding: 20px 10vw;
  justify-content: space-between;

  &.mobile{
    flex-direction: column;
    gap: 10px;
    align-items: center;
    text-align: center;
  }
}
</style>
