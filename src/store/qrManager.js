
import { supabase } from '@/supabase';

export default {
  namespaced: true,
  state () {
    return {
      generations: [],
      predictions: [],
      qr_text: '',
      qr_prompt: '',
      free_credits: 1
    }
  },
  mutations: {
    SET_GENERATIONS(state, generations) {
      state.generations = generations
    },
    SET_QR_TEXT(state, qr_text) {
      state.qr_text = qr_text
    },
    SET_QR_PROMPT(state, qr_prompt) {
      state.qr_prompt = qr_prompt
    },
    SET_CREDITS(state, credits) {
      state.free_credits = credits
    }
  },
  actions: {
    addGenerations({commit, state}, generations) {
      let _generations = JSON.parse(JSON.stringify(state.generations))
      _generations = [...generations, ..._generations]
      commit('SET_GENERATIONS', _generations)
    },
    setGenerations({commit}, generations) {
      commit('SET_GENERATIONS', generations)
    },
    setQrText({commit}, qr_text) {
      commit('SET_QR_TEXT', qr_text)
    },
    setQrPrompt({commit}, qr_prompt) {
      commit('SET_QR_PROMPT', qr_prompt)
    },
    async fetchPredictions({commit, state}) {
      const {data, error} = await supabase
        .from('batch')
        .select('*, generation(*)')
        .eq('status', 'completed')
        .order('created_at', {ascending: false})
        .limit(100)
      if(error) {
        console.log('error', error)
        return
      }
      let g = data.reduce((acc, cur) => {
        if(cur.generation) {
          acc = [...acc, ...cur.generation.filter(g=>g.type == 'generation').map(g=>({
            ...g,
            src: g.url,
            qr_text: cur.qr_text,
            qr_prompt: cur.metadata.payload.qr_prompt
          }))]
        }
        return acc
      }, [])
      // console.log('data', data[0], state.generations[0])
      commit('SET_GENERATIONS', g)
    },
  }
}
