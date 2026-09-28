import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

authApi.interceptors.request.use((config) => {
  let session = null
  try {
    const stored = window.localStorage.getItem('fanHubPlusAuth')
    session = stored ? JSON.parse(stored) : null
  } catch {
    window.localStorage.removeItem('fanHubPlusAuth')
  }

  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`
  }

  return config
})

export function registerUser(payload) {
  return authApi.post('/auth/register', payload)
}

export function loginUser(payload) {
  return authApi.post('/auth/login', payload)
}

export function requestPasswordReset(payload) {
  return authApi.post('/auth/forgot-password', payload)
}

export function resetPassword(token, payload) {
  return authApi.post(`/auth/reset-password/${token}`, payload)
}

export function fetchCurrentUser() {
  return authApi.get('/profile')
}

export function updateCurrentUser(payload) {
  return authApi.put('/profile', payload)
}
