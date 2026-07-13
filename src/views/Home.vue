<script setup>
import { ref, inject, onMounted, computed } from 'vue'
import {
  Search, Grid, List, Radio, Disc3, Clock, TrendingUp, Sparkles,
  RefreshCw, Heart, Globe, Music
} from 'lucide-vue-next'
import NavHeader from '../components/NavHeader.vue'
import MusicPlayer from '../components/MusicPlayer.vue'
import SongCard from '../components/SongCard.vue'

const music = inject('music')
const auth = inject('auth')
const ai = inject('ai')
const bing = inject('bing')
const musicSources = inject('musicSources')

const searchQuery = ref('')
const activeTab = ref('all')
const recommendations = ref([])
const isGenerating = ref(false)
const isSearching = ref(false)
const trendingSongs = ref([])

const tabs = [
  { id: 'all', label: '全部音乐', icon: Music },
  { id: 'trending', label: '热门推荐', icon: TrendingUp },
  { id: 'recent', label: '最近播放', icon: Clock },
  { id: 'liked', label: '我的收藏', icon: Heart },
  { id: 'online', label: '在线搜索', icon: Globe },
]

const filteredSongs = computed(() => {
  let songs = [...BUILT_IN_SONGS.value, ...music.getAllSongs.value]

  if (activeTab.value === 'liked') {
    songs = songs.filter(s => music.isLiked(s))
  }
  if (activeTab.value === 'trending') {
    songs = trendingSongs.value.length > 0 ? trendingSongs.value : songs.slice(0, 8)
  }
  if (activeTab.value === 'recent') {
    const recentTitles = music.listeningHistory.value.slice(0, 20).map(h => h.title)
    songs = songs.filter(s => recentTitles.includes(s.title))
    if (songs.length === 0) songs = songs.slice(0, 8)
  }

  if (searchQuery.value && activeTab.value !== 'online') {
    const q = searchQuery.value.toLowerCase()
    songs = songs.filter(s =>
      s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
    )
  }

  return songs
})

// Built-in songs from musicSources
const BUILT_IN_SONGS = computed(() => musicSources.searchResults.value.length > 0
  ? musicSources.searchResults.value
  : musicSources.trendingSongs.value
)

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return
  isSearching.value = true
  activeTab.value = 'online'
  try {
    await musicSources.searchAcrossSources(searchQuery.value)
  } catch (e) {
    console.error('Search failed:', e)
  }
  isSearching.value = false
}

const handleKeydown = (e) => {
  if (e.key === 'Enter') {
    handleSearch()
  }
}

const loadTrending = async () => {
  try {
    const songs = await musicSources.getTrending()
    trendingSongs.value = songs
  } catch {
    // fallback
  }
}

const generateRecommendations = async () => {
  if (!auth.isLoggedIn.value) return
  isGenerating.value = true
  try {
    const allSongs = [...musicSources.searchResults.value, ...music.getAllSongs.value]
    if (allSongs.length === 0) return
    const result = await ai.recommendSongs(allSongs, music.listeningHistory.value, music.likedSongs.value)
    recommendations.value = result.recommendations || []
  } catch (e) {
    console.error('推荐失败:', e)
    recommendations.value = []
  } finally {
    isGenerating.value = false
  }
}

const playRecommendedSong = (rec) => {
  const allSongs = [...musicSources.searchResults.value, ...music.getAllSongs.value]
  const song = allSongs.find(s => s.title === rec.title && s.artist === rec.artist)
  if (song) {
    music.playSong(song)
  }
}

onMounted(async () => {
  await music.loadSources()
  await music.loadPlaylists()
  music.loadListeningHistory()
  music.loadLikedSongs()
  await loadTrending()
  // Auto-load built-in songs
  musicSources.searchResults.value = [...musicSources.trendingSongs.value]
})
</script>

<template>
  <div class="min-h-screen">
    <NavHeader />

    <!-- Hero Section with Bing Background -->
    <section class="relative pt-16 pb-20 overflow-hidden">
      <!-- Bing Background Overlay -->
      <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        :style="bing.bingImageUrl ? { backgroundImage: `url(${bing.bingImageUrl})` } : {}"
      >
        <div class="absolute inset-0 bg-gradient-to-b from-dark-900/80 via-dark-900/70 to-dark-900"></div>
      </div>

      <!-- Hero Content -->
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div class="text-center sm:text-left">
          <div class="flex items-center justify-center sm:justify-start space-x-3 mb-2">
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold gradient-text">
              发现音乐
            </h1>
            <div class="hidden sm:block px-3 py-1 glass rounded-full text-xs text-gray-300">
              ✨ v2.0
            </div>
          </div>
          <p class="text-gray-400 text-lg max-w-2xl mt-3">
            探索来自多个音源的音乐 · 每日必应壁纸 · 卡片式体验
          </p>
        </div>

        <!-- Search Bar -->
        <div class="mt-8 max-w-2xl">
          <div class="relative group">
            <div class="absolute -inset-0.5 bg-gradient-primary rounded-2xl opacity-50 group-hover:opacity-75 blur transition-opacity duration-300"></div>
            <div class="relative flex items-center bg-dark-800/90 backdrop-blur-xl rounded-2xl border border-white/10">
              <Search class="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="searchQuery"
                @keydown="handleKeydown"
                type="text"
                placeholder="搜索歌曲、艺术家，按 Enter 在线搜索..."
                class="w-full bg-transparent pl-14 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none text-base"
              />
              <button
                v-if="searchQuery"
                @click="handleSearch"
                :disabled="isSearching"
                class="mr-2 px-5 py-2 bg-gradient-primary rounded-xl text-white text-sm font-medium hover:shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-50"
              >
                <span v-if="isSearching" class="flex items-center space-x-1">
                  <RefreshCw class="w-3.5 h-3.5 animate-spin" />
                  <span>搜索中</span>
                </span>
                <span v-else>搜索</span>
              </button>
            </div>
          </div>
          <p class="text-gray-600 text-xs mt-2 ml-1">
            💡 可搜索中文/英文歌曲，自动匹配多个音源
          </p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <main class="relative -mt-10 pb-32">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- AI Recommendations -->
        <div
          v-if="auth.isLoggedIn.value && recommendations.length > 0"
          class="mb-10 glass-card p-6"
        >
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Sparkles class="w-4 h-4 text-white" />
              </div>
              <h2 class="text-lg font-bold text-white">AI 推荐</h2>
            </div>
            <button
              @click="generateRecommendations"
              :disabled="isGenerating"
              class="flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all text-sm disabled:opacity-50"
            >
              <RefreshCw :class="['w-3.5 h-3.5', isGenerating ? 'animate-spin' : '']" />
              <span>{{ isGenerating ? '生成中...' : '重新推荐' }}</span>
            </button>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div
              v-for="(rec, index) in recommendations"
              :key="index"
              @click="playRecommendedSong(rec)"
              class="glass-card !p-3 cursor-pointer group/card text-center"
            >
              <div class="relative w-full aspect-square bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl flex items-center justify-center mb-3 overflow-hidden">
                <span class="text-3xl font-black gradient-text">{{ index + 1 }}</span>
                <div class="absolute inset-0 bg-black/50 opacity-0 group-hover/card:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                  <Play class="w-8 h-8 text-white" />
                </div>
              </div>
              <h4 class="text-white text-sm font-medium truncate">{{ rec.title }}</h4>
              <p class="text-gray-400 text-xs truncate">{{ rec.artist }}</p>
              <p class="text-primary-400 text-[10px] mt-1 line-clamp-1">{{ rec.reason }}</p>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex space-x-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id; if(tab.id === 'trending') loadTrending()"
            :class="[
              'flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-200 whitespace-nowrap text-sm font-medium',
              activeTab === tab.id
                ? 'bg-gradient-primary text-white shadow-lg shadow-primary-500/25'
                : 'glass text-gray-400 hover:text-white hover:bg-white/10'
            ]"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <!-- Song Grid -->
        <div v-if="filteredSongs.length > 0">
          <!-- Grid Layout (Card View) -->
          <div
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            <SongCard
              v-for="song in filteredSongs"
              :key="song.id"
              :song="song"
            />
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-20 glass-card max-w-md mx-auto">
          <div class="w-16 h-16 rounded-full bg-gradient-primary/20 flex items-center justify-center mx-auto mb-4">
            <Disc3 class="w-8 h-8 text-primary-400" />
          </div>
          <h3 class="text-white text-lg font-medium mb-2">
            {{ activeTab === 'online' ? '未找到歌曲' : '暂无歌曲' }}
          </h3>
          <p class="text-gray-400 text-sm mb-4">
            {{ activeTab === 'online' ? '换个关键词试试' : '搜索或添加音乐源' }}
          </p>
          <p v-if="activeTab === 'online'" class="text-gray-600 text-xs">
            💡 试试搜索 "周杰伦" "Taylor Swift" "钢琴曲" 等
          </p>
        </div>
      </div>
    </main>

    <MusicPlayer />
  </div>
</template>
