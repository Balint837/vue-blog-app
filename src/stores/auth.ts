import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import type { User, LoginCredentials, RegisterCredentials, AuthResponse } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token') || null)

  const isAuthenticated = computed(() => !!token.value)

  const setToken = (newToken: string | null) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    } else {
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    }
  }

  setToken(token.value)

  const setUser = (newUser: User | null) => {
    user.value = newUser
  }

  const fetchUser = async () => {
    try {
      const response = await axios.get('/profile') // Assuming your API has a `/profile` endpoint that returns the user data
      setUser(response.data.user)
    } catch (error: any) {
      setUser(null)
      setToken(null)
    }
  }

  const initializeAuth = async () => {
    if (token.value) {
      // If there's a token, fetch the user data
      await fetchUser()
    }
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await axios.post<AuthResponse>('/login', credentials)
      setToken(response.data.token)
      setUser(response.data.user)
      return { success: true }
    } catch (error: any) {
      setToken(null)
      setUser(null)
      return {
        success: false,
        error: error.response?.data?.message || 'Bejelentkezési hiba történt',
      }
    }
  }

  const register = async (credentials: RegisterCredentials) => {
    try {
      const response = await axios.post<AuthResponse>('/register', credentials)
      setToken(response.data.token)
      setUser(response.data.user)
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Regisztrációs hiba történt',
      }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    initializeAuth,
    setUser,
  }
})
