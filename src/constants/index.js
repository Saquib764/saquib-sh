
export const BASE_API = import.meta.env.VITE_BASE_API
export const ENV = import.meta.env.VITE_ENV || 'development'
export const APP_NAME = import.meta.env.VITE_APP_NAME
import { locationCopy as location } from "../utils/common"


export const AVAILABLE_TEMPLATES = [
  // {
  //   title: 'Miscellaneous',
  //   value: 'miscellaneous',
  //   icon: 'https://firebasestorage.googleapis.com/v0/b/zust-ai.appspot.com/o/themes%2Fmiscellaneous.png?alt=media'
  // },
  {
    title: 'Snow/Winter',
    value: 'snow_winter',
    icon: 'https://firebasestorage.googleapis.com/v0/b/zust-ai.appspot.com/o/themes%2Fsnow_winter.png?alt=media'
  },
  {
    title: 'Nature / Forest',
    value: 'nature_forest',
    icon: 'https://firebasestorage.googleapis.com/v0/b/zust-ai.appspot.com/o/themes%2Fnature_forest.png?alt=media'
  },
  {
    title: 'Nature / Mountain',
    value: 'nature_mountain',
    icon: 'https://firebasestorage.googleapis.com/v0/b/zust-ai.appspot.com/o/themes%2Fnature_mountain.png?alt=media'
  },
  {
    title: 'Outdoor / Patio',
    value: 'outdoor_patio',
    icon: 'https://firebasestorage.googleapis.com/v0/b/zust-ai.appspot.com/o/themes%2Foutdoor_patio.png?alt=media'
  },
  {
    title: 'Outdoor / Picnic',
    value: 'outdoor_picnic',
    icon: 'https://firebasestorage.googleapis.com/v0/b/zust-ai.appspot.com/o/themes%2Foutdoor_picnic.png?alt=media'
  },
  {
    title: 'City Streets',
    value: 'city_streets',
    icon: 'https://firebasestorage.googleapis.com/v0/b/zust-ai.appspot.com/o/themes%2Fcity_streets.png?alt=media'
  },
  {
    title: 'Living Room',
    value: 'living_room',
    icon: 'https://firebasestorage.googleapis.com/v0/b/zust-ai.appspot.com/o/themes%2Fliving_room.png?alt=media'
  },
  {
    title: 'Modern Kitchen',
    value: 'modern_kitchen',
    icon: 'https://firebasestorage.googleapis.com/v0/b/zust-ai.appspot.com/o/themes%2Fmodern_kitchen.png?alt=media'
  }
]

const BASE = `https://firebasestorage.googleapis.com/v0/b/zust-ai.appspot.com/o/product-demos%2F`
export const PRODUCT_DEMO_OUTPUTS = [
  {
    productUrl: `${BASE}sofa1.png?alt=media`,
    name: 'Packaged Goods',
    generations: [1, 2, 3, 4, 5, 6, 7, 8].map(n=>({
      src: `${BASE}sofa%2Fsofa_${n}.png?alt=media`,
      id: `s-${n}`
    }))
  },
  {
    productUrl: `${BASE}honey.png?alt=media`,
    name: 'Furniture & Home Decor',
    generations: [1, 2, 3, 4, 5, 6, 7, 8].map(n=>({
      src: `${BASE}honey%2Fhoney_${n}.png?alt=media`,
      id: `s-${n}`
    }))
  },
  {
    productUrl: `${BASE}mokobara2.png?alt=media`,
    name: 'Apparel (Coming Soon)',
    generations: [1, 2, 3, 4, 5, 6, 7, 8].map(n=>({
      src: `${BASE}mokobara%2Fmokobara_${n}.png?alt=media`,
      id: `s-${n}`
    }))
  }
]

export const AVAILABLE_COLOR_PALETTES = [
  ['#FF0000', '#AA0000', '#550000'],
  ['#FFFF00', '#AAAA00', '#555500'],
  ['#00FF00', '#00AA00', '#005500'],
  ['#00FFFF', '#00AAAA', '#005555'],
  ['#0000FF', '#0000AA', '#000055'],
]
export const ASSETS_TYPES = {
  PRODUCT: 'product',
  BACKGROUND: 'background',
  PLATFORM: 'platform',
}
export const ASSETS_TYPES_LIST = Object.values(ASSETS_TYPES)

let _LOGOUT_REDIRECT_URL = 'https://zust.ai'
if(location.origin.indexOf('stage.zust') > -1 ) {
  _LOGOUT_REDIRECT_URL = 'https://stage.zust.ai'
}
if(location.origin.indexOf('photoshift.') > -1 ) {
  _LOGOUT_REDIRECT_URL = location.origin
}


if(location.origin.indexOf('fakezust.ai') > -1 ) {
  _LOGOUT_REDIRECT_URL = location.origin
}

export const LOGOUT_REDIRECT_URL = _LOGOUT_REDIRECT_URL;
