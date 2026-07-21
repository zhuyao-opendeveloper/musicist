<script setup>
import { inject, computed } from 'vue'
import { BarChart3, Clock, Heart, Headphones, TrendingUp, Flame } from 'lucide-vue-next'

const music = inject('music')

const history = computed(() => music?.listeningHistory?.value || [])
const liked = computed(() => music?.likedSongs?.value || [])
const allSongs = computed(() => music?.getAllSongs?.value || [])

const totalPlays = computed(() => history.value.reduce((s, h) => s + (h.playCount || 1), 0))

const uniqueArtists = computed(() => {
  const artists = new Set()
  history.value.forEach(h => { if (h.artist) artists.add(h.artist) })
  return artists.size
})

const totalMinutes = computed(() => Math.round(totalPlays.value * 3.2))

const topArtists = computed(() => {
  const map = {}
  history.value.forEach(h => {
    const key = h.artist || 'Unknown'
    map[key] = (map[key] || 0) + (h.playCount || 1)
  })
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
})

const todayPlays = computed(() => {
  const today = new Date().toDateString()
  return history.value
    .filter(h => new Date(h.lastPlayed).toDateString() === today)
    .reduce((s, h) => s + (h.playCount || 1), 0)
})

const stats = computed(() => [
  { label: '总播放次数', value: totalPlays.value, icon: Headphones, color: 'text-primary-400' },
  { label: '收藏歌曲', value: liked.value.length, icon: Heart, color: 'text-red-400' },
  { label: '收听时长', value: `${totalMinutes.value}分钟`, icon: Clock, color: 'text-green-400' },
  { label: '音乐人', value: uniqueArtists.value, icon: TrendingUp, color: 'text-amber-400' },
])

const formatNumber = (n) => {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}
</script>

<template>
  <div class="glass-card p-5 h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-2.5">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
          <BarChart3 class="w-4 h-4 text-emerald-400" />
        </div>
        <h3 class="text-white font-semibold text-sm">我的音乐数据</h3>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 gap-2.5 mb-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors"
      >
        <div class="flex items-center space-x-1.5 mb-1">
          <component :is="stat.icon" :class="['w-3.5 h-3.5', stat.color]" />
          <span class="text-[10px] text-gray-500">{{ stat.label }}</span>
        </div>
        <div class="text-lg font-bold text-white">{{ typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value }}</div>
      </div>
    </div>

    <!-- Top Artists -->
    <div class="flex-1">
      <div class="flex items-center space-x-1.5 mb-2">
        <Flame class="w-3.5 h-3.5 text-orange-400" />
        <span class="text-[10px] text-gray-500 font-medium">最常听的音乐人</span>
      </div>

      <div v-if="topArtists.length > 0" class="space-y-1.5">
        <div
          v-for="(artist, idx) in topArtists"
          :key="artist[0]"
          class="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          <span
            :class="[
              'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
              idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
              idx === 1 ? 'bg-gray-400/20 text-gray-400' :
              idx === 2 ? 'bg-amber-600/20 text-amber-500' :
              'bg-white/5 text-gray-500'
            ]"
          >
            {{ idx + 1 }}
          </span>
          <span class="text-white text-xs flex-1 truncate">{{ artist[0] }}</span>
          <span class="text-gray-500 text-[10px]">{{ artist[1] }}次</span>
        </div>
      </div>

      <div v-else class="flex items-center justify-center py-4">
        <p class="text-gray-600 text-xs">听过几首歌后这里会有数据</p>
      </div>
    </div>

    <!-- Today -->
    <div v-if="todayPlays > 0" class="mt-3 pt-3 border-t border-white/5 flex items-center space-x-2">
      <div class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
      <span class="text-[10px] text-gray-500">今天已播放 {{ todayPlays }} 首歌</span>
    </div>
  </div>
</template>