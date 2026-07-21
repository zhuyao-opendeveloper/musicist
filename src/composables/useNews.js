import { ref, computed } from 'vue'

// ============================================================
//  NEWS / INFO COMPOSABLE
//  Fetches music news & entertainment info for the dashboard
// ============================================================

const MOCK_NEWS = [
  {
    id: 'n1',
    title: '2026下半年最受期待的10张华语专辑',
    summary: '从周杰伦到陈奕迅，下半年华语乐坛将迎来一波高质量发片潮...',
    source: '音乐财经',
    sourceIcon: '📰',
    time: '2小时前',
    tag: '华语',
    tagColor: 'text-red-400 bg-red-500/10',
    url: '#',
  },
  {
    id: 'n2',
    title: 'Spotify公布2026全球流媒体数据：华语音乐增长47%',
    summary: '华语音乐在全球流媒体平台的表现持续走高，K-pop以外的亚洲音乐正在崛起',
    source: '全球音乐资讯',
    sourceIcon: '🌍',
    time: '5小时前',
    tag: '数据',
    tagColor: 'text-blue-400 bg-blue-500/10',
    url: '#',
  },
  {
    id: 'n3',
    title: 'AI写歌真的能替代人类吗？音乐人集体回应',
    summary: '面对AI音乐生成工具的冲击，多位知名音乐人表达了自己的观点',
    source: '科技音乐志',
    sourceIcon: '🤖',
    time: '8小时前',
    tag: 'AI',
    tagColor: 'text-purple-400 bg-purple-500/10',
    url: '#',
  },
  {
    id: 'n4',
    title: '独立音乐平台Bandcamp被收购后的新变化',
    summary: '从独立到底层商业化，Bandcamp的转变对音乐人意味着什么',
    source: '独立音乐报',
    sourceIcon: '🎸',
    time: '12小时前',
    tag: '行业',
    tagColor: 'text-green-400 bg-green-500/10',
    url: '#',
  },
  {
    id: 'n5',
    title: '黑胶唱片销量连续5年超过CD：复古潮流不可挡',
    summary: '黑胶唱片销售额继续走高，Z世代成为黑胶购买的主力军',
    source: '音乐商业周刊',
    sourceIcon: '💿',
    time: '1天前',
    tag: '趋势',
    tagColor: 'text-orange-400 bg-orange-500/10',
    url: '#',
  },
  {
    id: 'n6',
    title: '豆瓣2026年中音乐盘点：这些专辑你不能错过',
    summary: '豆瓣音乐编辑团队精选今年上半年最值得听的20张专辑',
    source: '豆瓣音乐',
    sourceIcon: '📊',
    time: '1天前',
    tag: '盘点',
    tagColor: 'text-yellow-400 bg-yellow-500/10',
    url: '#',
  },
  {
    id: 'n7',
    title: '音乐节经济复苏：上半年全国音乐节总票房超30亿',
    summary: '随着户外活动的恢复，今年的音乐节数量和票房均已超过疫情前水平',
    source: '娱乐财经',
    sourceIcon: '🎪',
    time: '2天前',
    tag: '财经',
    tagColor: 'text-cyan-400 bg-cyan-500/10',
    url: '#',
  },
  {
    id: 'n8',
    title: 'Suno v4发布：30秒生成一首完整歌曲，音乐行业慌了',
    summary: '新版本支持人声演唱和分轨导出，预示着AI音乐的新时代',
    source: '科技音乐志',
    sourceIcon: '🚀',
    time: '2天前',
    tag: '科技',
    tagColor: 'text-indigo-400 bg-indigo-500/10',
    url: '#',
  },
]

const MOMENTS = [
  { id: 'm1', title: '今日词曲推荐', desc: '林夕经典词作回顾', icon: '📝' },
  { id: 'm2', title: '每日一首新歌', desc: '自动发现新鲜好歌', icon: '🎵' },
  { id: 'm3', title: '热门歌单', desc: '收藏这块的心动歌单', icon: '🔥' },
  { id: 'm4', title: '历史上的今天', desc: '2008年·周杰伦发行《魔杰座》', icon: '📅' },
]

export function useNews() {
  const news = ref(MOCK_NEWS)
  const moments = ref(MOMENTS)
  const activeTab = ref('all')
  const isLoading = ref(false)
  const totalListeningMinutes = ref(0)
  const totalSongsPlayed = ref(0)

  const tabs = [
    { id: 'all', label: '全部资讯' },
    { id: 'industry', label: '行业动态' },
    { id: 'tech', label: '科技音乐' },
    { id: 'recom', label: '编辑推荐' },
  ]

  const filteredNews = computed(() => {
    if (activeTab.value === 'all') return news.value
    // Filter by tag - simplified mapping
    const tagMap = {
      'industry': ['行业', '数据', '财经'],
      'tech': ['AI', '科技'],
      'recom': ['盘点', '华语', '趋势'],
    }
    const tags = tagMap[activeTab.value] || []
    return news.value.filter(n => tags.includes(n.tag))
  })

  const getCategoryNews = (category) => {
    return news.value.filter(n => {
      if (category === 'hot') return ['数据', '盘点', '趋势'].includes(n.tag)
      if (category === 'tech') return ['AI', '科技'].includes(n.tag)
      if (category === 'all') return true
      return n.tag === category
    }).slice(0, 5)
  }

  const loadNews = async () => {
    isLoading.value = true
    // Simulate network request delay for realism
    await new Promise(resolve => setTimeout(resolve, 600))
    // In production, replace with real API:
    // const res = await fetch('https://newsapi.org/v2/top-headlines?category=entertainment&q=music&apiKey=...')
    isLoading.value = false
    return news.value
  }

  const calcListeningStats = (history) => {
    if (!history || history.length === 0) {
      totalListeningMinutes.value = 0
      totalSongsPlayed.value = 0
      return
    }
    totalSongsPlayed.value = history.reduce((sum, h) => sum + (h.playCount || 1), 0)
    // Estimate ~3 minutes per song
    totalListeningMinutes.value = Math.round(totalSongsPlayed.value * 3)
  }

  return {
    news,
    moments,
    activeTab,
    isLoading,
    newsTab,
    filteredNews,
    totalListeningMinutes,
    totalSongsPlayed,
    getCategoryNews,
    loadNews,
    calcListeningStats,
  }
}