'use client'

import { useLayoutEffect, useState } from 'react'

import { usePathname } from 'next/navigation'

import NavbarContent from './NavbarContent'
import Navbar from '@layouts/components/horizontal/Navbar'
import LayoutHeader from '@layouts/components/horizontal/Header'

import { isBranchAdminNav, isPanelOperatorNav, readBusinessRolesFromStorage } from '@/utils/moduleRoutes'
import { isGuestPromptPath, isPlayerBoardPath } from '@/utils/publicRoutes'
import { stripLocaleFromPath } from '@/utils/routePaths'

const Header = ({ dictionary, forceFullWidthNavbar = false }) => {
  const pathname = usePathname()
  const [staffNav, setStaffNav] = useState(false)
  const [branchAdmin, setBranchAdmin] = useState(false)

  useLayoutEffect(() => {
    const roles = readBusinessRolesFromStorage()

    setStaffNav(isPanelOperatorNav(roles))
    setBranchAdmin(isBranchAdminNav(roles))
  }, [pathname])

  const segments = pathname.split('/')
  const fullWidthCourtsShell = segments.includes('marca-tu-gol') || segments.includes('explorar')
  const path = stripLocaleFromPath(pathname)
  const isPlayerBoard = isPlayerBoardPath(pathname)
  const playerAccount = isGuestPromptPath(pathname)

  const authScreen =
    path === '/login' ||
    path.startsWith('/login/') ||
    path === '/login-admin' ||
    path.startsWith('/login-admin/') ||
    path === '/login-mtg' ||
    path.startsWith('/login-mtg/') ||
    path === '/register' ||
    path.startsWith('/register/')

  if (branchAdmin || authScreen || isPlayerBoard || (playerAccount && !staffNav)) return null

  return (
    <LayoutHeader forceFullWidthNavbar={forceFullWidthNavbar || fullWidthCourtsShell}>
      <Navbar>
        <NavbarContent dictionary={dictionary} />
      </Navbar>
    </LayoutHeader>
  )
}

export default Header
