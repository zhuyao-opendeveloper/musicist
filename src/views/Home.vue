<script setup>
import { ref, inject, onMounted, computed } from 'vue'
import { Search, Disc3, Clock, TrendingUp, Sparkles, RefreshCw, Heart, Globe, Music } from 'lucide-vue-next'
import NavHeader from '../components/NavHeader.vue'
import MusicPlayer from '../components/MusicPlayer.vue'
import SongCard from '../components/SongCard.vue'
import NewsWidget from '../components/NewsWidget.vue'
import AIRecommendWidget from '../components/AIRecommendWidget.vue'
import StatsWidget from '../components/StatsWidget.vue'

const music = inject('music')
const auth = inject('auth')
const bing = inject('bing')
const musicSources = inject('musicSources')

const searchQuery = ref('')
const activeTab = ref('all')
const isSearching = ref(false)
const trendingSongs = ref([])
const isInitialLoading = ref(true)

const tabs = [
  { id: 'all', label: '全部音乐', icon: Music },
  { id: 'trending', label: '热门推荐', icon: TrendingUp },
  { id: 'recent', label: '最近播放', icon: Clock },
  { id: 'liked', label: '我的收藏', icon: Heart },
  { id: 'online', label: '在线搜索', icon: Globe },
]

const allSongs = computed(() => {
  const builtin = musicSources.searchResults.value.length > 0
    ? musicSources.searchResults.value
    : musicSources.trendingSongs.value
  return [...builtin, ...music.getAllSongs.value]
})

const filteredSongs = computed(() => {
  let songs = allSongs.value

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

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return
  isSearching.value = true
  activeTab.value = 'online'
  try {
    await musicSources.searchAcrossSources(searchQuery.value)
  } catch { /* fallback */ }
  isSearching.value = false
}

const handleSearchKeydown = (e) => {
  if (e.key === 'Enter') handleSearch()
}

const loadTrending = async () => {
  try {
    const songs = await musicSources.getTrending()
    trendingSongs.value = songs
  } catch { /* fallback */ }
}

onMounted(() => {
  // App.vue 已经提前加载数据了，这里只需要等待结果
  // 用 watch 或者检测 trendingSongs 到了就取消 loading
  const checkLoaded = () => {
    if (musicSources.trendingSongs.value.length > 0) {
      trendingSongs.value = musicSources.trendingSongs.value
      musicSources.searchResults.value = [...musicSources.trendingSongs.value]
      isInitialLoading.value = false
    } else if (musicSources.searchResults.value.length > 0) {
      isInitialLoading.value = false
    } else {
      // 数据还没到，等 200ms 再检查一次
      setTimeout(checkLoaded, 200)
    }
  }
  checkLoaded()

  // 兜底：最多等 8 秒后关闭 loading
  setTimeout(() => { isInitialLoading.value = false }, 8000)
})
</script>

<template>
  <div class="min-h-screen">
    <NavHeader />

    <!-- Hero -->
    <section class="relative pt-16 pb-20 overflow-hidden">
      <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        :style="bing.bingImageUrl ? { backgroundImage: 'url(' + bing.bingImageUrl + ')' } : {}"
      >
        <div class="absolute inset-0 bg-gradient-to-b from-dark-900/80 via-dark-900/70 to-dark-900"></div>
      </div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div class="text-center sm:text-left">
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold gradient-text">发现音乐</h1>
          <p class="text-gray-400 text-lg max-w-2xl mt-3">探索来自多个音源的音乐 · 每日必应壁纸</p>
        </div>

        <!-- Search -->
        <div class="mt-8 max-w-2xl">
          <div class="relative group">
            <div class="absolute -inset-0.5 bg-gradient-primary rounded-2xl opacity-50 group-hover:opacity-75 blur transition-opacity"></div>
            <div class="relative flex items-center bg-dark-800/90 backdrop-blur-xl rounded-2xl border border-white/10">
              <Search class="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="searchQuery"
                @keydown="handleSearchKeydown"
                type="text"
                placeholder="搜索歌曲、艺术家，按 Enter 在线搜索..."
                class="w-full bg-transparent pl-14 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none"
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
        </div>
      </div>
    </section>

    <!-- Main -->
    <main class="relative -mt-10 pb-32">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Tabs -->
        <div class="flex space-x-2 mb-8 overflow-x-auto pb-2">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id; if(tab.id === 'trending') loadTrending()"
            :class="[
              'flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap text-sm font-medium',
              activeTab === tab.id
                ? 'bg-gradient-primary text-white shadow-lg shadow-primary-500/25'
                : 'glass text-gray-400 hover:text-white hover:bg-white/10'
            ]"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <!-- Main Content: Grid + Widgets Sidebar -->
        <div class="flex flex-col lg:flex-row gap-6">
          <!-- Left: Songs Grid -->
          <div class="flex-1 min-w-0">
            <div v-if="filteredSongs.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              <SongCard v-for="song in filteredSongs" :key="song.id || song.title" :song="song" />
            </div>

            <!-- Initial loading -->
            <div v-else-if="isInitialLoading" class="text-center py-20 glass-card max-w-md mx-auto">
              <div class="w-16 h-16 rounded-full bg-gradient-primary/20 flex items-center justify-center mx-auto mb-4">
                <RefreshCw class="w-8 h-8 text-primary-400 animate-spin" />
              </div>
              <h3 class="text-white text-lg font-medium mb-2">正在加载音乐...</h3>
              <p class="text-gray-400 text-sm">正在获取推荐曲目，请稍候</p>
            </div>

            <!-- Empty (only after loading finished) -->
            <div v-else class="text-center py-20 glass-card max-w-md mx-auto">
              <div class="w-16 h-16 rounded-full bg-gradient-primary/20 flex items-center justify-center mx-auto mb-4">
                <Disc3 class="w-8 h-8 text-primary-400" />
              </div>
              <h3 class="text-white text-lg font-medium mb-2">暂无歌曲</h3>
              <p class="text-gray-400 text-sm">搜索或浏览音乐</p>
            </div>
          </div>

          <!-- Right: Widgets Sidebar -->
          <div class="w-full lg:w-80 xl:w-96 flex-shrink-0 space-y-4">
            <div class="h-[220px]"><StatsWidget /></div>
            <div class="h-[340px]"><AIRecommendWidget /></div>
            <div class="h-[380px]"><NewsWidget /></div>
          </div>
        </div>
      </div>
    </main>

    <MusicPlayer />
  </div>
</template>
