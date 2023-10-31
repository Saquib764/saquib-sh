

import { ref as Ref, getDownloadURL } from 'firebase/storage';
import EditorAssetModel from '@/models/EditorAsset';
import { sleep } from '@/utils/common';
import { supabase } from '@/supabase';


export default {
  namespaced: true,
  state () {
    return {
      predictions: [],
      lastUpdated: 0,
    }
  },
  mutations: {
    async SET_PREDICTIONS(state, predictions) {
      state.predictions = predictions
    },
  },
  actions: {
    setPredictions({commit}, predictions) {
      commit('SET_PREDICTIONS', predictions)
    },
    async togglePrediction({commit, state}, {prediction, type, delete_reason={}}) {
      let predictions = JSON.parse(JSON.stringify(state.predictions))
      let p = predictions.find(p=> p.id == prediction.id)
      if(!p) {
        return
      }

      if(type == 'is_liked') {
        p.is_liked = !p.is_liked
        // update generation table
        let {data, error} = await supabase
          .from('generation')
          .update({is_liked: p.is_liked})
          .eq('id', p.id)
      }
      if(type == 'is_deleted') {
        p.is_deleted = !p.is_deleted
        let {data, error} = await supabase
          .from('generation')
          .update({
            is_deleted: p.is_deleted,
            metadata:{
              ...p.metadata,
              delete_reason
            }
          })
          .eq('id', p.id)
      }

      commit('SET_PREDICTIONS', [ ...predictions])
    },
    async addPredictions({commit, state}, predictions) {
      commit('SET_PREDICTIONS', [ ...predictions, ...state.predictions])
    },
    async fetchPredictions({commit, state}, {user_id, project_id}) {
      // Fetch predictions from firebase, 100 at a time
      // Refresh every 0.25 Days
      if(state.lastUpdated < Date.now() - 0.25 * 24 * 60 * 60 * 1000) {
        // Increase this time as product gets stable
        console.log('reset')
        commit('SET_PREDICTIONS', [])
      }
      // get images from batch table in supabase
      let { data: predictions, error } = await supabase
        .from('batch').select(`
          *,
          generation (id, is_liked, is_deleted, url, metadata, created_at, type)
        `)
        .eq('project_id', project_id)
        .order('created_at', { ascending: false })
      
      predictions = predictions.reduce((acc, {generation, ...batch}) => {
        batch.editor.subjects = JSON.parse(batch.editor.subjects)
        let g = generation.map(_g=>({
          ..._g,
          batch,
        }))
        return [
          ...acc,
          ...g
        ]
      }, [])
      commit('SET_PREDICTIONS', [ ...state.predictions, ...predictions])
    },
    async clear({commit}) {
      console.log('clear')
      commit('SET_PREDICTIONS', [])
    },
    async get_batch_from_generation({state}, id) {
      const batch = state.predictions.find(p=> p.id.toString() == `${id}`)?.batch
      if(!batch) {
        return []
      }
      const g = state.predictions.filter(p=> p.batch.id == batch.id)
                .filter(p=> p.id.toString() != `${id}`)
      return g
    }
  },
  getters: {
    predicted_images(state) {
      return state.predictions.filter(p=> p.type == 'generation')
    }
  }
}