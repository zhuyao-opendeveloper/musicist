import { ref, inject } from 'vue'

export function useAI() {
  const auth = inject('auth')
  const isLoading = ref(false)
  const error = ref('')

  const GITHUB_MODELS_API = 'https://models.inference.ai.azure.com/v1/chat/completions'

  const chatCompletion = async (messages, model = 'gpt-4o-mini') => {
    const token = auth.getToken()
    if (!token) {
      throw new Error('未登录，无法使用AI功能')
    }

    isLoading.value = true
    error.value = ''

    try {
      const response = await fetch(GITHUB_MODELS_API, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      })

      if (!response.ok) {
        throw new Error(`API调用失败: ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const classifyDanmaku = async (content) => {
    const prompt = `请对以下弹幕内容进行分类，返回JSON格式：
{
  "classification": "normal" | "spam" | "toxic",
  "confidence": 0.0-1.0,
  "reason": "简短说明"
}

弹幕内容：${content}`

    try {
      const response = await chatCompletion([
        { role: 'system', content: '你是一个内容审查助手。请严格按照指定格式返回结果。' },
        { role: 'user', content: prompt },
      ])

      const match = response.match(/\{[\s\S]*\}/)
      if (match) {
        return JSON.parse(match[0])
      }
      return { classification: 'normal', confidence: 0.5, reason: '无法解析' }
    } catch {
      return { classification: 'normal', confidence: 0.5, reason: 'API不可用' }
    }
  }

  const recommendSongs = async (songList, listeningHistory, likedSongs = []) => {
    const historyStr = listeningHistory
      .map(h => `${h.title} - ${h.artist} (播放${h.playCount}次)`)
      .join('\n')

    const likedStr = likedSongs.map(s => `${s.title} - ${s.artist}`).join('\n')

    const availableSongs = songList.map(s => `${s.title} - ${s.artist}`).join('\n')

    const prompt = `基于用户的听歌历史和收藏列表，从可用歌曲中推荐5首最适合的歌曲。

用户听歌历史：
${historyStr || '暂无'}

用户收藏歌曲：
${likedStr || '暂无'}

可用歌曲列表：
${availableSongs}

请返回JSON格式：
{
  "recommendations": [
    { "title": "歌曲名", "artist": "艺术家", "reason": "推荐理由" }
  ]
}`

    try {
      const response = await chatCompletion([
        { role: 'system', content: '你是一个音乐推荐助手。请分析用户的听歌偏好，推荐最匹配的歌曲。' },
        { role: 'user', content: prompt },
      ])

      const match = response.match(/\{[\s\S]*\}/)
      if (match) {
        return JSON.parse(match[0])
      }
      return { recommendations: [] }
    } catch {
      return { recommendations: [] }
    }
  }

  const generatePlaylistDescription = async (songTitles) => {
    const prompt = `为以下歌曲列表生成一段简短有趣的播放列表描述（50字以内）：
${songTitles.join('\n')}`

    try {
      const response = await chatCompletion([
        { role: 'system', content: '你是一个音乐文案助手。请用生动有趣的语言描述播放列表。' },
        { role: 'user', content: prompt },
      ])
      return response.trim()
    } catch {
      return '精心挑选的音乐合集'
    }
  }

  return {
    isLoading,
    error,
    chatCompletion,
    classifyDanmaku,
    recommendSongs,
    generatePlaylistDescription,
  }
}
