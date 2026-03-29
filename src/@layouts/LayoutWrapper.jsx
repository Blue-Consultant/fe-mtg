'use client'

// Hook Imports
import { usePathname } from 'next/navigation'

import { useSelector } from 'react-redux'

import { signOut } from 'next-auth/react'

import { useSettings } from '@core/hooks/useSettings'
import useLayoutInit from '@core/hooks/useLayoutInit'

import { isPublicMenuShellPath } from '@/utils/publicRoutes'

const LayoutWrapper = props => {
  const { systemMode, verticalLayout, horizontalLayout } = props
  const pathname = usePathname()

  const { settings } = useSettings()

  useLayoutInit(systemMode)

  const userExist = useSelector(state => state.loginReducer.user)

  const allowWithoutUser = isPublicMenuShellPath(pathname)

  if (!userExist && !allowWithoutUser) {
    signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL || '/es/login', redirect: true })

    return null
  }

  return (
    <div className='flex flex-col flex-auto' data-skin={settings.skin}>
      {horizontalLayout}
    </div>
  )
}

export default LayoutWrapper
