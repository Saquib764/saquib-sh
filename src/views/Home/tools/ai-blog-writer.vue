<template>
  <div class="ai-writer">
    <h1>Free AI blog writer - by <a href="/">Saquib</a></h1>
    <div class="mt-6">This app uses GPT-3.5-turbo to help you write a blog blog step-by-step, and then iterate over each paragraph by guiding the AI through your custom knowledge.</div>

    <div class="mb-6 mt-1">
      <span>Steps-</span>
      <ol style="margin-left: 30px;">
        <li>Enter a topic and description of the blog.</li>
        <li>Click on "Create outline" button.</li>
        <li>Click on "Generate all" button to generate all paragraphs.</li>
        <li>Click on "show paragraph" button to expand every section</li>
        <li>Each section can be edit and regenerated.</li>
        <li>Personalise the paragraph by adding your own data in the knowledge base field.</li>
        <li>Click on "Make title" button to generate a title for the blog.</li>
        <li>Click on "Make seo meta" button to generate a meta description for the blog.</li>
        <li>Click on "Preview" button to preview the blog.</li>
      </ol>
    </div>
    <client-only>
      <div v-show="states.state >= APP_STATE.IDEA">
        <v-text-field v-model="idea.topic" label="Topic" placeholder="eg.- product photographer, social media expert" outlined />
        <v-text-field v-model="idea.description" label="Description" placeholder="eg.- how to use AI in product photography" outlined/>
        <v-btn :loading="idea.isLoading" @click="createOutline" color="black">Create outline</v-btn>
      </div>
      <div v-show="states.state >= APP_STATE.OUTLINE" class="mt-6 pt-6">
        <h2>Suggested outlines</h2>
        <v-card>
          <v-tabs
            v-model="states.tab"
            bg-color="primary">
            <v-tab v-for="outline, i in idea.outlines" :key="i" :value="i">Outline {{ i + 1 }}</v-tab>
          </v-tabs>

          <v-card-text>
            <v-window v-model="states.tab">
              <v-window-item v-for="outline, i in idea.outlines" :value="i" :key="i">
                <div style="display: flex; gap: 10px; flex-direction: row;">
                  <v-btn
                    @click="states.isExpanded = !states.isExpanded"
                    width="200px"
                    color="black"
                    :append-icon="states.isExpanded?'mdi-arrow-collapse-all':'mdi-arrow-expand-all'">{{states.isExpanded?'heading only':'show paragraph'}}</v-btn>
                  <v-btn
                    width="200px"
                    color="black"
                    :loading="states.isGenerating" @click="generateAllParagraph(outline)"
                    append-icon="mdi-creation">generate all</v-btn>
                </div>
                <div style="display: flex; gap: 10px; flex-direction: row;">
                  <v-btn
                    width="200px"
                    color="black"
                    :loading="states.isGeneratingTitle" @click="createTitle(outline)"
                    append-icon="mdi-creation">make title</v-btn>
                  <v-btn
                    width="200px"
                    color="black"
                    :loading="states.isGeneratingMeta" @click="createMetadescription(outline)"
                    append-icon="mdi-creation">make seo meta</v-btn>
                  <v-btn @click="deleteOutline(i)" color="black" append-icon="mdi-delete">delete</v-btn>
                  <v-spacer></v-spacer>
                  <v-btn
                    width="200px"
                    color="black"
                    @click="states.isPreviewing = true; states.preview = outline"
                  >Preview</v-btn>
                </div>

                <h2 class="mt-6 mb-2">{{ outline.title || '<No title>' }}</h2>
                <v-list style="gap: 20px;" variant="outlined">
                  <v-list-item v-for="(item, index) in outline.data" :key="index">
                      <v-list-item-title>
                        <tagsarea class="tagsarea" v-model="item.heading" placeholder="Heading" />
                      </v-list-item-title>
                      <tagsarea class="tagsarea" v-model="item.description" placeholder="Description" />
                      <tagsarea v-show="states.isExpanded" class="tagsarea" v-model="item.knowledgeBase" placeholder="Knowledge base - mention the things that you would like to include" />
                      <tagsarea v-show="states.isExpanded" class="tagsarea" style="min-height: 100px;" v-model="item.paragraph" placeholder="Paragraph - write the paragraph" />
                      <template v-slot:append>
                        <v-btn
                          icon="mdi-creation"
                          variant="text"
                          @click="generateParagraph(item)"
                        ></v-btn>
                        <v-btn
                          icon="mdi-delete"
                          variant="text"
                          @click="outline.data.splice(index, 1)"
                        ></v-btn>
                        <v-btn
                          icon="mdi-plus"
                          variant="text"
                          @click="outline.data.splice(index+1, 0, {heading: '', description: '', knowledgeBase: '', paragraph: ''})"
                        ></v-btn>
                      </template>
                  </v-list-item>
                </v-list>
              </v-window-item>

            </v-window>
          </v-card-text>
        </v-card>
      </div>
    </client-only>
    <v-dialog
      v-model="states.isPreviewing" fullscreen>
      <v-card>
        <v-toolbar>
          <v-toolbar-title class="text-h6">
            Blog preview
          </v-toolbar-title>

          <template v-slot:append>
            <v-btn @click="states.isPreviewing=false" icon="mdi-close"></v-btn>
          </template>
        </v-toolbar>
        <div style="width: 60vw; margin: auto;">
          <v-card-title class="mt-6" style="font-weight: bold; font-size: 2em;">{{states.preview.title}}</v-card-title>
          <v-card-text style="overflow: scroll; font-size: 1.2em; line-height: 1.5em;">
            <div v-for="section, i in states.preview.data" :key="i">
              <h4 class="mt-6 mb-2">{{ section.heading }}</h4>
              <div v-html="section.paragraph"></div>
            </div>
            <div style="margin-bottom: 100px;"></div>
          </v-card-text>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, watch, reactive, onMounted, onBeforeUnmount, onBeforeMount } from 'vue'
import {localStorageCopy as localStorage} from '@/utils/common.js'
import Tagsarea from '@/components/Tagsarea.vue'

const BASE_API = 'https://stage-zust-ai-be-5ipjkdoeba-uc.a.run.app'

const APP_STATE = {
  IDEA: 0,
  OUTLINE: 1,
}
definePageMeta({
  layout: "default-layout",
});

useHead({
  title: "Free AI blog writer - saquib alam",
  meta: [{
    name: "description",
    content: "use GPT-3.5-turbo to help you write a blog blog step-by-step, and then iterate over each paragraph by guiding the AI through your custom knowledge."
  }]
})

useSeoMeta({
  title: "Free AI blog writer - saquib alam",
  ogTitle: "Free AI blog writer - saquib alam",
  description: "use GPT-3.5-turbo to help you write a blog blog step-by-step, and then iterate over each paragraph by guiding the AI through your custom knowledge.",
  ogDescription: "use GPT-3.5-turbo to help you write a blog blog step-by-step, and then iterate over each paragraph by guiding the AI through your custom knowledge.",
  // image: "https://qr.zust.ai/images/qr-code.jpg",
  // ogImage: 'https://qr.zust.ai/images/qr-code.jpg',
  // twitterCard: 'summary_large_image',
})



const states = reactive({
  state: APP_STATE.IDEA,
  tab: 0,
  isExpanded: false,
  isGenerating: false,
  isGeneratingTitle: false,
  isGeneratingMeta: false,
  isPreviewing: false,
  preview: {
    title: '',
    data: []
  }
})

const idea = reactive({
  topic: '',
  description: '',
  isLoading: false,
  outlines: []
})

Object.assign(idea, JSON.parse(localStorage.getItem('a-writer-idea') || '{}'))

if(idea.outlines.length > 0) {
  states.state = APP_STATE.OUTLINE
}

watch(()=>idea, (val)=>{
  localStorage.setItem('a-writer-idea', JSON.stringify(val))
}, {deep: true})

async function createOutline() {
  let res = await fetch(`${BASE_API}/openai/generic`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      system: `You are SEO friendly blog writer and an expert in ${idea.topic}. You are writing a blog about ${idea.description}. Blog should be SEO friendly. Always create response as an array of objects.`,
      instruction: `Create an outline for the blog. Each outline is a object with keys- heading and description. The heading should be 5-9 words long and description should be 15 words long. The response should be an array of object.`,
    })
  })
  let data = await res.json()
  let json = data.result
  if(json.indexOf('```') > -1) {
    json = json.substring(7, json.length-3)
  }
  const _outlines = JSON.parse(json).map((item)=>{
    return {
      heading: item.heading,
      description: item.description,
      knowledgeBase: "",
      paragraph: ""
    }
  })
  idea.outlines = [...idea.outlines, {
    title: '',
    data: _outlines
  }]
  states.state = APP_STATE.OUTLINE
}
function deleteOutline(i) {
  idea.outlines.splice(i, 1)
  states.tab = Math.max(0, states.tab - 1)
}
async function generateParagraph(item) {
  states.isGenerating = true
  let res = await fetch(`${BASE_API}/openai/generic`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      system: `You are blog writer and an expert in ${idea.topic}. You are writing a blog about ${idea.description}. Blog should be SEO friendly.`,
      instruction: `Create a paragraph for a section in the blog with the given a subtitle and a description. Use the knowledge base to write the paragraph. The response should be a string.
      Subtitle: ${item.heading}
      Description: ${item.description}
      Knowledge base: ${item.knowledgeBase}
      
      Response should be only paragraph.`,
    })
  })
  let data = await res.json()
  console.log(data)
  item.paragraph = data.result
  states.isGenerating = false
}

async function generateAllParagraph(outline) {
  for(let i=0; i<outline.data.length; i++) {
    await generateParagraph(outline.data[i])
  }
  states.isExpanded = true
}

async function createTitle(outline) {
  states.isGeneratingTitle = true
  let title_instruction = 'Keep it short and to the point, less than 10 words.'
  if(idea.description.toLocaleLowerCase().indexOf('how to') > -1) {
    title_instruction = `${title_instruction} Start with "How to"`
  }

  let res = await fetch(`${BASE_API}/openai/generic`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      system: `You are blog writer and an expert in ${idea.topic}. You are writing a blog about ${idea.description}.`,
      instruction: `Create a creative title for the blog. The blog has the following outlines:\n${outline.data.map((o, i)=>`${i+1}. ${o.heading} - ${o.description}`).join('\n')}. ${title_instruction}`,
    })
  })
  let data = await res.json()
  outline.title = data.result
  states.isGeneratingTitle = false
}

async function createMetadescription(outline) {
  states.isGeneratingMeta = true
  let res = await fetch(`${BASE_API}/openai/generic`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      system: `You are SEO expert and blog writer and an expert in ${idea.topic}. You are writing a blog about ${idea.description}.`,
      instruction: `Create a creative title for the blog. The blog has the following outlines:\n${outline.data.map((o, i)=>`${i+1}. ${o.heading} - ${o.description}`).join('\n')}. Keep it less than 150 characters, it should be SEO friendly and catchy.`,
    })
  })
  let data = await res.json()
  outline.metadescription = data.result
  states.isGeneratingMeta = false
}
</script>

<style lang="scss" scoped>
.ai-writer {
  padding: 50px 10px;
  max-width: 900px;
  margin: auto;
}
.v-list-item {
  padding-bottom: 10px;
}
.tagsarea {
  border: none;
}
</style>
