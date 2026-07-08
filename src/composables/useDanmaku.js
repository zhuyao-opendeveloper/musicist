import { ref, inject } from 'vue'

export function useDanmaku() {
  const github = inject('github')
  const ai = inject('ai')
  
  const danmakuList = ref([])
  const isEnabled = ref(true)
  const isPaused = ref(false)
  const flaggedDanmaku = ref([])

  const loadDanmaku = async (songId) => {
    try {
      const data = await github.getFile(`data/danmaku/${songId}.json`)
      danmakuList.value = data
      flaggedDanmaku.value = data.filter(d => d.classification && d.classification !== 'normal')
    } catch {
      danmakuList.value = []
      flaggedDanmaku.value = []
    }
  }

  const saveDanmaku = async (songId, newDanmaku) => {
    danmakuList.value = newDanmaku
    flaggedDanmaku.value = newDanmaku.filter(d => d.classification && d.classification !== 'normal')
    await github.saveFile(`data/danmaku/${songId}.json`, newDanmaku, `Update danmaku for song ${songId}`)
  }

  const addDanmaku = async (songId, content, username = 'anonymous') => {
    let classification = 'normal'
    let confidence = 0.5
    let reviewReason = ''

    if (ai && content.length > 0) {
      try {
        const result = await ai.classifyDanmaku(content)
        classification = result.classification || 'normal'
        confidence = result.confidence || 0.5
        reviewReason = result.reason || ''
      } catch {
        classification = 'normal'
      }
    }

    const newDanmaku = {
      id: Date.now(),
      content,
      username,
      time: Date.now(),
      color: getRandomColor(),
      type: 'normal',
      classification,
      confidence,
      reviewReason,
    }
    
    const currentDanmaku = [...danmakuList.value, newDanmaku]
    await saveDanmaku(songId, currentDanmaku)
    return newDanmaku
  }

  const removeDanmaku = async (songId, danmakuId) => {
    const newDanmaku = danmakuList.value.filter(d => d.id !== danmakuId)
    await saveDanmaku(songId, newDanmaku)
  }

  const clearDanmaku = async (songId) => {
    danmakuList.value = []
    flaggedDanmaku.value = []
    await saveDanmaku(songId, [])
  }

  const reviewAllDanmaku = async (songId) => {
    if (!ai) return []

    const results = []
    for (const danmaku of danmakuList.value) {
      if (!danmaku.classification || danmaku.classification === 'normal') {
        try {
          const result = await ai.classifyDanmaku(danmaku.content)
          danmaku.classification = result.classification
          danmaku.confidence = result.confidence
          danmaku.reviewReason = result.reason
          if (result.classification !== 'normal') {
            results.push(danmaku)
          }
        } catch {}
      }
    }
    
    await saveDanmaku(songId, danmakuList.value)
    return results
  }

  const toggleEnabled = () => {
    isEnabled.value = !isEnabled.value
  }

  const togglePaused = () => {
    isPaused.value = !isPaused.value
  }

  const getRandomColor = () => {
    const colors = [
      '#ffffff', '#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3',
      '#f38181', '#aa96da', '#fcbad3', '#a8d8ea', '#ff9a9e',
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  return {
    danmakuList,
    isEnabled,
    isPaused,
    flaggedDanmaku,
    loadDanmaku,
    saveDanmaku,
    addDanmaku,
    removeDanmaku,
    clearDanmaku,
    reviewAllDanmaku,
    toggleEnabled,
    togglePaused,
    getRandomColor,
  }
}
