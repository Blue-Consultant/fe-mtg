'use client'

// Next Imports
import { useLayoutEffect, useState } from 'react'

import { usePathname } from 'next/navigation'

// Component Imports
import Navigation from './Navigation'
import NavbarContent from './NavbarContent'
import Navbar from '@layouts/components/horizontal/Navbar'
import LayoutHeader from '@layouts/components/horizontal/Header'

// Hook Imports

import useHorizontalNav from '@menu/hooks/useHorizontalNav'
import { isBranchAdminNav, isPanelOperatorNav, readBusinessRolesFromStorage } from '@/utils/moduleRoutes'
import { isGuestPromptPath, isPlayerBoardPath } from '@/utils/publicRoutes'
import { stripLocaleFromPath } from '@/utils/routePaths'

const Header = ({ dictionary, forceFullWidthNavbar = false }) => {
  // Hooks
  const pathname = usePathname()
  const { isBreakpointReached } = useHorizontalNav()
  const [staffNav, setStaffNav] = useState(false)
  const [branchAdmin, setBranchAdmin] = useState(false)

  useLayoutEffect(() => {
    const roles = readBusinessRolesFromStorage()

    setStaffNav(isPanelOperatorNav(roles))
    setBranchAdmin(isBranchAdminNav(roles))
  }, [pathname])

  // Misma anchura que la landing: rutas públicas de canchas (no el shell compacto del backoffice).
  const segments = pathname.split('/')

  const fullWidthCourtsShell = segments.includes('marca-tu-gol') || segments.includes('explorar')
  const path = stripLocaleFromPath(pathname)
  const isPlayerBoard = isPlayerBoardPath(pathname)
  const playerAccount = isGuestPromptPath(pathname)

  const authScreen =
    path === '/login' ||
    path.startsWith('/login/') ||
    path === '/login-mtg' ||
    path.startsWith('/login-mtg/') ||
    path === '/register' ||
    path.startsWith('/register/')

  if (branchAdmin || authScreen || isPlayerBoard || (playerAccount && !staffNav)) return null

  return (
    <>
      <LayoutHeader forceFullWidthNavbar={forceFullWidthNavbar || fullWidthCourtsShell}>
        <Navbar>
          <NavbarContent dictionary={dictionary} />
        </Navbar>
      </LayoutHeader>
      {isBreakpointReached && <Navigation dictionary={dictionary} />}
    </>
  )
}

export default Header
