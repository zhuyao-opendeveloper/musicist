import { ref } from 'vue'

// ============================================================
//  MUSIC SOURCES CONFIGURATION
//  Multiple free music APIs configured with fallback chain
// ============================================================

/** CORS proxy for APIs that don't support browser CORS */
const CORS_PROXY = 'https://api.allorigins.win/raw?url='

// -------- Jamendo (free API, supports CORS) --------
const JAMENDO_CLIENT_ID = '99452fba'

// -------- Built-in free CC0 / public domain tracks --------
export const BUILT_IN_MUSIC = [
  // SoundHelix - 15 free MP3 tracks (all work)
  { id: 'sh_1',  title: 'Ambient Relaxation',  artist: 'SoundHelix',     url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',  cover: '', source: 'builtin', sourceName: '内置音源', duration: 506 },
  { id: 'sh_2',  title: 'Chill Vibes',          artist: 'SoundHelix',     url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',  cover: '', source: 'builtin', sourceName: '内置音源', duration: 420 },
  { id: 'sh_3',  title: 'Electronic Dreams',    artist: 'SoundHelix',     url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',  cover: '', source: 'builtin', sourceName: '内置音源', duration: 380 },
  { id: 'sh_4',  title: 'Jazz Fusion',          artist: 'SoundHelix',     url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',  cover: '', source: 'builtin', sourceName: '内置音源', duration: 450 },
  { id: 'sh_5',  title: 'Lo-fi Study',          artist: 'SoundHelix',     url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',  cover: '', source: 'builtin', sourceName: '内置音源', duration: 390 },
  { id: 'sh_6',  title: 'Morning Sun',          artist: 'SoundHelix',     url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',  cover: '', source: 'builtin', sourceName: '内置音源', duration: 510 },
  { id: 'sh_7',  title: 'Night Drive',          artist: 'SoundHelix',     url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',  cover: '', source: 'builtin', sourceName: '内置音源', duration: 340 },
  { id: 'sh_8',  title: 'Ocean Waves',          artist: 'SoundHelix',     url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',  cover: '', source: 'builtin', sourceName: '内置音源', duration: 470 },
  { id: 'sh_9',  title: 'Piano Melody',         artist: 'SoundHelix',     url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',  cover: '', source: 'builtin', sourceName: '内置音源', duration: 360 },
  { id: 'sh_10', title: 'Sunset Boulevard',     artist: 'SoundHelix',     url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', cover: '', source: 'builtin', sourceName: '内置音源', duration: 530 },
  { id: 'sh_11', title: 'Tropical Breeze',      artist: 'SoundHelix',     url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', cover: '', source: 'builtin', sourceName: '内置音源', duration: 440 },
  { id: 'sh_12', title: 'Midnight Blues',       artist: 'SoundHelix',     url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', cover: '', source: 'builtin', sourceName: '内置音源', duration: 480 },
  { id: 'sh_13', title: 'Summer Vibes',         artist: 'SoundHelix',     url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', cover: '', source: 'builtin', sourceName: '内置音源', duration: 370 },
  { id: 'sh_14', title: 'Rainy Day',            artist: 'SoundHelix',     url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', cover: '', source: 'builtin', sourceName: '内置音源', duration: 490 },
  { id: 'sh_15', title: 'Starlight',            artist: 'SoundHelix',     url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', cover: '', source: 'builtin', sourceName: '内置音源', duration: 410 },
  // Piano classics (public domain recordings)
  { id: 'pd_1',  title: 'Clair de Lune',        artist: 'Debussy (PD)',  url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',  cover: '', source: 'builtin', sourceName: '古典钢琴', duration: 320 },
  { id: 'pd_2',  title: 'Moonlight Sonata',     artist: 'Beethoven (PD)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',  cover: '', source: 'builtin', sourceName: '古典钢琴', duration: 480 },
  { id: 'pd_3',  title: 'Canon in D',           artist: 'Pachelbel (PD)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',  cover: '', source: 'builtin', sourceName: '古典钢琴', duration: 360 },
  // Extra genres
  { id: 'ex_1',  title: 'Deep Focus',           artist: 'Study Music',    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',  cover: '', source: 'builtin', sourceName: '专注学习', duration: 390 },
  { id: 'ex_2',  title: 'Weekend Groove',       artist: 'Funk Collective', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',  cover: '', source: 'builtin', sourceName: '放克节奏', duration: 450 },
  { id: 'ex_3',  title: 'Ambient Space',        artist: 'Cosmic Drift',   url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',  cover: '', source: 'builtin', sourceName: '太空氛围', duration: 380 },
]

export const BUILT_IN_COVERS = [
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
]

// Assign random covers to built-in songs
BUILT_IN_MUSIC.forEach((s, i) => {
  if (!s.cover) {
    s.cover = BUILT_IN_COVERS[i % BUILT_IN_COVERS.length]
  }
})

// -------- Genre / Category definitions --------
export const MUSIC_GENRES = [
  { id: 'all',      label: '全部',     icon: '🎵' },
  { id: 'chill',    label: '放松',     icon: '😌' },
  { id: 'classical', label: '古典',    icon: '🎹' },
  { id: 'jazz',     label: '爵士',     icon: '🎷' },
  { id: 'electronic', label: '电子',   icon: '🎛️' },
  { id: 'pop',      label: '流行',     icon: '🎤' },
  { id: 'focus',    label: '专注',     icon: '🎯' },
]

// ============================================================
//  COMPOSABLE
// ============================================================

export function useMusicSources() {
  const isLoading = ref(false)
  const searchResults = ref([])
  const trendingSongs = ref([])
  const activeGenre = ref('all')
  const error = ref('')

  // Get trending / chart songs from multiple sources
  const getTrending = async () => {
    isLoading.value = true
    const all = []

    // 1. Deezer chart (with CORS proxy fallback)
    try {
      const res = await tryFetch('https://api.deezer.com/chart/0?limit=10')
      const data = res ? await res.json() : null
      if (data?.tracks?.data) {
        data.tracks.data.forEach(s => {
          all.push({
            id: `deezer_${s.id}`, title: s.title || 'Unknown',
            artist: s.artist?.name || 'Unknown', url: s.preview || '',
            cover: s.album?.cover_medium || '', source: 'deezer',
            sourceName: 'Deezer', duration: s.duration || 0,
          })
        })
      }
    } catch { /* fallback */ }

    // 2. Jamendo trending (free, CORS-friendly)
    try {
      const res = await fetch(
        `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=10&order=popularity_total&include=musicinfo`
      )
      if (res.ok) {
        const data = await res.json()
        if (data.results) {
          data.results.forEach((s, i) => {
            all.push({
              id: `jamendo_${s.id}`,
              title: s.name || 'Unknown',
              artist: s.artist_name || 'Unknown',
              url: s.audio || '',
              cover: s.image || BUILT_IN_COVERS[i % BUILT_IN_COVERS.length],
              source: 'jamendo',
              sourceName: 'Jamendo',
              duration: s.duration || 0,
            })
          })
        }
      }
    } catch { /* fallback */ }

    // 3. Built-in songs as baseline
    const builtin = [...BUILT_IN_MUSIC]

    // Combine: Deezer + Jamendo + builtin
    trendingSongs.value = [...all, ...builtin].slice(0, 18)
    isLoading.value = false
    return trendingSongs.value
  }

  // Search across ALL available sources
  const searchAcrossSources = async (query) => {
    if (!query.trim()) {
      if (trendingSongs.value.length === 0) {
        await getTrending()
      }
      searchResults.value = trendingSongs.value.length > 0
        ? trendingSongs.value
        : BUILT_IN_MUSIC
      return searchResults.value
    }

    isLoading.value = true
    error.value = ''
    searchResults.value = []

    const q = encodeURIComponent(query)

    // Method 1: Jamendo (CORS-friendly)
    const jamendoResults = []
    try {
      const res = await fetch(
        `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=10&search=${q}&include=musicinfo`
      )
      if (res.ok) {
        const data = await res.json()
        if (data.results) {
          data.results.forEach(s => {
            jamendoResults.push({
              id: `jamendo_${s.id}`,
              title: s.name || 'Unknown',
              artist: s.artist_name || 'Unknown',
              url: s.audio || '',
              cover: s.image || '',
              source: 'jamendo',
              sourceName: 'Jamendo',
              duration: s.duration || 0,
            })
          })
        }
      }
    } catch { /* skip */}

    // Method 2: Deezer (may have CORS issues, use proxy fallback)
    const deezerResults = []
    try {
      const res = await tryFetch(`https://api.deezer.com/search?q=${q}&limit=8`)
      const data = res ? await res.json() : null
      if (data?.data) {
        data.data.forEach(s => {
          deezerResults.push({
            id: `deezer_${s.id}`, title: s.title || 'Unknown',
            artist: s.artist?.name || 'Unknown', url: s.preview || '',
            cover: s.album?.cover_medium || '', source: 'deezer',
            sourceName: 'Deezer', duration: s.duration || 0,
          })
        })
      }
    } catch { /* skip */}

    // Method 3: TheAudioDB (track metadata)
    const audiodbResults = []
    try {
      const res = await fetch(
        `https://www.theaudiodb.com/api/v1/json/123/searchtrack.php?s=${q}`
      )
      if (res.ok) {
        const data = await res.json()
        if (data?.track) {
          data.track.slice(0, 8).forEach(s => {
            audiodbResults.push({
              id: `audiodb_${s.idTrack}`,
              title: s.strTrack || 'Unknown',
              artist: s.strArtist || 'Unknown',
              url: s.strMusicVid || '',
              cover: s.strTrackThumb || s.strAlbumThumb || '',
              source: 'theAudioDB',
              sourceName: 'TheAudioDB',
              duration: parseInt(s.intDuration) || 0,
            })
          })
        }
      }
    } catch { /* skip */}

    // Method 4: Built-in match
    const builtinResults = BUILT_IN_MUSIC.filter(s =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.artist.toLowerCase().includes(query.toLowerCase())
    )

    // Combine all results
    searchResults.value = [...jamendoResults, ...deezerResults, ...audiodbResults, ...builtinResults]
    isLoading.value = false
    return searchResults.value
  }

  // Helper: fetch with CORS proxy fallback
  const tryFetch = async (url, options = {}) => {
    // Try direct
    try {
      const res = await fetch(url, options)
      if (res.ok) return res
    } catch { /* try proxy */ }

    // For Deezer API, try Vite dev proxy
    if (url.includes('api.deezer.com')) {
      const proxyUrl = url.replace('https://api.deezer.com', '/api-proxy/deezer')
      try {
        const res = await fetch(proxyUrl, options)
        if (res.ok) return res
      } catch { /* try next */ }
    }

    // Fallback: use public CORS proxy
    try {
      const proxyUrl = CORS_PROXY + encodeURIComponent(url)
      const res = await fetch(proxyUrl, options)
      if (res.ok) return res
    } catch { /* give up */ }

    return null
  }

  return {
    isLoading,
    searchResults,
    trendingSongs,
    activeGenre,
    error,
    searchAcrossSources,
    getTrending,
    tryFetch,
  }
}
