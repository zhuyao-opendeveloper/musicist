<script setup>
import { inject, ref, computed, onMounted } from 'vue'
import { Sparkles, RefreshCw, Play, Heart, Music, Zap, Brain } from 'lucide-vue-next'

const music = inject('music')
const musicSources = inject('musicSources')
const ai = inject('ai')

const recommendations = ref([])
const isGenerating = ref(false)
const hasError = ref(false)

// Build recommendation list from listening history + liked songs
const generateRecommendations = async () => {
  isGenerating.value = true
  hasError.value = false

  const history = music.listeningHistory?.value || []
  const liked = music.likedSongs?.value || []
  const allSongs = music.getAllSongs?.value || musicSources?.trendingSongs?.value || []

  // If AI is available (with token), use AI-powered recommendations
  try {
    const token = localStorage.getItem('musicist_github_token')
    if (token && allSongs.length > 0) {
      const result = await ai?.recommendSongs(allSongs, history, liked)
      if (result?.recommendations?.length > 0) {
        recommendations.value = result.recommendations.map(r => {
          const match = allSongs.find(s => s.title === r.title && s.artist === r.artist)
          return { ...r, song: match || null, aiGenerated: true }
        })
        isGenerating.value = false
        return
      }
    }
  } catch { /* fallback to local algorithm */ }

  // Local recommendation algorithm
  const result = localRecommend(allSongs, history, liked)
  recommendations.value = result
  isGenerating.value = false
}

// Simple local recommendation: prefer genres from history, mix with unexplored
const localRecommend = (allSongs, history, liked) => {
  if (!allSongs || allSongs.length === 0) return []

  const historyArtists = new Set((history || []).slice(0, 50).map(h => h.artist?.toLowerCase()).filter(Boolean))
  const likedIds = new Set((liked || []).map(s => s.id))
  const result = []

  // 1. Same artist as history (not yet liked)
  const sameArtist = allSongs.filter(s =>
    historyArtists.has(s.artist?.toLowerCase()) && !likedIds.has(s.id)
  )
  sameArtist.slice(0, 3).forEach(s => {
    result.push({
      title: s.title,
      artist: s.artist,
      reason: `你听过 ${s.artist} 的其他歌曲`,
      song: s,
      aiGenerated: false,
    })
  })

  // 2. Fresh picks (not in history, not liked)
  const fresh = allSongs.filter(s =>
    !historyArtists.has(s.artist?.toLowerCase()) && !likedIds.has(s.id)
  )
  fresh.slice(0, 5 - result.length).forEach(s => {
    result.push({
      title: s.title,
      artist: s.artist,
      reason: '发现一首你没听过的好歌',
      song: s,
      aiGenerated: false,
    })
  })

  return result
}

const playSong = (item) => {
  if (item.song) {
    music?.playSong(item.song)
    const el = document.getElementById('global-player')
    if (el && item.song.url) {
      el.src = item.song.url
      el.play().catch(() => {})
    }
  }
}

onMounted(() => {
  generateRecommendations()
})
</script>

<template>
  <div class="glass-card p-5 h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-2.5">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
          <Brain class="w-4 h-4 text-violet-400" />
        </div>
        <h3 class="text-white font-semibold text-sm">AI 智能推荐</h3>
        <span v-if="recommendations.some(r => r.aiGenerated)" class="px-1.5 py-0.5 bg-violet-500/20 text-violet-300 text-[10px] rounded-full font-medium">AI</span>
      </div>
      <button
        @click="generateRecommendations"
        :disabled="isGenerating"
        class="p-1.5 rounded-lg text-gray-500 hover:text-primary-400 hover:bg-white/5 transition-all"
      >
        <RefreshCw :class="['w-3.5 h-3.5', isGenerating ? 'animate-spin' : '']" />
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isGenerating" class="flex-1 flex items-center justify-center">
      <div class="space-y-3 w-full">
        <div v-for="i in 4" :key="i" class="flex items-center space-x-3 animate-pulse">
          <div class="w-10 h-10 rounded-lg bg-white/5"></div>
          <div class="flex-1 space-y-1.5">
            <div class="h-3 bg-white/5 rounded w-3/4"></div>
            <div class="h-2 bg-white/5 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="hasError" class="flex-1 flex flex-col items-center justify-center text-center">
      <Zap class="w-8 h-8 text-gray-600 mb-2" />
      <p class="text-gray-500 text-xs">推荐引擎暂不可用</p>
      <button
        @click="generateRecommendations"
        class="mt-2 text-xs text-primary-400 hover:text-primary-300 transition-colors"
      >
        重试
      </button>
    </div>

    <!-- Recommendations List -->
    <div v-else class="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar-mini">
      <div
        v-for="(item, idx) in recommendations"
        :key="idx"
        @click="playSong(item)"
        class="group p-2.5 rounded-xl hover:bg-white/5 transition-all duration-200 cursor-pointer border border-transparent hover:border-white/5 flex items-center space-x-3"
      >
        <!-- Number / Cover -->
        <div class="relative flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden">
          <img
            v-if="item.song?.cover"
            :src="item.song.cover"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
            <Music class="w-4 h-4 text-white/30" />
          </div>
          <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Play class="w-4 h-4 text-white fill-white" />
          </div>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <h4 class="text-white text-sm font-medium truncate group-hover:text-primary-300 transition-colors">
            {{ item.title }}
          </h4>
          <p class="text-gray-500 text-xs truncate">{{ item.artist }}</p>
          <div class="flex items-center space-x-1.5 mt-1">
            <Sparkles v-if="item.aiGenerated" class="w-2.5 h-2.5 text-violet-400" />
            <p class="text-[10px] text-gray-600 truncate">{{ item.reason }}</p>
          </div>
        </div>

        <!-- Play icon -->
        <div class="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <Play class="w-4 h-4 text-primary-400" />
        </div>
      </div>

      <!-- Empty -->
      <div v-if="recommendations.length === 0" class="flex-1 flex flex-col items-center justify-center text-center py-6">
        <Music class="w-8 h-8 text-gray-600 mb-2" />
        <p class="text-gray-500 text-xs">多听几首歌后，推荐会更精准</p>
        <p class="text-gray-600 text-[10px] mt-1">AI 会分析你的听歌偏好</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px]">
      <span class="text-gray-600">{{ recommendations.length }} 首推荐歌曲</span>
      <span v-if="recommendations.some(r => r.aiGenerated)" class="text-violet-400/70">基于AI分析</span>
      <span v-else class="text-gray-600">智能匹配算法</span>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar-mini::-webkit-scrollbar { width: 3px; }
.custom-scrollbar-mini::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar-mini::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
.line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
</style>