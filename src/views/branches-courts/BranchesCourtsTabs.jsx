'use client'

import { useCallback, useMemo } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { Box, Tab, Tabs } from '@mui/material'

import BranchesIndex from '@/views/branches'
import CourtsIndex from '@/views/courts'

export const VENUES_TAB_CANCHAS = 'canchas'
export const VENUES_TAB_SUCURSALES = 'sucursales'

/**
 * Sucursales + canchas en una sola pantalla. Pestaña canchas → `?tab=canchas` en la URL.
 */
const BranchesCourtsTabs = ({ dictionary }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const tabParam = searchParams.get('tab')
  const currentTab = tabParam === VENUES_TAB_CANCHAS ? VENUES_TAB_CANCHAS : VENUES_TAB_SUCURSALES

  const labels = useMemo(() => {
    const m = dictionary?.modules ?? {}
    const vt = m.venuesTabs ?? {}

    return {
      sucursales: vt.tabSucursales ?? m.companies?.title ?? 'Sucursales',
      canchas: vt.tabCanchas ?? 'Canchas'
    }
  }, [dictionary])

  const handleTabChange = useCallback(
    (_, value) => {
      const next = new URLSearchParams(searchParams.toString())

      if (value === VENUES_TAB_CANCHAS) {
        next.set('tab', VENUES_TAB_CANCHAS)
      } else {
        next.delete('tab')
      }

      const qs = next.toString()

      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        sx={{
          mb: 3,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': { textTransform: 'none', minHeight: 48, fontWeight: 600 }
        }}
        aria-label={dictionary?.modules?.venuesTabs?.aria ?? 'Sucursales y canchas'}
      >
        <Tab label={labels.sucursales} value={VENUES_TAB_SUCURSALES} id='venues-tab-sucursales' />
        <Tab label={labels.canchas} value={VENUES_TAB_CANCHAS} id='venues-tab-canchas' />
      </Tabs>

      <Box
        role='tabpanel'
        aria-labelledby={currentTab === VENUES_TAB_SUCURSALES ? 'venues-tab-sucursales' : 'venues-tab-canchas'}
      >
        {currentTab === VENUES_TAB_SUCURSALES ? (
          <BranchesIndex dictionary={dictionary} />
        ) : (
          <CourtsIndex dictionary={dictionary} />
        )}
      </Box>
    </Box>
  )
}

export default BranchesCourtsTabs
