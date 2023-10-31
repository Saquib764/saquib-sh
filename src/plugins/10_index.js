/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

import { reactive } from "vue";

// Plugins
// import { loadFonts } from './webfontloader'
// import vuetify from './vuetify'
// import router from '../router'


// export default defineNuxtPlugin((nuxtApp) => {
//   console.log("running store plugin");
//   nuxtApp.vueApp.use(vuetify);
//   // Install the store instance as a plugin
// });
// export function registerPlugins (app) {
//   loadFonts()
//   app
//     .use(vuetify)
//     .use(router)
// }

const states = reactive({
  pageReady: false,
  pageLoading: false,
  pageError: false,
  pageErrorMessage: "",
});

export default defineNuxtPlugin((nuxtApp) => {
  console.log("loaded all plugins")
});
