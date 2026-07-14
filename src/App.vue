<script setup>
import { provide, onMounted, ref } from 'vue'
import { useAuth } from './composables/useAuth'
import { useMusic } from './composables/useMusic'
import { useDanmaku } from './composables/useDanmaku'
import { useGitHub } from './composables/useGitHub'
import { useAI } from './composables/useAI'
import { useBing } from './composables/useBing'
import { useMusicSources } from './composables/useMusicSources'

const auth = useAuth()
const music = useMusic()
const danmaku = useDanmaku()
const github = useGitHub()
const ai = useAI()
const bing = useBing()
const musicSources = useMusicSources()

const globalAudio = ref(null)
provide('globalAudio', globalAudio)

// 提供一个全局播放函数，任何组件都能调用
const playAudio = (song) => {
  if (!song || !globalAudio.value) return
  const el = globalAudio.value
  el.src = song.url
  el.volume = music.volume.value
  el.play().catch(err => console.warn('Playback failed:', err))
}
provide('playAudio', playAudio)

provide('auth', auth)
provide('music', music)
provide('danmaku', danmaku)
provide('github', github)
provide('ai', ai)
provide('bing', bing)
provide('musicSources', musicSources)

onMounted(() => {
  // ========== 启动时立即并行加载所有数据 ==========
  // 不 await，不阻塞 UI 渲染，数据到了自动更新界面

  // 1. Bing 壁纸
  bing.fetchBingImage()

  // 2. 本地缓存数据（同步，瞬间完成）
  music.loadListeningHistory()
  music.loadLikedSongs()

  // 3. 远程数据（并行触发，谁先到谁先渲染）
  Promise.allSettled([
    music.loadSources(),
    music.loadPlaylists(),
    // 音乐推荐数据 — 用户最关心的，优先加载
    musicSources.getTrending().then(songs => {
      musicSources.searchResults.value = [...songs]
    })
  ])
})
</script>

<template>
  <!-- 全局 audio 元素：始终存在于 DOM，供 MusicCard/MusicPlayer 使用 -->
  <audio ref="globalAudio" style="display:none" />
  <router-view />
</template>
