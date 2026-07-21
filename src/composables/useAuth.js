import { ref, computed } from 'vue'

const ADMIN_PASSWORD_KEY = 'musicist_admin_password'
const AUTHENTICATED_KEY = 'musicist_authenticated'
const API_KEYS_KEY = 'musicist_api_keys'

const adminPassword = ref(localStorage.getItem(ADMIN_PASSWORD_KEY) || '')
const isAuthenticated = ref(localStorage.getItem(AUTHENTICATED_KEY) === 'true')

function loadApiKeys() {
  try {
    const saved = localStorage.getItem(API_KEYS_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return {
    githubToken: '',
    openaiKey: '',
    deepseekKey: '',
    newsApiKey: '',
  }
}

export function useAuth() {
  const isSetupRequired = computed(() => !adminPassword.value)

  // API 密钥配置（管理员统一管理）
  const apiKeys = ref(loadApiKeys())

  const setupPassword = (password) => {
    const hashed = btoa(password)
    localStorage.setItem(ADMIN_PASSWORD_KEY, hashed)
    adminPassword.value = hashed
    isAuthenticated.value = true
    localStorage.setItem(AUTHENTICATED_KEY, 'true')
    return true
  }

  const login = (password) => {
    const hashedInput = btoa(password)
    if (hashedInput === adminPassword.value) {
      isAuthenticated.value = true
      localStorage.setItem(AUTHENTICATED_KEY, 'true')
      return true
    }
    return false
  }

  const logout = () => {
    isAuthenticated.value = false
    localStorage.removeItem(AUTHENTICATED_KEY)
  }

  const checkAuth = () => {
    const stored = localStorage.getItem(AUTHENTICATED_KEY)
    isAuthenticated.value = stored === 'true' && !!adminPassword.value
  }

  // getToken 返回 Github token（向后兼容 useGitHub、useAI）
  const getToken = () => {
    return apiKeys.value.githubToken || ''
  }

  // 统一 API 密钥管理
  const saveApiKeys = (keys) => {
    apiKeys.value = keys
    localStorage.setItem(API_KEYS_KEY, JSON.stringify(keys))
  }

  const getApiKey = (name) => {
    return apiKeys.value[name] || ''
  }

  return {
    adminPassword,
    isAuthenticated,
    isSetupRequired,
    apiKeys,
    setupPassword,
    login,
    logout,
    checkAuth,
    getToken,
    saveApiKeys,
    getApiKey,
  }
}
