<script setup>
import { inject, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Music, Settings, LogOut, LogIn, Github, User } from 'lucide-vue-next'

const auth = inject('auth')
const github = inject('github')
const router = useRouter()
const route = useRoute()

const handleLogin = () => {
  const clientId = 'Ov23liNlJNYX9VZ8y0zC'
  const redirectUri = encodeURIComponent(`${window.location.origin}/admin`)
  const scope = 'repo'
  window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`
}

const handleLogout = () => {
  auth.logout()
  router.push('/')
}

const goToAdmin = () => {
  if (auth.isLoggedIn.value) {
    router.push('/admin')
  } else {
    handleLogin()
  }
}

onMounted(() => {
  github.loadConfig()
})
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-dark-600">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center space-x-3" @click="router.push('/')">
          <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
            <Music class="w-6 h-6 text-white" />
          </div>
          <span class="text-xl font-bold text-white">Musicist</span>
        </div>

        <nav class="hidden md:flex items-center space-x-6">
          <button
            @click="router.push('/')"
            :class="[
              'px-4 py-2 rounded-lg transition-colors',
              route.name === 'Home' ? 'bg-primary-600/20 text-primary-400' : 'text-gray-400 hover:text-white hover:bg-dark-600'
            ]"
          >
            首页
          </button>
          <button
            @click="goToAdmin"
            :class="[
              'px-4 py-2 rounded-lg transition-colors flex items-center space-x-2',
              route.name === 'Admin' ? 'bg-primary-600/20 text-primary-400' : 'text-gray-400 hover:text-white hover:bg-dark-600'
            ]"
          >
            <Settings class="w-4 h-4" />
            <span>管理</span>
          </button>
        </nav>

        <div class="flex items-center space-x-3">
          <div v-if="auth.user" class="flex items-center space-x-3">
            <img
              :src="auth.user.avatar_url"
              :alt="auth.user.login"
              class="w-8 h-8 rounded-full"
            />
            <span class="text-white text-sm hidden sm:block">{{ auth.user.login }}</span>
            <button
              @click="handleLogout"
              class="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-600 transition-colors"
              title="退出登录"
            >
              <LogOut class="w-5 h-5" />
            </button>
          </div>
          <button
            v-else
            @click="handleLogin"
            class="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <Github class="w-4 h-4" />
            <span>登录</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
