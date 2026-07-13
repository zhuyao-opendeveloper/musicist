<script setup>
import { inject, computed } from 'vue'
import { Play, Pause, Heart, Music } from 'lucide-vue-next'

const props = defineProps({
  song: {
    type: Object,
    required: true,
  },
})

const music = inject('music')

const isSongPlaying = computed(() => {
  return music.currentSong.value?.id === props.song.id && music.isPlaying.value
})

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

const sourceBadgeColors = {
  deezer: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  netease: 'bg-red-500/20 text-red-300 border-red-500/30',
  builtin: 'bg-green-500/20 text-green-300 border-green-500/30',
  theAudioDB: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
}

const getSourceColor = (source) => {
  return sourceBadgeColors[props.song.source] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'
}
</script>

<template>
  <div
    class="glass-card overflow-hidden cursor-pointer group"
    @click="handlePlay"
  >
    <!-- Cover Image -->
    <div class="relative aspect-square overflow-hidden">
      <img
        v-if="song.cover"
        :src="song.cover"
        :alt="song.title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
      <div
        v-else
        class="w-full h-full bg-gradient-to-br from-primary-500/30 via-secondary-500/20 to-dark-500 flex items-center justify-center"
      >
        <Music class="w-12 h-12 text-white/30" />
      </div>

      <!-- Play Overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
        <div
          :class="[
            'w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg',
            isSongPlaying
              ? 'bg-gradient-primary shadow-primary-500/50 scale-110'
              : 'bg-white/20 backdrop-blur-sm group-hover:scale-110 group-hover:bg-gradient-primary group-hover:shadow-primary-500/50'
          ]"
        >
          <Play v-if="!isSongPlaying" class="w-6 h-6 text-white ml-1" />
          <Pause v-else class="w-6 h-6 text-white" />
        </div>
      </div>

      <!-- Source Badge -->
      <span
        :class="[
          'absolute top-3 left-3 px-2 py-0.5 text-xs rounded-full border font-medium',
          getSourceColor(song.source)
        ]"
      >
        {{ song.sourceName }}
      </span>

      <!-- Like Button -->
      <button
        @click="handleLike"
        class="absolute top-3 right-3 p-2 rounded-full bg-black/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
      >
        <Heart
          :class="[
            'w-4 h-4 transition-colors',
            isSongLiked ? 'fill-red-500 text-red-500' : 'text-white'
          ]"
        />
      </button>
    </div>

    <!-- Song Info -->
    <div class="p-4">
      <h3 class="text-white font-semibold truncate group-hover:text-primary-300 transition-colors">
        {{ song.title }}
      </h3>
      <p class="text-gray-400 text-sm truncate mt-1">
        {{ song.artist }}
      </p>

      <!-- Duration -->
      <div class="flex items-center space-x-2 mt-2">
        <div class="flex-1 h-px bg-white/5"></div>
        <span class="text-gray-500 text-xs">
          {{ Math.floor((song.duration || 0) / 60) }}:{{ String(Math.floor((song.duration || 0) % 60)).padStart(2, '0') }}
        </span>
      </div>
    </div>
  </div>
</template>
