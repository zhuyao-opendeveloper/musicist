import { ref } from 'vue'

// Built-in free music source API configurations
export const MUSIC_SOURCES = {
  netease: {
    name: '网易云音乐',
    icon: '🎵',
    searchBase: 'https://api.injahow.cn/search/?keywords=',
    trendUrl: 'https://api.injahow.cn/playlist/?id=3778678',
    parser: (data) => {
      if (!data?.data) return []
      return data.data.map(s => ({
        id: `netease_${s.id}`,
        title: s.name || s.title || '未知歌曲',
        artist: s.artist || s.singer?.[0]?.name || '未知艺术家',
        url: s.url || '',
        cover: s.pic || s.cover || `https://p2.music.126.net/6y-UleORITEDb5OL7HcF5A==/5639395138885805.jpg`,
        source: 'netease',
        sourceName: '网易云音乐',
        duration: s.duration || 0,
      }))
    },
  },
  deezer: {
    name: 'Deezer',
    icon: '🎧',
    searchBase: 'https://api.deezer.com/search?q=',
    trendUrl: 'https://api.deezer.com/chart/0',
    parser: (data) => {
      if (!data?.data) return []
      return data.data.map(s => ({
        id: `deezer_${s.id}`,
        title: s.title || 'Unknown',
        artist: s.artist?.name || 'Unknown',
        url: s.preview || '',
        cover: s.album?.cover_medium || s.album?.cover || '',
        source: 'deezer',
        sourceName: 'Deezer',
        duration: s.duration || 0,
      }))
    },
  },
  theAudioDB: {
    name: 'TheAudioDB',
    icon: '🎶',
    searchBase: 'https://www.theaudiodb.com/api/v1/json/123/searchtrack.php?s=',
    trendUrl: '',
    parser: (data) => {
      if (!data?.track) return []
      return data.track.slice(0, 10).map(s => ({
        id: `audiodb_${s.idTrack}`,
        title: s.strTrack || 'Unknown',
        artist: s.strArtist || 'Unknown',
        url: s.strMusicVid || '',
        cover: s.strTrackThumb || s.strAlbumThumb || '',
        source: 'theAudioDB',
        sourceName: 'TheAudioDB',
        duration: parseInt(s.intDuration) || 0,
      }))
    },
  },
}

/**
 * Built-in CC0 / public domain music for offline use
 * These URLs point to freely distributable audio files
 */
export const BUILT_IN_MUSIC = [
  {
    id: 'builtin_1',
    title: 'Ambient Relaxation',
    artist: 'Free Music Archive',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    cover: '',
    source: 'builtin',
    sourceName: '内置音源',
    duration: 506,
  },
  {
    id: 'builtin_2',
    title: 'Chill Vibes',
    artist: 'Free Music Archive',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    cover: '',
    source: 'builtin',
    sourceName: '内置音源',
    duration: 420,
  },
  {
    id: 'builtin_3',
    title: 'Electronic Dreams',
    artist: 'Free Music Archive',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    cover: '',
    source: 'builtin',
    sourceName: '内置音源',
    duration: 380,
  },
  {
    id: 'builtin_4',
    title: 'Jazz Fusion',
    artist: 'Free Music Archive',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    cover: '',
    source: 'builtin',
    sourceName: '内置音源',
    duration: 450,
  },
  {
    id: 'builtin_5',
    title: 'Lo-fi Study',
    artist: 'Free Music Archive',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    cover: '',
    source: 'builtin',
    sourceName: '内置音源',
    duration: 390,
  },
  {
    id: 'builtin_6',
    title: 'Morning Sun',
    artist: 'Free Music Archive',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    cover: '',
    source: 'builtin',
    sourceName: '内置音源',
    duration: 510,
  },
  {
    id: 'builtin_7',
    title: 'Night Drive',
    artist: 'Free Music Archive',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    cover: '',
    source: 'builtin',
    sourceName: '内置音源',
    duration: 340,
  },
  {
    id: 'builtin_8',
    title: 'Ocean Waves',
    artist: 'Free Music Archive',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    cover: '',
    source: 'builtin',
    sourceName: '内置音源',
    duration: 470,
  },
  {
    id: 'builtin_9',
    title: 'Piano Melody',
    artist: 'Free Music Archive',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    cover: '',
    source: 'builtin',
    sourceName: '内置音源',
    duration: 360,
  },
  {
    id: 'builtin_10',
    title: 'Sunset Boulevard',
    artist: 'Free Music Archive',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    cover: '',
    source: 'builtin',
    sourceName: '内置音源',
    duration: 530,
  },
]

export function useMusicSources() {
  const isLoading = ref(false)
  const searchResults = ref([])
  const trendingSongs = ref(BUILT_IN_MUSIC.slice(0, 5))
  const error = ref('')

  const searchAcrossSources = async (query) => {
    if (!query.trim()) {
      searchResults.value = BUILT_IN_MUSIC
      return BUILT_IN_MUSIC
    }

    isLoading.value = true
    error.value = ''
    searchResults.value = []

    const allResults = [...BUILT_IN_MUSIC]

    // Try Deezer API (free, no auth needed for search)
    try {
      const res = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=8`)
      if (res.ok) {
        const data = await res.json()
        if (data.data) {
          data.data.forEach(s => {
            allResults.push({
              id: `deezer_${s.id}`,
              title: s.title || 'Unknown',
              artist: s.artist?.name || 'Unknown',
              url: s.preview || '',
              cover: s.album?.cover_medium || '',
              source: 'deezer',
              sourceName: 'Deezer',
              duration: s.duration || 0,
            })
          })
        }
      }
    } catch {
      // fallback to built-in
    }

    searchResults.value = allResults
    isLoading.value = false
    return allResults
  }

  const getTrending = async () => {
    isLoading.value = true
    try {
      // Try Deezer chart
      const res = await fetch('https://api.deezer.com/chart/0?limit=6')
      if (res.ok) {
        const data = await res.json()
        if (data.tracks?.data) {
          trendingSongs.value = data.tracks.data.map(s => ({
            id: `deezer_${s.id}`,
            title: s.title || 'Unknown',
            artist: s.artist?.name || 'Unknown',
            url: s.preview || '',
            cover: s.album?.cover_medium || '',
            source: 'deezer',
            sourceName: 'Deezer',
            duration: s.duration || 0,
          }))
          return trendingSongs.value
        }
      }
    } catch {
      // fallback
    }
    trendingSongs.value = BUILT_IN_MUSIC.slice(0, 6)
    isLoading.value = false
    return trendingSongs.value
  }

  return {
    isLoading,
    searchResults,
    trendingSongs,
    error,
    searchAcrossSources,
    getTrending,
  }
}
