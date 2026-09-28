import { authApi } from './authApi'

export function fetchMedia(params = {}) {
  return authApi.get('/media', { params })
}

export function fetchMediaById(id) {
  return authApi.get(`/media/${id}`)
}