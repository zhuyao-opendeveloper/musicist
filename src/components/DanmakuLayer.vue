<script setup>
import { ref, inject, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { MessageCircle, X } from 'lucide-vue-next'

const danmaku = inject('danmaku')
const music = inject('music')
const auth = inject('auth')

const containerRef = ref(null)
const displayList = ref([])
const inputText = ref('')
const showInput = ref(false)
let timer = null
let danmakuIndex = 0

const startDanmaku = () => {
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    if (!danmaku.isEnabled.value || danmaku.isPaused.value || !music.isPlaying.value) return
    if (danmakuList.value.length === 0) return

    const currentDanmaku = danmakuList.value[danmakuIndex % danmakuList.value.length]
    danmakuIndex++

    addDisplayDanmaku(currentDanmaku)
  }, 2000)
}

const addDisplayDanmaku = (item) => {
  const id = Date.now() + Math.random()
  const top = Math.random() * 60 + 10
  const speed = 6 + Math.random() * 4
  
  const displayItem = {
    ...item,
    id,
    top: `${top}%`,
    animationDuration: `${speed}s`,
  }
  
  displayList.value.push(displayItem)
  
  setTimeout(() => {
    displayList.value = displayList.value.filter(d => d.id !== id)
  }, speed * 1000)
}

const sendDanmaku = async () => {
  if (!inputText.value.trim()) return
  if (!music.currentSong.value) return
  
  const username = auth.user?.login || 'anonymous'
  await danmaku.addDanmaku(music.currentSong.value.id || music.currentSong.value.title, inputText.value, username)
  
  const newDanmaku = {
    id: Date.now(),
    content: inputText.value,
    username,
    color: danmaku.getRandomColor(),
    time: Date.now(),
    type: 'normal',
  }
  
  addDisplayDanmaku(newDanmaku)
  inputText.value = ''
}

const handleKeydown = (e) => {
  if (e.key === 'Enter') {
    sendDanmaku()
  }
}

const danmakuList = inject('danmaku').danmakuList

watch([() => danmaku.isEnabled.value, () => music.isPlaying.value], () => {
  startDanmaku()
})

watch(() => music.currentSong.value, () => {
  displayList.value = []
  danmakuIndex = 0
})

onMounted(() => {
  startDanmaku()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="relative">
    <button
      @click="showInput = !showInput"
      class="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-600 transition-colors relative"
    >
      <MessageCircle class="w-5 h-5" />
      <span
        v-if="danmaku.danmakuList.value.length > 0"
        class="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 rounded-full text-xs text-white flex items-center justify-center"
      >
        {{ danmaku.danmakuList.value.length }}
      </span>
    </button>

    <div
      v-if="showInput"
      class="absolute bottom-full right-0 mb-2 bg-dark-700 rounded-lg p-3 w-64 shadow-xl border border-dark-600"
    >
      <div class="flex items-center justify-between mb-2">
        <span class="text-white text-sm font-medium">发送弹幕</span>
        <button @click="showInput = false" class="text-gray-400 hover:text-white">
          <X class="w-4 h-4" />
        </button>
      </div>
      <div class="flex space-x-2">
        <input
          v-model="inputText"
          @keydown="handleKeydown"
          type="text"
          placeholder="输入弹幕内容..."
          class="flex-1 bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
        />
        <button
          @click="sendDanmaku"
          class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm transition-colors"
        >
          发送
        </button>
      </div>
    </div>
  </div>
</template>
