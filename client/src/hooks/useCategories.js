import { useEffect, useMemo, useState } from 'react'
import mariaApi from '../services/mariaApi'

export default function useCategories(options = {}) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const params = useMemo(
    () => ({
      collectionKey: options.collectionKey || undefined,
    }),
    [options.collectionKey],
  )

  useEffect(() => {
    let cancelled = false

    async function loadCategories() {
      try {
        setLoading(true)
        setError('')
        const { data } = await mariaApi.get('/categories', { params })
        if (!cancelled) setCategories(data.categories || [])
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || err.message || 'Failed to load categories')
          setCategories([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadCategories()
    return () => {
      cancelled = true
    }
  }, [params])

  return { categories, error, loading }
}
