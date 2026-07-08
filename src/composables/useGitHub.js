import { ref, inject } from 'vue'

export function useGitHub() {
  const auth = inject('auth')
  const config = ref({
    owner: '',
    repo: '',
  })

  const setConfig = (owner, repo) => {
    config.value.owner = owner
    config.value.repo = repo
    localStorage.setItem('musicist_repo_config', JSON.stringify(config.value))
  }

  const loadConfig = () => {
    const saved = localStorage.getItem('musicist_repo_config')
    if (saved) {
      config.value = JSON.parse(saved)
    }
  }

  const getFile = async (path) => {
    const token = auth.getToken()
    const url = `https://api.github.com/repos/${config.value.owner}/${config.value.repo}/contents/${path}`
    
    const response = await fetch(url, {
      headers: token ? { Authorization: `token ${token}` } : {},
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status}`)
    }

    const data = await response.json()
    return JSON.parse(atob(data.content))
  }

  const saveFile = async (path, content, message = 'Update config') => {
    const token = auth.getToken()
    const url = `https://api.github.com/repos/${config.value.owner}/${config.value.repo}/contents/${path}`
    
    let sha = null
    try {
      const existing = await fetch(url, {
        headers: { Authorization: `token ${token}` },
      })
      if (existing.ok) {
        const data = await existing.json()
        sha = data.sha
      }
    } catch {
      sha = null
    }

    const body = {
      message,
      content: btoa(JSON.stringify(content, null, 2)),
      branch: 'main',
    }

    if (sha) {
      body.sha = sha
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to save file: ${error.message || response.status}`)
    }

    return response.json()
  }

  const getContent = async (path) => {
    const token = auth.getToken()
    const url = `https://api.github.com/repos/${config.value.owner}/${config.value.repo}/contents/${path}`
    
    const response = await fetch(url, {
      headers: token ? { Authorization: `token ${token}` } : {},
    })

    if (!response.ok) {
      throw new Error(`Failed to list contents: ${response.status}`)
    }

    return response.json()
  }

  const fetchUser = async () => {
    const token = auth.getToken()
    if (!token) return null

    const response = await fetch('https://api.github.com/user', {
      headers: { Authorization: `token ${token}` },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user')
    }

    return response.json()
  }

  return {
    config,
    setConfig,
    loadConfig,
    getFile,
    saveFile,
    getContent,
    fetchUser,
  }
}
