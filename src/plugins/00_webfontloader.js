/**
 * plugins/webfontloader.js
 *
 * webfontloader documentation: https://github.com/typekit/webfontloader
 */

export async function loadFonts () {
  const webFontLoader = await import(/* webpackChunkName: "webfontloader" */'webfontloader')

  webFontLoader.load({
    google: {
      families: ['Montserrat:100,300,400,500,700,900&display=swap'],
    },
  })
}

export default defineNuxtPlugin((nuxtApp) => {
  if(!process.client) {
    return
  }
  loadFonts()
});