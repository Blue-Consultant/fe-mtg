'use client'

import { useEffect, useState } from 'react'

import { searchCourts } from '@/views/courts/api'

import { toYYYYMMDD } from '../dates'

export function usePublishedCourts(errorMessage) {
  const [courts, setCourts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setLoadError('')

      try {
        const response = await searchCourts(toYYYYMMDD(new Date()), '06:00', '23:00', null, 1, 100)
        const data = Array.isArray(response?.data) ? response.data : []

        if (!cancelled) setCourts(data)
      } catch {
        if (!cancelled) setLoadError(errorMessage)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [errorMessage])

  return { courts, loading, loadError }
}
