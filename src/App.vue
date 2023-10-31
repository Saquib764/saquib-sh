<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { onMounted, computed, reactive, watch } from 'vue'
// import {useRoute, useRouter} from 'vue-router'

import {useStore} from 'vuex'

const store = useStore()
const route = useRoute()
const router = useRouter()


useHead({
})
// const user = useUser()
// console.log('user', user)

</script>

<style lang="scss" scoped>

.zust-page-loader {
  position: fixed;
  width: 100vw;
  height: 100vh;
  background: #fff;
  z-index: 100000;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.loader {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #F5F5F5;
  background-image: radial-gradient(rgb(149, 157, 190, 0.4) 1px, transparent 0);
  background-size: 30px 30px;
  background-position: -19px -19px;
}
.fade-transition-leave-active {
  transition: all 0.3s ease-out;
}
.fade-transition-enter, .fade-transition-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateY(30px);
  opacity: 0;
}
</style>
