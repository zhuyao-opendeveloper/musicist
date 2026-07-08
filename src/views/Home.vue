<script setup>import { ref, inject, onMounted, computed } from 'vue';
import { Search, Grid, List, Radio, Disc3, Clock, TrendingUp, Sparkles, RefreshCw, Heart } from 'lucide-vue-next';
import NavHeader from '../components/NavHeader.vue';
import MusicPlayer from '../components/MusicPlayer.vue';
import SongCard from '../components/SongCard.vue';
const music = inject('music');
const auth = inject('auth');
const ai = inject('ai');
const searchQuery = ref('');
const viewMode = ref('list');
const activeTab = ref('all');
const recommendations = ref([]);
const isGenerating = ref(false);
const filteredSongs = computed(() => {
 let songs = music.getAllSongs.value;
 
 if (activeTab.value === 'liked') {
 songs = songs.filter(s => music.isLiked(s));
 }
 
 if (searchQuery.value) {
 const query = searchQuery.value.toLowerCase();
 songs = songs.filter(s => s.title.toLowerCase().includes(query) ||
 s.artist.toLowerCase().includes(query));
 }
 return songs;
});
const tabs = [
 { id: 'all', label: '全部', icon: Grid },
 { id: 'popular', label: '热门', icon: TrendingUp },
 { id: 'recent', label: '最近', icon: Clock },
 { id: 'liked', label: '收藏', icon: Heart },
 { id: 'radio', label: '电台', icon: Radio },
];
const generateRecommendations = async () => {
 if (!auth.isLoggedIn.value)
 return;
 isGenerating.value = true;
 try {
 const allSongs = music.getAllSongs.value;
 if (allSongs.length === 0)
 return;
 const result = await ai.recommendSongs(allSongs, music.listeningHistory.value, music.likedSongs.value);
 recommendations.value = result.recommendations || [];
 }
 catch (e) {
 console.error('推荐失败:', e);
 recommendations.value = getFallbackRecommendations();
 }
 finally {
 isGenerating.value = false;
 }
};
const getFallbackRecommendations = () => {
 const allSongs = music.getAllSongs.value;
 const shuffled = [...allSongs].sort(() => Math.random() - 0.5);
 return shuffled.slice(0, 5).map(s => ({
 title: s.title,
 artist: s.artist,
 reason: '热门推荐',
 }));
};
const playRecommendedSong = (rec) => {
 const song = music.getAllSongs.value.find(s => s.title === rec.title && s.artist === rec.artist);
 if (song) {
 music.playSong(song);
 }
};
onMounted(async () => {
 await music.loadSources();
 await music.loadPlaylists();
 music.loadListeningHistory();
 music.loadLikedSongs();
 if (auth.isLoggedIn.value) {
 setTimeout(generateRecommendations, 1000);
 }
});
</script>

<template>
  <div class="min-h-screen bg-dark-900">
    <NavHeader />
    
    <main class="pt-20 pb-32">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-white mb-2">发现音乐</h1>
          <p class="text-gray-400">探索你喜欢的音乐</p>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 mb-8">
          <div class="relative flex-1">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索歌曲、艺术家..."
              class="w-full bg-dark-700 border border-dark-600 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>
          
          <div class="flex items-center space-x-2">
            <button
              @click="viewMode = 'list'"
              :class="[
                'p-3 rounded-lg transition-colors',
                viewMode === 'list' ? 'bg-primary-600/20 text-primary-400' : 'bg-dark-700 text-gray-400 hover:text-white'
              ]"
            >
              <List class="w-5 h-5" />
            </button>
            <button
              @click="viewMode = 'grid'"
              :class="[
                'p-3 rounded-lg transition-colors',
                viewMode === 'grid' ? 'bg-primary-600/20 text-primary-400' : 'bg-dark-700 text-gray-400 hover:text-white'
              ]"
            >
              <Grid class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div v-if="auth.isLoggedIn.value && recommendations.length > 0" class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2">
              <Sparkles class="w-5 h-5 text-primary-400" />
              <h2 class="text-xl font-bold text-white">AI 推荐</h2>
            </div>
            <button
              @click="generateRecommendations"
              :disabled="isGenerating"
              class="flex items-center space-x-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw :class="['w-4 h-4', isGenerating ? 'animate-spin' : '']" />
              <span>{{ isGenerating ? '生成中...' : '重新推荐' }}</span>
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div
              v-for="(rec, index) in recommendations"
              :key="index"
              @click="playRecommendedSong(rec)"
              class="bg-dark-800 rounded-xl p-4 hover:bg-dark-700 cursor-pointer transition-colors group"
            >
              <div class="relative w-full aspect-square bg-gradient-to-br from-primary-500/20 to-primary-700/20 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <div class="text-4xl font-bold text-primary-400/30">{{ index + 1 }}</div>
                <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span class="text-white text-sm">点击播放</span>
                </div>
              </div>
              <h4 class="text-white font-medium truncate">{{ rec.title }}</h4>
              <p class="text-gray-400 text-sm truncate">{{ rec.artist }}</p>
              <p class="text-primary-400 text-xs mt-2 line-clamp-2">{{ rec.reason }}</p>
            </div>
          </div>
        </div>

        <div class="flex space-x-2 mb-8 overflow-x-auto pb-2">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap',
              activeTab === tab.id ? 'bg-primary-600 text-white' : 'bg-dark-700 text-gray-400 hover:text-white'
            ]"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <div v-if="filteredSongs.length > 0" class="space-y-3">
          <SongCard
            v-for="song in filteredSongs"
            :key="song.id || song.title"
            :song="song"
          />
        </div>

        <div v-else class="text-center py-20">
          <Disc3 class="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 class="text-white text-xl font-medium mb-2">暂无歌曲</h3>
          <p class="text-gray-400">请在管理员界面添加音乐源</p>
        </div>
      </div>
    </main>
    
    <MusicPlayer />
  </div>
</template>
