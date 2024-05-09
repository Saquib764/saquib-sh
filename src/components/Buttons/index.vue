<template>
  <button v-if="!props.href" :class="{'zust-button': true, [props.variant]: true, 'prepend-icon': !!props.prependIcon, 'append-icon': !!props.appendIcon, [props.size]: true}"
    :style="`background: ${props.color}`"
    :disabled="props.disabled">
    <div :style="`visibility: ${props.loading?'hidden':'visible'}`">
      <v-icon style="margin-right: 5px;" v-if="props.prependIcon" :icon="props.prependIcon"/>
      <slot></slot>
      <v-icon style="margin-left: 5px;" v-if="props.appendIcon" :icon="props.appendIcon"/>
    </div>
    <v-progress-circular style="position: absolute;" :size="25" :width="2" indeterminate v-if="props.loading"></v-progress-circular>
  </button>
  <a v-else :href="props.href"
    :style="`background: ${props.color}`"
    :class="{'zust-button': true, [props.variant]: true}">
    <slot></slot>
    <v-icon v-if="props.appendIcon" :icon="props.appendIcon"/>
  </a>
</template>

<script setup>

const props = defineProps({
  href: {
    type: String,
    default: ''
  },
  prependIcon: {
    type: String,
    default: ''
  },
  appendIcon: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'solid'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: 'primary'
  },
  size: {
    type: String,
    default: 'medium'
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped lang="scss">
.zust-button {
  text-decoration: none;
  background-color: #2f2f2f;
  padding: 10px 30px;
  border-radius: 6px;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
  font-weight: bold;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  
  &.small {
    padding: 5px 10px;
    font-size: 0.8em;
    border-radius: 3px;
  }
  &.prepend-icon {
    padding-left: 15px !important;
  }
  &.append-icon {
    padding-right: 15px !important;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover {
    background-color: #000000;
  }
  &.outline {
    background-color: transparent;
    border: solid 1px #2f2f2f;
    color: #2f2f2f;
    &:hover {
      background-color: #000000;
      color: white;
    }
  }
}
</style>
