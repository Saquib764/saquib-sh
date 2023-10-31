<template>
  <div class="account-bar">
    <b v-if="user.isAuth" style="font-size: 0.9em;">{{ store.state.userManager.credits }} credits left</b>
    <zust-button 
      v-if="user.isAuth && !subscription.is_paid_user && !device.isMobile"
      append-icon="mdi-lightning-bolt"
      color="#f0932b" variant="flat" href="/account">
      Get premium
    </zust-button>

    <div v-if="!user.isAuth && !device.isMobile" class="actions-desktop">
      <span @click="scrollTo('how-it-works')" style="margin-left: 20px;">How it works</span>
      <span @click="scrollTo('pricing')" style="margin-left: 20px;">Pricing</span>
    </div>

    <v-menu v-if="user.isAuth">
      <template v-slot:activator="{ props }">
        <div style="position: relative;">
          <v-avatar
            :variant="subscription.is_paid_user?'outlined':'flat'"
            color="#ffd700" size="x-small"
            style="cursor: pointer; margin-right: 20px;" v-bind="props">
            <v-img
              :src="user.detail.user_metadata?.avatar_url"
              alt="Profile"
            ></v-img>
          </v-avatar>
          <v-icon v-if="subscription.is_paid_user"
            color="#ffd700" size="small" style="position: absolute; right: 15px; top:-9px">mdi-crown</v-icon>
        </div>
      </template>

      <v-list style="padding: 0 10px;">
        <v-list-item>{{ user.detail.user_metadata.email }}</v-list-item>
        <v-list-item v-if="user.isAuth && !subscription.is_paid_user && device.isMobile" href="/account" color="success">
          <zust-button color="success" variant="flat">
            Get premium
          </zust-button>
        </v-list-item>
        <v-list-item href="/project">Editor</v-list-item>
        <v-list-item href="/account">Pricing</v-list-item>
        <v-list-item href="/account">Account</v-list-item>
        <v-list-item @click="logout">
          {{ user.detail.user_metadata?.email.split('@')?.[0] }}
          <v-icon>mdi-logout</v-icon>
        </v-list-item>
      </v-list>
    </v-menu>
    <zust-button v-else href="/login"
        class="text-none"
        style="margin-right: 20px;">
      Login
    </zust-button>
    <v-menu v-if="!user.isAuth && device.isMobile">
      <template v-slot:activator="{ props }">
        <v-app-bar-nav-icon v-bind="props"></v-app-bar-nav-icon>
      </template>

      <v-list style="padding: 0 10px;">
        <v-list-item @click="scrollTo('how-it-works')">How it works</v-list-item>
        <v-list-item @click="scrollTo('pricing')">Pricing</v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script setup>
import { ref, watch, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router';
import {useStore} from 'vuex'
import { useTheme } from 'vuetify'
import ZustButton from '@/components/Buttons/index.vue'

import { supabase } from '@/supabase';
import { LOGOUT_REDIRECT_URL, APP_NAME } from '@/constants';

const device = useDevice()

const theme = useTheme()

const router = useRouter()
const store = useStore()

const user = useUser()
const subscription = computed(() => user.subscription);

store.dispatch('userManager/computeCredits')

function setTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}

async function logout() {
  // logout usng supabase
  await supabase.auth.signOut()
  store.dispatch('userManager/setUser', null)

  setTimeout(()=>{
    location.href = LOGOUT_REDIRECT_URL
  }, 40)
}

</script>

<style scoped lang="scss">
.account-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;

  .actions-desktop {
    margin-right: 20px;
    span{
      cursor: pointer;
    }
  }
}

</style>

