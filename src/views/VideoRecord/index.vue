<template>
  <div class="home-page">
    <section id="home">
      Simply record videos. No hassle. No ads.

      <zust-button
              append-icon="mdi-play"
              href="/record">Record</zust-button>
    </section>

    <section id="bottom-cta">
      <div>
        <div class="text-sm-h3 text-h4 font-weight-bold mb-6">
          Transform one recording into endless possibilities
        </div>
        <div>Instant. No login. No ads.</div>
        <client-only>
          <div class="mt-16">
            <zust-button
              append-icon="mdi-play"
              href="/record">Create with VideoRecord</zust-button>
          </div>
        </client-only>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, watch, reactive, onMounted, onBeforeUnmount, onBeforeMount } from 'vue'

import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import ZustButton from '@/components/Buttons/index.vue'
import { windowCopy as window, localStorageCopy as localStorage } from '@/utils/common';


definePageMeta({
  layout: "video-recorder-default-layout",
});

useHead({
  title: "VideoRecorder",
  meta: [{
    name: "description",
    content: "Video recorder"
  }],
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/photoshift.ico' }]
})

useSeoMeta({
  title: "Video recorder",
  ogTitle: "Video recorder",
  description: "Video recorder",
  ogDescription: "Video recorder",
  // image: "https://qr.zust.ai/images/qr-code.jpg",
  // ogImage: 'https://qr.zust.ai/images/qr-code.jpg',
  // twitterCard: 'summary_large_image',
  'google-site-verification': 'VETkv6NWDrDYyAXaJLWyvGddEvjNwmeeByoVDm6rGFo',
})

const router = useRouter()


const store = useStore()
const states = reactive({
  name: "",
  email: "",
  body: "",
  isSending: false
})

const shouldShowGenerateProduct = ref(false)

const deviceId = localStorage.getItem('deviceId') || Date.now().toString()
localStorage.setItem('deviceId', deviceId)

const Gifs = ['honey', 'mokabara', 'nivea', 'nike', 'sofa', 'villain']


const BASE_API = 'https://api2-5ipjkdoeba-uc.a.run.app'
// const BASE_API = 'http://localhost:3001'


onBeforeUnmount(()=>{
  window.removeEventListener('scroll', onScroll)
})
function onScroll(e) {
  shouldShowGenerateProduct.value = window.pageYOffset > window.innerHeight * 0.2
}

</script>

<style lang="scss" scoped>
.home-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  .number-one{
    width: 200px;
    text-align: center;
    position: relative;
    margin-bottom: 20px;
    background: rgb(227, 215, 255);
    padding: 20px;
    border-radius: 10px;
    div {
      // position: absolute;
      font-size: 15px;
      top: 0;
      left: 0;
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      justify-content: center;
      color: rgba(0,0,0,0.7);
    }
  }
  section {
    padding: 0 12vw;
    text-align: center;
    display: flex;
    flex-direction: column;
    min-height: 60vh;
    width: 100%;
    overflow: hidden;

    &#home{
      // background-image: url('/bg.jpg');
      min-height: 80vh;
      align-items: center;
      flex-direction: row;
      padding: 0 10vw;
      gap: 20px;
    }
  }
  @media only screen and (max-width: 600px) {
    section {
      padding: 0 5vw;

      &#home{
        margin-top: 10vh;
        padding: 0 5vw;
        flex-direction: column-reverse;
      }
    }
  }
  #how-it-works {
    margin-top: 60px !important;
    padding: 160px;
    .content {
      display: flex;
      flex-direction: row;
      gap: 60px;
      align-items: center;
    }
    @media only screen and (max-width: 600px) {
      padding: 20px;
      .content {
        flex-direction: column;
        gap: 20px;
      }
    }
  }

  .case-study-holder {
    display: flex;
    flex-direction: column;
    gap: 40px;
    margin-bottom: 20vh;

    .cases {
      gap: 10px;
      display: flex;
      flex-direction: row;
      justify-content: center;

      &.mobile{
        overflow: auto;
        display: inherit;
        justify-content: unset;
        scrollbar-width: none;
        &::-webkit-scrollbar {
          display: none;
        }
      }
    }
    .case-images {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 20px;
    }
    @media screen and (max-width: 640px) {
      .case-images {
        grid-template-columns: 1fr 1fr 1fr;
      }

      .cases {

        &>div {
          max-height: 40px;
          min-width: 40px;
          border: 1px solid rgb(233, 223, 246);

        }
      }
    }
  }
  #features{
    margin-top: 10vh;
    display: flex;
    flex-direction: column;
    gap: 10vh;
    font-size: 1.3em;
    .feature{
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      gap: 30px;
      justify-content: space-between;

      @media screen and (min-width: 600px) {
        &:nth-child(2n){
          flex-direction: row-reverse;
        }
      }

      @media only screen and (max-width: 600px) {
        flex-direction: column;
        gap: 20px;
      }
      &>div{
        flex: 2;
        &:nth-child(2n){
          padding: 40px;
        }
        &:first-child{
          display: flex;
          flex: 3;
          flex-direction: column;
          gap: 10px;
          text-align: left;
          justify-content: center;

          @media screen and (min-width: 600px) {
            max-width: 40vw;
          }
        }
      }
      // display: flex;
      // flex-direction: column;
      // align-items: flex-start;
      // text-align: left;
      .images {
        position: relative;
        display: grid;
        margin-top: 30px;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        gap: 50px;
      }
    }
  }

  #how-it-works2 {
    margin-top: 50px;
    padding: 60px 100px;
    .content {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 40px;

      &>div {
        border-radius: 10px;
        background: rgb(1, 1, 17);
        padding: 20px;
        text-align: left;

        h2{
          padding-bottom: 20px;
        }
        img {
          width: 100%;
          padding: 10px;
          padding-top: 30px;
        }
      }
    }
    @media only screen and (max-width: 600px) {
      padding: 20px;
      .content {
        grid-template-columns: 1fr;
        gap: 20px;
      }
    }
  }

  .faq {
    text-align: left;
    min-width: 300px;
    .question-item {
      display: flex;
      flex-direction: column;
      gap: 10px;
      border-radius: 5px;
      background: transparent !important;
      border-radius: 6px;
      color: #ffffff;
      box-shadow: 0 0.5em 1em -0.125em hsla(0,0%,4%,.1), 0 0 0 1px hsla(0,0%,4%,.02);
      margin-bottom: 30px;
    }
  }

  #bottom-cta {
    width: unset;
    background: rgb(137, 89, 255);
    margin: 10px 5vw;
    padding: 10vh 10vw;
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 50px;
    text-align: left;
    align-items: center;
    color: white;
    border-radius: 20px;
    
    @media only screen and (max-width: 600px) {
      &{
        grid-template-columns: 1fr;
        padding: 5vh 5vw;
      }
    }
  }
}

.fixed-footer {
  position: fixed;
  bottom: 0;
  width: 100vw;
  padding: 20px;
  color: white;
  background: rgb(30, 29, 32);

  .generate {
    background: linear-gradient(62deg, #EE7752, #E73C7E, #23A6D5, #23D5AB);
     animation: gradientloop 10s ease-in-out infinite; 
    background-size: 400% 400%;
    color: white;
    height: auto;
    min-height: 70px;
  }

  @media only screen and (max-width: 600px) {
    button {
      font-size: 0.8em;
    }
  }
}
@keyframes gradientloop {
  0% {
    background-position: 0 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
     background-position: 0% 50%;
  }
}
.bigger {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    width: 100vw;
    height: 100vh;
    padding: 10vh 10vw;
    padding: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(74, 73, 73, 0.9);
}

@media screen and (max-width: 640px) {
  .contact-us {
    &>div{
      width: 100%;
    }
  }
}
.colorful-text {
  background: linear-gradient(90.09deg,#fbc400,#e96224);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

#client-holder {
  .clients {
    margin-top: 20px;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;

    &>div {
      height: 100px;
      background: rgb(215, 215, 215);
      padding: 10px;
      border-radius: 20px;
    }
  }
}

#testimonials {
  .testimonial-holder {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 30px;

    &>div{
      background: rgb(1, 1, 17);
      padding: 10px;
      border-radius: 8px;
    }

    @media screen and (max-width: 640px) {
      &>div {
        width: unset !important;
      }
      flex-direction: column;
    }
  }
}
#testimonial {
  .testimonial-holder {
    width: 90vw;
    height: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 30px;

    iframe {
      border-radius: 15px;
    }

    @media screen and (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }
}
</style>
