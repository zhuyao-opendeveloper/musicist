import { ref, computed } from 'vue'

const ADMIN_PASSWORD_KEY = 'musicist_admin_password'
const AUTHENTICATED_KEY = 'musicist_authenticated'

const adminPassword = ref(localStorage.getItem(ADMIN_PASSWORD_KEY) || '')
const isAuthenticated = ref(localStorage.getItem(AUTHENTICATED_KEY) === 'true')

export function useAuth() {
  const isSetupRequired = computed(() => !adminPassword.value)

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

  return {
    adminPassword,
    isAuthenticated,
    isSetupRequired,
    setupPassword,
    login,
    logout,
    checkAuth,
  }
}