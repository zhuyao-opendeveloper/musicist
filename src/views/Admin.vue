<script setup>
import { ref, inject, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Home, Settings, Music, Users, Database, Plus, Trash2, 
  Save, Key, LogOut, RefreshCw, X, Lock,
  AlertTriangle, Shield, Scan
} from 'lucide-vue-next'

const auth = inject('auth')
const music = inject('music')
const danmaku = inject('danmaku')
const ai = inject('ai')
const router = useRouter()

const activeSection = ref('sources')
const showAddSourceModal = ref(false)
const showAddSongModal = ref(false)
const loading = ref(false)
const error = ref('')

const newSource = ref({ name: '', url: '', songs: [] })
const newSong = ref({ title: '', artist: '', url: '', cover: '' })

const selectedSource = ref(null)
const isReviewing = ref(false)
const reviewResults = ref([])
const currentSongId = ref('')

const passwordForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })
const showPasswordModal = ref(false)

// API 密钥配置
const apiKeysForm = ref({ githubToken: '', openaiKey: '', deepseekKey: '', newsApiKey: '' })
const showApiModal = ref(false)

const sections = [
  { id: 'sources', label: '音乐源', icon: Music },
  { id: 'playlists', label: '播放列表', icon: Database },
  { id: 'danmaku', label: '弹幕管理', icon: Settings },
  { id: 'api', label: 'API 配置', icon: Key },
  { id: 'users', label: '用户管理', icon: Users },
]

const loadApiKeys = () => {
  apiKeysForm.value = { ...auth.apiKeys.value }
}

const saveApiKeys = () => {
  auth.saveApiKeys(apiKeysForm.value)
  showApiModal.value = false
}

const openApiModal = () => {
  loadApiKeys()
  showApiModal.value = true
}

const changePassword = () => {
  const form = passwordForm.value
  if (!form.currentPassword) { error.value = '请输入当前密码'; return }
  if (btoa(form.currentPassword) !== auth.adminPassword.value) { error.value = '当前密码错误'; return }
  if (!form.newPassword || form.newPassword.length < 6) { error.value = '新密码至少6位'; return }
  if (form.newPassword !== form.confirmPassword) { error.value = '两次密码不一致'; return }

  const hashed = btoa(form.newPassword)
  localStorage.setItem('musicist_admin_password', hashed)
  auth.adminPassword.value = hashed
  showPasswordModal.value = false
  passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
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
  const labels = { normal: '正常', spam: '垃圾信息', toxic: '有害内容' }
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

onMounted(async () => {
  if (auth.isAuthenticated.value) {
    await music.loadSources()
    await music.loadPlaylists()
  }
})
</script>

<template>
  <div class="min-h-screen bg-dark-900">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-dark-800 border-b border-dark-600">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-3 cursor-pointer" @click="router.push('/')">
            <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <Settings class="w-6 h-6 text-white" />
            </div>
            <span class="text-xl font-bold text-white">管理面板</span>
          </div>

          <div class="flex items-center space-x-3">
            <button @click="openApiModal" class="flex items-center space-x-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors text-sm">
              <Key class="w-4 h-4" /><span class="hidden sm:inline">API 配置</span>
            </button>
            <button @click="showPasswordModal = true" class="flex items-center space-x-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors text-sm">
              <Lock class="w-4 h-4" /><span class="hidden sm:inline">修改密码</span>
            </button>
            <button v-if="auth.isAuthenticated.value" @click="handleLogout" class="flex items-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-sm">
              <LogOut class="w-4 h-4" /><span>退出</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="pt-16 flex">
      <!-- Sidebar -->
      <aside class="fixed left-0 top-16 bottom-0 w-64 bg-dark-800 border-r border-dark-600 overflow-y-auto z-30">
        <nav class="p-4 space-y-2">
          <button v-for="section in sections" :key="section.id" @click="activeSection = section.id"
            :class="['w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors', activeSection === section.id ? 'bg-primary-600/20 text-primary-400' : 'text-gray-400 hover:text-white hover:bg-dark-700']">
            <component :is="section.icon" class="w-5 h-5" /><span>{{ section.label }}</span>
          </button>
          <div class="pt-4 mt-4 border-t border-dark-600">
            <button @click="router.push('/')" class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 transition-colors">
              <Home class="w-5 h-5" /><span>返回首页</span>
            </button>
          </div>
        </nav>
      </aside>

      <!-- Main -->
      <main class="ml-64 flex-1 p-6 pb-24">
        <!-- Not logged in -->
        <div v-if="!auth.isAuthenticated.value" class="max-w-md mx-auto mt-20">
          <div class="text-center py-20">
            <div class="w-20 h-20 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock class="w-10 h-10 text-gray-400" />
            </div>
            <h2 class="text-2xl font-bold text-white mb-2">需要管理员登录</h2>
            <p class="text-gray-400 mb-6">请先在首页点击「管理」按钮登录</p>
            <button @click="router.push('/')" class="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">返回首页登录</button>
          </div>
        </div>

        <!-- Logged in -->
        <div v-else>
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-white">{{ sections.find(s => s.id === activeSection)?.label }}</h2>
            <div class="flex items-center space-x-3">
              <button @click="refreshData" class="flex items-center space-x-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors">
                <RefreshCw :class="['w-4 h-4', loading ? 'animate-spin' : '']" /><span>刷新</span>
              </button>
              <button v-if="activeSection === 'sources'" @click="openAddSource" class="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
                <Plus class="w-4 h-4" /><span>添加音乐源</span>
              </button>
            </div>
          </div>

          <div v-if="error" class="mb-6 p-4 bg-red-600/20 border border-red-600/50 rounded-lg text-red-400">{{ error }}</div>

          <!-- Sources -->
          <div v-if="activeSection === 'sources'" class="space-y-6">
            <div class="bg-dark-800 rounded-xl border border-primary-600/30 p-4">
              <div class="flex items-center space-x-3">
                <Music class="w-6 h-6 text-primary-400" />
                <div>
                  <h3 class="text-white font-medium">内置音源可用</h3>
                  <p class="text-gray-400 text-sm">系统内置了 15+ 首免费 SoundHelix 曲目 + 古典钢琴曲，无需配置即可在首页播放。</p>
                </div>
              </div>
            </div>

            <div v-for="source in music.sources.value" :key="source.id" class="bg-dark-800 rounded-xl border border-dark-600 overflow-hidden">
              <div class="p-4 border-b border-dark-600 flex items-center justify-between">
                <div><h3 class="text-white font-medium">{{ source.name }}</h3><p class="text-gray-400 text-sm">{{ source.songs.length }} 首歌</p></div>
                <div class="flex items-center space-x-2">
                  <button @click="openAddSong(source)" class="p-2 text-primary-400 hover:bg-primary-600/20 rounded-lg transition-colors"><Plus class="w-5 h-5" /></button>
                  <button @click="deleteSource(source.id)" class="p-2 text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"><Trash2 class="w-5 h-5" /></button>
                </div>
              </div>
              <div class="p-4 space-y-2">
                <div v-for="song in source.songs" :key="song.id" class="flex items-center space-x-4 p-3 bg-dark-700/50 rounded-lg">
                  <img v-if="song.cover" :src="song.cover" :alt="song.title" class="w-10 h-10 rounded-lg object-cover" />
                  <div v-else class="w-10 h-10 bg-dark-600 rounded-lg flex items-center justify-center"><Music class="w-5 h-5 text-gray-400" /></div>
                  <div class="flex-1 min-w-0"><h4 class="text-white truncate">{{ song.title }}</h4><p class="text-gray-400 text-sm">{{ song.artist }}</p></div>
                  <button @click="deleteSong(source.id, song.id)" class="p-2 text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"><Trash2 class="w-4 h-4" /></button>
                </div>
                <div v-if="source.songs.length === 0" class="text-center py-8 text-gray-400">暂无歌曲，请添加</div>
              </div>
            </div>

            <div v-if="music.sources.value.length === 0" class="text-center py-16 bg-dark-800 rounded-xl border border-dark-600">
              <Music class="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p class="text-gray-400">暂无自定义音乐源</p>
              <p class="text-gray-500 text-sm mt-1">点击「添加音乐源」开始配置</p>
            </div>
          </div>

          <!-- Playlists -->
          <div v-if="activeSection === 'playlists'" class="space-y-6">
            <div v-for="playlist in music.playlists.value" :key="playlist.id" class="bg-dark-800 rounded-xl border border-dark-600 p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-white font-medium">{{ playlist.name }}</h3>
                <button @click="music.removePlaylist(playlist.id)" class="p-2 text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"><Trash2 class="w-5 h-5" /></button>
              </div>
              <p class="text-gray-400 text-sm mb-4">{{ playlist.description || '无描述' }}</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="song in playlist.songs" :key="song.id" class="px-3 py-1 bg-dark-700 text-white text-sm rounded-full">{{ song.title }}</span>
                <span v-if="playlist.songs.length === 0" class="text-gray-400 text-sm">暂无歌曲</span>
              </div>
            </div>
            <div v-if="music.playlists.value.length === 0" class="text-center py-16 bg-dark-800 rounded-xl border border-dark-600">
              <Database class="w-12 h-12 text-gray-600 mx-auto mb-4" /><p class="text-gray-400">暂无播放列表</p>
            </div>
          </div>

          <!-- Danmaku -->
          <div v-if="activeSection === 'danmaku'" class="space-y-6">
            <div class="bg-dark-800 rounded-xl border border-dark-600 p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-white font-medium">弹幕设置</h3>
                <button @click="reviewDanmaku" :disabled="isReviewing" class="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50">
                  <Scan :class="['w-4 h-4', isReviewing ? 'animate-spin' : '']" /><span>{{ isReviewing ? '审查中...' : 'AI 审查弹幕' }}</span>
                </button>
              </div>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-gray-400">启用弹幕</span>
                  <button @click="danmaku.toggleEnabled()" :class="['w-12 h-6 rounded-full transition-colors relative', danmaku.isEnabled.value ? 'bg-primary-600' : 'bg-dark-600']">
                    <div :class="['absolute top-1 w-4 h-4 bg-white rounded-full transition-transform', danmaku.isEnabled.value ? 'translate-x-7' : 'translate-x-1']" />
                  </button>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-400">暂停弹幕</span>
                  <button @click="danmaku.togglePaused()" :class="['w-12 h-6 rounded-full transition-colors relative', danmaku.isPaused.value ? 'bg-primary-600' : 'bg-dark-600']">
                    <div :class="['absolute top-1 w-4 h-4 bg-white rounded-full transition-transform', danmaku.isPaused.value ? 'translate-x-7' : 'translate-x-1']" />
                  </button>
                </div>
              </div>
            </div>

            <div v-if="reviewResults.length > 0" class="bg-dark-800 rounded-xl border border-dark-600 p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-white font-medium flex items-center space-x-2"><AlertTriangle class="w-5 h-5 text-yellow-400" /><span>AI 审查结果</span></h3>
                <span class="text-sm text-gray-400">{{ music.currentSong.value?.title }}</span>
              </div>
              <div class="space-y-3">
                <div v-for="item in reviewResults" :key="item.id" class="p-4 bg-dark-700/50 rounded-lg border-l-4"
                  :class="{ 'border-yellow-500': item.classification === 'spam', 'border-red-500': item.classification === 'toxic', 'border-green-500': item.classification === 'normal' }">
                  <div class="flex items-start justify-between mb-2">
                    <span class="px-2 py-1 rounded text-xs font-medium" :class="getClassificationColor(item.classification)">
                      {{ getClassificationLabel(item.classification) }} ({{ Math.round(item.confidence * 100) }}%)
                    </span>
                    <button @click="danmaku.removeDanmaku(currentSongId, item.id)" class="p-1 text-gray-400 hover:text-red-400 transition-colors"><Trash2 class="w-4 h-4" /></button>
                  </div>
                  <p class="text-white mb-1">{{ item.content }}</p>
                  <p class="text-gray-500 text-xs">理由: {{ item.reviewReason }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- API Config -->
          <div v-if="activeSection === 'api'" class="space-y-6">
            <div class="bg-dark-800 rounded-xl border border-dark-600 p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-white font-medium flex items-center space-x-2"><Key class="w-5 h-5 text-primary-400" /><span>统一 API 密钥管理</span></h3>
                <button @click="openApiModal" class="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"><Save class="w-4 h-4" /><span>配置密钥</span></button>
              </div>
              <div class="space-y-3">
                <div class="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg" v-for="item in [
                  { label: 'GitHub Token', desc: '读取/保存音乐源数据到仓库', key: 'githubToken' },
                  { label: 'OpenAI API Key', desc: 'AI 弹幕审查、智能推荐', key: 'openaiKey' },
                  { label: 'DeepSeek API Key', desc: '备用 AI 服务', key: 'deepseekKey' },
                  { label: 'News API Key', desc: '获取实时音乐资讯', key: 'newsApiKey' },
                ]" :key="item.key">
                  <div><h4 class="text-white font-medium">{{ item.label }}</h4><p class="text-gray-400 text-sm">{{ item.desc }}</p></div>
                  <span :class="auth.apiKeys.value[item.key] ? 'text-green-400' : 'text-red-400'" class="text-sm font-medium">{{ auth.apiKeys.value[item.key] ? '已配置' : '未配置' }}</span>
                </div>
              </div>
            </div>

            <div class="bg-dark-800 rounded-xl border border-dark-600 p-6">
              <h3 class="text-white font-medium mb-4">AI 功能说明</h3>
              <ul class="space-y-2 text-gray-400">
                <li>🧠 AI 弹幕审查：自动识别垃圾信息、有害内容</li>
                <li>🎵 智能推荐：基于听歌历史和收藏歌曲推荐</li>
                <li>📰 音乐资讯：获取最新的音乐行业动态</li>
                <li>💡 至少配置 GitHub Token 或 OpenAI/DeepSeek Key 即可使用 AI 功能</li>
              </ul>
            </div>
          </div>

          <!-- Users -->
          <div v-if="activeSection === 'users'" class="space-y-6">
            <div class="bg-dark-800 rounded-xl border border-dark-600 p-6">
              <h3 class="text-white font-medium mb-4">管理员信息</h3>
              <div class="flex items-center space-x-3 p-3 bg-dark-700/50 rounded-lg">
                <Shield class="w-8 h-8 text-primary-400" />
                <div><h4 class="text-white font-medium">管理员</h4><p class="text-gray-400 text-sm">拥有完整管理权限</p></div>
              </div>
            </div>
            <div class="bg-dark-800 rounded-xl border border-dark-600 p-6">
              <h3 class="text-white font-medium mb-4">权限说明</h3>
              <ul class="space-y-2 text-gray-400">
                <li>🛡️ 管理员：可添加/删除音乐源和歌曲、配置 API 密钥、管理弹幕</li>
                <li>🎧 普通用户（首页）：可播放音乐、发送弹幕、收藏歌曲</li>
                <li>🔑 API 密钥由管理员统一配置，对所有用户生效</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Add Source Modal -->
    <div v-if="showAddSourceModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showAddSourceModal = false">
      <div class="bg-dark-800 rounded-xl border border-dark-600 w-full max-w-md p-6" @click.stop>
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-white font-medium text-lg">添加音乐源</h3>
          <button @click="showAddSourceModal = false" class="text-gray-400 hover:text-white"><X class="w-5 h-5" /></button>
        </div>
        <div class="space-y-4">
          <div><label class="block text-gray-400 text-sm mb-2">名称</label><input v-model="newSource.name" type="text" placeholder="音乐源名称" class="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500" /></div>
          <div><label class="block text-gray-400 text-sm mb-2">URL（可选）</label><input v-model="newSource.url" type="text" placeholder="音乐源地址" class="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500" /></div>
        </div>
        <div class="flex space-x-3 mt-6">
          <button @click="showAddSourceModal = false" class="flex-1 px-4 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors">取消</button>
          <button @click="saveSource" :disabled="loading" class="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50">{{ loading ? '保存中...' : '保存' }}</button>
        </div>
      </div>
    </div>

    <!-- Add Song Modal -->
    <div v-if="showAddSongModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showAddSongModal = false">
      <div class="bg-dark-800 rounded-xl border border-dark-600 w-full max-w-md p-6" @click.stop>
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-white font-medium text-lg">添加歌曲到 {{ selectedSource?.name }}</h3>
          <button @click="showAddSongModal = false" class="text-gray-400 hover:text-white"><X class="w-5 h-5" /></button>
        </div>
        <div class="space-y-4">
          <div><label class="block text-gray-400 text-sm mb-2">标题</label><input v-model="newSong.title" type="text" placeholder="歌曲标题" class="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500" /></div>
          <div><label class="block text-gray-400 text-sm mb-2">艺术家</label><input v-model="newSong.artist" type="text" placeholder="艺术家名称" class="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500" /></div>
          <div><label class="block text-gray-400 text-sm mb-2">音频 URL</label><input v-model="newSong.url" type="text" placeholder="https://example.com/song.mp3" class="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500" /></div>
          <div><label class="block text-gray-400 text-sm mb-2">封面 URL（可选）</label><input v-model="newSong.cover" type="text" placeholder="https://example.com/cover.jpg" class="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500" /></div>
        </div>
        <div class="flex space-x-3 mt-6">
          <button @click="showAddSongModal = false" class="flex-1 px-4 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors">取消</button>
          <button @click="addSong" :disabled="loading" class="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50">{{ loading ? '添加中...' : '添加' }}</button>
        </div>
      </div>
    </div>

    <!-- API Config Modal -->
    <div v-if="showApiModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showApiModal = false">
      <div class="bg-dark-800 rounded-xl border border-dark-600 w-full max-w-lg p-6" @click.stop>
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-white font-medium text-lg">API 密钥配置</h3>
          <button @click="showApiModal = false" class="text-gray-400 hover:text-white"><X class="w-5 h-5" /></button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-gray-400 text-sm mb-2">GitHub Token</label>
            <input v-model="apiKeysForm.githubToken" type="password" placeholder="ghp_..." class="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500" />
            <p class="text-gray-500 text-xs mt-1">用于从 GitHub 仓库读取/保存音乐源数据</p>
          </div>
          <div>
            <label class="block text-gray-400 text-sm mb-2">OpenAI API Key</label>
            <input v-model="apiKeysForm.openaiKey" type="password" placeholder="sk-..." class="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500" />
            <p class="text-gray-500 text-xs mt-1">用于 AI 弹幕审查、智能推荐</p>
          </div>
          <div>
            <label class="block text-gray-400 text-sm mb-2">DeepSeek API Key（可选）</label>
            <input v-model="apiKeysForm.deepseekKey" type="password" placeholder="sk-..." class="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label class="block text-gray-400 text-sm mb-2">News API Key（可选）</label>
            <input v-model="apiKeysForm.newsApiKey" type="password" placeholder="API key..." class="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500" />
          </div>
        </div>
        <div class="flex space-x-3 mt-6">
          <button @click="showApiModal = false" class="flex-1 px-4 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors">取消</button>
          <button @click="saveApiKeys" class="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">保存配置</button>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showPasswordModal = false">
      <div class="bg-dark-800 rounded-xl border border-dark-600 w-full max-w-md p-6" @click.stop>
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-white font-medium text-lg">修改密码</h3>
          <button @click="showPasswordModal = false" class="text-gray-400 hover:text-white"><X class="w-5 h-5" /></button>
        </div>
        <div class="space-y-4">
          <div><label class="block text-gray-400 text-sm mb-2">当前密码</label><input v-model="passwordForm.currentPassword" type="password" placeholder="当前密码" class="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500" /></div>
          <div><label class="block text-gray-400 text-sm mb-2">新密码（至少6位）</label><input v-model="passwordForm.newPassword" type="password" placeholder="新密码" class="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500" /></div>
          <div><label class="block text-gray-400 text-sm mb-2">确认新密码</label><input v-model="passwordForm.confirmPassword" type="password" placeholder="再次输入新密码" class="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500" /></div>
          <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>
        </div>
        <div class="flex space-x-3 mt-6">
          <button @click="showPasswordModal = false" class="flex-1 px-4 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors">取消</button>
          <button @click="changePassword" class="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">确认修改</button>
        </div>
      </div>
    </div>
  </div>
</template>
