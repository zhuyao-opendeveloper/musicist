<script setup>
import { ref, inject, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Home, Settings, Music, Users, Database, Plus, Trash2, 
  Save, Eye, EyeOff, Github, LogOut, RefreshCw, X, Check,
  AlertTriangle, Shield, Scan
} from 'lucide-vue-next'

const auth = inject('auth')
const github = inject('github')
const music = inject('music')
const danmaku = inject('danmaku')
const ai = inject('ai')
const router = useRouter()

const activeSection = ref('sources')
const showAddSourceModal = ref(false)
const showAddSongModal = ref(false)
const showConfigModal = ref(false)
const loading = ref(false)
const error = ref('')

const newSource = ref({
  name: '',
  url: '',
  songs: []
})

const newSong = ref({
  title: '',
  artist: '',
  url: '',
  cover: ''
})

const configForm = ref({
  owner: '',
  repo: ''
})

const selectedSource = ref(null)
const isReviewing = ref(false)
const reviewResults = ref([])
const currentSongId = ref('')

const sections = [
  { id: 'sources', label: '音乐源', icon: Music },
  { id: 'playlists', label: '播放列表', icon: Database },
  { id: 'danmaku', label: '弹幕管理', icon: Settings },
  { id: 'users', label: '用户管理', icon: Users },
]

const handleLoginCallback = async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  
  if (code && !auth.isLoggedIn.value) {
    try {
      const response = await fetch('https://musicist-oauth.vercel.app/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirect_uri: `${window.location.origin}/admin` })
      })
      
      if (response.ok) {
        const data = await response.json()
        const user = await github.fetchUser()
        auth.login(data.access_token, user)
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    } catch (e) {
      console.error('Login failed:', e)
    }
  }
}

const handleLogout = () => {
  auth.logout()
  router.push('/')
}

const openAddSource = () => {
  newSource.value = { name: '', url: '', songs: [] }
  showAddSourceModal.value = true
}

const openAddSong = (source) => {
  selectedSource.value = source
  newSong.value = { title: '', artist: '', url: '', cover: '' }
  showAddSongModal.value = true
}

const saveSource = async () => {
  if (!newSource.value.name.trim()) return
  
  loading.value = true
  try {
    await music.addSource(newSource.value)
    showAddSourceModal.value = false
    error.value = ''
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const addSong = async () => {
  if (!newSong.value.title.trim() || !newSong.value.url.trim()) return
  
  loading.value = true
  try {
    const updatedSources = music.sources.value.map(s => {
      if (s.id === selectedSource.value.id) {
        return { ...s, songs: [...s.songs, { ...newSong.value, id: Date.now() }] }
      }
      return s
    })
    await music.saveSources(updatedSources)
    showAddSongModal.value = false
    error.value = ''
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const deleteSource = async (id) => {
  if (!confirm('确定要删除这个音乐源吗？')) return
  
  loading.value = true
  try {
    await music.removeSource(id)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const deleteSong = async (sourceId, songId) => {
  if (!confirm('确定要删除这首歌吗？')) return
  
  loading.value = true
  try {
    const updatedSources = music.sources.value.map(s => {
      if (s.id === sourceId) {
        return { ...s, songs: s.songs.filter(song => song.id !== songId) }
      }
      return s
    })
    await music.saveSources(updatedSources)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const saveConfig = async () => {
  if (!configForm.value.owner || !configForm.value.repo) return
  
  github.setConfig(configForm.value.owner, configForm.value.repo)
  showConfigModal.value = false
}

const refreshData = async () => {
  loading.value = true
  try {
    await music.loadSources()
    await music.loadPlaylists()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const reviewDanmaku = async () => {
  if (!music.currentSong.value) {
    alert('请先播放一首歌来审查其弹幕')
    return
  }
  
  isReviewing.value = true
  reviewResults.value = []
  
  try {
    const songId = music.currentSong.value.id || music.currentSong.value.title
    currentSongId.value = songId
    
    await danmaku.loadDanmaku(songId)
    const results = await danmaku.reviewAllDanmaku(songId)
    reviewResults.value = results
  } catch (e) {
    error.value = e.message
  } finally {
    isReviewing.value = false
  }
}

const getClassificationLabel = (classification) => {
  const labels = {
    normal: '正常',
    spam: '垃圾信息',
    toxic: '有害内容',
  }
  return labels[classification] || classification
}

const getClassificationColor = (classification) => {
  const colors = {
    normal: 'bg-green-600/20 text-green-400',
    spam: 'bg-yellow-600/20 text-yellow-400',
    toxic: 'bg-red-600/20 text-red-400',
  }
  return colors[classification] || 'bg-gray-600/20 text-gray-400'
}

watch(() => auth.isLoggedIn.value, (loggedIn) => {
  if (!loggedIn && activeSection.value !== 'config') {
    handleLoginCallback()
  }
})

onMounted(async () => {
  github.loadConfig()
  configForm.value = { ...github.config.value }
  
  if (auth.isLoggedIn.value) {
    await music.loadSources()
    await music.loadPlaylists()
  } else {
    handleLoginCallback()
  }
})
</script>

<template>
  <div class="min-h-screen bg-dark-900">
    <header class="fixed top-0 left-0 right-0 z-50 bg-dark-800 border-b border-dark-600">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-3" @click="router.push('/')">
            <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <Settings class="w-6 h-6 text-white" />
            </div>
            <span class="text-xl font-bold text-white">管理面板</span>
          </div>
          
          <div class="flex items-center space-x-4">
            <button
              @click="showConfigModal = true"
              class="flex items-center space-x-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors"
            >
              <Github class="w-4 h-4" />
              <span>仓库配置</span>
            </button>
            
            <button
              v-if="auth.isLoggedIn.value"
              @click="handleLogout"
              class="flex items-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
            >
              <LogOut class="w-4 h-4" />
              <span>退出</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="pt-16 flex">
      <aside class="fixed left-0 top-16 bottom-0 w-64 bg-dark-800 border-r border-dark-600 overflow-y-auto">
        <nav class="p-4 space-y-2">
          <button
            v-for="section in sections"
            :key="section.id"
            @click="activeSection = section.id"
            :class="[
              'w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
              activeSection === section.id ? 'bg-primary-600/20 text-primary-400' : 'text-gray-400 hover:text-white hover:bg-dark-700'
            ]"
          >
            <component :is="section.icon" class="w-5 h-5" />
            <span>{{ section.label }}</span>
          </button>
        </nav>
      </aside>

      <main class="ml-64 flex-1 p-6">
        <div v-if="!auth.isLoggedIn.value" class="max-w-md mx-auto">
          <div class="text-center py-20">
            <div class="w-20 h-20 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Github class="w-10 h-10 text-gray-400" />
            </div>
            <h2 class="text-2xl font-bold text-white mb-2">需要登录</h2>
            <p class="text-gray-400 mb-6">请使用 GitHub 账号登录以管理音乐源和配置</p>
            <button
              @click="router.push('/')"
              class="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors mx-auto"
            >
              <Github class="w-5 h-5" />
              <span>返回首页登录</span>
            </button>
          </div>
        </div>

        <div v-else>
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-white">
              {{ sections.find(s => s.id === activeSection)?.label }}
            </h2>
            <div class="flex items-center space-x-3">
              <button
                @click="refreshData"
                class="flex items-center space-x-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors"
              >
                <RefreshCw :class="['w-4 h-4', loading ? 'animate-spin' : '']" />
                <span>刷新</span>
              </button>
              <button
                v-if="activeSection === 'sources'"
                @click="openAddSource"
                class="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <Plus class="w-4 h-4" />
                <span>添加音乐源</span>
              </button>
            </div>
          </div>

          <div v-if="error" class="mb-6 p-4 bg-red-600/20 border border-red-600/50 rounded-lg text-red-400">
            {{ error }}
          </div>

          <div v-if="activeSection === 'sources'" class="space-y-6">
            <div
              v-for="source in music.sources.value"
              :key="source.id"
              class="bg-dark-800 rounded-xl border border-dark-600 overflow-hidden"
            >
              <div class="p-4 border-b border-dark-600 flex items-center justify-between">
                <div>
                  <h3 class="text-white font-medium">{{ source.name }}</h3>
                  <p class="text-gray-400 text-sm">{{ source.songs.length }} 首歌曲</p>
                </div>
                <div class="flex items-center space-x-2">
                  <button
                    @click="openAddSong(source)"
                    class="p-2 text-primary-400 hover:bg-primary-600/20 rounded-lg transition-colors"
                    title="添加歌曲"
                  >
                    <Plus class="w-5 h-5" />
                  </button>
                  <button
                    @click="deleteSource(source.id)"
                    class="p-2 text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
                    title="删除音乐源"
                  >
                    <Trash2 class="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div class="p-4 space-y-2">
                <div
                  v-for="song in source.songs"
                  :key="song.id"
                  class="flex items-center space-x-4 p-3 bg-dark-700/50 rounded-lg"
                >
                  <img
                    v-if="song.cover"
                    :src="song.cover"
                    :alt="song.title"
                    class="w-10 h-10 rounded-lg object-cover"
                  />
                  <div v-else class="w-10 h-10 bg-dark-600 rounded-lg flex items-center justify-center">
                    <Music class="w-5 h-5 text-gray-400" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-white truncate">{{ song.title }}</h4>
                    <p class="text-gray-400 text-sm">{{ song.artist }}</p>
                  </div>
                  <button
                    @click="deleteSong(source.id, song.id)"
                    class="p-2 text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
                
                <div v-if="source.songs.length === 0" class="text-center py-8 text-gray-400">
                  暂无歌曲，请添加
                </div>
              </div>
            </div>
            
            <div v-if="music.sources.value.length === 0" class="text-center py-16 bg-dark-800 rounded-xl border border-dark-600">
              <Music class="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p class="text-gray-400">暂无音乐源</p>
            </div>
          </div>

          <div v-if="activeSection === 'playlists'" class="space-y-6">
            <div
              v-for="playlist in music.playlists.value"
              :key="playlist.id"
              class="bg-dark-800 rounded-xl border border-dark-600 p-6"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-white font-medium">{{ playlist.name }}</h3>
                <button
                  @click="music.removePlaylist(playlist.id)"
                  class="p-2 text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
                >
                  <Trash2 class="w-5 h-5" />
                </button>
              </div>
              <p class="text-gray-400 text-sm mb-4">{{ playlist.description || '无描述' }}</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="song in playlist.songs"
                  :key="song.id"
                  class="px-3 py-1 bg-dark-700 text-white text-sm rounded-full"
                >
                  {{ song.title }}
                </span>
                <span v-if="playlist.songs.length === 0" class="text-gray-400 text-sm">暂无歌曲</span>
              </div>
            </div>
            
            <div v-if="music.playlists.value.length === 0" class="text-center py-16 bg-dark-800 rounded-xl border border-dark-600">
              <Database class="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p class="text-gray-400">暂无播放列表</p>
            </div>
          </div>

          <div v-if="activeSection === 'danmaku'" class="space-y-6">
            <div class="bg-dark-800 rounded-xl border border-dark-600 p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-white font-medium">弹幕设置</h3>
                <button
                  @click="reviewDanmaku"
                  :disabled="isReviewing"
                  class="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Scan :class="['w-4 h-4', isReviewing ? 'animate-spin' : '']" />
                  <span>{{ isReviewing ? '审查中...' : 'AI 审查弹幕' }}</span>
                </button>
              </div>
              
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-gray-400">启用弹幕</span>
                  <button
                    @click="danmaku.toggleEnabled()"
                    :class="[
                      'w-12 h-6 rounded-full transition-colors relative',
                      danmaku.isEnabled.value ? 'bg-primary-600' : 'bg-dark-600'
                    ]"
                  >
                    <div
                      :class="[
                        'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                        danmaku.isEnabled.value ? 'translate-x-7' : 'translate-x-1'
                      ]"
                    />
                  </button>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-400">暂停弹幕</span>
                  <button
                    @click="danmaku.togglePaused()"
                    :class="[
                      'w-12 h-6 rounded-full transition-colors relative',
                      danmaku.isPaused.value ? 'bg-primary-600' : 'bg-dark-600'
                    ]"
                  >
                    <div
                      :class="[
                        'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                        danmaku.isPaused.value ? 'translate-x-7' : 'translate-x-1'
                      ]"
                    />
                  </button>
                </div>
              </div>
            </div>

            <div v-if="reviewResults.length > 0" class="bg-dark-800 rounded-xl border border-dark-600 p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-white font-medium flex items-center space-x-2">
                  <AlertTriangle class="w-5 h-5 text-yellow-400" />
                  <span>AI 审查结果</span>
                </h3>
                <span class="text-sm text-gray-400">歌曲: {{ music.currentSong.value?.title }}</span>
              </div>
              
              <div class="space-y-3">
                <div
                  v-for="item in reviewResults"
                  :key="item.id"
                  class="p-4 bg-dark-700/50 rounded-lg border-l-4"
                  :class="{
                    'border-yellow-500': item.classification === 'spam',
                    'border-red-500': item.classification === 'toxic',
                    'border-green-500': item.classification === 'normal',
                  }"
                >
                  <div class="flex items-start justify-between mb-2">
                    <span
                      class="px-2 py-1 rounded text-xs font-medium"
                      :class="getClassificationColor(item.classification)"
                    >
                      {{ getClassificationLabel(item.classification) }}
                      <span class="ml-1">({{ Math.round(item.confidence * 100) }}%)</span>
                    </span>
                    <button
                      @click="danmaku.removeDanmaku(currentSongId, item.id)"
                      class="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                  <p class="text-white mb-1">{{ item.content }}</p>
                  <p class="text-gray-500 text-xs">
                    理由: {{ item.reviewReason }}
                  </p>
                </div>
              </div>
            </div>
            
            <div class="bg-dark-800 rounded-xl border border-dark-600 p-6">
              <h3 class="text-white font-medium mb-4">弹幕统计</h3>
              <div class="grid grid-cols-3 gap-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-white">{{ danmaku.danmakuList.value.length }}</div>
                  <div class="text-gray-400 text-sm">总弹幕数</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-yellow-400">{{ danmaku.flaggedDanmaku.value.length }}</div>
                  <div class="text-gray-400 text-sm">待审查</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-400">
                    {{ danmaku.danmakuList.value.length - danmaku.flaggedDanmaku.value.length }}
                  </div>
                  <div class="text-gray-400 text-sm">正常</div>
                </div>
              </div>
            </div>

            <div class="bg-dark-800 rounded-xl border border-dark-600 p-6">
              <h3 class="text-white font-medium mb-4 flex items-center space-x-2">
                <Shield class="w-5 h-5 text-primary-400" />
                <span>AI 审查说明</span>
              </h3>
              <ul class="space-y-2 text-gray-400">
                <li>• 弹幕发送时会自动进行AI内容审查</li>
                <li>• 审查结果分为：正常、垃圾信息、有害内容</li>
                <li>• 可点击"AI审查弹幕"对当前歌曲的所有弹幕进行批量审查</li>
                <li>• 审查结果会显示置信度和理由</li>
                <li>• 管理员可删除标记为不良的弹幕</li>
              </ul>
            </div>
          </div>

          <div v-if="activeSection === 'users'" class="space-y-6">
            <div class="bg-dark-800 rounded-xl border border-dark-600 p-6">
              <h3 class="text-white font-medium mb-4">当前登录用户</h3>
              <div v-if="auth.user" class="flex items-center space-x-4">
                <img
                  :src="auth.user.avatar_url"
                  :alt="auth.user.login"
                  class="w-16 h-16 rounded-full"
                />
                <div>
                  <h4 class="text-white font-medium">{{ auth.user.login }}</h4>
                  <p class="text-gray-400 text-sm">{{ auth.user.email || '未设置邮箱' }}</p>
                </div>
              </div>
              <div v-else class="text-gray-400">未登录</div>
            </div>
            
            <div class="bg-dark-800 rounded-xl border border-dark-600 p-6">
              <h3 class="text-white font-medium mb-4">权限说明</h3>
              <ul class="space-y-2 text-gray-400">
                <li>• 管理员：可添加/删除音乐源和歌曲</li>
                <li>• 普通用户：可发送弹幕、收藏歌曲</li>
                <li>• 所有操作通过 GitHub API 同步到仓库</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>

    <div
      v-if="showAddSourceModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showAddSourceModal = false"
    >
      <div class="bg-dark-800 rounded-xl border border-dark-600 w-full max-w-md p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-white font-medium text-lg">添加音乐源</h3>
          <button @click="showAddSourceModal = false" class="text-gray-400 hover:text-white">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-gray-400 text-sm mb-2">名称</label>
            <input
              v-model="newSource.name"
              type="text"
              placeholder="音乐源名称"
              class="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label class="block text-gray-400 text-sm mb-2">URL（可选）</label>
            <input
              v-model="newSource.url"
              type="text"
              placeholder="音乐源地址"
              class="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>
        <div class="flex space-x-3 mt-6">
          <button
            @click="showAddSourceModal = false"
            class="flex-1 px-4 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            @click="saveSource"
            :disabled="loading"
            class="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {{ loading ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showAddSongModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showAddSongModal = false"
    >
      <div class="bg-dark-800 rounded-xl border border-dark-600 w-full max-w-md p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-white font-medium text-lg">添加歌曲到 {{ selectedSource?.name }}</h3>
          <button @click="showAddSongModal = false" class="text-gray-400 hover:text-white">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-gray-400 text-sm mb-2">标题</label>
            <input
              v-model="newSong.title"
              type="text"
              placeholder="歌曲标题"
              class="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label class="block text-gray-400 text-sm mb-2">艺术家</label>
            <input
              v-model="newSong.artist"
              type="text"
              placeholder="艺术家名称"
              class="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label class="block text-gray-400 text-sm mb-2">音频 URL</label>
            <input
              v-model="newSong.url"
              type="text"
              placeholder="https://example.com/song.mp3"
              class="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label class="block text-gray-400 text-sm mb-2">封面 URL（可选）</label>
            <input
              v-model="newSong.cover"
              type="text"
              placeholder="https://example.com/cover.jpg"
              class="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>
        <div class="flex space-x-3 mt-6">
          <button
            @click="showAddSongModal = false"
            class="flex-1 px-4 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            @click="addSong"
            :disabled="loading"
            class="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {{ loading ? '添加中...' : '添加' }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showConfigModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showConfigModal = false"
    >
      <div class="bg-dark-800 rounded-xl border border-dark-600 w-full max-w-md p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-white font-medium text-lg">GitHub 仓库配置</h3>
          <button @click="showConfigModal = false" class="text-gray-400 hover:text-white">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-gray-400 text-sm mb-2">仓库所有者</label>
            <input
              v-model="configForm.owner"
              type="text"
              placeholder="GitHub 用户名"
              class="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label class="block text-gray-400 text-sm mb-2">仓库名称</label>
            <input
              v-model="configForm.repo"
              type="text"
              placeholder="仓库名称"
              class="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>
        <div class="flex space-x-3 mt-6">
          <button
            @click="showConfigModal = false"
            class="flex-1 px-4 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            @click="saveConfig"
            class="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
