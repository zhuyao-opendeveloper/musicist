import { ref, computed } from 'vue'

const TOKEN_KEY = 'musicist_github_token'
const USER_KEY = 'musicist_github_user'

const token = ref(localStorage.getItem(TOKEN_KEY) || '')
const user = ref(JSON.parse(localStorage.getItem(USER_KEY) || 'null'))

export function useAuth() {
  const isLoggedIn = computed(() => !!token.value)

  const login = (newToken, newUser) => {
    token.value = newToken
    user.value = newUser
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
  }

  const logout = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  const getToken = () => token.value

  const getUser = () => user.value

  return {
    isLoggedIn,
    token,
    user,
    login,
    logout,
    getToken,
    getUser,
  }
}
