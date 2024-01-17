<template>
  <div class="home-page">
    <span style="margin-top: 50px; font-size: 90px;">Saquib Alam</span>
    <span>co-founder at <a href="https://photoshift.co">photoshift.co</a></span>
    <p>
      Hi there, I am a physicist turned software engineer. I am passionate about building products that solve real world problems. I am currently working on Zust.ai, a generative AI platform for product photography.
    </p>
    <p>We are building photoshift.co as a remote first company, while slow traveling around India.</p>
    <div class="social">
      <a href="https://twitter.com/saquiboye" target="_blank"><img src="https://img.shields.io/twitter/follow/saquiboye?style=social" /></a>
      <a href="https://instagram.com/saquiboye" target="_blank"><img src="https://img.shields.io/badge/-saquiboye-%23E4405F?style=flat-square&logo=Instagram&logoColor=white" /></a>
      <a href="https://www.linkedin.com/in/saquiboye" target="_blank"><img src="https://img.shields.io/badge/-saquiboye-blue?style=flat-square&logo=Linkedin&logoColor=white" /></a>
    </div>
    <p>My start-up is in early revenue phase, looking forward to grow quickly. I usually share my start-up journey on Twitter.</p>

    <h1 class="mt-6">Tools</h1>
    <div style="display: flex; flex-direction: column; gap: 10px;">
      <a href="/tools/ai-blog-writer" target="_blank">Free AI blog writer, step-by-step</a>
      <a href="/tools/image-2-3d" target="_blank">Image to 3D</a>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, reactive, onMounted, onBeforeUnmount, onBeforeMount } from 'vue'

import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

definePageMeta({
  layout: "default-layout",
});

useHead({
  title: "Saquib Alam",
  meta: [{
    name: "description",
    content: "Saquib alam"
  }]
})

useSeoMeta({
  title: "Saquib Alam",
  ogTitle: "Saquib Alam",
  description: "Saquib Alam, zust.ai",
  ogDescription: "Saquib alam, zust.ai",
  // image: "https://qr.zust.ai/images/qr-code.jpg",
  // ogImage: 'https://qr.zust.ai/images/qr-code.jpg',
  // twitterCard: 'summary_large_image',
})


</script>

<style lang="scss" scoped>
.home-page {
  max-width: 600px;
  width: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: auto;

  .social {
    display: flex;
    flex-direction: row;
    gap: 10px;
    margin-top: 20px;

    a {
      border-radius: 3px;
      overflow: hidden;
    }
  }
}

</style>
