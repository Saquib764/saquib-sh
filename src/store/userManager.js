import { ASSETS_TYPES } from '@/constants';
import { SUBSCRIPTIONS } from '@/constants/subscription';
import {storage, db} from '@/firebase'
import { supabase } from '@/supabase';
import AssetModel from '@/models/Asset';
import { copyJSON } from '@/utils/common';
import { addDoc, collection, doc, updateDoc, onSnapshot, getDocs, setDoc } from "firebase/firestore"; 
import { ref as Ref, getDownloadURL } from 'firebase/storage';

console.log("Loaded userManager.js")

export default {
  namespaced: true,
  state () {
    return{
      user: null,
      isAuth: false,
      isEditor: false,
      subscription: {
        status: 'active',
        current_subscription: SUBSCRIPTIONS.FREE,
        subscription_id: SUBSCRIPTIONS.FREE,
        product_id: SUBSCRIPTIONS.FREE,
        isProUser: false,
        is_paid_user: false,
      },
      isAdmin: false,
      isUserDetailLoading: true,
      token: "",
      useAs: "",
      currentUser: null,
      assets: [],
      lastAssetFetch: 0,
      lastUserId: null,
      isLoading: false,
      credits: 0
    }
  },
  mutations: {
    SET_LOADING(state, isLoading) {
      state.isLoading = isLoading
    },
    async SET_USER(state, user) {
      console.log('SET_USER', user)
      if(user) {
        user = {
          ...user,
          uid: user.id
        }
      }
      state.user = user
      state.isAuth = user? true: false
      if(!user) {
        state.isEditor = false
        state.isAdmin = false
        state.token = ""
        state.currentUser = null
        state.useAs = ""
        state.lastUserId = null
        state.isUserDetailLoading = false
        return
      }

      const {data: {session}} = await supabase.auth.getSession()
      // console.log('session', session, user)
      // const result = await user.getIdTokenResult(true)
      state.token = session.access_token
      const role = user.app_metadata.role || 'user'
      let {data:payment, error} = await supabase
        .from('payment').select('*')
        .order('created_at', { ascending: false }).limit(1)
      
      if(payment.length > 0) {
        payment = payment[0]
        state.subscription = {
          currentSubscription: payment.subscription_id,
          subscription_id: payment.subscription_id,
          product_id: payment.product_id,
          is_paid_user: true,
          status: new Date(payment.expires_at) > new Date(),
          expires_at: payment.expires_at,
        }
      }
      // const subscription = user.app_metadata.plan 
      // // Subscriptions
      // if( subscription && subscription != SUBSCRIPTIONS.FREE ) {
      //   state.subscription.currentSubscription = subscription
      //   state.subscription.isPaidUser = true
      // }

      state.isAdmin = ['admin'].includes(role)
      state.isEditor = ['admin', 'editor'].includes(role)
      state.currentUser = {
        ...user,
      }
      // if(state.isEditor && result.claims?.useAs) {
      //   state.useAs = result.claims.useAs
      //   state.currentUser = {
      //     uid: state.useAs,
      //   }
      // }else{
      //   state.currentUser = user
      // }
      state.lastUserId = state.currentUser.uid
      state.isUserDetailLoading = false
    },
    SET_USE_AS(state, useAs) {
      state.useAs = useAs
    },
    async REFRESH_TOKEN(state) {
      const {data: {session}} = await supabase.auth.getSession()
      state.token = session.access_token
    },
    async SET_ASSETS(state, assets) {
      let existing_asset_ids = state.assets.map(a=>a.id)
      // assets = assets.filter(a=>!existing_asset_ids.includes(a.id))
      state.assets = [ ...assets]
    },
    SET_CREDITS(state, credits) {
      state.credits = credits
    }
  },
  actions: {
    setLoading({commit}, isLoading) {
      commit('SET_LOADING', isLoading)
    },
    setUser({commit, dispatch, state}, user) {
      if(!user || state.user?.id != user.id) {
        // delete all assets
        dispatch('clear', null)
      }
      commit('SET_USER', user)
    },
    clear({commit, dispatch}) {
      // clear assets
      console.log('clear assets')
      commit('SET_ASSETS', [])
      dispatch('predictionManager/clear', null, {root: true})
      dispatch('cropEditor/clear', null, {root: true})
    },
    async refreshToken({commit}) {
      await commit('REFRESH_TOKEN')
    },
    async setAssets({commit}, assets) {
      await commit('SET_ASSETS', assets)
    },
    async fetchAssets({state, commit}, {project_id, user_id}) {
      try{
        if(state.lastAssetFetch > Date.now() - 1000 * 10 && false) {
          return
        }
        state.lastAssetFetch = Date.now()

        // get product list from supabase
        let { data:assets } = await supabase
          .from('product')
          .select('*')
          .order('created_at', { ascending: false })


        assets = await Promise.all(assets.map(async(im) =>{
          let src = ''
          try{
            src = await getDownloadURL(Ref(storage,  im.background_removed_url))
          } catch(e) { }
      
          return {
            ...im,
            signed_url: src,
          }
        }))
        commit('SET_ASSETS', assets)
      }catch(e) {
      }
    },
    async computeCredits({commit}) {
      let { data:d, error:e } = await supabase
        .rpc('get_available_credits')
      commit('SET_CREDITS', d)
    }
  },
}