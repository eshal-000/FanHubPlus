export function getYouTubeEmbedUrl(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''

  try {
    const url = new URL(raw)
    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    let id = ''

    if (host === 'youtu.be') {
      id = url.pathname.split('/').filter(Boolean)[0] || ''
    } else if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (url.pathname === '/watch') id = url.searchParams.get('v') || ''
      if (url.pathname.startsWith('/embed/')) id = url.pathname.split('/')[2] || ''
      if (url.pathname.startsWith('/shorts/')) id = url.pathname.split('/')[2] || ''
    }

    if (!/^[\w-]{11}$/.test(id)) return ''

    const params = new URLSearchParams()
    const list = url.searchParams.get('list')
    const start = url.searchParams.get('start') || url.searchParams.get('t')

    if (list) params.set('list', list)
    if (start && /^\d+s?$/.test(start)) params.set('start', start.replace(/s$/, ''))

    const query = params.toString()
    return `https://www.youtube-nocookie.com/embed/${id}${query ? `?${query}` : ''}`
  } catch {
    return ''
  }
}

export function isSupportedYouTubeUrl(value) {
  return !value || Boolean(getYouTubeEmbedUrl(value))
}
