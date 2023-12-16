<template>
  <div class="subscribe-arxiv">
    <h1>Get notified about arxiv paper release on interesting topic</h1>
    <div class="mt-6">This app uses GPT-3.5-turbo to scan paper abstract everyday, and send you an email with summary if anything relevant is found.</div>

    <div class="mb-6 mt-1">
      <span>Steps-</span>
      <ol style="margin-left: 30px;">
        <li>Enter the topic or topics you are intrested in.</li>
        <li>Enter your email and submit.</li>
        <li>Write to <i>hey@saquib.sh</i> to make any suggestion.</li>
      </ol>
    </div>
    <connect />
    <div>
      <v-text-field v-model="subscription.topic" label="Topic" placeholder="eg.- stable diffusion, LLM" outlined />
      <v-text-field v-model="subscription.email" label="Your email" placeholder="type your email" outlined />
      <v-btn v-show="isNewJob" :loading="states.isLoading" @click="createJob" color="black">Create new job</v-btn>
      <v-btn v-show="!isNewJob" :loading="states.isLoading" @click="createJob" color="black">Update job</v-btn>
    </div>

    <div v-show="states.subscriptions.length > 0" class="mt-6 pt-6">
      <h2>Active jobs</h2>
      <span>(saved in your browser, it can be updated only on this browser)</span>
      <client-only>
        <v-list>
          <v-list-item v-for="sub in states.subscriptions" :key="sub.id" variant="outlined">
            <v-list-item-title>{{ sub.topic }}</v-list-item-title>
            <v-list-item-subtitle>{{ sub.email }}</v-list-item-subtitle>
            <template v-slot:append>
              <v-btn @click="editJob(sub)" icon="mdi-pencil" variant="text"/>
              <v-btn @click="deleteJob(sub)" icon="mdi-bin" variant="text"/>
            </template>
          </v-list-item>
        </v-list>
      </client-only>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, reactive, onMounted, onBeforeUnmount, onBeforeMount } from 'vue'
import {localStorageCopy as localStorage} from '@/utils/common.js'

import Connect from '@/components/Footers/Connect.vue'
import { useStore } from 'vuex'
import { BASE_API } from '@/constants'

definePageMeta({
  layout: "app-layout",
});

useHead({
  title: "Free arxiv new paper release notifier - saquib alam",
  meta: [{
    name: "description",
    content: "use GPT-3.5-turbo to scan paper abstract everyday, and send you an email with summary if anything relevant is found."
  }]
})

useSeoMeta({
  title: "Free arxiv new paper release notifier - saquib alam",
  ogTitle: "Free arxiv new paper release notifier - saquib alam",
  description: "use GPT-3.5-turbo to scan paper abstract everyday, and send you an email with summary if anything relevant is found.",
  ogDescription: "use GPT-3.5-turbo to scan paper abstract everyday, and send you an email with summary if anything relevant is found.",
  // image: "https://qr.zust.ai/images/qr-code.jpg",
  // ogImage: 'https://qr.zust.ai/images/qr-code.jpg',
  // twitterCard: 'summary_large_image',
})

/* Load subscriptions from localstorage on mount
    Initialize the subscription with the latest subscriptions

*/

const KEY = 'subscribe-arxiv'
const init = JSON.parse(localStorage.getItem(KEY) || '[]')

const states = reactive({
  isLoading: false,
  subscriptions: []
})

const store = useStore()


const subscription = reactive({
  topic: '',
  email: '',
  id: '',
})
const isNewJob = computed(()=>states.subscriptions.findIndex((sub)=>sub.email === subscription.email) === -1)

async function createJob() {
  if(!subscription.email) {
    store.dispatch('houseKeeping/showSnackbar', {
      message: 'Please enter your email',
      color: 'error',
      timeout: 4000
    })
    return
  }
  if(!subscription.topic) {
    store.dispatch('houseKeeping/showSnackbar', {
      message: 'Please enter topic',
      color: 'error',
      timeout: 4000
    })
    return
  }
  states.isLoading = true
  // Create a subscription, and return id
  try{
    const res = await fetch(`${BASE_API}/arxiv/subscribe`, {
      method: 'POST',
      body: JSON.stringify({
        topic: subscription.topic,
        email: subscription.email,
        id: subscription.id
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await res.json()
    subscription.id = data.data.id
    states.subscriptions = [{
      topic: subscription.topic,
      email: subscription.email,
      id: subscription.id
    }, ...states.subscriptions.filter((sub)=>sub.id !== subscription.id)]
    localStorage.setItem(KEY, JSON.stringify(states.subscriptions))
    store.dispatch('houseKeeping/showSnackbar', {
      message: 'Job created successfully.',
      color: 'success',
      timeout: 4000
    })
  }catch(e) {
    console.log(e)
    store.dispatch('houseKeeping/showSnackbar', {
      message: 'Something went wrong, please try again.',
      color: 'error',
      timeout: 4000
    })
  }
  states.isLoading = false
}

function editJob(sub) {
  console.log(sub)
  subscription.topic = sub.topic
  subscription.email = sub.email
  subscription.id = sub.id
}
async function deleteJob(sub) {
  states.isLoading = true
  // Unsuscribe
  try{
    const res = await fetch(`${BASE_API}/arxiv/unsubscribe`, {
      method: 'DELETE',
      body: JSON.stringify({
        id: sub.id,
        email: sub.email
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await res.json()
  }catch(e) {
    console.log(e)
    store.dispatch('houseKeeping/showSnackbar', {
      message: 'Something went wrong, please try again.',
      color: 'error',
      timeout: 4000
    })
    return
  }
  states.subscriptions = states.subscriptions.filter((s)=>s.id !== sub.id)
  localStorage.setItem(KEY, JSON.stringify(states.subscriptions))

  store.dispatch('houseKeeping/showSnackbar', {
    message: 'Job deleted successfully.',
    color: 'success',
    timeout: 4000
  })
  states.isLoading = false
}

onBeforeMount(()=>{
  states.subscriptions = init
  if(init.length) {
    subscription.topic = init[0].topic
    subscription.email = init[0].email
    subscription.id = init[0].id
  }
})

</script>

<style lang="scss" scoped>
.subscribe-arxiv {
  padding: 50px 10px;
  max-width: 900px;
  margin: auto;
  min-height: 100vh;
}

</style>
