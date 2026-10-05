'use client'

import { useEffect, useState } from 'react'

const MOBILE_QUERY = '(max-width: 860px)'

export function usePlayerMenu(pathname) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY)
    const sync = () => setIsMobile(query.matches)

    sync()
    query.addEventListener('change', sync)

    return () => query.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!isMobile) setMenuOpen(false)
  }, [isMobile])

  useEffect(() => {
    if (!menuOpen) return

    const onKey = event => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return {
    menuOpen,
    isMobile,
    openMenu: () => setMenuOpen(true),
    closeMenu: () => setMenuOpen(false)
  }
}
