import { Store } from "vuex"
import VuexPersist from 'vuex-persist'
// import cropEditor from "./cropEditor"
// import userManager from "./userManager"
import houseKeeping from "./houseKeeping"
// import predictionManager from "./predictionManager"
// import templateManager from "./templateManager"
// import photoShiftEditor from "./photoShiftEditor"
// import qrManager from "./qrManager";
import * as localForage from "localforage";

if(process.client) {
  localForage.setDriver(localForage.INDEXEDDB)
}

let st = {
  getItem: async (key) => {
    const raw = await localForage.getItem(key)
    const data = raw ? JSON.parse(raw) : {}
    return data
  },
  setItem: async (key, value) => {
    // console.log('setItem', key, value)
    const valueString = JSON.stringify(value)
    localForage.setItem(key, valueString)
  },
  removeItem: async (key) => {
    localForage.removeItem(key)
  },
}

let vuexLocal = {
  plugin: ()=>{}
};
if(process.client) {
  vuexLocal = new VuexPersist({
    key: 'vuex',
    storage: st,
    asyncStorage: true,
    reducer: ({ 
      // cropEditor: {haschanges, isTopdown, ...cropEditor}, 
      // userManager: {assets, lastUserId, credits, ...userManager},
      houseKeeping,
      // photoShiftEditor,
      ...rest })=> {
      // return {userManager: {assets, lastUserId, credits}, cropEditor, ...rest}
      return {}
    }
  })
}

const store = new Store({
  plugins: [vuexLocal.plugin],
  modules: {
    // cropEditor,
    // userManager,
    houseKeeping,
    // predictionManager,
    // templateManager,
    // qrManager,
    // photoShiftEditor
  }
})

export default store
