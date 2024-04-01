<template>
  <div class="library-3d">
    <div class="container">
      <div class="row">
        <div class="col-md-12">
          <h1>3D Library</h1>
          <p>3D Library</p>
        </div>
      </div>
      <div class="row">
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr;">
          <div v-for="model, i in states.models" :key="i">
            <a :href="`/3d-library/${model.slug}`">
              <v-img :src="model.preview" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, reactive, onMounted, onBeforeUnmount, onBeforeMount } from 'vue'
import ThreeJs from '@/components/ThreeJs.vue';
import ModelLoader from '@/components/ModelLoader.vue';
import AmbientLight from '@/components/AmbientLight.vue';
import Viewer from '@/components/Viewer.vue';
import OrbitController from '@/components/OrbitController.vue';
import ArcballController from '@/components/ArcballController.vue';
import { supabase } from '@/supabase'

const states = reactive({
  models: []
})

function get_supbase_url(slug) {
  return `https://igfcuxsvikfhgwgbibix.supabase.co/storage/v1/object/public/library-3d-assets/${slug}`
}

onMounted(async () => {
  const { data, error } = await supabase
    .from('library-assets')
    .select('*')
  if (error) {
    console.log('error', error)
  } else {
    states.models = data.map((m) => {
      return {
        ...m,
        preview: get_supbase_url(`${m.slug}/preview.png`),

      }
    })
    console.log('models', states.models)
  }
})

</script>

<style lang="scss" scoped>
.library-3d {
  .container {
    margin-top: 20px;
  }
}
</style>
