import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function readToken() {
  try {
    return JSON.parse(window.localStorage.getItem('fanHubPlusAuth') || 'null')?.token || ''
  } catch {
    return ''
  }
}

const mariaApi = axios.create({
  baseURL: API_BASE_URL,
})

mariaApi.interceptors.request.use((config) => {
  const token = readToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default mariaApi
