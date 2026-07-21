<script setup>
import { inject, ref, computed, onMounted } from 'vue'
import { Newspaper, TrendingUp, Clock, ExternalLink, ChevronRight, Sparkles } from 'lucide-vue-next'

const newsC = inject('news')

const activeTab = ref('all')

const tabs = [
  { id: 'all', label: '全部' },
  { id: 'data', label: '数据' },
  { id: 'ai', label: 'AI' },
  { id: 'industry', label: '行业' },
]

const displayedNews = computed(() => {
  if (!newsC?.news?.value) return []
  if (activeTab.value === 'all') return newsC.news.value.slice(0, 6)
  return newsC.news.value.filter(n => {
    if (activeTab.value === 'ai') return n.tag === 'AI' || n.tag === '科技'
    if (activeTab.value === 'data') return n.tag === '数据' || n.tag === '盘点'
    if (activeTab.value === 'industry') return n.tag === '行业' || n.tag === '财经'
    return true
  }).slice(0, 6)
})

const getTagColor = (tag) => {
  const colors = {
    '华语': 'text-red-400 bg-red-500/10 border-red-500/20',
    '数据': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    'AI': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    '行业': 'text-green-400 bg-green-500/10 border-green-500/20',
    '趋势': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    '盘点': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    '财经': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    '科技': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  }
  return colors[tag] || 'text-gray-400 bg-gray-500/10 border-gray-500/20'
}

onMounted(() => {
  newsC?.loadNews()
})
</script>

<template>
  <div class="glass-card p-5 h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-2.5">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
          <Newspaper class="w-4 h-4 text-amber-400" />
        </div>
        <h3 class="text-white font-semibold text-sm">音乐资讯</h3>
      </div>
      <button class="text-xs text-gray-500 hover:text-primary-400 transition-colors flex items-center space-x-1">
        <span>更多</span>
        <ChevronRight class="w-3 h-3" />
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex space-x-1 mb-3 overflow-x-auto pb-1 no-scrollbar">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
          activeTab === tab.id
            ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- News List -->
    <div class="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar-mini">
      <div
        v-for="item in displayedNews"
        :key="item.id"
        class="group p-3 rounded-xl hover:bg-white/5 transition-all duration-200 cursor-pointer border border-transparent hover:border-white/5"
      >
        <div class="flex items-start space-x-2">
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2 mb-1">
              <span
                :class="['text-[10px] px-1.5 py-0.5 rounded-full border font-medium', getTagColor(item.tag)]"
              >
                {{ item.tag }}
              </span>
              <span class="text-[10px] text-gray-600">{{ item.time }}</span>
            </div>
            <h4 class="text-white text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary-300 transition-colors">
              {{ item.title }}
            </h4>
            <p class="text-gray-500 text-xs mt-1 line-clamp-1">
              {{ item.summary }}
            </p>
          </div>
        </div>
        <!-- Source -->
        <div class="flex items-center space-x-2 mt-2">
          <span class="text-[10px] text-gray-600">{{ item.sourceIcon }} {{ item.source }}</span>
          <ExternalLink class="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>

    <!-- Bottom CTA -->
    <div class="mt-3 pt-3 border-t border-white/5">
      <button class="w-full py-2 text-xs text-gray-500 hover:text-primary-400 transition-colors flex items-center justify-center space-x-1.5">
        <Sparkles class="w-3 h-3" />
        <span>查看更多音乐资讯</span>
        <ChevronRight class="w-3 h-3" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.custom-scrollbar-mini::-webkit-scrollbar { width: 3px; }
.custom-scrollbar-mini::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar-mini::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
.line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>