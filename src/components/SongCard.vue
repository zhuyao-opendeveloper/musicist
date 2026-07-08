<script setup>
import { inject, computed } from 'vue'
import { Play, Pause, Heart, MoreHorizontal } from 'lucide-vue-next'

const props = defineProps({
  song: {
    type: Object,
    required: true
  }
})

const music = inject('music')
const isPlaying = music.isPlaying
const currentSong = music.currentSong

const isSongLiked = computed(() => {
  return music.isLiked(props.song)
})

const handlePlay = () => {
  music.playSong(props.song)
}

const handleLike = (e) => {
  e.stopPropagation()
  music.toggleLike(props.song)
}
</script>

<template>
  <div
    class="flex items-center space-x-4 p-4 bg-dark-800/50 rounded-xl hover:bg-dark-700/50 transition-all cursor-pointer group"
    @click="handlePlay"
  >
    <div class="relative w-12 h-12 flex-shrink-0">
      <img
        v-if="song.cover"
        :src="song.cover"
        :alt="song.title"
        class="w-full h-full object-cover rounded-lg"
      />
      <div
        v-else
        class="w-full h-full bg-gradient-to-br from-primary-500/30 to-primary-700/30 rounded-lg flex items-center justify-center"
      >
        <Play class="w-5 h-5 text-primary-400" />
      </div>
      <div
        class="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Play
          v-if="currentSong.value?.title !== song.title || !isPlaying.value"
          class="w-6 h-6 text-white"
        />
        <Pause v-else class="w-6 h-6 text-white" />
      </div>
    </div>

    <div class="flex-1 min-w-0">
      <h4 class="text-white font-medium truncate">{{ song.title }}</h4>
      <p class="text-gray-400 text-sm truncate">{{ song.artist }}</p>
    </div>

    <div class="flex items-center space-x-2">
      <span class="text-gray-500 text-sm">{{ song.sourceName }}</span>
      <button
        @click="handleLike"
        class="p-2 rounded-lg transition-colors"
        :class="isSongLiked ? 'text-red-500' : 'text-gray-400 hover:text-white hover:bg-dark-600'"
      >
        <Heart :class="['w-4 h-4', isSongLiked ? 'fill-red-500' : '']" />
      </button>
      <button class="p-2 text-gray-400 hover:text-white hover:bg-dark-600 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
        <MoreHorizontal class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
