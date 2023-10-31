import {storage, db} from '@/firebase'
import { addDoc, collection, doc, updateDoc, onSnapshot, getDocs, setDoc } from "firebase/firestore"; 
import { ref as Ref, getDownloadURL, uploadBytes } from 'firebase/storage';

import { supabase } from '@/supabase';


export default {
  namespaced: true,
  state () {
    return{
      templates: [],
      variants: []
    }
  },
  mutations: {
    SET_TEMPLATES(state, templates) {
      state.templates = templates
    },
    SET_VARIANTS(state, variants) {
      state.variants = variants
    }
  },
  actions: {
    async fetchTemplates({commit, rootState}) {
      const {data:categories} = await supabase.from('template_category').select('*, template(*)')
      commit('SET_TEMPLATES', categories)
    },
    async updateTemplate({commit, dispatch}, {id, ...template}) {
      if(id) {
        const docRef = doc(db, `templates/${id}`)
        await updateDoc(docRef, {...template, updated_at: new Date()})
      }else {
        const docRef = await addDoc(collection(db, `templates`), template)
      }
      dispatch('fetchTemplates')
      return true
    },
    async updateVariant({commit, dispatch}, {template_id, variant}) {
      let docRef = doc(collection(db, `templates/${template_id}/variants`))
      const variant_id = variant.id || docRef.id
      docRef = doc(db, `templates/${template_id}/variants/${variant_id}`)
      if(variant.background) {
        const instance_url = `templates/${template_id}/${variant_id}/background.png`
        let signed_url = await getDownloadURL(Ref(storage, variant.background.src))
        const req = await fetch(signed_url)
        const fileBuffer = await req.arrayBuffer();
        const imgRef = Ref(storage, instance_url);
        await uploadBytes(imgRef, fileBuffer, {
          contentType: 'image/png',
        })
        variant.background.src = `https://firebasestorage.googleapis.com/v0/b/zust-ai.appspot.com/o/${instance_url.replaceAll('/', '%2F')}?alt=media`
      }
      await setDoc(docRef, variant, {merge: true})
      dispatch('fetchTemplates')
      return docRef.id
    }
  },
}