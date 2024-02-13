import etro from 'etro'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('etro', etro)
  // console.log(etro, nuxtApp)
  console.log("loaded etro plugins")
});
