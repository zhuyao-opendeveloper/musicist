<script setup>import { ref, inject, computed, watch, onMounted, onUnmounted } from 'vue';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, List, Heart, Repeat, Shuffle } from 'lucide-vue-next';
import DanmakuLayer from './DanmakuLayer.vue';
const music = inject('music');
const danmaku = inject('danmaku');
const auth = inject('auth');
const audioRef = ref(null);
const progressRef = ref(null);
const isDragging = ref(false);
const currentIndex = ref(0);
const playlist = computed(() => music.getAllSongs.value);
const formattedCurrentTime = computed(() => formatTime(music.currentTime.value));
const formattedDuration = computed(() => formatTime(music.duration.value));
const volumeIcon = computed(() => music.volume.value === 0 ? VolumeX : Volume2);
const formatTime = (seconds) => {
 const mins = Math.floor(seconds / 60);
 const secs = Math.floor(seconds % 60);
 return `${mins}:${secs.toString().padStart(2, '0')}`;
};
const handleTimeUpdate = () => {
 if (!isDragging.value && audioRef.value) {
 music.setCurrentTime(audioRef.value.currentTime);
 }
};
const handleLoadedMetadata = () => {
 if (audioRef.value) {
 music.setDuration(audioRef.value.duration);
 }
};
const handleProgressClick = (e) => {
 if (!progressRef.value || !audioRef.value)
 return;
 const rect = progressRef.value.getBoundingClientRect();
 const percent = (e.clientX - rect.left) / rect.width;
 const newTime = percent * music.duration.value;
 audioRef.value.currentTime = newTime;
 music.setCurrentTime(newTime);
};
const handleVolumeChange = (e) => {
 music.setVolume(parseFloat(e.target.value));
};
const togglePlay = () => {
 if (audioRef.value) {
 if (audioRef.value.paused) {
 audioRef.value.play();
 music.resume();
 }
 else {
 audioRef.value.pause();
 music.pause();
 }
 }
};
const playNext = () => {
 const nextIndex = (currentIndex.value + 1) % playlist.value.length;
 currentIndex.value = nextIndex;
 const nextSong = playlist.value[nextIndex];
 if (nextSong) {
 playSong(nextSong);
 }
};
const playPrev = () => {
 const prevIndex = (currentIndex.value - 1 + playlist.value.length) % playlist.value.length;
 currentIndex.value = prevIndex;
 const prevSong = playlist.value[prevIndex];
 if (prevSong) {
 playSong(prevSong);
 }
};
const playSong = (song) => {
 music.playSong(song);
 if (audioRef.value) {
 audioRef.value.src = song.url;
 audioRef.value.play();
 danmaku.loadDanmaku(song.id || song.title);
 }
};
const handleEnded = () => {
 playNext();
};
const isSongLiked = computed(() => {
 if (!music.currentSong.value) return false;
 return music.isLiked(music.currentSong.value);
});
const toggleLike = () => {
 if (music.currentSong.value) {
 music.toggleLike(music.currentSong.value);
 }
};
watch(() => music.currentSong.value, (newSong) => {
 if (newSong) {
 const index = playlist.value.findIndex(s => s.title === newSong.title);
 if (index !== -1) {
 currentIndex.value = index;
 }
 }
});
onMounted(() => {
 if (playlist.value.length > 0 && !music.currentSong.value) {
 playSong(playlist.value[0]);
 }
});
onUnmounted(() => {
 if (audioRef.value) {
 audioRef.value.pause();
 }
});
</script>

<template>
  <div class="fixed bottom-0 left-0 right-0 z-40 bg-dark-900/90 backdrop-blur-md border-t border-dark-600">
    <audio
      ref="audioRef"
      :volume="music.volume.value"
      @timeupdate="handleTimeUpdate"
      @loadedmetadata="handleLoadedMetadata"
      @ended="handleEnded"
      @pause="music.pause"
      @play="music.resume"
    />
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center space-x-4">
        <div class="w-12 h-12 bg-dark-700 rounded-lg flex-shrink-0 overflow-hidden">
          <img
            v-if="music.currentSong.value?.cover"
            :src="music.currentSong.value.cover"
            :alt="music.currentSong.value.title"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full bg-gradient-to-br from-primary-500/20 to-primary-700/20 flex items-center justify-center">
            <Play class="w-6 h-6 text-primary-400" />
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2 mb-1">
            <h3 class="text-white font-medium truncate">
              {{ music.currentSong.value?.title || '未播放' }}
            </h3>
            <button @click="toggleLike" class="flex-shrink-0">
              <Heart
                :class="[
                  'w-4 h-4 transition-colors',
                  isSongLiked ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'
                ]"
              />
            </button>
          </div>
          <p class="text-gray-400 text-sm truncate">
            {{ music.currentSong.value?.artist || '未知艺术家' }}
          </p>
        </div>

        <div class="flex-1 max-w-md hidden sm:block">
          <div class="flex items-center space-x-3">
            <button
              @click="playPrev"
              class="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <SkipBack class="w-5 h-5" />
            </button>
            <button
              @click="togglePlay"
              class="w-12 h-12 bg-primary-600 hover:bg-primary-700 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <Play v-if="!music.isPlaying.value" class="w-6 h-6 ml-1" />
              <Pause v-else class="w-6 h-6" />
            </button>
            <button
              @click="playNext"
              class="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <SkipForward class="w-5 h-5" />
            </button>

            <div class="flex-1 mx-4">
              <div
                ref="progressRef"
                @click="handleProgressClick"
                class="relative h-1 bg-dark-600 rounded-full cursor-pointer"
              >
                <div
                  class="absolute top-0 left-0 h-full bg-primary-500 rounded-full transition-all"
                  :style="{ width: `${(music.currentTime.value / music.duration.value) * 100}%` }"
                />
                <div
                  class="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg transition-all opacity-0 hover:opacity-100"
                  :style="{ left: `${(music.currentTime.value / music.duration.value) * 100}%` }"
                />
              </div>
              <div class="flex justify-between mt-1 text-xs text-gray-400">
                <span>{{ formattedCurrentTime }}</span>
                <span>{{ formattedDuration }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <button class="p-2 text-gray-400 hover:text-white transition-colors">
            <Shuffle class="w-4 h-4" />
          </button>
          <button class="p-2 text-gray-400 hover:text-white transition-colors">
            <Repeat class="w-4 h-4" />
          </button>
          
          <div class="hidden md:flex items-center space-x-2">
            <component :is="volumeIcon" class="w-4 h-4 text-gray-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              :value="music.volume.value"
              @input="handleVolumeChange"
              class="w-20 h-1 bg-dark-600 rounded-full appearance-none cursor-pointer"
            />
          </div>
          
          <DanmakuLayer />
        </div>
      </div>
    </div>
  </div>
</template>
