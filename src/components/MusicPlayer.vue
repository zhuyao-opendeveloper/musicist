<script setup>
import { ref, inject, computed, watch, onMounted, nextTick } from 'vue'
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Heart, Repeat, Shuffle, ListMusic, ChevronUp, ChevronDown
} from 'lucide-vue-next'
import DanmakuLayer from './DanmakuLayer.vue'

const music = inject('music')
const danmaku = inject('danmaku')

const audioRef = ref(null)
const progressRef = ref(null)
const isDragging = ref(false)
const currentIndex = ref(0)
const showLyrics = ref(false)
const playMode = ref('list') // 'list' | 'repeat' | 'shuffle'

const playlist = computed(() => music.getAllSongs.value)

const formattedCurrentTime = computed(() => formatTime(music.currentTime.value))
const formattedDuration = computed(() => formatTime(music.duration.value))
const volumeIcon = computed(() => music.volume.value === 0 ? VolumeX : Volume2)

const isExpanded = ref(false)

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const handleTimeUpdate = () => {
  if (!isDragging.value && audioRef.value) {
    music.setCurrentTime(audioRef.value.currentTime)
  }
}

const handleLoadedMetadata = () => {
  if (audioRef.value) {
    music.setDuration(audioRef.value.duration || 0)
    audioRef.value.volume = music.volume.value
  }
}

const handleProgressClick = (e) => {
  if (!progressRef.value || !audioRef.value) return
  const rect = progressRef.value.getBoundingClientRect()
  const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  const newTime = percent * (music.duration.value || 1)
  audioRef.value.currentTime = newTime
  music.setCurrentTime(newTime)
}

const handleVolumeChange = (e) => {
  const vol = parseFloat(e.target.value)
  music.setVolume(vol)
  if (audioRef.value) {
    audioRef.value.volume = vol
  }
}

const togglePlay = () => {
  if (!audioRef.value) return
  if (!music.currentSong.value) return

  if (audioRef.value.paused) {
    audioRef.value.play().catch(console.error)
    music.resume()
  } else {
    audioRef.value.pause()
    music.pause()
  }
}

const getNextIndex = () => {
  if (playMode.value === 'shuffle') {
    let next
    do {
      next = Math.floor(Math.random() * playlist.value.length)
    } while (next === currentIndex.value && playlist.value.length > 1)
    return next
  }
  return (currentIndex.value + 1) % playlist.value.length
}

const getPrevIndex = () => {
  if (playMode.value === 'shuffle') {
    return Math.floor(Math.random() * playlist.value.length)
  }
  return (currentIndex.value - 1 + playlist.value.length) % playlist.value.length
}

const playNext = () => {
  if (playlist.value.length === 0) return
  currentIndex.value = getNextIndex()
  const song = playlist.value[currentIndex.value]
  if (song) playSong(song)
}

const playPrev = () => {
  if (playlist.value.length === 0) return
  currentIndex.value = getPrevIndex()
  const song = playlist.value[currentIndex.value]
  if (song) playSong(song)
}

const playSong = (song) => {
  if (!song) return
  music.playSong(song)
  if (audioRef.value) {
    audioRef.value.src = song.url
    audioRef.value.volume = music.volume.value
    audioRef.value.play().catch((err) => {
      console.warn('Playback failed:', err)
    })
    danmaku.loadDanmaku(song.id || song.title)
  }
}

const handleEnded = () => {
  if (playMode.value === 'repeat') {
    // Replay same song
    if (audioRef.value) {
      audioRef.value.currentTime = 0
      audioRef.value.play().catch(console.error)
    }
  } else {
    playNext()
  }
}

const togglePlayMode = () => {
  const modes = ['list', 'repeat', 'shuffle']
  const idx = modes.indexOf(playMode.value)
  playMode.value = modes[(idx + 1) % modes.length]
}

const playModeIcon = computed(() => {
  if (playMode.value === 'shuffle') return Shuffle
  if (playMode.value === 'repeat') return Repeat
  return ListMusic
})

const isSongLiked = computed(() => {
  if (!music.currentSong.value) return false
  return music.isLiked(music.currentSong.value)
})

const toggleLike = () => {
  if (music.currentSong.value) {
    music.toggleLike(music.currentSong.value)
  }
}

// Progress bar percentage
const progressPercent = computed(() => {
  const dur = music.duration.value || 1
  return Math.min(100, (music.currentTime.value / dur) * 100)
})

const playAudio = (song) => {
  if (!song || !audioRef.value) return
  audioRef.value.src = song.url
  audioRef.value.volume = music.volume.value
  audioRef.value.play().catch((err) => {
    console.warn('Playback failed:', err)
  })
  danmaku.loadDanmaku(song.id || song.title)
}

watch(() => music.currentSong.value, (newSong) => {
  if (newSong) {
    // 更新当前播放索引
    if (playlist.value.length > 0) {
      const index = playlist.value.findIndex(s => s.id === newSong.id || s.title === newSong.title)
      if (index !== -1) currentIndex.value = index
    }
    // 等 v-if 渲染出 audio 元素后再设置音频源
    nextTick(() => { nextTick(() => playAudio(newSong)) })
  }
})

onMounted(() => {
  if (audioRef.value) {
    audioRef.value.volume = music.volume.value
    // 如果已经有选中的歌曲，立即播放
    if (music.currentSong.value) {
      playAudio(music.currentSong.value)
    }
  }
})

onUnmounted(() => {
  if (audioRef.value) {
    audioRef.value.pause()
  }
})
</script>

<template>
  <Teleport to="body">
    <!-- Mini Player -->
    <div
      v-if="music.currentSong.value"
      class="fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/5 transition-all duration-300"
    >
      <audio
        ref="audioRef"
        @timeupdate="handleTimeUpdate"
        @loadedmetadata="handleLoadedMetadata"
        @ended="handleEnded"
        @pause="music.pause"
        @play="music.resume"
        @error="console.warn('Audio error')"
      />

      <!-- Tiny Progress Bar (top edge) -->
      <div class="absolute top-0 left-0 right-0 h-0.5 bg-white/5">
        <div
          class="h-full rounded-full transition-all duration-300"
          :style="{
            width: `${progressPercent}%`,
            background: 'linear-gradient(90deg, #6366f1, #ec4899)'
          }"
        />
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div class="flex items-center space-x-4">
          <!-- Cover -->
          <div
            class="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer pulse-ring"
            :class="{ 'pulse-ring': music.isPlaying.value }"
            @click="isExpanded = !isExpanded"
          >
            <img
              v-if="music.currentSong.value?.cover"
              :src="music.currentSong.value.cover"
              :alt="music.currentSong.value.title"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full bg-gradient-primary flex items-center justify-center"
            >
              <Play class="w-5 h-5 text-white" />
            </div>
            <div class="absolute inset-0 bg-black/20"></div>
          </div>

          <!-- Song Info -->
          <div class="flex-1 min-w-0 max-w-[200px]">
            <div class="flex items-center space-x-2">
              <h3 class="text-white font-medium truncate text-sm">
                {{ music.currentSong.value?.title || '未播放' }}
              </h3>
              <button @click="toggleLike" class="flex-shrink-0">
                <Heart
                  :class="[
                    'w-3.5 h-3.5 transition-all',
                    isSongLiked ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'
                  ]"
                />
              </button>
            </div>
            <p class="text-gray-400 text-xs truncate flex items-center">
              <span>{{ music.currentSong.value?.artist || '未知艺术家' }}</span>
              <span v-if="music.currentSong.value?.sourceName" class="ml-1.5 px-1.5 py-0.5 bg-white/5 rounded text-[10px] text-gray-500">
                {{ music.currentSong.value.sourceName }}
              </span>
            </p>
          </div>

          <!-- Controls (Desktop) -->
          <div class="hidden sm:flex items-center space-x-1 flex-1 justify-center">
            <button
              @click="playPrev"
              class="p-2 text-gray-400 hover:text-white transition-colors"
              title="上一首"
            >
              <SkipBack class="w-4 h-4" />
            </button>

            <button
              @click="togglePlay"
              class="w-10 h-10 rounded-full bg-gradient-primary hover:shadow-lg hover:shadow-primary-500/30 flex items-center justify-center text-white transition-all"
              title="播放/暂停"
            >
              <Play v-if="!music.isPlaying.value" class="w-5 h-5 ml-0.5" />
              <Pause v-else class="w-5 h-5" />
            </button>

            <button
              @click="playNext"
              class="p-2 text-gray-400 hover:text-white transition-colors"
              title="下一首"
            >
              <SkipForward class="w-4 h-4" />
            </button>
          </div>

          <!-- Progress (Desktop) -->
          <div class="hidden md:flex items-center space-x-3 max-w-[300px] flex-1">
            <span class="text-xs text-gray-400 w-8 text-right">{{ formattedCurrentTime }}</span>
            <div
              ref="progressRef"
              @click="handleProgressClick"
              class="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer relative group/progress"
            >
              <div
                class="absolute top-0 left-0 h-full rounded-full transition-all duration-150"
                :style="{
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, #6366f1, #ec4899)'
                }"
              />
              <div
                class="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
                :style="{ left: `calc(${progressPercent}% - 6px)` }"
              />
            </div>
            <span class="text-xs text-gray-400 w-8">{{ formattedDuration }}</span>
          </div>

          <!-- Right Controls -->
          <div class="flex items-center space-x-1 sm:space-x-2">
            <!-- Play Mode -->
            <button
              @click="togglePlayMode"
              class="p-2 rounded-lg transition-colors"
              :class="playMode !== 'list' ? 'text-primary-400 bg-primary-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'"
              :title="playMode === 'list' ? '列表循环' : playMode === 'repeat' ? '单曲循环' : '随机播放'"
            >
              <component :is="playModeIcon" class="w-4 h-4" />
            </button>

            <!-- Volume -->
            <div class="hidden lg:flex items-center space-x-1.5">
              <button
                @click="music.setVolume(music.volume.value === 0 ? 0.7 : 0)"
                class="p-1.5 text-gray-400 hover:text-white transition-colors"
              >
                <component :is="volumeIcon" class="w-3.5 h-3.5" />
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                :value="music.volume.value"
                @input="handleVolumeChange"
                class="w-20"
              />
            </div>

            <!-- Danmaku -->
            <DanmakuLayer />

            <!-- Lyrics Toggle -->
            <button
              @click="showLyrics = !showLyrics"
              class="p-2 rounded-lg transition-colors"
              :class="showLyrics ? 'text-primary-400 bg-primary-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'"
              title="歌词"
            >
              <component :is="showLyrics ? ChevronDown : ChevronUp" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Lyrics Panel -->
      <Transition
        enter-from-class="max-h-0 opacity-0"
        enter-to-class="max-h-64 opacity-100"
        leave-from-class="max-h-64 opacity-100"
        leave-to-class="max-h-0 opacity-0"
      >
        <div
          v-if="showLyrics"
          class="border-t border-white/5 overflow-hidden transition-all duration-300"
        >
          <div class="max-w-2xl mx-auto py-6 px-8 text-center">
            <p class="text-gray-400 italic text-sm">
              正在播放：{{ music.currentSong.value?.title }}
            </p>
            <div class="mt-4 space-y-2 text-gray-500 text-sm">
              <p class="text-primary-300 font-medium">♪ 暂无歌词数据 ♪</p>
              <p class="text-gray-600 text-xs">可⏤通过管理员界面添加歌词</p>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/5"
    >
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex items-center justify-center text-gray-500 text-sm space-x-2">
          <Play class="w-4 h-4" />
          <span>选择一首歌曲开始播放</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>
