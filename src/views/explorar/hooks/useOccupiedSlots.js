'use client'

import { useEffect, useState } from 'react'

import { getCourtOccupiedSlots } from '@/views/courts/api'

export function useOccupiedSlots(courtId, datesKey) {
  const [occupiedByDate, setOccupiedByDate] = useState({})
  const [slotsLoading, setSlotsLoading] = useState(false)

  useEffect(() => {
    if (!courtId || !datesKey) return

    let cancelled = false
    const dates = datesKey.split('|')

    setSlotsLoading(true)
    Promise.all(dates.map(async date => [date, await getCourtOccupiedSlots(courtId, date)]))
      .then(entries => {
        if (cancelled) return

        setOccupiedByDate(current => ({
          ...current,
          ...Object.fromEntries(entries.map(([date, rows]) => [date, Array.isArray(rows) ? rows : []]))
        }))
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [courtId, datesKey])

  return { occupiedByDate, slotsLoading }
}
