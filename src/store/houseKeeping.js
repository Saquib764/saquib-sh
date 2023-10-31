

export default {
  namespaced: true,
  state () {
    return{
      snackbar: {
        isOpen: false,
        message: "",
        color: 'success',
        timeout: 3000
      }
    }
  },
  mutations: {
    TOGGLE_SNACKBAR(state, snackbar) {
      state.snackbar = {
        ...snackbar
      }
    }
  },
  actions: {
    showSnackbar({commit}, snackbar) {
      commit('TOGGLE_SNACKBAR', {
        ...snackbar,
        isOpen: true
      })
    },
    hideSnackbar({commit}) {
      commit('TOGGLE_SNACKBAR', {isOpen: false})
    }
  }
}