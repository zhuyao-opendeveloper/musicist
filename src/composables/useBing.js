import { ref } from 'vue'

const BING_CACHE_KEY = 'musicist_bing_wallpaper'

export function useBing() {
  const bingImageUrl = ref('')
  const isLoading = ref(false)
  const error = ref('')

  const fetchBingImage = async () => {
    // Check cache first
    const cached = getCachedBingImage()
    if (cached) {
      bingImageUrl.value = cached
      applyBackground(cached)
      return cached
    }

    isLoading.value = true
    error.value = ''

    try {
      // Try multiple Bing wallpaper sources
      const urls = [
        'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN',
        'https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1'
      ]

      let imageUrl = null
      for (const url of urls) {
        try {
          const res = await fetch(url, { method: 'GET' })
          if (res.ok) {
            const data = await res.json()
            if (data.images && data.images[0]) {
              imageUrl = 'https://www.bing.com' + data.images[0].urlbase + '_UHD.jpg'
              break
            }
          }
        } catch {
          continue
        }
      }

      // Fallback to dujin API
      if (!imageUrl) {
        imageUrl = 'https://api.dujin.org/bing/1920.php'
      }

      bingImageUrl.value = imageUrl
      cacheBingImage(imageUrl)
      applyBackground(imageUrl)
      return imageUrl
    } catch (e) {
      error.value = e.message
      console.error('Failed to fetch Bing wallpaper:', e)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const applyBackground = (url) => {
    if (url) {
      document.body.style.backgroundImage = `url(${url})`
      document.body.style.backgroundSize = 'cover'
      document.body.style.backgroundPosition = 'center'
      document.body.style.backgroundAttachment = 'fixed'
      document.body.classList.add('has-bing-bg')
    }
  }

  return {
    bingImageUrl,
    isLoading,
    error,
    fetchBingImage,
  }
}

function getCachedBingImage() {
  try {
    const cached = localStorage.getItem(BING_CACHE_KEY)
    if (cached) {
      const { url, date } = JSON.parse(cached)
      const today = new Date().toDateString()
      if (date === today && url) {
        return url
      }
    }
  } catch {
    // ignore
  }
  return null
}

function cacheBingImage(url) {
  try {
    localStorage.setItem(BING_CACHE_KEY, JSON.stringify({
      url,
      date: new Date().toDateString(),
    }))
  } catch {
    // ignore
  }
}
