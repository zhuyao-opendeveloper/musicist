<script setup>
import { provide, onMounted } from 'vue'
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

provide('auth', auth)
provide('music', music)
provide('danmaku', danmaku)
provide('github', github)
provide('ai', ai)
provide('bing', bing)
provide('musicSources', musicSources)

onMounted(() => {
  bing.fetchBingImage()
})
</script>

<template>
  <router-view />
</template>
