<template>
  <div class="uploader-boxy"
    ref="uploaderBoxy"
    @click="inputRef.click()"
    @dragover.prevent="onDragOver"
    @drop.prevent="onDrop"
    @dragenter.prevent="onDragEnter">

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
        accept="image/png, image/jpeg" />

    <div v-if="props.modelValue" style="height: 100%;">
      <img :src="props.modelValue" />
    </div>
    <div v-else class="flex-fill d-flex flex-column" style="justify-content: center; gap: 10px; padding: 10px;">
      <div style="font-size: 3em; opacity: 0.8;">
        <slot></slot>
      </div>
      <v-btn
        for="image-select"
        size="large"
        prepend-icon="mdi-tray-arrow-up"
        color="primary"
        variant="tonal">{{ props.uploadText }}</v-btn>
      <span v-show="props.useDragDrop">or drop a file</span>
    </div>
    <div class="upload-status" v-if="props.isUploading">
      <v-progress-circular
        indeterminate
        size="small"
        color="primary"
      ></v-progress-circular>
      <span>Uploading...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, reactive, onMounted, computed, onUnmounted } from 'vue'
import { readAsDataUrl, sleep } from '../../utils/common'
import { windowCopy as window } from '../../utils/common';

const emit = defineEmits(['onFileUpload', 'update:modelValue'])
const inputRef = ref(null)
const uploaderBoxy = ref(null)
let props = defineProps({
  useDragDrop: {
    type: Boolean,
    default: false
  },
  attachOnWindow: {
    type: Boolean,
    default: false
  },
  uploadText: {
    type: String,
    default: 'Upload image'
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
})


const states = reactive({
  isDragging: false,
})

async function onUploadImages(e) {
  const files = e.target.files
  let image_url = await readAsDataUrl(files[0])
  emit('update:modelValue', image_url)
  emit('onFileUpload', files)

  setTimeout(()=>{
    inputRef.value.value = ''
  }, 100)
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
</script>

<style lang="scss" scoped>
.uploader-boxy {
  width: 350px;
  height: 300px;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  box-shadow: 0 0 5px -2px rgba(0,0,0,0.2);
  padding: 15px;
  margin: 10px;
  cursor: pointer;
  color: #000;
  text-align: center;
  background: #fff;


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
  .upload-status {
    display: flex;
    flex-direction: row;
    gap: 10px;
    align-items: center;
    position: absolute;
  }
}
</style>
