

const APPS = {
  'home': 'views/Home',
  'product-demo': 'views/ProductDemo',
  'product-shoot3d': 'views/ProductShoot3D',
  'motiondub': 'views/MotionDub',
}
const SITEMAP_BASE = {
  'home': 'https://saquib.sh',
  'product-demo': 'https://productdemo.tech',
  'product-shoot3d': 'https://productshoot3d.com',
  'motiondub': 'https://motiondub.com',
}

export default defineNuxtConfig({
  devtools: { enabled: true },
  srcDir: 'src/',
  experimental: {
    noVueServer: true,
  },
  loading: {
    color: 'blue',
    height: '5px'
  },
  routeRules: {
    'editor/*': {ssr: false},
    'account': {ssr: false},
    'generation': {ssr: false},
  },
  dir: {
    pages: APPS[import.meta.env.VITE_APP_NAME],
  },
  buildModules: [
    'nuxt-vite',
    '@nuxtjs/style-resources'
  ],
  css: [
    'vuetify/lib/styles/main.sass',
    import.meta.env.VITE_APP_NAME=='photoshift'?'@/styles/photoshift_settings.scss':'@/styles/settings.scss',
    '@mdi/font/css/materialdesignicons.min.css'
  ],
  build: {
    transpile: ['vuetify'],
    vendor: ['watermarkjs'],
  },
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
    }
  },
  // styleResources: {
  //   scss: [
  //     '@/styles/settings.scss',
  //   ],
  // },
  hooks: {
    'pages:extend' (pages) {
      // add a route
      // console.log('pages', pages);
      // pages.push({
      //   name: 'Login',
      //   path: '/login',
      //   file: '@/views/Auth/LoginGmailPage.vue'
      // })
      // pages.push({
      //   name: 'Register',
      //   path: '/register',
      //   file: '@/views/Auth/RegisterPage.vue'
      // })

      // remove routes
      function removePagesMatching (pattern, pages= []) {
        const pagesToRemove = []
        for (const page of pages) {
          if (pattern.test(page.file)) {
            pagesToRemove.push(page)
          } else {
            removePagesMatching(pattern, page.children)
          }
        }
        for (const page of pagesToRemove) {
          pages.splice(pages.indexOf(page), 1)
        }
      }
      removePagesMatching(/\.ts$/, pages)
    },
    // 'vite:extendConfig': (config) => {
    //   config.plugins.push(
    //     vuetify({
    //       styles: { configFile: resolve('./settings.scss') },
    //     })
    //   )
    // }
  },
  modules: [
    //   '@nuxt/ui'
    'nuxt-simple-sitemap',
  ],
  vite: {
    define: {
      'process.env': {
        DEBUG: false
      }
    }
  },
  site: {
    url: SITEMAP_BASE[import.meta.env.VITE_APP_NAME],
  },
  sitemap: {
    discoverImages: false,
  }
})
