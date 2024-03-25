<template>
  <div class="library-3d">
    <div class="container">
      <div class="row">
      </div>
      <div class="row">
        <div style="display: grid;">
          <three-js>
            <viewer :width="512" :height="512"/>
            <ambient-light/>
            <arcball-controller :disabled="false"/>
            <model-loader
              size="fit"
              :src="states.model?.src"
              :position="{x: 0, y: 0, z: 0}" />
          </three-js>
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
import { useRoute } from 'vue-router'
import { supabase } from '@/supabase'

const route = useRoute()

const states = reactive({
  model: null,
})

function get_supbase_url(slug) {
  return `https://igfcuxsvikfhgwgbibix.supabase.co/storage/v1/object/public/library-3d-assets/${slug}`
}

async function load_data() {
  const { data, error } = await supabase
    .from('library-assets')
    .select('*')
    .eq('slug', route.params.slug)
    .single()
  if (error) {
    console.log('error', error)
  } else {
    // get glb
    let glb_url = data.files.find((f) => f.endsWith('.glb'))
    states.model = {
      ...data,
      preview: get_supbase_url(`${data.slug}/preview.png`),
      src: get_supbase_url(glb_url),
    }
  }

}

onMounted(() => {
  load_data()
})

</script>

<style lang="scss" scoped>
.library-3d {
  .container {
    margin-top: 20px;
  }
}
</style>
