'use client'

import { useEffect } from 'react'

// Hook Imports
import { usePathname } from 'next/navigation'

import { useDispatch, useSelector } from 'react-redux'

import { signOut, useSession } from 'next-auth/react'

import { setUser } from '@/redux-store/slices/login'

import { useSettings } from '@core/hooks/useSettings'
import useLayoutInit from '@core/hooks/useLayoutInit'

import { isGuestPromptPath, isPublicMenuShellPath } from '@/utils/publicRoutes'

const LayoutWrapper = props => {
  const { systemMode, verticalLayout, horizontalLayout } = props
  const pathname = usePathname()

  const { settings } = useSettings()
  const dispatch = useDispatch()
  const { data: session, status } = useSession()

  useLayoutInit(systemMode)

  const userExist = useSelector(state => state.loginReducer.user)

  const allowWithoutUser = isPublicMenuShellPath(pathname) || isGuestPromptPath(pathname)
  const signedIn = Boolean(userExist) || status === 'authenticated'

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id || userExist?.id) return

    dispatch(
      setUser({
        user: {
          id: session.user.id,
          first_name: session.user.name || '',
          email: session.user.email || ''
        }
      })
    )
  }, [dispatch, session, status, userExist])

  if (status !== 'loading' && !signedIn && !allowWithoutUser) {
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
