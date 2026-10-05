'use client'

import { useEffect, useState } from 'react'

import { usePathname } from 'next/navigation'

import LayoutFooter from '@layouts/components/horizontal/Footer'
import FooterContent from './FooterContent'
import { isPanelOperatorNav, readBusinessRolesFromStorage } from '@/utils/moduleRoutes'
import { isGuestPromptPath, isPlayerBoardPath } from '@/utils/publicRoutes'

const Footer = () => {
  const pathname = usePathname()
  const [staffNav, setStaffNav] = useState(false)
  const isPlayerBoard = isPlayerBoardPath(pathname)
  const playerAccount = isGuestPromptPath(pathname)

  useEffect(() => {
    setStaffNav(isPanelOperatorNav(readBusinessRolesFromStorage()))
  }, [pathname])

  if (isPlayerBoard || (playerAccount && !staffNav)) return null

  return (
    <LayoutFooter>
      <FooterContent />
    </LayoutFooter>
  )
}

export default Footer
