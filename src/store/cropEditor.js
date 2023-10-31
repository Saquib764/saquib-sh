
import {storage, db} from '@/firebase'
import { addDoc, collection, doc, updateDoc, onSnapshot } from "firebase/firestore";

import EditorAssetModel from '@/models/EditorAsset';
import EditorModel from '@/models/Editor';

export default {
  namespaced: true,
  state () {
    let obj = {
      ...(new EditorModel()).data_v1,
      editor_id: "",
      user_id: "",
      project_id: '',
      subjects: [{
          "id": "honey",
          "asset_type": "product",
          "caption_prediction": "perfume bottle",
          "left": 0.5665236759293902,
          "top": 0.43626149783742585,
          "updated_at": 1695196309990,
          "created_at": 1695196152307,
          "src": "",
          "background_removed_url": "example-subjects/perfume_bottle.webp",
          "signed_url": "https://firebasestorage.googleapis.com/v0/b/zust-ai.appspot.com/o/example-subjects%2Fperfume_bottle.webp?alt=media",
          "scale": 0.0006041213346134321,
          "description": ""
      }],
      selectedCategories: [],
      aspectRatio: 1,
      hasChanges: false,
      lastChanged: 0,
      lastSaved: 0,
      saveAllowed: false,
      currentMenuItem: 'prompt',
      dilate_strength: 3,
      isTopdown: false,
    }
    if(!obj.prompt) {
      obj.prompt = "on a serene mountaintop surrounded by majestic peaks and clear blue skies, gentle sunlight illuminating"
    }
    if( !obj.subject_description ) {
      obj.subject_description = "perfume bottle"
    }
    return obj
  },
  mutations: {
    SET_EDITOR(state, {editor_id, user_id, project_id, subjects=[], ...editor}) {
      let _subjects = [...subjects]
      if(editor.platform) {
        _subjects = [..._subjects, editor.platform]
      }
      if(editor.background) {
        _subjects = [..._subjects, editor.background]
      }
      _subjects = _subjects.map(s=> {
        let asset = new EditorAssetModel(s)
        return asset.data_v2
      })

      state.editor_id = editor_id
      state.user_id = user_id
      state.project_id = project_id
      state.hasChanges = false

      state.subjects = _subjects

      let _editor = new EditorModel(editor)
      let {subjects:_, background, platform, ...__editor} = _editor.data_v1
      Object.assign(state, __editor)
    },
    ADD_SUBJECT(state, subject) {
      const current_platform = state.subjects.find(s=> s.asset_type === 'platform')
      if(subject.asset_type === 'platform' && current_platform && current_platform.id !== subject.id) {
        state.subjects = state.subjects.filter(s=> s.asset_type !== 'platform')
      }
      const current_bg = state.subjects.find(s=> s.asset_type === 'background')
      if(subject.asset_type === 'background' && current_bg && current_bg.id !== subject.id) {
        state.subjects = state.subjects.filter(s=> s.asset_type !== 'background')
      }
      if(subject.caption_prediction) {
        state.subject_description = subject.caption_prediction
      }
      let asset = new EditorAssetModel(subject)
      state.subjects = [...state.subjects, asset.data_v2]
      state.subjects.sort((a, b)=> a.updated_at - b.updated_at)
      state.hasChanges = true
      state.lastChanged = Date.now()
    },
    UPDATE_SUBJECT(state, subject) {
      const og = state.subjects.find(s=> s.id == subject.id)
      let asset = new EditorAssetModel({
        ...og,
        ...subject
      })
      state.subjects = [...state.subjects.filter(s=> s.id != subject.id), asset.data_v2]
      state.subjects.sort((a, b)=> a.updated_at - b.updated_at)
      state.hasChanges = true
      state.lastChanged = Date.now()
    },
    DELETE_SUBJECT(state, id) {
      const item = state.subjects.find(s=> s.id == id)
      state.subject_description = ''
      state.subjects = state.subjects.filter(s=> s.id != id)
      state.hasChanges = true
      state.lastChanged = Date.now()
    },
    CLEAR(state) {
      console.log('CLEAR_EDITOR')
      // state.subjects = []
    },
    UPDATE_ASPECT_RATIO(state, ratio) {
      let current_aspect_ratio = state.aspectRatio
      state.subjects = state.subjects.map(s=> {
        let new_scale = s.scale * current_aspect_ratio / ratio
        s.left = 0.5 - (0.5 - s.left - s.scale/2) * current_aspect_ratio / ratio 
        s.top = 0.5 - (0.5 - s.top - s.scale/2) * ratio / current_aspect_ratio
        s.scale = new_scale
        return s
      })

      state.aspectRatio = ratio
      state.hasChanges = true
      state.lastChanged = Date.now()
    },
    POST_SAVE_STEPS(state) {
      state.hasChanges = false
      state.lastSaved = state.lastChanged
    },
    UPDATE_DETAILS(state, data) {
      if(data.currentMenuItem) {
        state.currentMenuItem = data.currentMenuItem || 'prompt'
      }
      let editor = new EditorModel({...state, isEditor: data.isEditor})
      let updates = editor.update(data)

      Object.assign(state, updates)
      state.lastChanged = Date.now()
      state.hasChanges = true
    }
  },
  actions: {
    setEditor({ commit, rootState }, editor) {
      commit('SET_EDITOR', {...editor, isEditor: rootState.userManager.isEditor})
    },
    addSubject({commit, state}, subject) {
      if(state.subjects.find(s=> s.id == subject.id)) {
        return
      }
      commit('ADD_SUBJECT', {...subject, updated_at: Date.now()})
    },
    updateSubject({commit, state}, subject) {
      if(!state.subjects.find(s=> s.id == subject.id)) {
        console.log('subject not found')
        return
      }
      commit('UPDATE_SUBJECT', subject)
    },
    removeBackgroundFromEditor({commit, state}) {
      let background = state.subjects.find(s=> s.asset_type === 'background')
      if(!background) {
        return
      }
      commit('DELETE_SUBJECT', background.id)
    },
    deleteSubject({commit, state}, id) {
      commit('DELETE_SUBJECT', id)
    },
    clear({commit}) {
      commit('CLEAR')
    },
    updateAspectRatio({commit, state}, ratio) {
      commit('UPDATE_ASPECT_RATIO', ratio)
    },
    updateDetails({commit, state, rootState}, details) {
      details.isEditor = rootState.userManager.isEditor
      commit('UPDATE_DETAILS', details)
    }
  }
}