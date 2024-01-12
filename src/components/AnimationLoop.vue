<template>

</template>
<script>
export default {
  props: {
    onFrame: {
      type: Function,
      default: () => null
    }
  },
  data() {
    return{
      loopId: null,
    }
  },
  mounted() {
    this._loop()
  },
  unmounted() {
    window.cancelAnimationFrame(this.loopId)
  },
  methods: {
    _loop() {
      this.onFrame()
      this.loopId = window.requestAnimationFrame(this._loop)
    }
  }
}
</script>