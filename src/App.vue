<script setup>
import { provide } from 'vue'
import { useAuth } from './composables/useAuth'
import { useMusic } from './composables/useMusic'
import { useDanmaku } from './composables/useDanmaku'
import { useGitHub } from './composables/useGitHub'
import { useAI } from './composables/useAI'

const auth = useAuth()
const music = useMusic()
const danmaku = useDanmaku()
const github = useGitHub()
const ai = useAI()

provide('auth', auth)
provide('music', music)
provide('danmaku', danmaku)
provide('github', github)
provide('ai', ai)
</script>

<template>
  <router-view />
</template>
