<template>
  <div class="home-page">
    <span style="margin-top: 50px; font-size: 90px;">Saquib Alam</span>
    <span>co-founder at <a href="https://photoshift.co">photoshift.co</a></span>
    <p>
      Hi there, I am a robotics engineer with background in <strong>physics</strong> and <strong>autonomous driving</strong>. I am passionate about building products that solve real world problems. I am currently working on <strong>zust.ai and photoshift.co</strong>, a generative AI platform for product photography.
    </p>
    <p>Currently I am working from <a href="https://auroville.org/">Auroville</a>, Pondicherry.</p>
    <div class="social">
      <a href="https://twitter.com/saquiboye" target="_blank"><img src="https://img.shields.io/twitter/follow/saquiboye?style=social" /></a>
      <a href="https://instagram.com/saquiboye" target="_blank"><img src="https://img.shields.io/badge/-saquiboye-%23E4405F?style=flat-square&logo=Instagram&logoColor=white" /></a>
      <a href="https://www.linkedin.com/in/saquiboye" target="_blank"><img src="https://img.shields.io/badge/-saquiboye-blue?style=flat-square&logo=Linkedin&logoColor=white" /></a>
    </div>
    <p>My start-up is in early revenue phase, looking forward to grow quickly. I usually share my start-up journey on Twitter.</p>

    <h1 class="mt-6">3 Product in 12 days challenge-</h1>
    <span>Build and ship 3 products in 12 days, starting from 18th Feb, 2024</span>
    <div class="project-holder">
      <a href="/" target="_blank">Text-2-video - create reels just from text (coming soon).</a>
      <a href="/" target="_blank">Product demo recorder- create ready to publish saas product demo in your browser (coming soon).</a>
      <a href="/" target="_blank">Clothes finder AI - platform to find the exact clothes (coming soon).</a>
    </div>

    <h1 class="mt-6">Experiments-</h1>
    <span>A list of web-based experiments in the field of computer vision, generative AI, 3D, and robotics. </span>
    <div class="project-holder">
      <a href="/tools/ai-blog-writer" target="_blank">Free AI blog writer, step-by-step. write blogs at super speed</a>
      <a href="/tools/defocus" target="_blank">Change focus point in your image. Blur the irrelevant parts.</a>
      <a href="/tools/image-to-3d" target="_blank">Single image to 3D point cloud</a>
      <a href="/tools/interactive-website-background" target="_blank">Interactive image background for landing pages</a>
      <!-- <a href="/tools/relight" target="_blank">Relight</a> -->
      <!-- <a href="/tools/video-demo-recorder" target="_blank">A free tool to easily record and edit video demo of your product (Building...)</a> -->
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
  min-height: 100vh;

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

  .project-holder {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 50px;
    a {
      background: rgb(207, 225, 185);
      padding: 10px;
      border-radius: 8px;
      // text-decoration: none;
      color: rgb(40, 40, 40);
    }
  }
}

</style>
