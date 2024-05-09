<template>
  <v-app style="background: rgb(5, 8, 20); color: white;">
    <app-bar :elevation="0" />
    <default-view />

    <!-- <custom-footer /> -->
    <footer :class="`font-weight-medium ${isMobile()?'mobile':''} text-subtitle`">
      <div>Made with <span>❤️</span> in India </div>
      <div>© Copyright 2024, videorecorder.sh</div>
    </footer>
  </v-app>
</template>

<script setup>
import { ref, watch, reactive, onMounted, computed } from 'vue'
import AppBar from './PhotoshiftAppBar.vue';
import DefaultView from './View.vue'
import { isMobile } from '@/utils/common';
import CustomFooter from '@/components/Footers/Photoshift.vue';

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
