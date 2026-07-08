import { ref, computed, inject } from 'vue'

const HISTORY_KEY = 'musicist_listening_history'
const LIKED_KEY = 'musicist_liked_songs'

export function useMusic() {
  const github = inject('github')
  
  const sources = ref([])
  const playlists = ref([])
  const currentSong = ref(null)
  const isPlaying = ref(false)
  const volume = ref(0.7)
  const currentTime = ref(0)
  const duration = ref(0)
  const currentPlaylist = ref(null)
  const listeningHistory = ref([])
  const likedSongs = ref([])

  const loadSources = async () => {
    try {
      sources.value = await github.getFile('data/sources.json')
    } catch {
      sources.value = []
    }
  }

  const loadPlaylists = async () => {
    try {
      playlists.value = await github.getFile('data/playlists.json')
    } catch {
      playlists.value = []
    }
  }

  const loadListeningHistory = () => {
    const saved = localStorage.getItem(HISTORY_KEY)
    if (saved) {
      listeningHistory.value = JSON.parse(saved)
    }
  }

  const loadLikedSongs = () => {
    const saved = localStorage.getItem(LIKED_KEY)
    if (saved) {
      likedSongs.value = JSON.parse(saved)
    }
  }

  const saveListeningHistory = () => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(listeningHistory.value))
  }

  const saveLikedSongs = () => {
    localStorage.setItem(LIKED_KEY, JSON.stringify(likedSongs.value))
  }

  const updateListeningHistory = (song) => {
    const existing = listeningHistory.value.find(
      h => h.title === song.title && h.artist === song.artist
    )
    
    if (existing) {
      existing.playCount++
      existing.lastPlayed = Date.now()
    } else {
      listeningHistory.value.push({
        title: song.title,
        artist: song.artist,
        playCount: 1,
        lastPlayed: Date.now(),
      })
    }
    
    listeningHistory.value.sort((a, b) => b.playCount - a.playCount)
    listeningHistory.value = listeningHistory.value.slice(0, 50)
    saveListeningHistory()
  }

  const toggleLike = (song) => {
    const index = likedSongs.value.findIndex(
      s => s.title === song.title && s.artist === song.artist
    )
    
    if (index === -1) {
      likedSongs.value.push({ ...song })
    } else {
      likedSongs.value.splice(index, 1)
    }
    
    saveLikedSongs()
    return index === -1
  }

  const isLiked = (song) => {
    return likedSongs.value.some(
      s => s.title === song.title && s.artist === song.artist
    )
  }

  const saveSources = async (newSources) => {
    sources.value = newSources
    await github.saveFile('data/sources.json', newSources, 'Update music sources')
  }

  const savePlaylists = async (newPlaylists) => {
    playlists.value = newPlaylists
    await github.saveFile('data/playlists.json', newPlaylists, 'Update playlists')
  }

  const addSource = async (source) => {
    const newSources = [...sources.value, { ...source, id: Date.now() }]
    await saveSources(newSources)
  }

  const removeSource = async (id) => {
    const newSources = sources.value.filter(s => s.id !== id)
    await saveSources(newSources)
  }

  const addPlaylist = async (playlist) => {
    const newPlaylists = [...playlists.value, { ...playlist, id: Date.now(), songs: [] }]
    await savePlaylists(newPlaylists)
  }

  const removePlaylist = async (id) => {
    const newPlaylists = playlists.value.filter(p => p.id !== id)
    await savePlaylists(newPlaylists)
  }

  const addSongToPlaylist = async (playlistId, song) => {
    const newPlaylists = playlists.value.map(p => {
      if (p.id === playlistId) {
        return { ...p, songs: [...p.songs, { ...song, id: Date.now() }] }
      }
      return p
    })
    await savePlaylists(newPlaylists)
  }

  const removeSongFromPlaylist = async (playlistId, songId) => {
    const newPlaylists = playlists.value.map(p => {
      if (p.id === playlistId) {
        return { ...p, songs: p.songs.filter(s => s.id !== songId) }
      }
      return p
    })
    await savePlaylists(newPlaylists)
  }

  const playSong = (song) => {
    currentSong.value = song
    isPlaying.value = true
    updateListeningHistory(song)
  }

  const pause = () => {
    isPlaying.value = false
  }

  const resume = () => {
    isPlaying.value = true
  }

  const togglePlay = () => {
    isPlaying.value = !isPlaying.value
  }

  const setVolume = (val) => {
    volume.value = Math.max(0, Math.min(1, val))
  }

  const setCurrentTime = (time) => {
    currentTime.value = time
  }

  const setDuration = (time) => {
    duration.value = time
  }

  const setCurrentPlaylist = (playlist) => {
    currentPlaylist.value = playlist
  }

  const getAllSongs = computed(() => {
    return sources.value.flatMap(source => 
      source.songs.map(song => ({ ...song, sourceName: source.name }))
    )
  })

  return {
    sources,
    playlists,
    currentSong,
    isPlaying,
    volume,
    currentTime,
    duration,
    currentPlaylist,
    listeningHistory,
    likedSongs,
    getAllSongs,
    loadSources,
    loadPlaylists,
    loadListeningHistory,
    loadLikedSongs,
    saveSources,
    savePlaylists,
    addSource,
    removeSource,
    addPlaylist,
    removePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    playSong,
    pause,
    resume,
    togglePlay,
    setVolume,
    setCurrentTime,
    setDuration,
    setCurrentPlaylist,
    toggleLike,
    isLiked,
  }
}
