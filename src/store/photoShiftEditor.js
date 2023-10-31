
import { supabase } from '@/supabase';

export default {
  namespaced: true,
  state () {
    return {
      predictions: [],
      assets: []
    }
  },
  mutations: {
    SET_PREDICTIONS(state, predictions) {
      state.predictions = predictions
    },
    SET_ASSETS(state, assets) {
      state.assets = assets
    }
  },
  actions: {
    async addPredictions({commit, state}, predictions) {
      commit('SET_PREDICTIONS', [ ...predictions, ...state.predictions])
    },
    async fetchPredictions({commit, state}) {
      const {data, error} = await supabase
        .from('generation')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', {ascending: false})
        .limit(100)
      if(error) {
        console.log('error', error)
        return
      }
      commit('SET_PREDICTIONS', data)
    },
    async fetchAssets({commit, state}) {
      const {data, error} = await supabase
        .from('asset')
        .select('*')
        .order('updated_at', {ascending: false})
        .limit(100)
      if(error) {
        console.log('error', error)
        return
      }
      commit('SET_ASSETS', data)
    },
  }
}