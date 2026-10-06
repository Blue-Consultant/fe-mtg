'use client'

import { useLayoutEffect, useState } from 'react'

import { usePathname } from 'next/navigation'

import LayoutFooter from '@layouts/components/horizontal/Footer'
import FooterContent from './FooterContent'
import { isBranchAdminNav, isPanelOperatorNav, readBusinessRolesFromStorage } from '@/utils/moduleRoutes'
import { isGuestPromptPath, isPlayerBoardPath } from '@/utils/publicRoutes'

const Footer = () => {
  const pathname = usePathname()
  const [staffNav, setStaffNav] = useState(false)
  const [branchAdmin, setBranchAdmin] = useState(false)
  const isPlayerBoard = isPlayerBoardPath(pathname)
  const playerAccount = isGuestPromptPath(pathname)

  useLayoutEffect(() => {
    const roles = readBusinessRolesFromStorage()

    setStaffNav(isPanelOperatorNav(roles))
    setBranchAdmin(isBranchAdminNav(roles))
  }, [pathname])

  if (branchAdmin || isPlayerBoard || (playerAccount && !staffNav)) return null

  return (
    <LayoutFooter>
      <FooterContent />
    </LayoutFooter>
  )
}

export default Footer
