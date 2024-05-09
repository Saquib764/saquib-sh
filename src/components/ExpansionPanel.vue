<template>
  <div :class="{'expansion-panel': true, 'is-open': modelValue, 'timeline': props.isTimeline, 'row-reverse': props.rowReverse}">
    <div class="expansion-panel__header" @click="toggle">
      <span :class="`${bold?'font-weight-bold':''}`">{{props.title}}</span>
      <div v-if="!hideStatus">
        <v-icon size="small" v-if="props.modelValue" style="background: white; border-radius: 50%;">mdi-minus</v-icon>
        <v-icon v-if="!props.modelValue" size="small" style="background: white; border-radius: 50%;">mdi-plus</v-icon>
      </div>
    </div>
    <v-expand-transition>
      <div v-show="props.modelValue">
        <v-divider class="border-opacity-100" style="color: #EAEAEA"></v-divider>
        <slot></slot>
      </div>
    </v-expand-transition>
  </div>
</template>

<script setup>
const emit = defineEmits(['update:modelValue'])

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  modelValue: {
    type: Boolean,
    default: true
  },
  bold: {
    type: Boolean,
    default: false
  },
  rowReverse: {
    type: Boolean,
    default: false
  },
  hideStatus: {
    type: Boolean,
    default: false
  },
  isTimeline: {
    type: Boolean,
    default: false
  }
})

function toggle() {
  emit('update:modelValue', !props.modelValue)
}

</script>

<style lang="scss" scoped>
.expansion-panel {
  border-radius: 8px;
  position: relative;
  overflow: visible;

  &.is-open {
    background: #F5F5F5;
    .expansion-panel__header {
      padding-bottom: 3px !important;
    }
  }
  &.row-reverse .expansion-panel__header {
    display: flex;
    flex-direction: row-reverse;
    justify-content: flex-end;
    gap: 10px;
  }
  &.timeline {
    padding-left: 30px;
    &.is-open {
      background: unset !important;
    }
    &.is-open::after {
      height: 14px;
      width: 14px;
      top: 6px;
      left: 7px;
      background: rgb(120, 155, 120);
    }
  }
  &.timeline::after {
    content: "";
    height: 8px;
    width: 8px;
    position: absolute;
    left: 0;
    background: gray;
    border-radius: 50%;
    align-items: center;
    justify-content: center;
    display: flex;
    top: 8px;
    left: 10px;
    transition: all 0.3s ease-in-out;
  }
  &.timeline::before {
    content: "";
    position: absolute;
    background: gray;
    width: 2px;
    height: 100%;
    display: inline-flex;
    top: 16px;
    left: 13px;
  }
  &.timeline:last-child::before {
    display: none;
  }

  .expansion-panel__header{
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: 10px;
  }
  &.timeline .expansion-panel__header {
    padding: 0;
    padding-bottom: 10px;
  }

  i {
    background: transparent !important;
  }
}
</style>