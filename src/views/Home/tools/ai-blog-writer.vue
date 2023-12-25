<template>
  <div class="ai-writer">
    <h1>Free AI blog writer</h1>
    <div class="mt-6">This app uses GPT-3.5-turbo to help you write a blog blog step-by-step, and then iterate over each paragraph by guiding the AI through your custom knowledge.</div>

    <div class="mb-6 mt-1">
      <span>Steps-</span>
      <ol style="margin-left: 30px;">
        <li>Enter a keyword and description(optional) of the blog.</li>
        <li>Click on "Create outline" button.</li>
        <li>Click on "Generate all" button to generate all paragraphs.</li>
        <li>Click on "show paragraph" button to expand every section</li>
        <li>Each section can be edit and regenerated.</li>
        <li>Personalise the paragraph by adding your own data in the knowledge base field.</li>
        <li>Click on "Make seo meta" button to generate a meta description for the blog.</li>
        <li>Click on "Preview" button to preview the blog.</li>
        <li>Easily copy in Markdown format to publish in any blogging site</li>
      </ol>
    </div>
    <connect />

    <client-only>
      <div style="display: flex; flex-direction: row; gap: 20px;">
        <v-tabs
          direction="vertical"
          v-model="states.menu"
          bg-color="unset">
          <v-tab key="0" value="1">Idea/title generation</v-tab>
          <v-tab key="1" value="2">Article generation</v-tab>
        </v-tabs>

        <v-window v-model="states.menu" class="mt-3">
          <v-window-item value="1" key="0">
              <v-text-field v-model="idea.keyword" label="Keyword" placeholder="eg.- ai remove background" outlined hint="use google keyword planner to find keyword that is relevant to your industry, has good volume, and easy to compete" persistent-hint density="compact" class="mb-4"/>
              <v-btn :loading="states.isLoading" @click="suggestArticle()" color="black">Suggest title</v-btn>

              <v-list style="gap: 20px;" variant="outlined" lines="three">
                <v-list-item v-for="(item, index) in idea.ideas" :key="index">
                    <v-list-item-title>
                      {{ item.title }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ item.description }}
                    </v-list-item-subtitle>
                    <template v-slot:append>
                      <v-btn
                        icon="mdi-arrow-right"
                        variant="text"
                        :loading="item.isGenerating"
                        @click="onSelectIdea(item)"
                      ></v-btn>
                    </template>
                </v-list-item>
              </v-list>
          </v-window-item>
          <v-window-item value="2" key="1">
            <div v-show="states.state >= APP_STATE.IDEA">
              <v-text-field v-model="idea.keyword" label="Keyword" placeholder="eg.- ai remove background" outlined hint="use google keyword planner to find keyword that is relevant to your industry, has good volume, and easy to compete" persistent-hint density="compact" class="mb-4"/>
              <v-textarea v-model="idea.description" label="Description" placeholder="Describe details that you would want to include. eg. - types of product photography, lighting techniques, lighting and shadows" outlined/>
              <div style="display: flex; flex-direction: row; align-items: center;">
                <v-btn :loading="states.isLoading" @click="createOutline" color="black">Create outline</v-btn>
                <span class="ml-2">You can generate multiple outlines</span>
                <v-spacer />
                <v-btn @click="reset" color="success">Reset</v-btn>
              </div>
            </div>
            <div v-show="states.state >= APP_STATE.OUTLINE" class="mt-6 pt-6">
              <v-text-field v-model="idea.title" label="Blog title" placeholder="eg.- 10 Stunning Examples of AI Remove Background in Action" outlined density="compact" class="mb-4"/>
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
                          :append-icon="states.isExpanded?'mdi-arrow-collapse-all':'mdi-arrow-expand-all'">{{states.isExpanded?'collapse section':'expand sections'}}</v-btn>
                        <v-btn
                          width="200px"
                          color="black"
                          :loading="states.isGenerating" @click="generateAllParagraph(outline)"
                          append-icon="mdi-creation">generate all</v-btn>
                      </div>
                      <div style="display: flex; gap: 10px; flex-direction: row; margin-top: 10px;">
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
                          @click="states.isPreviewing = true; states.preview = {title: idea.title, ...outline}"
                        >Preview</v-btn>
                      </div>

                      <span class="mt-6 mb-2">{{ outline.metadescription || '<No metadata>' }}</span>
                      <v-list style="gap: 20px;" variant="outlined">
                        <v-list-item v-for="(item, index) in outline.data" :key="index">
                            <v-list-item-title>
                              <tagsarea class="tagsarea" v-model="item.heading" placeholder="Heading" />
                            </v-list-item-title>
                            <tagsarea class="tagsarea" v-model="item.instruction" placeholder="Instruction" />
                            <tagsarea v-show="states.isExpanded" class="tagsarea" v-model="item.knowledgeBase" placeholder="Knowledge base - mention the things that you would like to include" />
                            <v-textarea v-show="states.isExpanded" class="tagsarea" style="min-height: 100px;" v-model="item.paragraph" placeholder="Paragraph - write the paragraph" />
                            <template v-slot:append>
                              <v-btn
                                icon="mdi-creation"
                                variant="text"
                                :loading="item.isGenerating"
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
                                @click="outline.data.splice(index+1, 0, {heading: '', instruction: '', knowledgeBase: '', paragraph: ''})"
                              ></v-btn>
                            </template>
                        </v-list-item>
                      </v-list>
                    </v-window-item>
                  </v-window>
                </v-card-text>
              </v-card>
            </div>
          </v-window-item>
        </v-window>
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
            <v-btn
              @click="copyMd(states.preview)"
              variant="outlined"
              :color="states.isCopied?'success':'black'"
              :prepend-icon="states.isCopied?'mdi-check-all':'mdi-content-copy'"
              >{{ states.isCopied?'copied':'copy MD' }}</v-btn>
            <v-btn @click="states.isPreviewing=false; states.isCopied=false" icon="mdi-close"></v-btn>
          </template>
        </v-toolbar>
        <div style="width: 60vw; margin: auto;">
          <h1 class="mt-6" style="font-weight: bold; font-size: 2em;">{{states.preview.title}}</h1>
          <span class="mt-6">{{states.preview.metadescription}}</span>
          <v-card-text style="overflow: scroll; font-size: 1.2em; line-height: 1.5em;">
            <div v-for="section, i in states.preview.data" :key="i">
              <h4 class="mt-6 mb-2">{{ section.heading }}</h4>
              <div style="white-space: pre-line;">{{ section.paragraph }}</div>
            </div>
            <div style="margin-bottom: 100px;"></div>
          </v-card-text>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, watch, reactive, onMounted } from 'vue'
import {localStorageCopy as localStorage, navigatorCopy as navigator} from '@/utils/common.js'
import Tagsarea from '@/components/Tagsarea.vue'
import Connect from '@/components/Footers/Connect.vue'
import { v4 as uuidv4 } from 'uuid';

const BASE_API = 'https://get-published-nf5wy45qga-uc.a.run.app'

const APP_STATE = {
  IDEA: 0,
  OUTLINE: 1,
}
definePageMeta({
  layout: "app-layout",
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
  menu: "1",
  tab: 0,
  isExpanded: false,
  isLoading: false,
  isGenerating: false,
  isGeneratingTitle: false,
  isGeneratingMeta: false,
  isPreviewing: false,
  isCopied: false,
  preview: {
    title: '',
    data: []
  }
})


const init = JSON.parse(localStorage.getItem('a-writer-idea') || '{}')

const idea = reactive({
  id: init.id,
  keyword: init.keyword || '',
  title: init.title || '',
  description: init.description || '',
  outlines: init.outlines || [],
  ideas: init.ideas || []
})


if(idea.outlines.length > 0) {
  states.state = APP_STATE.OUTLINE
}
let loop = null
watch(()=>idea, (val)=>{
  clearTimeout(loop)
  loop = setTimeout(()=>{
    if(idea.id && states.menu === "2") {
      let i = idea.ideas.find((item)=>item.id === idea.id) || {}
      // update saved idea
      i = {
        ...i,
        id: idea.id,
        title: idea.title,
        description: idea.description,
        outlines: idea.outlines,
      }
      if(!i.keyword) {
        i.created_at = Date.now()
        i.keyword = idea.keyword
      } 
      idea.ideas = [i, ...idea.ideas.filter((item)=>item.id !== idea.id)]
    }
    localStorage.setItem('a-writer-idea', JSON.stringify(val))
  }, 1000)
}, {deep: true})

async function suggestArticle(ret = false) {
  states.isLoading = true
  let res = await fetch(`${BASE_API}/openai/generic`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      system: `You are SEO friendly blog writer. Create 4 ideas for the keyword. The idea should have a short title and notes about the content of the blog. Include the keyword in title. Be creative. The response should be an array of object.`,
      instruction: `
      keyword: ${idea.keyword}
      Each idea is a object with keys- title and note. The response should be an array of object.`,
    })
  })
  let data = await res.json()
  let json = data.result
  if(json.indexOf('```') > -1) {
    json = json.substring(7, json.length-3)
  }
  const ideas = JSON.parse(json).map((item)=>{
    return {
      id: uuidv4(),
      title: item.title,
      description: item.note,
      keyword: idea.keyword,
      created_at: Date.now()
    }
  })
  states.isLoading = false
  if(ret) {
    return ideas
  }
  idea.ideas = [...ideas, ...idea.ideas]
}

function onSelectIdea(item) {
  idea.outlines = item.outlines || []
  idea.id = item.id;
  idea.keyword = item.keyword;
  idea.description = item.description;
  idea.title = item.title;
  states.state = APP_STATE.OUTLINE
  states.menu = "2"
}

async function createOutline() {
  states.isLoading = true
  if(!idea.id) {
    idea.id = uuidv4()
  }
  if(idea.description && !idea.title) {
    idea.title = await createTitle(idea.keyword, idea.description)
  }
  if(!idea.description) {
    let i = await suggestArticle(true)
    i = i[Math.floor(Math.random() * i.length)]
    idea.description = i.description
    idea.title = i.title
  }

  let res = await fetch(`${BASE_API}/openai/generic`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      system: `You are SEO friendly blog writer. You are writing a blog about ${idea.title}. Use this information to write the blog - ${idea.description}. Optimise the blog for the keyword - ${idea.keyword}.
      Blog content should not be repetitive. Always create response as an array of objects. Use lists when required.`,
      instruction: `Create an outline for the blog. Each outline is a object with keys- heading and instruction. The heading should be 5-9 words long and instruction should be 15 words long. The response should be an array of object.`,
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
      instruction: item.instruction,
      knowledgeBase: "",
      paragraph: ""
    }
  })
  idea.outlines = [{
    metadescription: "",
    data: _outlines
  }, ...idea.outlines]
  states.state = APP_STATE.OUTLINE
  states.isLoading = false
}
function deleteOutline(i) {
  idea.outlines.splice(i, 1)
  states.tab = Math.max(0, states.tab - 1)
}
async function generateParagraph(item) {
  states.isGenerating = true
  item.isGenerating = true
  let res = await fetch(`${BASE_API}/openai/generic`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      system: `You are blog writer. You are writing a blog about ${idea.title}. Blog should be SEO friendly.`,
      instruction: `Create a paragraph for a section in the blog with the given a subtitle and instruction. Use the knowledge base to write the paragraph. Use lists when required.
      Subtitle: ${item.heading}
      Instruction: ${item.instruction}
      Knowledge base: ${item.knowledgeBase}
      
      Response should be only paragraph.`,
    })
  })
  let data = await res.json()
  console.log(data)
  item.paragraph = data.result
  states.isGenerating = false
  item.isGenerating = false
}

function reset() {
  idea.keyword = ''
  idea.title = ''
  idea.description = ''
  idea.id = ""
  idea.outlines = []
}

async function generateAllParagraph(outline) {
  for(let i=0; i<outline.data.length; i++) {
    await generateParagraph(outline.data[i])
  }
  states.isExpanded = true
}

async function createTitle(keyword, description) {
  let title_instruction = 'Keep it short and to the point, less than 10 words.'

  let res = await fetch(`${BASE_API}/openai/generic`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      system: `You are a SEO expert blog writer. Write a blog title to optimise for the keyword that reflect the description.`,
      instruction: `
      Keyword: ${keyword}
      Description: ${description}
      ${title_instruction}`,
    })
  })
  let data = await res.json()
  return data.result
}

async function createMetadescription(outline) {
  states.isGeneratingMeta = true
  let res = await fetch(`${BASE_API}/openai/generic`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      system: `You are SEO expert and blog writer and an expert in ${idea.keyword}. You are writing a blog about ${idea.description}.`,
      instruction: `Create a SEO friendly description of the blog, for meta description. The blog has the following outlines:\n${outline.data.map((o, i)=>`${i+1}. ${o.heading}`).join('\n')}. Length should be around 150 characters, it should be SEO friendly and catchy.`,
    })
  })
  let data = await res.json()
  outline.metadescription = data.result
  states.isGeneratingMeta = false
}
function copyMd(outline) {
  let md = `
  # ${outline.title}\n\n

  ---
  ${outline.description}
  ---
  `
  for(let i=0; i<outline.data.length; i++) {
    md += `## ${outline.data[i].heading}\n\n`
    md += outline.data[i].paragraph + '\n\n'
  }
  navigator.clipboard.writeText(md)
  states.isCopied = true

  setTimeout(()=>{
    states.isCopied = false
  }, 30000)
}
</script>

<style lang="scss" scoped>
.ai-writer {
  padding: 50px 10px;
  max-width: 1200px;
  margin: auto;
}
.v-list-item {
  padding-bottom: 10px;
}
.tagsarea {
  border: none;
}
</style>
