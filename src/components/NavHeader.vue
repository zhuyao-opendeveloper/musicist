<script setup>
import { inject, ref, computed } from 'vue'
import { Music, Settings, LogOut, Lock, CalendarDays } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const auth = inject('auth')

const showLoginModal = ref(false)
const showSetupModal = ref(false)
const password = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')

const today = computed(() => {
  const d = new Date()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${weekdays[d.getDay()]}`
})

const goToAdmin = () => {
  if (auth.isSetupRequired.value) {
    showSetupModal.value = true
  } else if (!auth.isAuthenticated.value) {
    showLoginModal.value = true
  } else {
    router.push('/admin')
  }
}

const handleLogin = () => {
  if (!password.value) {
    errorMessage.value = '请输入密码'
    return
  }
  if (auth.login(password.value)) {
    showLoginModal.value = false
    password.value = ''
    errorMessage.value = ''
    router.push('/admin')
  } else {
    errorMessage.value = '密码错误'
  }
}

const handleSetup = () => {
  if (!newPassword.value) {
    errorMessage.value = '请输入密码'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = '两次输入的密码不一致'
    return
  }
  if (newPassword.value.length < 6) {
    errorMessage.value = '密码长度至少6位'
    return
  }
  auth.setupPassword(newPassword.value)
  showSetupModal.value = false
  newPassword.value = ''
  confirmPassword.value = ''
  errorMessage.value = ''
  router.push('/admin')
}

const handleLogout = () => {
  auth.logout()
}
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <div
          class="flex items-center space-x-3 cursor-pointer group"
          @click="router.push('/')"
        >
          <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-primary shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-shadow duration-300">
            <Music class="w-5 h-5 text-white" />
          </div>
          <div>
            <span class="text-xl font-bold gradient-text">Musicist</span>
            <span class="text-[10px] text-gray-500 block leading-none -mt-0.5">发现你的音乐世界</span>
          </div>
        </div>

        <!-- Date & Navigation -->
        <div class="hidden md:flex items-center space-x-6">
          <div class="flex items-center space-x-2 text-gray-400 text-sm">
            <CalendarDays class="w-4 h-4" />
            <span>{{ today }}</span>
          </div>

          <button
            @click="router.push('/')"
            :class="[
              'px-4 py-2 rounded-lg transition-all duration-200 text-sm',
              route.name === 'Home'
                ? 'bg-gradient-primary text-white shadow-lg shadow-primary-500/25'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            ]"
          >
            首页
          </button>
          <button
            @click="goToAdmin"
            :class="[
              'px-4 py-2 rounded-lg transition-all duration-200 text-sm flex items-center space-x-1.5',
              route.name === 'Admin'
                ? 'bg-gradient-primary text-white shadow-lg shadow-primary-500/25'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            ]"
          >
            <Settings class="w-3.5 h-3.5" />
            <span>管理</span>
          </button>
        </div>

        <!-- Right side -->
        <div class="flex items-center space-x-3">
          <div v-if="auth.isAuthenticated.value" class="flex items-center space-x-2">
            <span class="px-2.5 py-1 bg-gradient-primary/20 text-primary-300 text-xs rounded-full font-medium">
              管理员
            </span>
            <button
              @click="handleLogout"
              class="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              title="退出登录"
            >
              <LogOut class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Login Modal -->
    <Teleport to="body">
      <div
        v-if="showLoginModal"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]"
        @click.self="showLoginModal = false"
      >
        <div class="glass-card p-8 w-full max-w-md">
          <div class="flex items-center space-x-3 mb-6">
            <div class="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Lock class="w-5 h-5 text-white" />
            </div>
            <h2 class="text-xl font-bold text-white">管理员登录</h2>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-400 mb-2">密码</label>
              <input
                v-model="password"
                type="password"
                placeholder="请输入管理员密码"
                class="w-full bg-dark-700/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all"
                @keyup.enter="handleLogin"
              />
            </div>
            <p v-if="errorMessage" class="text-red-400 text-sm">{{ errorMessage }}</p>
            <button
              @click="handleLogin"
              class="w-full py-3 bg-gradient-primary hover:shadow-lg hover:shadow-primary-500/30 text-white rounded-xl font-medium transition-all"
            >
              登录
            </button>
          </div>
        </div>
      </div>

      <!-- Setup Modal -->
      <div
        v-if="showSetupModal"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]"
        @click.self="showSetupModal = false"
      >
        <div class="glass-card p-8 w-full max-w-md">
          <div class="flex items-center space-x-3 mb-6">
            <div class="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Lock class="w-5 h-5 text-white" />
            </div>
            <h2 class="text-xl font-bold text-white">设置管理员密码</h2>
          </div>
          <p class="text-gray-400 text-sm mb-4">首次使用，请设置管理员密码</p>
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-400 mb-2">新密码</label>
              <input
                v-model="newPassword"
                type="password"
                placeholder="请输入新密码（至少6位）"
                class="w-full bg-dark-700/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all"
              />
            </div>
            <div>
              <label class="block text-sm text-gray-400 mb-2">确认密码</label>
              <input
                v-model="confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                class="w-full bg-dark-700/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all"
                @keyup.enter="handleSetup"
              />
            </div>
            <p v-if="errorMessage" class="text-red-400 text-sm">{{ errorMessage }}</p>
            <button
              @click="handleSetup"
              class="w-full py-3 bg-gradient-primary hover:shadow-lg hover:shadow-primary-500/30 text-white rounded-xl font-medium transition-all"
            >
              设置密码并登录
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </header>
</template>
