<template>
  <div :class="`uploader-simple ${props.transparent?'transparent':''}`"
    @click="inputRef.click()"
    @dragover.prevent="onDragOver"
    @drop.prevent="onDrop"
    @dragenter.prevent="onDragEnter">

    <v-img
      v-if="props.previewUrl"
      :src="props.previewUrl"
      contain
      width="100px"
      height="100px"
      ></v-img>
    <div :class="`drop-catcher ${states.isDragging?'visible':''}`">
      <div>
        <span class="text-h3">Drop the image anywhere</span>
      </div>
    </div>

    <input
        ref="inputRef"
        type="file"
        id="image-select"
        @change="onUploadImages"
        :multiple="props.multiple"
        accept="image/png, image/jpeg, image/webp" />

    <div class="flex-fill d-flex flex-row" style="align-items: center; gap: 10px; padding: 10px;">
      <v-progress-circular
        v-if="props.isUploading"
        style="min-height: 40px;"
        indeterminate
        size="small"
        color="primary"
        ></v-progress-circular>
      <div v-if="!props.isUploading && props.modelValue" style="max-height: 40px; width: 40px;">
        <img :src="props.modelValue" />
      </div>
      <v-btn
        for="image-select"
        v-if="!props.isUploading && !props.modelValue"
        size="small"
        :icon="props.icon"
        color="primary"
        variant="tonal"></v-btn>
      
      <span v-if="props.isUploading" class="text-caption">{{ props.uploadMessage }}</span>
      <div v-if="!props.isUploading"
        class="text-caption d-flex flex-row"
        style="justify-content: space-between; flex: 1;">
        <span>{{states.currentFileName || props.label || 'Upload'}}</span>
        <!-- <span @click.stop="remove"><u>remove</u></span> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, reactive, onMounted, computed, onUnmounted } from 'vue'
import { readAsDataUrl, sleep } from '../../utils/common'
import { windowCopy as window } from '../../utils/common';

const emit = defineEmits(['onFileUpload', 'update:modelValue', 'onRemove'])

const inputRef = ref(null)
const root = ref(null)
let props = defineProps({
  useDragDrop: {
    type: Boolean,
    default: false
  },
  attachOnWindow: {
    type: Boolean,
    default: false
  },
  multiple: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: String,
    default: ''
  },
  isUploading: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: 'mdi-tray-arrow-up'
  },
  label: {
    type: String,
    default: 'Upload'
  },
  transparent: {
    type: Boolean,
    default: false
  },
  uploadMessage: {
    type: String,
    default: 'Uploading...'
  },
  previewUrl: {
    type: String,
    default: ''
  }
})

const states = reactive({
  isDragging: false,
  currentFileName: ""
})

async function onUploadImages(e) {
  const files = e.target.files
  if(files.length == 0) return
  let image_url = await readAsDataUrl(files[0])
  emit('update:modelValue', image_url)
  emit('onFileUpload', files)
  states.currentFileName = files[0].name

  setTimeout(()=>{
    inputRef.value.value = ''
  }, 100)
}
function remove() {
  emit('update:modelValue', '')
  emit('onRemove', "")
  states.currentFileName = ""
}

function onDragEnter(e) {
  if(!props.useDragDrop) {
    return false
  }
  if(e.dataTransfer.items.length > 1 ) return
  states.isDragging = true
}
let removeDragEl = null

function onDragOver(e) {
  if(!props.useDragDrop) {
    return false
  }
  if(e.dataTransfer.items.length > 1) return
  states.isDragging = true
  clearTimeout(removeDragEl)
  removeDragEl = setTimeout(()=>{
    states.isDragging = false
  }, 100)
}
function onDrop(e) {
  if(!props.useDragDrop) {
    return false
  }
  if(e.dataTransfer.files.length == 0) return
  states.isDragging = false
  let files = Array.from(e.dataTransfer.files).filter(f=>{
      return f.type.split('/')[0] === 'image'
  })
  onUploadImages({target: {files}})
}

function reset() {
  states.currentFileName = ""
}

onMounted(()=>{
  if(props.attachOnWindow) {
    window.addEventListener('dragenter', onDragEnter)
    window.addEventListener('dragover', onDragOver)
  }
})
onUnmounted(()=>{
  if(props.attachOnWindow) {
    window.removeEventListener('dragenter', onDragEnter)
    window.removeEventListener('dragover', onDragOver)
  }
})
defineExpose({
  reset
})
</script>

<style lang="scss" scoped>
.uploader-simple {
  padding: 10px;
  width: 350px;
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  cursor: pointer;
  color: #000;
  justify-content: center;
  align-items: center;
  background: #fff;
  border: 1px solid #e0e0e0;

  &.transparent {
    background: transparent;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  input {
    display: none;
  }
  .drop-catcher {
    position: fixed;
    display: flex;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    z-index: 10000;
    background: #5e27cdec;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
    &.visible {
      visibility: visible;
      opacity: 1;
    }
    &>div{
      height: 80vh;
      width: 80vw;
      border: 10px dashed #fff;
      margin: auto;
      border-radius: 5%;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
