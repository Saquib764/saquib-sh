
<template>
  <div class="input-tagsarea" @click.passive="onClick">
    <span v-for="t, i in props.tags" :key="i">{{ t }}</span>
    <span ref="input"
      :placeholder="props.placeholder"
      contenteditable="plaintext-only"
      @input.passive="onChange"></span>
  </div>
</template>

<script setup>
import { ref, watch, reactive, onMounted, onUnmounted, computed } from 'vue'
const emit = defineEmits(['update:modelValue'])

const props = defineProps({
  modelValue: {
    type: String,
    default: ""
  },
  placeholder: {
    type: String,
    default: "type..."
  },
  tags: {
    type: Array,
    default: ()=>([])
  },
})
const input = ref(null)
watch(()=>props.modelValue, (newVal, oldVal)=>{
  if(newVal != input.value.innerText) {
    input.value.innerText = newVal
  }
})
let timer = null
function onChange(e) {
  clearTimeout(timer)
  timer = setTimeout(()=>{
    emit('update:modelValue', e.target.innerText)
  }, 300)
}
function onClick(e) {
  e.target.querySelector('[contenteditable]')?.focus()
}
onMounted(()=>{
  input.value.innerText = props.modelValue
})
</script>

<style scoped lang="scss">
.input-tagsarea {
  flex: 1;
  border: solid 1px #ccc;
  border-radius: 4px;
  padding: 5px;
  cursor: text;
  pointer-events: inherit;
  span {
    background-color: #dbf0fc;
    padding: 2px 10px;
    margin-right: 5px;
    border-radius: 5px;
    line-height: 1.5em;
    font-size: 0.9em;

    &[contenteditable] {
      position: relative;
      background-color: transparent;
      padding: 0px 0px;
      margin-right: 5px;
      border-radius: 5px;
      font-size: 1em;

      &:empty:before{
        content: attr(placeholder);
        pointer-events: none;
        color: #ccc;
        width: 100%;
      }
      &:empty:focus::after{
        content: " ";
        position: absolute;
        left: 0;
        border-left: 2px solid black;
        top: 1px;
        height: 100%;
        animation: blink-animation 1.2s steps(2, start) infinite;
      }

      @keyframes blink-animation {
        to {
          border-left: 1px solid rgba(0, 0, 0, 0);
        }
      }
      &:focus {
        outline: none;
      }
    }
  }
  &:has(> span[contenteditable]:focus) {
    border: solid 2px #1f4ed9;
    padding: 4px;
  }
}
</style>
